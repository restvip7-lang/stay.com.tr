/**
 * Настройки главной (проекты Stay, слайдер, способы покупки).
 * Хранятся в хранилище сайта (store.ts) (config/home.json), правятся в /admin.
 * Если хранилища нет (локально) или файл ещё не сохранён — берём
 * значения по умолчанию из src/content/data/home.json.
 */
import defaults from '../content/data/home.json';
import { readJson, storeReady, writeJson } from './store';

export type HomeConfig = Omit<typeof defaults, '_comment'> & { projectsHidden?: string[] };

const KEY = 'config/home.json';
let memo: { at: number; value: HomeConfig } | null = null;

export const storageReady = storeReady;

function normalize(x: any): HomeConfig {
  const d = defaults as any;
  const out = { ...d, ...(x || {}) };
  delete out._comment;
  out.projects = Array.isArray(out.projects) ? out.projects.filter((c: unknown) => typeof c === 'string') : d.projects;
  // Наши проекты, скрытые из «Проектов STAY» (шапка, подвал, главная); остальные наши показываются все.
  out.projectsHidden = Array.isArray(out.projectsHidden) ? out.projectsHidden.filter((c: unknown) => typeof c === 'string') : [];
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
  const saved = await readJson(KEY);
  if (saved) value = normalize(saved);
  memo = { at: Date.now(), value };
  return value;
}

export async function saveHomeConfig(x: unknown): Promise<HomeConfig> {
  if (!storageReady()) throw new Error('Хранилище не подключено');
  const value = normalize(x);
  await writeJson(KEY, value, true);
  memo = { at: Date.now(), value };
  return value;
}
