/**
 * Память о снятых объектах (ТЗ 3.3): когда объект пропадает из API, его страница не отдаёт 404,
 * а показывает плашку «Продано» и похожие объекты; через SOLD_DAYS дней — 410.
 * Снимок каталога хранится в Vercel Blob (catalog/seen.json) и обновляется вебхуком / по крону.
 */
import { getItems, getUnits, type Item } from './catalog';

const KEY = 'catalog/seen.json';
export const SOLD_DAYS = 90;

export type Seen = Pick<Item, 'id' | 'deal' | 'country' | 'city' | 'district' | 'type' | 'rooms' | 'area' | 'price' | 'image' | 'sea' | 'complex'> & { lastSeen: string };

let memo: { at: number; v: Record<string, Seen> } | null = null;
const token = () => process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN;
const key = (deal: string, id: string) => `${deal}:${id}`;

export async function getSeen(): Promise<Record<string, Seen>> {
  if (memo && Date.now() - memo.at < 10 * 60_000) return memo.v;
  let v: Record<string, Seen> = {};
  if (token()) {
    try {
      const { head } = await import('@vercel/blob');
      const meta = await head(KEY, { token: token() });
      const r = await fetch(`${meta.url}?v=${meta.uploadedAt.valueOf()}`, { cache: 'no-store' });
      if (r.ok) v = await r.json();
    } catch { /* снимка ещё нет */ }
  }
  memo = { at: Date.now(), v };
  return v;
}

export async function findSeen(deal: string, id: string): Promise<Seen | null> {
  return (await getSeen())[key(deal, id)] ?? null;
}

/** Дописывает в снимок все объекты, которые сейчас есть в API. Вызывается из /api/revalidate и крона. */
export async function updateSeen(): Promise<{ total: number }> {
  if (!token()) throw new Error('Хранилище не подключено');
  memo = null;
  const prev = await getSeen();
  const now = new Date().toISOString();
  const items = [...(await getItems()), ...(await getUnits())];
  if (items.length < 100) throw new Error('Каталог пуст — снимок не обновляем');
  const next = { ...prev };
  for (const x of items) {
    next[key(x.deal, x.id)] = { id: x.id, deal: x.deal, country: x.country, city: x.city, district: x.district, type: x.type, rooms: x.rooms, area: x.area, price: x.price, image: x.image, sea: x.sea, complex: x.complex, lastSeen: now };
  }
  // Старше года — забываем.
  const cutoff = Date.now() - 365 * 86400_000;
  for (const [k, s] of Object.entries(next)) if (Date.parse(s.lastSeen) < cutoff) delete next[k];
  const { put } = await import('@vercel/blob');
  await put(KEY, JSON.stringify(next), { access: 'public', token: token(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  memo = { at: Date.now(), v: next };
  return { total: Object.keys(next).length };
}

export const daysSince = (iso: string) => (Date.now() - Date.parse(iso)) / 86400_000;
