/**
 * Прямое подключение к Stay Portfolio API (https://portfolio.stayrepo.com/ws/).
 *
 * Включается, только если заданы переменные окружения:
 *   STAY_PORTFOLIO_USER, STAY_PORTFOLIO_PASSWORD, STAY_PORTFOLIO_TOKEN
 * Без них сайт берёт объекты через BFF dev.stayproperty.com (как раньше).
 *
 * Порядок по инструкции: логин (POST /login/auth) → сессия в cookie →
 * во всех запросах заголовок Authorization: Bearer <JWT>.
 *
 * Названия полей объекта (meta) в Swagger не описаны, поэтому разбор сделан
 * «терпимым»: для каждого нашего поля перечислены вероятные ключи. После
 * первого запуска с ключами уточняем их скриптом scripts/portfolio-probe.mjs.
 */

const BASE = (import.meta.env?.STAY_PORTFOLIO_BASE ?? process.env.STAY_PORTFOLIO_BASE ?? 'https://portfolio.stayrepo.com/ws').replace(/\/$/, '');

function env(name: string): string | undefined {
  return (import.meta.env?.[name] as string | undefined) ?? process.env[name];
}

export function portfolioEnabled(): boolean {
  return !!(env('STAY_PORTFOLIO_USER') && env('STAY_PORTFOLIO_PASSWORD') && env('STAY_PORTFOLIO_TOKEN'));
}

interface ApiResponse<T> {
  status: number | string;
  statusText?: string;
  messageCode?: string | number;
  messageText?: string;
  result: T;
}

const jar = new Map<string, string>();
let loginAt = 0;
const SESSION_TTL = 20 * 60 * 1000;

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

function storeCookies(res: Response) {
  const list = (res.headers as any).getSetCookie?.() ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
  for (const c of list as string[]) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
}

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { Authorization: `Bearer ${env('STAY_PORTFOLIO_TOKEN')}`, Accept: 'application/json', ...extra };
  if (jar.size) h.Cookie = cookieHeader();
  return h;
}

function ok(d: ApiResponse<unknown>) {
  return d && (d.status === 200 || d.status === '200' || d.status === 'success' || d.statusText === 'OK' || d.result != null);
}

async function login(): Promise<void> {
  const username = env('STAY_PORTFOLIO_USER')!;
  const password = env('STAY_PORTFOLIO_PASSWORD')!;
  jar.clear();
  // В инструкции — JSON, в Swagger — form-urlencoded. Пробуем оба.
  const bodies: [string, string][] = [
    ['application/json', JSON.stringify({ username, password })],
    ['application/x-www-form-urlencoded', new URLSearchParams({ username, password }).toString()],
  ];
  let last = '';
  for (const [type, body] of bodies) {
    const res = await fetch(`${BASE}/login/auth`, { method: 'POST', headers: headers({ 'Content-Type': type }), body, signal: AbortSignal.timeout(15000) });
    storeCookies(res);
    const text = await res.text();
    if (res.ok) {
      try {
        if (ok(JSON.parse(text))) {
          loginAt = Date.now();
          return;
        }
      } catch {
        /* не JSON — пробуем следующий формат */
      }
    }
    last = `${res.status}`;
  }
  throw new Error(`Portfolio login failed (${last})`);
}

async function call<T>(path: string, init: { method?: string; json?: unknown } = {}, retry = true): Promise<T> {
  if (!loginAt || Date.now() - loginAt > SESSION_TTL) await login();
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? 'GET',
    headers: headers(init.json ? { 'Content-Type': 'application/json' } : {}),
    body: init.json ? JSON.stringify(init.json) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  storeCookies(res);
  if (res.status === 401 && retry) {
    loginAt = 0;
    return call<T>(path, init, false);
  }
  if (!res.ok) throw new Error(`Portfolio ${path}: ${res.status}`);
  const d = (await res.json()) as ApiResponse<T>;
  return d.result;
}

/* ---------- Разбор объекта ---------- */

type Obj = Record<string, any>;

/** Плоский доступ к значению: ищет ключ в корне, в object_meta и в i18n. */
function pick(o: Obj, keys: string[]): any {
  const pools = [o, o.object_meta ?? o.meta ?? {}, o.i18n?.ru ?? o.i18n ?? {}];
  for (const k of keys) {
    for (const p of pools) {
      let v = p?.[k];
      if (Array.isArray(v) && v.length === 1 && typeof v[0] !== 'object') v = v[0];
      if (v !== undefined && v !== null && v !== '') return v;
    }
  }
  return null;
}

/** Термины таксономий: { taxonomy_slug: [{ name }] } или массив. */
function term(o: Obj, taxonomies: string[]): string | null {
  const t = o.object_terms ?? o.terms;
  if (!t) return null;
  const list: Obj[] = Array.isArray(t) ? t : Object.entries(t).flatMap(([tax, arr]) => (Array.isArray(arr) ? arr.map((x: Obj) => ({ ...x, taxonomy: x.taxonomy ?? tax })) : []));
  for (const tax of taxonomies) {
    const hit = list.find((x) => [x.taxonomy, x.taxonomy_id, x.taxonomy_slug].some((v) => String(v ?? '').toLowerCase() === tax));
    if (hit) return hit.name ?? hit.title ?? hit.slug ?? null;
  }
  return null;
}

function numOrNull(v: any): number | null {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function img(v: any): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  return v.large ?? v.url ?? v.full ?? v.src ?? v.medium ?? null;
}

/** Приводит объект Portfolio к той же форме, что отдаёт BFF dev-сайта. */
export function toRaw(o: Obj, operation: 'sale' | 'rental'): Obj {
  const id = String(o.ID ?? o.id ?? o.object_id);
  const gallery = (o.gallery_images ?? []).map(img).filter(Boolean);
  return {
    id,
    code: pick(o, ['code', 'object_code', 'slug', 'name']),
    title: pick(o, ['title', 'post_title', 'name']) ?? '',
    roomLabel: pick(o, ['rooms', 'room_label', 'roomLabel', 'bedrooms']) ?? term(o, ['rooms']),
    propertyType: pick(o, ['property_type', 'propertyType', 'type']) ?? term(o, ['property_type', 'type', 'object_type']),
    city: pick(o, ['city']) ?? term(o, ['city', 'location']),
    area: pick(o, ['area', 'district']) ?? term(o, ['area', 'district']),
    operation,
    price: numOrNull(pick(o, ['price', 'price_eur', 'cs_price'])),
    totalArea: numOrNull(pick(o, ['total_area', 'area_total', 'square', 'size'])),
    distanceToSea: numOrNull(pick(o, ['distance_to_sea', 'distance', 'sea_distance'])),
    floor: numOrNull(pick(o, ['floor'])),
    objectCode: pick(o, ['object_code', 'ref', 'reference', 'code']),
    isPrivate: !!pick(o, ['is_private', 'private']),
    discount: numOrNull(pick(o, ['discount'])),
    imageUrl: img(o.featured_image) ?? gallery[0] ?? null,
    imageUrls: gallery.length ? gallery : undefined,
    detailText: pick(o, ['content', 'post_content', 'description']) ?? '',
    yearBuilt: pick(o, ['year_built', 'yearBuilt', 'build_year']),
    regionName: pick(o, ['region']),
  };
}

const OBJ_FLAGS = 'i18n=1&object_meta=1&featured_image=1&gallery_images=1&object_terms=1';

/** Все объекты по операции (продажа/аренда), постранично по 50. */
export async function portfolioList(operation: 'sale' | 'rental'): Promise<Obj[]> {
  const out: Obj[] = [];
  for (let page = 1; page <= 100; page++) {
    const r = await call<any>('/objects/query', {
      method: 'POST',
      json: { language: 'ru', order: 'DESC', orderby: 'modified', page, paged_options: { results_per_page: 50 } },
    });
    const items: Obj[] = Array.isArray(r) ? r : r?.objects ?? r?.items ?? r?.posts ?? [];
    out.push(...items);
    const total = Number(r?.found_posts ?? r?.total ?? NaN);
    if (items.length < 50 || (Number.isFinite(total) && out.length >= total)) break;
  }
  // Операция (продажа/аренда) — термин или поле; без признака считаем продажей.
  return out
    .map((o) => {
      const op = String(pick(o, ['operation', 'deal_type']) ?? term(o, ['operation', 'deal_type']) ?? 'sale').toLowerCase();
      return toRaw(o, /rent|аренд/.test(op) ? 'rental' : 'sale');
    })
    .filter((x) => x.operation === operation);
}

export async function portfolioGet(id: string, operation: 'sale' | 'rental'): Promise<Obj | null> {
  const r = await call<Obj>(`/objects/get/${encodeURIComponent(id)}?${OBJ_FLAGS}`);
  return r ? toRaw(r, operation) : null;
}
