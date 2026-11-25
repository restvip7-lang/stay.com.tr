/**
 * Короткие адреса каталога STAY PROJECTS (как у образца mr-group.ru/flats/zhk-mira/rooms-1/):
 * /{lang}/stay-projects/{тип}/{проект-or-проект}/{комнатность-or-…}/?остальное.
 */
import type { Lang } from '../i18n/config';

/** Слаг комнатности в адресе → значение фильтра ?rooms=. */
export const OWN_ROOMS: Record<string, string> = { studio: 'studio', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+' };
const ROOM_SLUG = Object.fromEntries(Object.entries(OWN_ROOMS).map(([k, v]) => [v, k])) as Record<string, string>;

/** Адрес каталога STAY PROJECTS: тип (пусто — все типы), слаги проектов, комнатность (значения ?rooms=), прочие параметры. */
export function ownUrl(lang: Lang | string, type: string | null | undefined, projects: string[] = [], rooms: string[] = [], query = ''): string {
  const r = rooms.map((x) => ROOM_SLUG[x]).filter(Boolean);
  const path = [lang, 'stay-projects', type || 'all', projects.length ? projects.join('-or-') : '', r.join('-or-')].filter(Boolean).join('/');
  return `/${path}/${query ? `?${query}` : ''}`;
}
