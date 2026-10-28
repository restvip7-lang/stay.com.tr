import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/adminAuth';
import { saveHomeConfig } from '../../../lib/homeConfig';
import { purge } from '../../../lib/purge';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return new Response('Нужно войти', { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return new Response('Bad origin', { status: 403 });
  try {
    const saved = await saveHomeConfig(await request.json());
    // Настройки главной видны на всех языках: сбрасываем кэш страниц сайта.
    await purge(['site']);
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
