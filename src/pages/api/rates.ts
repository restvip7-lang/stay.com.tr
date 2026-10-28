import type { APIRoute } from 'astro';

// Курсы ЕЦБ к евро для переключателя валют на карточке объекта (цена в HTML — всегда EUR).
let memo: { at: number; rates: Record<string, number> } | null = null;

export const GET: APIRoute = async () => {
  if (!memo || Date.now() - memo.at > 6 * 3600_000) {
    try {
      const xml = await (await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', { signal: AbortSignal.timeout(5000) })).text();
      const rates: Record<string, number> = {};
      for (const m of xml.matchAll(/currency='([A-Z]{3})' rate='([\d.]+)'/g)) rates[m[1]] = Number(m[2]);
      if (Object.keys(rates).length) memo = { at: Date.now(), rates };
    } catch { /* оставляем прошлые курсы */ }
  }
  return new Response(JSON.stringify({ base: 'EUR', source: 'ECB', rates: memo?.rates ?? {} }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'cdn-cache-control': 'public, s-maxage=21600' },
  });
};
