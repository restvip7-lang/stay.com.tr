import type { APIRoute } from 'astro';
import { noindex } from '../lib/site';
export const GET: APIRoute = ({ site }) =>
  new Response(noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site)}\n`, { headers: { 'content-type': 'text/plain' } });
