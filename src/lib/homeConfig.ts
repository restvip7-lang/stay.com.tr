/**
 * Настройки главной (проекты Stay, слайдер, способы покупки).
 * Хранятся в Vercel Blob (config/home.json), правятся в /admin.
 * Если хранилища нет (локально) или файл ещё не сохранён — берём
 * значения по умолчанию из src/content/data/home.json.
 */
import defaults from '../content/data/home.json';

export type HomeConfig = Omit<typeof defaults, '_comment'>;

const KEY = 'config/home.json';
let memo: { at: number; value: HomeConfig } | null = null;

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN;
}

export function storageReady() {
  return !!blobToken();
}

function normalize(x: any): HomeConfig {
  const d = defaults as any;
  const out = { ...d, ...(x || {}) };
  delete out._comment;
  out.projects = Array.isArray(out.projects) ? out.projects.filter((c: unknown) => typeof c === 'string') : d.projects;
  out.hero = Array.isArray(out.hero) ? out.hero.filter((h: any) => h && typeof h.project === 'string') : d.hero;
  out.projectsVisible = Math.max(1, Math.min(50, Number(out.projectsVisible) || d.projectsVisible));
  const pv = out.prive && typeof out.prive === 'object' ? out.prive : {};
  out.prive = {
    hero: Array.isArray(pv.hero) ? pv.hero.filter((c: unknown) => typeof c === 'string') : d.prive.hero,
    projects: Array.isArray(pv.projects) ? pv.projects.filter((c: unknown) => typeof c === 'string') : d.prive.projects,
    projectsVisible: Math.max(1, Math.min(50, Number(pv.projectsVisible) || d.prive.projectsVisible)),
  };
  return out;
}

export async function getHomeConfig(): Promise<HomeConfig> {
  if (memo && Date.now() - memo.at < 30_000) return memo.value;
  let value = normalize(null);
  if (storageReady()) {
    try {
      const { head } = await import('@vercel/blob');
      const meta = await head(KEY, { token: blobToken() });
      const res = await fetch(`${meta.url}?v=${meta.uploadedAt.valueOf()}`, { cache: 'no-store' });
      if (res.ok) value = normalize(await res.json());
    } catch {
      /* файла ещё нет — значения по умолчанию */
    }
  }
  memo = { at: Date.now(), value };
  return value;
}

export async function saveHomeConfig(x: unknown): Promise<HomeConfig> {
  if (!storageReady()) throw new Error('Хранилище не подключено');
  const value = normalize(x);
  const { put } = await import('@vercel/blob');
  await put(KEY, JSON.stringify(value, null, 2), {
    access: 'public',
    token: blobToken(),
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  memo = { at: Date.now(), value };
  return value;
}
