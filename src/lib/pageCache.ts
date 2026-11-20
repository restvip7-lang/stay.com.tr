/**
 * Кэш страниц на своём сервере (VPS) — замена CDN Vercel.
 * Готовые HTML-страницы держим в памяти процесса 10 минут. Потом, как stale-while-revalidate на Vercel,
 * посетитель сразу получает прежнюю копию (STALE), а страница пересобирается в фоне (запрос сайта к самому себе
 * с внутренним токеном), так что никто не ждёт сборку по 3–10 секунд. Устаревшие больше суток копии не отдаём.
 * Если сборка упала (API недоступен, 5xx) — отдаём последнюю удачную копию (как stale-if-error на Vercel).
 * Сброс — purge() из админки и вебхука /api/revalidate, по тегам site и lang-xx.
 * Работает при одном процессе сайта (pm2 в режиме fork, 1 экземпляр).
 */
const FRESH = 10 * 60_000;
const STALE = 24 * 3600_000;
const MAX = 3000;

interface Entry { at: number; status: number; headers: [string, string][]; body: string; tags: string[] }
const store = new Map<string, Entry>();
const refreshing = new Set<string>();

/** Токен фонового обновления: живёт только в этом процессе, снаружи его не узнать. */
export const REFRESH_HEADER = 'x-stay-refresh';
const REFRESH_TOKEN = globalThis.crypto.randomUUID();
export const isRefresh = (req: Request) => req.headers.get(REFRESH_HEADER) === REFRESH_TOKEN;

/** Пересобрать страницу в фоне: запрос к самому себе (127.0.0.1) с тем же Host, что у посетителя. */
function refreshInBackground(key: string, host: string) {
  if (refreshing.has(key)) return;
  refreshing.add(key);
  import('node:http')
    .then(({ request }) => new Promise<void>((done) => {
      const req = request(
        { host: '127.0.0.1', port: Number(process.env.PORT) || 4321, path: key, method: 'GET', timeout: 60_000, headers: { host, [REFRESH_HEADER]: REFRESH_TOKEN } },
        (res) => { res.resume(); res.on('end', done); res.on('error', done); },
      );
      req.on('error', () => done());
      req.on('timeout', () => { req.destroy(); done(); });
      req.end();
    }))
    .finally(() => refreshing.delete(key));
}

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
export async function cachedPage(key: string, tags: string[], render: () => Promise<Response>, request?: Request): Promise<Response> {
  const hit = store.get(key);
  const age = hit ? Date.now() - hit.at : Infinity;
  const forced = !!request && isRefresh(request);
  if (!forced && hit && age < FRESH) return toResponse(hit, 'HIT');
  if (!forced && hit && age < FRESH + STALE && request) {
    refreshInBackground(key, request.headers.get('host') ?? 'localhost');
    return toResponse(hit, 'STALE');
  }
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

/**
 * Сброс по тегам: копии не удаляем, а помечаем устаревшими. Следующий посетитель получит прежнюю копию,
 * а страница тут же пересоберётся в фоне (как сброс по тегам на Vercel) — никто не ждёт сборку.
 */
export function purgePages(tags: string[]) {
  const old = Date.now() - FRESH;
  for (const e of store.values()) if (e.tags.some((t) => tags.includes(t)) && e.at > old) e.at = old;
}
