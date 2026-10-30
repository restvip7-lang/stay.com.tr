import type { APIRoute } from 'astro';
import { chatReady, getChatSettings, publicChat } from '../../lib/chatConfig';
import { askAssistant, type ChatMsg } from '../../lib/chatAgent';
import { demoReply } from '../../lib/chatDemo';
import { addUsage, usageToday } from '../../lib/chatUsage';
import { CHAT_UI, chatGreeting, chatLang, chatName } from '../../lib/chatI18n';

export const prerender = false;

// В ИИ уходят только последние 12 сообщений: длинная переписка дорого стоит.
const MAX_MESSAGES = 12;
const MAX_LEN = 2000;
// Простая защита от злоупотреблений: не больше 20 вопросов за 10 минут с одного адреса.
const WINDOW = 10 * 60_000;
const LIMIT = 20;
const hits = new Map<string, number[]>();
// Сутки с одного адреса (лимит из админки). Счёт в памяти процесса — грубая, но бесплатная защита.
const daily = new Map<string, { day: string; n: number }>();

function limited(ip: string, perDay: number) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  const day = new Date(now).toISOString().slice(0, 10);
  const d = daily.get(ip);
  const n = d?.day === day ? d.n + 1 : 1;
  daily.set(ip, { day, n });
  if (daily.size > 20000) daily.clear();
  return list.length > LIMIT || n > perDay;
}

const noStore = { 'cache-control': 'no-store' };

/** Состояние чата для виджета: включён ли и как зовут талисман. */
export const GET: APIRoute = async ({ url }) => {
  const s = await getChatSettings();
  const lang = chatLang(url.searchParams.get('lang'));
  const { name, greeting } = publicChat(s);
  const n = chatName(lang, name);
  return Response.json({ visible: s.enabled, ready: chatReady(s), name: n, greeting: chatGreeting(lang, n, greeting) }, { headers: noStore });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = new URL(request.url).origin;
  const o = request.headers.get('origin');
  if (o && o !== origin) return new Response('Bad origin', { status: 403 });

  const s = await getChatSettings();
  if (!s.enabled) return Response.json({ error: 'Чат выключен' }, { status: 503, headers: noStore });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  const lang = chatLang(body?.lang);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'x';
  if (limited(ip, s.perUserDay)) return Response.json({ error: CHAT_UI[lang].tooMany }, { status: 429, headers: noStore });
  const raw: unknown[] = Array.isArray(body?.messages) ? body.messages : [];
  const history: ChatMsg[] = raw
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }))
    .slice(-MAX_MESSAGES);
  while (history.length && history[0].role !== 'user') history.shift();
  if (!history.length || history[history.length - 1].role !== 'user') return Response.json({ error: 'Пустой вопрос' }, { status: 400 });

  try {
    // Пока ключа нет — демо-режим без нейросети.
    // Суточный лимит ответов ИИ на весь сайт исчерпан — до полуночи отвечаем в демо-режиме.
    const useAi = chatReady(s) && (!s.dailyLimit || (await usageToday()) < s.dailyLimit);
    const reply = useAi ? await askAssistant(s, history, lang) : await demoReply(history[history.length - 1].content, lang);
    if (useAi) await addUsage();
    return Response.json(reply, { headers: noStore });
  } catch (e) {
    console.error('chat error', e);
    // ИИ не ответил (нет денег на счёте, лимит, сбой) — отвечаем в демо-режиме, чтобы чат не молчал.
    try { return Response.json(await demoReply(history[history.length - 1].content, lang), { headers: noStore }); } catch { /* ниже */ }
    return Response.json({ error: CHAT_UI[lang].unavailable }, { status: 502, headers: noStore });
  }
};
