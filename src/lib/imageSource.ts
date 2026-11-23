/**
 * Откуда берём исходные картинки на своём сервере: свои файлы из public (media, hero)
 * или фото с разрешённых сайтов (IMAGE_DOMAINS в astro.config.mjs). Оригиналы с чужих сайтов
 * при первом запросе сохраняем в STAY_DATA_DIR/media-src и дальше берём с диска.
 * Используют /img (сжатие) и PDF-подборка чата.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const IMAGE_DOMAINS = new Set(String(import.meta.env.STAY_IMAGE_DOMAINS || '').split(',').filter(Boolean));
export const LOCAL_IMAGE = /^\/(?:media|hero)\/[\w\-./]+\.(?:jpe?g|png|webp|avif)$/i;
const MAX_BYTES = 25 * 1024 * 1024;
const originalsDir = () => path.resolve(process.env.STAY_DATA_DIR || 'data', 'media-src');
/** Свои картинки: после сборки они в dist/client, при `astro dev` — в public. */
const PUBLIC_DIRS = ['dist/client', 'public'].map((d) => path.resolve(d));

export async function readLocal(src: string): Promise<Buffer | null> {
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
