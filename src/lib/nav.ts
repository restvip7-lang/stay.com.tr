/**
 * Меню, футер и хлебные крошки (ТЗ 6.1, 6.3): ссылки ведут на страницы текущего языка.
 */
import type { Lang } from '../i18n/config';
import { t } from '../i18n/ui';
import { cityBySlug, countryBySlug, districtBySlug } from './geo';
import { getItems, catUrl, type Cat } from './catalog';
import { DEAL_WORDS, FEATURE_LABEL, TYPE_WORDS } from './segments';
import { geoIn } from './seo';

export interface MenuCity { slug: string; country: string; name: string; href: string; n: number; districts: { name: string; href: string; n: number }[] }

let memo: { at: number; v: Map<string, { country: string; n: number; d: Map<string, number> }> } | null = null;

async function counts() {
  if (memo && Date.now() - memo.at < 5 * 60_000) return memo.v;
  const v = new Map<string, { country: string; n: number; d: Map<string, number> }>();
  for (const x of await getItems()) {
    if (x.deal !== 'sale') continue;
    const c = v.get(x.city) ?? { country: x.country, n: 0, d: new Map() };
    c.n++;
    if (x.district) c.d.set(x.district, (c.d.get(x.district) ?? 0) + 1);
    v.set(x.city, c);
  }
  memo = { at: Date.now(), v };
  return v;
}

/** Города с топ-районами для выпадающего меню «Продажа». */
export async function menuCities(lang: Lang, limitDistricts = 6): Promise<MenuCity[]> {
  const v = await counts();
  return [...v.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 6)
    .map(([slug, c]) => ({
      slug,
      country: c.country,
      name: cityBySlug(slug)!.name[lang],
      href: catUrl(lang, { country: c.country, city: slug, deal: 'sale' }),
      n: c.n,
      districts: [...c.d.entries()].sort((a, b) => b[1] - a[1]).slice(0, limitDistricts).map(([d, n]) => ({
        name: districtBySlug(slug, d)!.name[lang],
        href: catUrl(lang, { country: c.country, city: slug, district: d }),
        n,
      })),
    }));
}

/** Колонки мега-футера: топ-посадочные Алании, топ-районы, «Покупателю». */
export async function footerColumns(lang: Lang) {
  const d = t(lang);
  const base: Cat = { country: 'turkey', city: 'alanya' };
  const alanya = cityBySlug('alanya')!;
  const g = { country: countryBySlug('turkey')!, city: alanya, district: null };
  const tw = TYPE_WORDS[lang];
  const fl = FEATURE_LABEL[lang];
  const landings = [
    { text: `${tw.apartments.pl}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'apartments' }) },
    { text: `${tw.villas.pl}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'villas' }) },
    { text: `${tw.duplexes.pl}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'duplexes' }) },
    { text: `${tw.apartments.pl}: ${fl['near-sea'].toLocaleLowerCase()}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'apartments', feature: 'near-sea' }) },
    { text: `${tw.apartments.pl}: ${fl.citizenship.toLocaleLowerCase()}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'apartments', feature: 'citizenship' }) },
    { text: `${tw.apartments.pl}: ${fl.cheap.toLocaleLowerCase()}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'apartments', feature: 'cheap' }) },
    { text: `${tw.apartments.pl}: ${fl.installment.toLocaleLowerCase()}`, href: catUrl(lang, { ...base, deal: 'sale', type: 'apartments', feature: 'installment' }) },
    { text: d.nav.complexes, href: catUrl(lang, base, { complexes: true }) },
    { text: `${DEAL_WORDS[lang].rent.name}: ${tw.apartments.low}`, href: catUrl(lang, { ...base, deal: 'rent', type: 'apartments' }) },
    { text: d.nav.sale, href: catUrl(lang, { ...base, deal: 'sale' }) },
  ];
  const v = await counts();
  const al = v.get('alanya');
  const districts = al ? [...al.d.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s]) => ({ text: districtBySlug('alanya', s)!.name[lang], href: catUrl(lang, { ...base, district: s }) })) : [];
  const buyer = [
    { text: d.nav.services, href: `/${lang}/services/` },
    { text: SERVICE_TITLES[lang]['due-diligence'], href: `/${lang}/services/due-diligence/` },
    { text: SERVICE_TITLES[lang].citizenship, href: `/${lang}/services/citizenship/` },
    { text: SERVICE_TITLES[lang]['residence-permit'], href: `/${lang}/services/residence-permit/` },
    { text: d.nav.blog, href: `/${lang}/blog/laws/` },
    { text: d.nav.reviews, href: `/${lang}/reviews/` },
    { text: d.nav.team, href: `/${lang}/team/` },
    { text: d.nav.about, href: `/${lang}/about/` },
    { text: d.nav.contacts, href: `/${lang}/contacts/` },
  ];
  return { title1: d.footer.realtyIn(geoIn(lang, g)), landings, districts, buyer };
}

export const SERVICE_TITLES: Record<Lang, Record<string, string>> = {
  ru: { 'due-diligence': 'Проверка объекта перед покупкой', citizenship: 'Гражданство Турции', 'residence-permit': 'ВНЖ в Турции' },
  en: { 'due-diligence': 'Property due diligence', citizenship: 'Turkish citizenship', 'residence-permit': 'Residence permit in Turkey' },
  tr: { 'due-diligence': 'Satın alma öncesi gayrimenkul kontrolü', citizenship: 'Türk vatandaşlığı', 'residence-permit': "Türkiye'de ikamet izni" },
  de: { 'due-diligence': 'Objektprüfung vor dem Kauf', citizenship: 'Türkische Staatsbürgerschaft', 'residence-permit': 'Aufenthaltserlaubnis in der Türkei' },
  sr: { 'due-diligence': 'Provera nekretnine pre kupovine', citizenship: 'Tursko državljanstvo', 'residence-permit': 'Boravišna dozvola u Turskoj' },
};

/** Полная цепочка крошек категории: Главная → Турция → Алания → Махмутлар → Продажа → Квартиры → Фича. */
export function catCrumbs(lang: Lang, c: Cat & { complexes?: boolean }, last?: string): { label: string; href?: string }[] {
  const d = t(lang);
  const out: { label: string; href?: string }[] = [{ label: d.home, href: `/${lang}/` }];
  const country = countryBySlug(c.country)!;
  out.push({ label: country.name[lang], href: catUrl(lang, { country: c.country }) });
  if (c.city) out.push({ label: cityBySlug(c.city)!.name[lang], href: catUrl(lang, { country: c.country, city: c.city }) });
  if (c.city && c.district) out.push({ label: districtBySlug(c.city, c.district)!.name[lang], href: catUrl(lang, { country: c.country, city: c.city, district: c.district }) });
  const geo = { country: c.country, city: c.city, district: c.district };
  if (c.complexes) {
    out.push({ label: DEAL_WORDS[lang].sale.name, href: catUrl(lang, { ...geo, deal: 'sale' }) });
    out.push({ label: d.nav.complexes, href: catUrl(lang, geo, { complexes: true }) });
  } else if (c.deal) {
    out.push({ label: DEAL_WORDS[lang][c.deal].name, href: catUrl(lang, { ...geo, deal: c.deal }) });
    if (c.type) out.push({ label: TYPE_WORDS[lang][c.type].pl, href: catUrl(lang, { ...geo, deal: c.deal, type: c.type }) });
    if (c.type && c.feature) out.push({ label: FEATURE_LABEL[lang][c.feature], href: catUrl(lang, { ...geo, deal: c.deal, type: c.type, feature: c.feature }) });
  }
  if (last) out.push({ label: last });
  return out;
}
