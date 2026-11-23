/**
 * POST /api/selection-pdf — готовый PDF «Подборка недвижимости» из вариантов, показанных в чате.
 * Тело: { lang, cards: [{ title, subtitle, price, image, url, facts }] } (до 12 карточек, последние сверху).
 * Ответ — файл application/pdf для скачивания.
 */
import type { APIRoute } from 'astro';
import { chatLang } from '../../lib/chatI18n';
import { selectionPdf, type PdfCard, type PdfFacts } from '../../lib/selectionPdf';

export const prerender = false;

const MAX_CARDS = 12;
// Не больше 20 файлов за 10 минут с одного адреса.
const WINDOW = 10 * 60_000;
const LIMIT = 20;
const hits = new Map<string, number[]>();

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '');
const pos = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);

function card(v: unknown): PdfCard | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const title = str(o.title);
  if (!title) return null;
  const f = (o.facts && typeof o.facts === 'object' ? o.facts : {}) as Record<string, unknown>;
  const facts: PdfFacts = { place: str(f.place, 120), rooms: str(f.rooms, 40), area: pos(f.area), sea: pos(f.sea), price: pos(f.price), ppm: pos(f.ppm), from: f.from === true };
  return { title, subtitle: str(o.subtitle), price: str(o.price, 80), image: str(o.image, 2000) || null, url: str(o.url, 1000), facts };
}

const bad = (msg: string, status = 400) => new Response(msg, { status, headers: { 'cache-control': 'no-store' } });

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  let ip = 'x';
  try { ip = request.headers.get('x-real-ip') || clientAddress || 'x'; } catch { /* нет адреса */ }
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  if (list.length > LIMIT) return bad('too many', 429);

  let body: { lang?: unknown; cards?: unknown };
  try { body = await request.json(); } catch { return bad('bad json'); }
  const cards = (Array.isArray(body.cards) ? body.cards : []).slice(0, MAX_CARDS).map(card).filter((c): c is PdfCard => !!c);
  if (!cards.length) return bad('no cards');
  const lang = chatLang(body.lang);

  const pdf = await selectionPdf(lang, cards, url.origin);
  const day = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="stay-property-${day}.pdf"`,
      'cache-control': 'no-store',
    },
  });
};
