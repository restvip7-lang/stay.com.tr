/**
 * Настройки ИИ-помощника на сайте. Правятся в /admin, хранятся в Vercel Blob
 * (config/chat.json). Хранилище публичное по ссылке, поэтому API-ключ лежит
 * там только в зашифрованном виде (AES-256-GCM, ключ шифрования выводится из
 * секретного токена хранилища и наружу не попадает).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export type ChatProvider = 'anthropic' | 'openai';

export interface ChatSettings {
  enabled: boolean;
  provider: ChatProvider;
  model: string;
  /** Имя талисмана, как он представляется посетителю. */
  name: string;
  greeting: string;
  /** Дополнительные сведения для помощника: акции, условия, что важно говорить. */
  notes: string;
  apiKeyEnc: string | null;
  apiKeyHint: string | null;
  /** Сколько ответов ИИ в сутки на весь сайт; дальше — демо-режим до полуночи. 0 — без лимита. */
  dailyLimit: number;
  /** Сколько вопросов в сутки с одного адреса. */
  perUserDay: number;
}

export const DEFAULT_MODELS: Record<ChatProvider, string> = {
  anthropic: 'claude-opus-5-5',
  openai: 'gpt-4.1-mini',
};

export const ANTHROPIC_MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 — лучше всех понимает и подбирает' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 — быстрее и дешевле' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 — самый дешёвый' },
];

const DEFAULTS: ChatSettings = {
  // Включён сразу: без ключа работает демо-режим (см. chatDemo.ts).
  enabled: true,
  provider: 'anthropic',
  model: DEFAULT_MODELS.anthropic,
  name: 'Доми',
  greeting: 'Привет! Я Доми, домик-помощник Stay Property. Подберу квартиру или виллу в Турции, расскажу про районы, рассрочку и ВНЖ. С чего начнём?',
  notes: '',
  apiKeyEnc: null,
  apiKeyHint: null,
  dailyLimit: 200,
  perUserDay: 30,
};

const KEY = 'config/chat.json';
let memo: { at: number; value: ChatSettings } | null = null;

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN;
}

function secret(): Buffer {
  const t = blobToken() || process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD;
  if (!t) throw new Error('Нет секрета для шифрования ключа');
  return createHash('sha256').update('chat-key:' + t).digest();
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', secret(), iv);
  const data = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}

function decrypt(enc: string): string | null {
  try {
    const [iv, tag, data] = enc.split('.').map((s) => Buffer.from(s, 'base64'));
    const d = createDecipheriv('aes-256-gcm', secret(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// Старое имя помощника (Каретта) заменено на Доми: сохранённые в админке имя и приветствие с ним сбрасываем на новые.
const OLD_NAME = /Каретт/;

function normalize(x: any): ChatSettings {
  const o = { ...DEFAULTS, ...(x && typeof x === 'object' ? x : {}) };
  if (typeof o.name === 'string' && OLD_NAME.test(o.name)) o.name = DEFAULTS.name;
  if (typeof o.greeting === 'string' && OLD_NAME.test(o.greeting)) o.greeting = DEFAULTS.greeting;
  const provider: ChatProvider = o.provider === 'openai' ? 'openai' : 'anthropic';
  const num = (v: unknown, min: number, max: number, def: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) && v !== '' && v != null ? Math.min(max, Math.max(min, n)) : def; };
  const str = (v: unknown, max: number, def: string) => (typeof v === 'string' ? v.slice(0, max) : def);
  return {
    enabled: o.enabled !== false,
    provider,
    model: str(o.model, 80, DEFAULT_MODELS[provider]).trim() || DEFAULT_MODELS[provider],
    name: str(o.name, 40, DEFAULTS.name).trim() || DEFAULTS.name,
    greeting: str(o.greeting, 600, DEFAULTS.greeting).trim() || DEFAULTS.greeting,
    notes: str(o.notes, 4000, ''),
    apiKeyEnc: typeof o.apiKeyEnc === 'string' ? o.apiKeyEnc : null,
    apiKeyHint: typeof o.apiKeyHint === 'string' ? o.apiKeyHint : null,
    dailyLimit: num(o.dailyLimit, 0, 100000, DEFAULTS.dailyLimit),
    perUserDay: num(o.perUserDay, 1, 1000, DEFAULTS.perUserDay),
  };
}

export async function getChatSettings(): Promise<ChatSettings> {
  if (memo && Date.now() - memo.at < 30_000) return memo.value;
  let value = normalize(null);
  if (blobToken()) {
    try {
      const { head } = await import('@vercel/blob');
      const meta = await head(KEY, { token: blobToken() });
      const res = await fetch(`${meta.url}?v=${meta.uploadedAt.valueOf()}`, { cache: 'no-store' });
      if (res.ok) value = normalize(await res.json());
    } catch {
      /* ещё не сохраняли — значения по умолчанию */
    }
  }
  memo = { at: Date.now(), value };
  return value;
}

/** Ключ провайдера: из админки, иначе из переменных окружения проекта. */
export function resolveApiKey(s: ChatSettings): string | null {
  const fromAdmin = s.apiKeyEnc ? decrypt(s.apiKeyEnc) : null;
  if (fromAdmin) return fromAdmin;
  const env = s.provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
  return process.env[env] || (import.meta.env[env] as string | undefined) || null;
}

export function chatReady(s: ChatSettings) {
  return s.enabled && !!resolveApiKey(s);
}

/** Сохраняет настройки. apiKey: строка — заменить, '' или undefined — оставить, null — удалить. */
export async function saveChatSettings(input: any, apiKey?: string | null): Promise<ChatSettings> {
  if (!blobToken()) throw new Error('Хранилище не подключено');
  const prev = await getChatSettings();
  const next = normalize({ ...prev, ...input, apiKeyEnc: prev.apiKeyEnc, apiKeyHint: prev.apiKeyHint });
  if (input?.provider && input.provider !== prev.provider && !input.model) next.model = DEFAULT_MODELS[next.provider];
  if (apiKey === null) {
    next.apiKeyEnc = null;
    next.apiKeyHint = null;
  } else if (typeof apiKey === 'string' && apiKey.trim()) {
    const k = apiKey.trim();
    next.apiKeyEnc = encrypt(k);
    next.apiKeyHint = '…' + k.slice(-4);
  }
  const { put } = await import('@vercel/blob');
  await put(KEY, JSON.stringify(next), {
    access: 'public',
    token: blobToken(),
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  memo = { at: Date.now(), value: next };
  return next;
}

/** То, что можно отдать в браузер (без ключа). */
export function publicChat(s: ChatSettings) {
  return { name: s.name, greeting: s.greeting };
}

/** Для админки: всё, кроме самого ключа. */
export function chatAdminView(s: ChatSettings) {
  const { apiKeyEnc, ...rest } = s;
  const has = !!resolveApiKey(s);
  return { ...rest, hasKey: has, keyFromEnv: !apiKeyEnc && has };
}
