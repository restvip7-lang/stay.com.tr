/**
 * GET /api/flat-pdf/{id}?lang=ru — PDF квартиры проекта STAY PROJECTS (кнопка «PDF» на карточке квартиры).
 * Только квартиры наших проектов; файл отдаётся на скачивание.
 */
import type { APIRoute } from 'astro';
import { isLang } from '../../../i18n/config';
import { t } from '../../../i18n/ui';
import { findItem, getComplexes, getUnits, isOurComplex, itemUrl, ownInfo } from '../../../lib/catalog';
import { getComplex } from '../../../lib/api';
import { cityBySlug, districtBySlug } from '../../../lib/geo';
import { TYPE_WORDS } from '../../../lib/segments';
import { moneyL, numL } from '../../../lib/format';
import { plansOf, floorPlanFor, flatNo } from '../../../lib/plans';
import { FLAT_UI } from '../../../lib/flatText';
import { flatPdf } from '../../../lib/flatPdf';

export const prerender = false;

const WINDOW = 10 * 60_000;
const LIMIT = 30;
const hits = new Map<string, number[]>();

export const GET: APIRoute = async ({ params, url, request, clientAddress }) => {
  let ip = 'x';
  try { ip = request.headers.get('x-real-ip') || clientAddress || 'x'; } catch { /* нет адреса */ }
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  if (list.length > LIMIT) return new Response('too many', { status: 429 });

  const lang = isLang(url.searchParams.get('lang')) ? (url.searchParams.get('lang') as Parameters<typeof itemUrl>[0]) : 'ru';
  const id = String(params.id ?? '');
  const x = /^u\d+$/.test(id) ? await findItem(id) : null;
  const complex = x?.complex ? (await getComplexes()).find((c) => c.code === x.complex && isOurComplex(c)) ?? null : null;
  if (!x || !complex) return new Response('not found', { status: 404 });

  const L = FLAT_UI[lang] ?? FLAT_UI.en;
  const [pd, info, plans, units] = await Promise.all([getComplex(complex.project.slug).catch(() => null), ownInfo().then((m) => m.get(complex.code) ?? null), plansOf(complex.code), getUnits()]);
  const city = cityBySlug(x.city)!;
  const district = x.district ? districtBySlug(x.city, x.district) : null;
  const place = [district?.name[lang], city.name[lang]].filter(Boolean).join(', ');
  const loc = lang === 'sr' ? 'sr-Latn' : lang;
  const m2 = lang === 'ru' ? 'м²' : 'm²';
  const area = x.area ? x.area.toLocaleString(loc, { maximumFractionDigits: 2 }) : null;
  const title = `${TYPE_WORDS[lang][x.type].one}${x.rooms ? ` ${x.rooms}` : ''}${area ? `, ${area} ${m2}` : ''}`;
  const no = flatNo(x.titleRu);
  const same = units.filter((y) => y.complex === x.complex && (y.block ?? '') === (x.block ?? ''));
  const top = plans?.floors?.[x.block ?? ''] ?? (Math.max(0, ...same.map((y) => y.floor ?? 0)) || null);
  // Проданная квартира: вместо цены «Продано», цену за м² не показываем.
  const sold = x.label === 'sold';
  const perM2 = !sold && x.price && x.area ? Math.round(x.price / x.area) : null;
  const fp = floorPlanFor(plans, x.block, x.floor);
  const mark = no ? plans?.view?.marks.find((m) => m.no === no && (!m.block || m.block === (x.block ?? ''))) ?? null : null;
  const rows: [string, string | null][] = [
    [L.project, complex.title],
    [L.ready, info?.ready ?? null],
    [L.block, x.block ?? null],
    [L.floor, x.floor == null ? null : top && top >= x.floor ? L.floorOf(x.floor, top) : String(x.floor)],
    [L.number, no],
    [L.area, area ? `${area} ${m2}` : null],
    [L.ppm, perM2 ? `${moneyL(lang, perM2)}` : null],
    [L.sea, x.sea ? `${numL(lang, x.sea)} ${lang === 'ru' ? 'м' : 'm'}` : null],
    [L.article, x.ref ?? x.id.toUpperCase()],
  ];
  const pdf = await flatPdf({
    lang, project: complex.title, title, place, url: new URL(itemUrl(lang, x), url.origin).href,
    cover: pd?.heroImages[0] ?? complex.image, plan: x.image,
    params: rows.filter((p): p is [string, string] => !!p[1]),
    price: sold ? t(lang).sold : x.price ? moneyL(lang, x.price) : '—', perM2: perM2 ? `${L.or} ${moneyL(lang, perM2)} ${L.perM2}` : null,
    floorPlan: fp ? { image: fp.image, shape: (no && fp.flats.find((f) => f.id === no)?.points) || null } : null,
    genplan: plans?.genplan?.image ? { image: plans.genplan.image, shape: (x.block && plans.genplan.blocks.find((b) => b.id === x.block)?.points) || null } : null,
    view: plans?.view && mark ? { image: plans.view.image, mark } : null,
  }, url.origin);
  const name = `${complex.slug}-${no ? `n${no}-` : ''}${x.id}.pdf`.replace(/[^\w.-]/g, '');
  return new Response(new Uint8Array(pdf), {
    headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'no-store' },
  });
};
