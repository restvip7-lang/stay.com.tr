/**
 * База админки на своём сервере (SQLite, файл STAY_DATA_DIR/admin.db, права 600):
 * пользователи, сессии входа, коды с почты, неудачные попытки входа и журнал действий.
 * Пароли и коды хранятся только в виде хэша (scrypt / sha256), токен сессии — тоже хэшем.
 * SQLite встроен в Node 22 (node:sqlite), отдельный сервер базы не нужен.
 */
import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { dataDir } from './store';

export type Role = 'owner' | 'admin' | 'editor' | 'seo';
export const ROLES: { id: Role; label: string; note: string }[] = [
  { id: 'owner', label: 'Владелец', note: 'всё, включая пользователей и журнал' },
  { id: 'admin', label: 'Администратор', note: 'все разделы, кроме пользователей' },
  { id: 'editor', label: 'Редактор', note: 'главная и объекты' },
  { id: 'seo', label: 'SEO', note: 'только SEO' },
];
export const isRole = (r: unknown): r is Role => ROLES.some((x) => x.id === r);

export interface UserRow { id: number; login: string; name: string; email: string; role: Role; active: number; must_change: number; created_at: string; last_login_at: string | null }

const SESSION_HOURS = 12;
const CODE_MINUTES = 10;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;
let db: Db | null = null;

function open(): Db {
  if (db) return db;
  const { DatabaseSync } = (process as unknown as { getBuiltinModule: (m: string) => { DatabaseSync: new (f: string) => Db } }).getBuiltinModule('node:sqlite');
  mkdirSync(dataDir(), { recursive: true });
  const file = path.join(dataDir(), 'admin.db');
  const fresh = !existsSync(file);
  db = new DatabaseSync(file);
  if (fresh) try { chmodSync(file, 0o600); } catch { /* не критично */ }
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      login TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL,
      pass_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      ip TEXT, ua TEXT
    );
    CREATE TABLE IF NOT EXISTS login_codes (
      ticket_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      tries INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS login_attempts (key TEXT NOT NULL, at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS login_attempts_key ON login_attempts(key, at);
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY,
      at TEXT NOT NULL DEFAULT (datetime('now')),
      user_id INTEGER, login TEXT, action TEXT NOT NULL, detail TEXT, ip TEXT
    );
  `);
  // Миграция: «сменить пароль при следующем входе» (первый владелец, сброс пароля владельцем).
  try { db.exec('ALTER TABLE users ADD COLUMN must_change INTEGER NOT NULL DEFAULT 0'); } catch { /* колонка уже есть */ }
  return db;
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const now = () => Date.now();

/* ---------- Пароли ---------- */

const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64, SCRYPT);
  return `s1$${salt.toString('base64')}$${hash.toString('base64')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [v, salt, hash] = stored.split('$');
  if (v !== 's1' || !salt || !hash) return false;
  const want = Buffer.from(hash, 'base64');
  const got = scryptSync(pw, Buffer.from(salt, 'base64'), want.length, SCRYPT);
  return timingSafeEqual(want, got);
}
/** Хэш-заглушка: проверяем пароль и для несуществующего логина, чтобы по времени ответа нельзя было угадать логины. */
let dummy = '';
export const dummyVerify = (pw: string) => verifyPassword(pw, dummy || (dummy = hashPassword('x'.repeat(16))));

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return 'Пароль — не короче 10 символов';
  if (!/[a-zа-я]/i.test(pw) || !/\d/.test(pw)) return 'В пароле нужны буквы и цифры';
  return null;
}

/* ---------- Пользователи ---------- */

const COLS = 'id, login, name, email, role, active, must_change, created_at, last_login_at';
export const countUsers = (): number => open().prepare('SELECT COUNT(*) n FROM users').get().n;
export const listUsers = (): UserRow[] => open().prepare(`SELECT ${COLS} FROM users ORDER BY active DESC, login`).all();
export const getUser = (id: number): UserRow | null => open().prepare(`SELECT ${COLS} FROM users WHERE id = ?`).get(id) ?? null;
export const userWithHash = (login: string): (UserRow & { pass_hash: string }) | null => open().prepare(`SELECT ${COLS}, pass_hash FROM users WHERE login = ?`).get(login) ?? null;
/** Вход по логину или по почте (почта у пользователей уникальна). */
export function userForLogin(x: string): (UserRow & { pass_hash: string }) | null {
  const byLogin = userWithHash(x);
  if (byLogin || !x.includes('@')) return byLogin;
  const rows = open().prepare(`SELECT ${COLS}, pass_hash FROM users WHERE email = ? COLLATE NOCASE`).all(x);
  return rows.length === 1 ? rows[0] : null;
}
const emailTaken = (email: string, exceptId = 0): boolean =>
  !!email && !!open().prepare('SELECT 1 FROM users WHERE email = ? COLLATE NOCASE AND id != ?').get(email, exceptId);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const owners = (): number => open().prepare("SELECT COUNT(*) n FROM users WHERE role = 'owner' AND active = 1").get().n;

export function createUser(u: { login: string; name: string; email: string; role: Role; password: string; mustChange?: boolean }): number {
  u = { ...u, email: u.email.trim().toLowerCase(), login: (u.login.trim() || u.email.trim()).toLowerCase() };
  // Логин — латиница (3–32) или сама почта: тогда входить можно просто по адресу.
  const okLogin = /^[a-z0-9._-]{3,32}$/.test(u.login) || (EMAIL_RE.test(u.login) && u.login.length <= 120);
  if (!okLogin) throw new Error('Логин: почта или 3–32 символа латиницей (цифры, точка, дефис)');
  if (emailTaken(u.email)) throw new Error('Пользователь с такой почтой уже есть');
  const p = passwordProblem(u.password);
  if (p) throw new Error(p);
  if (userWithHash(u.login)) throw new Error('Такой логин уже есть');
  const r = open().prepare('INSERT INTO users (login, name, email, role, pass_hash, must_change) VALUES (?, ?, ?, ?, ?, ?)').run(u.login, u.name.slice(0, 80), u.email.slice(0, 120), u.role, hashPassword(u.password), u.mustChange ? 1 : 0);
  return Number(r.lastInsertRowid);
}

export function updateUser(id: number, ch: { name?: string; email?: string; role?: Role; active?: boolean }) {
  const cur = getUser(id);
  if (!cur) throw new Error('Пользователь не найден');
  if (ch.email !== undefined && emailTaken(ch.email.trim(), id)) throw new Error('Пользователь с такой почтой уже есть');
  const losesOwner = cur.role === 'owner' && cur.active && ((ch.role && ch.role !== 'owner') || ch.active === false);
  if (losesOwner && owners() <= 1) throw new Error('Нельзя убрать последнего владельца');
  open().prepare('UPDATE users SET name = ?, email = ?, role = ?, active = ? WHERE id = ?').run(
    (ch.name ?? cur.name).slice(0, 80), (ch.email === undefined ? cur.email : ch.email.trim().toLowerCase()).slice(0, 120), ch.role ?? cur.role, ch.active === undefined ? cur.active : ch.active ? 1 : 0, id,
  );
  if (ch.active === false || (ch.role && ch.role !== cur.role)) endUserSessions(id);
}

/** mustChange — пользователь обязан сменить пароль при следующем входе (так после сброса владельцем). */
export function setPassword(id: number, pw: string, mustChange = false) {
  const p = passwordProblem(pw);
  if (p) throw new Error(p);
  open().prepare('UPDATE users SET pass_hash = ?, must_change = ? WHERE id = ?').run(hashPassword(pw), mustChange ? 1 : 0, id);
}

export function deleteUser(id: number) {
  const cur = getUser(id);
  if (!cur) return;
  if (cur.role === 'owner' && cur.active && owners() <= 1) throw new Error('Нельзя удалить последнего владельца');
  open().prepare('DELETE FROM users WHERE id = ?').run(id);
}

/* ---------- Сессии ---------- */

export function createSession(userId: number, ip: string, ua: string): string {
  const token = randomBytes(32).toString('base64url');
  open().prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at, ip, ua) VALUES (?, ?, ?, ?, ?, ?)').run(sha(token), userId, now() + SESSION_HOURS * 3600_000, now(), ip, ua.slice(0, 200));
  open().prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(userId);
  open().prepare('DELETE FROM sessions WHERE expires_at < ?').run(now());
  return token;
}
export const SESSION_MAX_AGE = SESSION_HOURS * 3600;

export function sessionUser(token: string): UserRow | null {
  if (!token) return null;
  const row = open().prepare(`SELECT u.id, u.login, u.name, u.email, u.role, u.active, u.must_change, u.created_at, u.last_login_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`).get(sha(token), now());
  return row ?? null;
}
export const endSessionToken = (token: string) => open().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
export const endUserSessions = (userId: number) => open().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);

/* ---------- Код с почты (второй шаг входа) ---------- */

export function createLoginCode(userId: number): { ticket: string; code: string } {
  const ticket = randomBytes(24).toString('base64url');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  open().prepare('DELETE FROM login_codes WHERE user_id = ? OR expires_at < ?').run(userId, now());
  open().prepare('INSERT INTO login_codes (ticket_hash, user_id, code_hash, expires_at) VALUES (?, ?, ?, ?)').run(sha(ticket), userId, sha(ticket + ':' + code), now() + CODE_MINUTES * 60_000);
  return { ticket, code };
}
export const CODE_TTL_MIN = CODE_MINUTES;

/** Проверяет код. Возвращает id пользователя, 'retry' (неверный код, можно ещё) или null (билет сгорел). */
export function checkLoginCode(ticket: string, code: string): number | 'retry' | null {
  const row = open().prepare('SELECT user_id, code_hash, expires_at, tries FROM login_codes WHERE ticket_hash = ?').get(sha(ticket));
  if (!row || row.expires_at < now() || row.tries >= 5) {
    if (row) open().prepare('DELETE FROM login_codes WHERE ticket_hash = ?').run(sha(ticket));
    return null;
  }
  const ok = timingSafeEqual(Buffer.from(row.code_hash), Buffer.from(sha(ticket + ':' + code.replace(/\D/g, ''))));
  if (!ok) {
    open().prepare('UPDATE login_codes SET tries = tries + 1 WHERE ticket_hash = ?').run(sha(ticket));
    return row.tries + 1 >= 5 ? null : 'retry';
  }
  open().prepare('DELETE FROM login_codes WHERE ticket_hash = ?').run(sha(ticket));
  return row.user_id;
}
export const ticketAlive = (ticket: string): boolean => !!open().prepare('SELECT 1 FROM login_codes WHERE ticket_hash = ? AND expires_at > ? AND tries < 5').get(sha(ticket), now());

/* ---------- Защита от подбора ---------- */

const WINDOW = 15 * 60_000;
export function attempts(key: string): number {
  return open().prepare('SELECT COUNT(*) n FROM login_attempts WHERE key = ? AND at > ?').get(key, now() - WINDOW).n;
}
export function addAttempt(key: string) {
  open().prepare('INSERT INTO login_attempts (key, at) VALUES (?, ?)').run(key, now());
  open().prepare('DELETE FROM login_attempts WHERE at < ?').run(now() - 24 * 3600_000);
}
export const clearAttempts = (key: string) => open().prepare('DELETE FROM login_attempts WHERE key = ?').run(key);

/* ---------- Журнал ---------- */

export function audit(user: { id: number; login: string } | null, action: string, detail = '', ip = '') {
  try {
    open().prepare('INSERT INTO audit (user_id, login, action, detail, ip) VALUES (?, ?, ?, ?, ?)').run(user?.id ?? null, user?.login ?? null, action, detail.slice(0, 500), ip);
  } catch { /* журнал не должен ронять действие */ }
}
export const listAudit = (limit = 200): { at: string; login: string | null; action: string; detail: string; ip: string }[] =>
  open().prepare('SELECT at, login, action, detail, ip FROM audit ORDER BY id DESC LIMIT ?').all(limit);
