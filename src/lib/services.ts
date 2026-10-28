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
