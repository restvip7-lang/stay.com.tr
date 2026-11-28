import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { blobToken, dataDir, storeMode } from '../../../lib/store';

export const prerender = false;

/**
 * Загрузка файла из админки «Страница проекта» (фото, обложки, PDF). Файл кладём у себя:
 * на сервере — STAY_DATA_DIR/uploads/ГГГГ-ММ/<хэш>.<расширение> (отдаёт /uploads/…), на Vercel — в Blob.
 * Фото шире 1920 px ужимаем (больше сайт не показывает). Имя = хэш содержимого: один файл дважды не ляжет.
 */
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'application/pdf': 'pdf' };
const MAX = 20 * 1024 * 1024;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'projects');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const form = await request.formData();
    const f = form.get('file');
    if (!(f instanceof File)) return Response.json({ ok: false, error: 'Нет файла' }, { status: 400 });
    let ext = TYPES[f.type];
    if (!ext) return Response.json({ ok: false, error: 'Можно только JPG, PNG, WebP, AVIF или PDF' }, { status: 400 });
    if (f.size > MAX) return Response.json({ ok: false, error: 'Файл больше 20 МБ' }, { status: 400 });
    let buf: Buffer = Buffer.from(await f.arrayBuffer());
    if (ext !== 'pdf' && storeMode() === 'fs') {
      const { shrinkOriginal } = await import('../../../lib/imageSource');
      const out = await shrinkOriginal(buf);
      if (out !== buf) {
        const sharp = (await import('sharp')).default;
        const fmt = (await sharp(out).metadata()).format;
        ext = fmt === 'jpeg' ? 'jpg' : fmt === 'webp' ? 'webp' : ext;
        buf = out;
      }
    }
    const name = `${new Date().toISOString().slice(0, 7)}/${createHash('sha1').update(buf).digest('hex').slice(0, 20)}.${ext}`;
    let url: string;
    if (storeMode() === 'fs') {
      const file = path.join(dataDir(), 'uploads', name);
      await mkdir(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await writeFile(tmp, buf);
      await rename(tmp, file);
      url = `/uploads/${name}`;
    } else {
      if (!blobToken()) throw new Error('Хранилище не подключено');
      const { put } = await import('@vercel/blob');
      url = (await put(`uploads/${name}`, buf, { access: 'public', token: blobToken(), contentType: f.type, addRandomSuffix: false, allowOverwrite: true })).url;
    }
    await audit(user, 'upload', `${url} ${f.name}`.slice(0, 200), ipOf(request, clientAddress));
    return Response.json({ ok: true, url, name: f.name, size: buf.length });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
