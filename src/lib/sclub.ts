/**
 * S-Club — программа привилегий для клиентов Stay (по образцу mr-group.ru/company/mrclub/).
 * Партнёры клуба (компании Алании и турецкие бренды) хранятся в хранилище сайта (config/sclub.json),
 * правятся в /admin (блок «S-Club»). Пока файла нет — тестовые данные ниже (TEST_PARTNERS), помечены test: true.
 * Тексты: ru и en; на tr/de/sr показываем английский, если своего перевода нет.
 */
import type { Lang } from '../i18n/config';
import { readJson, storeReady, writeJson } from './store';

export type Txt = Partial<Record<Lang, string>>;

export const CATEGORIES = ['furniture', 'appliances', 'renovation', 'interior', 'services', 'restaurants', 'lifestyle', 'kids'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Lang, Record<Category | 'all' | 'new', string>> = {
  ru: { all: 'Все', new: 'Новое в клубе', furniture: 'Мебель', appliances: 'Техника', renovation: 'Дизайн и ремонт', interior: 'Интерьер и декор', services: 'Услуги', restaurants: 'Рестораны', lifestyle: 'Образ жизни', kids: 'Детям' },
  en: { all: 'All', new: 'New in the club', furniture: 'Furniture', appliances: 'Appliances', renovation: 'Design & renovation', interior: 'Interior & decor', services: 'Services', restaurants: 'Restaurants', lifestyle: 'Lifestyle', kids: 'Kids' },
  tr: { all: 'Tümü', new: 'Kulüpte yeni', furniture: 'Mobilya', appliances: 'Beyaz eşya', renovation: 'Tasarım ve tadilat', interior: 'İç mekan ve dekor', services: 'Hizmetler', restaurants: 'Restoranlar', lifestyle: 'Yaşam tarzı', kids: 'Çocuklar' },
  de: { all: 'Alle', new: 'Neu im Club', furniture: 'Möbel', appliances: 'Haushaltsgeräte', renovation: 'Design & Renovierung', interior: 'Interieur & Deko', services: 'Dienstleistungen', restaurants: 'Restaurants', lifestyle: 'Lifestyle', kids: 'Kinder' },
  sr: { all: 'Sve', new: 'Novo u klubu', furniture: 'Nameštaj', appliances: 'Tehnika', renovation: 'Dizajn i renoviranje', interior: 'Enterijer i dekor', services: 'Usluge', restaurants: 'Restorani', lifestyle: 'Stil života', kids: 'Deca' },
};

export interface Partner {
  /** Адрес страницы партнёра: /{lang}/s-club/{id}/ (латиница, цифры, дефис). */
  id: string;
  name: string;
  category: Category;
  /** Плашка на фото: «−15%», «Скидка до 20 000 ₺», «Доставка в подарок». */
  badge: Txt;
  /** Одна строка под названием. */
  tagline: Txt;
  /** О компании: абзацы через пустую строку. */
  about: Txt;
  /** Условия: по одному пункту в строке. */
  terms: Txt;
  /** Адреса: по одному в строке. */
  addresses: string[];
  site?: string;
  phone?: string;
  instagram?: string;
  /** Фото: свой файл (/media/…, /hero/…, /services/…) или ссылка https. */
  image: string;
  /** Логотип (необязательно): без него — название текстом. */
  logo?: string;
  /** В ленте под первым экраном. */
  featured?: boolean;
  /** «Новое в клубе». */
  isNew?: boolean;
  /** Тестовые данные (плашка «Тест»). */
  test?: boolean;
  hidden?: boolean;
}

/** Текст на языке страницы: свой → английский → русский. */
export const tx = (t: Txt | undefined, lang: Lang) => (t?.[lang] || t?.en || t?.ru || '').trim();
export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

const KEY = 'config/sclub.json';
let memo: { at: number; value: Partner[] } | null = null;

const ID = /^[a-z0-9][a-z0-9-]{0,60}$/;
const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : '');
const txt = (v: any, max = 4000): Txt => {
  const out: Txt = {};
  if (v && typeof v === 'object') for (const l of ['ru', 'en', 'tr', 'de', 'sr'] as Lang[]) if (typeof v[l] === 'string' && v[l].trim()) out[l] = v[l].slice(0, max);
  return out;
};
const url = (v: unknown) => { const s = str(v, 500).trim(); return /^(https:\/\/|\/(media|hero|services)\/)/.test(s) ? s : ''; };

export function normalizePartners(x: unknown): Partner[] {
  if (!Array.isArray(x)) return [];
  const seen = new Set<string>();
  const out: Partner[] = [];
  for (const p of x as any[]) {
    const id = str(p?.id, 61).trim().toLowerCase();
    if (!ID.test(id) || seen.has(id) || !str(p?.name).trim()) continue;
    seen.add(id);
    out.push({
      id,
      name: str(p.name, 120).trim(),
      category: (CATEGORIES as readonly string[]).includes(p.category) ? p.category : 'services',
      badge: txt(p.badge, 60), tagline: txt(p.tagline, 200), about: txt(p.about), terms: txt(p.terms),
      addresses: Array.isArray(p.addresses) ? p.addresses.map((a: unknown) => str(a, 200).trim()).filter(Boolean).slice(0, 20) : [],
      site: str(p.site, 300).trim() || undefined, phone: str(p.phone, 60).trim() || undefined, instagram: str(p.instagram, 300).trim() || undefined,
      image: url(p.image), logo: url(p.logo) || undefined,
      featured: !!p.featured, isNew: !!p.isNew, test: !!p.test, hidden: !!p.hidden,
    });
  }
  return out;
}

export async function getPartners(all = false): Promise<Partner[]> {
  if (!memo || Date.now() - memo.at > 30_000) {
    const saved = await readJson(KEY);
    memo = { at: Date.now(), value: saved ? normalizePartners(saved) : TEST_PARTNERS };
  }
  return all ? memo.value : memo.value.filter((p) => !p.hidden);
}

export async function savePartners(x: unknown): Promise<Partner[]> {
  if (!storeReady()) throw new Error('Хранилище не подключено');
  const value = normalizePartners(x);
  await writeJson(KEY, value, true);
  memo = { at: Date.now(), value };
  return value;
}

export const sclubUrl = (lang: Lang, id?: string) => `/${lang}/s-club/${id ? `${id}/` : ''}`;

/** Вопросы и ответы (по образцу MR Club, под Stay). */
export const FAQ: Record<'ru' | 'en', { q: string; a: string }[]> = {
  ru: [
    { q: 'Что такое S-Club?', a: 'S-Club — программа привилегий для клиентов Stay Property. Она помогает быстрее обустроиться в Алании: скидки на мебель, технику, ремонт и услуги у наших партнёров.' },
    { q: 'Кто может стать участником S-Club?', a: 'Все, кто купил недвижимость через Stay Property. После сделки вы получаете персональный номер карты S-Club в WhatsApp и на почту.' },
    { q: 'Какие привилегии меня ждут?', a: 'Пока вы ждёте ключи — предложения ресторанов и сервисов Алании. Когда заселяетесь — скидки на мебель, бытовую технику, текстиль, ремонт и уборку. Когда живёте — предложения локальных брендов рядом с домом.' },
    { q: 'Какой срок действия карты?', a: 'Срок действия карты не ограничен.' },
    { q: 'Как выглядит номер карты?', a: 'Номер состоит из букв SC и 12 цифр, например SC 0000 0000 0000. Карта электронная: на ней ваш номер и имя.' },
    { q: 'Как воспользоваться скидкой партнёра?', a: 'Назовите номер карты S-Club в магазине партнёра или при заказе по телефону. Условия каждого партнёра указаны на его странице.' },
    { q: 'Нужно ли активировать карту?', a: 'Нет. Привилегии доступны сразу после получения номера карты.' },
    { q: 'Я купил несколько объектов. Сколько будет карт?', a: 'Одна: карта привязывается к покупателю, количество объектов не важно.' },
    { q: 'Если квартиру покупают двое, сколько карт выдадут?', a: 'Одну — участнику, на которого оформлена сделка. Он может пользоваться привилегиями вместе с семьёй.' },
    { q: 'Что делать, если сменился номер телефона?', a: 'Напишите нам в WhatsApp или на почту и укажите имя, новый телефон и почту. Мы обновим данные карты.' },
  ],
  en: [
    { q: 'What is S-Club?', a: 'S-Club is a privilege programme for Stay Property clients. It helps you settle in Alanya faster: discounts on furniture, appliances, renovation and services from our partners.' },
    { q: 'Who can join S-Club?', a: 'Everyone who bought property through Stay Property. After the deal you receive a personal S-Club card number via WhatsApp and email.' },
    { q: 'What privileges are included?', a: 'While you wait for the keys — offers from Alanya restaurants and services. When you move in — discounts on furniture, appliances, textiles, renovation and cleaning. When you live here — offers from local brands near your home.' },
    { q: 'How long is the card valid?', a: 'The card has no expiry date.' },
    { q: 'What does the card number look like?', a: 'It is SC followed by 12 digits, e.g. SC 0000 0000 0000. The card is digital and shows your number and name.' },
    { q: 'How do I use a partner discount?', a: 'Give your S-Club card number in the partner’s store or when ordering by phone. Each partner’s terms are on its page.' },
    { q: 'Do I need to activate the card?', a: 'No. Privileges are available as soon as you get the card number.' },
    { q: 'I bought several properties. How many cards will I get?', a: 'One: the card is linked to the buyer, the number of properties does not matter.' },
    { q: 'If two people buy an apartment together, how many cards are issued?', a: 'One — to the person named in the deal. Their family can use the privileges too.' },
    { q: 'What if my phone number changed?', a: 'Message us on WhatsApp or by email with your name, new phone and email. We will update your card.' },
  ],
};

// ——— Тестовые данные (Anuar 25.11.2026: заглушки, потом заменим боевыми через админку) ———
const T = (ru: string, en: string): Txt => ({ ru, en });
const TEST_ADDR = 'Алания (тестовый адрес)';
export const TEST_PARTNERS: Partner[] = [
  { id: 'ducca-home', name: 'Ducca Home', category: 'furniture', featured: true, isNew: true, test: true,
    badge: T('−15%', '−15%'), tagline: T('Мебель и интерьер под ключ в Алании', 'Turnkey furniture and interiors in Alanya'),
    about: T('Ducca Home — мебельный салон в Алании: гостиные, спальни, кухни и мебель для террас. Помогают обставить квартиру под сдачу или для жизни за пару недель.\n\nДизайнер салона подберёт комплект под планировку и бюджет, доставка и сборка по Алании.', 'Ducca Home is a furniture showroom in Alanya: living rooms, bedrooms, kitchens and terrace furniture. They furnish an apartment for living or renting out within a couple of weeks.\n\nThe in-house designer selects a set for your layout and budget; delivery and assembly across Alanya.'),
    terms: T('Скидка 15% на мебель из салона\nБесплатная доставка и сборка по Алании\nНе суммируется с другими акциями', '15% off showroom furniture\nFree delivery and assembly in Alanya\nCannot be combined with other offers'),
    addresses: [TEST_ADDR], site: 'https://duccahome.com', image: '/services/furnishing-and-equipping-the-apartment.webp' },
  { id: 'arcelik', name: 'Arçelik', category: 'appliances', featured: true, test: true,
    badge: T('−10%', '−10%'), tagline: T('Бытовая техника и кондиционеры', 'Home appliances and air conditioners'),
    about: T('Arçelik — крупнейший турецкий производитель бытовой техники: холодильники, стиральные машины, плиты, кондиционеры. Фирменные магазины есть во всех районах Алании.', 'Arçelik is Türkiye’s largest home appliance maker: fridges, washing machines, ovens, air conditioners. Brand stores are in every district of Alanya.'),
    terms: T('Скидка 10% на технику в фирменных магазинах\nУстановка кондиционера в подарок\nГарантия производителя', '10% off appliances in brand stores\nFree air conditioner installation\nManufacturer warranty'),
    addresses: [TEST_ADDR], site: 'https://www.arcelik.com.tr', image: '/services/checking-the-technical-condition-of-equipment.webp' },
  { id: 'beko', name: 'Beko', category: 'appliances', test: true,
    badge: T('−12%', '−12%'), tagline: T('Техника для кухни и дома', 'Kitchen and home appliances'),
    about: T('Beko — турецкий бренд техники для кухни, стирки и климата. Комплекты для новой квартиры со скидкой и доставкой.', 'Beko is a Turkish brand of kitchen, laundry and climate appliances. Sets for a new apartment with a discount and delivery.'),
    terms: T('Скидка 12% на комплект из 3 предметов\nДоставка и подключение бесплатно', '12% off a set of 3 appliances\nFree delivery and connection'),
    addresses: [TEST_ADDR], site: 'https://www.beko.com.tr', image: '/services/checking-the-technical-condition-of-equipment.webp' },
  { id: 'vestel', name: 'Vestel', category: 'appliances', test: true,
    badge: T('−8%', '−8%'), tagline: T('Телевизоры и техника для дома', 'TVs and home appliances'),
    about: T('Vestel — турецкий производитель телевизоров, кондиционеров и бытовой техники.', 'Vestel is a Turkish maker of TVs, air conditioners and home appliances.'),
    terms: T('Скидка 8% на телевизоры и технику\nРассрочка без переплаты', '8% off TVs and appliances\nInterest-free instalments'),
    addresses: [TEST_ADDR], site: 'https://www.vestel.com.tr', image: '/services/subscription-contracts-services.webp' },
  { id: 'istikbal', name: 'İstikbal', category: 'furniture', featured: true, test: true,
    badge: T('−10%', '−10%'), tagline: T('Мебель, матрасы и товары для сна', 'Furniture, mattresses and sleep products'),
    about: T('İstikbal — турецкая сеть мебели и матрасов: спальни, диваны, детские комнаты.', 'İstikbal is a Turkish furniture and mattress chain: bedrooms, sofas, kids’ rooms.'),
    terms: T('Скидка 10% на мебель и матрасы\nДоставка по Алании бесплатно', '10% off furniture and mattresses\nFree delivery in Alanya'),
    addresses: [TEST_ADDR], site: 'https://www.istikbal.com.tr', image: '/services/furnishing-and-equipping-the-apartment.webp' },
  { id: 'bellona', name: 'Bellona', category: 'furniture', test: true,
    badge: T('−12%', '−12%'), tagline: T('Мебель для гостиной и спальни', 'Living room and bedroom furniture'),
    about: T('Bellona — турецкий бренд мебели и текстиля для дома.', 'Bellona is a Turkish brand of home furniture and textiles.'),
    terms: T('Скидка 12% на гарнитуры\nСборка в подарок', '12% off furniture sets\nFree assembly'),
    addresses: [TEST_ADDR], site: 'https://www.bellona.com.tr', image: '/services/furnishing-and-equipping-the-apartment.webp' },
  { id: 'dogtas', name: 'Doğtaş', category: 'furniture', isNew: true, test: true,
    badge: T('Доставка в подарок', 'Free delivery'), tagline: T('Дизайнерская мебель из Турции', 'Designer furniture from Türkiye'),
    about: T('Doğtaş — мебель для гостиной, столовой и спальни в современном стиле.', 'Doğtaş makes modern living, dining and bedroom furniture.'),
    terms: T('Бесплатная доставка и сборка\nСкидка 5% при заказе от 100 000 ₺', 'Free delivery and assembly\n5% off orders over ₺100,000'),
    addresses: [TEST_ADDR], site: 'https://www.dogtas.com', image: '/services/renovation-and-decoration.webp' },
  { id: 'english-home', name: 'English Home', category: 'interior', featured: true, test: true,
    badge: T('−15%', '−15%'), tagline: T('Текстиль и декор для дома', 'Home textiles and decor'),
    about: T('English Home — постельное бельё, полотенца, шторы, посуда и декор.', 'English Home: bedding, towels, curtains, tableware and decor.'),
    terms: T('Скидка 15% на текстиль\nНе действует на товары со скидкой', '15% off textiles\nNot valid on discounted items'),
    addresses: [TEST_ADDR], site: 'https://www.englishhome.com', image: '/services/cleaning-and-hygiene-services.webp' },
  { id: 'karaca', name: 'Karaca', category: 'interior', test: true,
    badge: T('−20%', '−20%'), tagline: T('Посуда и сервировка', 'Cookware and tableware'),
    about: T('Karaca — турецкий бренд посуды, сервизов и техники для кухни.', 'Karaca is a Turkish brand of cookware, dinnerware and kitchen appliances.'),
    terms: T('Скидка 20% на сервизы и наборы посуды', '20% off dinnerware and cookware sets'),
    addresses: [TEST_ADDR], site: 'https://www.karaca.com', image: '/services/after-sales.webp' },
  { id: 'pasabahce', name: 'Paşabahçe', category: 'interior', test: true,
    badge: T('−10%', '−10%'), tagline: T('Стекло и хрусталь', 'Glass and crystal'),
    about: T('Paşabahçe — бокалы, вазы и предметы из стекла.', 'Paşabahçe: glasses, vases and glassware.'),
    terms: T('Скидка 10% в магазинах Paşabahçe', '10% off in Paşabahçe stores'),
    addresses: [TEST_ADDR], site: 'https://www.pasabahce.com', image: '/services/exchange.webp' },
  { id: 'vitra', name: 'VitrA', category: 'renovation', test: true,
    badge: T('−10%', '−10%'), tagline: T('Сантехника и плитка', 'Bathroom fixtures and tiles'),
    about: T('VitrA — турецкий бренд сантехники, смесителей и керамической плитки.', 'VitrA is a Turkish brand of bathroom fixtures, taps and ceramic tiles.'),
    terms: T('Скидка 10% на сантехнику и плитку', '10% off bathroom fixtures and tiles'),
    addresses: [TEST_ADDR], site: 'https://www.vitra.com.tr', image: '/services/renovation-and-decoration.webp' },
  { id: 'alanya-design-studio', name: 'Alanya Design Studio', category: 'renovation', isNew: true, test: true,
    badge: T('Дизайн-проект в подарок', 'Free design project'), tagline: T('Дизайн и ремонт квартир под ключ', 'Turnkey design and renovation'),
    about: T('Студия дизайна и ремонта в Алании: дизайн-проект, черновые и чистовые работы, меблировка.', 'An Alanya design and renovation studio: design project, rough and finishing works, furnishing.'),
    terms: T('Дизайн-проект бесплатно при заказе ремонта\nГарантия на работы 2 года', 'Free design project with a renovation order\n2-year warranty on works'),
    addresses: [TEST_ADDR], image: '/services/renovation-and-decoration.webp' },
  { id: 'alanya-clean', name: 'Alanya Clean', category: 'services', featured: true, test: true,
    badge: T('−20%', '−20%'), tagline: T('Уборка после ремонта и заселения', 'Post-renovation and move-in cleaning'),
    about: T('Клининговая служба в Алании: генеральная уборка, мойка окон, уборка после ремонта.', 'An Alanya cleaning service: deep cleaning, window washing, post-renovation cleaning.'),
    terms: T('Скидка 20% на первую уборку', '20% off the first cleaning'),
    addresses: [TEST_ADDR], image: '/services/cleaning-and-hygiene-services.webp' },
  { id: 'alanya-transfer', name: 'Alanya Transfer', category: 'services', test: true,
    badge: T('−15%', '−15%'), tagline: T('Трансфер из аэропорта и переезд', 'Airport transfers and moving'),
    about: T('Трансферы из аэропортов Анталии и Газипаши, перевозка вещей и мебели.', 'Transfers from Antalya and Gazipaşa airports, moving of belongings and furniture.'),
    terms: T('Скидка 15% на трансферы и переезд', '15% off transfers and moving'),
    addresses: [TEST_ADDR], image: '/services/transportation-services.webp' },
  { id: 'insurance-alanya', name: 'Sigorta Alanya', category: 'services', test: true,
    badge: T('−10%', '−10%'), tagline: T('Страхование жилья и DASK', 'Home insurance and DASK'),
    about: T('Страховой агент в Алании: обязательная страховка DASK, страхование квартиры и имущества.', 'An insurance agent in Alanya: mandatory DASK, apartment and contents insurance.'),
    terms: T('Скидка 10% на страхование квартиры', '10% off apartment insurance'),
    addresses: [TEST_ADDR], image: '/services/insurance-services.webp' },
  { id: 'turk-telekom', name: 'Türk Telekom', category: 'services', test: true,
    badge: T('Подключение бесплатно', 'Free connection'), tagline: T('Интернет и ТВ для новой квартиры', 'Internet and TV for your new home'),
    about: T('Домашний интернет и телевидение. Поможем оформить договор на иностранца.', 'Home internet and TV. We help sign the contract as a foreigner.'),
    terms: T('Бесплатное подключение\nПервый месяц со скидкой 50%', 'Free connection\n50% off the first month'),
    addresses: [TEST_ADDR], site: 'https://www.turktelekom.com.tr', image: '/services/subscription-contracts-services.webp' },
  { id: 'marina-restaurant', name: 'Marina Restaurant', category: 'restaurants', featured: true, test: true,
    badge: T('−10%', '−10%'), tagline: T('Ресторан у марины Алании', 'Restaurant by the Alanya marina'),
    about: T('Средиземноморская кухня и морепродукты с видом на марину и крепость.', 'Mediterranean cuisine and seafood overlooking the marina and the castle.'),
    terms: T('Скидка 10% на всё меню\nБронирование по телефону', '10% off the whole menu\nBooking by phone'),
    addresses: [TEST_ADDR], image: '/hero/exodus_dreams_residence.webp' },
  { id: 'beach-club', name: 'Alanya Beach Club', category: 'lifestyle', test: true,
    badge: T('−15%', '−15%'), tagline: T('Пляжный клуб и бассейн', 'Beach club and pool'),
    about: T('Шезлонги, бассейн и бар на пляже Клеопатры.', 'Sunbeds, a pool and a bar on Cleopatra Beach.'),
    terms: T('Скидка 15% на абонемент на сезон', '15% off a season pass'),
    addresses: [TEST_ADDR], image: '/hero/exodus_aqua_deluxe_konakli.webp' },
  { id: 'ebebek', name: 'ebebek', category: 'kids', test: true,
    badge: T('−10%', '−10%'), tagline: T('Всё для малышей', 'Everything for babies'),
    about: T('Турецкая сеть товаров для детей: коляски, кроватки, одежда, игрушки.', 'A Turkish chain of baby products: strollers, cots, clothes, toys.'),
    terms: T('Скидка 10% на мебель для детской', '10% off nursery furniture'),
    addresses: [TEST_ADDR], site: 'https://www.e-bebek.com', image: '/services/relocation-support.webp' },
];

/** Подписи страниц S-Club (5 языков). */
export const UI: Record<Lang, Record<string, string>> = {
  ru: {
    kicker: 'Программа привилегий', title: 'Программа привилегий для клиентов Stay Property в Алании', lead: 'Скидки на мебель, технику, ремонт и сервисы у партнёров клуба — чтобы быстрее обустроиться на новом месте.',
    get: 'Получить скидки', how: 'Как это работает', offers: 'Предложения', test: 'Тест', testNote: 'Тестовые данные: партнёры, скидки и адреса — примеры для проверки страницы, а не действующие предложения.',
    prev: 'Назад', next: 'Вперёд', empty: 'В этой категории пока нет предложений.',
    lifeTitle: 'Всё, что нужно для новой жизни на новом месте', lifeText: 'Привилегии S-Club доступны клиентам, купившим недвижимость через Stay Property. Если вы наш клиент, но ещё не получили номер карты S-Club, свяжитесь с нами удобным способом.',
    contact: 'Связаться с нами', phone: 'Телефон', whatsapp: 'WhatsApp', email: 'Почта', callback: 'Заказать обратный звонок', close: 'Закрыть',
    faq: 'Часто задаваемые вопросы', more: 'Показать ещё',
    getOne: 'Получить скидку', about: 'О компании', addresses: 'Адреса', site: 'Сайт', instagram: 'Instagram', terms: 'Условия', use: 'Как воспользоваться',
    useText: 'Назовите номер карты S-Club в магазине партнёра или при заказе по телефону. Привилегии доступны клиентам Stay Property.',
    noAnswer: 'Не нашли ответа на свой вопрос?', noAnswerText: 'Свяжитесь с нами, мы обязательно поможем!', other: 'Другие предложения', all: 'Все предложения', home: 'Главная',
  },
  en: {
    kicker: 'Privilege programme', title: 'Privilege programme for Stay Property clients in Alanya', lead: 'Discounts on furniture, appliances, renovation and services from club partners — to settle into your new home faster.',
    get: 'Get discounts', how: 'How it works', offers: 'Offers', test: 'Test', testNote: 'Test data: partners, discounts and addresses are placeholders for reviewing the page, not real offers.',
    prev: 'Previous', next: 'Next', empty: 'No offers in this category yet.',
    lifeTitle: 'Everything you need for a new life in a new place', lifeText: 'S-Club privileges are available to clients who bought property through Stay Property. If you are our client but have not received your S-Club card number yet, contact us in any convenient way.',
    contact: 'Contact us', phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email', callback: 'Request a call back', close: 'Close',
    faq: 'Frequently asked questions', more: 'Show more',
    getOne: 'Get the discount', about: 'About', addresses: 'Addresses', site: 'Website', instagram: 'Instagram', terms: 'Terms', use: 'How to use',
    useText: 'Give your S-Club card number in the partner’s store or when ordering by phone. Privileges are available to Stay Property clients.',
    noAnswer: 'Didn’t find an answer?', noAnswerText: 'Contact us, we will be happy to help!', other: 'More offers', all: 'All offers', home: 'Home',
  },
  tr: {
    kicker: 'Ayrıcalık programı', title: 'Alanya’da Stay Property müşterileri için ayrıcalık programı', lead: 'Kulüp ortaklarından mobilya, beyaz eşya, tadilat ve hizmetlerde indirimler — yeni evinize daha hızlı yerleşin.',
    get: 'İndirimleri al', how: 'Nasıl çalışır', offers: 'Teklifler', test: 'Test', testNote: 'Test verisi: ortaklar, indirimler ve adresler sayfayı incelemek için örnektir, geçerli teklif değildir.',
    prev: 'Geri', next: 'İleri', empty: 'Bu kategoride henüz teklif yok.',
    lifeTitle: 'Yeni bir yerde yeni bir hayat için ihtiyacınız olan her şey', lifeText: 'S-Club ayrıcalıkları, Stay Property aracılığıyla mülk satın alan müşterilerimize açıktır. Müşterimizseniz ve S-Club kart numaranızı henüz almadıysanız bize ulaşın.',
    contact: 'Bize ulaşın', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-posta', callback: 'Geri arama talep et', close: 'Kapat',
    faq: 'Sıkça sorulan sorular', more: 'Daha fazla göster',
    getOne: 'İndirimi al', about: 'Hakkında', addresses: 'Adresler', site: 'Web sitesi', instagram: 'Instagram', terms: 'Koşullar', use: 'Nasıl kullanılır',
    useText: 'S-Club kart numaranızı ortağın mağazasında veya telefonla sipariş verirken söyleyin. Ayrıcalıklar Stay Property müşterileri içindir.',
    noAnswer: 'Sorunuzun cevabını bulamadınız mı?', noAnswerText: 'Bize ulaşın, memnuniyetle yardımcı oluruz!', other: 'Diğer teklifler', all: 'Tüm teklifler', home: 'Ana sayfa',
  },
  de: {
    kicker: 'Privilegienprogramm', title: 'Privilegienprogramm für Kunden von Stay Property in Alanya', lead: 'Rabatte auf Möbel, Haushaltsgeräte, Renovierung und Services bei Clubpartnern — damit Sie schneller im neuen Zuhause ankommen.',
    get: 'Rabatte erhalten', how: 'So funktioniert es', offers: 'Angebote', test: 'Test', testNote: 'Testdaten: Partner, Rabatte und Adressen sind Platzhalter zur Ansicht der Seite, keine gültigen Angebote.',
    prev: 'Zurück', next: 'Weiter', empty: 'In dieser Kategorie gibt es noch keine Angebote.',
    lifeTitle: 'Alles für ein neues Leben an einem neuen Ort', lifeText: 'S-Club-Privilegien gelten für Kunden, die über Stay Property eine Immobilie gekauft haben. Wenn Sie Kunde sind und noch keine S-Club-Kartennummer erhalten haben, kontaktieren Sie uns.',
    contact: 'Kontakt', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-Mail', callback: 'Rückruf anfordern', close: 'Schließen',
    faq: 'Häufige Fragen', more: 'Mehr anzeigen',
    getOne: 'Rabatt erhalten', about: 'Über das Unternehmen', addresses: 'Adressen', site: 'Website', instagram: 'Instagram', terms: 'Bedingungen', use: 'So nutzen Sie es',
    useText: 'Nennen Sie Ihre S-Club-Kartennummer im Geschäft des Partners oder bei telefonischer Bestellung. Privilegien gelten für Kunden von Stay Property.',
    noAnswer: 'Keine Antwort gefunden?', noAnswerText: 'Kontaktieren Sie uns, wir helfen gerne!', other: 'Weitere Angebote', all: 'Alle Angebote', home: 'Startseite',
  },
  sr: {
    kicker: 'Program privilegija', title: 'Program privilegija za klijente Stay Property u Alanji', lead: 'Popusti na nameštaj, tehniku, renoviranje i usluge kod partnera kluba — da se brže smestite u novi dom.',
    get: 'Preuzmi popuste', how: 'Kako funkcioniše', offers: 'Ponude', test: 'Test', testNote: 'Test podaci: partneri, popusti i adrese su primeri za pregled stranice, a ne važeće ponude.',
    prev: 'Nazad', next: 'Napred', empty: 'U ovoj kategoriji još nema ponuda.',
    lifeTitle: 'Sve što vam treba za novi život na novom mestu', lifeText: 'Privilegije S-Club dostupne su klijentima koji su kupili nekretninu preko Stay Property. Ako ste naš klijent, a još niste dobili broj S-Club kartice, javite nam se.',
    contact: 'Kontaktirajte nas', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-pošta', callback: 'Zatražite poziv', close: 'Zatvori',
    faq: 'Česta pitanja', more: 'Prikaži još',
    getOne: 'Preuzmi popust', about: 'O kompaniji', addresses: 'Adrese', site: 'Sajt', instagram: 'Instagram', terms: 'Uslovi', use: 'Kako koristiti',
    useText: 'Navedite broj S-Club kartice u prodavnici partnera ili pri porudžbini telefonom. Privilegije su dostupne klijentima Stay Property.',
    noAnswer: 'Niste pronašli odgovor?', noAnswerText: 'Javite nam se, rado ćemo pomoći!', other: 'Druge ponude', all: 'Sve ponude', home: 'Početna',
  },
};

/** Первое предложение «О компании» — подпись на карточке. */
export const firstSentence = (s: string) => (lines(s)[0] ?? '').split(/(?<=[.!?])\s/)[0] ?? '';
