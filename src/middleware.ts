/**
 * Зеркала, язык и кэш (ТЗ 2.3, 4.1, 8.2):
 * - www → без www, / → 308 /en/, /index.php → /en/ одним хопом;
 * - заглавные буквы → строчные; разделы — со слешем, карточки — без;
 * - /page-1/ → 301 на страницу без номера;
 * - старые адреса dev-сайта (/sale/…, /complex/…, /uslugi/…) → 301 на новую схему;
 * - язык страницы — только из префикса URL.
 */
import { defineMiddleware } from 'astro:middleware';
import { DEFAULT_LANG, isLang, type Lang } from './i18n/config';
import { legacyRedirect } from './lib/legacy';
import { redirectFor } from './lib/seoConfig';

const STATIC = /^\/(_astro|_vercel|favicon|karetta|fonts|images|api|admin|robots\.txt|sitemap|llms\.txt|og\/|og-default|logo\.png)/;
/** Карточка объекта или ЖК — адрес без слеша на конце. */
const CARD = /\/(id\w+|complexes\/(?!page-\d+\/?$)[a-z0-9-]+)\/?$/;

const redirect = (to: string, status = 301) => new Response(null, { status, headers: { location: to, 'cache-control': 'public, max-age=3600' } });

export const onRequest = defineMiddleware(async (ctx, next) => {
  const url = ctx.url;
  const host = ctx.request.headers.get('host') ?? url.host;
  if (host.startsWith('www.')) return redirect(`https://${host.slice(4)}${url.pathname}${url.search}`);

  let path = url.pathname;
  if (path === '/' || /^\/index\.(php|html?)$/i.test(path)) return redirect(`/${DEFAULT_LANG}/${url.search}`, path === '/' ? 308 : 301);

  const first = path.split('/')[1] ?? '';
  const lang: Lang = isLang(first.toLowerCase()) ? (first.toLowerCase() as Lang) : 'ru';
  ctx.locals.lang = lang;

  if (!STATIC.test(path)) {
    // Единый вид адреса: строчные буквы, слеш у разделов, без слеша у карточек, без /page-1/.
    let fixed = path.toLowerCase().replace(/\/{2,}/g, '/');
    fixed = fixed.replace(/\/page-1\/?$/, '/');
    if (isLang(fixed.split('/')[1])) {
      if (CARD.test(fixed)) fixed = fixed.replace(/\/+$/, '');
      else if (!fixed.endsWith('/') && !/\.[a-z0-9]+$/.test(fixed)) fixed += '/';
    }
    if (fixed !== path) return redirect(fixed + url.search);

    // Редиректы из админки (ТЗ 14): 301 или 410.
    const r = await redirectFor(path).catch(() => null);
    if (r?.status === 301) return redirect(r.to + url.search);
    if (r?.status === 410) return ctx.rewrite('/410');

    const to = await legacyRedirect(path, url.searchParams).catch(() => null);
    if (to) return redirect(to);
  }

  const res = await next();

  // Кэш на CDN Vercel: 10 минут свежий, потом отдаём устаревший и обновляем в фоне (ТЗ 2.6, п. 3).
  // Ключ кэша включает строку запроса, поэтому фильтры по ?параметрам кэшируются отдельно.
  if (ctx.request.method === 'GET' && isLang(first) && res.status < 500 && !res.headers.has('cache-control')) {
    res.headers.set('cache-control', 'public, max-age=0, must-revalidate');
    res.headers.set('cdn-cache-control', 'public, s-maxage=600, stale-while-revalidate=86400, stale-if-error=86400');
    try {
      const { addCacheTag } = await import('@vercel/functions');
      await addCacheTag(['site', `lang-${lang}`]);
    } catch { /* локально тегов нет */ }
  }
  // Пока сайт не открыт для индексации, закрываем его заголовком (staging-защита, ТЗ 15 п. 18).
  if ((import.meta.env.STAY_NOINDEX ?? process.env.STAY_NOINDEX ?? '1') !== '0') res.headers.set('x-robots-tag', 'noindex, nofollow');
  return res;
});
