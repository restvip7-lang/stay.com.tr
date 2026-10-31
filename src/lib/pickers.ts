/**
 * Подборщик квартир на рендере ЖК (перенесён из repo apartment-picker, см. scripts/import-picker.py).
 * Пока он есть только у одного ЖК; данные квартир тестовые (генерируются в public/picker/picker.js).
 */
import type { Lang } from '../i18n/config';

export interface PickerConf { base: string }

/** slug ЖК → папка с картинками подборщика. */
export const PICKERS: Record<string, PickerConf> = {
  'cebeci-vista-residence': { base: '/picker/cebeci-vista-residence/' },
};

export const pickerFor = (slug: string): PickerConf | null => PICKERS[slug] ?? null;

/** Языки самого подборщика; для остальных языков сайта он показывается на английском. */
export const PICKER_LANGS = ['ru', 'en', 'tr'] as const;
export const pickerLang = (l: Lang) => ((PICKER_LANGS as readonly string[]).includes(l) ? l : 'en');

export const PICKER_TEXT: Record<Lang, { crumb: string; open: string; title: (c: string) => string; description: (c: string) => string }> = {
  ru: { crumb: 'Выбор квартиры', open: 'Выбрать квартиру на плане', title: (c) => `Выбор квартиры в ${c} на плане`, description: (c) => `Интерактивный выбор квартиры в ${c}: корпус, этаж, планировка, статус и цена.` },
  en: { crumb: 'Apartment finder', open: 'Choose an apartment on the plan', title: (c) => `${c}: apartment finder`, description: (c) => `Choose an apartment in ${c} on the render: building, floor, layout, status and price.` },
  tr: { crumb: 'Daire seçimi', open: 'Planda daire seçin', title: (c) => `${c}: daire seçimi`, description: (c) => `${c} projesinde daire seçimi: blok, kat, plan, durum ve fiyat.` },
  de: { crumb: 'Wohnungsauswahl', open: 'Wohnung auf dem Plan wählen', title: (c) => `${c}: Wohnungsauswahl`, description: (c) => `Wohnung in ${c} auswählen: Gebäude, Etage, Grundriss, Status und Preis.` },
  sr: { crumb: 'Izbor stana', open: 'Izaberite stan na planu', title: (c) => `${c}: izbor stana`, description: (c) => `Izbor stana u ${c}: zgrada, sprat, raspored, status i cena.` },
};
