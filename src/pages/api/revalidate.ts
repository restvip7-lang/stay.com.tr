import type { APIRoute } from 'astro';
import { purge } from '../../lib/purge';
import { expireCache } from '../../lib/api';
import { updateSeen } from '../../lib/seen';

export const prerender = false;

/**
 * Вебхук обновления (ТЗ 14): Portfolio/админка вызывает при изменении объекта или категории,
 * Vercel Cron — раз в сутки. Сбрасывает кэш страниц и дописывает снимок объектов (для «Продано» и 410).
 * Авторизация: Authorization: Bearer <REVALIDATE_SECRET> (или CRON_SECRET у крона).
 */
function authorized(request: Request): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const secrets = [process.env.REVALIDATE_SECRET, process.env.CRON_SECRET].filter(Boolean) as string[];
  return secrets.some((s) => auth === `Bearer ${s}`);
}

async function run(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 });
  let tags = ['site'];
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (Array.isArray(body?.tags) && body.tags.every((t: unknown) => typeof t === 'string' && /^[\w-]{1,64}$/.test(t))) tags = body.tags;
    } catch { /* пустое тело — сбрасываем всё */ }
  }
  expireCache();
  const seen = await updateSeen().catch((e) => ({ error: (e as Error).message }));
  const purged = await purge(tags);
  return Response.json({ ok: true, purged, tags, seen });
}

export const GET: APIRoute = ({ request }) => run(request);
export const POST: APIRoute = ({ request }) => run(request);
