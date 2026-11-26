/**
 * Откуда берём исходные картинки на своём сервере: свои файлы из public (media, hero)
 * или фото с разрешённых сайтов (IMAGE_DOMAINS в astro.config.mjs). Оригиналы с чужих сайтов
 * при первом запросе сохраняем в STAY_DATA_DIR/media-src и дальше берём с диска — уже ужатыми
 * до 1920 px (больше сайт всё равно не показывает), чтобы не держать на диске тяжёлые исходники.
 * Используют /img (сжатие) и PDF-подборка чата.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const IMAGE_DOMAINS = new Set(String(import.meta.env.STAY_IMAGE_DOMAINS || '').split(',').filter(Boolean));
export const LOCAL_IMAGE = /^\/(?:media|hero|picker)\/[^?#\\<>"]+\.(?:jpe?g|png|webp|avif)$/i;
const MAX_BYTES = 25 * 1024 * 1024;
/** Оригинал для хранения: не шире 1920 px. Тот же расчёт в scripts/media-src-shrink.mjs (разовое ужатие старых). */
export const KEEP_WIDTH = 1920;
const KEEP_BYTES = 1.5 * 1024 * 1024;

/** Уменьшить оригинал для хранения. Если уменьшать нечего или не вышло меньше — вернуть как есть. */
export async function shrinkOriginal(input: Buffer): Promise<Buffer> {
  try {
    const img = sharp(input, { failOn: 'none', limitInputPixels: 80_000_000 });
    const m = await img.metadata();
    if (!m.width || m.format === 'svg' || m.format === 'gif' || (m.pages ?? 1) > 1) return input;
    if (m.width <= KEEP_WIDTH && input.length <= KEEP_BYTES) return input;
    const r = img.rotate().resize({ width: KEEP_WIDTH, withoutEnlargement: true });
    const out = m.hasAlpha ? await r.webp({ quality: 90 }).toBuffer() : await r.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    return out.length < input.length ? out : input;
  } catch {
    return input;
  }
}
const originalsDir = () => path.resolve(process.env.STAY_DATA_DIR || 'data', 'media-src');
/** Свои картинки: после сборки они в dist/client, при `astro dev` — в public. */
const PUBLIC_DIRS = ['dist/client', 'public'].map((d) => path.resolve(d));

export async function readLocal(src: string): Promise<Buffer | null> {
  if (/%[0-9a-f]{2}/i.test(src)) { try { src = decodeURIComponent(src); } catch { /* как есть */ } }
  if (src.includes('..')) return null;
  for (const dir of PUBLIC_DIRS) {
    const file = path.join(dir, src);
    if (!file.startsWith(dir + path.sep)) return null;
    try { return await readFile(file); } catch { /* нет в этой папке */ }
  }
  return null;
}

/** Чужая картинка: сначала своя сохранённая копия оригинала, иначе скачиваем и сохраняем. */
export async function readRemote(src: string): Promise<Buffer | null | 'too large'> {
  const name = createHash('sha1').update(src).digest('hex');
  const file = path.join(originalsDir(), name.slice(0, 2), name);
  try { return await readFile(file); } catch { /* ещё не сохраняли */ }

  const r = await fetch(src, { signal: AbortSignal.timeout(15000), redirect: 'follow' }).catch(() => null);
  if (!r || !r.ok || (r.headers.get('content-type') ?? '').startsWith('text/')) return null;
  if (Number(r.headers.get('content-length') || 0) > MAX_BYTES) return 'too large';
  const raw = Buffer.from(await r.arrayBuffer());
  if (raw.length > MAX_BYTES) return 'too large';
  const input = await shrinkOriginal(raw);
  try {
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, input);
    await rename(tmp, file);
  } catch { /* не сохранили — в следующий раз скачаем снова */ }
  return input;
}

/**
 * Картинка по адресу, как он стоит в карточке: свой файл, https с разрешённого сайта
 * или ссылка на сжатие (/img?url=… или /_vercel/image?url=…). Всё прочее — null (не ходим куда попало).
 */
export async function loadImage(src: string | null | undefined, base: string): Promise<Buffer | null> {
  if (!src) return null;
  let u: URL;
  try { u = new URL(src, base); } catch { return null; }
  const own = u.origin === new URL(base).origin;
  if (own && (u.pathname === '/img' || u.pathname === '/_vercel/image')) return loadImage(u.searchParams.get('url'), base);
  if (own && LOCAL_IMAGE.test(u.pathname) && !u.pathname.includes('..')) return readLocal(decodeURIComponent(u.pathname));
  if (u.protocol !== 'https:' || !IMAGE_DOMAINS.has(u.hostname)) return null;
  const r = await readRemote(u.href);
  return r === 'too large' ? null : r;
}
