/**
 * Сжатие картинок на своём сервере (VPS) — замена /_vercel/image.
 * GET /img?url=<https-адрес или /media/...>&w=<ширина>&q=<качество> → AVIF или WebP нужной ширины.
 * Берём только с разрешённых сайтов (IMAGE_DOMAINS в astro.config.mjs) или свои файлы из public/media и public/hero, и только ширины из списка.
 * Оригиналы с чужих сайтов при первом запросе сохраняем у себя (STAY_DATA_DIR/media-src) и дальше берём с диска,
 * так что сайт не зависит от того, жив ли источник. Готовые копии кладём в STAY_DATA_DIR/img-cache, повторно не пересжимаем.
 */
import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const prerender = false;

const WIDTHS = new Set([320, 640, 960, 1280, 1920]);
const DOMAINS = new Set(String(import.meta.env.STAY_IMAGE_DOMAINS || '').split(',').filter(Boolean));
const MAX_BYTES = 25 * 1024 * 1024;
const cacheDir = () => path.resolve(process.env.STAY_DATA_DIR || 'data', 'img-cache');
const originalsDir = () => path.resolve(process.env.STAY_DATA_DIR || 'data', 'media-src');
/** Свои картинки: после сборки они в dist/client, при `astro dev` — в public. */
const PUBLIC_DIRS = ['dist/client', 'public'].map((d) => path.resolve(d));
const LOCAL = /^\/(?:media|hero)\/[\w\-./]+\.(?:jpe?g|png|webp|avif)$/i;
const TYPES = { avif: 'image/avif', webp: 'image/webp' } as const;

const bad = (msg: string, status = 400) => new Response(msg, { status, headers: { 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ url, request }) => {
  const src = url.searchParams.get('url') ?? '';
  const w = Number(url.searchParams.get('w'));
  const q = Math.min(90, Math.max(30, Number(url.searchParams.get('q')) || 75));
  const local = LOCAL.test(src) && !src.includes('..');
  if (!local) {
    let host = '';
    try {
      const u = new URL(src);
      if (u.protocol !== 'https:') return bad('only https');
      host = u.hostname;
    } catch {
      return bad('bad url');
    }
    if (!DOMAINS.has(host)) return bad('domain not allowed');
  }
  if (!WIDTHS.has(w)) return bad('bad width');

  const fmt: keyof typeof TYPES = (request.headers.get('accept') ?? '').includes('image/avif') ? 'avif' : 'webp';
  const name = createHash('sha1').update(`${src}|${w}|${q}`).digest('hex');
  const file = path.join(cacheDir(), name.slice(0, 2), `${name}.${fmt}`);
  const headers = { 'content-type': TYPES[fmt], 'cache-control': 'public, max-age=2592000, stale-while-revalidate=86400', vary: 'Accept' };

  try {
    return new Response(new Uint8Array(await readFile(file)), { headers: { ...headers, 'x-stay-img': 'HIT' } });
  } catch { /* ещё не сжимали */ }

  const input = local ? await readLocal(src) : await readRemote(src);
  if (input === 'too large') return bad('too large', 413);
  if (!input) return bad('source not available', 404);
  let out: Buffer;
  try {
    const img = sharp(input, { failOn: 'none', limitInputPixels: 80_000_000 }).rotate().resize({ width: w, withoutEnlargement: true });
    out = fmt === 'avif' ? await img.avif({ quality: Math.round(q * 0.7), effort: 3 }).toBuffer() : await img.webp({ quality: q }).toBuffer();
  } catch {
    return bad('not an image', 415);
  }
  try {
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, out);
    await rename(tmp, file);
  } catch { /* не записали — отдадим без кэша */ }
  return new Response(new Uint8Array(out), { headers: { ...headers, 'x-stay-img': 'MISS' } });
};

async function readLocal(src: string): Promise<Buffer | null> {
  for (const dir of PUBLIC_DIRS) {
    const file = path.join(dir, src);
    if (!file.startsWith(dir + path.sep)) return null;
    try { return await readFile(file); } catch { /* нет в этой папке */ }
  }
  return null;
}

/** Чужая картинка: сначала своя сохранённая копия оригинала, иначе скачиваем и сохраняем. */
async function readRemote(src: string): Promise<Buffer | null | 'too large'> {
  const name = createHash('sha1').update(src).digest('hex');
  const file = path.join(originalsDir(), name.slice(0, 2), name);
  try { return await readFile(file); } catch { /* ещё не сохраняли */ }

  const r = await fetch(src, { signal: AbortSignal.timeout(15000), redirect: 'follow' }).catch(() => null);
  if (!r || !r.ok || (r.headers.get('content-type') ?? '').startsWith('text/')) return null;
  if (Number(r.headers.get('content-length') || 0) > MAX_BYTES) return 'too large';
  const input = Buffer.from(await r.arrayBuffer());
  if (input.length > MAX_BYTES) return 'too large';
  try {
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, input);
    await rename(tmp, file);
  } catch { /* не сохранили — в следующий раз скачаем снова */ }
  return input;
}
