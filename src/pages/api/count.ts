import type { APIRoute } from 'astro';
import { filtered, parseFilters, parseRoute } from '../../lib/catalog';

// Счётчик для кнопки «Показать N» в фильтре на главной: path — адрес посадочной, остальное — параметры фильтра.
export const GET: APIRoute = async ({ url }) => {
  const path = url.searchParams.get('path') || '';
  const segs = path.split('/').filter(Boolean).slice(1);
  const r = await parseRoute(segs).catch(() => null);
  let total = 0;
  if (r && (r.kind === 'listing' || r.kind === 'hub')) total = (await filtered(r.cat, parseFilters(url.searchParams))).length;
  return new Response(JSON.stringify({ total }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60', 'cdn-cache-control': 'public, s-maxage=600' },
  });
};
