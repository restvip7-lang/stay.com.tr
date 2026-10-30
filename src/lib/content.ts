/**
 * Новости и услуги из backend Stay Property (admin.stayproperty.com, инструкция BACKEND_API_RU.md от Anuar, 30.10.2026):
 *   GET /api/content/{news|services}?language=..&page=..&limit=100 → { items, page, limit, total, totalPages }
 * Публичные списки отдаются без авторизации. Языки API: en, ru, tr, sr, fa — немецкого нет, для de берём английский.
 * Материал показываем на языке страницы, только если у него есть перевод заголовка на этот язык.
 * Адрес материала — по английскому заголовку (одинаковый на всех языках), id из API в адрес не попадает.
 */
import type { Lang } from '../i18n/config';
import { cached } from './api';

const BASE = ((import.meta.env.STAY_CONTENT_API as string | undefined) || 'https://admin.stayproperty.com').replace(/\/$/, '');

export type ContentKind = 'news' | 'services';

interface RawTr { title?: string; excerpt?: string; body?: string; category?: string; location?: string }
interface RawContent {
  id: string;
  kind: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  location: string;
  published_at: string;
  image: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, RawTr>;
}

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  /** Для услуг: основная страница услуги или бесплатная услуга. */
  group: 'main' | 'free';
  image: string | null;
  date: string;
  updated: string;
  /** Языки сайта, на которых материал есть. */
  langs: Lang[];
}

const SITE_LANGS: Lang[] = ['ru', 'en', 'tr', 'de', 'sr'];
const apiLang = (l: Lang) => (l === 'de' ? 'en' : l);

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
};

export function slugOf(s: string) {
  return s
    .toLowerCase()
    .split('')
    .map((c) => TRANSLIT[c] ?? c)
    .join('')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 9)
    .join('-')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** Свои фото к услугам (в API почти у всех одна заглушка): public/services/<адрес>.webp, подобраны из фото наших объектов и старого сайта. */
const SERVICE_PHOTOS = new Set([
  'how-to-obtain-citizenship-of-the-republic-of-turkiye', 'residence-permit-in-turkiye', 'familiarization-tour', 'online-video-inspection',
  'online-real-estate-purchase-in-turkiye', 'exclusive-sale-of-real-estate', 'exchange', 'mortgage-mortgage-loan-for-foreigners', 'rental',
  'furnishing-and-equipping-the-apartment', 'renovation-and-decoration', 'cleaning-and-hygiene-services', 'insurance-services',
  'checking-the-technical-condition-of-equipment', 'relocation-support', 'subscription-contracts-services', 'title-deed-procedures', 'transportation-services',
]);

const FREE = /бесплат|free|ücretsiz|besplat/i;

async function fetchAll(kind: ContentKind): Promise<RawContent[]> {
  const out: RawContent[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await fetch(`${BASE}/api/content/${kind}?language=ru&page=${page}&limit=100`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`content ${kind}: ${r.status}`);
    const j = (await r.json()) as { items: RawContent[]; totalPages: number };
    out.push(...(j.items ?? []));
    if (page >= (j.totalPages ?? 1)) break;
  }
  return out.filter((x) => x && x.enabled !== false);
}

/** Все материалы вида; кэш как у остального API (при сбое — последняя удачная копия). */
async function raw(kind: ContentKind): Promise<{ x: RawContent; slug: string }[]> {
  return cached(`content-${kind}`, async () => {
    const items = await fetchAll(kind);
    const used = new Set<string>();
    return items.map((x) => {
      const tr = x.translations ?? {};
      let slug = slugOf(tr.en?.title || tr.ru?.title || x.title) || x.id;
      if (used.has(slug)) slug = `${slug}-${x.id.replace(/\D/g, '') || used.size}`;
      used.add(slug);
      return { x, slug };
    });
  });
}

function localize({ x, slug }: { x: RawContent; slug: string }, lang: Lang): ContentItem | null {
  const tr = x.translations ?? {};
  const t = tr[apiLang(lang)];
  if (!t?.title?.trim()) return null;
  const date = x.created_at || x.updated_at || '';
  return {
    id: x.id,
    slug,
    title: t.title.trim(),
    excerpt: (t.excerpt || '').trim(),
    body: t.body || '',
    category: (t.category || '').trim(),
    group: FREE.test(tr.ru?.category || x.category || '') ? 'free' : 'main',
    image: SERVICE_PHOTOS.has(slug) ? `/services/${slug}.webp` : x.image || null,
    date,
    updated: x.updated_at || date,
    langs: SITE_LANGS.filter((l) => !!tr[apiLang(l)]?.title?.trim()),
  };
}

export async function contentList(kind: ContentKind, lang: Lang): Promise<ContentItem[]> {
  const all = await raw(kind);
  return all.map((r) => localize(r, lang)).filter((x): x is ContentItem => !!x);
}

export async function contentItem(kind: ContentKind, lang: Lang, slug: string): Promise<ContentItem | null> {
  const all = await raw(kind);
  const r = all.find((x) => x.slug === slug);
  return r ? localize(r, lang) : null;
}
