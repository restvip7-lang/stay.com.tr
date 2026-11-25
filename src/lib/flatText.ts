/**
 * Тексты карточки квартиры STAY PROJECTS (FlatPage.astro, PDF квартиры): подписи и текст «Об этой квартире» из данных.
 * Русский и английский; турецкий, немецкий и сербский показывают английский.
 */
import type { Lang } from '../i18n/config';
import { pluralL } from './format';

type Steps = [string, string][];
interface FlatUi {
  tabs: { plan: string; floor: string; view: string; genplan: string };
  ppm: string; perM2: string; or: string; project: string; block: string; floor: string; number: string; area: string; ready: string; sea: string; place: string; article: string;
  params: string; call: string; steps: string; stepsSub: string; stepList: Steps; consult: string; pdf: string;
  buy: string; full: string; fullText: string; inst: string; instText: string; instShort: (pay: number, months: number | null) => string;
  promo: string; request: string; gallery: string; about: string; readMore: string; less: string; allIn: (p: string) => string;
  ground: string; floorOf: (f: number, top: number) => string; floorAlt: (f: number | null, b: string | null) => string; toGenplan: string;
  floorPlan: string; view: string; genplan: string; price: string; siteLink: string; disclaimer: string;
}

export const FLAT_UI: Partial<Record<Lang, FlatUi>> & { en: FlatUi } = {
  ru: {
    tabs: { plan: 'Планировка', floor: 'План этажа', view: 'Вид из окна', genplan: 'Генплан' },
    ppm: 'Цена за м²', perM2: 'за м²', or: 'или', project: 'Проект', block: 'Корпус', floor: 'Этаж', number: 'Номер', area: 'Площадь', ready: 'Срок сдачи', sea: 'До моря', place: 'Район', article: 'Артикул',
    params: 'Параметры квартиры', call: 'Заказать звонок', steps: 'Этапы покупки', stepsSub: 'Из чего состоит сделка', consult: 'Получить консультацию', pdf: 'Скачать PDF',
    stepList: [
      ['Выбор и бронирование', 'Выбираете квартиру, вносите депозит — квартира снимается с продажи.'],
      ['Договор с застройщиком', 'Подписываем договор купли-продажи; юрист проверяет документы проекта и условия.'],
      ['Оплата', '100% сразу или первый взнос и рассрочка по графику застройщика.'],
      ['Строительство', 'Мы на связи и присылаем отчёты о ходе стройки.'],
      ['Сдача и ТАПУ', 'Принимаете квартиру и получаете свидетельство о собственности (ТАПУ).'],
    ],
    buy: 'Способы покупки', full: '100% оплата', fullText: 'Оплата всей суммы сразу — самый простой и выгодный способ купить квартиру.',
    inst: 'Рассрочка от застройщика', instText: 'Первый взнос и беспроцентная рассрочка по графику застройщика.',
    instShort: (p, m) => `Первый взнос ${p}%${m ? `, беспроцентная рассрочка на ${m} мес.` : ', остаток — в рассрочку.'}`,
    promo: 'Акции и скидки', request: 'Оставить заявку', gallery: 'Галерея', about: 'Об этой квартире', readMore: 'Читать далее', less: 'Свернуть',
    allIn: (p) => `Все квартиры в ${p}`,
    ground: 'цокольный', floorOf: (f, top) => `${f} из ${top}`,
    floorAlt: (f, b) => `План этажа ${f ?? ''}${b ? `, корпус ${b}` : ''}`, toGenplan: 'Открыть генплан проекта',
    floorPlan: 'План этажа', view: 'Вид из окна', genplan: 'Генплан', price: 'Цена', siteLink: 'Смотреть квартиру на сайте',
    disclaimer: 'Информация носит справочный характер и не является публичной офертой. Цены и наличие уточняйте у менеджера.',
  },
  en: {
    tabs: { plan: 'Layout', floor: 'Floor plan', view: 'Window view', genplan: 'Site plan' },
    ppm: 'Price per m²', perM2: 'per m²', or: 'or', project: 'Project', block: 'Building', floor: 'Floor', number: 'Unit no.', area: 'Area', ready: 'Completion', sea: 'To the sea', place: 'Location', article: 'Ref.',
    params: 'Apartment details', call: 'Request a call', steps: 'Buying steps', stepsSub: 'How the deal works', consult: 'Get a consultation', pdf: 'Download PDF',
    stepList: [
      ['Choose and reserve', 'Pick an apartment and pay a deposit — it is taken off the market.'],
      ['Contract with the developer', 'We sign the sale contract; a lawyer checks the project documents and terms.'],
      ['Payment', 'Pay 100% at once, or a down payment plus the developer’s instalment plan.'],
      ['Construction', 'We keep in touch and send construction progress reports.'],
      ['Handover and TAPU', 'Accept the apartment and receive the title deed (TAPU).'],
    ],
    buy: 'Ways to buy', full: '100% payment', fullText: 'Pay the full amount at once — the simplest and best-priced way to buy.',
    inst: 'Developer instalments', instText: 'Down payment and an interest-free instalment plan from the developer.',
    instShort: (p, m) => `Down payment ${p}%${m ? `, interest-free instalments for ${m} months.` : ', the rest in instalments.'}`,
    promo: 'Offers', request: 'Send a request', gallery: 'Gallery', about: 'About this apartment', readMore: 'Read more', less: 'Show less',
    allIn: (p) => `All apartments in ${p}`,
    ground: 'ground', floorOf: (f, top) => `${f} of ${top}`,
    floorAlt: (f, b) => `Floor ${f ?? ''} plan${b ? `, building ${b}` : ''}`, toGenplan: 'Open the project site plan',
    floorPlan: 'Floor plan', view: 'Window view', genplan: 'Site plan', price: 'Price', siteLink: 'View the apartment online',
    disclaimer: 'For information only, not a public offer. Please check prices and availability with our manager.',
  },
};

export interface FlatFacts { rooms: string | null; area: string | null; block: string | null; project: string; place: string; floor: number | null; top: number | null; sea: number | null; ready: string | null; type: string }

/** «Об этой квартире» — как у образца: корпус, проект, этажность, этаж, площадь, до моря, срок сдачи. */
export function flatText(lang: Lang, f: FlatFacts): string {
  const n = (v: number) => v.toLocaleString(lang === 'sr' ? 'sr-Latn' : lang);
  if (lang === 'ru') {
    return [
      `${f.type}${f.rooms ? ` ${f.rooms}` : ''} находится ${f.block ? `в корпусе ${f.block} ` : 'в '}проекта ${f.project} (${f.place}).`,
      f.top ? `В ${f.block ? 'корпусе' : 'доме'} ${f.top} ${pluralL('ru', f.top, ['этаж', 'этажа', 'этажей'])}${f.floor != null ? `, квартира на ${f.floor === 0 ? 'цокольном' : `${f.floor}`} этаже` : ''}.` : f.floor != null ? `Квартира на ${f.floor} этаже.` : '',
      f.area ? `Площадь — ${f.area} м².` : '',
      f.sea ? `До моря — ${n(f.sea)} м.` : '',
      f.ready ? `Срок сдачи — ${f.ready}.` : '',
    ].filter(Boolean).join(' ');
  }
  return [
    `This ${f.rooms ? `${f.rooms} ` : ''}apartment is ${f.block ? `in building ${f.block} of ` : 'in '}${f.project} (${f.place}).`,
    f.top ? `The building has ${f.top} floors${f.floor != null ? `; the apartment is on floor ${f.floor}` : ''}.` : f.floor != null ? `The apartment is on floor ${f.floor}.` : '',
    f.area ? `Area: ${f.area} m².` : '',
    f.sea ? `Distance to the sea: ${n(f.sea)} m.` : '',
    f.ready ? `Completion: ${f.ready}.` : '',
  ].filter(Boolean).join(' ');
}
