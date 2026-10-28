import type { APIRoute } from 'astro';
import { chatReady, getChatSettings, publicChat } from '../../lib/chatConfig';
import { askAssistant, type ChatMsg } from '../../lib/chatAgent';

export const prerender = false;

const MAX_MESSAGES = 20;
const MAX_LEN = 2000;
// Простая защита от злоупотреблений: не больше 20 вопросов за 10 минут с одного адреса.
const WINDOW = 10 * 60_000;
const LIMIT = 20;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > LIMIT;
}

const noStore = { 'cache-control': 'no-store' };

/** Состояние чата для виджета: включён ли и как зовут талисман. */
export const GET: APIRoute = async () => {
  const s = await getChatSettings();
  return Response.json({ ready: chatReady(s), ...publicChat(s) }, { headers: noStore });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = new URL(request.url).origin;
  const o = request.headers.get('origin');
  if (o && o !== origin) return new Response('Bad origin', { status: 403 });

  const s = await getChatSettings();
  if (!chatReady(s)) return Response.json({ error: 'Чат выключен' }, { status: 503, headers: noStore });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'x';
  if (limited(ip)) return Response.json({ error: 'Слишком много сообщений. Попробуйте через несколько минут.' }, { status: 429, headers: noStore });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  const raw: unknown[] = Array.isArray(body?.messages) ? body.messages : [];
  const history: ChatMsg[] = raw
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }))
    .slice(-MAX_MESSAGES);
  while (history.length && history[0].role !== 'user') history.shift();
  if (!history.length || history[history.length - 1].role !== 'user') return Response.json({ error: 'Пустой вопрос' }, { status: 400 });

  try {
    const reply = await askAssistant(s, history);
    return Response.json(reply, { headers: noStore });
  } catch (e) {
    console.error('chat error', e);
    return Response.json({ error: 'Помощник сейчас недоступен. Напишите нам в WhatsApp — ответим быстро.' }, { status: 502, headers: noStore });
  }
};
