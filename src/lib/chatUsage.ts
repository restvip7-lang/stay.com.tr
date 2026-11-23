/**
 * Суточный счётчик ответов ИИ (на весь сайт), чтобы баланс у провайдера не кончился за день.
 * Хранится в config/chat-usage.json (Vercel Blob или файл на сервере, см. store.ts): { day, count }. Счёт приблизительный
 * (одновременные запросы могут не досчитаться на 1–2), для лимита этого достаточно.
 */
const KEY = 'config/chat-usage.json';
import { readJson, storeReady, writeJson } from './store';
// День по Турции (UTC+3): лимит обнуляется в полночь по Аланье.
const today = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);

let memo: { day: string; count: number } | null = null;

export async function usageToday(): Promise<number> {
  const day = today();
  if (memo?.day === day) return memo.count;
  let count = 0;
  const j = await readJson<{ day: string; count: number }>(KEY);
  if (j?.day === day && Number.isFinite(j.count)) count = j.count;
  memo = { day, count };
  return count;
}

export async function addUsage(): Promise<void> {
  const count = (await usageToday()) + 1;
  memo = { day: today(), count };
  if (!storeReady()) return;
  try {
    await writeJson(KEY, memo);
  } catch { /* счётчик не критичен */ }
}

/** Для админки: свежее значение, мимо кэша этого процесса. */
export async function usageFresh(): Promise<number> {
  memo = null;
  return usageToday();
}
