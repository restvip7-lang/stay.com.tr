/**
 * Sitemap (ТЗ 11.2): индекс + дочерние по типам и языкам. Только канонические индексируемые страницы
 * (пороги — как на самих страницах), у каждой — hreflang-альтернативы и lastmod.
 */
import { LANGS, SITE, HREFLANG, type Lang } from '../i18n/config';
import { getItems, getUnits, getComplexes, catUrl, itemUrl, complexUrl, INDEX_MIN, type Cat } from './catalog';
import { translatedIds } from './api';
import { SERVICES, serviceUrl } from './services';
import { BLOG_CATS, blogUrl, postsOf } from './blog';
import { getNewsL } from './api';
import { TEAM, EDITORIAL } from '../content/company';
import { allLangs, someLangs } from './page';

export const KINDS = ['categories', 'objects', 'complexes', 'blog', 'static'] as const;
export type Kind = (typeof KINDS)[number];

interface Url { loc: string; lastmod: string; alts?: Partial<Record<Lang, string>> }

const today = () => new Date().toISOString().slice(0, 10);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function renderUrlset(urls: Url[]): string {
  const body = urls.map((u) => {
    const alts = u.alts && Object.keys(u.alts).length > 1
      ? LANGS.filter((l) => u.alts![l]).map((l) => `<xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${esc(SITE + u.alts![l])}"/>`).join('')
        + `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE + (u.alts.en ?? u.alts.ru ?? Object.values(u.alts)[0]!))}"/>`
      : '';
    return `<url><loc>${esc(SITE + u.loc)}</loc><lastmod>${u.lastmod}</lastmod>${alts}</url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

export function renderIndex(): string {
  const d = today();
  const items = KINDS.flatMap((k) => LANGS.map((l) => `<sitemap><loc>${SITE}/sitemap-${k}-${l}.xml</loc><lastmod>${d}</lastmod></sitemap>`)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

/** Число объектов в каждой непустой категории (хаб, сделка, тип, фича) по всем гео-уровням. */
export async function categoryCounts(): Promise<{ cat: Cat; n: number }[]> {
  const counts = new Map<string, { cat: Cat; n: number }>();
  const add = (cat: Cat) => {
    const k = JSON.stringify(cat);
    const c = counts.get(k) ?? { cat, n: 0 };
    c.n++;
    counts.set(k, c);
  };
  for (const x of await getItems()) {
    const geos: Cat[] = [{ country: x.country }, { country: x.country, city: x.city }];
    if (x.district) geos.push({ country: x.country, city: x.city, district: x.district });
    for (const g of geos) {
      add(g);
      add({ ...g, deal: x.deal });
      add({ ...g, deal: x.deal, type: x.type });
      for (const f of x.features) add({ ...g, deal: x.deal, type: x.type, feature: f });
    }
  }
  return [...counts.values()];
}

/** Все индексируемые категории (хабы, листинги, тип, фича, новостройки гео) — по тем же порогам, что на страницах. */
export async function indexableCats(): Promise<{ cat: Cat; complexes?: boolean }[]> {
  const out: { cat: Cat; complexes?: boolean }[] = (await categoryCounts()).filter((c) => c.n >= INDEX_MIN).map((c) => ({ cat: c.cat }));
  const cx = new Map<string, { cat: Cat; n: number }>();
  for (const c of await getComplexes()) {
    const geos: Cat[] = [{ country: c.country }, { country: c.country, city: c.city }];
    if (c.district) geos.push({ country: c.country, city: c.city, district: c.district });
    for (const g of geos) {
      const k = JSON.stringify(g);
      const v = cx.get(k) ?? { cat: g, n: 0 };
      v.n++;
      cx.set(k, v);
    }
  }
  for (const v of cx.values()) if (v.n >= INDEX_MIN) out.push({ cat: v.cat, complexes: true });
  return out;
}

export async function urlsOf(kind: Kind, lang: Lang): Promise<Url[]> {
  const d = today();
  if (kind === 'categories') {
    return (await indexableCats()).map(({ cat, complexes }) => {
      const loc = catUrl(lang, cat, complexes ? { complexes: true } : undefined);
      return { loc, lastmod: d, alts: allLangs(loc) };
    });
  }
  if (kind === 'objects') {
    const items = await getItems();
    const ids = async (op: 'sale' | 'rental') => Object.fromEntries(await Promise.all(LANGS.map(async (l) => [l, await translatedIds(op, l).catch(() => new Set<string>())]))) as Record<Lang, Set<string>>;
    const [saleT, rentT] = await Promise.all([ids('sale'), ids('rental')]);
    const out: Url[] = [];
    for (const x of items) {
      // Часть аренды приходит в выдаче продажи — перевод ищем в обеих.
      const langs = LANGS.filter((l) => saleT[l].has(x.id) || rentT[l].has(x.id));
      if (!langs.includes(lang)) continue;
      out.push({ loc: itemUrl(lang, x), lastmod: d, alts: Object.fromEntries(langs.map((l) => [l, itemUrl(l, x)])) });
    }
    if (lang === 'ru') for (const u of await getUnits()) out.push({ loc: itemUrl('ru', u), lastmod: d });
    return out;
  }
  if (kind === 'complexes') {
    // Описания ЖК в API только на русском: остальные языки закрыты от индексации.
    if (lang !== 'ru') return [];
    return (await getComplexes()).map((c) => ({ loc: complexUrl('ru', c), lastmod: d }));
  }
  if (kind === 'blog') {
    const out: Url[] = [{ loc: blogUrl(lang), lastmod: d, alts: allLangs(blogUrl(lang)) }];
    for (const cat of BLOG_CATS) {
      const posts = await postsOf(lang, cat);
      if (!posts.length) continue;
      out.push({ loc: blogUrl(lang, cat), lastmod: (posts[0].updated || d).slice(0, 10), alts: allLangs(blogUrl(lang, cat)) });
      const news = cat === 'news' ? await getNewsL(lang) : [];
      for (const p of posts) {
        let alts: Partial<Record<Lang, string>> = allLangs(p.href);
        if (cat === 'laws') {
          const per = await Promise.all(LANGS.map(async (l) => [l, (await postsOf(l, 'laws')).some((x) => x.slug === p.slug)] as const));
          alts = someLangs(p.href, per.filter(([, ok]) => ok).map(([l]) => l));
        }
        if (cat === 'news') {
          const n = news.find((x) => x.slug === p.slug);
          alts = someLangs(p.href, LANGS.filter((l) => n?.langs.includes(l)));
        }
        out.push({ loc: p.href, lastmod: (p.updated || p.date || d).slice(0, 10), alts });
      }
    }
    return out;
  }
  // static
  const paths = [
    `/${lang}/`, `/${lang}/about/`, `/${lang}/team/`, `/${lang}/reviews/`, `/${lang}/contacts/`, `/${lang}/prive/`, serviceUrl(lang),
    ...SERVICES.map((s) => serviceUrl(lang, s.slug)),
    ...TEAM.map((m) => `/${lang}/team/${m.slug}/`), `/${lang}/team/${EDITORIAL.slug}/`,
  ];
  return paths.map((loc) => ({ loc, lastmod: d, alts: allLangs(loc) }));
}
