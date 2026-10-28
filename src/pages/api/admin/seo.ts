import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/adminAuth';
import { saveSeoConfig } from '../../../lib/seoConfig';
import { purge } from '../../../lib/purge';

export const prerender = false;

/** Сохранение SEO-настроек: переопределения страниц и редиректы (ТЗ 14). */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return new Response('Нужно войти', { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return new Response('Bad origin', { status: 403 });
  try {
    const saved = await saveSeoConfig(await request.json());
    await purge(['site']);
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message.slice(0, 600) }, { status: 400 });
  }
};
