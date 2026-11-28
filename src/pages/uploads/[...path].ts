import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from '../../lib/store';

export const prerender = false;

/** Файлы, загруженные в админке (STAY_DATA_DIR/uploads): фото, обложки и PDF страниц проектов. Имя = хэш, поэтому кэш навсегда. */
const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', pdf: 'application/pdf' };

export const GET: APIRoute = async ({ params }) => {
  const rel = String(params.path ?? '');
  const ext = rel.split('.').pop()?.toLowerCase() ?? '';
  if (!/^\d{4}-\d{2}\/[0-9a-f]{20}\.[a-z]+$/.test(rel) || !TYPES[ext]) return new Response('Not found', { status: 404 });
  const root = path.join(dataDir(), 'uploads');
  const file = path.join(root, rel);
  if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });
  try {
    const body = await readFile(file);
    return new Response(new Uint8Array(body), { headers: { 'content-type': TYPES[ext], 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
