/**
 * Тексты блоков страницы ЖК, добавленных по образцу mr-group (31.10.2026, решение Anuar):
 * генплан, статус стройки, «В проекте», баннер, способы покупки, акции, материалы, ход строительства,
 * новости проекта, контакты. Где данных пока нет — заглушки (помечены STUB), наполним из базы/админки.
 */
import type { Lang } from '../i18n/config';

export interface ComplexBlocksText {
  choose: string; about: string; flats: string; allFlats: string;
  genplan: string; genplan3d: string; floors: (n: number) => string; pick: string; tapHint: string; fromArea: (a: string) => string; fromPrice: (p: string) => string; onRequest: string;
  status: string; statusStage: string; statusStageText: string; viewing: string; viewingText: string; viewingBtn: string;
  inProject: string; banner: string; bannerText: string; bannerBtn: string;
  buy: string; promo: string; promoTitle: string; promoText: string; until: string;
  docs: string; docsList: string[]; soon: string;
  progress: string; progressCap: (q: string) => string;
  news: string; newsList: string[]; newsDate: string;
  contacts: string; office: string; hours: string; hoursText: string; call: string;
  stub: string; bld: (id: string) => string; inSale: (n: number) => string;
}

const ru: ComplexBlocksText = {
  choose: 'Выбрать квартиру', about: 'О проекте', flats: 'Квартиры', allFlats: 'Все квартиры',
  genplan: 'Генплан', genplan3d: '3D-генплан', floors: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'этаж' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'этажа' : 'этажей'}`,
  pick: 'Выбрать квартиру', tapHint: 'Нажмите на корпус, чтобы увидеть квартиры и цены', fromArea: (a) => `от ${a}`, fromPrice: (p) => `от ${p}`, onRequest: 'по запросу',
  status: 'Статус строительства', statusStage: 'Стадия', statusStageText: 'Уточняется', viewing: 'Показ на объекте', viewingText: 'Покажем квартиры онлайн или на месте в Алании', viewingBtn: 'Записаться',
  inProject: 'В проекте', banner: 'Хотите узнать больше о проекте?', bannerText: 'Пришлём презентацию, планировки и актуальные цены в WhatsApp', bannerBtn: 'Получить презентацию',
  buy: 'Способы покупки', promo: 'Акции', promoTitle: 'Акция проекта', promoText: 'Здесь появятся скидки и спецусловия застройщика', until: 'срок уточняется',
  docs: 'Материалы', docsList: ['Презентация проекта', 'Планировки квартир', 'Разрешение на строительство', 'Договор купли-продажи (образец)'], soon: 'Скоро',
  progress: 'Ход строительства', progressCap: (q) => q,
  news: 'Новости проекта', newsList: ['Фотоотчёт со стройки', 'Обновление цен и планировок', 'Новости застройщика'], newsDate: 'Дата появится здесь',
  contacts: 'Контакты', office: 'Офис продаж Stay Property', hours: 'Часы работы', hoursText: 'Ежедневно, 9:00–19:00', call: 'Позвонить',
  stub: 'Заглушка', bld: (id) => `Корпус ${id}`, inSale: (n) => `${n} в продаже`,
};
const en: ComplexBlocksText = {
  choose: 'Choose an apartment', about: 'About the project', flats: 'Apartments', allFlats: 'All apartments',
  genplan: 'Site plan', genplan3d: '3D site plan', floors: (n) => `${n} floor${n === 1 ? '' : 's'}`,
  pick: 'Choose an apartment', tapHint: 'Tap a building to see apartments and prices', fromArea: (a) => `from ${a}`, fromPrice: (p) => `from ${p}`, onRequest: 'on request',
  status: 'Construction status', statusStage: 'Stage', statusStageText: 'To be confirmed', viewing: 'Viewing', viewingText: 'We will show the apartments online or on site in Alanya', viewingBtn: 'Book a viewing',
  inProject: 'In the project', banner: 'Want to know more about the project?', bannerText: 'We will send the brochure, layouts and current prices via WhatsApp', bannerBtn: 'Get the brochure',
  buy: 'Ways to buy', promo: 'Offers', promoTitle: 'Project offer', promoText: 'Developer discounts and special terms will appear here', until: 'dates to be confirmed',
  docs: 'Documents', docsList: ['Project brochure', 'Apartment layouts', 'Building permit', 'Sale agreement (sample)'], soon: 'Soon',
  progress: 'Construction progress', progressCap: (q) => q,
  news: 'Project news', newsList: ['Construction photo report', 'Price and layout update', 'Developer news'], newsDate: 'Date will appear here',
  contacts: 'Contacts', office: 'Stay Property sales office', hours: 'Opening hours', hoursText: 'Daily, 9:00–19:00', call: 'Call',
  stub: 'Placeholder', bld: (id) => `Building ${id}`, inSale: (n) => `${n} for sale`,
};
const tr: ComplexBlocksText = {
  ...en,
  choose: 'Daire seçin', about: 'Proje hakkında', flats: 'Daireler', allFlats: 'Tüm daireler',
  genplan: 'Vaziyet planı', genplan3d: '3D vaziyet planı', floors: (n) => `${n} kat`, pick: 'Daire seçin', tapHint: 'Daireleri ve fiyatları görmek için bir bloğa dokunun',
  fromArea: (a) => `${a}'den`, fromPrice: (p) => `${p}'den`, onRequest: 'talep üzerine',
  status: 'İnşaat durumu', statusStage: 'Aşama', statusStageText: 'Netleşecek', viewing: 'Yerinde gösterim', viewingText: 'Daireleri online veya Alanya’da yerinde gösteririz', viewingBtn: 'Randevu al',
  inProject: 'Projede', banner: 'Proje hakkında daha fazla bilgi ister misiniz?', bannerText: 'Sunumu, planları ve güncel fiyatları WhatsApp’tan gönderelim', bannerBtn: 'Sunumu al',
  buy: 'Satın alma yolları', promo: 'Kampanyalar', promoTitle: 'Proje kampanyası', promoText: 'Müteahhit indirimleri ve özel koşullar burada yer alacak', until: 'tarih netleşecek',
  docs: 'Belgeler', docsList: ['Proje sunumu', 'Daire planları', 'Yapı ruhsatı', 'Satış sözleşmesi (örnek)'], soon: 'Yakında',
  progress: 'İnşaat ilerlemesi', news: 'Proje haberleri', newsList: ['İnşaattan fotoğraf raporu', 'Fiyat ve plan güncellemesi', 'Müteahhit haberleri'], newsDate: 'Tarih burada yer alacak',
  contacts: 'İletişim', office: 'Stay Property satış ofisi', hours: 'Çalışma saatleri', hoursText: 'Her gün, 9:00–19:00', call: 'Ara', stub: 'Taslak', bld: (id) => `${id} Blok`, inSale: (n) => `${n} satışta`,
};

export const COMPLEX_BLOCKS: Record<Lang, ComplexBlocksText> = { ru, en, tr, de: en, sr: en };
