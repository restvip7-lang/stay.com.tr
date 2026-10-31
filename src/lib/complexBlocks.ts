/**
 * Тексты блоков страницы ЖК, добавленных по образцу mr-group (31.10.2026, решение Anuar):
 * генплан, статус стройки, «В проекте», баннер, способы покупки, акции, материалы, ход строительства,
 * новости проекта, контакты. Где данных пока нет — заглушки (помечены STUB), наполним из базы/админки.
 */
import type { Lang } from '../i18n/config';

export interface ComplexBlocksText {
  choose: string; about: string; flats: string; allFlats: string;
  genplan: string; genplan3d: string; gpViews: [string, string, string]; gpSoon: string; floors: (n: number) => string; pick: string; tapHint: string; fromArea: (a: string) => string; fromPrice: (p: string) => string; onRequest: string;
  status: string; statusStage: string; statusStageText: string; viewing: string; viewingText: string; viewingBtn: string;
  inProject: string; banner: string; bannerText: string; bannerBtn: string;
  buy: string; promo: string; promoTitle: string; promoText: string; until: string;
  docs: string; docsList: string[]; soon: string;
  progress: string; progressCap: (q: string) => string;
  news: string; newsList: string[]; newsDate: string;
  contacts: string; office: string; hours: string; hoursText: string; call: string;
  stub: string; bld: (id: string) => string; inSale: (n: number) => string;
  video: string; photo: string; all: string; prev: string; next: string; seeAlso: string;
  formTitle: string; formText: string; formBtn: string; promoMore: string;
  docsTabs: [string, string]; months: string[]; newsAll: string;
  contactsTabs: [string, string]; viewingForm: string; viewingFormText: string; collections: string; collectionsText: string;
}

const ru: ComplexBlocksText = {
  video: 'Видео', photo: 'Фото', all: 'Все', prev: 'Назад', next: 'Вперёд', seeAlso: 'Смотрите также',
  formTitle: 'Хотите узнать больше?', formText: 'Оставьте контакты, пришлём презентацию, планировки и актуальные цены', formBtn: 'Получить презентацию', promoMore: 'Подробнее',
  docsTabs: ['Документы', 'Презентации'], months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'], newsAll: 'Все новости',
  contactsTabs: ['Жилой комплекс', 'Офис продаж'], viewingForm: 'Записаться на просмотр', viewingFormText: 'Покажем квартиры онлайн или на месте в Алании', collections: 'Подборки квартир', collectionsText: 'Квартиры и комплексы рядом по готовым подборкам',
  choose: 'Выбрать квартиру', about: 'О проекте', flats: 'Квартиры', allFlats: 'Все квартиры',
  genplan: 'Генплан', genplan3d: '3D-генплан', gpViews: ['3D-генплан', 'Повернуть 3D-генплан', '2D-генплан'], gpSoon: 'Этот вид генплана скоро появится', floors: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'этаж' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'этажа' : 'этажей'}`,
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
  video: 'Video', photo: 'Photos', all: 'All', prev: 'Previous', next: 'Next', seeAlso: 'See also',
  formTitle: 'Want to know more?', formText: 'Leave your contacts and we will send the brochure, layouts and current prices', formBtn: 'Get the brochure', promoMore: 'Learn more',
  docsTabs: ['Documents', 'Brochures'], months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], newsAll: 'All news',
  contactsTabs: ['Residential complex', 'Sales office'], viewingForm: 'Book a viewing', viewingFormText: 'We will show the apartments online or on site in Alanya', collections: 'Apartment collections', collectionsText: 'Apartments and complexes nearby in ready-made collections',
  choose: 'Choose an apartment', about: 'About the project', flats: 'Apartments', allFlats: 'All apartments',
  genplan: 'Site plan', genplan3d: '3D site plan', gpViews: ['3D site plan', 'Rotate 3D plan', '2D site plan'], gpSoon: 'This site plan view is coming soon', floors: (n) => `${n} floor${n === 1 ? '' : 's'}`,
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
  video: 'Video', photo: 'Fotoğraflar', all: 'Tümü', prev: 'Geri', next: 'İleri', seeAlso: 'Bunlara da göz atın',
  formTitle: 'Daha fazla bilgi ister misiniz?', formText: 'İletişim bilgilerinizi bırakın, sunumu, planları ve güncel fiyatları gönderelim', formBtn: 'Sunumu al', promoMore: 'Detaylar',
  docsTabs: ['Belgeler', 'Sunumlar'], months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'], newsAll: 'Tüm haberler',
  contactsTabs: ['Konut projesi', 'Satış ofisi'], viewingForm: 'Gösterim randevusu', viewingFormText: 'Daireleri online veya Alanya’da yerinde gösteririz', collections: 'Daire seçkileri', collectionsText: 'Yakındaki daireler ve projeler hazır seçkilerde',
  choose: 'Daire seçin', about: 'Proje hakkında', flats: 'Daireler', allFlats: 'Tüm daireler',
  genplan: 'Vaziyet planı', genplan3d: '3D vaziyet planı', gpViews: ['3D plan', '3D planı döndür', '2D plan'], gpSoon: 'Vaziyet planının bu görünümü yakında eklenecek', floors: (n) => `${n} kat`, pick: 'Daire seçin', tapHint: 'Daireleri ve fiyatları görmek için bir bloğa dokunun',
  fromArea: (a) => `${a}'den`, fromPrice: (p) => `${p}'den`, onRequest: 'talep üzerine',
  status: 'İnşaat durumu', statusStage: 'Aşama', statusStageText: 'Netleşecek', viewing: 'Yerinde gösterim', viewingText: 'Daireleri online veya Alanya’da yerinde gösteririz', viewingBtn: 'Randevu al',
  inProject: 'Projede', banner: 'Proje hakkında daha fazla bilgi ister misiniz?', bannerText: 'Sunumu, planları ve güncel fiyatları WhatsApp’tan gönderelim', bannerBtn: 'Sunumu al',
  buy: 'Satın alma yolları', promo: 'Kampanyalar', promoTitle: 'Proje kampanyası', promoText: 'Müteahhit indirimleri ve özel koşullar burada yer alacak', until: 'tarih netleşecek',
  docs: 'Belgeler', docsList: ['Proje sunumu', 'Daire planları', 'Yapı ruhsatı', 'Satış sözleşmesi (örnek)'], soon: 'Yakında',
  progress: 'İnşaat ilerlemesi', news: 'Proje haberleri', newsList: ['İnşaattan fotoğraf raporu', 'Fiyat ve plan güncellemesi', 'Müteahhit haberleri'], newsDate: 'Tarih burada yer alacak',
  contacts: 'İletişim', office: 'Stay Property satış ofisi', hours: 'Çalışma saatleri', hoursText: 'Her gün, 9:00–19:00', call: 'Ara', stub: 'Taslak', bld: (id) => `${id} Blok`, inSale: (n) => `${n} satışta`,
};

export const COMPLEX_BLOCKS: Record<Lang, ComplexBlocksText> = { ru, en, tr, de: en, sr: en };
