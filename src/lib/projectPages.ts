/**
 * «Страница проекта» — то, что сотрудник ведёт в админке для наших ЖК (план страницы ЖК по образцу МИРА, решения Anuar 28.11.2026):
 * подзаголовок, акции (до 2, с датой «до» — после неё скрываются сами), рассрочка (если в базе ЖК пусто), 3D-тур,
 * Live-камера, категории фото, свои фото, материалы (PDF), ход строительства по месяцам, новости проекта.
 * Общие цифры ипотеки (взнос от, срок до) — одни на все ЖК.
 * Хранится в config/project-pages.json. Имена полей — те, что позже уйдут в API adminer без переименования.
 * Тексты: ru обязателен, en по желанию; на tr/de/sr показываем en, а если его нет — ru.
 * Пустое поле = блок или плитка на сайте не показывается.
 */
import type { Lang } from '../i18n/config';
import { readJson, storeReady, writeJson } from './store';

export type LText = { ru?: string; en?: string };
export const PHOTO_CATS = ['territory', 'infra', 'interior', 'view'] as const;
export type PhotoCat = (typeof PHOTO_CATS)[number];
export const PHOTO_CAT_LABEL: Record<PhotoCat | 'all', Record<Lang, string>> = {
  all: { ru: 'Все', en: 'All', tr: 'Tümü', de: 'Alle', sr: 'Sve' },
  territory: { ru: 'Территория', en: 'Grounds', tr: 'Site', de: 'Gelände', sr: 'Teritorija' },
  infra: { ru: 'Инфраструктура', en: 'Facilities', tr: 'Sosyal tesisler', de: 'Infrastruktur', sr: 'Infrastruktura' },
  interior: { ru: 'Интерьер', en: 'Interiors', tr: 'İç mekân', de: 'Innenräume', sr: 'Enterijer' },
  view: { ru: 'Вид и окружение', en: 'Views & surroundings', tr: 'Manzara ve çevre', de: 'Aussicht & Umgebung', sr: 'Pogled i okolina' },
};
export const DOC_TABS = ['pres', 'plans', 'docs'] as const;
export type DocTab = (typeof DOC_TABS)[number];

export interface Promo { title: LText; text: LText; until: string; image: string }
export interface ProjectDoc { tab: DocTab; title: LText; file: string; cover: string }
export interface ProgressMonth { month: string; photos: string[]; text: LText }
export interface ProjectNews { date: string; title: LText; text: LText; image: string }
export interface ProjectPage {
  subtitle?: LText;
  promos?: Promo[];
  installment?: { down: number | null; months: number | null; text: LText } | null;
  tourUrl?: string;
  liveUrl?: string;
  formImage?: string;
  photoCats?: Record<string, PhotoCat>;
  photos?: { src: string; cat: PhotoCat | '' }[];
  docs?: ProjectDoc[];
  progress?: ProgressMonth[];
  news?: ProjectNews[];
}
export interface Mortgage { down: number; years: number }
export interface PagesDb { projects: Record<string, ProjectPage>; mortgage: Mortgage }

const KEY = 'config/project-pages.json';
export const MORTGAGE_DEFAULT: Mortgage = { down: 50, years: 10 };
let memo: { at: number; value: PagesDb } | null = null;

const str = (v: unknown, max = 300) => String(v ?? '').trim().slice(0, max);
const FILE_RE = /^(https:\/\/|\/(media|hero|picker|uploads)\/)/;
export const fileUrl = (v: unknown) => { const s = str(v, 600); return FILE_RE.test(s) && !s.includes('..') ? s : ''; };
const link = (v: unknown) => { const s = str(v, 600); return /^https:\/\//.test(s) ? s : ''; };
const ltext = (v: unknown, max = 600): LText => {
  const o = (v && typeof v === 'object' ? v : {}) as LText;
  const out: LText = {};
  const ru = str(o.ru, max), en = str(o.en, max);
  if (ru) out.ru = ru;
  if (en) out.en = en;
  return out;
};
const has = (t: LText) => !!(t.ru || t.en);
const date = (v: unknown) => { const s = str(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; };
const month = (v: unknown) => { const s = str(v, 7); return /^\d{4}-(0[1-9]|1[0-2])$/.test(s) ? s : ''; };
const int = (v: unknown, lo: number, hi: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) && v !== '' && v != null ? Math.min(hi, Math.max(lo, n)) : null; };
const cat = (v: unknown): PhotoCat | '' => ((PHOTO_CATS as readonly string[]).includes(String(v)) ? (v as PhotoCat) : '');
const arr = <T>(v: unknown, n: number, f: (x: Record<string, unknown>) => T | null): T[] =>
  (Array.isArray(v) ? v : []).slice(0, n).map((x) => (x && typeof x === 'object' ? f(x as Record<string, unknown>) : null)).filter((x): x is T => !!x);

export function normalizePage(raw: unknown): ProjectPage {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const p: ProjectPage = {};
  const sub = ltext(r.subtitle, 160);
  if (has(sub)) p.subtitle = sub;
  const promos = arr(r.promos, 2, (x) => { const t = ltext(x.title, 120); return has(t) ? { title: t, text: ltext(x.text, 400), until: date(x.until), image: fileUrl(x.image) } : null; });
  if (promos.length) p.promos = promos;
  const ins = (r.installment ?? {}) as Record<string, unknown>;
  const insv = { down: int(ins.down, 0, 100), months: int(ins.months, 1, 240), text: ltext(ins.text, 400) };
  if (insv.down != null || insv.months != null || has(insv.text)) p.installment = insv;
  if (link(r.tourUrl)) p.tourUrl = link(r.tourUrl);
  if (link(r.liveUrl)) p.liveUrl = link(r.liveUrl);
  if (fileUrl(r.formImage)) p.formImage = fileUrl(r.formImage);
  if (r.photoCats && typeof r.photoCats === 'object') {
    const pc = Object.fromEntries(Object.entries(r.photoCats as Record<string, unknown>).slice(0, 500).map(([k, v]) => [str(k, 600), cat(v)]).filter(([k, v]) => k && v)) as Record<string, PhotoCat>;
    if (Object.keys(pc).length) p.photoCats = pc;
  }
  const photos = arr(r.photos, 200, (x) => (fileUrl(x.src) ? { src: fileUrl(x.src), cat: cat(x.cat) } : null));
  if (photos.length) p.photos = photos;
  const docs = arr(r.docs, 30, (x) => { const f = fileUrl(x.file); const t = ltext(x.title, 120); return f && has(t) ? { tab: (DOC_TABS as readonly string[]).includes(String(x.tab)) ? (x.tab as DocTab) : 'docs', title: t, file: f, cover: fileUrl(x.cover) } : null; });
  if (docs.length) p.docs = docs;
  const progress = arr(r.progress, 60, (x) => { const m = month(x.month); const ph = (Array.isArray(x.photos) ? x.photos : []).map(fileUrl).filter(Boolean).slice(0, 10); return m && ph.length ? { month: m, photos: ph, text: ltext(x.text, 400) } : null; });
  // ход строительства и новости — новые сверху
  if (progress.length) p.progress = progress.sort((a, b) => b.month.localeCompare(a.month));
  const news = arr(r.news, 50, (x) => { const t = ltext(x.title, 160); const d = date(x.date); return t.ru && d ? { date: d, title: t, text: ltext(x.text, 2000), image: fileUrl(x.image) } : null; });
  if (news.length) p.news = news.sort((a, b) => b.date.localeCompare(a.date));
  return p;
}

function normalizeDb(x: unknown): PagesDb {
  const r = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
  const projects: Record<string, ProjectPage> = {};
  for (const [code, raw] of Object.entries((r.projects ?? {}) as Record<string, unknown>).slice(0, 200)) {
    const k = str(code, 120);
    if (!k) continue;
    const p = normalizePage(raw);
    if (Object.keys(p).length) projects[k] = p;
  }
  const m = (r.mortgage ?? {}) as Record<string, unknown>;
  return { projects, mortgage: { down: int(m.down, 0, 100) ?? MORTGAGE_DEFAULT.down, years: int(m.years, 1, 40) ?? MORTGAGE_DEFAULT.years } };
}

export async function getProjectPages(): Promise<PagesDb> {
  if (!memo || Date.now() - memo.at > 30_000) {
    const saved = await readJson(KEY).catch(() => null);
    memo = { at: Date.now(), value: normalizeDb(saved) };
  }
  return memo.value;
}

export async function projectPageOf(code: string | null | undefined): Promise<ProjectPage> {
  return code ? (await getProjectPages()).projects[code] ?? {} : {};
}

/** Сохранить страницу одного проекта (и общие цифры ипотеки, если пришли). */
export async function saveProjectPage(code: string, page: unknown, mortgage?: unknown): Promise<PagesDb> {
  if (!storeReady()) throw new Error('Хранилище не подключено');
  const k = str(code, 120);
  if (!k) throw new Error('Не выбран проект');
  const db = normalizeDb(await readJson(KEY).catch(() => null));
  const p = normalizePage(page);
  if (Object.keys(p).length) db.projects[k] = p;
  else delete db.projects[k];
  if (mortgage) db.mortgage = normalizeDb({ mortgage }).mortgage;
  await writeJson(KEY, db, true);
  memo = { at: Date.now(), value: db };
  return db;
}

/** Текст на языке страницы: сам язык (ru/en), для остальных — en, затем ru. */
export const tx = (t: LText | undefined, lang: Lang) => (t ? (lang === 'ru' ? t.ru : t.en || t.ru) ?? '' : '');

/** Акции, срок которых не прошёл (дата «до» включительно; без даты — бессрочная). */
export const livePromos = (p: ProjectPage, now = new Date()) => {
  const today = now.toISOString().slice(0, 10);
  return (p.promos ?? []).filter((x) => !x.until || x.until >= today);
};
