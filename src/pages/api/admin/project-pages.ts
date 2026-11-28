import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { saveProjectPage } from '../../../lib/projectPages';
import { purge } from '../../../lib/purge';

export const prerender = false;

/** «Страница проекта» одного ЖК (+ общие цифры ипотеки). Доступ — раздел «Проекты». */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'projects');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    const db = await saveProjectPage(body?.code, body?.page, body?.mortgage);
    await audit(user, 'project-page.save', String(body?.code ?? '').slice(0, 120), ipOf(request, clientAddress));
    await purge(['site']);
    return Response.json({ ok: true, page: db.projects[String(body?.code ?? '')] ?? {}, mortgage: db.mortgage });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
