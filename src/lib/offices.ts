/**
 * Офисы Stay Property — со страницы stayproperty.com/contacts/ (Anuar 25.11.2026: «возьми всю информацию с нашего сайта»).
 * Фото офисов и флаги скачаны оттуда же и лежат у нас: public/contacts/.
 * У Северного Кипра и Дубая на stayproperty.com стоит общее фото команды у офиса в Алании — повторяем.
 */
import type { Lang } from '../i18n/config';

type T5 = Record<Lang, string>;
export interface Office {
  id: string;
  city: T5;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  year: number;
  photo?: string;
  flag: string;
  main?: boolean;
  /** Мессенджер для турецких номеров. */
  wa?: string;
}

export const OFFICES: Office[] = [
  { id: 'alanya', main: true, city: { ru: 'Аланья', en: 'Alanya', tr: 'Alanya', de: 'Alanya', sr: 'Alanja' },
    address: 'Oba Mah., Mesut Cad., No: 54 – 07400 Alanya / Antalya / Turkey', phone: '+90-530-178-29-16', email: 'office@stayproperty.com',
    lat: 36.538139782455, lng: 32.039380373016, year: 2014, photo: '/contacts/alanya.webp', flag: 'tr', wa: '905301782916' },
  { id: 'istanbul', city: { ru: 'Стамбул', en: 'Istanbul', tr: 'İstanbul', de: 'Istanbul', sr: 'Istanbul' },
    address: 'Mahmut bey mah., Taşocağı yolu cad. Balance Rezidance No: 19/7 C blok kat 17 daire 50 - Bağcılar / İstanbul', phone: '+90-530-178-29-16', email: 'office@staypropertyistanbul.com',
    lat: 41.052686681311, lng: 28.810971185166, year: 2022, photo: '/contacts/istanbul.webp', flag: 'tr', wa: '905301782916' },
  { id: 'moscow', city: { ru: 'Москва', en: 'Moscow', tr: 'Moskova', de: 'Moskau', sr: 'Moskva' },
    address: 'Россия, г. Москва, ул. 3-я Ямского поля, д. 9, корп. 6, офис 101', phone: '+7-499-350-8099', email: 'msk@staypropertymoscow.com',
    lat: 55.780890103158, lng: 37.58089104102, year: 2021, photo: '/contacts/moscow.webp', flag: 'ru' },
  { id: 'almaty', city: { ru: 'Алматы', en: 'Almaty', tr: 'Almatı', de: 'Almaty', sr: 'Almati' },
    address: 'Казахстан, г. Алматы, проспект Достык, 210, бизнес-центр Koktem Grand, 1 эт.', phone: '+7-727-312-27-06', email: 'office@staypropertykz.com',
    lat: 43.229920246659, lng: 76.96101067694, year: 2022, photo: '/contacts/almaty.webp', flag: 'kz' },
  { id: 'cyprus', city: { ru: 'Северный Кипр', en: 'Northern Cyprus', tr: 'Kuzey Kıbrıs', de: 'Nordzypern', sr: 'Severni Kipar' },
    address: 'Beşparmaklar Caddesi Mazlum Plaza No: 44 ofis 4 - Çatalköy / Kuzey Kıbrıs', phone: '+90-530-178-29-16', email: 'office@stayproperty.com',
    lat: 35.315875, lng: 33.404182, year: 2023, photo: '/contacts/alanya.webp', flag: 'cy', wa: '905301782916' },
  { id: 'konya', city: { ru: 'Конья', en: 'Konya', tr: 'Konya', de: 'Konya', sr: 'Konja' },
    address: 'Melikşah, Sivaslı Ali Kemal Cd. No:70, 42090 Meram/Konya, Türkiye', phone: '+90-530-528-78-29', email: 'office@stayproperty.com',
    lat: 37.8769944, lng: 32.459432, year: 2026, photo: '/contacts/konya.webp', flag: 'tr', wa: '905305287829' },
  { id: 'dubai', city: { ru: 'Дубай', en: 'Dubai', tr: 'Dubai', de: 'Dubai', sr: 'Dubai' },
    address: 'ОАЭ, Дубай, Бизнес-Бэй, Bayswater Tower, офис 1311', phone: '+971-55-591-29-76', email: 'office@stayproperty.com',
    lat: 25.229762, lng: 55.289311, year: 2023, photo: '/contacts/alanya.webp', flag: 'ae' },
];

/** Скоро: Лондон (на stayproperty.com — «Новый офис в Лондоне. Скоро...»). */
export const SOON = { city: { ru: 'Лондон', en: 'London', tr: 'Londra', de: 'London', sr: 'London' } as T5, phone: '+90-530-178-29-16', email: 'office@stayproperty.com', flag: 'gb' };

export const telHref = (p: string) => `tel:+${p.replace(/\D/g, '')}`;
export const small = (src: string) => src.replace(/\.webp$/, '-700.webp');
