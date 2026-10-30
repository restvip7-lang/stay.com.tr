/**
 * Языки сайта (ТЗ, раздел 4). Язык страницы определяется только префиксом URL
 * /{lang}/ — не кукой и не браузером. Корень / ведёт на /ru/ (решение Anuar 30.10.2026; в ТЗ было /en/).
 */
export const LANGS = ['ru', 'en', 'tr', 'de', 'sr'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'ru';

export const isLang = (s: unknown): s is Lang => typeof s === 'string' && (LANGS as readonly string[]).includes(s);

/** Атрибут lang у <html>: сербский — латиница. */
export const HTML_LANG: Record<Lang, string> = { ru: 'ru', en: 'en', tr: 'tr', de: 'de', sr: 'sr-Latn' };
/** Код для hreflang. */
export const HREFLANG: Record<Lang, string> = { ru: 'ru', en: 'en', tr: 'tr', de: 'de', sr: 'sr' };
export const OG_LOCALE: Record<Lang, string> = { ru: 'ru_RU', en: 'en_US', tr: 'tr_TR', de: 'de_DE', sr: 'sr_RS' };
/** Локаль для чисел и дат. */
export const INTL: Record<Lang, string> = { ru: 'ru-RU', en: 'en-GB', tr: 'tr-TR', de: 'de-DE', sr: 'sr-Latn-RS' };
export const LANG_NAME: Record<Lang, string> = { ru: 'Русский', en: 'English', tr: 'Türkçe', de: 'Deutsch', sr: 'Srpski' };

export const SITE = 'https://stay.com.tr';
