/**
 * Кэш страниц на своём сервере (VPS) — замена CDN Vercel.
 * Готовые HTML-страницы держим в памяти процесса 10 минут, потом собираем заново.
 * Если сборка упала (API недоступен, 5xx) — сутки отдаём последнюю удачную копию (как stale-if-error на Vercel).
 * Сброс — purge() из админки и вебхука /api/revalidate, по тегам site и lang-xx.
 * Работает при одном процессе сайта (pm2 в режиме fork, 1 экземпляр).
 */
const FRESH = 10 * 60_000;
const STALE = 24 * 3600_000;
const MAX = 3000;

interface Entry { at: number; status: number; headers: [string, string][]; body: string; tags: string[] }
const store = new Map<string, Entry>();

export const pageCacheOn = () => import.meta.env.STAY_TARGET === 'node';

function toResponse(e: Entry, state: string) {
  const h = new Headers(e.headers);
  h.set('x-stay-cache', state);
  return new Response(e.body, { status: e.status, headers: h });
}

async function snapshot(res: Response, tags: string[]): Promise<Entry | null> {
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/html') || res.headers.has('set-cookie') || ![200, 404, 410].includes(res.status)) return null;
  const body = await res.text();
  const headers = [...res.headers.entries()].filter(([k]) => k !== 'content-length' && k !== 'cdn-cache-control');
  return { at: Date.now(), status: res.status, headers, body, tags };
}

function put(key: string, e: Entry) {
  store.delete(key);
  store.set(key, e);
  if (store.size > MAX) store.delete(store.keys().next().value!);
}

/** Отдаёт страницу из кэша или собирает её через render() и кладёт в кэш. */
export async function cachedPage(key: string, tags: string[], render: () => Promise<Response>): Promise<Response> {
  const hit = store.get(key);
  const age = hit ? Date.now() - hit.at : Infinity;
  if (hit && age < FRESH) return toResponse(hit, 'HIT');
  let res: Response;
  try {
    res = await render();
  } catch (err) {
    if (hit && age < FRESH + STALE) return toResponse(hit, 'STALE');
    throw err;
  }
  if (res.status >= 500 && hit && age < FRESH + STALE) return toResponse(hit, 'STALE');
  const e = await snapshot(res.clone(), tags).catch(() => null);
  if (e) {
    put(key, e);
    return toResponse(e, 'MISS');
  }
  return res;
}

export function purgePages(tags: string[]) {
  for (const [k, e] of store) if (e.tags.some((t) => tags.includes(t))) store.delete(k);
}
