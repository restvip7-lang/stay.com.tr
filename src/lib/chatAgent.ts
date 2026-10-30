/**
 * Сам помощник: модель + инструменты поиска по базе. Два провайдера —
 * Claude (через официальный SDK) и GPT (через Chat Completions).
 */
import Anthropic from '@anthropic-ai/sdk';
import { resolveApiKey, type ChatSettings } from './chatConfig';
import type { Lang } from '../i18n/config';
import { chatName } from './chatI18n';
import { TOOLS, extractCards, runTool, systemPrompt, type ChatCard, type Seen } from './chatTools';

export interface ChatMsg { role: 'user' | 'assistant'; content: string }
export interface ChatReply { text: string; cards: ChatCard[] }

const MAX_ROUNDS = 6;
const SORRY: Record<Lang, string> = {
  ru: 'Не получилось ответить на это. Давайте попробуем иначе — или нажмите «Связаться с менеджером», и вам ответит человек.',
  en: 'I could not answer that. Let us try another way, or press “Contact a manager” and a person will reply.',
  tr: 'Buna yanıt veremedim. Başka şekilde deneyelim ya da «Danışmanla iletişime geç» düğmesine basın, size bir kişi yanıt versin.',
  de: 'Darauf konnte ich nicht antworten. Versuchen wir es anders – oder klicken Sie auf „Berater kontaktieren“, dann antwortet Ihnen ein Mensch.',
  sr: 'Nisam uspeo da odgovorim na to. Pokušajmo drugačije, ili pritisnite „Kontaktiraj menadžera“ i javiće vam se osoba.',
};

export async function askAssistant(s: ChatSettings, history: ChatMsg[], lang: Lang = 'ru'): Promise<ChatReply> {
  const key = resolveApiKey(s);
  if (!key) throw new Error('Не задан API-ключ');
  const seen: Seen = { listings: new Map(), projects: new Map(), lang };
  const system = systemPrompt(chatName(lang, s.name), s.notes, lang);
  const text = s.provider === 'openai' ? await openai(key, s.model, system, history, seen) : await claude(key, s.model, system, history, seen);
  return extractCards(text || SORRY[lang], seen);
}

/* ---------- Claude ---------- */

async function claude(apiKey: string, model: string, system: string, history: ChatMsg[], seen: Seen): Promise<string> {
  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 55_000 });
  const tools = TOOLS.map((t) => ({ name: t.name, description: t.description, input_schema: t.schema as any }));
  const messages: any[] = history.map((m) => ({ role: m.role, content: m.content }));

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const last = round === MAX_ROUNDS - 1;
    const res = await client.beta.messages.create({
      model,
      max_tokens: 4000,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      tools: last ? undefined : tools,
      messages,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    } as any);

    if (res.stop_reason === 'refusal') return SORRY[seen.lang ?? 'ru'];
    const answer = res.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
    if (res.stop_reason !== 'tool_use') return answer;

    messages.push({ role: 'assistant', content: res.content });
    const results = [];
    for (const b of res.content as any[]) {
      if (b.type !== 'tool_use') continue;
      let out: unknown;
      try {
        out = await runTool(b.name, b.input, seen);
      } catch (e) {
        out = { error: 'Сервис базы временно недоступен' };
      }
      results.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(out) });
    }
    messages.push({ role: 'user', content: results });
  }
  return '';
}

/* ---------- GPT ---------- */

async function openai(apiKey: string, model: string, system: string, history: ChatMsg[], seen: Seen): Promise<string> {
  const tools = TOOLS.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.schema } }));
  const messages: any[] = [{ role: 'system', content: system }, ...history.map((m) => ({ role: m.role, content: m.content }))];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const last = round === MAX_ROUNDS - 1;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, ...(last ? {} : { tools }), max_completion_tokens: 2000 }),
      signal: AbortSignal.timeout(55_000),
    });
    if (!r.ok) {
      const err = await r.text().catch(() => '');
      throw new Error(`OpenAI ${r.status}: ${err.slice(0, 300)}`);
    }
    const data: any = await r.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) return '';
    const calls = msg.tool_calls ?? [];
    if (!calls.length) return String(msg.content ?? '').trim();

    messages.push(msg);
    for (const c of calls) {
      let out: unknown;
      try {
        out = await runTool(c.function?.name, JSON.parse(c.function?.arguments || '{}'), seen);
      } catch {
        out = { error: 'Не удалось выполнить запрос к базе' };
      }
      messages.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(out) });
    }
  }
  return '';
}
