/** Общие помощники страниц: адреса на других языках, robots. */
import { LANGS, type Lang } from '../i18n/config';

/** Та же страница на всех языках (у посадочных и разделов переводы есть всегда). */
export function allLangs(path: string): Record<Lang, string> {
  const rest = path.replace(/^\/[a-z]{2}(?=\/)/, '');
  return Object.fromEntries(LANGS.map((l) => [l, `/${l}${rest}`])) as Record<Lang, string>;
}

/** Только перечисленные языки. */
export function someLangs(path: string, langs: readonly Lang[]): Partial<Record<Lang, string>> {
  const all = allLangs(path);
  return Object.fromEntries(langs.map((l) => [l, all[l]]));
}

export type Robots = 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
