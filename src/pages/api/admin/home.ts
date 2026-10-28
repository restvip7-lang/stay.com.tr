import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/adminAuth';
import { isrBypassToken, saveHomeConfig } from '../../../lib/homeConfig';

export const prerender = false;

// Страницы, где выводятся настройки главной: их кэш сбрасываем сразу после сохранения.
const PATHS = ['/', '/complex/', '/prive/'];

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return new Response('Нужно войти', { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return new Response('Bad origin', { status: 403 });
  try {
    const saved = await saveHomeConfig(await request.json());
    const token = isrBypassToken();
    if (token && import.meta.env.PROD) {
      await Promise.allSettled(PATHS.map((p) => fetch(origin + p, { headers: { 'x-prerender-revalidate': token } })));
    }
    return Response.json({ ok: true, saved });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
};
