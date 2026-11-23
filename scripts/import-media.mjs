/**
 * Переносит картинки старого сайта (https://stay.com.tr/upload/..., /local/...) к себе в public/media.
 *
 * Откуда берёт адреса:
 *  1) файлы в src (json, ts, astro, md) — там ссылки сразу меняются на /media/...;
 *  2) ответы API dev.stayproperty.com (новости, главная), которые ещё ссылаются на старый сайт, —
 *     их подменяет на лету ownImage() в src/lib/api.ts по списку src/content/media-manifest.json.
 *
 * Оригиналы ужимаются до 1920 px по ширине: сайт всё равно отдаёт уменьшенные копии через /img
 * (или /_vercel/image на Vercel). Пути: /upload/X → public/media/X, /local/X → public/media/local/X.
 *
 * Запуск: node scripts/import-media.mjs   (STAY_API_BASE — другой адрес API)
 * Повторный запуск безопасен: уже скачанные файлы не трогает.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'public', 'media');
const MANIFEST = path.join(SRC, 'content', 'media-manifest.json');
const API = (process.env.STAY_API_BASE || 'https://dev.stayproperty.com').replace(/\/$/, '');
const API_PATHS = [
  ...['ru', 'en', 'tr', 'sr'].map((l) => `/api/news?language=${l}&limit=200`),
  '/api/home-sections?lang=ru',
  '/api/sale?source=bitrix&language=ru&operation=sale&limit=500',
];
const RE = /https?:\/\/(?:www\.)?stay\.com\.tr\/(upload|local)\/([^"'\s)\\?#]+?\.(?:jpe?g|png|webp|gif|svg))/gi;
const MAX_W = 1920;

/** upload/X → X, local/X → local/X (путь внутри public/media). */
const relOf = (kind, p) => (kind.toLowerCase() === 'local' ? 'local/' : '') + decodeURI(p);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(json|ts|astro|md|mjs)$/.test(e.name) && p !== MANIFEST) yield p;
  }
}

const files = [];
for await (const f of walk(SRC)) files.push(f);

const found = new Map(); // путь в public/media -> исходный URL
for (const f of files) for (const m of (await readFile(f, 'utf8')).matchAll(RE)) found.set(relOf(m[1], m[2]), m[0]);
const inSrc = found.size;
for (const p of API_PATHS) {
  const r = await fetch(API + p, { signal: AbortSignal.timeout(60000) }).catch(() => null);
  if (!r?.ok) { console.warn(`API не ответил: ${p}`); continue; }
  for (const m of (await r.text()).matchAll(RE)) found.set(relOf(m[1], m[2]), m[0].replace(/^http:/, 'https:'));
}
console.log(`ссылок на старый сайт: в коде ${inSrc}, всего с API ${found.size}`);

let ok = 0, fail = 0, before = 0, after = 0;
const done = new Set();
for (const [rel, url] of found) {
  const dest = path.join(OUT, rel);
  if (await stat(dest).then(() => true, () => false)) { done.add(rel); ok++; continue; }
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) }).catch(() => null);
  if (!r || !r.ok) { console.warn(`не скачалось: ${url} (${r?.status ?? 'сеть'})`); fail++; continue; }
  const input = Buffer.from(await r.arrayBuffer());
  let best = input;
  if (/\.(jpe?g|png)$/i.test(rel)) {
    const img = sharp(input, { failOn: 'none' }).rotate().resize({ width: MAX_W, withoutEnlargement: true });
    const out = /\.png$/i.test(rel) ? await img.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer() : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    if (out.length < input.length) best = out;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, best);
  before += input.length; after += best.length; ok++; done.add(rel);
}
console.log(`на месте: ${ok}, ошибок: ${fail}; новые ${(before / 1e6).toFixed(1)} МБ → ${(after / 1e6).toFixed(1)} МБ`);

// Список всех перенесённых файлов (и прошлых запусков тоже) — по нему ownImage() подменяет адреса из API.
const all = [];
async function list(dir, base = '') {
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) await list(path.join(dir, e.name), rel);
    else all.push(rel);
  }
}
await list(OUT);
await writeFile(MANIFEST, JSON.stringify(all.sort(), null, 1) + '\n');
console.log(`media-manifest.json: ${all.length} файлов`);

let changed = 0;
for (const f of files) {
  const text = await readFile(f, 'utf8');
  const next = text.replace(RE, (all, kind, p) => (done.has(relOf(kind, p)) ? `/media/${relOf(kind, p)}` : all));
  if (next !== text) { await writeFile(f, next); changed++; }
}
console.log(`файлов с исправленными ссылками: ${changed}`);
