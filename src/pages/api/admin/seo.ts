import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { saveSeoConfig } from '../../../lib/seoConfig';
import { purge } from '../../../lib/purge';

export const prerender = false;

/** Сохранение SEO-настроек: переопределения страниц и редиректы (ТЗ 14). */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'seo');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const saved = await saveSeoConfig(await request.json());
    await audit(user, 'seo.save', `${saved.redirects.length} редиректов`, ipOf(request, clientAddress));
    await purge(['site']);
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message.slice(0, 600) }, { status: 400 });
  }
};
