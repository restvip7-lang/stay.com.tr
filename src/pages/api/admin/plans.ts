import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { savePlans } from '../../../lib/plans';
import { purge } from '../../../lib/purge';

export const prerender = false;

/** Планы проектов STAY PROJECTS (генплан, этажность, планы этажей, вид из окна): весь набор целиком. Доступ — как к главной. */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'home');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    const saved = await savePlans(body?.plans);
    await audit(user, 'plans.save', Object.keys(saved).join(', ').slice(0, 200), ipOf(request, clientAddress));
    await purge(['site']);
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
