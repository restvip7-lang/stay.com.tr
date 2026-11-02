/** Вошёл ли посетитель в админку — подборщик показывает режим «Продажи» только админу. */
import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/adminAuth';

export const prerender = false;

export const GET: APIRoute = ({ cookies }) =>
  new Response(JSON.stringify({ admin: isAdmin(cookies) }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
  });
