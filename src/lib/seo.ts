/**
 * Шаблоны метатегов, H1, лидов, SEO-текстов и FAQ посадочных (ТЗ 5.3, 7).
 * Тексты собираются из данных каталога (число объектов, цены, площади, соседние районы),
 * поэтому у каждой категории свой текст. Ручной override — в админке (seo-overrides).
 */
import type { Lang } from '../i18n/config';
import { COUNTRIES, cityBySlug, countryBySlug, districtBySlug, type GeoCity, type GeoCountry, type GeoDistrict } from './geo';
import { COMPLEX_WORDS, DEAL_WORDS, FEATURE_WORDS, PROPERTY_WORDS, TYPE_WORDS, typeWithFeature, type Deal, type FeatureSlug, type TypeSlug } from './segments';
import type { Cat, Stats } from './catalog';
import { moneyL, numL, pluralL, monthYearL } from './format';

export interface Geo { country: GeoCountry; city: GeoCity | null; district: GeoDistrict | null }

export function geoOf(c: { country: string; city?: string | null; district?: string | null }): Geo {
  const country = countryBySlug(c.country) ?? COUNTRIES[0];
  const city = c.city ? cityBySlug(c.city) : null;
  const district = c.city && c.district ? districtBySlug(c.city, c.district) : null;
  return { country, city, district };
}

export const geoIn = (lang: Lang, g: Geo) => (g.district ?? g.city ?? g.country).in[lang];
export const geoName = (lang: Lang, g: Geo) => (g.district ?? g.city ?? g.country).name[lang];
const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const year = () => new Date().getFullYear();

/** Обрезает до 160 знаков по слову; короткое дополняет хвостом. */
function desc(s: string, tail: string): string {
  let out = s.replace(/\s+/g, ' ').trim();
  if (out.length < 120) out = `${out} ${tail}`;
  if (out.length > 160) out = out.slice(0, 159).replace(/[\s,;:—–-]+\S*$/, '') + '…';
  return out;
}

/** Title ≤ 60 знаков: пробуем варианты от полного к короткому. */
function fit(...variants: string[]): string {
  return variants.find((v) => v.length <= 60) ?? variants[variants.length - 1];
}

export interface Meta { title: string; h1: string; description: string; lead: string }

interface Ctx { lang: Lang; cat: Cat; s: Stats; g: Geo }

function objWord(lang: Lang, type: TypeSlug | undefined, n: number) {
  return pluralL(lang, n, type ? TYPE_WORDS[lang][type].n : PROPERTY_WORDS[lang].n);
}

/** H1 категории. */
export function catH1(lang: Lang, cat: Cat): string {
  const g = geoOf(cat);
  const gin = geoIn(lang, g);
  if (!cat.deal) {
    return { ru: `Недвижимость ${gin}`, en: `Property ${gin}`, tr: cap(`${gin} gayrimenkul`), de: `Immobilien ${gin}`, sr: `Nekretnine ${gin}` }[lang];
  }
  const d = DEAL_WORDS[lang][cat.deal].post;
  const { pre, noun, post } = typeWithFeature(lang, cat.type ?? null, cat.feature ?? null);
  const head = (pre ? `${pre} ${noun}` : noun) + (post ? ` ${post}` : '');
  switch (lang) {
    case 'ru':
      return cat.feature && cat.deal === 'sale' ? `${cap(head)} ${gin}` : `${cap(head)} ${gin} ${d}`;
    case 'tr':
      return cap(`${gin} ${pre ? pre + ' ' : ''}${d} ${noun.toLocaleLowerCase('tr')}`);
    case 'sr':
      return `${cap(head)} ${d} ${gin}`;
    default:
      return `${cap(head)} ${d} ${gin}`;
  }
}

export function catMeta(lang: Lang, cat: Cat, s: Stats, page = 1): Meta {
  const g = geoOf(cat);
  const c: Ctx = { lang, cat, s, g };
  const h1 = catH1(lang, cat);
  const m = TEMPLATES[lang](c, h1);
  if (page > 1) {
    const suffix = { ru: ` — страница ${page}`, en: ` — page ${page}`, tr: ` — sayfa ${page}`, de: ` — Seite ${page}`, sr: ` — strana ${page}` }[lang];
    m.title = m.title.replace(/ [—|] Stay Property$/, '') + suffix;
  }
  return { ...m, h1 };
}

type T = (c: Ctx, h1: string) => Omit<Meta, 'h1'>;

const TEMPLATES: Record<Lang, T> = {
  ru: ({ cat, s, g }, h1) => {
    const lang = 'ru';
    const gin = geoIn(lang, g);
    const n = s.n;
    const min = moneyL(lang, s.minPrice);
    const ow = objWord(lang, cat.type, n);
    const tail = 'Лицензированное агентство Stay Property, проверка объектов и сопровождение сделки.';
    if (!cat.deal) {
      const title = g.district
        ? fit(`Недвижимость ${gin}, ${g.city!.name.ru} — цены ${year()} от Stay Property`, `Недвижимость ${gin} — цены ${year()} | Stay Property`, `Недвижимость ${gin} — цены ${year()}`)
        : g.city
          ? fit(`Недвижимость ${gin} (${g.country.name.ru}) — ${n} ${ow} от Stay Property`, `Недвижимость ${gin} — ${n} ${ow} | Stay Property`, `Недвижимость ${gin} — ${n} ${ow}`)
          : fit(`Недвижимость ${gin} — ${n} ${ow} от Stay Property`, `Недвижимость ${gin} — ${n} ${ow}`);
      return {
        title,
        description: desc(`Продажа и аренда недвижимости ${gin}: ${n} проверенных ${pluralL(lang, n, ['объекта', 'объектов', 'объектов'])}${min ? `, цены от ${min}` : ''}. ${g.city ? 'Районы, новостройки, вторичка.' : 'Города, новостройки, вторичка.'}`, tail),
        lead: n ? `${n} ${ow} ${gin}${min ? `, цены от ${min}` : ''}. Квартиры, виллы и новостройки с проверкой документов.` : `Подберём недвижимость ${gin} по вашему запросу.`,
      };
    }
    const dw = DEAL_WORDS.ru[cat.deal];
    const verb = dw.verb;
    const per = cat.deal === 'rent' ? '/мес' : '';
    if (!cat.type) {
      return {
        title: fit(`${verb} недвижимость ${gin} — ${n} ${ow}${min ? ` от ${min}${per}` : ''}`, `${verb} недвижимость ${gin} — ${n} ${ow}`),
        description: desc(`${n} ${ow} ${dw.post} ${gin}: квартиры, виллы, дуплексы${min ? `, цены от ${min}${per}` : ''}. Актуально на ${monthYearL(lang)}.`, tail),
        lead: `${n} ${ow} ${dw.post} ${gin}${min ? ` от ${min}${per}` : ''}.`,
      };
    }
    const tw = TYPE_WORDS.ru[cat.type];
    if (cat.feature) {
      return {
        title: fit(`${h1} — ${cat.deal === 'sale' ? 'купить' : 'снять'}, ${n} ${pluralL(lang, n, ['предложение', 'предложения', 'предложений'])}`, `${h1} — ${n} ${pluralL(lang, n, ['предложение', 'предложения', 'предложений'])}`, h1),
        description: desc(`${h1}: ${n} ${ow}${min ? ` от ${min}${per}` : ''}. Фото, цены и планировки, актуально на ${monthYearL(lang)}.`, tail),
        lead: `${n} ${ow} ${gin}${min ? ` от ${min}${per}` : ''}.`,
      };
    }
    return {
      title: fit(`${verb} ${tw.acc} ${gin} — ${n} ${ow}${min ? ` от ${min}${per}` : ''}`, `${verb} ${tw.acc} ${gin} — ${n} ${ow}`),
      description: desc(`${n} ${ow} ${gin} от собственников и застройщиков.${min ? ` Цены от ${min}${per},` : ''} актуально на ${monthYearL(lang)}.`, tail),
      lead: `${n} ${ow} ${dw.post} ${gin}${min ? ` от ${min}${per}` : ''}.`,
    };
  },

  en: ({ cat, s, g }, h1) => {
    const lang = 'en';
    const gin = geoIn(lang, g);
    const n = s.n;
    const min = moneyL(lang, s.minPrice);
    const ow = objWord(lang, cat.type, n);
    const tail = 'Licensed agency Stay Property: due diligence and full deal support.';
    const per = cat.deal === 'rent' ? '/mo' : '';
    if (!cat.deal) {
      return {
        title: g.district
          ? fit(`Property ${gin}, ${g.city!.name.en} — ${year()} prices | Stay Property`, `Property ${gin} — ${year()} prices | Stay Property`, `Property ${gin} — ${year()} prices`)
          : fit(`Property ${gin}${g.city ? ` (${g.country.name.en})` : ''} — ${n} ${ow} | Stay Property`, `Property ${gin} — ${n} ${ow} | Stay Property`, `Property ${gin} — ${n} ${ow}`),
        description: desc(`Property for sale and rent ${gin}: ${n} verified ${ow}${min ? `, prices from ${min}` : ''}. ${g.city ? 'Districts, new builds and resale.' : 'Cities, new builds and resale.'}`, tail),
        lead: n ? `${n} ${ow} ${gin}${min ? `, prices from ${min}` : ''}. Apartments, villas and new developments with document checks.` : `We will find property ${gin} on request.`,
      };
    }
    const dw = DEAL_WORDS.en[cat.deal];
    return {
      title: fit(`${h1} — ${n} ${ow}${min ? ` from ${min}${per}` : ''}`, `${h1} — ${n} ${ow}`, h1),
      description: desc(`${n} ${ow} ${dw.post} ${gin}${min ? `, prices from ${min}${per}` : ''}. Photos, prices and layouts, updated ${monthYearL(lang)}.`, tail),
      lead: `${n} ${ow} ${dw.post} ${gin}${min ? ` from ${min}${per}` : ''}.`,
    };
  },

  tr: ({ cat, s, g }, h1) => {
    const lang = 'tr';
    const gin = geoIn(lang, g);
    const n = s.n;
    const min = moneyL(lang, s.minPrice);
    const tail = 'Lisanslı emlak ajansı Stay Property: hukuki kontrol ve işlem desteği.';
    const per = cat.deal === 'rent' ? '/ay' : '';
    if (!cat.deal) {
      return {
        title: g.district
          ? fit(`${cap(gin)} gayrimenkul, ${g.city!.name.tr} — ${year()} fiyatları | Stay Property`, `${cap(gin)} gayrimenkul — ${year()} fiyatları`)
          : fit(`${cap(gin)} gayrimenkul — ${n} ilan | Stay Property`, `${cap(gin)} gayrimenkul — ${n} ilan`),
        description: desc(`${cap(gin)} satılık ve kiralık gayrimenkul: ${n} kontrol edilmiş ilan${min ? `, fiyatlar ${min}'dan başlıyor` : ''}. Bölgeler, yeni projeler, ikinci el.`, tail),
        lead: n ? `${cap(gin)} ${n} ilan${min ? `, fiyatlar ${min}'dan başlıyor` : ''}. Belgeleri kontrol edilmiş daireler, villalar ve yeni projeler.` : `${cap(gin)} talebinize uygun gayrimenkul bulalım.`,
      };
    }
    return {
      title: fit(`${h1} — ${n} ilan${min ? `, ${min}${per}'dan` : ''}`, `${h1} — ${n} ilan`, h1),
      description: desc(`${h1}: ${n} ilan${min ? `, fiyatlar ${min}${per}'dan başlıyor` : ''}. Fotoğraflar, fiyatlar ve planlar — ${monthYearL(lang)} itibarıyla güncel.`, tail),
      lead: `${n} ilan${min ? `, fiyatlar ${min}${per}'dan başlıyor` : ''}.`,
    };
  },

  de: ({ cat, s, g }, h1) => {
    const lang = 'de';
    const gin = geoIn(lang, g);
    const n = s.n;
    const min = moneyL(lang, s.minPrice);
    const ow = objWord(lang, cat.type, n);
    const tail = 'Lizenzierte Agentur Stay Property: rechtliche Prüfung und Kaufbegleitung.';
    const per = cat.deal === 'rent' ? '/Monat' : '';
    if (!cat.deal) {
      return {
        title: g.district
          ? fit(`Immobilien ${gin}, ${g.city!.name.de} — Preise ${year()} | Stay Property`, `Immobilien ${gin} — Preise ${year()}`)
          : fit(`Immobilien ${gin} — ${n} ${ow} | Stay Property`, `Immobilien ${gin} — ${n} ${ow}`),
        description: desc(`Immobilien zum Kauf und zur Miete ${gin}: ${n} geprüfte ${ow}${min ? `, Preise ab ${min}` : ''}. Stadtteile, Neubau und Bestand.`, tail),
        lead: n ? `${n} ${ow} ${gin}${min ? `, Preise ab ${min}` : ''}. Wohnungen, Villen und Neubauprojekte mit Dokumentenprüfung.` : `Wir finden Immobilien ${gin} auf Anfrage.`,
      };
    }
    const dw = DEAL_WORDS.de[cat.deal];
    return {
      title: fit(`${h1} — ${n} ${ow}${min ? ` ab ${min}${per}` : ''}`, `${h1} — ${n} ${ow}`, h1),
      description: desc(`${n} ${ow} ${dw.post} ${gin}${min ? `, Preise ab ${min}${per}` : ''}. Fotos, Preise und Grundrisse, Stand ${monthYearL(lang)}.`, tail),
      lead: `${n} ${ow} ${dw.post} ${gin}${min ? ` ab ${min}${per}` : ''}.`,
    };
  },

  sr: ({ cat, s, g }, h1) => {
    const lang = 'sr';
    const gin = geoIn(lang, g);
    const n = s.n;
    const min = moneyL(lang, s.minPrice);
    const ow = objWord(lang, cat.type, n);
    const tail = 'Licencirana agencija Stay Property: pravna provera i podrška pri kupovini.';
    const per = cat.deal === 'rent' ? '/mes.' : '';
    if (!cat.deal) {
      return {
        title: g.district
          ? fit(`Nekretnine ${gin}, ${g.city!.name.sr} — cene ${year()} | Stay Property`, `Nekretnine ${gin} — cene ${year()}`)
          : fit(`Nekretnine ${gin} — ${n} ${ow} | Stay Property`, `Nekretnine ${gin} — ${n} ${ow}`),
        description: desc(`Prodaja i izdavanje nekretnina ${gin}: ${n} proverenih ponuda${min ? `, cene od ${min}` : ''}. Delovi grada, novogradnja i preprodaja.`, tail),
        lead: n ? `${n} ${ow} ${gin}${min ? `, cene od ${min}` : ''}. Stanovi, vile i novogradnja sa proverom dokumenata.` : `Pronaći ćemo nekretninu ${gin} po vašem zahtevu.`,
      };
    }
    const dw = DEAL_WORDS.sr[cat.deal];
    return {
      title: fit(`${h1} — ${n} ${ow}${min ? ` od ${min}${per}` : ''}`, `${h1} — ${n} ${ow}`, h1),
      description: desc(`${n} ${ow} ${dw.post} ${gin}${min ? `, cene od ${min}${per}` : ''}. Fotografije, cene i rasporedi, ažurirano ${monthYearL(lang)}.`, tail),
      lead: `${n} ${ow} ${dw.post} ${gin}${min ? ` od ${min}${per}` : ''}.`,
    };
  },
};

/* ---------- SEO-текст категории (1 500–3 000 знаков) ---------- */

export interface TextCtx {
  lang: Lang;
  cat: Cat;
  s: Stats;
  /** Разбивка по типам: [тип, число]. */
  byType: [TypeSlug, number][];
  /** Соседние районы / города (названия). */
  near: string[];
  /** Ссылки, которые вставляются в текст контекстом. */
  links: { href: string; text: string }[];
}

const a = (l: { href: string; text: string } | undefined) => (l ? `<a href="${l.href}">${l.text}</a>` : '');

export function catText(c: TextCtx): string {
  return TEXTS[c.lang](c).filter(Boolean).map((p) => `<p>${p}</p>`).join('');
}

const pct = (x: number) => Math.round(x * 100);

const TEXTS: Record<Lang, (c: TextCtx) => string[]> = {
  ru: ({ cat, s, byType, near, links }) => {
    const g = geoOf(cat);
    const gin = geoIn('ru', g);
    const what = cat.type ? TYPE_WORDS.ru[cat.type].low : 'недвижимость';
    const types = byType.slice(0, 3).map(([t, n]) => `${TYPE_WORDS.ru[t].low} (${n})`).join(', ');
    const out = [
      `${cat.deal === 'rent' ? 'Аренда' : cat.deal === 'sale' ? 'Покупка' : 'Рынок'} ${cat.type ? TYPE_WORDS.ru[cat.type].n[2] : 'недвижимости'} ${gin} — ${s.n ? `сейчас в каталоге Stay Property ${s.n} ${objWord('ru', cat.type, s.n)}` : 'направление, по которому мы подбираем объекты под запрос'}.${s.minPrice ? ` Цены начинаются от ${moneyL('ru', s.minPrice)}${s.maxPrice && s.maxPrice > s.minPrice ? ` и доходят до ${moneyL('ru', s.maxPrice)}` : ''}${cat.deal === 'rent' ? ' в месяц' : ''}.` : ''}${s.avgPerM2 && cat.deal !== 'rent' ? ` Средняя стоимость квадратного метра по предложениям на сайте — около ${moneyL('ru', s.avgPerM2)}.` : ''}`,
      s.minArea && s.maxArea ? `Площади — от ${numL('ru', s.minArea)} до ${numL('ru', s.maxArea)} м²${types && !cat.type ? `; больше всего предложений среди типов: ${types}` : ''}. ${s.nearSeaShare > 0 ? `${pct(s.nearSeaShare)}% объектов находятся не дальше 500 м от моря.` : 'Большинство объектов расположены во втором-третьем ряду от моря, где цена квадратного метра ниже.'}` : '',
      g.district
        ? `${g.district.name.ru} — один из районов ${g.city!.gen}. ${near.length ? `Рядом — ${near.slice(0, 4).join(', ')}: если в этом районе нет подходящего варианта, сравните цены и предложения у соседей.` : ''} Перед покупкой стоит посмотреть, как далеко объект от моря и центра, какая инфраструктура в шаговой доступности и как развивается район.`
        : g.city
          ? `${g.city.name.ru} — город ${g.country.in.ru}, где Stay Property работает с покупателями из разных стран. ${near.length ? `Самые востребованные районы по числу предложений: ${near.slice(0, 5).join(', ')}.` : ''} У каждого района своя специфика: удалённость от моря, инфраструктура, возраст застройки и ценовой уровень.`
          : `${g.country.name.ru} — одно из направлений Stay Property. ${near.length ? `Больше всего предложений в городах: ${near.slice(0, 5).join(', ')}.` : ''} Мы показываем только объекты, по которым есть актуальная информация от собственников и застройщиков.`,
      cat.deal === 'rent'
        ? `Арендовать ${what} ${gin} можно на длительный срок или на сезон. Условия — депозит, срок договора, оплата коммунальных услуг — согласовываются с владельцем; менеджер Stay Property поможет проверить договор и организует просмотр, в том числе онлайн.`
        : g.country.slug === 'turkey'
          ? `Иностранцы могут покупать недвижимость в Турции и оформлять право собственности — ТАПУ — в кадастровом управлении. До сделки юристы Stay Property проверяют обременения, долги по коммунальным платежам и налогам, разрешения застройщика; подробнее — в разделе ${a(links[0]) || 'о проверке объекта'}. Владение жильём даёт основание подать документы на вид на жительство, а при инвестициях от 400 000 $ — на гражданство.`
          : `Сделку сопровождают юристы-партнёры Stay Property: проверка документов, расчёты и регистрация права собственности. ${a(links[0])}`,
      cat.feature ? FEATURE_TEXT.ru[cat.feature] : cat.type ? TYPE_TEXT.ru[cat.type] : '',
      `${links.length > 1 ? `Смотрите также: ${links.slice(1, 5).map(a).join(', ')}. ` : ''}Если подходящего объекта нет в каталоге, оставьте заявку — менеджеры Stay Property подберут варианты, включая предложения, которых нет на сайте, и проведут онлайн-показ.`,
    ];
    return out;
  },

  en: ({ cat, s, byType, near, links }) => {
    const g = geoOf(cat);
    const gin = geoIn('en', g);
    const what = cat.type ? TYPE_WORDS.en[cat.type].low : 'property';
    const types = byType.slice(0, 3).map(([t, n]) => `${TYPE_WORDS.en[t].low} (${n})`).join(', ');
    return [
      `${cat.deal === 'rent' ? 'Renting' : cat.deal === 'sale' ? 'Buying' : 'The market for'} ${what} ${gin}: ${s.n ? `the Stay Property catalogue currently lists ${s.n} ${objWord('en', cat.type, s.n)}` : 'we select properties on request'}.${s.minPrice ? ` Prices start from ${moneyL('en', s.minPrice)}${s.maxPrice && s.maxPrice > s.minPrice ? ` and go up to ${moneyL('en', s.maxPrice)}` : ''}${cat.deal === 'rent' ? ' per month' : ''}.` : ''}${s.avgPerM2 && cat.deal !== 'rent' ? ` The average asking price per square metre is about ${moneyL('en', s.avgPerM2)}.` : ''}`,
      s.minArea && s.maxArea ? `Sizes range from ${numL('en', s.minArea)} to ${numL('en', s.maxArea)} m²${types && !cat.type ? `; the most common types are ${types}` : ''}. ${s.nearSeaShare > 0 ? `${pct(s.nearSeaShare)}% of listings are within 500 m of the sea.` : 'Most listings are in the second or third line from the sea, where the price per square metre is lower.'}` : '',
      g.district
        ? `${g.district.name.en} is one of the districts of ${g.city!.name.en}. ${near.length ? `Nearby are ${near.slice(0, 4).join(', ')} — if there is no suitable option here, compare prices with the neighbouring districts.` : ''} Before buying, check the distance to the sea and the centre, the infrastructure within walking distance and how the district is developing.`
        : g.city
          ? `${g.city.name.en} is a city ${g.country.in.en} where Stay Property works with buyers from many countries. ${near.length ? `The districts with the most listings are ${near.slice(0, 5).join(', ')}.` : ''} Each district has its own profile: distance to the sea, infrastructure, age of buildings and price level.`
          : `${g.country.name.en} is one of Stay Property’s destinations. ${near.length ? `Most listings are in ${near.slice(0, 5).join(', ')}.` : ''} We only show properties with up-to-date information from owners and developers.`,
      cat.deal === 'rent'
        ? `You can rent ${what} ${gin} long-term or for the season. Deposit, contract term and utilities are agreed with the owner; a Stay Property manager will help check the contract and arrange a viewing, including online.`
        : g.country.slug === 'turkey'
          ? `Foreigners can buy property in Turkey and register ownership — the TAPU title deed — at the land registry. Before the deal, Stay Property lawyers check encumbrances, utility and tax debts and developer permits; see ${a(links[0]) || 'property due diligence'}. Owning a home allows you to apply for a residence permit, and an investment of $400,000 or more allows you to apply for citizenship.`
          : `Stay Property partner lawyers support the deal: document checks, payments and registration of ownership. ${a(links[0])}`,
      cat.feature ? FEATURE_TEXT.en[cat.feature] : cat.type ? TYPE_TEXT.en[cat.type] : '',
      `${links.length > 1 ? `See also: ${links.slice(1, 5).map(a).join(', ')}. ` : ''}If there is no suitable property in the catalogue, send a request — Stay Property managers will select options, including off-market ones, and arrange an online viewing.`,
    ];
  },

  tr: ({ cat, s, byType, near, links }) => {
    const g = geoOf(cat);
    const gin = cap(geoIn('tr', g));
    const what = cat.type ? TYPE_WORDS.tr[cat.type].low : 'gayrimenkul';
    const types = byType.slice(0, 3).map(([t, n]) => `${TYPE_WORDS.tr[t].low} (${n})`).join(', ');
    return [
      `${gin} ${cat.deal === 'rent' ? 'kiralık' : cat.deal === 'sale' ? 'satılık' : ''} ${what}: ${s.n ? `Stay Property kataloğunda şu anda ${s.n} ilan bulunuyor` : 'talebe göre gayrimenkul seçiyoruz'}.${s.minPrice ? ` Fiyatlar ${moneyL('tr', s.minPrice)}'dan başlıyor${s.maxPrice && s.maxPrice > s.minPrice ? ` ve ${moneyL('tr', s.maxPrice)}'ya kadar çıkıyor` : ''}${cat.deal === 'rent' ? ' (aylık)' : ''}.` : ''}${s.avgPerM2 && cat.deal !== 'rent' ? ` İlanlardaki ortalama metrekare fiyatı yaklaşık ${moneyL('tr', s.avgPerM2)}.` : ''}`,
      s.minArea && s.maxArea ? `Alanlar ${numL('tr', s.minArea)} ile ${numL('tr', s.maxArea)} m² arasında${types && !cat.type ? `; en çok ilan bulunan türler: ${types}` : ''}. ${s.nearSeaShare > 0 ? `İlanların %${pct(s.nearSeaShare)}'i denize 500 metreden yakın.` : 'İlanların çoğu, metrekare fiyatının daha düşük olduğu ikinci ve üçüncü sırada yer alıyor.'}` : '',
      g.district
        ? `${g.district.name.tr}, ${g.city!.name.tr} bölgelerinden biridir. ${near.length ? `Yakın bölgeler: ${near.slice(0, 4).join(', ')}. Burada uygun seçenek yoksa komşu bölgelerdeki fiyatları karşılaştırın.` : ''} Satın almadan önce denize ve merkeze uzaklığı, yürüme mesafesindeki altyapıyı ve bölgenin gelişimini değerlendirin.`
        : g.city
          ? `${g.city.name.tr}, Stay Property'nin farklı ülkelerden alıcılarla çalıştığı bir şehirdir. ${near.length ? `En çok ilan bulunan bölgeler: ${near.slice(0, 5).join(', ')}.` : ''} Her bölgenin denize uzaklık, altyapı, yapı yaşı ve fiyat seviyesi açısından kendine özgü bir profili vardır.`
          : `${g.country.name.tr}, Stay Property'nin çalıştığı ülkelerden biridir. ${near.length ? `En çok ilan bulunan şehirler: ${near.slice(0, 5).join(', ')}.` : ''} Yalnızca mal sahipleri ve müteahhitlerden güncel bilgisi olan ilanları gösteriyoruz.`,
      cat.deal === 'rent'
        ? `${gin} ${what} uzun dönem veya sezonluk kiralanabilir. Depozito, sözleşme süresi ve faturalar mal sahibiyle kararlaştırılır; Stay Property danışmanı sözleşmenin kontrolüne yardım eder ve online dahil gösterim ayarlar.`
        : g.country.slug === 'turkey'
          ? `Yabancılar Türkiye'de gayrimenkul satın alabilir ve tapu müdürlüğünde mülkiyetlerini tescil ettirebilir. İşlemden önce Stay Property avukatları ipotek ve şerhleri, aidat ve vergi borçlarını, müteahhit izinlerini kontrol eder; ayrıntılar: ${a(links[0]) || 'gayrimenkul kontrolü'}. Konut sahipliği ikamet izni başvurusuna, 400.000 $ ve üzeri yatırım ise vatandaşlık başvurusuna imkân tanır.`
          : `İşlemi Stay Property'nin partner avukatları yürütür: belge kontrolü, ödemeler ve mülkiyet tescili. ${a(links[0])}`,
      cat.feature ? FEATURE_TEXT.tr[cat.feature] : cat.type ? TYPE_TEXT.tr[cat.type] : '',
      `${links.length > 1 ? `Ayrıca bakın: ${links.slice(1, 5).map(a).join(', ')}. ` : ''}Katalogda uygun ilan yoksa talep bırakın — Stay Property danışmanları sitede olmayan seçenekler dahil size uygun ilanları seçer ve online gösterim düzenler.`,
    ];
  },

  de: ({ cat, s, byType, near, links }) => {
    const g = geoOf(cat);
    const gin = geoIn('de', g);
    const what = cat.type ? TYPE_WORDS.de[cat.type].low : 'Immobilien';
    const types = byType.slice(0, 3).map(([t, n]) => `${TYPE_WORDS.de[t].low} (${n})`).join(', ');
    return [
      `${what} ${cat.deal === 'rent' ? 'zur Miete' : cat.deal === 'sale' ? 'zum Kauf' : ''} ${gin}: ${s.n ? `Im Katalog von Stay Property finden Sie derzeit ${s.n} ${objWord('de', cat.type, s.n)}` : 'wir suchen Objekte auf Anfrage'}.${s.minPrice ? ` Die Preise beginnen bei ${moneyL('de', s.minPrice)}${s.maxPrice && s.maxPrice > s.minPrice ? ` und reichen bis ${moneyL('de', s.maxPrice)}` : ''}${cat.deal === 'rent' ? ' pro Monat' : ''}.` : ''}${s.avgPerM2 && cat.deal !== 'rent' ? ` Der durchschnittliche Angebotspreis liegt bei etwa ${moneyL('de', s.avgPerM2)} pro Quadratmeter.` : ''}`,
      s.minArea && s.maxArea ? `Die Flächen reichen von ${numL('de', s.minArea)} bis ${numL('de', s.maxArea)} m²${types && !cat.type ? `; am häufigsten angeboten: ${types}` : ''}. ${s.nearSeaShare > 0 ? `${pct(s.nearSeaShare)} % der Angebote liegen höchstens 500 m vom Meer entfernt.` : 'Die meisten Angebote liegen in zweiter oder dritter Reihe, wo der Quadratmeterpreis niedriger ist.'}` : '',
      g.district
        ? `${g.district.name.de} ist ein Stadtteil von ${g.city!.name.de}. ${near.length ? `In der Nähe liegen ${near.slice(0, 4).join(', ')} – wenn hier nichts Passendes dabei ist, vergleichen Sie die Preise in den Nachbarstadtteilen.` : ''} Prüfen Sie vor dem Kauf die Entfernung zu Meer und Zentrum, die Infrastruktur in Gehweite und die Entwicklung des Viertels.`
        : g.city
          ? `${g.city.name.de} ist eine Stadt ${g.country.in.de}, in der Stay Property mit Käufern aus vielen Ländern arbeitet. ${near.length ? `Die meisten Angebote gibt es in ${near.slice(0, 5).join(', ')}.` : ''} Jeder Stadtteil hat sein eigenes Profil: Entfernung zum Meer, Infrastruktur, Alter der Bebauung und Preisniveau.`
          : `${g.country.name.de} ist eines der Ziele von Stay Property. ${near.length ? `Die meisten Angebote gibt es in ${near.slice(0, 5).join(', ')}.` : ''} Wir zeigen nur Objekte mit aktuellen Informationen von Eigentümern und Bauträgern.`,
      cat.deal === 'rent'
        ? `${what} ${gin} können langfristig oder für die Saison gemietet werden. Kaution, Vertragsdauer und Nebenkosten werden mit dem Eigentümer vereinbart; ein Berater von Stay Property hilft bei der Vertragsprüfung und organisiert eine Besichtigung, auch online.`
        : g.country.slug === 'turkey'
          ? `Ausländer können in der Türkei Immobilien kaufen und das Eigentum im Grundbuchamt (TAPU) eintragen lassen. Vor dem Kauf prüfen die Juristen von Stay Property Belastungen, Schulden für Nebenkosten und Steuern sowie Genehmigungen des Bauträgers; siehe ${a(links[0]) || 'Objektprüfung'}. Wohneigentum berechtigt zum Antrag auf eine Aufenthaltserlaubnis, eine Investition ab 400.000 $ zum Antrag auf die Staatsbürgerschaft.`
          : `Partnerjuristen von Stay Property begleiten den Kauf: Dokumentenprüfung, Zahlungen und Eintragung des Eigentums. ${a(links[0])}`,
      cat.feature ? FEATURE_TEXT.de[cat.feature] : cat.type ? TYPE_TEXT.de[cat.type] : '',
      `${links.length > 1 ? `Siehe auch: ${links.slice(1, 5).map(a).join(', ')}. ` : ''}Wenn im Katalog nichts Passendes dabei ist, senden Sie eine Anfrage – die Berater von Stay Property stellen Ihnen eine Auswahl zusammen, auch mit Objekten, die nicht auf der Website stehen, und organisieren eine Online-Besichtigung.`,
    ];
  },

  sr: ({ cat, s, byType, near, links }) => {
    const g = geoOf(cat);
    const gin = geoIn('sr', g);
    const what = cat.type ? TYPE_WORDS.sr[cat.type].low : 'nekretnine';
    const types = byType.slice(0, 3).map(([t, n]) => `${TYPE_WORDS.sr[t].low} (${n})`).join(', ');
    return [
      `${cap(what)} ${cat.deal === 'rent' ? 'za izdavanje' : cat.deal === 'sale' ? 'na prodaju' : ''} ${gin}: ${s.n ? `u katalogu Stay Property trenutno je ${s.n} ${objWord('sr', cat.type, s.n)}` : 'nekretnine biramo po zahtevu'}.${s.minPrice ? ` Cene počinju od ${moneyL('sr', s.minPrice)}${s.maxPrice && s.maxPrice > s.minPrice ? ` i idu do ${moneyL('sr', s.maxPrice)}` : ''}${cat.deal === 'rent' ? ' mesečno' : ''}.` : ''}${s.avgPerM2 && cat.deal !== 'rent' ? ` Prosečna tražena cena kvadratnog metra je oko ${moneyL('sr', s.avgPerM2)}.` : ''}`,
      s.minArea && s.maxArea ? `Površine su od ${numL('sr', s.minArea)} do ${numL('sr', s.maxArea)} m²${types && !cat.type ? `; najviše ponuda: ${types}` : ''}. ${s.nearSeaShare > 0 ? `${pct(s.nearSeaShare)}% ponuda nalazi se na najviše 500 m od mora.` : 'Većina ponuda je u drugom ili trećem redu od mora, gde je cena kvadrata niža.'}` : '',
      g.district
        ? `${g.district.name.sr} je jedan od delova grada ${g.city!.name.sr}. ${near.length ? `U blizini su ${near.slice(0, 4).join(', ')} – ako ovde nema odgovarajuće opcije, uporedite cene u susednim delovima.` : ''} Pre kupovine proverite udaljenost od mora i centra, infrastrukturu u blizini i razvoj kvarta.`
        : g.city
          ? `${g.city.name.sr} je grad ${g.country.in.sr} u kome Stay Property radi sa kupcima iz mnogih zemalja. ${near.length ? `Najviše ponuda ima u delovima: ${near.slice(0, 5).join(', ')}.` : ''} Svaki deo grada ima svoj profil: udaljenost od mora, infrastruktura, starost gradnje i nivo cena.`
          : `${g.country.name.sr} je jedna od destinacija Stay Property. ${near.length ? `Najviše ponuda ima u gradovima: ${near.slice(0, 5).join(', ')}.` : ''} Prikazujemo samo nekretnine sa aktuelnim informacijama od vlasnika i investitora.`,
      cat.deal === 'rent'
        ? `${cap(what)} ${gin} mogu se iznajmiti dugoročno ili sezonski. Depozit, trajanje ugovora i režije dogovaraju se sa vlasnikom; menadžer Stay Property pomoći će da proverite ugovor i organizovaće razgledanje, i onlajn.`
        : g.country.slug === 'turkey'
          ? `Stranci mogu da kupe nekretninu u Turskoj i upišu vlasništvo – tapiju (TAPU) – u katastru. Pre kupovine pravnici Stay Property proveravaju terete, dugove za režije i poreze i dozvole investitora; više: ${a(links[0]) || 'provera nekretnine'}. Vlasništvo nad stanom daje osnov za zahtev za boravišnu dozvolu, a investicija od 400.000 $ i više – za državljanstvo.`
          : `Partnerski pravnici Stay Property prate kupovinu: proveru dokumenata, plaćanja i upis vlasništva. ${a(links[0])}`,
      cat.feature ? FEATURE_TEXT.sr[cat.feature] : cat.type ? TYPE_TEXT.sr[cat.type] : '',
      `${links.length > 1 ? `Pogledajte i: ${links.slice(1, 5).map(a).join(', ')}. ` : ''}Ako u katalogu nema odgovarajuće nekretnine, pošaljite upit – menadžeri Stay Property izabraće opcije, uključujući one kojih nema na sajtu, i organizovati onlajn razgledanje.`,
    ];
  },
};

/** Абзац о сегменте: почему люди ищут именно это. */
const FEATURE_TEXT: Record<Lang, Record<FeatureSlug, string>> = {
  ru: {
    'sea-view': 'Вид на море чаще всего бывает с верхних этажей и в домах на возвышенности. Такие квартиры дороже аналогов без вида, зато лучше сдаются и быстрее продаются.',
    'near-sea': 'В подборку попадают объекты не дальше 500 м от моря: до пляжа можно дойти пешком. Это самый ликвидный сегмент — на него стабильный спрос и у покупателей, и у арендаторов.',
    'first-line': 'Первая линия — объекты в первом ряду от моря или в пределах 150 м от пляжа. Предложений немного, поэтому цены выше, а хорошие варианты уходят быстро.',
    citizenship: 'Гражданство Турции можно получить при покупке недвижимости от 400 000 $ с обязательством не продавать её три года. Сумму можно набрать несколькими объектами; оценку стоимости делает лицензированный эксперт.',
    'residence-permit': 'Владение жильём в Турции даёт основание подать на краткосрочный вид на жительство. Требования к стоимости объекта и доступность районов для ВНЖ меняются — актуальные правила уточняйте у юриста Stay Property.',
    installment: 'Рассрочку дают застройщики на этапе строительства: первый взнос и график платежей до сдачи дома, часто без процентов. Условия зависят от проекта.',
    'from-developer': 'Покупка напрямую у застройщика — это цены этапа строительства, рассрочка и выбор планировки. Мы проверяем разрешения на строительство и репутацию девелопера.',
    resale: 'Вторичный рынок — готовые квартиры и дома с историей: можно заселиться сразу после сделки, а реальное состояние дома видно до покупки.',
    furnished: 'Объекты с мебелью и техникой готовы к проживанию и сдаче в аренду — не нужно тратить время на обустройство.',
    'with-pool': 'Бассейн — стандарт для комплексов на побережье; у вилл бывает и частный. Наличие бассейна повышает арендный доход.',
    luxury: 'Элитный сегмент — просторные планировки, виды, премиальная инфраструктура комплекса и высокий класс отделки.',
    cheap: 'Недорогие предложения — компактные квартиры и объекты дальше от моря. Это вход на рынок с минимальным бюджетом.',
    investment: 'Инвестиционные объекты выбирают под арендный доход и рост стоимости: важны ликвидность района, близость моря и управление сдачей.',
    new: 'Новостройки — квартиры в строящихся и недавно сданных комплексах с современной инфраструктурой и гарантией застройщика.',
    '1-bedroom': 'Планировка 1+1 — гостиная с кухней и одна спальня. Самый востребованный формат для отдыха и сдачи в аренду.',
    '2-bedrooms': 'Планировка 2+1 — гостиная и две спальни: удобно для семьи и для долгосрочной аренды.',
    '3-bedrooms': 'Планировка 3+1 — гостиная и три спальни, обычно с двумя санузлами. Подходит для большой семьи.',
    '4-bedrooms': 'Планировки 4+1 и больше — просторные квартиры, дуплексы и виллы для большой семьи или проживания круглый год.',
    'price-to-100000': 'Подборка с бюджетом до 100 000 € — компактные квартиры и студии, часто на этапе строительства или во втором ряду от моря.',
    'price-to-150000': 'До 150 000 € — квартиры 1+1 и 2+1 в комплексах с инфраструктурой, в том числе в рассрочку от застройщика.',
    'price-to-200000': 'До 200 000 € — просторные квартиры 2+1 и некоторые объекты ближе к морю.',
  },
  en: {
    'sea-view': 'Sea views usually come with upper floors and buildings on higher ground. Such apartments cost more, but they rent out better and sell faster.',
    'near-sea': 'This selection includes properties within 500 m of the sea, so the beach is within walking distance. It is the most liquid segment, in steady demand from buyers and tenants.',
    'first-line': 'First line means properties in the first row from the sea or within 150 m of the beach. Supply is limited, so prices are higher and good options sell quickly.',
    citizenship: 'Turkish citizenship can be obtained by buying property worth $400,000 or more and keeping it for three years. The amount can be made up of several properties; the value is confirmed by a licensed appraiser.',
    'residence-permit': 'Owning a home in Turkey is a basis for applying for a short-term residence permit. Value requirements and the districts open to permits change, so check the current rules with a Stay Property lawyer.',
    installment: 'Developers offer installment plans during construction: a down payment and a schedule until completion, often interest-free. Terms depend on the project.',
    'from-developer': 'Buying directly from the developer means construction-stage prices, installment plans and a choice of layouts. We check building permits and the developer’s track record.',
    resale: 'Resale properties are ready homes with a history: you can move in right after the deal and see the actual condition before buying.',
    furnished: 'Furnished properties with appliances are ready to live in or rent out — no time spent on furnishing.',
    'with-pool': 'A pool is standard for coastal complexes; villas often have a private one. A pool increases rental income.',
    luxury: 'The luxury segment offers spacious layouts, views, premium complex facilities and high-end finishing.',
    cheap: 'Budget options are compact apartments and properties further from the sea — an entry to the market with a minimal budget.',
    investment: 'Investment properties are chosen for rental income and capital growth: district liquidity, proximity to the sea and rental management matter most.',
    new: 'New builds are apartments in complexes under construction or recently completed, with modern facilities and a developer warranty.',
    '1-bedroom': 'A 1+1 layout has a living room with kitchen and one bedroom — the most popular format for holidays and rentals.',
    '2-bedrooms': 'A 2+1 layout has a living room and two bedrooms — convenient for a family and for long-term rentals.',
    '3-bedrooms': 'A 3+1 layout has a living room and three bedrooms, usually with two bathrooms — suitable for a large family.',
    '4-bedrooms': 'Layouts of 4+1 and more are spacious apartments, duplexes and villas for a large family or year-round living.',
    'price-to-100000': 'Properties under €100,000 are compact apartments and studios, often at the construction stage or in the second line from the sea.',
    'price-to-150000': 'Under €150,000 you will find 1+1 and 2+1 apartments in complexes with facilities, including developer installment plans.',
    'price-to-200000': 'Under €200,000 there are spacious 2+1 apartments and some properties closer to the sea.',
  },
  tr: {
    'sea-view': 'Deniz manzarası genellikle üst katlarda ve yüksek konumdaki binalarda bulunur. Bu daireler daha pahalıdır ancak daha kolay kiralanır ve daha hızlı satılır.',
    'near-sea': 'Bu seçkide denize en fazla 500 m uzaklıktaki ilanlar yer alır; plaja yürüyerek gidilebilir. Alıcılar ve kiracılar arasında talebi en istikrarlı segmenttir.',
    'first-line': 'Denize sıfır, denizden ilk sıradaki veya plaja 150 m mesafedeki ilanlar demektir. Arz sınırlı olduğu için fiyatlar yüksektir ve iyi seçenekler hızla satılır.',
    citizenship: 'Türk vatandaşlığı, 400.000 $ ve üzeri değerde gayrimenkul alıp üç yıl satmama taahhüdüyle elde edilebilir. Tutar birden fazla mülkle tamamlanabilir; değeri lisanslı eksper belirler.',
    'residence-permit': "Türkiye'de konut sahibi olmak kısa dönem ikamet izni başvurusu için gerekçedir. Değer şartları ve ikamete açık bölgeler değişebilir; güncel kuralları Stay Property avukatına danışın.",
    installment: 'Müteahhitler inşaat aşamasında taksit imkânı sunar: peşinat ve teslime kadar ödeme planı, çoğu zaman faizsiz. Koşullar projeye göre değişir.',
    'from-developer': 'Doğrudan müteahhitten almak inşaat aşaması fiyatları, taksit ve daire tipi seçimi demektir. Yapı ruhsatlarını ve müteahhidin geçmişini kontrol ediyoruz.',
    resale: 'İkinci el gayrimenkuller hazır konutlardır: işlemden hemen sonra taşınabilir, binanın gerçek durumunu önceden görebilirsiniz.',
    furnished: 'Eşyalı ve beyaz eşyalı daireler oturmaya ve kiraya vermeye hazırdır.',
    'with-pool': 'Sahildeki sitelerde havuz standarttır; villalarda özel havuz da olabilir. Havuz kira gelirini artırır.',
    luxury: 'Lüks segment geniş planlar, manzara, premium site olanakları ve yüksek kaliteli iç mekân sunar.',
    cheap: 'Uygun fiyatlı seçenekler kompakt daireler ve denize daha uzak ilanlardır — minimum bütçeyle piyasaya giriş.',
    investment: 'Yatırımlık gayrimenkuller kira geliri ve değer artışı için seçilir: bölgenin likiditesi, denize yakınlık ve kiralama yönetimi önemlidir.',
    new: 'Yeni projeler, modern olanaklara ve müteahhit garantisine sahip, inşaatı süren veya yeni teslim edilmiş sitelerdeki dairelerdir.',
    '1-bedroom': '1+1 daire salon-mutfak ve bir yatak odasından oluşur; tatil ve kiralama için en çok aranan tiptir.',
    '2-bedrooms': '2+1 daire salon ve iki yatak odasından oluşur; aile ve uzun dönem kiralama için uygundur.',
    '3-bedrooms': '3+1 daire salon ve üç yatak odasından oluşur, genellikle iki banyoludur; kalabalık aileler için uygundur.',
    '4-bedrooms': '4+1 ve üzeri; kalabalık aileler veya yıl boyu yaşam için geniş daireler, dubleksler ve villalardır.',
    'price-to-100000': '100.000 € altındaki ilanlar kompakt daireler ve stüdyolardır; çoğu inşaat aşamasında veya denizden ikinci sıradadır.',
    'price-to-150000': '150.000 € altında, müteahhit taksitli seçenekler dahil olanaklı sitelerde 1+1 ve 2+1 daireler bulunur.',
    'price-to-200000': '200.000 € altında geniş 2+1 daireler ve denize daha yakın bazı ilanlar yer alır.',
  },
  de: {
    'sea-view': 'Meerblick gibt es meist in den oberen Etagen und bei Gebäuden in erhöhter Lage. Solche Wohnungen kosten mehr, lassen sich aber besser vermieten und schneller verkaufen.',
    'near-sea': 'Diese Auswahl umfasst Objekte höchstens 500 m vom Meer entfernt – der Strand ist zu Fuß erreichbar. Das ist das liquideste Segment mit stabiler Nachfrage bei Käufern und Mietern.',
    'first-line': 'Erste Meereslinie bedeutet Objekte in der ersten Reihe oder höchstens 150 m vom Strand. Das Angebot ist knapp, die Preise sind höher, gute Objekte sind schnell verkauft.',
    citizenship: 'Die türkische Staatsbürgerschaft ist beim Kauf von Immobilien ab 400.000 $ möglich, wenn diese drei Jahre gehalten werden. Der Betrag kann aus mehreren Objekten bestehen; den Wert bestätigt ein lizenzierter Gutachter.',
    'residence-permit': 'Wohneigentum in der Türkei ist eine Grundlage für den Antrag auf eine kurzfristige Aufenthaltserlaubnis. Wertgrenzen und zugelassene Stadtteile ändern sich – fragen Sie einen Juristen von Stay Property nach den aktuellen Regeln.',
    installment: 'Bauträger bieten während der Bauphase Ratenzahlung an: Anzahlung und Zahlungsplan bis zur Fertigstellung, oft zinsfrei. Die Bedingungen hängen vom Projekt ab.',
    'from-developer': 'Der Kauf direkt vom Bauträger bedeutet Preise der Bauphase, Ratenzahlung und freie Grundrisswahl. Wir prüfen Baugenehmigungen und die Referenzen des Bauträgers.',
    resale: 'Bestandsimmobilien sind fertige Wohnungen und Häuser: Sie können direkt nach dem Kauf einziehen und den Zustand vorher sehen.',
    furnished: 'Möblierte Objekte mit Haushaltsgeräten sind sofort bewohnbar oder vermietbar.',
    'with-pool': 'Ein Pool ist bei Anlagen an der Küste Standard, Villen haben oft einen eigenen. Ein Pool steigert die Mieteinnahmen.',
    luxury: 'Das Luxussegment bietet großzügige Grundrisse, Aussicht, Premium-Ausstattung der Anlage und hochwertigen Ausbau.',
    cheap: 'Günstige Angebote sind kompakte Wohnungen und Objekte weiter vom Meer – der Einstieg mit kleinem Budget.',
    investment: 'Kapitalanlagen werden nach Mietrendite und Wertsteigerung gewählt: Lage, Meeresnähe und Vermietungsmanagement sind entscheidend.',
    new: 'Neubau sind Wohnungen in Anlagen im Bau oder kürzlich fertiggestellt, mit moderner Ausstattung und Gewährleistung des Bauträgers.',
    '1-bedroom': 'Der Grundriss 1+1 hat Wohnzimmer mit Küche und ein Schlafzimmer – das gefragteste Format für Urlaub und Vermietung.',
    '2-bedrooms': 'Der Grundriss 2+1 hat Wohnzimmer und zwei Schlafzimmer – praktisch für Familien und Langzeitmiete.',
    '3-bedrooms': 'Der Grundriss 3+1 hat Wohnzimmer und drei Schlafzimmer, meist mit zwei Bädern – für große Familien.',
    '4-bedrooms': 'Grundrisse ab 4+1 sind geräumige Wohnungen, Maisonetten und Villen für große Familien oder ganzjähriges Wohnen.',
    'price-to-100000': 'Objekte bis 100.000 € sind kompakte Wohnungen und Studios, oft in der Bauphase oder in zweiter Reihe.',
    'price-to-150000': 'Bis 150.000 € finden Sie 1+1- und 2+1-Wohnungen in Anlagen mit Ausstattung, auch mit Ratenzahlung beim Bauträger.',
    'price-to-200000': 'Bis 200.000 € gibt es geräumige 2+1-Wohnungen und einige Objekte näher am Meer.',
  },
  sr: {
    'sea-view': 'Pogled na more najčešće imaju viši spratovi i zgrade na uzvišenju. Takvi stanovi su skuplji, ali se lakše izdaju i brže prodaju.',
    'near-sea': 'U izboru su nekretnine na najviše 500 m od mora – do plaže se stiže pešice. To je najlikvidniji segment sa stabilnom potražnjom.',
    'first-line': 'Prvi red do mora znači nekretnine u prvom redu ili na najviše 150 m od plaže. Ponuda je ograničena, pa su cene više, a dobre opcije se brzo prodaju.',
    citizenship: 'Tursko državljanstvo može se dobiti kupovinom nekretnine od 400.000 $ uz obavezu da se ne proda tri godine. Iznos može činiti više nekretnina; vrednost potvrđuje licencirani procenitelj.',
    'residence-permit': 'Vlasništvo nad stanom u Turskoj osnov je za zahtev za kratkoročnu boravišnu dozvolu. Uslovi o vrednosti i dozvoljeni delovi grada se menjaju – aktuelna pravila proverite kod pravnika Stay Property.',
    installment: 'Investitori nude plaćanje na rate tokom gradnje: učešće i plan otplate do završetka, često bez kamate. Uslovi zavise od projekta.',
    'from-developer': 'Kupovina direktno od investitora znači cene iz faze gradnje, rate i izbor rasporeda. Proveravamo građevinske dozvole i reputaciju investitora.',
    resale: 'Preprodaja su gotovi stanovi i kuće: možete se useliti odmah posle kupovine i videti stvarno stanje pre kupovine.',
    furnished: 'Nekretnine sa nameštajem i aparatima spremne su za život i izdavanje.',
    'with-pool': 'Bazen je standard u kompleksima na obali, a vile često imaju i privatni. Bazen povećava prihod od izdavanja.',
    luxury: 'Luksuzni segment nudi prostrane rasporede, poglede, vrhunske sadržaje kompleksa i kvalitetnu završnu obradu.',
    cheap: 'Povoljne ponude su kompaktni stanovi i nekretnine dalje od mora – ulazak na tržište sa minimalnim budžetom.',
    investment: 'Investicione nekretnine biraju se zbog prihoda od izdavanja i rasta vrednosti: važni su likvidnost lokacije, blizina mora i upravljanje izdavanjem.',
    new: 'Novogradnja su stanovi u kompleksima u izgradnji ili nedavno završenim, sa savremenim sadržajima i garancijom investitora.',
    '1-bedroom': 'Raspored 1+1 ima dnevnu sobu sa kuhinjom i jednu spavaću sobu – najtraženiji format za odmor i izdavanje.',
    '2-bedrooms': 'Raspored 2+1 ima dnevnu sobu i dve spavaće sobe – pogodno za porodicu i dugoročno izdavanje.',
    '3-bedrooms': 'Raspored 3+1 ima dnevnu sobu i tri spavaće sobe, obično sa dva kupatila – za veliku porodicu.',
    '4-bedrooms': 'Rasporedi 4+1 i veći su prostrani stanovi, dupleksi i vile za veliku porodicu ili život tokom cele godine.',
    'price-to-100000': 'Nekretnine do 100.000 € su kompaktni stanovi i studiji, često u fazi gradnje ili u drugom redu od mora.',
    'price-to-150000': 'Do 150.000 € nalaze se stanovi 1+1 i 2+1 u kompleksima sa sadržajima, uključujući rate kod investitora.',
    'price-to-200000': 'Do 200.000 € ima prostranih stanova 2+1 i nekih nekretnina bliže moru.',
  },
};

const TYPE_TEXT: Record<Lang, Record<TypeSlug, string>> = {
  ru: {
    apartments: 'Квартиры — самый массовый формат: от студий и 1+1 до просторных 3+1 в комплексах с бассейном, фитнесом и охраной. Ежемесячные платежи за обслуживание комплекса (айдат) зависят от инфраструктуры.',
    villas: 'Виллы — отдельные дома с участком, часто с частным бассейном и видом. Подходят для жизни круглый год и для премиальной аренды.',
    penthouses: 'Пентхаусы — квартиры на последних этажах с террасами и панорамными видами; предложение ограничено, поэтому цены выше среднего по комплексу.',
    duplexes: 'Дуплексы — двухуровневые квартиры: на одном этаже гостиная и кухня, на другом спальни. Хороший вариант для семьи, которой нужно больше пространства.',
    townhouses: 'Таунхаусы — дома в ряд с отдельным входом и небольшим участком: компромисс между квартирой и виллой.',
    commercial: 'Коммерческие помещения — магазины, офисы и помещения на первых этажах комплексов; доход зависит от трафика и локации.',
    land: 'Земельные участки покупают под строительство виллы или инвестиционного проекта; до сделки важно проверить зонирование и разрешённое использование.',
  },
  en: {
    apartments: 'Apartments are the most common format, from studios and 1+1 to spacious 3+1 in complexes with a pool, gym and security. Monthly maintenance fees (aidat) depend on the facilities.',
    villas: 'Villas are detached houses with a plot, often with a private pool and views — suitable for year-round living and premium rentals.',
    penthouses: 'Penthouses are top-floor apartments with terraces and panoramic views; supply is limited, so prices are above the complex average.',
    duplexes: 'Duplexes are two-level apartments with the living room and kitchen on one floor and bedrooms on the other — a good choice for families who need more space.',
    townhouses: 'Townhouses are terraced houses with a private entrance and a small plot — a compromise between an apartment and a villa.',
    commercial: 'Commercial properties are shops, offices and ground-floor premises in complexes; income depends on footfall and location.',
    land: 'Land plots are bought to build a villa or an investment project; zoning and permitted use must be checked before the deal.',
  },
  tr: {
    apartments: 'Daireler en yaygın formattır: stüdyo ve 1+1’den havuzlu, spor salonlu ve güvenlikli sitelerdeki geniş 3+1’lere kadar. Aylık aidat sitenin olanaklarına bağlıdır.',
    villas: 'Villalar arsalı müstakil evlerdir, çoğu zaman özel havuzlu ve manzaralıdır; yıl boyu yaşam ve premium kiralama için uygundur.',
    penthouses: 'Penthouse daireler teraslı ve panoramik manzaralı en üst kat daireleridir; arz sınırlı olduğu için fiyatlar site ortalamasının üzerindedir.',
    duplexes: 'Dubleksler iki katlı dairelerdir: bir katta salon ve mutfak, diğerinde yatak odaları. Daha fazla alana ihtiyaç duyan aileler için iyi bir seçenek.',
    townhouses: 'Sıra evler ayrı girişli ve küçük bahçeli evlerdir; daire ile villa arasında bir seçenektir.',
    commercial: 'Ticari gayrimenkuller dükkânlar, ofisler ve sitelerin zemin kat birimleridir; gelir, yaya trafiği ve konuma bağlıdır.',
    land: 'Arsalar villa veya yatırım projesi inşa etmek için alınır; işlemden önce imar durumu kontrol edilmelidir.',
  },
  de: {
    apartments: 'Wohnungen sind das häufigste Format – vom Studio und 1+1 bis zu geräumigen 3+1 in Anlagen mit Pool, Fitness und Sicherheitsdienst. Die monatlichen Nebenkosten (Aidat) hängen von der Ausstattung ab.',
    villas: 'Villen sind freistehende Häuser mit Grundstück, oft mit eigenem Pool und Aussicht – für ganzjähriges Wohnen und Premium-Vermietung.',
    penthouses: 'Penthäuser sind Wohnungen in den obersten Etagen mit Terrassen und Panoramablick; das Angebot ist knapp, die Preise liegen über dem Durchschnitt der Anlage.',
    duplexes: 'Maisonetten sind Wohnungen auf zwei Ebenen: Wohnzimmer und Küche unten, Schlafzimmer oben – ideal für Familien, die mehr Platz brauchen.',
    townhouses: 'Reihenhäuser haben einen eigenen Eingang und einen kleinen Garten – ein Kompromiss zwischen Wohnung und Villa.',
    commercial: 'Gewerbeimmobilien sind Läden, Büros und Erdgeschossflächen in Anlagen; die Rendite hängt von Lage und Laufkundschaft ab.',
    land: 'Grundstücke werden für den Bau einer Villa oder eines Investmentprojekts gekauft; Bebauungsplan und zulässige Nutzung müssen vorher geprüft werden.',
  },
  sr: {
    apartments: 'Stanovi su najčešći format – od studija i 1+1 do prostranih 3+1 u kompleksima sa bazenom, teretanom i obezbeđenjem. Mesečni troškovi održavanja (aidat) zavise od sadržaja.',
    villas: 'Vile su samostalne kuće sa placem, često sa privatnim bazenom i pogledom – za život tokom cele godine i premium izdavanje.',
    penthouses: 'Penthausi su stanovi na poslednjim spratovima sa terasama i panoramskim pogledom; ponuda je ograničena, pa su cene iznad proseka kompleksa.',
    duplexes: 'Dupleksi su stanovi na dva nivoa: dnevni boravak i kuhinja na jednom, spavaće sobe na drugom – dobar izbor za porodicu kojoj treba više prostora.',
    townhouses: 'Kuće u nizu imaju poseban ulaz i malo dvorište – kompromis između stana i vile.',
    commercial: 'Poslovni prostori su prodavnice, kancelarije i lokali u prizemlju kompleksa; prihod zavisi od prometa i lokacije.',
    land: 'Placevi se kupuju za gradnju vile ili investicionog projekta; pre kupovine treba proveriti namenu zemljišta.',
  },
};

/* ---------- FAQ категории ---------- */

export interface Faq { q: string; a: string }

export function catFaq(lang: Lang, cat: Cat, s: Stats): Faq[] {
  const g = geoOf(cat);
  const gin = geoIn(lang, g);
  const tr = g.country.slug === 'turkey';
  const min = moneyL(lang, s.minPrice);
  const max = moneyL(lang, s.maxPrice);
  const avg = moneyL(lang, s.avgPerM2);
  const what = cat.type ? TYPE_WORDS[lang][cat.type].low : PROPERTY_WORDS[lang].low;
  const rent = cat.deal === 'rent';
  const F: Record<Lang, () => Faq[]> = {
    ru: () => [
      { q: rent ? `Сколько стоит аренда ${gin}?` : `Сколько стоит ${cat.type ? TYPE_WORDS.ru[cat.type].acc : 'недвижимость'} ${gin}?`, a: s.n ? `Сейчас в каталоге ${s.n} ${objWord('ru', cat.type, s.n)}: от ${min}${max && max !== min ? ` до ${max}` : ''}${rent ? ' в месяц' : ''}.${avg && !rent ? ` Средняя цена квадратного метра — около ${avg}.` : ''} Цены обновляются вместе с базой.` : `Сейчас в этой категории нет объектов — оставьте заявку, и мы подберём варианты по вашему бюджету.` },
      ...(!rent && tr ? [
        { q: `Может ли иностранец купить ${what} ${gin}?`, a: 'Да. Граждане большинства стран могут покупать жильё в Турции и регистрировать право собственности (ТАПУ) на своё имя. Перед сделкой проверяется, нет ли ограничений для конкретного участка и гражданства покупателя.' },
        { q: 'Какие расходы есть при покупке, кроме цены?', a: 'Основная статья — госпошлина за регистрацию права собственности, 4% от стоимости в сделке (по закону делится между сторонами, на практике её часто платит покупатель). Также оплачиваются экспертная оценка, присяжный перевод, нотариус и подключение коммунальных услуг.' },
        { q: 'Даёт ли покупка право на ВНЖ или гражданство?', a: 'Владение жильём — основание подать на краткосрочный вид на жительство. Гражданство можно получить при покупке недвижимости от 400 000 $ с обязательством не продавать её три года. Юристы Stay Property сопровождают оба процесса.' },
      ] : []),
      ...(rent ? [{ q: 'На какой срок можно арендовать?', a: 'Есть варианты долгосрочной аренды и аренды на сезон. Депозит, срок и порядок оплаты коммунальных услуг согласуются с владельцем; менеджер поможет проверить договор.' }] : []),
      { q: 'Можно ли посмотреть объект, если я не в стране?', a: 'Да. Менеджер проведёт онлайн-показ по видеосвязи, пришлёт видео и документы. Сделку можно оформить по доверенности.' },
      { q: 'Как быстро обновляются цены и наличие?', a: 'Каталог синхронизируется с базой Stay Property несколько раз в час. Если объект продан, на его странице появляется отметка «Продано» и похожие предложения.' },
    ],
    en: () => [
      { q: rent ? `How much does it cost to rent ${gin}?` : `How much does ${what} ${gin} cost?`, a: s.n ? `The catalogue currently has ${s.n} ${objWord('en', cat.type, s.n)}: from ${min}${max && max !== min ? ` to ${max}` : ''}${rent ? ' per month' : ''}.${avg && !rent ? ` The average price per square metre is about ${avg}.` : ''} Prices are updated together with our database.` : 'There are no properties in this category right now — send a request and we will find options within your budget.' },
      ...(!rent && tr ? [
        { q: `Can a foreigner buy ${what} ${gin}?`, a: 'Yes. Citizens of most countries can buy homes in Turkey and register the title deed (TAPU) in their own name. Before the deal we check for restrictions on the specific plot and the buyer’s nationality.' },
        { q: 'What costs are there besides the price?', a: 'The main one is the title deed registration fee of 4% of the declared value (by law split between the parties, in practice often paid by the buyer). There are also the valuation report, sworn translation, notary and utility connection fees.' },
        { q: 'Does buying give a right to a residence permit or citizenship?', a: 'Owning a home is a basis for applying for a short-term residence permit. Citizenship can be obtained by buying property worth $400,000 or more and keeping it for three years. Stay Property lawyers support both processes.' },
      ] : []),
      ...(rent ? [{ q: 'For how long can I rent?', a: 'There are long-term and seasonal options. Deposit, term and utilities are agreed with the owner; a manager will help you check the contract.' }] : []),
      { q: 'Can I view a property if I am abroad?', a: 'Yes. A manager will give you an online video tour and send videos and documents. The deal can be completed by power of attorney.' },
      { q: 'How often are prices and availability updated?', a: 'The catalogue syncs with the Stay Property database several times an hour. When a property is sold, its page is marked “Sold” and shows similar offers.' },
    ],
    tr: () => [
      { q: rent ? `${cap(gin)} kira fiyatları ne kadar?` : `${cap(gin)} ${what} fiyatları ne kadar?`, a: s.n ? `Katalogda şu anda ${s.n} ilan var: ${min}${max && max !== min ? ` ile ${max} arası` : ''}${rent ? ' (aylık)' : ''}.${avg && !rent ? ` Ortalama metrekare fiyatı yaklaşık ${avg}.` : ''} Fiyatlar veritabanıyla birlikte güncellenir.` : 'Bu kategoride şu anda ilan yok — talep bırakın, bütçenize uygun seçenekleri bulalım.' },
      ...(!rent && tr ? [
        { q: `Yabancılar ${gin} ${what} satın alabilir mi?`, a: "Evet. Çoğu ülkenin vatandaşı Türkiye'de konut alıp tapuyu kendi adına tescil ettirebilir. İşlemden önce ilgili parsel ve alıcının uyruğu için kısıtlama olup olmadığı kontrol edilir." },
        { q: 'Fiyat dışında hangi masraflar var?', a: 'En önemlisi, beyan edilen değerin %4’ü tutarındaki tapu harcıdır (kanunen taraflar arasında paylaşılır, uygulamada çoğu zaman alıcı öder). Ayrıca ekspertiz raporu, yeminli tercüme, noter ve abonelik masrafları vardır.' },
        { q: 'Satın alma ikamet izni veya vatandaşlık hakkı verir mi?', a: 'Konut sahipliği kısa dönem ikamet izni başvurusu için gerekçedir. 400.000 $ ve üzeri gayrimenkul alıp üç yıl satmama taahhüdüyle vatandaşlık alınabilir. Stay Property avukatları her iki süreçte de destek olur.' },
      ] : []),
      ...(rent ? [{ q: 'Ne kadar süreyle kiralayabilirim?', a: 'Uzun dönem ve sezonluk seçenekler var. Depozito, süre ve faturalar mal sahibiyle kararlaştırılır; danışman sözleşmenin kontrolüne yardım eder.' }] : []),
      { q: 'Yurt dışındaysam ilanı görebilir miyim?', a: 'Evet. Danışman görüntülü online gösterim yapar, video ve belgeleri gönderir. İşlem vekaletle tamamlanabilir.' },
      { q: 'Fiyatlar ve müsaitlik ne sıklıkla güncellenir?', a: 'Katalog, Stay Property veritabanıyla saatte birkaç kez eşitlenir. Satılan ilanın sayfasında “Satıldı” ibaresi ve benzer ilanlar gösterilir.' },
    ],
    de: () => [
      { q: rent ? `Was kostet die Miete ${gin}?` : `Was kosten ${what} ${gin}?`, a: s.n ? `Im Katalog sind derzeit ${s.n} ${objWord('de', cat.type, s.n)}: von ${min}${max && max !== min ? ` bis ${max}` : ''}${rent ? ' pro Monat' : ''}.${avg && !rent ? ` Der Durchschnittspreis liegt bei etwa ${avg} pro m².` : ''} Die Preise werden mit unserer Datenbank aktualisiert.` : 'In dieser Kategorie gibt es derzeit keine Objekte – senden Sie eine Anfrage, wir finden Angebote in Ihrem Budget.' },
      ...(!rent && tr ? [
        { q: `Können Ausländer ${what} ${gin} kaufen?`, a: 'Ja. Staatsangehörige der meisten Länder können in der Türkei Wohneigentum erwerben und den Grundbucheintrag (TAPU) auf ihren Namen vornehmen. Vor dem Kauf wird geprüft, ob für das Grundstück oder die Staatsangehörigkeit Einschränkungen gelten.' },
        { q: 'Welche Kosten fallen neben dem Kaufpreis an?', a: 'Die wichtigste ist die Grundbuchgebühr von 4 % des angegebenen Werts (gesetzlich zwischen den Parteien geteilt, in der Praxis oft vom Käufer bezahlt). Hinzu kommen Wertgutachten, beeidigte Übersetzung, Notar und Anschlussgebühren.' },
        { q: 'Gibt der Kauf ein Recht auf Aufenthaltserlaubnis oder Staatsbürgerschaft?', a: 'Wohneigentum ist eine Grundlage für den Antrag auf eine kurzfristige Aufenthaltserlaubnis. Die Staatsbürgerschaft ist beim Kauf ab 400.000 $ mit dreijähriger Haltefrist möglich. Die Juristen von Stay Property begleiten beide Verfahren.' },
      ] : []),
      ...(rent ? [{ q: 'Für wie lange kann ich mieten?', a: 'Es gibt Langzeit- und Saisonangebote. Kaution, Laufzeit und Nebenkosten werden mit dem Eigentümer vereinbart; ein Berater hilft bei der Vertragsprüfung.' }] : []),
      { q: 'Kann ich ein Objekt besichtigen, wenn ich im Ausland bin?', a: 'Ja. Ein Berater führt eine Online-Besichtigung per Video durch und sendet Videos und Dokumente. Der Kauf kann per Vollmacht abgeschlossen werden.' },
      { q: 'Wie oft werden Preise und Verfügbarkeit aktualisiert?', a: 'Der Katalog wird mehrmals pro Stunde mit der Datenbank von Stay Property abgeglichen. Verkaufte Objekte werden als „Verkauft“ markiert und zeigen ähnliche Angebote.' },
    ],
    sr: () => [
      { q: rent ? `Koliko košta najam ${gin}?` : `Koliko koštaju ${what} ${gin}?`, a: s.n ? `U katalogu je trenutno ${s.n} ${objWord('sr', cat.type, s.n)}: od ${min}${max && max !== min ? ` do ${max}` : ''}${rent ? ' mesečno' : ''}.${avg && !rent ? ` Prosečna cena kvadratnog metra je oko ${avg}.` : ''} Cene se ažuriraju zajedno sa bazom.` : 'Trenutno nema nekretnina u ovoj kategoriji – pošaljite upit i pronaći ćemo opcije u okviru vašeg budžeta.' },
      ...(!rent && tr ? [
        { q: `Može li stranac da kupi ${what} ${gin}?`, a: 'Da. Državljani većine zemalja mogu kupiti stan u Turskoj i upisati tapiju (TAPU) na svoje ime. Pre kupovine proverava se da li postoje ograničenja za konkretnu parcelu i državljanstvo kupca.' },
        { q: 'Koji troškovi postoje pored cene?', a: 'Glavni je taksa za upis vlasništva od 4% prijavljene vrednosti (po zakonu se deli između strana, u praksi je često plaća kupac). Tu su i procena vrednosti, sudski prevod, notar i priključci.' },
        { q: 'Da li kupovina daje pravo na boravišnu dozvolu ili državljanstvo?', a: 'Vlasništvo nad stanom je osnov za zahtev za kratkoročnu boravišnu dozvolu. Državljanstvo se može dobiti kupovinom nekretnine od 400.000 $ uz obavezu da se ne proda tri godine. Pravnici Stay Property prate oba procesa.' },
      ] : []),
      ...(rent ? [{ q: 'Na koliko vremena mogu da iznajmim?', a: 'Postoje dugoročne i sezonske opcije. Depozit, rok i režije dogovaraju se sa vlasnikom; menadžer pomaže u proveri ugovora.' }] : []),
      { q: 'Mogu li da pogledam nekretninu ako sam u inostranstvu?', a: 'Da. Menadžer će organizovati onlajn razgledanje putem video poziva i poslati video i dokumente. Kupovina se može obaviti putem punomoćja.' },
      { q: 'Koliko često se ažuriraju cene i dostupnost?', a: 'Katalog se sinhronizuje sa bazom Stay Property nekoliko puta na sat. Kada se nekretnina proda, na njenoj stranici se pojavljuje oznaka „Prodato“ i slične ponude.' },
    ],
  };
  return F[lang]().slice(0, 6);
}

/* ---------- Объект ---------- */

export function itemMeta(lang: Lang, x: { type: TypeSlug; rooms: string | null; area: number | null; price: number | null; id: string; deal: Deal }, g: Geo, descText: string): { title: string; h1: string; description: string } {
  const tw = TYPE_WORDS[lang][x.type];
  const rooms = x.rooms ? ` ${x.rooms}` : '';
  const area = x.area ? `${numL(lang, x.area)} ${lang === 'ru' ? 'м²' : 'm²'}` : '';
  const price = moneyL(lang, x.price);
  const gin = geoIn(lang, g);
  const name = geoName(lang, g);
  const rent = x.deal === 'rent';
  const T: Record<Lang, () => { title: string; h1: string }> = {
    ru: () => ({ title: `${tw.one}${rooms} ${gin}${area ? `, ${area}` : ''}${price ? ` — ${rent ? 'снять за' : 'купить за'} ${price}${rent ? '/мес' : ''}` : ''} (ID ${x.id})`, h1: `${tw.one}${rooms}${area ? `, ${area}` : ''}, ${name}` }),
    en: () => ({ title: `${tw.one}${rooms} ${gin}${area ? `, ${area}` : ''}${price ? ` — ${rent ? 'rent for' : 'buy for'} ${price}${rent ? '/mo' : ''}` : ''} (ID ${x.id})`, h1: `${tw.one}${rooms}${area ? `, ${area}` : ''}, ${name}` }),
    tr: () => ({ title: `${cap(gin)} ${rent ? 'kiralık' : 'satılık'} ${tw.one.toLocaleLowerCase('tr')}${rooms}${area ? `, ${area}` : ''}${price ? ` — ${price}` : ''} (ID ${x.id})`, h1: `${tw.one}${rooms}${area ? `, ${area}` : ''}, ${name}` }),
    de: () => ({ title: `${tw.one}${rooms} ${gin}${area ? `, ${area}` : ''}${price ? ` — ${rent ? 'mieten für' : 'kaufen für'} ${price}${rent ? '/Monat' : ''}` : ''} (ID ${x.id})`, h1: `${tw.one}${rooms}${area ? `, ${area}` : ''}, ${name}` }),
    sr: () => ({ title: `${tw.one}${rooms} ${gin}${area ? `, ${area}` : ''}${price ? ` — ${rent ? 'najam za' : 'kupite za'} ${price}${rent ? '/mes.' : ''}` : ''} (ID ${x.id})`, h1: `${tw.one}${rooms}${area ? `, ${area}` : ''}, ${name}` }),
  };
  const t = T[lang]();
  const d = descText.replace(/\s+/g, ' ').trim();
  // Короткое описание из API не годится для сниппета — собираем из характеристик (ТЗ 5.1).
  const pr = price ? `${price}${rent ? { ru: '/мес', en: '/mo', tr: '/ay', de: '/Monat', sr: '/mes.' }[lang] : ''}` : '';
  const tmpl: Record<Lang, string> = {
    ru: `${t.h1}${pr ? `, цена ${pr}` : ''}. ${rent ? 'Долгосрочная аренда' : 'Продажа'} от Stay Property: фото, характеристики и расположение. ID ${x.id}.`,
    en: `${t.h1}${pr ? `, price ${pr}` : ''}. ${rent ? 'Long-term rental' : 'For sale'} from Stay Property: photos, specifications and location. ID ${x.id}.`,
    tr: `${t.h1}${pr ? `, fiyat ${pr}` : ''}. Stay Property'den ${rent ? 'uzun dönem kiralık' : 'satılık'}: fotoğraflar, özellikler ve konum. ID ${x.id}.`,
    de: `${t.h1}${pr ? `, Preis ${pr}` : ''}. ${rent ? 'Langzeitmiete' : 'Zum Kauf'} bei Stay Property: Fotos, Ausstattung und Lage. ID ${x.id}.`,
    sr: `${t.h1}${pr ? `, cena ${pr}` : ''}. ${rent ? 'Dugoročni najam' : 'Prodaja'} — Stay Property: fotografije, karakteristike i lokacija. ID ${x.id}.`,
  };
  const desc = d.length >= 80 ? d : tmpl[lang];
  return { ...t, description: desc.length > 160 ? desc.slice(0, 159).replace(/\s+\S*$/, '') + '…' : desc };
}

/* ---------- Комплексы ---------- */

export function complexesMeta(lang: Lang, g: Geo, n: number, minPrice: number | null, page = 1): Meta {
  const gin = geoIn(lang, g);
  const cw = COMPLEX_WORDS[lang];
  const nw = pluralL(lang, n, cw.n);
  const min = moneyL(lang, minPrice);
  const M: Record<Lang, Meta> = {
    ru: { title: fit(`Новостройки ${gin} от застройщика — ${n} ${nw}`, `Новостройки ${gin} — ${n} ${nw}`), h1: `Новостройки и ЖК ${gin}`, description: desc(`${n} ${nw} ${gin}${min ? `: цены от ${min}` : ''}, рассрочка от застройщика, сроки сдачи и планировки.`, 'Проверка застройщика и сопровождение сделки — Stay Property.'), lead: `${n} ${nw} ${gin}${min ? `, квартиры от ${min}` : ''}.` },
    en: { title: fit(`New developments ${gin} — ${n} ${nw}`, `New builds ${gin} — ${n} ${nw}`), h1: `New developments and complexes ${gin}`, description: desc(`${n} ${nw} ${gin}${min ? `: prices from ${min}` : ''}, developer installment plans, completion dates and layouts.`, 'Developer checks and deal support — Stay Property.'), lead: `${n} ${nw} ${gin}${min ? `, apartments from ${min}` : ''}.` },
    tr: { title: fit(`${cap(gin)} yeni projeler — ${n} konut projesi`, `${cap(gin)} yeni projeler`), h1: cap(`${gin} yeni projeler ve konut siteleri`), description: desc(`${cap(gin)} ${n} konut projesi${min ? `: fiyatlar ${min}'dan başlıyor` : ''}, müteahhitten taksit, teslim tarihleri ve daire tipleri.`, 'Müteahhit kontrolü ve işlem desteği — Stay Property.'), lead: `${cap(gin)} ${n} konut projesi${min ? `, daireler ${min}'dan başlıyor` : ''}.` },
    de: { title: fit(`Neubauprojekte ${gin} — ${n} ${nw}`, `Neubau ${gin} — ${n} ${nw}`), h1: `Neubauprojekte und Wohnanlagen ${gin}`, description: desc(`${n} ${nw} ${gin}${min ? `: Preise ab ${min}` : ''}, Ratenzahlung beim Bauträger, Fertigstellungstermine und Grundrisse.`, 'Prüfung des Bauträgers und Kaufbegleitung — Stay Property.'), lead: `${n} ${nw} ${gin}${min ? `, Wohnungen ab ${min}` : ''}.` },
    sr: { title: fit(`Novogradnja ${gin} — ${n} ${nw}`, `Novogradnja ${gin}`), h1: `Novogradnja i stambeni kompleksi ${gin}`, description: desc(`${n} ${nw} ${gin}${min ? `: cene od ${min}` : ''}, rate kod investitora, rokovi završetka i rasporedi.`, 'Provera investitora i podrška pri kupovini — Stay Property.'), lead: `${n} ${nw} ${gin}${min ? `, stanovi od ${min}` : ''}.` },
  };
  const m = M[lang];
  if (page > 1) m.title += { ru: ` — страница ${page}`, en: ` — page ${page}`, tr: ` — sayfa ${page}`, de: ` — Seite ${page}`, sr: ` — strana ${page}` }[lang];
  return m;
}

export function complexMeta(lang: Lang, name: string, g: Geo, low: number | null, high: number | null, rooms: string[], deadline: string | null): { title: string; h1: string; description: string } {
  const gin = geoIn(lang, g);
  const place = geoName(lang, g);
  const lo = moneyL(lang, low);
  const hi = moneyL(lang, high);
  const r = rooms.join(', ');
  const M = {
    ru: { title: fit(`ЖК ${name} ${gin} — цены от ${lo} от застройщика`, `ЖК ${name} ${gin} — цены от ${lo}`, `ЖК ${name} — цены от ${lo}`), h1: `Жилой комплекс ${name}, ${place}`, description: `${name}: ${r ? `${r} ` : ''}${lo ? `от ${lo}${hi ? ` до ${hi}` : ''}` : ''}${deadline ? `, сдача ${deadline}` : ''}. Планировки, цены, ход строительства.` },
    en: { title: fit(`${name} ${gin} — prices from ${lo}`, `${name} — prices from ${lo}`), h1: `${name} residential complex, ${place}`, description: `${name}: ${r ? `${r} ` : ''}${lo ? `from ${lo}${hi ? ` to ${hi}` : ''}` : ''}${deadline ? `, completion ${deadline}` : ''}. Layouts, prices and construction progress.` },
    tr: { title: fit(`${name} ${gin} — ${lo}'dan başlayan fiyatlar`, `${name} — ${lo}'dan başlayan fiyatlar`), h1: `${name} konut projesi, ${place}`, description: `${name}: ${r ? `${r} ` : ''}${lo ? `${lo}${hi ? ` – ${hi}` : ''}` : ''}${deadline ? `, teslim ${deadline}` : ''}. Daire tipleri, fiyatlar ve inşaat süreci.` },
    de: { title: fit(`${name} ${gin} — Preise ab ${lo}`, `${name} — Preise ab ${lo}`), h1: `Wohnanlage ${name}, ${place}`, description: `${name}: ${r ? `${r} ` : ''}${lo ? `ab ${lo}${hi ? ` bis ${hi}` : ''}` : ''}${deadline ? `, Fertigstellung ${deadline}` : ''}. Grundrisse, Preise und Baufortschritt.` },
    sr: { title: fit(`${name} ${gin} — cene od ${lo}`, `${name} — cene od ${lo}`), h1: `Stambeni kompleks ${name}, ${place}`, description: `${name}: ${r ? `${r} ` : ''}${lo ? `od ${lo}${hi ? ` do ${hi}` : ''}` : ''}${deadline ? `, završetak ${deadline}` : ''}. Rasporedi, cene i tok izgradnje.` },
  } as Record<Lang, { title: string; h1: string; description: string }>;
  return M[lang];
}

export { year };
