/** Услуги: тексты (content/services.ts) + русские тексты и картинки старого сайта (services.json). */
import type { Lang } from '../i18n/config';
import { SERVICES, type Service } from '../content/services';
import legacy from '../content/data/services.json';

export { SERVICES };
export const serviceBySlug = (slug: string): Service | null => SERVICES.find((s) => s.slug === slug) ?? null;
export const legacyOf = (s: Service) => (s.legacy ? legacy.find((x) => x.slug === s.legacy) ?? null : null);
export const serviceImage = (s: Service): string | null => legacyOf(s)?.image ?? null;
export const serviceUrl = (lang: Lang, slug?: string) => `/${lang}/services/${slug ? `${slug}/` : ''}`;
export const serviceTitle = (lang: Lang, slug: string) => serviceBySlug(slug)?.tr[lang].title ?? slug;
/** Старый slug (/uslugi/{legacy}/) → новый. */
export const serviceByLegacy = (old: string) => SERVICES.find((s) => s.legacy === old) ?? null;

/* ---------- Услуги из backend Stay Property (admin.stayproperty.com) ---------- */
import { contentItem, contentList, type ContentItem } from './content';

/** Наши прежние страницы услуг → услуга в backend (по русскому заголовку). Совпало — старый адрес ведёт 301 на новый. */
const CURATED_MATCH: Record<string, RegExp> = {
  citizenship: /гражданств/i,
  'residence-permit': /вид на жительство/i,
  tours: /информационный тур/i,
  'online-purchase': /онлайн-покупк/i,
  'online-viewing': /видеообзор/i,
  'exclusive-sale': /эксклюзивн/i,
  'trade-in': /^обмен/i,
};

export async function apiServices(lang: Lang): Promise<ContentItem[]> {
  try { return await contentList('services', lang); } catch { return []; }
}
export async function apiService(lang: Lang, slug: string): Promise<ContentItem | null> {
  try { return await contentItem('services', lang, slug); } catch { return null; }
}

/** Наши страницы, которых нет в backend (например, проверка объекта) — остаются как были. */
export async function curatedLeft(): Promise<Service[]> {
  const ru = await apiServices('ru');
  return SERVICES.filter((s) => !CURATED_MATCH[s.slug] || !ru.some((x) => CURATED_MATCH[s.slug].test(x.title)));
}

/** Куда вести со старого адреса нашей услуги, если она теперь из backend. */
export async function curatedRedirect(slug: string): Promise<string | null> {
  const re = CURATED_MATCH[slug];
  if (!re) return null;
  const hit = (await apiServices('ru')).find((x) => re.test(x.title));
  return hit?.slug ?? null;
}

/** Все услуги для списков (главная, карта сайта): наши оставшиеся + из backend. */
export async function allServices(lang: Lang): Promise<{ slug: string; title: string; lead: string; group: 'main' | 'free' }[]> {
  const { strip } = await import('./format');
  const ours = (await curatedLeft()).map((s) => ({ slug: s.slug, title: s.tr[lang].title, lead: s.tr[lang].lead, group: 'main' as const }));
  const api = (await apiServices(lang)).map((x) => ({ slug: x.slug, title: x.title, lead: x.excerpt || strip(x.body, 140), group: x.group }));
  return [...ours, ...api];
}
