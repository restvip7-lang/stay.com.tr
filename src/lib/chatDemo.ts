/**
 * Демо-режим чата: пока не подключён ключ ИИ, Доми отвечает без нейросети —
 * простым поиском по базе по словам из вопроса и заготовленными ответами.
 */
import { extractCards, runTool, type Seen } from './chatTools';
import type { ChatReply } from './chatAgent';

const CITIES: [RegExp, string][] = [
  [/алань|alany/i, 'Аланья'],
  [/анталь|antaly/i, 'Анталья'],
  [/мерсин|mersin/i, 'Мерсин'],
  [/стамбул|istanbul/i, 'Стамбул (Европа)'],
];

const PRIVE_INFO = '**PRIVE** — закрытые проекты Stay: лоты, которых нет в открытой продаже, с особыми условиями для своих клиентов. Посмотреть их можно в разделе [PRIVE](/prive/), а подробности расскажет менеджер.';
const INSTALLMENT = 'Да, во многих проектах есть **рассрочка от застройщика**. Первый взнос и срок зависят от проекта: условия указаны на страницах [проектов Stay](/complex/), а менеджер пришлёт расчёт под ваш бюджет.';
const HELLO = 'Я могу подобрать квартиру по бюджету, городу и планировке. Например, напишите: «2+1 в Аланье до 200 000 €» или «квартиры под гражданство».';

export async function demoReply(text: string): Promise<ChatReply> {
  const t = text.toLowerCase();
  const seen: Seen = { listings: new Map(), projects: new Map() };
  const note = '\n\n_Я пока работаю в демо-режиме: скоро меня подключат к ИИ, и я смогу отвечать на любые вопросы._';

  if (/prive|(^|[^а-яё])прив[еэ]([^а-яёт]|$)/i.test(t) && !/квартир|лот|подбер|найд|покаж|до\s*\d/i.test(t)) return { text: PRIVE_INFO + note, cards: [] };
  if (/рассроч|ипотек|кредит/i.test(t)) return { text: INSTALLMENT + note, cards: [] };

  const input: Record<string, unknown> = { limit: 4, sort: 'price-asc' };
  const price = t.replace(/\s/g, '').match(/до(\d{2,7})(к|тыс|000)?/);
  if (price) input.price_to = Number(price[1]) * (price[2] === 'к' || price[2] === 'тыс' || price[2] === '000' ? 1000 : 1);
  const rooms = t.match(/\b([1-4])\s*\+\s*1\b/);
  if (rooms) input.rooms = [rooms[1] === '4' ? '4+' : `${rooms[1]}+1`];
  if (/студи/i.test(t)) input.rooms = ['studio'];
  if (/вилл/i.test(t)) input.type = 'villas';
  if (/аренд|снять/i.test(t)) input.operation = 'rental';
  if (/гражданств/i.test(t)) input.citizenship = true;
  if (/prive|(^|[^а-яё])прив[еэ]([^а-яёт]|$)/i.test(t)) input.prive = true;
  if (/мор/i.test(t)) input.sea_to = 1000;
  for (const [re, city] of CITIES) if (re.test(t)) input.city = city;

  const asked = Object.keys(input).length > 2 || /квартир|подбер|найд|покаж|купить|объект/i.test(t);
  if (!asked) return { text: HELLO + note, cards: [] };

  let r: any = await runTool('search_listings', input, seen).catch(() => null);
  if (r && !r.total_found && input.sea_to) {
    delete input.sea_to;
    r = await runTool('search_listings', input, seen).catch(() => null);
  }
  if (!r || !r.total_found) return { text: 'По таким условиям в базе сейчас ничего нет. Попробуйте поднять бюджет или выбрать другой район — или напишите менеджеру, он найдёт варианты вне сайта.' + note, cards: [] };
  const body = `Подходящих вариантов: **${r.total_found.toLocaleString('ru-RU')}**. Вот самые доступные:\n\n${r.items.map((x: any) => `[[obj:${x.id}]]`).join('\n')}\n\nВсе варианты — в разделе [${input.operation === 'rental' ? 'аренда](/rental/)' : 'продажа](/sale/)'}.`;
  return extractCards(body + note, seen);
}
