import type { APIRoute } from 'astro';
import { badOrigin, ipOf, usersMode, validEmail } from '../../../lib/adminAuth';
import { mailReady, sendMail } from '../../../lib/mail';

export const prerender = false;

const wait = () => new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

/** Адрес сайта для ссылки в письме — из настроек, а не из заголовка Host (его можно подделать). */
function siteOrigin() {
  const d = (process.env.STAY_DOMAINS || 'stay.com.tr').split(',')[0].trim() || 'stay.com.tr';
  return `https://${d}`;
}

/**
 * «Забыли пароль?»
 * step=request { email } — если такой пользователь есть, на его почту уходит ссылка (30 минут, одноразовая).
 *   Ответ всегда одинаковый, чтобы по нему нельзя было узнать, есть ли такой адрес.
 * step=set { token, password, password2 } — новый пароль; все входы пользователя закрываются,
 *   дальше обычный вход с кодом из письма.
 */
export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  if (!usersMode()) return redirect('/admin/', 303);
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  const form = await request.formData();
  const db = await import('../../../lib/adminDb');
  const ip = ipOf(request, clientAddress);

  if (form.get('step') === 'set') {
    const token = String(form.get('token') ?? '');
    const pw = String(form.get('password') ?? '');
    const back = `/admin/?reset=${encodeURIComponent(token)}`;
    const id = db.resetUser(token);
    if (!id) return redirect('/admin/?error=resetexpired', 303);
    if (pw !== String(form.get('password2') ?? '')) return redirect(`${back}&error=mismatch`, 303);
    const problem = db.passwordProblem(pw);
    if (problem) return redirect(`${back}&error=weakpw`, 303);
    const u = db.getUser(id);
    if (!u || !u.active) return redirect('/admin/?error=resetexpired', 303);
    db.setPassword(id, pw);
    db.dropResetTokens(id);
    db.endUserSessions(id);
    db.clearAttempts(`u:${u.email.toLowerCase()}`);
    db.audit(u, 'user.password_reset_self', '', ip);
    return redirect('/admin/?reset=done', 303);
  }

  // Запрос ссылки. Ограничение: 3 письма на адрес и 10 запросов с одного IP за 15 минут.
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 120);
  const kMail = `reset:${email}`;
  const kIp = `reset-ip:${ip}`;
  await wait();
  if (!validEmail(email) || db.attempts(kMail) >= 3 || db.attempts(kIp) >= 10) {
    db.addAttempt(kIp);
    return redirect('/admin/?sent=1', 303);
  }
  db.addAttempt(kMail);
  db.addAttempt(kIp);
  const u = db.userByEmail(email);
  if (u && u.active && mailReady()) {
    const token = db.createResetToken(u.id);
    const link = `${siteOrigin()}/admin/?reset=${token}`;
    try {
      await sendMail(u.email, 'Восстановление пароля в админке Stay',
        `Чтобы задать новый пароль для входа в админку сайта Stay, откройте ссылку:\n${link}\n\nСсылка действует ${db.RESET_TTL_MIN} минут и работает один раз. Запрос пришёл с адреса ${ip}.\nЕсли вы не запрашивали восстановление, просто удалите это письмо: пароль останется прежним.`);
      db.audit(u, 'user.reset_requested', '', ip);
    } catch (e) {
      db.audit(u, 'user.reset_mail_fail', (e as Error).message, ip);
    }
  } else {
    db.audit(null, 'user.reset_unknown', email, ip);
  }
  return redirect('/admin/?sent=1', 303);
};
