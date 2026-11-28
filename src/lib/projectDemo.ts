/**
 * Демо-проект для превью Vercel (Anuar 28.11.2026: «для демо пусть будет один проект максимально заполненный»).
 * Работает ТОЛЬКО на превью (VERCEL_ENV=preview) и только если у ЖК нет своей «Страницы проекта» в админке.
 * Фото — из квартир самого ЖК, PDF — карточки квартир (/api/flat-pdf/…), тексты — тестовые.
 * На боевом сайте не используется.
 */
import type { PhotoCat, ProjectPage } from './projectPages';

export const DEMO_CODE = 'exodus_twins_residence';
/** Видео компании (с «О компании») — пример для вкладки «Видео». */
export const DEMO_VIDEO = 'mCCWFJYVTUw';

const ym = (back: number, now = new Date()) => {
  const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const ymd = (back: number, now = new Date()) => new Date(now.getTime() - back * 86_400_000).toISOString().slice(0, 10);

export function demoPage(photos: string[], flatIds: string[], hero: string | null): ProjectPage {
  const ph = photos.length ? photos : hero ? [hero] : [];
  const at = (i: number) => ph[i % Math.max(ph.length, 1)] ?? '';
  const cats: PhotoCat[] = ['territory', 'infra', 'interior', 'view'];
  const pdf = (i: number) => (flatIds.length ? `/api/flat-pdf/${encodeURIComponent(flatIds[i % flatIds.length])}?lang=ru` : '');
  const until = ymd(-30);
  return {
    subtitle: { ru: 'Две башни у моря в Махмутларе: бассейны, спа и закрытая территория', en: 'Twin towers by the sea in Mahmutlar: pools, spa and a gated site' },
    promos: [
      { title: { ru: 'Скидка 7% при 100% оплате', en: '7% off with full payment' }, text: { ru: 'При единовременной оплате квартиры — скидка 7% от цены в прайсе. Акция действует на все планировки.', en: 'Pay in full and get 7% off the list price. Valid for all layouts.' }, until, image: at(0) },
      { title: { ru: 'Рассрочка 0% на 24 месяца', en: '0% installments for 24 months' }, text: { ru: 'Первый взнос от 40%, остаток равными платежами без процентов до сдачи дома.', en: 'Down payment from 40%, the rest in equal interest-free payments until completion.' }, until: '', image: at(1) },
    ],
    installment: { down: 40, months: 24, text: { ru: 'Без процентов, платежи раз в месяц или раз в квартал.', en: 'Interest-free, monthly or quarterly payments.' } },
    tourUrl: 'https://my.matterport.com/show/?m=SxQL3iGyoDo',
    liveUrl: 'https://www.youtube.com/watch?v=' + DEMO_VIDEO,
    formImage: hero ?? at(2),
    photos: ph.slice(0, 16).map((src, i) => ({ src, cat: cats[i % cats.length] })),
    docs: [
      { tab: 'pres', title: { ru: 'Презентация проекта', en: 'Project presentation' }, file: pdf(0), cover: at(3) },
      { tab: 'plans', title: { ru: 'Планировки 1+1', en: '1+1 floor plans' }, file: pdf(1), cover: at(4) },
      { tab: 'plans', title: { ru: 'Планировки 2+1', en: '2+1 floor plans' }, file: pdf(2), cover: at(5) },
      { tab: 'docs', title: { ru: 'Разрешение на строительство', en: 'Building permit' }, file: pdf(3), cover: '' },
      { tab: 'docs', title: { ru: 'Договор купли-продажи (образец)', en: 'Sales contract (sample)' }, file: pdf(4), cover: '' },
    ].filter((d) => d.file) as ProjectPage['docs'],
    progress: [
      { month: ym(0), photos: [at(6), at(7), at(8)], text: { ru: 'Идёт отделка фасада второй башни, в первой башне ставят окна.', en: 'Facade works on the second tower; windows going into the first.' } },
      { month: ym(1), photos: [at(9), at(10), at(11)], text: { ru: 'Завершён каркас 14-го этажа, начата кладка стен.', en: 'Frame of the 14th floor completed, masonry started.' } },
      { month: ym(3), photos: [at(12), at(13)], text: { ru: 'Залита плита перекрытия 10-го этажа.', en: 'Slab of the 10th floor poured.' } },
      { month: ym(6), photos: [at(14), at(15), at(16)], text: { ru: 'Каркас поднялся до 6-го этажа.', en: 'Frame up to the 6th floor.' } },
      { month: ym(12), photos: [at(17), at(18)], text: { ru: 'Готов фундамент и подземный паркинг.', en: 'Foundation and underground parking completed.' } },
      { month: ym(22), photos: [at(1), at(2)], text: { ru: 'Начало работ: котлован и сваи.', en: 'Start of works: excavation and piles.' } },
    ],
    news: [
      { date: ymd(5), title: { ru: 'Открыли шоурум с отделкой квартир', en: 'Showroom with finished apartments opened' }, text: { ru: 'На территории комплекса открыт шоурум: можно посмотреть отделку, кухню и сантехнику, которые будут в квартирах. Запишитесь на показ у менеджера — покажем вживую или по видеосвязи. Шоурум работает ежедневно с 10 до 18 часов.', en: 'A showroom is now open on site: see the finishing, kitchen and bathroom fittings that come with the apartments. Book a viewing with your manager, in person or by video call.' }, image: at(3) },
      { date: ymd(26), title: { ru: 'Получено разрешение на второй этап', en: 'Permit for phase two received' }, text: { ru: 'Застройщик получил разрешение на строительство второй башни. Старт продаж квартир второго этапа — по ценам первого этапа.', en: 'The developer has received the permit for the second tower. Phase two sales start at phase one prices.' }, image: at(5) },
      { date: ymd(60), title: { ru: 'Завершён каркас первой башни', en: 'First tower frame completed' }, text: { ru: 'Строительство идёт по графику: каркас первой башни готов, начаты фасадные работы.', en: 'Construction is on schedule: the first tower frame is complete and facade works have begun.' }, image: at(7) },
    ],
  };
}
