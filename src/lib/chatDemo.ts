/**
 * Демо-режим чата: пока не подключён ключ ИИ, Доми отвечает без нейросети —
 * простым поиском по базе по словам из вопроса и заготовленными ответами.
 */
import { extractCards, runTool, type Seen } from './chatTools';
import type { ChatReply } from './chatAgent';
import { INTL, type Lang } from '../i18n/config';
import { localizeHref } from './legacy';

const CITIES: [RegExp, string][] = [
  [/алань|alany|alanj/i, 'Аланья'],
  [/анталь|antaly|antalj/i, 'Анталья'],
  [/мерсин|mersin/i, 'Мерсин'],
  [/стамбул|istanbul|i̇stanbul/i, 'Стамбул (Европа)'],
];

type Texts = { prive: string; installment: string; hello: string; note: string; none: string; found: (n: string) => string; all: (rent: boolean, href: string) => string };

const TX: Record<Lang, (h: (p: string) => string) => Texts> = {
  ru: (h) => ({
    prive: `**PRIVE** — закрытые проекты Stay: лоты, которых нет в открытой продаже, с особыми условиями для своих клиентов. Посмотреть их можно в разделе [PRIVE](${h('/prive')}), а подробности расскажет менеджер.`,
    installment: `Да, во многих проектах есть **рассрочка от застройщика**. Первый взнос и срок зависят от проекта: условия указаны на страницах [проектов Stay](${h('/complex')}), а менеджер пришлёт расчёт под ваш бюджет.`,
    hello: 'Я могу подобрать квартиру по бюджету, городу и планировке. Например, напишите: «2+1 в Аланье до 200 000 €» или «квартиры под гражданство».',
    note: '\n\n_Я пока работаю в демо-режиме: скоро меня подключат к ИИ, и я смогу отвечать на любые вопросы._',
    none: 'По таким условиям в базе сейчас ничего нет. Попробуйте поднять бюджет или выбрать другой район — или напишите менеджеру, он найдёт варианты вне сайта.',
    found: (n) => `Подходящих вариантов: **${n}**. Вот самые доступные:`,
    all: (rent, href) => `Все варианты — в разделе [${rent ? 'аренда' : 'продажа'}](${href}).`,
  }),
  en: (h) => ({
    prive: `**PRIVE** are Stay’s closed projects: units that are not on open sale, with special terms for our clients. You can see them in the [PRIVE](${h('/prive')}) section, and a manager will tell you more.`,
    installment: `Yes, many projects offer a **developer instalment plan**. The down payment and term depend on the project: see the terms on the [Stay projects](${h('/complex')}) pages, and a manager will send a calculation for your budget.`,
    hello: 'I can find an apartment by budget, city and layout. For example, write: “2+1 in Alanya under €200,000” or “property for citizenship”.',
    note: '\n\n_I am running in demo mode for now: soon I will be connected to AI and able to answer any question._',
    none: 'Nothing in our database matches these terms right now. Try a higher budget or another district, or message a manager who can find options that are not on the site.',
    found: (n) => `Matching options: **${n}**. Here are the most affordable:`,
    all: (rent, href) => `See all options in the [${rent ? 'rentals' : 'for sale'}](${href}) section.`,
  }),
  tr: (h) => ({
    prive: `**PRIVE**, Stay’in kapalı projeleridir: açık satışta olmayan, müşterilerimize özel koşullu daireler. [PRIVE](${h('/prive')}) bölümünde görebilirsiniz, ayrıntıları danışmanımız anlatır.`,
    installment: `Evet, birçok projede **müteahhitten taksit** imkânı var. Peşinat ve vade projeye göre değişir: koşullar [Stay projeleri](${h('/complex')}) sayfalarında yer alır, danışmanımız bütçenize göre hesap gönderir.`,
    hello: 'Bütçe, şehir ve oda sayısına göre daire bulabilirim. Örneğin şunu yazın: «Alanya’da 200.000 €’ya kadar 2+1» veya «vatandaşlığa uygun daireler».',
    note: '\n\n_Şu an demo modunda çalışıyorum: yakında yapay zekâya bağlanacağım ve her soruyu yanıtlayabileceğim._',
    none: 'Bu koşullara uygun ilan şu an yok. Bütçeyi artırmayı veya başka bir bölge seçmeyi deneyin ya da danışmana yazın, sitede olmayan seçenekleri bulsun.',
    found: (n) => `Uygun seçenek: **${n}**. En uygun fiyatlılar:`,
    all: (rent, href) => `Tüm seçenekler [${rent ? 'kiralık' : 'satılık'}](${href}) bölümünde.`,
  }),
  de: (h) => ({
    prive: `**PRIVE** sind die geschlossenen Projekte von Stay: Einheiten, die nicht frei verkauft werden, mit Sonderkonditionen für unsere Kunden. Sie finden sie im Bereich [PRIVE](${h('/prive')}); Details erklärt Ihnen ein Berater.`,
    installment: `Ja, viele Projekte bieten **Ratenzahlung direkt beim Bauträger**. Anzahlung und Laufzeit hängen vom Projekt ab: Die Konditionen stehen auf den Seiten der [Stay-Projekte](${h('/complex')}), und ein Berater schickt Ihnen eine Berechnung für Ihr Budget.`,
    hello: 'Ich finde eine Wohnung nach Budget, Stadt und Grundriss. Schreiben Sie zum Beispiel: „2+1 in Alanya bis 200.000 €“ oder „Immobilien für die Staatsbürgerschaft“.',
    note: '\n\n_Ich laufe gerade im Demo-Modus: Bald werde ich mit der KI verbunden und kann jede Frage beantworten._',
    none: 'Zu diesen Kriterien gibt es aktuell nichts in unserer Datenbank. Erhöhen Sie das Budget, wählen Sie eine andere Lage oder schreiben Sie einem Berater, der auch Angebote außerhalb der Website findet.',
    found: (n) => `Passende Angebote: **${n}**. Hier die günstigsten:`,
    all: (rent, href) => `Alle Angebote finden Sie unter [${rent ? 'Miete' : 'Kauf'}](${href}).`,
  }),
  sr: (h) => ({
    prive: `**PRIVE** su zatvoreni projekti kompanije Stay: jedinice koje nisu u slobodnoj prodaji, sa posebnim uslovima za naše klijente. Možete ih videti u odeljku [PRIVE](${h('/prive')}), a detalje će vam reći menadžer.`,
    installment: `Da, mnogi projekti nude **plaćanje na rate kod investitora**. Učešće i rok zavise od projekta: uslovi su na stranicama [Stay projekata](${h('/complex')}), a menadžer će vam poslati obračun za vaš budžet.`,
    hello: 'Mogu da pronađem stan prema budžetu, gradu i strukturi. Na primer, napišite: „2+1 u Alanji do 200.000 €“ ili „nekretnine za državljanstvo“.',
    note: '\n\n_Trenutno radim u demo režimu: uskoro ću biti povezan sa AI i moći ću da odgovorim na svako pitanje._',
    none: 'Trenutno nema ničega u bazi po ovim uslovima. Probajte veći budžet ili drugi deo grada, ili pišite menadžeru koji će naći ponude van sajta.',
    found: (n) => `Odgovarajućih ponuda: **${n}**. Evo najpovoljnijih:`,
    all: (rent, href) => `Sve ponude su u odeljku [${rent ? 'izdavanje' : 'prodaja'}](${href}).`,
  }),
};

export async function demoReply(text: string, lang: Lang = 'ru'): Promise<ChatReply> {
  const t = text.toLowerCase();
  const seen: Seen = { listings: new Map(), projects: new Map(), lang };
  const tx = TX[lang]((p) => localizeHref(lang, p));
  const note = tx.note;

  const PRIVE = /prive|(^|[^а-яё])прив[еэ]([^а-яёт]|$)/i;
  const WANT = /квартир|лот|подбер|найд|покаж|до\s*\d|apartment|flat|find|show|under\s*€?\s*\d|daire|bul|göster|wohnung|such|zeig|bis\s*\d|stan|nađi|nadji|pokaž|do\s*\d/i;
  if (PRIVE.test(t) && !WANT.test(t)) return { text: tx.prive + note, cards: [] };
  if (/рассроч|ипотек|кредит|instal|mortgage|loan|taksit|kredi|ipotek|raten|hypothek|finanz|rate|kredit/i.test(t)) return { text: tx.installment + note, cards: [] };

  const input: Record<string, unknown> = { limit: 8, sort: 'price-asc' };
  const flat = t.replace(/[\s.,]/g, '');
  const price = flat.match(/(?:до|under|upto|below|max|kadar|bis|unter|do)€?(\d{2,7})(к|k|тыс|bin|000)?/);
  const priceTr = flat.match(/(\d{2,7})(bin|k)?(?:€|euro|eur)?'?(?:y?[ae])?kadar/);
  if (price) input.price_to = Number(price[1]) * (price[2] ? 1000 : 1);
  else if (priceTr) input.price_to = Number(priceTr[1]) * (priceTr[2] ? 1000 : 1);
  const rooms = t.match(/\b([1-4])\s*\+\s*1\b/);
  if (rooms) input.rooms = [rooms[1] === '4' ? '4+' : `${rooms[1]}+1`];
  if (/студи|studio|stüdyo|studi|garsonjer/i.test(t)) input.rooms = ['studio'];
  if (/квартир|апартамент|apartment|flat|daire|wohnung|\bstan/i.test(t)) input.type = 'apartments';
  if (/вилл|villa|vila/i.test(t)) input.type = 'villas';
  if (/аренд|снять|rent|kira|miet|izdavanj|zakup/i.test(t)) input.operation = 'rental';
  if (/гражданств|citizenship|vatandaş|staatsbürger|državljanst/i.test(t)) input.citizenship = true;
  if (PRIVE.test(t)) input.prive = true;
  if (/мор|sea|deniz|meer|mor[ae]/i.test(t)) input.sea_to = 1000;
  for (const [re, city] of CITIES) if (re.test(t)) input.city = city;

  const asked = Object.keys(input).length > 2 || WANT.test(t) || /купить|объект|buy|property|satın|kaufen|immobil|kupi|nekretnin/i.test(t);
  if (!asked) return { text: tx.hello + note, cards: [] };

  // Нижняя граница цены: без «цены по запросу» (при сортировке по цене они идут первыми)
  // и без попавших в продажу объектов аренды с ценой за месяц.
  input.price_from = input.operation === 'rental' ? 1 : 20000;
  let r: any = await runTool('search_listings', input, seen).catch(() => null);
  if (r && !r.total_found && input.sea_to) {
    delete input.sea_to;
    r = await runTool('search_listings', input, seen).catch(() => null);
  }
  if (!r || !r.total_found) return { text: tx.none + note, cards: [] };
  const rent = input.operation === 'rental';
  // «Самые доступные» — только с ценой; объекты «цена по запросу» в конец.
  const shown = [...r.items.filter((x: any) => x.price_eur), ...r.items.filter((x: any) => !x.price_eur)].slice(0, 4);
  const body = `${tx.found(r.total_found.toLocaleString(INTL[lang]))}\n\n${shown.map((x: any) => `[[obj:${x.id}]]`).join('\n')}\n\n${tx.all(rent, localizeHref(lang, rent ? '/rental' : '/sale'))}`;
  return extractCards(body + note, seen);
}
