import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { savePartners } from '../../../lib/sclub';
import { purge } from '../../../lib/purge';

export const prerender = false;

/** Партнёры S-Club: весь список целиком (порядок = порядок на сайте). Доступ — как к главной. */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'home');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    const saved = await savePartners(body?.partners);
    await audit(user, 'sclub.save', `${saved.length}`, ipOf(request, clientAddress));
    await purge(['site']);
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
