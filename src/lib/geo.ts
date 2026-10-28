/**
 * География каталога: страны, города, районы — слаги (единые на всех языках, ТЗ 3.1),
 * названия и формы «в Алании / in Alanya / Alanya'da» на пяти языках.
 * Районы, которых нет в справочнике ниже, создаются из данных API автоматически.
 */
import type { Lang } from '../i18n/config';

type L = Record<Lang, string>;

export interface GeoCountry { slug: string; code: string; name: L; in: L }
export interface GeoCity { slug: string; country: string; name: L; in: L; gen: string; lat?: number; lng?: number }
export interface GeoDistrict { slug: string; city: string; name: L; in: L }

export function slugify(s: string): string {
  return s
    .replace(/[İI]/g, 'i')
    .toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Турецкий местный падеж: Alanya'da, Kestel'de, Türkiye'de, Konaklı'da, Tepe'de. */
export function trIn(name: string): string {
  const vowels = name.toLowerCase().match(/[aıoueiöü]/g);
  const last = vowels?.[vowels.length - 1] ?? 'a';
  const v = 'aıou'.includes(last) ? 'a' : 'e';
  const hard = /[çfhkpsşt]$/i.test(name);
  return `${name}'${hard ? 't' : 'd'}${v}`;
}

const l = (ru: string, en: string, tr: string, de: string, sr: string): L => ({ ru, en, tr, de, sr });

export const COUNTRIES: GeoCountry[] = [
  { slug: 'turkey', code: 'TR', name: l('Турция', 'Turkey', 'Türkiye', 'Türkei', 'Turska'), in: l('в Турции', 'in Turkey', "Türkiye'de", 'in der Türkei', 'u Turskoj') },
  { slug: 'northern-cyprus', code: 'CY', name: l('Северный Кипр', 'Northern Cyprus', 'Kuzey Kıbrıs', 'Nordzypern', 'Severni Kipar'), in: l('на Северном Кипре', 'in Northern Cyprus', "Kuzey Kıbrıs'ta", 'in Nordzypern', 'na Severnom Kipru') },
  { slug: 'uae', code: 'AE', name: l('ОАЭ', 'UAE', 'BAE', 'VAE', 'UAE'), in: l('в ОАЭ', 'in the UAE', "BAE'de", 'in den VAE', 'u UAE') },
];

const city = (slug: string, country: string, name: L, inRu: string, gen: string, sr: string, de?: string, extra: Partial<GeoCity> = {}): GeoCity => ({
  slug,
  country,
  name,
  gen,
  in: { ru: inRu, en: `in ${name.en}`, tr: trIn(name.tr), de: de ?? `in ${name.de}`, sr },
  ...extra,
});

export const CITIES: GeoCity[] = [
  city('alanya', 'turkey', l('Алания', 'Alanya', 'Alanya', 'Alanya', 'Alanja'), 'в Алании', 'Алании', 'u Alanji', undefined, { lat: 36.5444, lng: 31.9954 }),
  city('istanbul', 'turkey', l('Стамбул', 'Istanbul', 'İstanbul', 'Istanbul', 'Istanbul'), 'в Стамбуле', 'Стамбула', 'u Istanbulu', undefined, { lat: 41.0082, lng: 28.9784 }),
  city('antalya', 'turkey', l('Анталья', 'Antalya', 'Antalya', 'Antalya', 'Antalija'), 'в Анталье', 'Антальи', 'u Antaliji', undefined, { lat: 36.8969, lng: 30.7133 }),
  city('gazipasa', 'turkey', l('Газипаша', 'Gazipasa', 'Gazipaşa', 'Gazipaşa', 'Gazipaša'), 'в Газипаше', 'Газипаши', 'u Gazipaši', undefined, { lat: 36.2694, lng: 32.3172 }),
  city('side', 'turkey', l('Сиде', 'Side', 'Side', 'Side', 'Side'), 'в Сиде', 'Сиде', 'u Sideu', undefined, { lat: 36.7673, lng: 31.389 }),
  city('kyrenia', 'northern-cyprus', l('Кирения', 'Kyrenia', 'Girne', 'Kyrenia', 'Kirenija'), 'в Кирении', 'Кирении', 'u Kireniji', undefined, { lat: 35.3364, lng: 33.3192 }),
  city('famagusta', 'northern-cyprus', l('Фамагуста', 'Famagusta', 'Gazimağusa', 'Famagusta', 'Famagusta'), 'в Фамагусте', 'Фамагусты', 'u Famagusti', undefined, { lat: 35.1149, lng: 33.9192 }),
  city('iskele', 'northern-cyprus', l('Искеле', 'Iskele', 'İskele', 'İskele', 'Iskele'), 'в Искеле', 'Искеле', 'u Iskeleu'),
  city('lefke', 'northern-cyprus', l('Лефке', 'Lefke', 'Lefke', 'Lefke', 'Lefke'), 'в Лефке', 'Лефке', 'u Lefkeu'),
  city('nicosia', 'northern-cyprus', l('Никосия', 'Nicosia', 'Lefkoşa', 'Nikosia', 'Nikozija'), 'в Никосии', 'Никосии', 'u Nikoziji'),
  city('dubai', 'uae', l('Дубай', 'Dubai', 'Dubai', 'Dubai', 'Dubai'), 'в Дубае', 'Дубая', 'u Dubaiju', undefined, { lat: 25.2048, lng: 55.2708 }),
];

/** Сырые значения города из API → слаг. */
const CITY_RAW: Record<string, string> = {
  'Аланья': 'alanya', 'Алания': 'alanya', 'Alanya': 'alanya', 'Alanja': 'alanya',
  'Istanbul (Europe)': 'istanbul', 'Istanbul (Asia)': 'istanbul', 'Стамбул Европа': 'istanbul', 'Стамбул (Европа)': 'istanbul', 'Стамбул (Азия)': 'istanbul', 'Стамбул': 'istanbul',
  'Анталья': 'antalya', 'Antalya': 'antalya', 'Antalija': 'antalya',
  'Газипаша': 'gazipasa', 'Gazipasa': 'gazipasa', 'Gazipaşa': 'gazipasa', 'Газипаша, Аланья': 'gazipasa',
  'Сиде': 'side', 'Side': 'side',
  'Dubai': 'dubai', 'Дубай': 'dubai',
  'Girne': 'kyrenia', 'Gazimagusa': 'famagusta', 'Iskele': 'iskele', 'Lefke': 'lefke', 'Lefkosha': 'nicosia',
};

/** Районы со склонением и русскими названиями. Остальные — из данных. */
const D: [slug: string, city: string, ru: string, ruIn: string, latin: string, tr?: string][] = [
  ['mahmutlar', 'alanya', 'Махмутлар', 'в Махмутларе', 'Mahmutlar'],
  ['kargicak', 'alanya', 'Каргыджак', 'в Каргыджаке', 'Kargicak', 'Kargıcak'],
  ['oba', 'alanya', 'Оба', 'в Оба', 'Oba'],
  ['tosmur', 'alanya', 'Тосмур', 'в Тосмуре', 'Tosmur'],
  ['center', 'alanya', 'Центр Алании', 'в центре Алании', 'Alanya Center', 'Alanya Merkez'],
  ['kestel', 'alanya', 'Кестель', 'в Кестеле', 'Kestel'],
  ['avsallar', 'alanya', 'Авсаллар', 'в Авсалларе', 'Avsallar'],
  ['kleopatra', 'alanya', 'Клеопатра', 'в районе Клеопатра', 'Kleopatra'],
  ['demirtas', 'alanya', 'Демирташ', 'в Демирташе', 'Demirtas', 'Demirtaş'],
  ['tepe', 'alanya', 'Тепе', 'в Тепе', 'Tepe'],
  ['cikcilli', 'alanya', 'Джикджилли', 'в Джикджилли', 'Cikcilli', 'Cikcilli'],
  ['bektas', 'alanya', 'Бекташ', 'в Бекташе', 'Bektas', 'Bektaş'],
  ['turkler', 'alanya', 'Тюрклер', 'в Тюрклере', 'Turkler', 'Türkler'],
  ['konakli', 'alanya', 'Конаклы', 'в Конаклы', 'Konakli', 'Konaklı'],
  ['payallar', 'alanya', 'Паяллар', 'в Паялларе', 'Payallar'],
  ['incekum', 'alanya', 'Инжекум', 'в Инжекуме', 'Incekum', 'İncekum'],
  ['ciplakli', 'alanya', 'Чиплаклы', 'в Чиплаклы', 'Ciplakli', 'Çıplaklı'],
  ['hasbahce', 'alanya', 'Хасбахче', 'в Хасбахче', 'Hasbahce', 'Hasbahçe'],
  ['okurcalar', 'alanya', 'Окурджалар', 'в Окурджаларе', 'Okurcalar'],
  ['urlu', 'alanya', 'Урлу', 'в Урлу', 'Urlu'],
  ['altintas', 'antalya', 'Алтынташ', 'в Алтынташе', 'Altintas', 'Altıntaş'],
  ['konyaalti', 'antalya', 'Коньяалты', 'в Коньяалты', 'Konyaalti', 'Konyaaltı'],
  ['lara', 'antalya', 'Лара', 'в Ларе', 'Lara'],
  ['muratpasa', 'antalya', 'Муратпаша', 'в Муратпаше', 'Muratpasa', 'Muratpaşa'],
  ['kepez', 'antalya', 'Кепез', 'в Кепезе', 'Kepez'],
  ['dosemealti', 'antalya', 'Дёшемеалты', 'в Дёшемеалты', 'Dosemealti', 'Döşemealtı'],
];

/** Русские названия районов, которые склоняем через «в районе …». */
const RU_NAME: Record<string, string> = {
  'beylikduzu': 'Бейликдюзю', 'basaksehir': 'Башакшехир', 'eyupsultan': 'Эюпсултан', 'buyukcekmece': 'Бююкчекмедже', 'kucukcekmece': 'Кючюкчекмедже',
  'kagithane': 'Кягытхане', 'kartal': 'Картал', 'sariyer': 'Сарыер', 'esenyurt': 'Эсеньюрт', 'avcilar': 'Авджилар', 'sisli': 'Шишли', 'zeytinburnu': 'Зейтинбурну',
  'bagcilar': 'Багджилар', 'besiktas': 'Бешикташ', 'kadikoy': 'Кадыкёй', 'atasehir': 'Аташехир', 'beykoz': 'Бейкоз', 'maltepe': 'Малтепе', 'pendik': 'Пендик',
  'sancaktepe': 'Санджактепе', 'tuzla': 'Тузла', 'cekmekoy': 'Чекмекёй', 'umraniye': 'Умрание', 'uskudar': 'Ускюдар', 'arnavutkoy': 'Арнавуткёй',
  'bahcelievler': 'Бахчелиэвлер', 'bakirkoy': 'Бакыркёй', 'bayrampasa': 'Байрампаша', 'beyoglu': 'Бейоглу', 'gaziosmanpasa': 'Газиосманпаша', 'silivri': 'Силиври',
  'alsancak': 'Алсанджак', 'esentepe': 'Эсентепе', 'lapta': 'Лапта', 'catalkoy': 'Чаталкёй', 'karsiyaka': 'Каршияка', 'tatlisu': 'Татлысу', 'long-beach': 'Лонг Бич',
  'bafra': 'Бафра', 'bogazici': 'Богазичи', 'yeni-bogazici': 'Йени Богазичи', 'kucuk-erenkoy': 'Кючук Эренкёй', 'gecitkale': 'Гечиткале', 'gaziveren': 'Газиверен',
  'guzelyurt': 'Гюзельюрт', 'cengizkoy': 'Дженгизкёй', 'arapkoy': 'Арапкёй', 'beylerbeyi': 'Бейлербейи',
};

/** Сырые значения района из API (на любом языке) → слаг. */
const DISTRICT_ALIAS: Record<string, string> = {
  'alanya - center': 'center', 'аланья - центр': 'center', 'центр аланьи': 'center', 'alanya center': 'center',
  'girne centre': 'center', 'girne': 'center', 'gazimagusa': 'center', 'iskele': 'center', 'i̇skele': 'center', 'lefkoşa': 'center',
  'jumeirah village triangle': 'jvt-jumeirah-village-triangle', 'maydan (mbr)': 'mbr-city-meydan',
  'турклер': 'turkler', 'тюрклер': 'turkler',
};
for (const [slug, , ru] of D) DISTRICT_ALIAS[ru.toLowerCase()] = slug;

/** Район «Газипаша» у проектов указан внутри Алании — это отдельный город. */
const DISTRICT_IS_CITY: Record<string, string> = { 'газипаша': 'gazipasa', 'gazipasa': 'gazipasa', 'gazipaşa': 'gazipasa' };

const districts = new Map<string, GeoDistrict>();
function mkDistrict(slug: string, citySlug: string, ru: string, ruIn: string, latin: string, tr = latin): GeoDistrict {
  return {
    slug,
    city: citySlug,
    name: { ru, en: latin, tr, de: latin, sr: latin },
    in: { ru: ruIn, en: `in ${latin}`, tr: trIn(tr), de: `in ${latin}`, sr: `u oblasti ${latin}` },
  };
}
for (const [slug, c, ru, ruIn, latin, tr] of D) districts.set(`${c}/${slug}`, mkDistrict(slug, c, ru, ruIn, latin, tr));

export const countryBySlug = (s: string) => COUNTRIES.find((c) => c.slug === s) ?? null;
export const cityBySlug = (s: string) => CITIES.find((c) => c.slug === s) ?? null;
export const districtBySlug = (city: string, s: string) => districts.get(`${city}/${s}`) ?? null;
export const districtsOf = (city: string) => [...districts.values()].filter((d) => d.city === city);
export const citiesOf = (country: string) => CITIES.filter((c) => c.country === country);

export function cityFromRaw(raw?: string | null): string | null {
  if (!raw) return null;
  return CITY_RAW[raw.trim()] ?? null;
}

/** Определяет город и район объекта по сырым значениям API. Неизвестный район регистрируется. */
export function resolveGeo(rawCity?: string | null, rawArea?: string | null): { city: string; district: string | null } | null {
  let c = cityFromRaw(rawCity);
  const a = rawArea?.trim();
  if (a && DISTRICT_IS_CITY[a.toLowerCase()]) return { city: DISTRICT_IS_CITY[a.toLowerCase()], district: null };
  if (!c) return null;
  if (!a || a === 'None' || a === 'Turkey') return { city: c, district: null };
  const key = a.toLowerCase();
  const cityObj = cityBySlug(c)!;
  let slug = DISTRICT_ALIAS[key] ?? slugify(a);
  if (slug === slugify(cityObj.name.en) || slug === slugify(cityObj.name.tr)) slug = 'center';
  if (!slug) return { city: c, district: null };
  if (!districts.has(`${c}/${slug}`)) {
    if (slug === 'center') {
      const n = cityObj.name;
      districts.set(`${c}/center`, {
        slug, city: c,
        name: { ru: `Центр ${cityObj.gen}`, en: `${n.en} Centre`, tr: `${n.tr} Merkez`, de: `${n.de} Zentrum`, sr: `Centar (${n.sr})` },
        in: { ru: `в центре ${cityObj.gen}`, en: `in ${n.en} Centre`, tr: trIn(`${n.tr} Merkez`), de: `in ${n.de} Zentrum`, sr: `u centru (${n.sr})` },
      });
    } else {
      const latin = /[а-яё]/i.test(a) ? slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()) : a.replace(/\s+/g, ' ');
      const ru = RU_NAME[slug] ?? latin;
      districts.set(`${c}/${slug}`, mkDistrict(slug, c, ru, `в районе ${ru}`, latin));
    }
  }
  return { city: c, district: slug };
}

/**
 * Соседние районы (ТЗ 6.2: гео-смежность задаётся вручную). Алания — с запада на восток вдоль моря.
 * Для районов без записи берём районы того же города с наибольшим числом объектов.
 */
export const NEIGHBOURS: Record<string, string[]> = {
  'alanya/okurcalar': ['incekum', 'avsallar'],
  'alanya/incekum': ['okurcalar', 'avsallar', 'turkler'],
  'alanya/avsallar': ['incekum', 'turkler', 'payallar'],
  'alanya/turkler': ['avsallar', 'payallar', 'konakli'],
  'alanya/payallar': ['turkler', 'konakli', 'avsallar'],
  'alanya/konakli': ['payallar', 'turkler', 'kleopatra', 'ciplakli'],
  'alanya/ciplakli': ['konakli', 'kleopatra', 'bektas'],
  'alanya/kleopatra': ['center', 'konakli', 'bektas'],
  'alanya/center': ['kleopatra', 'oba', 'bektas', 'tepe'],
  'alanya/bektas': ['center', 'kleopatra', 'tepe'],
  'alanya/tepe': ['center', 'oba', 'cikcilli', 'bektas'],
  'alanya/oba': ['center', 'tosmur', 'cikcilli', 'tepe'],
  'alanya/cikcilli': ['oba', 'tepe', 'tosmur'],
  'alanya/tosmur': ['oba', 'kestel', 'cikcilli'],
  'alanya/kestel': ['tosmur', 'mahmutlar', 'oba'],
  'alanya/mahmutlar': ['kestel', 'kargicak', 'tosmur'],
  'alanya/kargicak': ['mahmutlar', 'demirtas', 'kestel'],
  'alanya/demirtas': ['kargicak', 'mahmutlar'],
  'alanya/hasbahce': ['center', 'oba'],
  'alanya/urlu': ['center', 'oba'],
};
