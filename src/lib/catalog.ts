/**
 * Каталог в терминах ТЗ: объекты с гео-слагами, типом и фичами, категории
 * (гео × сделка × тип × фича), счётчики и статистика для посадочных и метатегов.
 * Данные — из API (api.ts), здесь только раскладка по структуре сайта.
 */
import type { Lang } from '../i18n/config';
import { rawListings, rawUnits, citizenshipIds, getProjects, fixImage, type Project, type RawListing } from './api';
import { resolveGeo, countryBySlug, cityBySlug, districtBySlug, slugify, CITIES, COUNTRIES, NEIGHBOURS } from './geo';
import { featuresOf, featureDef, featureAllowed, FEATURES, TYPES, DEALS, type Deal, type FeatureSlug, type TypeSlug } from './segments';

export interface Item {
  id: string;
  deal: Deal;
  country: string;
  city: string;
  district: string | null;
  type: TypeSlug;
  rawType: string | null;
  rooms: string | null;
  bedrooms: number | null;
  price: number | null;
  area: number | null;
  sea: number | null;
  floor: number | null;
  ref: string | null;
  isPrivate: boolean;
  image: string | null;
  titleRu: string;
  /** Слаг ЖК, если объект в комплексе. */
  complex: string | null;
  features: FeatureSlug[];
  /** Квартира из проектов Stay (Битрикс) — описаний и переводов нет. */
  unit: boolean;
  citizenship: boolean;
}

const TYPE_MAP: Record<string, TypeSlug> = {
  'Finished Apartment': 'apartments', 'New Project': 'apartments', 'New Projects': 'apartments', 'Apartment (AE)': 'apartments',
  'Apartments (inv)': 'apartments', 'Hotel Apartments': 'apartments', 'Resale Property': 'apartments', 'Rent': 'apartments',
  'StayProperty Project': 'apartments', 'Duplex': 'duplexes', 'Penthouse': 'penthouses', 'Villa': 'villas', 'Villa (AE)': 'villas',
  'Townhouse (AE)': 'townhouses', 'Townhouse (inv)': 'townhouses', 'Land': 'land', 'Commercial': 'commercial',
};

function bedrooms(r: string | null): number | null {
  if (!r) return null;
  const n = Number(String(r).split('+')[0]);
  return Number.isFinite(n) ? n : null;
}

const numOrNull = (v: unknown) => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null);

function toItem(x: RawListing, deal: Deal, unit = false, citizenship = false): Item | null {
  const geo = resolveGeo(x.city, x.area);
  if (!geo) return null;
  const city = cityBySlug(geo.city)!;
  const type: TypeSlug = unit ? (/дуплекс/i.test(x.objectType || '') ? 'duplexes' : /пентхаус/i.test(x.objectType || '') ? 'penthouses' : 'apartments') : TYPE_MAP[x.propertyType] ?? 'apartments';
  const rooms = x.roomLabel ?? null;
  const it: Item = {
    id: unit ? `u${x.id}` : String(x.id),
    deal,
    country: city.country,
    city: geo.city,
    district: geo.district,
    type,
    rawType: x.propertyType ?? null,
    rooms,
    bedrooms: bedrooms(rooms),
    // Цены выше 100 млн € — ошибка ввода в Portfolio: показываем «Цена по запросу».
    price: (() => { const p = numOrNull(x.price); return p && p < 100_000_000 ? p : null; })(),
    area: numOrNull(x.totalArea),
    sea: numOrNull(x.distanceToSea),
    floor: x.floor != null && x.floor !== '' ? Math.round(Number(x.floor)) || null : null,
    ref: x.objectCode ?? null,
    isPrivate: !!x.isPrivate,
    image: fixImage(x.imageUrl),
    titleRu: String(x.title || '').trim(),
    complex: x.projectCode ? String(x.projectCode) : null,
    features: [],
    unit,
    citizenship,
  };
  it.features = featuresOf({ deal, country: it.country, type, rawType: it.rawType, title: it.titleRu, price: it.price, sea: it.sea, bedrooms: it.bedrooms, unit, citizenship });
  return it;
}

let memo: { at: number; items: Item[]; units: Item[] } | null = null;

/** Все объекты каталога (продажа + аренда из Portfolio). */
export async function getItems(): Promise<Item[]> {
  return (await load()).items;
}

/** Квартиры в проектах Stay (для режима PRIVE, «Гражданство ТР» и страниц ЖК). */
export async function getUnits(): Promise<Item[]> {
  return (await load()).units;
}

async function load() {
  if (memo && Date.now() - memo.at < 5 * 60_000) return memo;
  const [sale, rent, units, cit] = await Promise.all([
    rawListings('sale'),
    rawListings('rental'),
    rawUnits().catch(() => []),
    citizenshipIds().catch(() => new Set<string>()),
  ]);
  const items = [
    // В выдаче продажи Portfolio есть объекты аренды (propertyType «Rent») — показываем их в аренде.
    ...sale.map((x) => toItem(x, x.propertyType === 'Rent' ? 'rent' : 'sale')),
    ...rent.map((x) => toItem(x, 'rent')),
  ].filter(Boolean) as Item[];
  const u = units.map((x) => toItem(x, 'sale', true, cit.has(`u${x.id}`))).filter(Boolean) as Item[];
  memo = { at: Date.now(), items, units: u };
  return memo;
}

/* ---------- Категории ---------- */

export interface Cat {
  country: string;
  city?: string;
  district?: string;
  deal?: Deal;
  type?: TypeSlug;
  feature?: FeatureSlug;
}

export function matchCat(x: Item, c: Cat): boolean {
  if (x.country !== c.country) return false;
  if (c.city && x.city !== c.city) return false;
  if (c.district && x.district !== c.district) return false;
  if (c.deal && x.deal !== c.deal) return false;
  if (c.type && x.type !== c.type) return false;
  if (c.feature && !x.features.includes(c.feature)) return false;
  return true;
}

export async function itemsOf(c: Cat): Promise<Item[]> {
  return (await getItems()).filter((x) => matchCat(x, c));
}

export interface Stats {
  n: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPerM2: number | null;
  minArea: number | null;
  maxArea: number | null;
  nearSeaShare: number;
}

export function stats(list: Item[]): Stats {
  const prices = list.map((x) => x.price).filter((p): p is number => !!p);
  const areas = list.map((x) => x.area).filter((p): p is number => !!p);
  const perM2 = list.filter((x) => x.price && x.area && x.area > 15).map((x) => x.price! / x.area!);
  return {
    n: list.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    avgPerM2: perM2.length ? Math.round(perM2.reduce((a, b) => a + b, 0) / perM2.length) : null,
    minArea: areas.length ? Math.min(...areas) : null,
    maxArea: areas.length ? Math.max(...areas) : null,
    nearSeaShare: list.length ? list.filter((x) => x.sea && x.sea <= 500).length / list.length : 0,
  };
}

/** Порог индексации (ТЗ 5.2). */
export const INDEX_MIN = 3;

/* ---------- Адреса ---------- */

export function catPath(c: Partial<Cat> & { country: string }, extra?: { complexes?: boolean; page?: number }): string {
  // Новостройки есть только в продаже: …/sale/complexes/ при любой сделке в cat.
  const parts = [c.country, c.city, c.city && c.district, extra?.complexes ? 'sale' : c.deal];
  if (extra?.complexes) parts.push('complexes');
  else parts.push(c.deal && c.type, c.deal && c.type && c.feature);
  if (extra?.page && extra.page > 1) parts.push(`page-${extra.page}`);
  return parts.filter(Boolean).join('/') + '/';
}

export const catUrl = (lang: Lang, c: Partial<Cat> & { country: string }, extra?: { complexes?: boolean; page?: number }) => `/${lang}/${catPath(c, extra)}`;

/** Карточка объекта: …/{district}/{deal}/id{ID} — без слеша на конце (ТЗ 2.3, 3.3). */
export function itemPath(x: Pick<Item, 'id' | 'country' | 'city' | 'district' | 'deal'>): string {
  return [x.country, x.city, x.district, x.deal, `id${x.id}`].filter(Boolean).join('/');
}
export const itemUrl = (lang: Lang, x: Pick<Item, 'id' | 'country' | 'city' | 'district' | 'deal'>) => `/${lang}/${itemPath(x)}`;

export async function findItem(id: string): Promise<Item | null> {
  const all = id.startsWith('u') ? await getUnits() : await getItems();
  return all.find((x) => x.id === id) ?? null;
}

/* ---------- Комплексы (ЖК) ---------- */

export interface Complex {
  slug: string;
  code: string;
  title: string;
  country: string;
  city: string;
  district: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  image: string | null;
  isPrivate: boolean;
  action: string | null;
  lat: number | null;
  lng: number | null;
  rooms: string[];
  project: Project;
}

let cxMemo: { at: number; list: Complex[] } | null = null;

export async function getComplexes(): Promise<Complex[]> {
  if (cxMemo && Date.now() - cxMemo.at < 5 * 60_000) return cxMemo.list;
  const projects = await getProjects();
  const used = new Set<string>();
  const list: Complex[] = [];
  for (const p of projects) {
    const raw = (p as any).rawCity ?? p.city;
    const geo = resolveGeo(raw === 'Аланья' ? 'Алания' : raw, (p as any).rawArea ?? p.area);
    if (!geo) continue;
    let slug = slugify(p.title) || slugify(p.code);
    if (used.has(slug)) slug = slugify(p.code);
    used.add(slug);
    const prices = p.units.map((u) => u.priceFrom).filter((x): x is number => !!x);
    list.push({
      slug,
      code: p.code,
      title: p.title.trim(),
      country: cityBySlug(geo.city)!.country,
      city: geo.city,
      district: geo.district,
      priceFrom: prices.length ? Math.min(...prices) : p.priceFrom,
      priceTo: prices.length > 1 ? Math.max(...prices) : null,
      image: p.image,
      isPrivate: p.isPrivate,
      action: p.action,
      lat: p.lat,
      lng: p.lng,
      rooms: p.rooms,
      project: p,
    });
  }
  cxMemo = { at: Date.now(), list };
  return list;
}

export function complexPath(c: Pick<Complex, 'country' | 'city' | 'district' | 'slug'>) {
  return [c.country, c.city, c.district, 'sale', 'complexes', c.slug].filter(Boolean).join('/');
}
export const complexUrl = (lang: Lang, c: Pick<Complex, 'country' | 'city' | 'district' | 'slug'>) => `/${lang}/${complexPath(c)}`;

export async function complexByCode(code: string): Promise<Complex | null> {
  const s = String(code).replace(/_/g, '-').replace(/-+$/, '').toLowerCase();
  return (await getComplexes()).find((c) => c.code === code || slugify(c.code) === s || c.slug === s) ?? null;
}

export function matchComplex(x: Complex, c: Cat) {
  return x.country === c.country && (!c.city || x.city === c.city) && (!c.district || x.district === c.district);
}

/* ---------- Разбор адреса ---------- */

export type Route =
  | { kind: 'hub'; cat: Cat }
  | { kind: 'listing'; cat: Cat & { deal: Deal }; page: number }
  | { kind: 'complexes'; cat: Cat; page: number }
  | { kind: 'complex'; cat: Cat; slug: string }
  | { kind: 'item'; cat: Cat & { deal: Deal }; id: string };

/** Разбирает путь после языка. null — такой страницы нет (404). */
export async function parseRoute(segs: string[]): Promise<Route | null> {
  await getItems(); // регистрирует районы из данных
  await getComplexes();
  const s = [...segs];
  let page = 1;
  const last = s[s.length - 1];
  const pm = last?.match(/^page-(\d+)$/);
  if (pm) {
    page = Number(pm[1]);
    if (page < 1) return null;
    s.pop();
  }
  const country = countryBySlug(s.shift() ?? '');
  if (!country) return null;
  const cat: Cat = { country: country.slug };
  if (s[0] && cityBySlug(s[0])?.country === country.slug) {
    cat.city = s.shift()!;
    if (s[0] && s[0] !== 'sale' && s[0] !== 'rent') {
      if (!districtBySlug(cat.city, s[0])) return null;
      cat.district = s.shift()!;
    }
  }
  if (!s.length) return pm ? null : { kind: 'hub', cat };
  const deal = s.shift();
  if (deal !== 'sale' && deal !== 'rent') return null;
  cat.deal = deal;
  if (!s.length) return { kind: 'listing', cat: cat as Cat & { deal: Deal }, page };
  const seg = s.shift()!;
  if (seg === 'complexes') {
    if (deal !== 'sale') return null;
    delete cat.deal;
    if (!s.length) return { kind: 'complexes', cat, page };
    if (pm || s.length > 1) return null;
    return { kind: 'complex', cat, slug: s[0] };
  }
  const idm = seg.match(/^id(u?\d+)$/);
  if (idm) {
    if (pm || s.length) return null;
    return { kind: 'item', cat: cat as Cat & { deal: Deal }, id: idm[1] };
  }
  if (!(TYPES as string[]).includes(seg)) return null;
  cat.type = seg as TypeSlug;
  if (s.length) {
    const f = featureDef(s.shift()!);
    if (!f || s.length || !featureAllowed(f, deal, cat.type, cat.country)) return null;
    cat.feature = f.slug;
  }
  return { kind: 'listing', cat: cat as Cat & { deal: Deal }, page };
}

/** Города страны и районы города, где есть объекты (для карточек дочерних гео). */
export async function childGeo(c: Cat) {
  const all = await getItems();
  const counts = new Map<string, number>();
  for (const x of all) {
    if (x.country !== c.country) continue;
    if (!c.city) counts.set(x.city, (counts.get(x.city) ?? 0) + 1);
    else if (x.city === c.city && x.district) counts.set(x.district, (counts.get(x.district) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([slug, n]) => {
    const sample = all.find((x) => (c.city ? x.city === c.city && x.district === slug : x.city === slug) && x.image);
    return { slug, n, image: sample?.image ?? null };
  });
}

export { CITIES };

/* ---------- Фильтр поверх посадочной (GET-параметры, ТЗ 8.1) ---------- */

export type SortKey = 'new' | 'price-asc' | 'price-desc' | 'area-desc' | 'sea-asc';
export const SORTS: SortKey[] = ['new', 'price-asc', 'price-desc', 'area-desc', 'sea-asc'];
/** Параметры, которые считаются фильтром (страница с ними — noindex + canonical на чистый URL). */
export const FILTER_PARAMS = ['price_from', 'price_to', 'rooms', 'sea_from', 'sea_to', 'sort', 'prive', 'citizenship', 'ref', 'f', 'view'];

export interface Filters {
  priceFrom?: number;
  priceTo?: number;
  rooms: string[];
  seaFrom?: number;
  seaTo?: number;
  sort: SortKey;
  prive: boolean;
  citizenship: boolean;
  ref?: string;
  /** Дополнительная фича, если в адресе уже есть другая. */
  extra?: FeatureSlug;
}

export function parseFilters(sp: URLSearchParams): Filters {
  const n = (k: string) => {
    const v = Number((sp.get(k) || '').replace(/[\s.,]/g, ''));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  const sort = sp.get('sort') as SortKey;
  const f = featureDef(sp.get('f') || '');
  return {
    priceFrom: n('price_from'),
    priceTo: n('price_to'),
    rooms: sp.getAll('rooms').flatMap((r) => r.split(',')).filter(Boolean),
    seaFrom: n('sea_from'),
    seaTo: n('sea_to'),
    sort: SORTS.includes(sort) ? sort : 'new',
    prive: sp.get('prive') === '1',
    citizenship: sp.get('citizenship') === '1',
    ref: sp.get('ref')?.trim() || undefined,
    extra: f?.slug,
  };
}

export const hasFilters = (sp: URLSearchParams) => FILTER_PARAMS.some((k) => sp.has(k));

function roomsBucket(r: string | null): string | null {
  if (!r) return null;
  if (r === '1+0') return 'studio';
  const n = Number(r.split('+')[0]);
  if (!Number.isFinite(n)) return null;
  return n >= 4 ? '4+' : `${n}+1`;
}

/** Список категории с учётом GET-фильтров и сортировки. */
export async function filtered(cat: Cat, f: Filters): Promise<Item[]> {
  let base: Item[];
  if (f.prive) base = (await getUnits()).filter((x) => x.isPrivate && matchCat(x, { ...cat, feature: undefined }) && (!cat.feature || x.features.includes(cat.feature)));
  else base = await itemsOf(cat);
  // «Под гражданство» включает и квартиры в проектах Stay с отметкой гражданства (как тоггл в фильтре).
  if ((f.citizenship || cat.feature === 'citizenship') && !f.prive) {
    const units = (await getUnits()).filter((x) => x.citizenship && matchCat(x, { ...cat, feature: undefined }));
    base = [...base.filter((x) => x.features.includes('citizenship')), ...units];
  } else if (f.citizenship) base = base.filter((x) => x.citizenship);
  const ref = f.ref?.toLowerCase();
  let out = base.filter((x) => {
    if (f.extra && !x.features.includes(f.extra)) return false;
    if (ref && !(x.ref?.toLowerCase().includes(ref) || x.id === ref)) return false;
    if (f.priceFrom && (x.price ?? 0) < f.priceFrom) return false;
    if (f.priceTo && (x.price ?? Infinity) > f.priceTo) return false;
    if (f.seaFrom && (x.sea ?? 0) < f.seaFrom) return false;
    if (f.seaTo && (x.sea ?? Infinity) > f.seaTo) return false;
    if (f.rooms.length && !f.rooms.includes(roomsBucket(x.rooms) ?? '')) return false;
    return true;
  });
  const by = (k: (x: Item) => number) => (a: Item, b: Item) => k(a) - k(b);
  if (f.sort === 'price-asc') out = out.toSorted(by((x) => x.price ?? Infinity));
  if (f.sort === 'price-desc') out = out.toSorted(by((x) => -(x.price ?? 0)));
  if (f.sort === 'area-desc') out = out.toSorted(by((x) => -(x.area ?? 0)));
  if (f.sort === 'sea-asc') out = out.toSorted(by((x) => x.sea ?? Infinity));
  if (f.sort === 'new') out = out.toSorted(by((x) => -Number(String(x.id).replace(/\D/g, ''))));
  return out;
}

/** Размер страницы листинга (ТЗ 8.2: 24–30). */
export const PER_PAGE = 24;

/** Фича-лендинги категории, где есть объекты (для блока «Уточнить запрос»). */
export async function featureCounts(cat: Cat): Promise<[FeatureSlug, number][]> {
  if (!cat.deal) return [];
  const list = await itemsOf({ ...cat, feature: undefined });
  const m = new Map<FeatureSlug, number>();
  for (const x of list) for (const f of x.features) m.set(f, (m.get(f) ?? 0) + 1);
  return [...m.entries()].filter(([f]) => featureAllowed(featureDef(f)!, cat.deal!, cat.type ?? null, cat.country) && (cat.type ? true : false));
}

/** Число объектов по типам в гео × сделке. */
export async function typeCounts(cat: Cat): Promise<[TypeSlug, number][]> {
  const list = await itemsOf({ ...cat, type: undefined, feature: undefined });
  const m = new Map<TypeSlug, number>();
  for (const x of list) m.set(x.type, (m.get(x.type) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export const noFilters = (): Filters => parseFilters(new URLSearchParams());

/** Число объектов категории так, как его видит посетитель без фильтров (для порога индексации). */
export async function countOf(cat: Cat): Promise<number> {
  return (await filtered(cat, noFilters())).length;
}

/** Варианты гео для фильтра: страны → города → районы, где есть объекты сделки. */
export async function geoOptions(deal: Deal) {
  const all = (await getItems()).filter((x) => x.deal === deal);
  const byCountry = new Map<string, number>();
  const byCity = new Map<string, number>();
  const byDistrict = new Map<string, number>();
  const inc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const x of all) {
    inc(byCountry, x.country);
    inc(byCity, x.city);
    if (x.district) inc(byDistrict, `${x.city}/${x.district}`);
  }
  const prices = all.map((x) => x.price).filter((p): p is number => !!p);
  return {
    countries: COUNTRIES.filter((c) => byCountry.has(c.slug)),
    cities: CITIES.filter((c) => byCity.has(c.slug)).sort((a, b) => byCity.get(b.slug)! - byCity.get(a.slug)!),
    districts: [...byDistrict.entries()]
      .map(([k, n]) => { const [city, d] = k.split('/'); return { city, d: districtBySlug(city, d)!, n }; })
      .filter((x) => x.d)
      .sort((a, b) => b.n - a.n),
    priceMin: prices.length ? Math.min(...prices) : 0,
    // Верх шкалы — 98-й перцентиль: единичные выбросы (отели, участки) не растягивают ползунок.
    priceMax: prices.length ? [...prices].sort((a, b) => a - b)[Math.floor((prices.length - 1) * 0.98)] : 1_000_000,
  };
}

/** Какие фичи допустимы для сделки × типа (для фильтра: сочетание из белого списка → ЧПУ). */
export function allowedFeatureMap(country: string): Record<Deal, Record<string, FeatureSlug[]>> {
  const out = {} as Record<Deal, Record<string, FeatureSlug[]>>;
  for (const deal of DEALS) {
    out[deal] = {};
    for (const type of TYPES) out[deal][type] = FEATURES.filter((f) => featureAllowed(f, deal, type, country)).map((f) => f.slug);
  }
  return out;
}

/** Соседние гео того же уровня: районы рядом (по карте Алании или по числу объектов), другие города, другие страны. */
export async function neighbours(c: Cat, limit = 6): Promise<Cat[]> {
  const all = await getItems();
  if (c.city && c.district) {
    const near = NEIGHBOURS[`${c.city}/${c.district}`];
    if (near) return near.filter((d) => districtBySlug(c.city!, d)).slice(0, limit).map((d) => ({ country: c.country, city: c.city, district: d }));
    const cnt = new Map<string, number>();
    for (const x of all) if (x.city === c.city && x.district && x.district !== c.district) cnt.set(x.district, (cnt.get(x.district) ?? 0) + 1);
    return [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([d]) => ({ country: c.country, city: c.city, district: d }));
  }
  if (c.city) {
    const cnt = new Map<string, number>();
    for (const x of all) if (x.country === c.country && x.city !== c.city) cnt.set(x.city, (cnt.get(x.city) ?? 0) + 1);
    return [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([city]) => ({ country: c.country, city }));
  }
  return COUNTRIES.filter((x) => x.slug !== c.country && all.some((i) => i.country === x.slug)).map((x) => ({ country: x.slug }));
}

/**
 * Белый список (ТЗ 8.1): типизированный листинг с одним «чистым» параметром → 301 на ЧПУ-лендинг.
 * ?rooms=2+1 → …/apartments/2-bedrooms/, ?price_to=150000 → …/price-to-150000/, ?citizenship=1 → …/citizenship/.
 */
export function whitelistFeature(cat: Cat & { deal: Deal }, sp: URLSearchParams): FeatureSlug | null {
  if (!cat.type || cat.feature) return null;
  const keys = [...new Set([...sp.keys()])];
  if (keys.length !== 1) return null;
  const k = keys[0];
  const vals = sp.getAll(k);
  if (vals.length !== 1) return null;
  const v = vals[0];
  const ROOMS: Record<string, FeatureSlug> = { '1+1': '1-bedroom', '2+1': '2-bedrooms', '3+1': '3-bedrooms', '4+': '4-bedrooms' };
  let f: FeatureSlug | null = null;
  if (k === 'rooms') f = ROOMS[v] ?? null;
  else if (k === 'price_to' && ['100000', '150000', '200000'].includes(v)) f = `price-to-${v}` as FeatureSlug;
  else if (k === 'citizenship' && v === '1' && cat.deal === 'sale') f = 'citizenship';
  const def = f ? featureDef(f) : null;
  return def && featureAllowed(def, cat.deal, cat.type, cat.country) ? def.slug : null;
}
