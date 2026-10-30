/**
 * Доми на языке страницы: тексты виджета, приветствие, ответы демо-режима и ссылки.
 * Язык берётся из префикса URL страницы, где открыт чат (/ru/, /en/, /tr/, /de/, /sr/).
 */
import { INTL, isLang, type Lang } from '../i18n/config';
import { legacyRedirect, localizeHref } from './legacy';

export const chatLang = (v: unknown): Lang => (isLang(v) ? v : 'ru');

/** Имя по умолчанию: кириллицей только на русском. Своё имя из админки не трогаем. */
export const chatName = (lang: Lang, name: string) => (name === 'Доми' && lang !== 'ru' ? 'Domi' : name);

export interface ChatUi {
  open: string; hintClose: string; hint: (name: string) => string; subtitle: string; reset: string; close: string;
  suggest: string[]; message: string; placeholder: string; send: string; manager: string; disclaimer: string;
  typing: string; unavailable: string; tooMany: string; waText: string;
}

export const CHAT_UI: Record<Lang, ChatUi> = {
  ru: {
    open: 'Открыть ИИ-помощника', hintClose: 'Скрыть', hint: (n) => `Привет! Я ${n}. Помочь подобрать квартиру?`,
    subtitle: 'ИИ-помощник Stay Property · онлайн', reset: 'Начать заново', close: 'Закрыть чат',
    suggest: ['Квартира у моря до 150 000 €', 'Квартиры под гражданство', 'Что такое PRIVE?', 'Можно в рассрочку?'],
    message: 'Сообщение', placeholder: 'Спросите что угодно о недвижимости…', send: 'Отправить',
    manager: 'Связаться с менеджером', disclaimer: 'ИИ может ошибаться — цены уточняйте у менеджера', typing: 'Печатает',
    unavailable: 'Помощник сейчас недоступен. Напишите нам в WhatsApp — ответим быстро.',
    tooMany: 'Слишком много сообщений. Попробуйте через несколько минут.', waText: 'Здравствуйте! Пишу с сайта stay.com.tr',
  },
  en: {
    open: 'Open the AI assistant', hintClose: 'Hide', hint: (n) => `Hi! I'm ${n}. Can I help you find a home?`,
    subtitle: 'Stay Property AI assistant · online', reset: 'Start over', close: 'Close chat',
    suggest: ['Sea-view flat under €150,000', 'Property for citizenship', 'What is PRIVE?', 'Can I pay in instalments?'],
    message: 'Message', placeholder: 'Ask anything about property…', send: 'Send',
    manager: 'Contact a manager', disclaimer: 'AI can make mistakes — please confirm prices with a manager', typing: 'Typing',
    unavailable: 'The assistant is unavailable right now. Message us on WhatsApp and we will reply quickly.',
    tooMany: 'Too many messages. Please try again in a few minutes.', waText: 'Hello! I am writing from stay.com.tr',
  },
  tr: {
    open: 'Yapay zekâ asistanını aç', hintClose: 'Gizle', hint: (n) => `Merhaba! Ben ${n}. Ev bulmanıza yardım edeyim mi?`,
    subtitle: 'Stay Property yapay zekâ asistanı · çevrimiçi', reset: 'Baştan başla', close: 'Sohbeti kapat',
    suggest: ['Denize yakın, 150.000 €’ya kadar daire', 'Vatandaşlığa uygun daireler', 'PRIVE nedir?', 'Taksitle alabilir miyim?'],
    message: 'Mesaj', placeholder: 'Gayrimenkul hakkında her şeyi sorun…', send: 'Gönder',
    manager: 'Danışmanla iletişime geç', disclaimer: 'Yapay zekâ hata yapabilir — fiyatları danışmanla teyit edin', typing: 'Yazıyor',
    unavailable: 'Asistan şu anda kullanılamıyor. Bize WhatsApp’tan yazın, hızla yanıt verelim.',
    tooMany: 'Çok fazla mesaj. Lütfen birkaç dakika sonra tekrar deneyin.', waText: 'Merhaba! stay.com.tr sitesinden yazıyorum',
  },
  de: {
    open: 'KI-Assistenten öffnen', hintClose: 'Ausblenden', hint: (n) => `Hallo! Ich bin ${n}. Soll ich Ihnen bei der Suche helfen?`,
    subtitle: 'KI-Assistent von Stay Property · online', reset: 'Neu beginnen', close: 'Chat schließen',
    suggest: ['Wohnung am Meer bis 150.000 €', 'Immobilien für die Staatsbürgerschaft', 'Was ist PRIVE?', 'Ist Ratenzahlung möglich?'],
    message: 'Nachricht', placeholder: 'Fragen Sie alles rund um Immobilien…', send: 'Senden',
    manager: 'Berater kontaktieren', disclaimer: 'KI kann sich irren — Preise bitte beim Berater bestätigen', typing: 'Schreibt',
    unavailable: 'Der Assistent ist gerade nicht erreichbar. Schreiben Sie uns auf WhatsApp, wir antworten schnell.',
    tooMany: 'Zu viele Nachrichten. Bitte versuchen Sie es in ein paar Minuten erneut.', waText: 'Hallo! Ich schreibe von stay.com.tr',
  },
  sr: {
    open: 'Otvori AI asistenta', hintClose: 'Sakrij', hint: (n) => `Zdravo! Ja sam ${n}. Da vam pomognem da nađete stan?`,
    subtitle: 'AI asistent Stay Property · na mreži', reset: 'Počni ispočetka', close: 'Zatvori čet',
    suggest: ['Stan blizu mora do 150.000 €', 'Nekretnine za državljanstvo', 'Šta je PRIVE?', 'Da li je moguća kupovina na rate?'],
    message: 'Poruka', placeholder: 'Pitajte bilo šta o nekretninama…', send: 'Pošalji',
    manager: 'Kontaktiraj menadžera', disclaimer: 'AI može da pogreši — cene proverite sa menadžerom', typing: 'Kuca',
    unavailable: 'Asistent trenutno nije dostupan. Pišite nam na WhatsApp, brzo odgovaramo.',
    tooMany: 'Previše poruka. Pokušajte ponovo za nekoliko minuta.', waText: 'Zdravo! Pišem sa sajta stay.com.tr',
  },
};

const GREETING: Record<Lang, (n: string) => string> = {
  ru: (n) => `Привет! Я ${n}, домик-помощник Stay Property. Подберу квартиру или виллу в Турции, расскажу про районы, рассрочку и ВНЖ. С чего начнём?`,
  en: (n) => `Hi! I'm ${n}, the Stay Property helper. I can find you an apartment or villa in Turkey and explain districts, instalments and residence permits. Where shall we start?`,
  tr: (n) => `Merhaba! Ben ${n}, Stay Property asistanıyım. Türkiye’de daire veya villa bulur; bölgeler, taksit ve oturma izni hakkında bilgi veririm. Nereden başlayalım?`,
  de: (n) => `Hallo! Ich bin ${n}, der Assistent von Stay Property. Ich finde für Sie eine Wohnung oder Villa in der Türkei und erkläre Lagen, Ratenzahlung und Aufenthaltserlaubnis. Womit fangen wir an?`,
  sr: (n) => `Zdravo! Ja sam ${n}, asistent kompanije Stay Property. Pronaći ću vam stan ili vilu u Turskoj i objasniti delove grada, plaćanje na rate i boravišnu dozvolu. Odakle da počnemo?`,
};

/** Приветствие: на русском — из админки, на остальных языках — встроенное. */
export const chatGreeting = (lang: Lang, name: string, adminGreeting: string) => (lang === 'ru' ? adminGreeting : GREETING[lang](name));

export const LANG_FULL: Record<Lang, string> = { ru: 'русский', en: 'английский (English)', tr: 'турецкий (Türkçe)', de: 'немецкий (Deutsch)', sr: 'сербский, латиница (Srpski)' };

/** Слова на карточках объектов. */
export const CARD_WORDS: Record<Lang, { onRequest: string; from: string; m2: string }> = {
  ru: { onRequest: 'цена по запросу', from: 'от', m2: 'м²' },
  en: { onRequest: 'price on request', from: 'from', m2: 'm²' },
  tr: { onRequest: 'fiyat sorunuz', from: 'başlangıç', m2: 'm²' },
  de: { onRequest: 'Preis auf Anfrage', from: 'ab', m2: 'm²' },
  sr: { onRequest: 'cena na upit', from: 'od', m2: 'm²' },
};

export const eurL = (lang: Lang, n: number | null | undefined) =>
  n ? new Intl.NumberFormat(INTL[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n)) : CARD_WORDS[lang].onRequest;

/** Любая ссылка сайта (старая /sale/123, /uslugi/…, или уже /ru/…) → адрес на языке страницы. */
export async function chatHref(lang: Lang, href: string): Promise<string> {
  if (!href.startsWith('/')) return href;
  const swap = (u: string) => u.replace(/^\/(ru|en|tr|de|sr)(?=\/)/, `/${lang}`);
  if (/^\/(ru|en|tr|de|sr)\//.test(href) && !/^\/ru\/news\//.test(href)) return swap(href);
  const [path, q = ''] = href.split('?');
  const to = await legacyRedirect(path, new URLSearchParams(q)).catch(() => null);
  return to ? swap(to) : localizeHref(lang, href);
}

/** Переписывает ссылки в тексте ответа ([текст](/путь) и голые /пути) на язык страницы. */
export async function localizeLinks(lang: Lang, text: string): Promise<string> {
  const found = new Set<string>();
  for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) found.add(m[1]);
  for (const m of text.matchAll(/(^|\s)(\/(?:sale|rental|complex|prive|about|uslugi|ru\/news)\/[\w\-/]*)/g)) found.add(m[2]);
  if (!found.size) return text;
  const map = new Map<string, string>();
  await Promise.all([...found].map(async (h) => map.set(h, await chatHref(lang, h))));
  return text
    .replace(/\]\((\/[^)\s]*)\)/g, (_, h) => `](${map.get(h) ?? h})`)
    .replace(/(^|\s)(\/(?:sale|rental|complex|prive|about|uslugi|ru\/news)\/[\w\-/]*)/g, (_, sp, h) => `${sp}${map.get(h) ?? h}`);
}
