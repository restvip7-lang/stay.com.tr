import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { getHomeConfig, saveHomeConfig } from '../../../lib/homeConfig';
import { purge } from '../../../lib/purge';

export const prerender = false;

const codes = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((c): c is string => typeof c === 'string' && /^[\w-]{1,120}$/.test(c)))] : []);

/**
 * Раздел PRIVE в админке (Anuar 26.11.2026): какие ЖК — PRIVE (codes), их порядок на странице PRIVE (projects),
 * слайдер первого экрана PRIVE (hero) и сколько проектов видно сразу. Остальные настройки главной не трогаем.
 */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'home');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    const cur = await getHomeConfig(true);
    const list = codes(body?.codes);
    const order = codes(body?.projects).filter((c) => list.includes(c));
    const prive = {
      ...cur.prive,
      codes: list,
      projects: [...order, ...list.filter((c) => !order.includes(c))],
      hero: codes(body?.hero).filter((c) => list.includes(c)),
      projectsVisible: Math.max(1, Math.min(50, Number(body?.projectsVisible) || cur.prive.projectsVisible)),
    };
    const saved = await saveHomeConfig({ ...cur, prive });
    await audit(user, 'prive.save', `${list.length} ЖК`, ipOf(request, clientAddress));
    await purge(['site']);
    return Response.json({ ok: true, saved: saved.prive });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
