/**
 * Вход в админку по паролю из переменной окружения ADMIN_PASSWORD
 * (задаётся в настройках проекта на Vercel). Без неё админка выключена.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const COOKIE = 'stay_admin';

function password() {
  return process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || '';
}

export function adminEnabled() {
  return password().length >= 8;
}

function sign(v: string) {
  return createHmac('sha256', password()).update(v).digest('hex');
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  return adminEnabled() && same(sign(input), sign(password()));
}

export function startSession(cookies: AstroCookies) {
  const exp = String(Date.now() + 12 * 3600 * 1000);
  cookies.set(COOKIE, `${exp}.${sign(exp)}`, { path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'strict', maxAge: 12 * 3600 });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}

export function isAdmin(cookies: AstroCookies) {
  if (!adminEnabled()) return false;
  const v = cookies.get(COOKIE)?.value ?? '';
  const [exp, sig] = v.split('.');
  return !!exp && !!sig && Number(exp) > Date.now() && same(sig, sign(exp));
}
