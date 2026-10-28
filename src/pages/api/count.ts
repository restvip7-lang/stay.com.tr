import type { APIRoute } from 'astro';
import { searchListings } from '../../lib/api';
import { parseQuery } from '../../lib/query';

// Счётчик для кнопки «Показать N квартир» в фильтре.
export const GET: APIRoute = async ({ url }) => {
  const op = url.searchParams.get('operation') === 'rental' ? 'rental' : 'sale';
  const r = await searchListings({ ...parseQuery(url.searchParams, op), perPage: 1 });
  return new Response(JSON.stringify({ total: r.total }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  });
};
