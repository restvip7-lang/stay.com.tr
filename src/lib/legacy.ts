/**
 * Старые адреса dev-сайта → новая схема URL (ТЗ 3). Один хоп 301.
 */
import { findItem, itemUrl, complexByCode, complexUrl } from './catalog';

export const SERVICE_SLUGS: Record<string, string> = {
  'grazhdanstvo': 'citizenship',
  'vid-na-zhitelstvo': 'residence-permit',
  'informatsionnyy-tur': 'tours',
  'onlayn-prosmotr': 'online-viewing',
  'onlayn-pokupka-nedvizhimosti': 'online-purchase',
  'eksklyuzivnaya-prodazha-nedvizhimosti': 'exclusive-sale',
  'trade-in-more': 'trade-in',
};

const SIMPLE: Record<string, string> = {
  '/sale': '/ru/turkey/sale/',
  '/rental': '/ru/turkey/rent/',
  '/complex': '/ru/turkey/sale/complexes/',
  '/real-estate': '/ru/turkey/sale/',
  '/uslugi': '/ru/services/',
  '/about': '/ru/about/',
  '/prive': '/ru/prive/',
  '/favorites': '/ru/favorites/',
  '/search': '/ru/search/',
  '/privacy-policy': '/ru/privacy-policy/',
  '/news': '/ru/blog/news/',
  '/novosti': '/ru/blog/news/',
  '/reviews': '/ru/reviews/',
  '/team': '/ru/team/',
  '/ru/news': '/ru/blog/news/',
  '/contacts': '/ru/contacts/',
};

export async function legacyRedirect(path: string, sp: URLSearchParams): Promise<string | null> {
  const p = path.replace(/\/+$/, '') || '/';
  if (SIMPLE[p]) {
    // Поиск с параметрами фильтра переносим на тот же листинг с теми же параметрами.
    const keep = new URLSearchParams();
    for (const k of ['price_from', 'price_to', 'rooms', 'sea_from', 'sea_to', 'sort', 'prive', 'citizenship', 'ref', 'q']) sp.getAll(k).forEach((v) => keep.append(k, v));
    return SIMPLE[p] + (keep.toString() ? `?${keep}` : '');
  }
  // Прежние адреса разделов уже с языком: «Новостройки» без страны и аренда под именем rental.
  let m = p.match(/^\/(ru|en|tr|de|sr)\/sale\/complexes(\/page-\d+)?$/);
  const qs = sp.toString() ? `?${sp}` : '';
  if (m) return `/${m[1]}/turkey/sale/complexes/${m[2] ? m[2].slice(1) + '/' : ''}${qs}`;
  m = p.match(/^\/(ru|en|tr|de|sr)\/((?:[\w-]+\/)*)rental(\/page-\d+)?$/);
  if (m) return `/${m[1]}/${m[2]}rent/${m[3] ? m[3].slice(1) + '/' : ''}${qs}`;
  m = p.match(/^\/(sale|rental)\/(u?\d+)$/);
  if (m) {
    const x = await findItem(m[2]);
    return x ? itemUrl('ru', x) : SIMPLE['/' + m[1]];
  }
  m = p.match(/^\/(?:complex|real-estate)\/project\/([\w-]+)$/);
  if (m) {
    const c = await complexByCode(m[1]);
    return c ? complexUrl('ru', c) : SIMPLE['/complex'];
  }
  m = p.match(/^\/uslugi\/([\w-]+)$/);
  if (m) return `/ru/services/${SERVICE_SLUGS[m[1]] ?? ''}${SERVICE_SLUGS[m[1]] ? '/' : ''}`;
  m = p.match(/^\/(?:ru\/)?news\/([\w-]+)$/);
  if (m) return `/ru/blog/news/${m[1]}/`;
  // Новости старого сайта stay.com.tr (/novosti/код/): если такая новость есть — на неё, иначе на список.
  m = p.match(/^\/novosti\/([\w-]+)$/);
  if (m) {
    const { getNewsItemL } = await import('./api');
    const n = await getNewsItemL('ru', m[1]).catch(() => null);
    return n ? `/ru/blog/news/${n.slug}/` : SIMPLE['/novosti'];
  }
  return null;
}

/** Ссылка из настроек главной (старые адреса) → адрес на языке страницы. */
export function localizeHref(lang: string, href: string): string {
  if (!href.startsWith('/') || /^\/(ru|en|tr|de|sr)\//.test(href)) return href;
  const p = href.split('?')[0].replace(/\/+$/, '') || '/';
  const m = p.match(/^\/uslugi\/([\w-]+)$/);
  if (m) return `/${lang}/services/${SERVICE_SLUGS[m[1]] ? `${SERVICE_SLUGS[m[1]]}/` : ''}`;
  if (SIMPLE[p]) return SIMPLE[p].replace(/^\/ru\//, `/${lang}/`);
  return `/${lang}/`;
}
