import type { APIRoute } from 'astro';
export const prerender = false;
// Временная проверка доступа к новому API контента (admin.stayproperty.com) с сервера Vercel. Удалить после проверки.
export const GET: APIRoute = async () => {
  const out: Record<string, unknown> = {};
  for (const base of ['https://admin.stayproperty.com', 'https://62.169.23.237']) {
    for (const path of ['/health', '/api/content/news?language=ru&limit=100', '/api/content/services?language=ru&limit=100']) {
      const t = Date.now();
      try {
        const r = await fetch(base + path, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
        const txt = await r.text();
        let summary: unknown = txt.slice(0, 300);
        try {
          const j = JSON.parse(txt);
          if (Array.isArray(j?.items)) summary = { total: j.total, items: j.items.map((x: any) => ({ id: x.id, title: x.title, image: x.image, published_at: x.published_at, category: x.category, langs: Object.keys(x.translations || {}), bodyLen: (x.body || '').length, keys: Object.keys(x) })) };
          else summary = j;
        } catch { /* не JSON */ }
        out[base + path] = { status: r.status, ct: r.headers.get('content-type'), ms: Date.now() - t, summary };
      } catch (e) {
        out[base + path] = { error: String((e as Error).message || e).slice(0, 200), ms: Date.now() - t };
      }
    }
  }
  return Response.json(out, { headers: { 'cache-control': 'no-store' } });
};
