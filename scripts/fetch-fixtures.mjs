// Сохраняет снимок данных API в src/content/fixtures — запасной вариант,
// если API недоступен во время сборки или запроса.
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.STAY_API_BASE || 'https://dev.stayproperty.com';
const OUT = new URL('../src/content/fixtures/', import.meta.url);

async function get(path, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + path, { signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`${r.status} ${path}`);
      return await r.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
    }
  }
}

async function allSale(operation) {
  const items = [];
  for (let page = 1; page < 20; page++) {
    const d = await get(`/api/sale?source=portfolio&language=ru&operation=${operation}&limit=500&page=${page}`);
    items.push(...d.data.items);
    if (items.length >= d.data.total || d.data.items.length === 0) break;
  }
  return items;
}

await mkdir(OUT, { recursive: true });
const save = (name, data) => writeFile(new URL(name, OUT), JSON.stringify(data));
await save('header-menu.json', (await get('/api/header-menu?language=ru')).data);
await save('home-sections.json', (await get('/api/home-sections?lang=ru')).data);
await save('news.json', (await get('/api/news?language=ru&limit=200')).data);
await save('projects.json', (await get('/api/projects')).data);
await save('sale.json', await allSale('sale'));
await save('rental.json', await allSale('rental'));
// Квартиры в проектах Stay (Битрикс): окнами по цене, т.к. постраничность у источника не работает.
const units = new Map();
for (const [from, to] of [[0, 120000], [120001, 180000], [180001, 260000], [260001, 400000], [400001, 0]]) {
  const q = (from ? `&cs_price_from=${from}` : '') + (to ? `&cs_price_to=${to}` : '');
  const d = await get(`/api/sale?source=bitrix&language=ru&operation=sale&limit=500${q}`);
  d.data.items.forEach((x) => units.set(String(x.id), x));
}
await save('units.json', [...units.values()]);
const cit = await get('/api/sale?source=bitrix&language=ru&operation=sale&limit=500&citizenship=1');
await save('units-citizenship.json', cit.data.items.map((x) => String(x.id)).sort());
console.log('fixtures saved');
