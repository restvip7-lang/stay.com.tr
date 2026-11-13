/**
 * Сжатие картинок на своём сервере (VPS) — замена /_vercel/image.
 * GET /img?url=<https-адрес>&w=<ширина>&q=<качество> → AVIF или WebP нужной ширины.
 * Берём только с разрешённых сайтов (IMAGE_DOMAINS в astro.config.mjs) и только ширины из списка.
 * Готовые файлы кладём на диск (STAY_DATA_DIR/img-cache), повторно не пересжимаем.
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
const TYPES = { avif: 'image/avif', webp: 'image/webp' } as const;

const bad = (msg: string, status = 400) => new Response(msg, { status, headers: { 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ url, request }) => {
  const src = url.searchParams.get('url') ?? '';
  const w = Number(url.searchParams.get('w'));
  const q = Math.min(90, Math.max(30, Number(url.searchParams.get('q')) || 75));
  let host = '';
  try {
    const u = new URL(src);
    if (u.protocol !== 'https:') return bad('only https');
    host = u.hostname;
  } catch {
    return bad('bad url');
  }
  if (!DOMAINS.has(host)) return bad('domain not allowed');
  if (!WIDTHS.has(w)) return bad('bad width');

  const fmt: keyof typeof TYPES = (request.headers.get('accept') ?? '').includes('image/avif') ? 'avif' : 'webp';
  const name = createHash('sha1').update(`${src}|${w}|${q}`).digest('hex');
  const file = path.join(cacheDir(), name.slice(0, 2), `${name}.${fmt}`);
  const headers = { 'content-type': TYPES[fmt], 'cache-control': 'public, max-age=2592000, stale-while-revalidate=86400', vary: 'Accept' };

  try {
    return new Response(new Uint8Array(await readFile(file)), { headers: { ...headers, 'x-stay-img': 'HIT' } });
  } catch { /* ещё не сжимали */ }

  const r = await fetch(src, { signal: AbortSignal.timeout(15000), redirect: 'follow' }).catch(() => null);
  if (!r || !r.ok) return bad('source not available', 404);
  const len = Number(r.headers.get('content-length') || 0);
  if (len > MAX_BYTES) return bad('too large', 413);
  const input = Buffer.from(await r.arrayBuffer());
  if (input.length > MAX_BYTES) return bad('too large', 413);

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
