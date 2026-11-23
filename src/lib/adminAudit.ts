/** Запись в журнал действий админки (только на своём сервере, где есть база). */
import { usersMode, type AdminUser } from './adminAuth';

export async function audit(user: AdminUser | null, action: string, detail = '', ip = '') {
  if (!usersMode() || !user || !user.id) return;
  (await import('./adminDb')).audit(user, action, detail, ip);
}
