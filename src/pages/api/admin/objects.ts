import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/adminAuth';
import { getAllForAdmin, itemUrl, type Item } from '../../../lib/catalog';
import { getMarks, setMark, type Marks } from '../../../lib/objectsConfig';
import { cityBySlug, districtBySlug } from '../../../lib/geo';
import { TYPE_WORDS } from '../../../lib/segments';
import { purge } from '../../../lib/purge';

export const prerender = false;

const row = (x: Item, marks: Marks) => {
  const city = cityBySlug(x.city);
  const district = x.district ? districtBySlug(x.city, x.district) : null;
  return {
    id: x.id,
    ref: x.ref,
    title: x.titleRu || `${TYPE_WORDS.ru[x.type].one}${x.rooms ? ' ' + x.rooms : ''}`,
    place: [district?.name.ru, city?.name.ru].filter(Boolean).join(', '),
    price: x.price,
    deal: x.deal,
    image: x.image,
    url: itemUrl('ru', x),
    mark: marks[x.id] ?? {},
  };
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

/** Поиск объектов для раздела «Объекты»: по id, коду, названию, району. Пустой запрос — объекты с отметками. */
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!isAdmin(cookies)) return new Response('Нужно войти', { status: 401 });
  const q = norm((url.searchParams.get('q') || '').trim());
  const [all, marks] = await Promise.all([getAllForAdmin(), getMarks()]);
  let list: Item[];
  if (!q) list = all.filter((x) => marks[x.id]);
  else {
    const words = q.split(/\s+/);
    list = all.filter((x) => {
      if (x.id === q || norm(x.ref ?? '') === q) return true;
      const r = row(x, marks);
      const hay = norm(`${x.id} ${x.ref ?? ''} ${r.title} ${r.place}`);
      return words.every((w) => hay.includes(w));
    });
  }
  const exact = list.filter((x) => x.id === q || norm(x.ref ?? '') === q);
  list = [...exact, ...list.filter((x) => !exact.includes(x))];
  return Response.json({ total: list.length, items: list.slice(0, 60).map((x) => row(x, marks)), marked: Object.keys(marks).length }, { headers: { 'Cache-Control': 'no-store' } });
};

/** Сохранить отметку одного объекта: { id, mark: { hidden?, label?, pinned? } }. */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return new Response('Нужно войти', { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    const marks = await setMark(String(body?.id ?? ''), body?.mark);
    await purge(['site']);
    return Response.json({ ok: true, mark: marks[String(body.id)] ?? {} });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message.slice(0, 300) }, { status: 400 });
  }
};
