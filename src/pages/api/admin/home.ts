import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { saveHomeConfig } from '../../../lib/homeConfig';
import { purge } from '../../../lib/purge';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'home');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const saved = await saveHomeConfig(await request.json());
    // Настройки главной видны на всех языках: сбрасываем кэш страниц сайта.
    await audit(user, 'home.save', '', ipOf(request, clientAddress));
    await purge(['site']);
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
