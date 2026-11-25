/**
 * Короткие адреса каталога STAY PROJECTS (как у образца mr-group.ru/flats/zhk-mira/building-mir_3/floor-from-16-to-16/):
 * /{lang}/stay-projects/{тип|all}/{проект-or-проект}/{block-c-or-…}/{комнатность-or-…}/{floor-from-N-to-M}/?остальное.
 */
import type { Lang } from '../i18n/config';

/** Слаг комнатности в адресе → значение фильтра ?rooms=. */
export const OWN_ROOMS: Record<string, string> = { studio: 'studio', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+' };
const ROOM_SLUG = Object.fromEntries(Object.entries(OWN_ROOMS).map(([k, v]) => [v, k])) as Record<string, string>;
const ROOM_ORDER = ['studio', '1+1', '2+1', '3+1', '4+'];

export interface OwnParts { projects: string[]; blocks: string[]; rooms: string[]; floorFrom?: number; floorTo?: number }

/** Сегмент этажа: floor-from-3-to-5, floor-from-3, floor-to-5. */
export function floorSeg(a?: number | null, b?: number | null): string {
  if (!a && !b) return '';
  return ['floor', a ? `from-${a}` : '', b ? `to-${b}` : ''].filter(Boolean).join('-');
}

/** Адрес каталога STAY PROJECTS. projects — слаги ЖК, blocks — буквы корпусов, rooms — значения ?rooms=. */
export function ownUrl(lang: Lang | string, type: string | null | undefined, parts: Partial<OwnParts> & { projectSlugs?: string[] } = {}, query = ''): string {
  const rooms = [...(parts.rooms ?? [])].filter((r) => ROOM_SLUG[r]).sort((a, b) => ROOM_ORDER.indexOf(a) - ROOM_ORDER.indexOf(b)).map((r) => ROOM_SLUG[r]);
  const segs = [
    lang, 'stay-projects', type || 'all',
    (parts.projectSlugs ?? []).join('-or-'),
    (parts.blocks ?? []).map((b) => `block-${b.toLowerCase()}`).join('-or-'),
    rooms.join('-or-'),
    floorSeg(parts.floorFrom, parts.floorTo),
  ];
  return `/${segs.filter(Boolean).join('/')}/${query ? `?${query}` : ''}`;
}

/** Разбор сегментов после типа; null — адрес неверный. codeOf — слаг ЖК → код (null, если не наш проект). */
export function parseOwnSegs(segs: string[], codeOf: (slug: string) => string | null): OwnParts | null {
  const out: OwnParts = { projects: [], blocks: [], rooms: [] };
  const seen = new Set<string>();
  for (const s of segs) {
    const parts = s.split('-or-');
    let kind: string;
    if (/^floor-(from-\d+)?(-?to-\d+)?$/.test(s) && s !== 'floor-') {
      kind = 'floor';
      const a = s.match(/from-(\d+)/), b = s.match(/to-(\d+)/);
      if (!a && !b) return null;
      out.floorFrom = a ? Number(a[1]) : undefined;
      out.floorTo = b ? Number(b[1]) : undefined;
    } else if (parts.every((x) => /^block-[a-z0-9]{1,4}$/.test(x))) {
      kind = 'block';
      out.blocks = parts.map((x) => x.slice(6).toUpperCase());
    } else if (parts.every((x) => x in OWN_ROOMS)) {
      kind = 'rooms';
      out.rooms = parts.map((x) => OWN_ROOMS[x]);
    } else {
      kind = 'project';
      const codes = parts.map(codeOf);
      if (codes.some((c) => !c)) return null;
      out.projects = codes as string[];
    }
    if (seen.has(kind)) return null;
    seen.add(kind);
  }
  return out;
}
