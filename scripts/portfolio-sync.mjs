#!/usr/bin/env node
/**
 * Забирает объекты напрямую из Stay Portfolio API (https://portfolio.stayrepo.com/ws/)
 * и складывает снимок в STAY_DATA_DIR/portfolio/ — без dev.stayproperty.com.
 *
 *   node --env-file=/home/stay/stay.env scripts/portfolio-sync.mjs          # обычный запуск (только изменённые)
 *   node --env-file=/home/stay/stay.env scripts/portfolio-sync.mjs --full   # перечитать все объекты
 *   ... --limit=20                                                          # проба на первых 20 (снимок не заменяет)
 *
 * Нужны переменные: STAY_PORTFOLIO_USER, STAY_PORTFOLIO_PASSWORD, STAY_PORTFOLIO_TOKEN
 * (необязательно STAY_PORTFOLIO_BASE). Секреты — только в stay.env на сервере.
 *
 * Что получается (формат тот же, что раньше отдавал dev, сайт читает его через src/lib/portfolioSnapshot.ts):
 *   portfolio/sale.json, portfolio/rental.json — карточки объектов (как /api/sale?source=portfolio&language=ru);
 *   portfolio/objects/<id>.json               — описание, фото, переводы на 5 языков;
 *   portfolio/meta.json                       — когда обновлено, сколько объектов, сколько пропущено.
 *
 * Логика разбора повторяет импорт, который dev уже проверил на этом API:
 * POST /objects/query (по 50) → GET /objects/get (i18n, meta, фото) → GET /objects/get_terms по нужным таксономиям.
 * Продажа/аренда — таксономия offer_type (216 — продажа, 214/215 — аренда); ЖК (термин 131 в таксономии 1) не выводим.
 *
 * Защита: если объектов пришло меньше половины от прошлого снимка — снимок не заменяем (сбой API).
 * После обновления дёргает /api/revalidate на этом же сервере (если задан REVALIDATE_SECRET или CRON_SECRET).
 * Затем заранее готовит лёгкие копии главных фото для плиток (640 и 960 px, через /img этого сервера), чтобы
 * каталог открывался быстро и у первого посетителя (STAY_WARM_IMAGES=0 — не готовить).
 * После ночной полной загрузки (--full) чистит копии картинок, которые не открывали 60 дней (scripts/img-cache-clean.mjs).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanImgCache } from './img-cache-clean.mjs';

const args = new Set(process.argv.slice(2));
const FULL = args.has('--full');
const LIMIT = Number([...args].find((a) => a.startsWith('--limit='))?.split('=')[1] || 0);
const BASE = (process.env.STAY_PORTFOLIO_BASE || 'https://portfolio.stayrepo.com/ws').replace(/\/$/, '');
const USER = process.env.STAY_PORTFOLIO_USER;
const PASS = process.env.STAY_PORTFOLIO_PASSWORD;
const TOKEN = process.env.STAY_PORTFOLIO_TOKEN;
const DATA = path.resolve(process.env.STAY_DATA_DIR || 'data');
const OUT = path.join(DATA, 'portfolio');
const LANGS = ['ru', 'en', 'tr', 'de', 'sr'];
const PAGE = 50;
const PARALLEL = Number(process.env.STAY_PORTFOLIO_PARALLEL || 4);

// Проверенные в dev значения справочников Portfolio.
const TAX_CLASS = 1; // в ней термин 131 = ЖК (проект), остальное — объекты
const TAX_LOCATION = 2; // страна → город → район
const TAX_CURRENCY = 4;
const TAX_ROOMS = 15; // планировка 1+1, 2+1 …
const PROJECT_TERM = 131;
const OFFER_SALE = [216];
const OFFER_RENT = [214, 215];

if (!USER || !PASS || !TOKEN) {
  console.error('Нет STAY_PORTFOLIO_USER / STAY_PORTFOLIO_PASSWORD / STAY_PORTFOLIO_TOKEN — пропускаю.');
  process.exit(2);
}

/* ---------- HTTP: вход, cookie, повторы ---------- */

let cookie = '';
async function login() {
  const r = await fetch(`${BASE}/login/auth`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USER, password: PASS }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw new Error(`Вход в Portfolio не удался: ${r.status}`);
  cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';', 1)[0]).filter(Boolean).join('; ');
  if (!cookie) throw new Error('Portfolio принял вход, но не выдал cookie сессии.');
}

async function api(p, body, relogin = true) {
  if (!cookie) await login();
  for (let attempt = 0; ; attempt++) {
    let r;
    try {
      r = await fetch(BASE + p, {
        method: body ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json', Cookie: cookie, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (e) {
      if (attempt < 2) { await sleep(500 * 2 ** attempt); continue; }
      throw e;
    }
    if (r.status === 401 && relogin) { cookie = ''; await login(); return api(p, body, false); }
    if ([429, 502, 503, 504].includes(r.status) && attempt < 2) { await sleep(1000 * 2 ** attempt); continue; }
    if (!r.ok) throw Object.assign(new Error(`Portfolio ${p}: ${r.status}`), { status: r.status });
    return parseLoose(await r.text(), p);
  }
}

/** Portfolio (PHP) иногда дописывает перед JSON предупреждения вида «<br /><b>Warning</b>…» — отрезаем их. */
function parseLoose(t, p) {
  try { return JSON.parse(t); } catch { /* ниже */ }
  for (let i = t.indexOf('{'); i >= 0; i = t.indexOf('{', i + 1)) {
    if (!/^\{\s*"/.test(t.slice(i))) continue;
    try { return JSON.parse(t.slice(i)); } catch { /* следующий */ }
  }
  throw new Error(`Portfolio ${p}: ответ не JSON (${t.slice(0, 80).replace(/\s+/g, ' ')})`);
}
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------- Разбор ---------- */

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const text = (...vs) => { for (const v of vs) if (typeof v === 'string' && v.trim()) return v.trim(); return null; };
function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string' || !v.trim()) return null;
  const n = Number(v.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
function urls(v) {
  const out = [];
  const visit = (x) => {
    if (typeof x === 'string' && /^https?:\/\//i.test(x) && !x.includes('/states/docs.php')) out.push(x);
    else if (Array.isArray(x)) x.forEach(visit);
    else if (x && typeof x === 'object') Object.values(x).forEach(visit);
  };
  visit(v);
  return [...new Set(out)];
}

/** Переводы: i18n.post_title = { ru, en, … } (так отдаёт API) или i18n.ru.post_title. */
function translations(d) {
  const i = obj(d.i18n ?? d.translations);
  const out = {};
  for (const l of LANGS) {
    const title = text(obj(i.post_title)[l], obj(i[l]).post_title, obj(i[l]).title);
    const content = text(obj(i.post_content)[l], obj(i[l]).post_content, obj(i[l]).content);
    if (title || content) out[l] = { title, content };
  }
  return out;
}

// Как на dev: русские названия городов и районов Аланьи, остальное — как в Portfolio.
const PLACE_RU = {
  alanya: 'Аланья', antalya: 'Анталья', side: 'Сиде', gazipasa: 'Газипаша', payallar: 'Паяллар', kargicak: 'Каргыджак',
  oba: 'Оба', mahmutlar: 'Махмутлар', konakli: 'Конаклы', turkler: 'Тюрклер', ciplakli: 'Чыплаклы',
};
const placeRu = (v) => (v ? PLACE_RU[v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')] || v : null);
const termLabel = (t) => (t ? t.translation || t.name || null : null);

function location(terms) {
  const root = terms.find((t) => Number(t.parent) === 0);
  const city = terms.find((t) => root && Number(t.parent) === Number(root.term_id));
  const area = terms.find((t) => city && Number(t.parent) === Number(city.term_id));
  return { country: termLabel(root), city: placeRu(termLabel(city)), area: placeRu(termLabel(area)) };
}

let taxBySlug = new Map();
async function loadTaxonomies() {
  const r = await api('/taxonomy/list');
  const list = Array.isArray(r?.result) ? r.result : [];
  taxBySlug = new Map(list.map((t) => [String(t.slug), Number(t.taxonomy_id)]));
  if (!taxBySlug.has('offer_type')) throw new Error('В Portfolio нет таксономии offer_type — формат API изменился.');
}
const taxId = (...slugs) => slugs.map((s) => taxBySlug.get(s)).find((x) => Number.isFinite(x));

async function terms(id, tax) {
  if (!Number.isFinite(tax)) return [];
  const r = await api(`/objects/get_terms?object_id=${id}&taxonomy_id=${tax}&language=en`);
  return Array.isArray(r?.result) ? r.result : [];
}

/** Один объект → { card (как в ленте dev), detail (описание, фото, переводы) } или null, если это ЖК / не продажа и не аренда. */
async function readObject(listItem) {
  const id = Number(listItem.ID);
  const d = obj((await api(`/objects/get?object_id=${id}&i18n=true&object_meta=true&featured_image=large&gallery_images=large`))?.result);
  if (Number(d.ID) !== id) throw new Error(`объект ${id}: пустой ответ`);
  const status = String(d.post_status ?? listItem.post_status ?? 'publish').toLowerCase();
  if (!['publish', 'published'].includes(status)) return { skip: 'не опубликован' };

  const [cls, loc, cur, rooms, offer, type] = await Promise.all([
    terms(id, TAX_CLASS), terms(id, TAX_LOCATION), terms(id, TAX_CURRENCY), terms(id, TAX_ROOMS),
    terms(id, taxId('offer_type')), terms(id, taxId('object_type', 'object_types', 'property_type', 'property_types')),
  ]);
  if (cls.some((t) => Number(t.term_id) === PROJECT_TERM)) return { skip: 'ЖК' };
  const offerIds = offer.map((t) => Number(t.term_id));
  const operation = offerIds.some((x) => OFFER_SALE.includes(x)) ? 'sale' : offerIds.some((x) => OFFER_RENT.includes(x)) ? 'rental' : null;
  if (!operation) return { skip: 'нет типа сделки' };

  const meta = obj(d.post_meta);
  const tr = translations(d);
  const gallery = urls(meta.object_gallery ?? meta._thumbnail);
  const place = location(loc);
  const price = num(meta.sales_cost);
  const totalArea = num(meta.area_square);
  const code = d.post_name || listItem.post_name || String(id);
  const currency = String(meta.price_currency || meta.currency || termLabel(cur[0]) || '').trim().toUpperCase() || null;
  const card = {
    id: String(id),
    bitrixId: '',
    code,
    title: tr.ru?.title || '',
    projectBitrixId: null,
    projectCode: null,
    projectName: null,
    roomLabel: termLabel(rooms[0]),
    propertyType: termLabel(type[0]),
    city: place.city,
    area: place.area,
    operation,
    objectType: 'object',
    price,
    currency: /^[A-Z]{3}$/.test(currency || '') ? currency : null,
    totalArea,
    distanceToSea: num(meta.distance_sea),
    floor: text(String(meta.floor ?? meta.floor_number ?? meta.storey ?? '')) ,
    objectCode: typeof meta.refno === 'string' && meta.refno.trim() ? meta.refno.trim() : code,
    buildName: null,
    isPrivate: false,
    discount: null,
    // Поле «Актуальность» (relevance = sold): объект продан — сайт пишет «Продано» вместо цены.
    ...(String(meta.relevance ?? '').trim().toLowerCase() === 'sold' ? { sold: true } : {}),
    imageUrl: gallery[0] || (typeof meta._thumbnail === 'string' ? meta._thumbnail : null),
    detailUrl: `/${operation}/${id}?source=portfolio&language=ru`,
    langs: LANGS.filter((l) => tr[l]?.title),
    modified: d.post_modified_gmt || d.post_modified || listItem.post_modified_gmt || listItem.post_modified || null,
  };
  const detail = {
    id: String(id),
    operation,
    i18n: tr,
    imageUrls: gallery,
    yearBuilt: meta.year_built ? String(meta.year_built) : null,
    regionName: [place.area, place.city].filter(Boolean).join(', ') || null,
    country: place.country,
    pricePerSquare: price && totalArea ? Math.round(price / totalArea) : null,
    videoUrl: text(meta.video_url, meta.video, meta.youtube) ,
    latitude: num(meta.latitude ?? meta.lat),
    longitude: num(meta.longitude ?? meta.lng),
    modified: card.modified,
  };
  return { card, detail };
}

/* ---------- Запуск ---------- */

async function readJson(f, fallback) {
  try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return fallback; }
}
async function writeJson(f, v) {
  const tmp = `${f}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(v));
  await fs.rename(tmp, f);
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; await fn(items[k], k); }
  }));
}

async function main() {
  const t0 = Date.now();
  await fs.mkdir(path.join(OUT, 'objects'), { recursive: true });
  await loadTaxonomies();

  // 1. Весь список (по 50).
  const list = [];
  let total = Infinity;
  for (let page = 1; list.length < total && page <= 200; page++) {
    const r = await api('/objects/query', { language: 'en', order: 'ASC', orderby: 'ID', page, paged_options: { results_per_page: PAGE } });
    const items = r?.result?.objects ?? [];
    total = Number(r?.result?.total_results ?? NaN);
    if (!Number.isFinite(total)) total = items.length < PAGE ? list.length + items.length : Infinity;
    list.push(...items);
    if (items.length === 0 || (LIMIT && list.length >= LIMIT)) break;
  }
  if (LIMIT) list.length = Math.min(list.length, LIMIT);

  // 2. Подробности: заново только изменённые (или все с --full).
  const prev = new Map([...(await readJson(path.join(OUT, 'sale.json'), [])), ...(await readJson(path.join(OUT, 'rental.json'), []))].map((c) => [c.id, c]));
  const prevMeta = await readJson(path.join(OUT, 'meta.json'), {});
  const cards = [];
  const skipped = {};
  const errors = [];
  let fetched = 0;
  await pool(list, PARALLEL, async (it) => {
    const id = String(it.ID);
    const mod = it.post_modified_gmt || it.post_modified || null;
    const old = prev.get(id);
    if (!FULL && old && mod && old.modified === mod) { cards.push(old); return; }
    if (!FULL && !old && prevMeta.skippedIds?.[id] && prevMeta.skippedIds[id] === mod) { skipped.cached = (skipped.cached || 0) + 1; return; }
    try {
      const r = await readObject(it);
      fetched++;
      if (r.skip) { skipped[r.skip] = (skipped[r.skip] || 0) + 1; (prevMeta.nextSkipped ??= {})[id] = mod; return; }
      if (!LIMIT) await writeJson(path.join(OUT, 'objects', `${id}.json`), r.detail);
      cards.push(r.card);
    } catch (e) {
      errors.push(`${id}: ${e.message}`);
      if (old) cards.push(old); // при сбое оставляем прошлую версию объекта
    }
  });

  const sale = cards.filter((c) => c.operation === 'sale').sort((a, b) => Number(b.id) - Number(a.id));
  const rental = cards.filter((c) => c.operation === 'rental').sort((a, b) => Number(b.id) - Number(a.id));
  const summary = { source: BASE, listed: list.length, sale: sale.length, rental: rental.length, fetched, skipped, errors: errors.length, seconds: Math.round((Date.now() - t0) / 1000) };

  if (LIMIT) {
    console.log(JSON.stringify({ probe: true, ...summary, sampleCard: cards[0] ?? null, errorSamples: errors.slice(0, 5) }, null, 2));
    return;
  }
  const prevCount = prev.size;
  if (prevCount && cards.length < prevCount / 2) {
    console.error(JSON.stringify({ status: 'rejected', reason: `объектов ${cards.length}, было ${prevCount} — похоже на сбой API, снимок не заменён`, ...summary }));
    process.exit(1);
  }
  if (!cards.length) {
    console.error(JSON.stringify({ status: 'rejected', reason: 'ни одного объекта', ...summary, errorSamples: errors.slice(0, 5) }));
    process.exit(1);
  }
  await writeJson(path.join(OUT, 'sale.json'), sale);
  await writeJson(path.join(OUT, 'rental.json'), rental);
  await writeJson(path.join(OUT, 'meta.json'), { syncedAt: new Date().toISOString(), ...summary, skippedIds: { ...(FULL ? {} : prevMeta.skippedIds), ...prevMeta.nextSkipped }, errorSamples: errors.slice(0, 20) });

  // Убрать файлы снятых объектов.
  const keep = new Set(cards.map((c) => `${c.id}.json`));
  for (const f of await fs.readdir(path.join(OUT, 'objects'))) if (f.endsWith('.json') && !keep.has(f)) await fs.rm(path.join(OUT, 'objects', f)).catch(() => {});

  // Сбросить кэш сайта.
  const secret = process.env.REVALIDATE_SECRET || process.env.CRON_SECRET;
  if (secret && fetched) {
    await fetch(`http://127.0.0.1:${process.env.PORT || 4321}/api/revalidate`, { headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(60_000) }).catch(() => {});
  }
  const warm = await warmTiles(cards).catch((e) => ({ error: e.message }));
  const clean = FULL ? await cleanImgCache({ days: 60 }).catch((e) => ({ error: e.message })) : undefined;
  console.log(JSON.stringify({ status: 'ok', ...summary, warm, clean }));
}

/**
 * Лёгкие копии главного фото каждой карточки (те же адреса, что строит плитка: src/components/Img.astro, q=75).
 * Уже приготовленные помним в portfolio/warmed.json и повторяем раз в 30 дней (это быстрый HIT, он же продлевает жизнь копии).
 * За один запуск — не больше 300 объектов, по 2 одновременно, чтобы не нагружать сервер.
 */
async function warmTiles(cards) {
  if (['0', 'false', 'no'].includes(String(process.env.STAY_WARM_IMAGES || '').toLowerCase())) return { skipped: 'off' };
  const file = path.join(OUT, 'warmed.json');
  const prev = await readJson(file, {});
  const now = Date.now();
  const srcs = [...new Set(cards.map((c) => c.imageUrl).filter((u) => typeof u === 'string' && u.startsWith('https://')).map((u) => u.replace(/([^:])\/\/+/g, '$1/')))];
  const next = {};
  for (const s of srcs) if (prev[s] && now - prev[s] < 30 * 86_400_000) next[s] = prev[s];
  const todo = srcs.filter((s) => !next[s]).slice(0, 300);
  const site = `http://127.0.0.1:${process.env.PORT || 4321}`;
  let ok = 0, fail = 0;
  await pool(todo, 2, async (src) => {
    let good = true;
    for (const w of [640, 960]) {
      const r = await fetch(`${site}/img?url=${encodeURIComponent(src)}&w=${w}&q=75`, { headers: { Accept: 'image/avif,image/webp,*/*' }, signal: AbortSignal.timeout(60_000) }).catch(() => null);
      if (r) await r.arrayBuffer().catch(() => {});
      if (!r?.ok) good = false;
    }
    if (good) { next[src] = now; ok++; } else fail++;
  });
  await writeJson(file, next);
  return { ready: Object.keys(next).length, of: srcs.length, warmedNow: ok, failed: fail };
}

main().catch((e) => { console.error(JSON.stringify({ status: 'failed', error: e.message })); process.exit(1); });
