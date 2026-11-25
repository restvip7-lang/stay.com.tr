/**
 * Отметки объектов из админки поверх базы: скрыть с сайта, ярлык («Продано», «Срочно»…), закрепить вверху.
 * Сама база (Portfolio) не меняется. Хранится в хранилище сайта (store.ts) (config/objects.json): { id: { hidden, label, pinned, own } }.
 * own — «наш объект» (объект компании): фиолетовое выделение в карточке; в общем списке Stay Property скрыт, находится через фильтр.
 * Временное решение, пока в Portfolio нет признака «объект компании» (позже — из своего API-сервера).
 */
import type { Lang } from '../i18n/config';

export const LABELS = ['sold', 'reserved', 'urgent', 'discount', 'new'] as const;
export type Label = (typeof LABELS)[number];

export const LABEL_TEXT: Record<Lang, Record<Label, string>> = {
  ru: { sold: 'Продано', reserved: 'Забронировано', urgent: 'Срочно', discount: 'Скидка', new: 'Новинка' },
  en: { sold: 'Sold', reserved: 'Reserved', urgent: 'Urgent sale', discount: 'Discount', new: 'New' },
  tr: { sold: 'Satıldı', reserved: 'Rezerve', urgent: 'Acil satılık', discount: 'İndirim', new: 'Yeni' },
  de: { sold: 'Verkauft', reserved: 'Reserviert', urgent: 'Dringend', discount: 'Rabatt', new: 'Neu' },
  sr: { sold: 'Prodato', reserved: 'Rezervisano', urgent: 'Hitno', discount: 'Popust', new: 'Novo' },
};

/** Цвета плашек: продано — тёмная, срочно — красная, скидка — персиковая, остальное — фирменная. */
export const LABEL_STYLE: Record<Label, string> = {
  sold: 'background:#090714;color:#fff',
  reserved: 'background:#6b6880;color:#fff',
  urgent: 'background:#e5484d;color:#fff',
  discount: 'background:#abf960;color:#1c1e26',
  new: 'background:#754be9;color:#fff',
};

/** cit / res — ручные отметки «Гражданство» и «ВНЖ» (бейджи на фото карточки). */
export interface Mark { hidden?: boolean; label?: Label; pinned?: boolean; own?: boolean; cit?: boolean; res?: boolean; /** Лот PRIVE (эксклюзив с выгодой). */ prive?: boolean }
export type Marks = Record<string, Mark>;

const KEY = 'config/objects.json';
let memo: { at: number; value: Marks } | null = null;

import { readJson, storeReady, writeJson } from './store';

const ID = /^u?\d{1,12}$/;

export function normalizeMark(v: any): Mark | null {
  if (!v || typeof v !== 'object') return null;
  const m: Mark = {};
  if (v.hidden === true) m.hidden = true;
  if (LABELS.includes(v.label)) m.label = v.label;
  if (v.pinned === true) m.pinned = true;
  if (v.own === true) m.own = true;
  if (v.cit === true) m.cit = true;
  if (v.res === true) m.res = true;
  if (v.prive === true) m.prive = true;
  return Object.keys(m).length ? m : null;
}

function normalize(x: any): Marks {
  const out: Marks = {};
  if (x && typeof x === 'object') {
    for (const [id, v] of Object.entries(x)) {
      const m = ID.test(id) ? normalizeMark(v) : null;
      if (m) out[id] = m;
    }
  }
  return out;
}

export async function getMarks(): Promise<Marks> {
  if (memo && Date.now() - memo.at < 30_000) return memo.value;
  let value: Marks = {};
  const saved = await readJson(KEY);
  if (saved) value = normalize(saved);
  memo = { at: Date.now(), value };
  return value;
}

/** Меняет отметку одного объекта (null — снять все отметки). */
export async function setMark(id: string, mark: unknown): Promise<Marks> {
  if (!storeReady()) throw new Error('Хранилище не подключено');
  if (!ID.test(id)) throw new Error('Неверный id объекта');
  memo = null;
  const marks = { ...(await getMarks()) };
  const m = normalizeMark(mark);
  if (m) marks[id] = m;
  else delete marks[id];
  await writeJson(KEY, marks, true);
  memo = { at: Date.now(), value: marks };
  return marks;
}
