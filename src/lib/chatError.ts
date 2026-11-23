/**
 * Почему ИИ не ответил. Когда ИИ падает, посетитель видит демо-режим (чтобы чат не молчал),
 * поэтому причину пишем в лог сервера и в config/chat-error.json — её показывает админка
 * («ИИ-помощник» → «Последний сбой ИИ»). Сам ключ сюда не попадает.
 */
import Anthropic from '@anthropic-ai/sdk';
import { readJson, storeReady, writeJson } from './store';

const KEY = 'config/chat-error.json';
export interface AiError { at: string; text: string }

/** Понятное объяснение ошибки провайдера на русском + исходное сообщение. */
export function explainAiError(e: unknown): string {
  const raw = String((e as any)?.message ?? e ?? '').replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-…').slice(0, 300);
  const low = raw.toLowerCase();
  let why = 'ИИ не ответил';
  if (e instanceof Anthropic.APIConnectionError || /fetch failed|econn|enotfound|etimedout|socket|network/.test(low)) why = 'Сервер сайта не может достучаться до api.anthropic.com (сеть/фаервол/DNS)';
  else if (e instanceof Anthropic.AuthenticationError || (e as any)?.status === 401) why = 'Ключ не принят провайдером: неверный, отозван или сохранён с ошибкой — введите ключ заново';
  else if (e instanceof Anthropic.PermissionDeniedError || (e as any)?.status === 403) why = 'У ключа нет доступа к этой модели или к API';
  else if (e instanceof Anthropic.NotFoundError || (e as any)?.status === 404) why = 'Модель не найдена — выберите другую модель';
  else if (/credit balance|billing|spend limit|usage limit|insufficient|quota/.test(low)) why = 'Закончились деньги на счёте API или достигнут лимит расходов (console.anthropic.com → Billing / Limits)';
  else if (e instanceof Anthropic.RateLimitError || (e as any)?.status === 429) why = 'Превышен лимит запросов провайдера (rate limit)';
  else if (e instanceof Anthropic.BadRequestError || (e as any)?.status === 400) why = 'Провайдер отклонил запрос (400)';
  else if ((e as any)?.status >= 500) why = 'Сбой на стороне провайдера, обычно проходит сам';
  else if (/api-ключ|api key/.test(low)) why = 'Ключ не задан или не расшифровался';
  return raw ? `${why}. Ответ провайдера: ${raw}` : why;
}

export async function recordAiError(e: unknown): Promise<void> {
  const v: AiError = { at: new Date().toISOString(), text: explainAiError(e) };
  console.error('[chat] ИИ не ответил, отвечаем демо-режимом:', v.text);
  if (!storeReady()) return;
  try { await writeJson(KEY, v); } catch { /* не критично */ }
}

export async function lastAiError(): Promise<AiError | null> {
  try { return (await readJson<AiError>(KEY)) ?? null; } catch { return null; }
}
