import type { APIRoute } from 'astro';
import { isLang } from '../i18n/config';
import { KINDS, renderUrlset, urlsOf, type Kind } from '../lib/sitemap';
import { getSeoConfig } from '../lib/seoConfig';

/** /sitemap-{kind}-{lang}.xml */
export const GET: APIRoute = async ({ params }) => {
  const m = (params.name ?? '').match(/^([a-z]+)-([a-z]{2})$/);
  if (!m || !(KINDS as readonly string[]).includes(m[1]) || !isLang(m[2])) return new Response('Not found', { status: 404 });
  const seo = await getSeoConfig().catch(() => ({ overrides: {}, redirects: [] }) as Awaited<ReturnType<typeof getSeoConfig>>);
  // Без страниц, закрытых в админке, и без адресов с редиректом/410.
  const moved = new Set(seo.redirects.map((r) => r.from.replace(/\/$/, '')));
  const urls = (await urlsOf(m[1] as Kind, m[2])).filter((u) => !seo.overrides[u.loc]?.robots?.startsWith('noindex') && !moved.has(u.loc.replace(/\/$/, '')));
  return new Response(renderUrlset(urls), {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cdn-cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
};
