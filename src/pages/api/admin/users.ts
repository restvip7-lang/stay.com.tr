import type { APIRoute } from 'astro';
import { allowed, badOrigin, currentUser, ipOf, usersMode } from '../../../lib/adminAuth';

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
      db.setPassword(me.id, String(b.next ?? ''));
      db.audit(me, 'user.my_password', '', ip);
      return json({ ok: true });
    }
    if (!allowed(me, 'users')) return json({ ok: false, error: 'Нет доступа' }, 403);
    const role = b.role === undefined ? undefined : db.isRole(b.role) ? b.role : null;
    if (role === null) return json({ ok: false, error: 'Неизвестная роль' }, 400);
    const who = () => db.getUser(id)?.login ?? String(id);
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
        db.setPassword(id, String(b.password ?? ''));
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
