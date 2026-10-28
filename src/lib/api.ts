// Слой данных. Сайт знает только эти функции и типы; откуда берутся данные
// (API dev-сайта, свой API, CRM) — решается здесь. Когда придёт инструкция по
// своему API, меняется только этот файл.

import { areaRu, cityRu, COUNTRY_BY_CITY, typeInfo, type TypeGroup } from './dict';

import fxHeaderMenu from '../content/fixtures/header-menu.json';
import fxHomeSections from '../content/fixtures/home-sections.json';
import fxNews from '../content/fixtures/news.json';
import fxProjects from '../content/fixtures/projects.json';
import fxSale from '../content/fixtures/sale.json';
import fxRental from '../content/fixtures/rental.json';
import fxUnits from '../content/fixtures/units.json';
import fxUnitsCitizenship from '../content/fixtures/units-citizenship.json';

const BASE = (import.meta.env.STAY_API_BASE as string | undefined) || 'https://dev.stayproperty.com';
const TTL = 10 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

export async function getJson<T>(path: string, tries = 3, timeout = 5_000): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + path, { signal: AbortSignal.timeout(timeout) });
      if (r.status === 404) throw Object.assign(new Error('not found'), { notFound: true });
      if (!r.ok) throw new Error(`API ${r.status} ${path}`);
      const j = (await r.json()) as { success?: boolean; data: T };
      return j.data;
    } catch (e) {
      if ((e as { notFound?: boolean }).notFound) throw e;
      last = e;
      await new Promise((res) => setTimeout(res, 400 * (i + 1)));
    }
  }
  throw last;
}

/** Берёт данные из API, при ошибке — из сохранённого снимка. */
/** Сбросить данные в памяти (после вебхука revalidate). Последняя копия остаётся запасной на случай сбоя API. */
export function expireCache() {
  for (const v of cache.values()) v.at = 0;
}

export async function cached<T>(key: string, load: () => Promise<T>, fallback?: () => T): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  try {
    const value = await load();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (e) {
    // API недоступен: отдаём последнюю удачную копию, потом снимок (не 404 при первом сбое — ТЗ 2.6 п. 7).
    if (hit) return hit.value as T;
    if (fallback) return fallback();
    throw e;
  }
}

/* ---------- Типы, с которыми работает сайт ---------- */

export interface Listing {
  id: string;
  code: string | null;
  title: string;
  operation: 'sale' | 'rental';
  rooms: string | null;
  typeLabel: string;
  typeGroup: TypeGroup;
  rawType: string | null;
  country: string | null;
  city: string | null;
  area: string | null;
  price: number | null;
  totalArea: number | null;
  distanceToSea: number | null;
  floor: number | null;
  ref: string | null;
  isPrivate: boolean;
  discount: number | null;
  image: string | null;
  url: string;
  project?: ListingProject | null;
}

export interface ListingDetail extends Listing {
  images: string[];
  html: string;
  yearBuilt: string | null;
  region: string | null;
  infrastructure: string[];
  pricePerSquare: number | null;
}

/** Проект, к которому относится квартира (только для квартир в проектах Stay). */
export interface ListingProject { code: string; name: string; url: string }

export interface ProjectUnit {
  type: string;
  rooms: string | null;
  areaFrom: number | null;
  priceFrom: number | null;
  currency: string;
}

export interface Project {
  id: number;
  code: string;
  slug: string;
  title: string;
  city: string | null;
  area: string | null;
  priceFromLabel: string | null;
  priceFrom: number | null;
  image: string | null;
  lat: number | null;
  lng: number | null;
  action: string | null;
  isPrivate: boolean;
  units: ProjectUnit[];
  rooms: string[];
  url: string;
}

export interface NewsItem {
  id: number;
  langs: string[];
  updated: string;
  seoTitle: string | null;
  seoDescription: string | null;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  date: string;
  url: string;
}

export interface MenuItem { id: number; label: string; href: string }

/* ---------- Нормализация ---------- */

type RawListing = Record<string, any>;

function toListing(x: RawListing): Listing {
  const t = typeInfo(x.propertyType);
  const city = cityRu(x.city);
  const op = x.operation === 'rental' ? 'rental' : 'sale';
  return {
    id: String(x.id),
    code: x.code ?? null,
    title: (x.title || '').trim() || `${t.label}${x.roomLabel ? ' ' + x.roomLabel : ''}`,
    operation: op,
    rooms: x.roomLabel ?? null,
    typeLabel: t.label,
    typeGroup: t.group,
    rawType: x.propertyType ?? null,
    country: city ? COUNTRY_BY_CITY[city] ?? null : null,
    city,
    area: areaRu(x.area),
    price: typeof x.price === 'number' ? x.price : x.price ? Number(x.price) : null,
    totalArea: x.totalArea ?? null,
    distanceToSea: x.distanceToSea ?? null,
    floor: x.floor ?? null,
    ref: x.objectCode ?? null,
    isPrivate: !!x.isPrivate,
    discount: x.discount ?? null,
    image: fixImage(x.imageUrl),
    url: `/${op === 'rental' ? 'rental' : 'sale'}/${x.id}/`,
  };
}

export function fixImage(u?: string | null): string | null {
  if (!u) return null;
  return u.replace(/([^:])\/\/+/g, '$1/');
}

function parseEuro(label?: string | null): number | null {
  if (!label) return null;
  const n = Number(label.replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function slugify(code: string) {
  return code.replace(/_/g, '-').replace(/-+$/, '').toLowerCase();
}

function toProject(x: RawListing): Project {
  const units: ProjectUnit[] = (x.apartments || []).map((a: any) => ({
    type: a.objectType,
    rooms: a.roomLabel ?? null,
    areaFrom: a.areaFrom ?? null,
    priceFrom: a.priceFrom ?? null,
    currency: a.currency || '€',
  }));
  const rooms = [...new Set(units.map((u) => u.rooms).filter(Boolean) as string[])].sort();
  const minUnit = units.map((u) => u.priceFrom).filter((p): p is number => !!p).sort((a, b) => a - b)[0];
  const slug = slugify(x.code);
  return {
    id: x.id,
    code: x.code,
    slug,
    title: x.title,
    city: cityRu(x.city),
    area: areaRu(x.area),
    priceFromLabel: x.priceFrom || null,
    priceFrom: minUnit ?? parseEuro(x.priceFrom),
    image: fixImage(x.imageUrl),
    lat: x.latitude ?? null,
    lng: x.longitude ?? null,
    action: x.actionLabel || null,
    isPrivate: !!x.isPrivate,
    units,
    rooms,
    url: `/complex/project/${slug}/`,
  };
}

function toNews(x: RawListing): NewsItem {
  return {
    id: x.id,
    slug: x.slug,
    title: x.title,
    excerpt: x.excerpt || '',
    content: x.content || '',
    image: fixImage(x.coverImageUrl || x.imageUrl || x.image || null),
    date: x.publishedAt || x.updatedAt || '',
    updated: x.updatedAt || x.publishedAt || '',
    langs: x.availableLanguages || ['ru'],
    seoTitle: x.seoTitle || null,
    seoDescription: x.seoDescription || null,
    url: `/${x.languageCode || 'ru'}/blog/news/${x.slug}/`,
  };
}

/* ---------- Публичные функции ---------- */

export async function getServiceMenu(): Promise<MenuItem[]> {
  const d = await cached('menu', () => getJson<{ items: MenuItem[] }>('/api/header-menu?language=ru'), () => fxHeaderMenu as any);
  return d.items;
}

export interface HomeSections {
  buyVariants: { id: string; title: string; description: string | null; imageUrl: string | null }[];
  company: { title: string; description: string; metrics: { label: string; value: string }[]; imageUrls: string[] };
}

export async function getHomeSections(): Promise<HomeSections> {
  return cached('home-sections', () => getJson<HomeSections>('/api/home-sections?lang=ru'), () => fxHomeSections as any);
}

export async function getProjects(): Promise<Project[]> {
  const d = await cached('projects', () => getJson<{ items: RawListing[] }>('/api/projects'), () => fxProjects as any);
  return d.items.filter((x: RawListing) => x.isActive !== false).map(toProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getProjects();
  const s = slugify(slug);
  return all.find((p) => p.slug === s) ?? null;
}

export type { RawListing };

/** Сырые записи API (все объекты сделки). */
export async function rawListings(operation: 'sale' | 'rental'): Promise<RawListing[]> {
  return cached(
    `listings-${operation}`,
    async () => {
      const items: RawListing[] = [];
      for (let page = 1; page < 20; page++) {
        const d = await getJson<{ items: RawListing[]; total: number }>(
          `/api/sale?source=portfolio&language=ru&operation=${operation}&limit=500&page=${page}`,
        );
        items.push(...d.items);
        if (items.length >= d.total || d.items.length === 0) break;
      }
      return items;
    },
    () => (operation === 'sale' ? fxSale : fxRental) as RawListing[],
  );
}

/** id объектов, у которых есть перевод на язык (непустой title в выдаче этого языка) — для sitemap. */
export async function translatedIds(operation: 'sale' | 'rental', lang: string): Promise<Set<string>> {
  const list = await cached(`listings-${operation}-${lang}-ids`, async () => {
    const ids: string[] = [];
    let n = 0;
    for (let page = 1; page < 20; page++) {
      const d = await getJson<{ items: RawListing[]; total: number }>(`/api/sale?source=portfolio&language=${lang}&operation=${operation}&limit=500&page=${page}`);
      n += d.items.length;
      for (const x of d.items) if (String(x.title || '').trim()) ids.push(String(x.id));
      if (n >= d.total || d.items.length === 0) break;
    }
    return ids;
  });
  return new Set(list);
}

async function allListings(operation: 'sale' | 'rental'): Promise<Listing[]> {
  return (await rawListings(operation)).map(toListing);
}

export interface ListingQuery {
  operation: 'sale' | 'rental';
  /** «Лоты PRIVE»: только квартиры в закрытых проектах. */
  prive?: boolean;
  /** «Гражданство ТР»: квартиры, дающие право на гражданство Турции. */
  citizenship?: boolean;
  group?: TypeGroup | 'all';
  country?: string;
  city?: string;
  area?: string;
  ref?: string;
  priceFrom?: number;
  priceTo?: number;
  rooms?: string[];
  seaFrom?: number;
  seaTo?: number;
  sort?: 'new' | 'price-asc' | 'price-desc' | 'area-desc' | 'sea-asc';
  page?: number;
  perPage?: number;
}

export interface Facets {
  countries: string[];
  cities: { name: string; country: string | null }[];
  areas: { name: string; city: string | null }[];
  priceMin: number;
  priceMax: number;
  seaMin: number;
  seaMax: number;
}

function roomsBucket(r: string | null): string | null {
  if (!r) return null;
  if (r === '1+0') return 'studio';
  const n = Number(r.split('+')[0]);
  if (!Number.isFinite(n)) return null;
  return n >= 4 ? '4+' : `${n}+1`;
}

/*
 * Квартиры в проектах Stay (Битрикс). Признаки PRIVE и «Гражданство ТР» есть
 * только у них, поэтому переключатели фильтра работают по этому списку — как на прод.
 * Постраничная выдача у этого источника на dev не работает, поэтому забираем
 * всё окнами по цене (в каждом окне меньше 500 квартир).
 */
const UNIT_WINDOWS: [number, number][] = [[0, 120000], [120001, 180000], [180001, 260000], [260001, 400000], [400001, 0]];

function toUnit(x: RawListing): Listing {
  const duplex = /дуплекс/i.test(x.objectType || '');
  const city = cityRu(x.city);
  const projectSlug = x.projectCode ? String(x.projectCode).replace(/_/g, '-').replace(/-+$/, '').toLowerCase() : null;
  return {
    id: `u${x.id}`,
    code: x.code ?? null,
    title: (x.title || '').trim() || `${duplex ? 'Дуплекс' : 'Квартира'} ${x.roomLabel ?? ''}`.trim(),
    operation: 'sale',
    rooms: x.roomLabel ?? null,
    typeLabel: duplex ? 'Дуплекс' : 'Квартира',
    typeGroup: duplex ? 'duplexes' : 'apartments',
    rawType: x.objectType ?? null,
    country: city ? COUNTRY_BY_CITY[city] ?? null : null,
    city,
    area: areaRu(x.area),
    price: typeof x.price === 'number' ? x.price : x.price ? Number(x.price) : null,
    totalArea: x.totalArea ?? null,
    distanceToSea: x.distanceToSea ?? null,
    floor: x.floor != null && x.floor !== '' ? Math.round(Number(x.floor)) || null : null,
    ref: x.objectCode ?? null,
    isPrivate: !!x.isPrivate,
    discount: x.discount ?? null,
    image: fixImage(x.imageUrl),
    url: `/sale/u${x.id}/`,
    project: projectSlug ? { code: x.projectCode, name: String(x.projectName || '').trim(), url: `/complex/project/${projectSlug}/` } : null,
  };
}

export async function rawUnits(): Promise<RawListing[]> {
  return cached(
    'units',
    async () => {
      const seen = new Map<string, RawListing>();
      for (const [from, to] of UNIT_WINDOWS) {
        const q = (from ? `&cs_price_from=${from}` : '') + (to ? `&cs_price_to=${to}` : '');
        const d = await getJson<{ items: RawListing[]; total: number }>(`/api/sale?source=bitrix&language=ru&operation=sale&limit=500${q}`, 3, 60_000);
        if (d.total > d.items.length) throw new Error('units window too big');
        d.items.forEach((x) => seen.set(String(x.id), x));
      }
      return [...seen.values()];
    },
    () => fxUnits as RawListing[],
  );
}

async function allUnits(): Promise<Listing[]> {
  return (await rawUnits()).map(toUnit);
}

export async function citizenshipIds(): Promise<Set<string>> {
  const ids = await cached(
    'units-citizenship',
    async () => {
      const d = await getJson<{ items: RawListing[]; total: number }>(`/api/sale?source=bitrix&language=ru&operation=sale&limit=500&citizenship=1`, 3, 60_000);
      return d.items.map((x) => String(x.id));
    },
    () => fxUnitsCitizenship as string[],
  );
  return new Set(ids.map((id) => `u${id}`));
}

export async function searchListings(q: ListingQuery) {
  const useUnits = q.operation === 'sale' && (q.prive || q.citizenship);
  let all = useUnits ? await allUnits() : await allListings(q.operation);
  if (useUnits && q.prive) all = all.filter((x) => x.isPrivate);
  if (useUnits && q.citizenship) {
    const ids = await citizenshipIds();
    all = all.filter((x) => ids.has(x.id));
  }
  const per = q.perPage ?? 24;
  const ref = q.ref?.trim().toLowerCase();
  let items = all.filter((x) => {
    if (q.group && q.group !== 'all' && x.typeGroup !== q.group) return false;
    if (q.country && x.country !== q.country) return false;
    if (q.city && x.city !== q.city) return false;
    if (q.area && x.area !== q.area) return false;
    if (ref && !(x.ref?.toLowerCase().includes(ref) || x.id === ref)) return false;
    if (q.priceFrom && (x.price ?? 0) < q.priceFrom) return false;
    if (q.priceTo && (x.price ?? Infinity) > q.priceTo) return false;
    if (q.seaFrom && (x.distanceToSea ?? 0) < q.seaFrom) return false;
    if (q.seaTo && (x.distanceToSea ?? Infinity) > q.seaTo) return false;
    if (q.rooms?.length && !q.rooms.includes(roomsBucket(x.rooms) ?? '')) return false;
    return true;
  });
  if (q.sort === 'price-asc') items = items.toSorted((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (q.sort === 'price-desc') items = items.toSorted((a, b) => (b.price ?? 0) - (a.price ?? 0));
  if (q.sort === 'area-desc') items = items.toSorted((a, b) => (b.totalArea ?? 0) - (a.totalArea ?? 0));
  if (q.sort === 'sea-asc') items = items.toSorted((a, b) => (a.distanceToSea ?? Infinity) - (b.distanceToSea ?? Infinity));
  const total = items.length;
  const page = Math.max(1, q.page ?? 1);
  return { total, page, pages: Math.max(1, Math.ceil(total / per)), items: items.slice((page - 1) * per, page * per) };
}

export async function getFacets(operation: 'sale' | 'rental'): Promise<Facets> {
  const all = await allListings(operation);
  const count = <T,>(arr: T[]) => {
    const m = new Map<T, number>();
    arr.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  };
  const cities = new Map<string, string | null>();
  const areas = new Map<string, string | null>();
  for (const x of all) {
    if (x.city) cities.set(x.city, x.country);
    if (x.area) areas.set(x.area, x.city);
  }
  const prices = all.map((x) => x.price).filter((p): p is number => !!p);
  const seas = all.map((x) => x.distanceToSea).filter((p): p is number => !!p);
  return {
    countries: count(all.map((x) => x.country).filter(Boolean) as string[]),
    cities: count(all.map((x) => x.city).filter(Boolean) as string[]).map((name) => ({ name, country: cities.get(name) ?? null })),
    areas: [...areas.entries()].map(([name, city]) => ({ name, city })).sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    seaMin: Math.min(...seas),
    seaMax: Math.max(...seas),
  };
}

export async function getListing(id: string, operation: 'sale' | 'rental'): Promise<ListingDetail | null> {
  if (/^u\d+$/.test(id)) {
    if (operation !== 'sale') return null;
    const x = (await allUnits()).find((u) => u.id === id);
    if (!x) return null;
    const p = x.project ? await getProject(x.project.code.replace(/_/g, '-').replace(/-+$/, '').toLowerCase()) : null;
    return { ...x, images: x.image ? [x.image] : p?.image ? [p.image] : [], html: '', yearBuilt: null, region: null, infrastructure: [], pricePerSquare: x.price && x.totalArea ? Math.round(x.price / x.totalArea) : null };
  }
  const key = `listing-${operation}-${id}`;
  try {
    const d = await cached(key, () =>
      getJson<{ item: RawListing }>(`/api/sale/${encodeURIComponent(id)}?source=portfolio&language=ru&operation=${operation}`),
    );
    const x = d.item;
    return {
      ...toListing(x),
      images: (x.imageUrls || [x.imageUrl]).filter(Boolean).map((u: string) => fixImage(u)!),
      html: x.detailText || '',
      yearBuilt: x.yearBuilt ?? null,
      region: x.regionName ?? null,
      infrastructure: x.infrastructure || [],
      pricePerSquare: x.pricePerSquare ?? null,
    };
  } catch {
    // API недоступен или объекта нет — показываем то, что есть в списке.
    const fromList = (await allListings(operation)).find((x) => x.id === id);
    if (!fromList) return null;
    return { ...fromList, images: fromList.image ? [fromList.image] : [], html: '', yearBuilt: null, region: null, infrastructure: [], pricePerSquare: null };
  }
}

export async function getSimilar(item: Listing, limit = 3): Promise<Listing[]> {
  const all = item.id.startsWith('u') ? await allUnits() : await allListings(item.operation);
  return all
    .filter((x) => x.id !== item.id && x.typeGroup === item.typeGroup && x.city === item.city)
    .sort((a, b) => Math.abs((a.price ?? 0) - (item.price ?? 0)) - Math.abs((b.price ?? 0) - (item.price ?? 0)))
    .slice(0, limit);
}

export async function getNews(limit = 200): Promise<NewsItem[]> {
  const d = await cached('news', () => getJson<{ news: RawListing[] }>(`/api/news?language=ru&limit=200`), () => fxNews as any);
  return d.news.map(toNews).slice(0, limit);
}

/** Новости на языке страницы (API отдаёт переводы и список доступных языков). */
export async function getNewsL(lang: string, limit = 200): Promise<NewsItem[]> {
  try {
    const d = await cached(`news-${lang}`, () => getJson<{ news: RawListing[] }>(`/api/news?language=${lang}&limit=200`));
    return d.news.filter((x) => !x.languageCode || x.languageCode === lang).map(toNews).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  } catch {
    return lang === 'ru' ? getNews(limit) : [];
  }
}

export async function getNewsItemL(lang: string, slug: string): Promise<NewsItem | null> {
  try {
    const d = await cached(`news-${lang}-${slug}`, () => getJson<RawListing>(`/api/news/${encodeURIComponent(slug)}?language=${lang}`));
    const x = (d as any).item ?? d;
    if (x.languageCode && x.languageCode !== lang) return null;
    return toNews(x);
  } catch {
    return (await getNewsL(lang)).find((n) => n.slug === slug) ?? null;
  }
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  try {
    const d = await cached(`news-${slug}`, () => getJson<RawListing>(`/api/news/${encodeURIComponent(slug)}?language=ru`));
    return toNews(d);
  } catch {
    return (await getNews()).find((n) => n.slug === slug) ?? null;
  }
}

/* ---------- Страница жилого комплекса ---------- */

export interface ComplexSector {
  id: string;
  title: string;
  buildings: { id: string; title: string; summaries: { name: string; minPrice: string; minArea: string }[] }[];
}

export interface ComplexDetail extends Project {
  heroImages: string[];
  facts: { label: string; value: string }[];
  promo: string | null;
  introHtml: string;
  gallery: string[];
  video: string | null;
  finishingHtml: string | null;
  infrastructure: { title: string; html: string; images: string[] }[];
  amenities: string[];
  installment: { initialPay: number | null; months: number | null; conditions: string | null } | null;
  paymentCards: { title: string; description: string; theme: string; buttonLabel?: string }[];
  genplan: { svg: string; sectors: ComplexSector[] } | null;
}

export async function getComplex(slug: string): Promise<ComplexDetail | null> {
  const base = await getProject(slug);
  const code = base?.code ?? slug.replace(/-/g, '_');
  let x: RawListing | null = null;
  try {
    const d = await cached(`complex-${code}`, () => getJson<{ item: RawListing }>(`/api/complex-projects/${encodeURIComponent(code)}?language=ru`));
    x = d.item;
  } catch {
    x = null;
  }
  if (!x && !base) return null;
  const p = base ?? toProject({ ...x, apartments: x?.apartments, priceFrom: null });
  const map = x?.map;
  const ab = x?.actionBlock;
  return {
    ...p,
    heroImages: (x?.heroImages || []).map((u: string) => fixImage(u)!).filter(Boolean),
    facts: (x?.heroFacts || []).filter((f: any) => f.value),
    promo: x?.promoLabel || null,
    introHtml: x?.intro?.bodyText || '',
    gallery: (x?.galleryImages || []).map((u: string) => fixImage(u)!).filter(Boolean),
    video: x?.videoUrl || null,
    finishingHtml: x?.finishing?.description || null,
    infrastructure: (x?.infrastructureCards || []).map((c: any) => ({ title: c.title, html: c.description || '', images: (c.galleryImages || []).map((u: string) => fixImage(u)!) })),
    amenities: x?.amenities || [],
    installment: ab ? { initialPay: ab.initialPay ?? null, months: ab.periodMonths ?? null, conditions: ab.conditions ?? null } : null,
    paymentCards: x?.paymentCards || [],
    genplan: map?.svg ? { svg: map.svg, sectors: map.sectors || [] } : null,
    lat: map?.latitude ?? p.lat,
    lng: map?.longitude ?? p.lng,
  };
}

/* ---------- Карточка объекта на языке страницы ---------- */

export interface DetailL {
  title: string;
  html: string;
  images: string[];
  yearBuilt: string | null;
  region: string | null;
  infrastructure: string[];
  pricePerSquare: number | null;
  video: string | null;
  updated: string | null;
}

/** Описание объекта на языке lang; null — перевода нет (API отдаёт пустой заголовок). */
export async function getDetailL(id: string, operation: 'sale' | 'rental', lang: string): Promise<DetailL | null> {
  const key = `detail-${operation}-${id}-${lang}`;
  try {
    const d = await cached(key, () => getJson<{ item: RawListing }>(`/api/sale/${encodeURIComponent(id)}?source=portfolio&language=${lang}&operation=${operation}`, 2, 5_000));
    const x = d.item;
    if (!x || !String(x.title || '').trim()) return null;
    return {
      title: String(x.title).trim(),
      html: x.detailText || '',
      images: (x.imageUrls || [x.imageUrl]).filter(Boolean).map((u: string) => fixImage(u)!),
      yearBuilt: x.yearBuilt ?? null,
      region: x.regionName ?? null,
      infrastructure: x.infrastructure || [],
      pricePerSquare: x.pricePerSquare != null ? Number(x.pricePerSquare) || null : null,
      video: x.videoUrl || x.video || null,
      updated: x.updatedAt || null,
    };
  } catch {
    return null;
  }
}
