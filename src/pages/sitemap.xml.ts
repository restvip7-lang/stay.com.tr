import type { APIRoute } from 'astro';
import { renderIndex } from '../lib/sitemap';

export const GET: APIRoute = () =>
  new Response(renderIndex(), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cdn-cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
