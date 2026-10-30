/**
 * Суточный счётчик ответов ИИ (на весь сайт), чтобы баланс у провайдера не кончился за день.
 * Хранится в Vercel Blob config/chat-usage.json: { day, count }. Счёт приблизительный
 * (одновременные запросы могут не досчитаться на 1–2), для лимита этого достаточно.
 */
const KEY = 'config/chat-usage.json';
const token = () => process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN;
// День по Турции (UTC+3): лимит обнуляется в полночь по Аланье.
const today = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);

let memo: { day: string; count: number } | null = null;

export async function usageToday(): Promise<number> {
  const day = today();
  if (memo?.day === day) return memo.count;
  let count = 0;
  if (token()) {
    try {
      const { head } = await import('@vercel/blob');
      const meta = await head(KEY, { token: token() });
      const r = await fetch(`${meta.url}?v=${meta.uploadedAt.valueOf()}`, { cache: 'no-store' });
      const j = r.ok ? await r.json() : null;
      if (j?.day === day && Number.isFinite(j.count)) count = j.count;
    } catch { /* файла ещё нет */ }
  }
  memo = { day, count };
  return count;
}

export async function addUsage(): Promise<void> {
  const count = (await usageToday()) + 1;
  memo = { day: today(), count };
  if (!token()) return;
  try {
    const { put } = await import('@vercel/blob');
    await put(KEY, JSON.stringify(memo), { access: 'public', token: token(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  } catch { /* счётчик не критичен */ }
}

/** Для админки: свежее значение, мимо кэша этого процесса. */
export async function usageFresh(): Promise<number> {
  memo = null;
  return usageToday();
}
