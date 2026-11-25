/**
 * Планы наших проектов (STAY PROJECTS) для цепочки как у образца mr-group: генплан → корпус → этаж → квартира.
 * Заполняется в админке (раздел «Планы проектов»), хранится в config/plans.json.
 *
 * Все координаты — в процентах от картинки (0–100), поэтому картинку можно заменить на ту же в другом размере.
 * - genplan: картинка генплана (рендер или 2D) и контуры корпусов — наведение показывает карточку корпуса.
 * - floors: этажность корпусов («этаж 3 из 5»); без неё — по самому высокому этажу среди лотов.
 * - floorPlans: план этажа корпуса (на какие этажи он подходит) и контуры квартир по номеру — вкладка «План этажа».
 * - view: 2D-план для вкладки «Вид из окна» и для каждой квартиры точка и направление окон (сектор).
 */
import { readJson, storeReady, writeJson } from './store';

export type Pt = [number, number];
export interface PlanShape { id: string; points: Pt[] }
export interface FloorPlan { block: string; floors: number[]; image: string; flats: PlanShape[] }
export interface ViewMark { block: string; no: string; x: number; y: number; dir: number; spread?: number }
export interface ProjectPlans {
  genplan?: { image: string; blocks: PlanShape[] } | null;
  floors?: Record<string, number>;
  floorPlans?: FloorPlan[];
  view?: { image: string; marks: ViewMark[] } | null;
}
export type PlansDb = Record<string, ProjectPlans>;

const KEY = 'config/plans.json';
let memo: { at: number; value: PlansDb } | null = null;

const num = (v: unknown, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, Math.round(Number(v) * 100) / 100 || 0));
const str = (v: unknown, max = 300) => String(v ?? '').trim().slice(0, max);
const img = (v: unknown) => { const s = str(v, 600); return /^(https:\/\/|\/(media|hero|picker|services|sclub)\/)/.test(s) ? s : ''; };
const pts = (v: unknown): Pt[] => (Array.isArray(v) ? v.slice(0, 200).map((p) => [num((p as unknown[])?.[0]), num((p as unknown[])?.[1])] as Pt) : []);
const shapes = (v: unknown): PlanShape[] => (Array.isArray(v) ? v.slice(0, 300).map((s) => ({ id: str((s as PlanShape)?.id, 20).toUpperCase(), points: pts((s as PlanShape)?.points) })).filter((s) => s.id && s.points.length >= 3) : []);

/** Проверка и очистка того, что пришло из админки. */
export function normalizePlans(x: unknown): PlansDb {
  const out: PlansDb = {};
  if (!x || typeof x !== 'object') return out;
  for (const [code, raw] of Object.entries(x as Record<string, ProjectPlans>).slice(0, 100)) {
    const k = str(code, 120);
    if (!k || !raw || typeof raw !== 'object') continue;
    const p: ProjectPlans = {};
    if (raw.genplan && img(raw.genplan.image)) p.genplan = { image: img(raw.genplan.image), blocks: shapes(raw.genplan.blocks) };
    if (raw.floors && typeof raw.floors === 'object') {
      p.floors = Object.fromEntries(Object.entries(raw.floors).map(([b, n]) => [str(b, 8).toUpperCase(), Math.round(num(n, 0, 200))]).filter(([b, n]) => b && n));
    }
    if (Array.isArray(raw.floorPlans)) {
      p.floorPlans = raw.floorPlans.slice(0, 100).map((f) => ({
        block: str(f?.block, 8).toUpperCase(),
        floors: Array.isArray(f?.floors) ? [...new Set(f.floors.map((n) => Math.round(num(n, -5, 200))))].sort((a, b) => a - b) : [],
        image: img(f?.image),
        flats: shapes(f?.flats),
      })).filter((f) => f.image);
    }
    if (raw.view && img(raw.view.image)) {
      p.view = {
        image: img(raw.view.image),
        marks: (Array.isArray(raw.view.marks) ? raw.view.marks : []).slice(0, 2000).map((m) => ({
          block: str(m?.block, 8).toUpperCase(), no: str(m?.no, 20).toUpperCase(), x: num(m?.x), y: num(m?.y),
          dir: Math.round(num(m?.dir, -360, 720)) % 360, spread: Math.round(num(m?.spread ?? 60, 10, 180)),
        })).filter((m) => m.no),
      };
    }
    if (Object.keys(p).length) out[k] = p;
  }
  return out;
}

export async function getPlans(): Promise<PlansDb> {
  if (!memo || Date.now() - memo.at > 30_000) {
    const saved = await readJson(KEY).catch(() => null);
    memo = { at: Date.now(), value: saved ? normalizePlans(saved) : {} };
  }
  return memo.value;
}

export async function plansOf(code: string | null | undefined): Promise<ProjectPlans | null> {
  return code ? (await getPlans())[code] ?? null : null;
}

export async function savePlans(x: unknown): Promise<PlansDb> {
  if (!storeReady()) throw new Error('Хранилище не подключено');
  const value = normalizePlans(x);
  await writeJson(KEY, value, true);
  memo = { at: Date.now(), value };
  return value;
}

/** План этажа для квартиры: подходящий по корпусу и этажу, с контуром её номера (если нарисован). */
export function floorPlanFor(p: ProjectPlans | null, block: string | null | undefined, floor: number | null | undefined) {
  if (!p?.floorPlans?.length) return null;
  const b = (block ?? '').toUpperCase();
  return p.floorPlans.find((f) => f.block === b && floor != null && f.floors.includes(floor))
    ?? p.floorPlans.find((f) => f.block === b && !f.floors.length)
    ?? null;
}

/** Номер квартиры из названия лота («…, №3, Блок C, …» → «3»). */
export const flatNo = (title: string) => title.match(/№\s*([0-9A-Za-z-]+)/)?.[1]?.toUpperCase() ?? null;

/** SVG-путь контура в процентах. */
export const polyPoints = (points: Pt[]) => points.map(([x, y]) => `${x},${y}`).join(' ');
