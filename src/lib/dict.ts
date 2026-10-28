// Переводы и нормализация справочных значений, которые API отдаёт вперемешку
// на русском, английском и турецком.

export const CITY_RU: Record<string, string> = {
  'Аланья': 'Аланья',
  'Алания': 'Аланья',
  'Istanbul (Europe)': 'Стамбул (Европа)',
  'Стамбул Европа': 'Стамбул (Европа)',
  'Istanbul (Asia)': 'Стамбул (Азия)',
  'Dubai': 'Дубай',
  'Girne': 'Кирения',
  'Gazimagusa': 'Фамагуста',
  'Анталья': 'Анталья',
  'Газипаша': 'Газипаша',
  'Газипаша, Аланья': 'Газипаша',
  'Iskele': 'Искеле',
  'Lefke': 'Лефке',
  'Lefkosha': 'Никосия',
  'Сиде': 'Сиде',
};

export const COUNTRY_BY_CITY: Record<string, string> = {
  'Аланья': 'Турция',
  'Стамбул (Европа)': 'Турция',
  'Стамбул (Азия)': 'Турция',
  'Анталья': 'Турция',
  'Газипаша': 'Турция',
  'Сиде': 'Турция',
  'Дубай': 'ОАЭ',
  'Кирения': 'Северный Кипр',
  'Фамагуста': 'Северный Кипр',
  'Искеле': 'Северный Кипр',
  'Лефке': 'Северный Кипр',
  'Никосия': 'Северный Кипр',
};

export const AREA_RU: Record<string, string> = {
  'Alanya - Center': 'Центр Аланьи',
  'Аланья - центр': 'Центр Аланьи',
  'Kestel': 'Кестель',
  'Avsallar': 'Авсаллар',
  'Kleopatra': 'Клеопатра',
  'Tosmur': 'Тосмур',
  'Demirtas': 'Демирташ',
  'Tepe': 'Тепе',
  'Cikcilli': 'Джикджилли',
  'Bektas': 'Бекташ',
  'Турклер': 'Тюрклер',
  'Konakli': 'Конаклы',
  'Mahmutlar': 'Махмутлар',
  'Kargicak': 'Каргыджак',
  'Oba': 'Оба',
  'Payallar': 'Паяллар',
  'Turkler': 'Тюрклер',
  'İncekum': 'Инжекум',
  'Incekum': 'Инжекум',
  'Çıplaklı': 'Чиплаклы',
  'Hasbahce': 'Хасбахче',
  'Saray': 'Сарай',
  'Long beach': 'Лонг Бич',
  'Esentepe': 'Эсентепе',
  'Tatlisu': 'Татлысу',
  'Girne Centre': 'Центр Кирении',
  'Küçük Erenköy': 'Кючук Эренкёй',
  'Beylikduzu': 'Бейликдюзю',
  'Basaksehir': 'Башакшехир',
  'Eyüpsultan': 'Эюпсултан',
  'Büyükçekmece': 'Бююкчекмедже',
  'Küçükçekmece': 'Кючюкчекмедже',
  'Kagithane': 'Кягытхане',
  'Kartal': 'Картал',
  'Sariyer': 'Сарыер',
  'Esenyurt': 'Эсеньюрт',
  'Avcilar': 'Авджилар',
  'Sisli': 'Шишли',
  'Zeytinburnu': 'Зейтинбурну',
  'Bagcilar': 'Багджилар',
  'Besiktas': 'Бешикташ',
  'Kadıköy': 'Кадыкёй',
};

export type TypeGroup = 'apartments' | 'villas' | 'duplexes' | 'other';

export const TYPE_RU: Record<string, { label: string; group: TypeGroup }> = {
  'Finished Apartment': { label: 'Готовая квартира', group: 'apartments' },
  'New Project': { label: 'Новостройка', group: 'apartments' },
  'New Projects': { label: 'Новостройка', group: 'apartments' },
  'Apartment (AE)': { label: 'Апартаменты', group: 'apartments' },
  'Apartments (inv)': { label: 'Апартаменты', group: 'apartments' },
  'Hotel Apartments': { label: 'Гостиничные апартаменты', group: 'apartments' },
  'Resale Property': { label: 'Вторичная недвижимость', group: 'apartments' },
  'Rent': { label: 'Аренда', group: 'apartments' },
  'StayProperty Project': { label: 'Проект Stay Property', group: 'apartments' },
  'Duplex': { label: 'Дуплекс', group: 'duplexes' },
  'Penthouse': { label: 'Пентхаус', group: 'duplexes' },
  'Villa': { label: 'Вилла', group: 'villas' },
  'Villa (AE)': { label: 'Вилла', group: 'villas' },
  'Townhouse (AE)': { label: 'Таунхаус', group: 'villas' },
  'Townhouse (inv)': { label: 'Таунхаус', group: 'villas' },
  'Land': { label: 'Земельный участок', group: 'other' },
  'Commercial': { label: 'Коммерческая недвижимость', group: 'other' },
};

export const TYPE_TABS: { key: TypeGroup | 'all'; label: string; plural: [string, string, string] }[] = [
  { key: 'apartments', label: 'Квартиры', plural: ['квартира', 'квартиры', 'квартир'] },
  { key: 'villas', label: 'Виллы', plural: ['вилла', 'виллы', 'вилл'] },
  { key: 'duplexes', label: 'Дуплексы', plural: ['дуплекс', 'дуплекса', 'дуплексов'] },
];

export function cityRu(v?: string | null): string | null {
  if (!v) return null;
  return CITY_RU[v.trim()] ?? v.trim();
}

export function areaRu(v?: string | null): string | null {
  if (!v || v === 'Turkey') return null;
  return AREA_RU[v.trim()] ?? v.trim();
}

export function typeInfo(v?: string | null) {
  if (!v) return { label: 'Недвижимость', group: 'other' as TypeGroup };
  return TYPE_RU[v] ?? { label: v, group: 'other' as TypeGroup };
}
