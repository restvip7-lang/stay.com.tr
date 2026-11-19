/**
 * Переносит картинки со старого сайта (https://stay.com.tr/upload/...) к себе в public/media
 * и меняет ссылки в src на /media/... . Оригиналы ужимаются до 1920 px по ширине:
 * сайт всё равно отдаёт уменьшенные копии через /img (или /_vercel/image на Vercel).
 *
 * Запуск: node scripts/import-media.mjs
 * Повторный запуск безопасен: уже скачанные файлы не трогает, ссылки меняет только старые.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'public', 'media');
const RE = /https:\/\/stay\.com\.tr\/upload\/([^"'\s)]+?\.(?:jpe?g|png|webp))/gi;
const MAX_W = 1920;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(json|ts|astro|md|mjs)$/.test(e.name)) yield p;
  }
}

const files = [];
for await (const f of walk(SRC)) files.push(f);

const found = new Map(); // upload-путь -> исходный URL
for (const f of files) for (const m of (await readFile(f, 'utf8')).matchAll(RE)) found.set(m[1], m[0]);
console.log(`ссылок на старый сайт: ${found.size}`);

let ok = 0, fail = 0, before = 0, after = 0;
const done = new Set();
for (const [rel, url] of found) {
  const dest = path.join(OUT, rel);
  if (await stat(dest).then(() => true, () => false)) { done.add(rel); ok++; continue; }
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) }).catch(() => null);
  if (!r || !r.ok) { console.warn(`не скачалось: ${url} (${r?.status ?? 'сеть'})`); fail++; continue; }
  const input = Buffer.from(await r.arrayBuffer());
  const img = sharp(input, { failOn: 'none' }).rotate().resize({ width: MAX_W, withoutEnlargement: true });
  const png = /\.png$/i.test(rel);
  const out = png ? await img.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer() : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  const best = out.length < input.length ? out : input;
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, best);
  before += input.length; after += best.length; ok++; done.add(rel);
}
console.log(`скачано: ${ok}, ошибок: ${fail}; ${(before / 1e6).toFixed(1)} МБ → ${(after / 1e6).toFixed(1)} МБ`);

let changed = 0;
for (const f of files) {
  const text = await readFile(f, 'utf8');
  const next = text.replace(RE, (all, rel) => (done.has(rel) ? `/media/${rel}` : all));
  if (next !== text) { await writeFile(f, next); changed++; }
}
console.log(`файлов с исправленными ссылками: ${changed}`);
