/**
 * Блог (ТЗ 3.4): рубрики laws, area-guides (свои тексты) и news (из API новостей).
 * Здесь — адреса, списки и подбор ссылок для посадочных.
 */
import type { Lang } from '../i18n/config';
import { LAWS } from '../content/blog/laws';
import { GUIDES, type Guide } from '../content/blog/guides';
import type { Article } from '../content/blog/types';
import { cityBySlug, districtBySlug } from './geo';
import type { Cat } from './catalog';

export type BlogCat = 'laws' | 'area-guides' | 'news';
export const BLOG_CATS: BlogCat[] = ['laws', 'area-guides', 'news'];

export const BLOG_CAT_NAME: Record<Lang, Record<BlogCat, string>> = {
  ru: { laws: 'Законы и оформление', 'area-guides': 'Гайды по районам', news: 'Новости' },
  en: { laws: 'Laws and paperwork', 'area-guides': 'Area guides', news: 'News' },
  tr: { laws: 'Mevzuat ve işlemler', 'area-guides': 'Bölge rehberleri', news: 'Haberler' },
  de: { laws: 'Recht und Formalitäten', 'area-guides': 'Stadtteil-Guides', news: 'Nachrichten' },
  sr: { laws: 'Zakoni i papirologija', 'area-guides': 'Vodiči po naseljima', news: 'Vesti' },
};

export const BLOG_CAT_LEAD: Record<Lang, Record<BlogCat, string>> = {
  ru: { laws: 'Как иностранцу купить недвижимость в Турции, получить ВНЖ или гражданство и какие расходы учесть.', 'area-guides': 'Районы Алании: где жить, что рядом и сколько стоит недвижимость — по данным каталога Stay Property.', news: 'Новости рынка недвижимости Турции и проектов Stay Property.' },
  en: { laws: 'How foreigners buy property in Turkey, obtain a residence permit or citizenship, and which costs to plan for.', 'area-guides': 'Districts of Alanya: where to live, what is nearby and what property costs — based on the Stay Property catalogue.', news: 'News from the Turkish property market and Stay Property projects.' },
  tr: { laws: 'Yabancılar Türkiye\'de nasıl gayrimenkul alır, oturma izni veya vatandaşlık nasıl alınır ve hangi masraflar planlanmalı.', 'area-guides': 'Alanya\'nın bölgeleri: nerede yaşanır, yakında neler var ve fiyatlar — Stay Property kataloğuna göre.', news: 'Türkiye gayrimenkul piyasası ve Stay Property projelerinden haberler.' },
  de: { laws: 'Wie Ausländer in der Türkei Immobilien kaufen, eine Aufenthaltserlaubnis oder Staatsbürgerschaft erhalten und mit welchen Kosten zu rechnen ist.', 'area-guides': 'Stadtteile von Alanya: wo man lebt, was in der Nähe ist und was Immobilien kosten — nach Katalogdaten von Stay Property.', news: 'Nachrichten vom türkischen Immobilienmarkt und zu Projekten von Stay Property.' },
  sr: { laws: 'Kako stranci kupuju nekretnine u Turskoj, dobijaju boravišnu dozvolu ili državljanstvo i koje troškove treba planirati.', 'area-guides': 'Naselja Alanje: gde živeti, šta je u blizini i koliko koštaju nekretnine — prema katalogu Stay Property.', news: 'Vesti sa tržišta nekretnina u Turskoj i o projektima Stay Property.' },
};

export const blogUrl = (lang: Lang, cat?: BlogCat, slug?: string) => `/${lang}/blog/${cat ? `${cat}/` : ''}${slug ? `${slug}/` : ''}`;

/* ---------- Гайды ---------- */

export function guideName(lang: Lang, g: Guide): string {
  return g.district ? districtBySlug(g.city, g.district)?.name[lang] ?? g.slug : cityBySlug(g.city)?.name[lang] ?? g.slug;
}

export function guideTitle(lang: Lang, g: Guide): string {
  const n = guideName(lang, g);
  return {
    ru: g.district ? `Район ${n} в Алании: жизнь, инфраструктура и цены на жильё` : `Алания: гид по городу и ценам на недвижимость`,
    en: g.district ? `${n}, Alanya: living, amenities and property prices` : `Alanya: a guide to the town and property prices`,
    tr: g.district ? `Alanya ${n}: yaşam, altyapı ve konut fiyatları` : `Alanya: şehir rehberi ve konut fiyatları`,
    de: g.district ? `${n} in Alanya: Leben, Infrastruktur und Immobilienpreise` : `Alanya: Stadtführer und Immobilienpreise`,
    sr: g.district ? `${n}, Alanja: život, infrastruktura i cene nekretnina` : `Alanja: vodič kroz grad i cene nekretnina`,
  }[lang];
}

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug) ?? null;
export const guideCat = (g: Guide): Cat => ({ country: cityBySlug(g.city)!.country, city: g.city, district: g.district });

/** Гайд для посадочной: по району, иначе по городу. */
export function guideFor(lang: Lang, cat: Cat): { href: string; name: string; title: string } | null {
  if (!cat.city) return null;
  const g = (cat.district && GUIDES.find((x) => x.city === cat.city && x.district === cat.district)) || GUIDES.find((x) => x.city === cat.city && !x.district);
  return g ? { href: blogUrl(lang, 'area-guides', g.slug), name: guideName(lang, g), title: guideTitle(lang, g) } : null;
}

/* ---------- Законы ---------- */

export const lawBySlug = (slug: string): Article | null => LAWS.find((a) => a.slug === slug) ?? null;
export const lawsOf = (lang: Lang) => LAWS.filter((a) => a.tr[lang]);

export function lawLinks(lang: Lang, n = 3) {
  return lawsOf(lang).slice(0, n).map((a) => ({ href: blogUrl(lang, 'laws', a.slug), title: a.tr[lang]!.title, text: a.tr[lang]!.title }));
}

export { LAWS, GUIDES };

/* ---------- Единый список материалов ---------- */

import { getNewsL } from './api';
import { strip } from './format';
import type { Lang as L2 } from '../i18n/config';

export interface Post { cat: BlogCat; slug: string; href: string; title: string; description: string; image: string | null; date: string; updated: string }

const GUIDE_DATE = '2026-10-28';

export function guideLead(lang: L2, g: Guide): string {
  return g.text[lang][0] ?? '';
}

export async function postsOf(lang: L2, cat: BlogCat): Promise<Post[]> {
  if (cat === 'laws') return lawsOf(lang).map((a) => ({ cat, slug: a.slug, href: blogUrl(lang, cat, a.slug), title: a.tr[lang]!.title, description: a.tr[lang]!.description, image: a.image, date: a.published, updated: a.updated }));
  if (cat === 'area-guides') return GUIDES.map((g) => ({ cat, slug: g.slug, href: blogUrl(lang, cat, g.slug), title: guideTitle(lang, g), description: strip(guideLead(lang, g), 160), image: null, date: GUIDE_DATE, updated: GUIDE_DATE }));
  return (await getNewsL(lang)).map((n) => ({ cat, slug: n.slug, href: blogUrl(lang, 'news', n.slug), title: n.title, description: n.seoDescription || strip(n.excerpt || n.content, 160), image: n.image, date: n.date, updated: n.updated }));
}
