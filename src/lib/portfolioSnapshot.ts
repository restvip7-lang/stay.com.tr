/**
 * Объекты из своего снимка Portfolio (STAY_DATA_DIR/portfolio/), который собирает scripts/portfolio-sync.mjs.
 * Так сайт не зависит от dev.stayproperty.com.
 *
 * Источник выбирает STAY_OBJECTS_SOURCE:
 *   portfolio — только свой снимок (dev не спрашиваем); если снимка ещё нет — встроенная копия;
 *   auto (по умолчанию) — свой снимок, если он есть, иначе dev;
 *   dev — как раньше, только dev.
 */
import fs from 'node:fs';
import path from 'node:path';

type Raw = Record<string, any>;

export interface SnapshotDetail {
  id: string;
  operation: 'sale' | 'rental';
  i18n: Record<string, { title: string | null; content: string | null }>;
  imageUrls: string[];
  yearBuilt: string | null;
  regionName: string | null;
  pricePerSquare: number | null;
  videoUrl: string | null;
  modified: string | null;
  /** Справочники Portfolio: инфраструктура и вид (подписи ru/en). Нет в старых снимках. */
  amenities?: { ru: string[]; en: string[] };
  view?: { ru: string[]; en: string[] };
  /** Прочие короткие мета-поля объекта как есть (мебель, санузлы, участок…). */
  extra?: Record<string, string>;
}

const mode = () => (process.env.STAY_OBJECTS_SOURCE || 'auto').toLowerCase();
const dir = () => path.resolve(process.env.STAY_DATA_DIR || 'data', 'portfolio');

/** Сайт не должен ходить за объектами на dev. */
export const devDisabled = () => mode() === 'portfolio';

const lists = new Map<string, { mtime: number; value: Raw[] }>();

function readList(operation: 'sale' | 'rental'): Raw[] | null {
  if (mode() === 'dev') return null;
  const f = path.join(dir(), `${operation}.json`);
  try {
    const { mtimeMs } = fs.statSync(f);
    const hit = lists.get(f);
    if (hit && hit.mtime === mtimeMs) return hit.value;
    const value = JSON.parse(fs.readFileSync(f, 'utf8')) as Raw[];
    if (!Array.isArray(value) || !value.length) return null;
    lists.set(f, { mtime: mtimeMs, value });
    return value;
  } catch {
    return null;
  }
}

/** Карточки объектов в формате прежней ленты dev (/api/sale?source=portfolio&language=ru). null — снимка нет. */
export function snapshotList(operation: 'sale' | 'rental'): Raw[] | null {
  return readList(operation);
}

/** id объектов с переводом на язык — для sitemap. */
export function snapshotTranslatedIds(operation: 'sale' | 'rental', lang: string): string[] | null {
  const list = readList(operation);
  return list ? list.filter((x) => (x.langs as string[] | undefined)?.includes(lang)).map((x) => String(x.id)) : null;
}

/** Подробности объекта. undefined — снимка нет вообще, null — такого объекта в снимке нет. */
export function snapshotDetail(id: string, operation: 'sale' | 'rental'): { card: Raw; detail: SnapshotDetail | null } | null | undefined {
  const list = readList(operation);
  if (!list) return undefined;
  const card = list.find((x) => String(x.id) === id);
  if (!card) return null;
  if (!/^\d+$/.test(id)) return { card, detail: null };
  try {
    return { card, detail: JSON.parse(fs.readFileSync(path.join(dir(), 'objects', `${id}.json`), 'utf8')) as SnapshotDetail };
  } catch {
    return { card, detail: null };
  }
}

/** Когда снимок обновлялся (для админки и проверки). */
export function snapshotInfo(): Raw | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir(), 'meta.json'), 'utf8'));
  } catch {
    return null;
  }
}
