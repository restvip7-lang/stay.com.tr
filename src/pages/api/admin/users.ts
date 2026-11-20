import type { APIRoute } from 'astro';
import { allowed, badOrigin, codeRequired, currentUser, ipOf, setUserSession, usersMode, validEmail } from '../../../lib/adminAuth';

export const prerender = false;

const json = (x: unknown, status = 200) => Response.json(x, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Пользователи админки (только на своём сервере).
 * Любой вошедший: action=myPassword { current, next }.
 * Владелец: create { login, name, email, role, password }, update { id, name?, email?, role?, active? },
 * password { id, password }, delete { id }, logoutAll { id }.
 */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  if (!usersMode()) return json({ ok: false, error: 'Пользователи доступны только на своём сервере' }, 400);
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  const me = await currentUser(cookies);
  if (!me) return json({ ok: false, error: 'Нужно войти' }, 401);
  const db = await import('../../../lib/adminDb');
  const ip = ipOf(request, clientAddress);
  const b = (await request.json().catch(() => ({}))) as Record<string, any>;
  const id = Number(b.id);
  try {
    if (b.action === 'myPassword') {
      const row = db.userWithHash(me.login);
      if (!row || !db.verifyPassword(String(b.current ?? ''), row.pass_hash)) return json({ ok: false, error: 'Текущий пароль неверный' }, 400);
      if (String(b.next ?? '') === String(b.current ?? '')) return json({ ok: false, error: 'Новый пароль должен отличаться от текущего' }, 400);
      db.setPassword(me.id, String(b.next ?? ''));
      // Остальные входы с этим паролем закрываем, текущий — заменяем новым.
      db.endUserSessions(me.id);
      setUserSession(cookies, db.createSession(me.id, ip, request.headers.get('user-agent') ?? ''), db.SESSION_MAX_AGE);
      db.audit(me, 'user.my_password', '', ip);
      return json({ ok: true, reload: me.mustChange });
    }
    if (!allowed(me, 'users')) return json({ ok: false, error: 'Нет доступа' }, 403);
    const role = b.role === undefined ? undefined : db.isRole(b.role) ? b.role : null;
    if (role === null) return json({ ok: false, error: 'Неизвестная роль' }, 400);
    const who = () => db.getUser(id)?.login ?? String(id);
    // Вход только по коду из письма — без почты пользователь не сможет войти.
    const needEmail = (e: unknown) => codeRequired() && !validEmail(String(e ?? '').trim());
    if (b.action === 'create' && needEmail(b.email)) return json({ ok: false, error: 'Укажите почту: вход в админку только с кодом из письма' }, 400);
    if (b.action === 'update' && b.email !== undefined && needEmail(b.email)) return json({ ok: false, error: 'Почту нельзя оставить пустой: вход только с кодом из письма' }, 400);
    switch (b.action) {
      case 'create': {
        const nid = db.createUser({ login: String(b.login ?? '').trim(), name: String(b.name ?? ''), email: String(b.email ?? '').trim(), role: role ?? 'editor', password: String(b.password ?? '') });
        db.audit(me, 'user.create', `${b.login} (${role ?? 'editor'})`, ip);
        return json({ ok: true, id: nid, users: db.listUsers() });
      }
      case 'update': {
        db.updateUser(id, { name: b.name, email: b.email, role, active: typeof b.active === 'boolean' ? b.active : undefined });
        db.audit(me, 'user.update', `${who()}: ${JSON.stringify({ role, active: b.active, email: b.email !== undefined ? 'изменён' : undefined })}`, ip);
        return json({ ok: true, users: db.listUsers() });
      }
      case 'password': {
        // Временный пароль от владельца: при входе пользователь обязан задать свой.
        db.setPassword(id, String(b.password ?? ''), id !== me.id);
        db.endUserSessions(id);
        db.audit(me, 'user.password_reset', who(), ip);
        return json({ ok: true });
      }
      case 'logoutAll': {
        db.endUserSessions(id);
        db.audit(me, 'user.logout_all', who(), ip);
        return json({ ok: true });
      }
      case 'delete': {
        if (id === me.id) return json({ ok: false, error: 'Себя удалить нельзя' }, 400);
        const name = who();
        db.deleteUser(id);
        db.audit(me, 'user.delete', name, ip);
        return json({ ok: true, users: db.listUsers() });
      }
    }
    return json({ ok: false, error: 'Неизвестное действие' }, 400);
  } catch (e) {
    return json({ ok: false, error: (e as Error).message.slice(0, 300) }, 400);
  }
};
