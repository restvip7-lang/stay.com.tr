/**
 * SEO-надстройка админки (ТЗ 14): переопределения title/description/H1/SEO-текста и index/noindex
 * для любой страницы на любом языке, менеджер редиректов 301/410 с проверкой циклов.
 * Хранится в Vercel Blob (config/seo.json).
 */
import type { Robots } from './page';

export interface Override { title?: string; description?: string; h1?: string; text?: string; robots?: Robots }
export interface Redirect { from: string; to: string; status: 301 | 410 }
export interface SeoConfig { overrides: Record<string, Override>; redirects: Redirect[] }

const KEY = 'config/seo.json';
const EMPTY: SeoConfig = { overrides: {}, redirects: [] };
let memo: { at: number; value: SeoConfig } | null = null;

const token = () => process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN;

/** Путь страницы в едином виде: /ru/…/ (разделы со слешем, карточки без). */
export function normPath(p: string): string {
  let s = p.trim();
  try { if (/^https?:\/\//.test(s)) s = new URL(s).pathname; } catch { /* оставляем как есть */ }
  s = s.split(/[?#]/)[0].toLowerCase();
  if (!s.startsWith('/')) s = '/' + s;
  return s.replace(/\/{2,}/g, '/');
}

const ROBOTS = new Set(['index,follow', 'noindex,follow', 'noindex,nofollow']);

export function normalize(x: any): SeoConfig {
  const out: SeoConfig = { overrides: {}, redirects: [] };
  if (x && typeof x.overrides === 'object') {
    for (const [k, v] of Object.entries(x.overrides as Record<string, any>)) {
      if (!v || typeof v !== 'object') continue;
      const o: Override = {};
      for (const f of ['title', 'description', 'h1', 'text'] as const) if (typeof v[f] === 'string' && v[f].trim()) o[f] = v[f].trim().slice(0, f === 'text' ? 20000 : 400);
      if (typeof v.robots === 'string' && ROBOTS.has(v.robots)) o.robots = v.robots;
      if (Object.keys(o).length) out.overrides[normPath(k)] = o;
    }
  }
  if (Array.isArray(x?.redirects)) {
    for (const r of x.redirects) {
      if (!r || typeof r.from !== 'string') continue;
      const status = Number(r.status) === 410 ? 410 : 301;
      const to = typeof r.to === 'string' ? r.to.trim() : '';
      if (status === 301 && !to) continue;
      out.redirects.push({ from: normPath(r.from), to: status === 410 ? '' : /^https?:\/\//.test(to) ? to : normPath(to), status });
    }
  }
  return out;
}

/** Ошибки менеджера редиректов: дубли, цепочки и циклы (A→B→A). */
export function redirectErrors(rs: Redirect[]): string[] {
  const errs: string[] = [];
  const map = new Map<string, string>();
  for (const r of rs) {
    if (map.has(r.from)) errs.push(`Дубль: ${r.from}`);
    if (r.status === 301) map.set(r.from, r.to);
    if (r.status === 301 && r.from === r.to) errs.push(`Редирект на себя: ${r.from}`);
  }
  for (const start of map.keys()) {
    const seen = new Set([start]);
    let cur = map.get(start);
    while (cur && map.has(cur)) {
      if (seen.has(cur)) { errs.push(`Цикл: ${[...seen, cur].join(' → ')}`); break; }
      seen.add(cur);
      cur = map.get(cur);
    }
    if (seen.size > 2 && !errs.some((e) => e.includes(start))) errs.push(`Цепочка из ${seen.size - 1} редиректов: ${start} — поставьте сразу конечный адрес`);
  }
  return [...new Set(errs)];
}

export async function getSeoConfig(): Promise<SeoConfig> {
  if (memo && Date.now() - memo.at < 60_000) return memo.value;
  let value = EMPTY;
  if (token()) {
    try {
      const { head } = await import('@vercel/blob');
      const meta = await head(KEY, { token: token() });
      const res = await fetch(`${meta.url}?v=${meta.uploadedAt.valueOf()}`, { cache: 'no-store' });
      if (res.ok) value = normalize(await res.json());
    } catch { /* файла ещё нет */ }
  }
  memo = { at: Date.now(), value };
  return value;
}

export async function saveSeoConfig(x: unknown): Promise<SeoConfig> {
  if (!token()) throw new Error('Хранилище не подключено');
  const value = normalize(x);
  const errs = redirectErrors(value.redirects);
  if (errs.length) throw new Error(errs.join('; '));
  const { put } = await import('@vercel/blob');
  await put(KEY, JSON.stringify(value, null, 2), { access: 'public', token: token(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  memo = { at: Date.now(), value };
  return value;
}

export async function overrideFor(path: string): Promise<Override | null> {
  return (await getSeoConfig()).overrides[normPath(path)] ?? null;
}

export async function redirectFor(path: string): Promise<Redirect | null> {
  const p = normPath(path);
  const alt = p.endsWith('/') ? p.slice(0, -1) : p + '/';
  return (await getSeoConfig()).redirects.find((r) => r.from === p || r.from === alt) ?? null;
}
