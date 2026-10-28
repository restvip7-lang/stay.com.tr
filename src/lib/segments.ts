/**
 * Справочники сегментов URL (ТЗ 3.5): сделка, тип, фича — слаги и названия на пяти языках.
 * Здесь же правила, по которым объект попадает в фича-лендинг.
 */
import type { Lang } from '../i18n/config';

export type Deal = 'sale' | 'rent';
export const DEALS: Deal[] = ['sale', 'rent'];

export type TypeSlug = 'apartments' | 'villas' | 'penthouses' | 'duplexes' | 'townhouses' | 'commercial' | 'land';
export const TYPES: TypeSlug[] = ['apartments', 'villas', 'penthouses', 'duplexes', 'townhouses', 'commercial', 'land'];

interface TypeWords {
  /** Мн. ч. с заглавной: «Квартиры». */ pl: string;
  /** Мн. ч. строчными для середины фразы. */ low: string;
  /** Ед. ч.: «Квартира». */ one: string;
  /** Формы для чисел (ru, sr: 1/2/5; остальные: 1/много). */ n: [string, string, string];
  /** «Купить квартиру» — вин. падеж (ru). */ acc?: string;
}

export const TYPE_WORDS: Record<Lang, Record<TypeSlug, TypeWords>> = {
  ru: {
    apartments: { pl: 'Квартиры', low: 'квартиры', one: 'Квартира', n: ['квартира', 'квартиры', 'квартир'], acc: 'квартиру' },
    villas: { pl: 'Виллы', low: 'виллы', one: 'Вилла', n: ['вилла', 'виллы', 'вилл'], acc: 'виллу' },
    penthouses: { pl: 'Пентхаусы', low: 'пентхаусы', one: 'Пентхаус', n: ['пентхаус', 'пентхауса', 'пентхаусов'], acc: 'пентхаус' },
    duplexes: { pl: 'Дуплексы', low: 'дуплексы', one: 'Дуплекс', n: ['дуплекс', 'дуплекса', 'дуплексов'], acc: 'дуплекс' },
    townhouses: { pl: 'Таунхаусы', low: 'таунхаусы', one: 'Таунхаус', n: ['таунхаус', 'таунхауса', 'таунхаусов'], acc: 'таунхаус' },
    commercial: { pl: 'Коммерческие помещения', low: 'коммерческие помещения', one: 'Коммерческое помещение', n: ['помещение', 'помещения', 'помещений'], acc: 'коммерческое помещение' },
    land: { pl: 'Земельные участки', low: 'земельные участки', one: 'Земельный участок', n: ['участок', 'участка', 'участков'], acc: 'земельный участок' },
  },
  en: {
    apartments: { pl: 'Apartments', low: 'apartments', one: 'Apartment', n: ['apartment', 'apartments', 'apartments'] },
    villas: { pl: 'Villas', low: 'villas', one: 'Villa', n: ['villa', 'villas', 'villas'] },
    penthouses: { pl: 'Penthouses', low: 'penthouses', one: 'Penthouse', n: ['penthouse', 'penthouses', 'penthouses'] },
    duplexes: { pl: 'Duplexes', low: 'duplexes', one: 'Duplex', n: ['duplex', 'duplexes', 'duplexes'] },
    townhouses: { pl: 'Townhouses', low: 'townhouses', one: 'Townhouse', n: ['townhouse', 'townhouses', 'townhouses'] },
    commercial: { pl: 'Commercial properties', low: 'commercial properties', one: 'Commercial property', n: ['commercial property', 'commercial properties', 'commercial properties'] },
    land: { pl: 'Land plots', low: 'land plots', one: 'Land plot', n: ['land plot', 'land plots', 'land plots'] },
  },
  tr: {
    apartments: { pl: 'Daireler', low: 'daireler', one: 'Daire', n: ['daire', 'daire', 'daire'] },
    villas: { pl: 'Villalar', low: 'villalar', one: 'Villa', n: ['villa', 'villa', 'villa'] },
    penthouses: { pl: 'Penthouse daireler', low: 'penthouse daireler', one: 'Penthouse', n: ['penthouse', 'penthouse', 'penthouse'] },
    duplexes: { pl: 'Dubleksler', low: 'dubleksler', one: 'Dubleks', n: ['dubleks', 'dubleks', 'dubleks'] },
    townhouses: { pl: 'Sıra evler', low: 'sıra evler', one: 'Sıra ev', n: ['sıra ev', 'sıra ev', 'sıra ev'] },
    commercial: { pl: 'Ticari gayrimenkuller', low: 'ticari gayrimenkuller', one: 'Ticari gayrimenkul', n: ['ticari gayrimenkul', 'ticari gayrimenkul', 'ticari gayrimenkul'] },
    land: { pl: 'Arsalar', low: 'arsalar', one: 'Arsa', n: ['arsa', 'arsa', 'arsa'] },
  },
  de: {
    apartments: { pl: 'Wohnungen', low: 'Wohnungen', one: 'Wohnung', n: ['Wohnung', 'Wohnungen', 'Wohnungen'] },
    villas: { pl: 'Villen', low: 'Villen', one: 'Villa', n: ['Villa', 'Villen', 'Villen'] },
    penthouses: { pl: 'Penthäuser', low: 'Penthäuser', one: 'Penthouse', n: ['Penthouse', 'Penthäuser', 'Penthäuser'] },
    duplexes: { pl: 'Maisonetten', low: 'Maisonetten', one: 'Maisonette', n: ['Maisonette', 'Maisonetten', 'Maisonetten'] },
    townhouses: { pl: 'Reihenhäuser', low: 'Reihenhäuser', one: 'Reihenhaus', n: ['Reihenhaus', 'Reihenhäuser', 'Reihenhäuser'] },
    commercial: { pl: 'Gewerbeimmobilien', low: 'Gewerbeimmobilien', one: 'Gewerbeimmobilie', n: ['Gewerbeimmobilie', 'Gewerbeimmobilien', 'Gewerbeimmobilien'] },
    land: { pl: 'Grundstücke', low: 'Grundstücke', one: 'Grundstück', n: ['Grundstück', 'Grundstücke', 'Grundstücke'] },
  },
  sr: {
    apartments: { pl: 'Stanovi', low: 'stanovi', one: 'Stan', n: ['stan', 'stana', 'stanova'] },
    villas: { pl: 'Vile', low: 'vile', one: 'Vila', n: ['vila', 'vile', 'vila'] },
    penthouses: { pl: 'Penthausi', low: 'penthausi', one: 'Penthaus', n: ['penthaus', 'penthausa', 'penthausa'] },
    duplexes: { pl: 'Dupleksi', low: 'dupleksi', one: 'Dupleks', n: ['dupleks', 'dupleksa', 'dupleksa'] },
    townhouses: { pl: 'Kuće u nizu', low: 'kuće u nizu', one: 'Kuća u nizu', n: ['kuća u nizu', 'kuće u nizu', 'kuća u nizu'] },
    commercial: { pl: 'Poslovni prostori', low: 'poslovni prostori', one: 'Poslovni prostor', n: ['poslovni prostor', 'poslovna prostora', 'poslovnih prostora'] },
    land: { pl: 'Placevi', low: 'placevi', one: 'Plac', n: ['plac', 'placa', 'placeva'] },
  },
};

/** «Недвижимость» и «объект(ы)» — когда тип не выбран. */
export const PROPERTY_WORDS: Record<Lang, { pl: string; low: string; n: [string, string, string] }> = {
  ru: { pl: 'Недвижимость', low: 'недвижимость', n: ['объект', 'объекта', 'объектов'] },
  en: { pl: 'Property', low: 'property', n: ['property', 'properties', 'properties'] },
  tr: { pl: 'Gayrimenkul', low: 'gayrimenkul', n: ['ilan', 'ilan', 'ilan'] },
  de: { pl: 'Immobilien', low: 'Immobilien', n: ['Immobilie', 'Immobilien', 'Immobilien'] },
  sr: { pl: 'Nekretnine', low: 'nekretnine', n: ['nekretnina', 'nekretnine', 'nekretnina'] },
};

export const DEAL_WORDS: Record<Lang, Record<Deal, { name: string; post: string; verb: string }>> = {
  ru: { sale: { name: 'Продажа', post: 'на продажу', verb: 'Купить' }, rent: { name: 'Аренда', post: 'в аренду', verb: 'Снять' } },
  en: { sale: { name: 'Sale', post: 'for sale', verb: 'Buy' }, rent: { name: 'Rent', post: 'for rent', verb: 'Rent' } },
  tr: { sale: { name: 'Satılık', post: 'satılık', verb: 'Satın al' }, rent: { name: 'Kiralık', post: 'kiralık', verb: 'Kirala' } },
  de: { sale: { name: 'Kaufen', post: 'zum Kauf', verb: 'Kaufen' }, rent: { name: 'Mieten', post: 'zur Miete', verb: 'Mieten' } },
  sr: { sale: { name: 'Prodaja', post: 'na prodaju', verb: 'Kupite' }, rent: { name: 'Izdavanje', post: 'za izdavanje', verb: 'Iznajmite' } },
};

export const COMPLEX_WORDS: Record<Lang, { pl: string; one: string; n: [string, string, string]; short: string }> = {
  ru: { pl: 'Новостройки и ЖК', one: 'Жилой комплекс', n: ['жилой комплекс', 'жилых комплекса', 'жилых комплексов'], short: 'ЖК' },
  en: { pl: 'New developments', one: 'Residential complex', n: ['residential complex', 'residential complexes', 'residential complexes'], short: 'Complex' },
  tr: { pl: 'Yeni projeler', one: 'Konut projesi', n: ['konut projesi', 'konut projesi', 'konut projesi'], short: 'Proje' },
  de: { pl: 'Neubauprojekte', one: 'Wohnanlage', n: ['Wohnanlage', 'Wohnanlagen', 'Wohnanlagen'], short: 'Wohnanlage' },
  sr: { pl: 'Novogradnja i kompleksi', one: 'Stambeni kompleks', n: ['stambeni kompleks', 'stambena kompleksa', 'stambenih kompleksa'], short: 'Kompleks' },
};

/* ---------- Фичи ---------- */

export type FeatureSlug =
  | 'sea-view' | 'near-sea' | 'first-line' | 'citizenship' | 'residence-permit' | 'installment' | 'from-developer'
  | 'resale' | 'furnished' | 'with-pool' | 'luxury' | 'cheap' | 'investment' | 'new'
  | '1-bedroom' | '2-bedrooms' | '3-bedrooms' | '4-bedrooms'
  | 'price-to-100000' | 'price-to-150000' | 'price-to-200000';

/** Признаки объекта, по которым считаются фичи. */
export interface FeatureInput {
  deal: Deal;
  country: string;
  type: TypeSlug;
  rawType: string | null;
  title: string;
  price: number | null;
  sea: number | null;
  bedrooms: number | null;
  unit: boolean;
  citizenship: boolean;
}

/**
 * Пороговые значения для фич. Это допущения, их стоит сверить с юристами/отделом продаж:
 * гражданство — от 400 000 $ (берём 400 000 €, с запасом), ВНЖ — от 200 000 € (Анталья — мегаполис).
 */
export const THRESHOLDS = { citizenship: 400_000, residence: 200_000, nearSea: 500, firstLine: 150, cheapSale: 100_000, cheapRent: 700, luxury: 500_000 };

const NEW_TYPES = new Set(['New Project', 'New Projects', 'StayProperty Project']);
const INV_TYPES = new Set(['Apartments (inv)', 'Townhouse (inv)', 'Hotel Apartments']);
const LIVING = new Set<TypeSlug>(['apartments', 'villas', 'penthouses', 'duplexes', 'townhouses']);

interface FeatureDef {
  slug: FeatureSlug;
  deals: Deal[];
  /** Только для этих стран (гражданство и ВНЖ — Турция). */
  countries?: string[];
  livingOnly?: boolean;
  test: (x: FeatureInput) => boolean;
}

const bed = (n: number) => (x: FeatureInput) => (n === 4 ? (x.bedrooms ?? 0) >= 4 : x.bedrooms === n);
const priceTo = (n: number) => (x: FeatureInput) => !!x.price && x.price <= n;

export const FEATURES: FeatureDef[] = [
  { slug: 'near-sea', deals: ['sale', 'rent'], test: (x) => !!x.sea && x.sea <= THRESHOLDS.nearSea },
  { slug: 'sea-view', deals: ['sale', 'rent'], test: (x) => /вид(ом)?\s+на\s+море|sea\s*view/i.test(x.title) },
  { slug: 'first-line', deals: ['sale', 'rent'], test: (x) => (!!x.sea && x.sea <= THRESHOLDS.firstLine) || /перв(ая|ой)\s+(берегов\w+\s+)?лини/i.test(x.title) },
  { slug: 'citizenship', deals: ['sale'], countries: ['turkey'], test: (x) => x.citizenship || (!!x.price && x.price >= THRESHOLDS.citizenship) },
  { slug: 'residence-permit', deals: ['sale'], countries: ['turkey'], livingOnly: true, test: (x) => !!x.price && x.price >= THRESHOLDS.residence },
  { slug: 'installment', deals: ['sale'], test: (x) => x.unit || NEW_TYPES.has(x.rawType ?? '') || /рассрочк/i.test(x.title) },
  { slug: 'from-developer', deals: ['sale'], test: (x) => x.unit || NEW_TYPES.has(x.rawType ?? '') },
  { slug: 'resale', deals: ['sale'], test: (x) => x.rawType === 'Resale Property' || /вторичн/i.test(x.title) },
  { slug: 'furnished', deals: ['sale', 'rent'], livingOnly: true, test: (x) => /мебел|furnish/i.test(x.title) },
  { slug: 'with-pool', deals: ['sale', 'rent'], test: (x) => /бассейн|pool/i.test(x.title) },
  { slug: 'luxury', deals: ['sale', 'rent'], test: (x) => (x.deal === 'sale' && !!x.price && x.price >= THRESHOLDS.luxury) || /люкс|элитн|премиум|роскош|luxury/i.test(x.title) },
  { slug: 'cheap', deals: ['sale', 'rent'], test: (x) => !!x.price && x.price <= (x.deal === 'sale' ? THRESHOLDS.cheapSale : THRESHOLDS.cheapRent) },
  { slug: 'investment', deals: ['sale'], test: (x) => INV_TYPES.has(x.rawType ?? '') || /инвест/i.test(x.title) },
  { slug: 'new', deals: ['sale'], test: (x) => x.unit || NEW_TYPES.has(x.rawType ?? '') },
  { slug: '1-bedroom', deals: ['sale', 'rent'], livingOnly: true, test: bed(1) },
  { slug: '2-bedrooms', deals: ['sale', 'rent'], livingOnly: true, test: bed(2) },
  { slug: '3-bedrooms', deals: ['sale', 'rent'], livingOnly: true, test: bed(3) },
  { slug: '4-bedrooms', deals: ['sale', 'rent'], livingOnly: true, test: bed(4) },
  { slug: 'price-to-100000', deals: ['sale'], test: priceTo(100_000) },
  { slug: 'price-to-150000', deals: ['sale'], test: priceTo(150_000) },
  { slug: 'price-to-200000', deals: ['sale'], test: priceTo(200_000) },
];

export const FEATURE_SLUGS = FEATURES.map((f) => f.slug);
export const featureDef = (s: string) => FEATURES.find((f) => f.slug === s) ?? null;

/** Подходит ли фича к сочетанию сделка × тип × страна (иначе такого лендинга нет). */
export function featureAllowed(f: FeatureDef, deal: Deal, type: TypeSlug | null, country: string | null) {
  if (!f.deals.includes(deal)) return false;
  if (f.countries && country && !f.countries.includes(country)) return false;
  if (f.livingOnly && type && !LIVING.has(type)) return false;
  return true;
}

export function featuresOf(x: FeatureInput): FeatureSlug[] {
  return FEATURES.filter((f) => featureAllowed(f, x.deal, x.type, x.country) && f.test(x)).map((f) => f.slug);
}

/** Как фича встраивается в название: prefix — прилагательное перед типом, post — после. */
type FW = { pre?: string; post?: string };
const n1 = (n: number) => `${n}+1`;

export const FEATURE_WORDS: Record<Lang, Record<FeatureSlug, FW>> = {
  ru: {
    'sea-view': { post: 'с видом на море' }, 'near-sea': { post: 'у моря' }, 'first-line': { post: 'на первой линии' },
    citizenship: { post: 'под гражданство' }, 'residence-permit': { post: 'под ВНЖ' }, installment: { post: 'в рассрочку' },
    'from-developer': { post: 'от застройщика' }, resale: { post: 'на вторичном рынке' }, furnished: { post: 'с мебелью' },
    'with-pool': { post: 'с бассейном' }, luxury: { pre: 'Элитные' }, cheap: { pre: 'Недорогие' }, investment: { post: 'для инвестиций' },
    new: { post: 'в новостройках' }, '1-bedroom': { post: n1(1) }, '2-bedrooms': { post: n1(2) }, '3-bedrooms': { post: n1(3) }, '4-bedrooms': { post: '4+1 и больше' },
    'price-to-100000': { post: 'до 100 000 €' }, 'price-to-150000': { post: 'до 150 000 €' }, 'price-to-200000': { post: 'до 200 000 €' },
  },
  en: {
    'sea-view': { pre: 'Sea view' }, 'near-sea': { post: 'near the sea' }, 'first-line': { post: 'on the first line' },
    citizenship: { post: 'for Turkish citizenship' }, 'residence-permit': { post: 'for a residence permit' }, installment: { post: 'with an installment plan' },
    'from-developer': { post: 'from the developer' }, resale: { pre: 'Resale' }, furnished: { pre: 'Furnished' },
    'with-pool': { post: 'with a pool' }, luxury: { pre: 'Luxury' }, cheap: { pre: 'Cheap' }, investment: { pre: 'Investment' },
    new: { pre: 'New-build' }, '1-bedroom': { pre: '1-bedroom' }, '2-bedrooms': { pre: '2-bedroom' }, '3-bedrooms': { pre: '3-bedroom' }, '4-bedrooms': { pre: '4+ bedroom' },
    'price-to-100000': { post: 'under €100,000' }, 'price-to-150000': { post: 'under €150,000' }, 'price-to-200000': { post: 'under €200,000' },
  },
  tr: {
    'sea-view': { pre: 'deniz manzaralı' }, 'near-sea': { pre: 'denize yakın' }, 'first-line': { pre: 'denize sıfır' },
    citizenship: { pre: 'vatandaşlığa uygun' }, 'residence-permit': { pre: 'oturma iznine uygun' }, installment: { pre: 'taksitli' },
    'from-developer': { pre: 'müteahhitten' }, resale: { pre: 'ikinci el' }, furnished: { pre: 'eşyalı' },
    'with-pool': { pre: 'havuzlu' }, luxury: { pre: 'lüks' }, cheap: { pre: 'uygun fiyatlı' }, investment: { pre: 'yatırımlık' },
    new: { pre: 'yeni projelerde' }, '1-bedroom': { pre: n1(1) }, '2-bedrooms': { pre: n1(2) }, '3-bedrooms': { pre: n1(3) }, '4-bedrooms': { pre: '4+1 ve üzeri' },
    'price-to-100000': { pre: '100.000 € altı' }, 'price-to-150000': { pre: '150.000 € altı' }, 'price-to-200000': { pre: '200.000 € altı' },
  },
  de: {
    'sea-view': { post: 'mit Meerblick' }, 'near-sea': { post: 'in Meeresnähe' }, 'first-line': { post: 'in erster Meereslinie' },
    citizenship: { post: 'für die türkische Staatsbürgerschaft' }, 'residence-permit': { post: 'für eine Aufenthaltserlaubnis' }, installment: { post: 'mit Ratenzahlung' },
    'from-developer': { post: 'vom Bauträger' }, resale: { post: 'aus zweiter Hand' }, furnished: { pre: 'Möblierte' },
    'with-pool': { post: 'mit Pool' }, luxury: { pre: 'Luxuriöse' }, cheap: { pre: 'Günstige' }, investment: { post: 'als Kapitalanlage' },
    new: { post: 'im Neubau' }, '1-bedroom': { post: 'mit 1 Schlafzimmer' }, '2-bedrooms': { post: 'mit 2 Schlafzimmern' }, '3-bedrooms': { post: 'mit 3 Schlafzimmern' }, '4-bedrooms': { post: 'mit 4+ Schlafzimmern' },
    'price-to-100000': { post: 'bis 100.000 €' }, 'price-to-150000': { post: 'bis 150.000 €' }, 'price-to-200000': { post: 'bis 200.000 €' },
  },
  sr: {
    'sea-view': { post: 'sa pogledom na more' }, 'near-sea': { post: 'blizu mora' }, 'first-line': { post: 'u prvom redu do mora' },
    citizenship: { post: 'za tursko državljanstvo' }, 'residence-permit': { post: 'za boravišnu dozvolu' }, installment: { post: 'na rate' },
    'from-developer': { post: 'od investitora' }, resale: { post: 'iz preprodaje' }, furnished: { post: 'sa nameštajem' },
    'with-pool': { post: 'sa bazenom' }, luxury: { post: 'luksuzne klase' }, cheap: { post: 'po povoljnoj ceni' }, investment: { post: 'za investiciju' },
    new: { post: 'u novogradnji' }, '1-bedroom': { post: n1(1) }, '2-bedrooms': { post: n1(2) }, '3-bedrooms': { post: n1(3) }, '4-bedrooms': { post: '4+1 i veći' },
    'price-to-100000': { post: 'do 100.000 €' }, 'price-to-150000': { post: 'do 150.000 €' }, 'price-to-200000': { post: 'do 200.000 €' },
  },
};

/** Короткое имя фичи для чипсов и ссылок «Уточнить». */
export const FEATURE_LABEL: Record<Lang, Record<FeatureSlug, string>> = {
  ru: { 'sea-view': 'С видом на море', 'near-sea': 'У моря', 'first-line': 'Первая линия', citizenship: 'Под гражданство', 'residence-permit': 'Под ВНЖ', installment: 'В рассрочку', 'from-developer': 'От застройщика', resale: 'Вторичка', furnished: 'С мебелью', 'with-pool': 'С бассейном', luxury: 'Элитные', cheap: 'Недорогие', investment: 'Для инвестиций', new: 'Новостройки', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+1 и больше', 'price-to-100000': 'До 100 000 €', 'price-to-150000': 'До 150 000 €', 'price-to-200000': 'До 200 000 €' },
  en: { 'sea-view': 'Sea view', 'near-sea': 'Near the sea', 'first-line': 'First line', citizenship: 'For citizenship', 'residence-permit': 'For residence permit', installment: 'Installment plan', 'from-developer': 'From developer', resale: 'Resale', furnished: 'Furnished', 'with-pool': 'With pool', luxury: 'Luxury', cheap: 'Budget', investment: 'Investment', new: 'New build', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+1 and more', 'price-to-100000': 'Under €100,000', 'price-to-150000': 'Under €150,000', 'price-to-200000': 'Under €200,000' },
  tr: { 'sea-view': 'Deniz manzaralı', 'near-sea': 'Denize yakın', 'first-line': 'Denize sıfır', citizenship: 'Vatandaşlığa uygun', 'residence-permit': 'Oturma iznine uygun', installment: 'Taksitli', 'from-developer': 'Müteahhitten', resale: 'İkinci el', furnished: 'Eşyalı', 'with-pool': 'Havuzlu', luxury: 'Lüks', cheap: 'Uygun fiyatlı', investment: 'Yatırımlık', new: 'Yeni projeler', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+1 ve üzeri', 'price-to-100000': '100.000 € altı', 'price-to-150000': '150.000 € altı', 'price-to-200000': '200.000 € altı' },
  de: { 'sea-view': 'Meerblick', 'near-sea': 'Meeresnähe', 'first-line': 'Erste Meereslinie', citizenship: 'Für Staatsbürgerschaft', 'residence-permit': 'Für Aufenthaltserlaubnis', installment: 'Ratenzahlung', 'from-developer': 'Vom Bauträger', resale: 'Zweite Hand', furnished: 'Möbliert', 'with-pool': 'Mit Pool', luxury: 'Luxus', cheap: 'Günstig', investment: 'Kapitalanlage', new: 'Neubau', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+1 und mehr', 'price-to-100000': 'Bis 100.000 €', 'price-to-150000': 'Bis 150.000 €', 'price-to-200000': 'Bis 200.000 €' },
  sr: { 'sea-view': 'Pogled na more', 'near-sea': 'Blizu mora', 'first-line': 'Prvi red do mora', citizenship: 'Za državljanstvo', 'residence-permit': 'Za boravišnu dozvolu', installment: 'Na rate', 'from-developer': 'Od investitora', resale: 'Preprodaja', furnished: 'Sa nameštajem', 'with-pool': 'Sa bazenom', luxury: 'Luksuzne', cheap: 'Povoljne', investment: 'Za investiciju', new: 'Novogradnja', '1-bedroom': '1+1', '2-bedrooms': '2+1', '3-bedrooms': '3+1', '4-bedrooms': '4+1 i više', 'price-to-100000': 'Do 100.000 €', 'price-to-150000': 'Do 150.000 €', 'price-to-200000': 'Do 200.000 €' },
};

/** Склеивает «тип + фича»: «Квартиры у моря», «Sea view apartments», «deniz manzaralı … daireler». */
export function typeWithFeature(lang: Lang, type: TypeSlug | null, feature: FeatureSlug | null): { pre: string; noun: string; post: string } {
  const tw = type ? TYPE_WORDS[lang][type] : null;
  const pw = PROPERTY_WORDS[lang];
  const fw = feature ? FEATURE_WORDS[lang][feature] : {};
  const noun = tw ? (fw.pre && lang !== 'tr' ? tw.low : tw.pl) : fw.pre && lang !== 'tr' ? pw.low : pw.pl;
  return { pre: fw.pre ?? '', noun, post: fw.post ?? '' };
}
