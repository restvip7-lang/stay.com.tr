import type { APIRoute } from 'astro';
import { badOrigin, checkPassword, endSession, ipOf, setUserSession, startSession, usersMode } from '../../../lib/adminAuth';
import { mailReady, sendMail } from '../../../lib/mail';

export const prerender = false;

const TICKET = 'stay_admin_t';
const wait = () => new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

/**
 * Вход в админку. На своём сервере — логин и пароль, затем код из письма (если почта настроена).
 * На Vercel — один пароль, как раньше.
 */
export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  const form = await request.formData();
  if (form.get('logout')) {
    await endSession(cookies);
    return redirect('/admin/', 303);
  }

  if (!usersMode()) {
    if (checkPassword(String(form.get('password') ?? ''))) {
      startSession(cookies);
      return redirect('/admin/', 303);
    }
    await wait();
    return redirect('/admin/?error=1', 303);
  }

  const db = await import('../../../lib/adminDb');
  const ip = ipOf(request, clientAddress);
  const ua = request.headers.get('user-agent') ?? '';
  const ticketOpts = { path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'strict' as const, maxAge: db.CODE_TTL_MIN * 60 };
  const enter = (u: { id: number; login: string }) => {
    setUserSession(cookies, db.createSession(u.id, ip, ua), db.SESSION_MAX_AGE);
    cookies.delete(TICKET, { path: '/' });
    db.audit(u, 'login', '', ip);
    return redirect('/admin/', 303);
  };

  // Второй шаг: код из письма.
  if (form.get('step') === 'code') {
    const ticket = cookies.get(TICKET)?.value ?? '';
    const r = ticket ? db.checkLoginCode(ticket, String(form.get('code') ?? '')) : null;
    if (typeof r === 'number') {
      const u = db.getUser(r);
      if (u && u.active) return enter(u);
    }
    await wait();
    if (r === 'retry') return redirect('/admin/?step=code&error=code', 303);
    cookies.delete(TICKET, { path: '/' });
    return redirect('/admin/?error=expired', 303);
  }

  // Первый шаг: логин и пароль.
  const login = String(form.get('login') ?? '').trim().toLowerCase().slice(0, 64);
  const pw = String(form.get('password') ?? '');
  const kUser = `u:${login}`;
  const kIp = `ip:${ip}`;
  if (db.attempts(kUser) >= 5 || db.attempts(kIp) >= 20) {
    db.audit(null, 'login.locked', login, ip);
    await wait();
    return redirect('/admin/?error=locked', 303);
  }

  // Первый запуск: пользователей ещё нет — входим как admin с паролем из ADMIN_PASSWORD, он становится владельцем.
  if (db.countUsers() === 0) {
    if (login === 'admin' && checkPassword(pw)) {
      try {
        const id = db.createUser({ login: 'admin', name: 'Владелец', email: '', role: 'owner', password: pw });
        db.audit({ id, login: 'admin' }, 'bootstrap', 'создан первый владелец', ip);
        return enter({ id, login: 'admin' });
      } catch {
        return redirect('/admin/?error=weak', 303);
      }
    }
    db.addAttempt(kUser);
    db.addAttempt(kIp);
    await wait();
    return redirect('/admin/?error=1', 303);
  }

  const u = db.userWithHash(login);
  const ok = u ? u.active === 1 && db.verifyPassword(pw, u.pass_hash) : (db.dummyVerify(pw), false);
  if (!u || !ok) {
    db.addAttempt(kUser);
    db.addAttempt(kIp);
    db.audit(null, 'login.fail', login, ip);
    await wait();
    return redirect('/admin/?error=1', 303);
  }
  db.clearAttempts(kUser);

  if (mailReady() && u.email) {
    const { ticket, code } = db.createLoginCode(u.id);
    try {
      await sendMail(u.email, `Код входа в админку Stay: ${code}`, `Код для входа в админку сайта Stay: ${code}\n\nДействует ${db.CODE_TTL_MIN} минут. Вход с адреса ${ip}.\nЕсли это не вы, смените пароль и сообщите владельцу админки.`);
    } catch (e) {
      db.audit(u, 'login.mail_fail', (e as Error).message, ip);
      return redirect('/admin/?error=mail', 303);
    }
    cookies.set(TICKET, ticket, ticketOpts);
    db.audit(u, 'login.code_sent', u.email.replace(/^(.).*@/, '$1***@'), ip);
    return redirect('/admin/?step=code', 303);
  }
  return enter(u);
};
