/**
 * Вход в админку. Два режима:
 * - на своём сервере (хранилище на диске): пользователи с ролями в базе SQLite (adminDb.ts),
 *   логин + пароль, затем код на почту (если почта настроена), блокировка подбора, журнал действий;
 * - на Vercel: один общий пароль из ADMIN_PASSWORD, как раньше.
 * Первый вход на сервере, пока пользователей нет: логин admin и пароль из ADMIN_PASSWORD — так создаётся владелец.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { storeMode } from './store';
import type { Role, UserRow } from './adminDb';

export type Section = 'home' | 'objects' | 'projects' | 'chat' | 'seo' | 'users';
const ACCESS: Record<Section, Role[]> = {
  home: ['owner', 'admin', 'editor'],
  objects: ['owner', 'admin', 'editor'],
  // «Страница проекта» (наши ЖК): сотрудник с ролью «Проекты» видит только этот раздел (Anuar 28.11.2026).
  projects: ['owner', 'admin', 'editor', 'projects'],
  chat: ['owner', 'admin'],
  seo: ['owner', 'admin', 'seo'],
  users: ['owner'],
};
export interface AdminUser { id: number; login: string; name: string; email: string; role: Role; mustChange: boolean }

const COOKIE = 'stay_admin';
const SESSION_COOKIE = 'stay_admin_s';

/** Пользователи с базой — на своём сервере. */
export const usersMode = () => storeMode() === 'fs' && (process.env.STAY_ADMIN_USERS ?? '1') !== '0';
const db = () => import('./adminDb');

function password() {
  return process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || '';
}

export function adminEnabled() {
  return usersMode() || password().length >= 8;
}

function sign(v: string) {
  return createHmac('sha256', password()).update(v).digest('hex');
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const cookieOpts = (maxAge: number) => ({ path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'strict' as const, maxAge });

/* ---------- Режим одного пароля (Vercel) ---------- */

export function checkPassword(input: string) {
  return password().length >= 8 && same(sign(input), sign(password()));
}

export function startSession(cookies: AstroCookies) {
  const exp = String(Date.now() + 12 * 3600 * 1000);
  cookies.set(COOKIE, `${exp}.${sign(exp)}`, cookieOpts(12 * 3600));
}

function passwordSessionOk(cookies: AstroCookies) {
  if (password().length < 8) return false;
  const v = cookies.get(COOKIE)?.value ?? '';
  const [exp, sig] = v.split('.');
  return !!exp && !!sig && Number(exp) > Date.now() && same(sig, sign(exp));
}

/* ---------- Общее ---------- */

const toUser = (u: UserRow): AdminUser => ({ id: u.id, login: u.login, name: u.name, email: u.email, role: u.role, mustChange: !!u.must_change });

/** Кто вошёл (или null). */
export async function currentUser(cookies: AstroCookies): Promise<AdminUser | null> {
  if (!usersMode()) return passwordSessionOk(cookies) ? { id: 0, login: 'admin', name: 'Админ', email: '', role: 'owner', mustChange: false } : null;
  const token = cookies.get(SESSION_COOKIE)?.value ?? '';
  if (!token) return null;
  const u = (await db()).sessionUser(token);
  return u ? toUser(u) : null;
}

/** Доступ к разделу. Пока пароль не сменён (первый вход, сброс владельцем) — никаких разделов, только «Мой пароль». */
export const allowed = (u: AdminUser | null, s: Section) => !!u && !u.mustChange && ACCESS[s].includes(u.role);

/** Пользователь с доступом к разделу (или null). */
export async function userCan(cookies: AstroCookies, s: Section): Promise<AdminUser | null> {
  const u = await currentUser(cookies);
  return allowed(u, s) ? u : null;
}

export async function isAdmin(cookies: AstroCookies) {
  return !!(await currentUser(cookies));
}

export function setUserSession(cookies: AstroCookies, token: string, maxAge: number) {
  cookies.set(SESSION_COOKIE, token, cookieOpts(maxAge));
}

export async function endSession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token && usersMode()) (await db()).endSessionToken(token);
  cookies.delete(COOKIE, { path: '/' });
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Адрес посетителя: за nginx — из X-Real-IP, иначе адрес соединения. */
export function ipOf(request: Request, clientAddress?: string) {
  const local = !clientAddress || clientAddress === '127.0.0.1' || clientAddress === '::1' || clientAddress === '::ffff:127.0.0.1';
  return (local && request.headers.get('x-real-ip')) || clientAddress || '';
}

/**
 * Доступ к админке только с разрешённых адресов: ADMIN_ALLOW_IPS="1.2.3.4, 5.6.7.0/24, 2a01:db8::1".
 * Пусто — без ограничения. IPv4 — точный адрес или подсеть /N, IPv6 — точный адрес.
 */
export function adminIpAllowed(ip: string): boolean {
  const list = (process.env.ADMIN_ALLOW_IPS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!list.length) return true;
  const v4 = (a: string) => {
    const m = a.replace(/^::ffff:/, '').match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    return m ? m.slice(1).reduce((n, x) => n * 256 + Number(x), 0) : null;
  };
  const me = v4(ip);
  return list.some((rule) => {
    const [base, bits] = rule.split('/');
    const b = v4(base);
    if (b === null || me === null) return rule.toLowerCase() === ip.toLowerCase();
    const n = bits === undefined ? 32 : Math.max(0, Math.min(32, Number(bits)));
    const mask = n === 0 ? 0 : (0xffffffff << (32 - n)) >>> 0;
    return ((me & mask) >>> 0) === ((b & mask) >>> 0);
  });
}

/**
 * Вход только с кодом из письма — для всех, включая владельца. Включено по умолчанию;
 * ADMIN_REQUIRE_CODE=0 — аварийно выключить (например, если сломалась почта), затем перезапустить сайт.
 */
export const codeRequired = () => process.env.ADMIN_REQUIRE_CODE !== '0';
export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/** Запрос с чужого сайта не принимаем (защита от подделки запросов). */
export function badOrigin(request: Request) {
  const o = request.headers.get('origin');
  return !!o && o !== new URL(request.url).origin;
}
