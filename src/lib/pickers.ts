/**
 * Подборщик квартир на рендере ЖК (перенесён из repo apartment-picker, см. scripts/import-picker.py).
 * Пока он есть только у одного ЖК; данные квартир тестовые (генерируются в public/picker/picker.js).
 */
import type { Lang } from '../i18n/config';
import { getItems, getUnits, itemUrl, complexByCode, complexUrl, type Item } from './catalog';

export interface PickerConf {
  base: string;
  /** Этажей в корпусе и квартир на этаже в подборщике (по умолчанию 5 и 6, у корпуса L — 11 на этаже). */
  floors: number;
  perFloor: Record<string, number> & { default: number };
}

/** slug ЖК → папка с картинками подборщика. */
export const PICKERS: Record<string, PickerConf> = {
  'cebeci-vista-residence': { base: '/picker/cebeci-vista-residence/', floors: 5, perFloor: { default: 6, L: 11 } },
};

/**
 * Квартира из базы, привязанная к квартире подборщика.
 * Пока полей связи в базе нет, корпус и номер берём из названия («Блок A, №16»), этаж — из поля этажа
 * (в базе первый этаж записан как 0). Место на этаже — порядковый номер по кругу: №16 при 6 квартирах
 * на этаже → 4-я. Это пример: настоящую привязку зададут поля в Portfolio или «Шахматка» в админке.
 */
export interface PickerReal { id: string; b: string; floor: number; n: number; ref: string; price: number | null; area: number | null; rooms: string | null; url: string }

const LAT: Record<string, string> = { А: 'A', В: 'B', С: 'C', Е: 'E', Н: 'H', К: 'K', М: 'M' };

export function realOf(x: Item, conf: PickerConf, lang: Lang): PickerReal | null {
  const m = x.titleRu.match(/Блок\s+([A-ZА-Я])(?=[\s,]).*?№\s*(\d+)/i);
  if (!m) return null;
  const b = (LAT[m[1].toUpperCase()] ?? m[1]).toUpperCase();
  const no = Number(m[2]);
  const per = conf.perFloor[b] ?? conf.perFloor.default;
  const floor = Math.min(conf.floors, Math.max(1, (x.floor ?? 0) + 1));
  return { id: x.id, b, floor, n: ((no - 1) % per) + 1, ref: `№${no}`, price: x.price, area: x.area, rooms: x.rooms, url: itemUrl(lang, x) };
}

/** Квартиры ЖК из базы, которые удалось привязать к подборщику. */
export async function pickerReals(code: string, conf: PickerConf, lang: Lang): Promise<PickerReal[]> {
  const all = [...(await getUnits()), ...(await getItems())].filter((x) => x.complex === code && x.deal === 'sale');
  return all.map((x) => realOf(x, conf, lang)).filter((r): r is PickerReal => !!r);
}

/** Номер квартиры в подборщике, как он его строит: L-109 (11 на этаже) или A-104. */
export function pickerNum(r: Pick<PickerReal, 'b' | 'floor' | 'n'>, conf: PickerConf) {
  const per = conf.perFloor[r.b] ?? conf.perFloor.default;
  return per > 9 ? `${r.b}-${r.floor}${String(r.n).padStart(2, '0')}` : `${r.b}-${r.floor}0${r.n}`;
}

/** Ссылка «Показать на плане» для объекта из базы, если его ЖК есть в подборщике. */
export async function pickerLinkFor(x: Item, lang: Lang): Promise<string | null> {
  if (!x.complex) return null;
  const c = await complexByCode(x.complex);
  const conf = c ? PICKERS[c.slug] : null;
  const r = conf ? realOf(x, conf, lang) : null;
  return c && conf && r ? `${complexUrl(lang, c)}/picker/#/flat/${pickerNum(r, conf)}` : null;
}

export const pickerFor = (slug: string): PickerConf | null => PICKERS[slug] ?? null;

/** Языки самого подборщика; для остальных языков сайта он показывается на английском. */
export const PICKER_LANGS = ['ru', 'en', 'tr'] as const;
export const pickerLang = (l: Lang) => ((PICKER_LANGS as readonly string[]).includes(l) ? l : 'en');

export const PICKER_TEXT: Record<Lang, { crumb: string; open: string; onPlan: string; base: string; fromBase: (ref: string) => string; card: string; note: string; title: (c: string) => string; description: (c: string) => string }> = {
  ru: { crumb: 'Выбор квартиры', open: 'Выбрать квартиру на плане', onPlan: 'Показать на плане ЖК', base: 'Из базы', fromBase: (r) => `Объект из базы: ${r}`, card: 'Карточка объекта →', note: 'Цена из базы объектов. Наличие подтвердит менеджер.', title: (c) => `Выбор квартиры в ${c} на плане`, description: (c) => `Интерактивный выбор квартиры в ${c}: корпус, этаж, планировка, статус и цена.` },
  en: { crumb: 'Apartment finder', open: 'Choose an apartment on the plan', onPlan: 'Show on the complex plan', base: 'Listed', fromBase: (r) => `Listed property: ${r}`, card: 'Property page →', note: 'Price from our property base. The manager will confirm availability.', title: (c) => `${c}: apartment finder`, description: (c) => `Choose an apartment in ${c} on the render: building, floor, layout, status and price.` },
  tr: { crumb: 'Daire seçimi', open: 'Planda daire seçin', onPlan: 'Proje planında göster', base: 'Portföyde', fromBase: (r) => `Portföydeki daire: ${r}`, card: 'İlan sayfası →', note: 'Fiyat portföyümüzden. Müsaitliği satış temsilcisi teyit eder.', title: (c) => `${c}: daire seçimi`, description: (c) => `${c} projesinde daire seçimi: blok, kat, plan, durum ve fiyat.` },
  de: { crumb: 'Wohnungsauswahl', open: 'Wohnung auf dem Plan wählen', onPlan: 'Auf dem Anlagenplan zeigen', base: 'Im Angebot', fromBase: (r) => `Objekt im Angebot: ${r}`, card: 'Objektseite →', note: 'Preis aus unserem Bestand. Die Verfügbarkeit bestätigt der Manager.', title: (c) => `${c}: Wohnungsauswahl`, description: (c) => `Wohnung in ${c} auswählen: Gebäude, Etage, Grundriss, Status und Preis.` },
  sr: { crumb: 'Izbor stana', open: 'Izaberite stan na planu', onPlan: 'Prikaži na planu kompleksa', base: 'U ponudi', fromBase: (r) => `Nekretnina u ponudi: ${r}`, card: 'Stranica nekretnine →', note: 'Cena iz naše baze. Dostupnost potvrđuje menadžer.', title: (c) => `${c}: izbor stana`, description: (c) => `Izbor stana u ${c}: zgrada, sprat, raspored, status i cena.` },
};
