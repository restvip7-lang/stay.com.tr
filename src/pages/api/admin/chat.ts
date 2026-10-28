import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/adminAuth';
import { chatAdminView, getChatSettings, resolveApiKey, saveChatSettings } from '../../../lib/chatConfig';
import { askAssistant } from '../../../lib/chatAgent';

export const prerender = false;

/** Сохранение настроек ИИ-помощника и проверка, что ключ работает. */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return new Response('Нужно войти', { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    if (body?.action === 'test') {
      const s = await getChatSettings();
      if (!resolveApiKey(s)) return Response.json({ ok: false, error: 'Ключ не задан' });
      const t = Date.now();
      const r = await askAssistant(s, [{ role: 'user', content: 'Подбери 2 квартиры 1+1 в Аланье до 150 000 €' }]);
      return Response.json({ ok: true, ms: Date.now() - t, text: r.text.slice(0, 600), cards: r.cards.length });
    }
    const key = body?.deleteKey ? null : typeof body?.apiKey === 'string' ? body.apiKey : undefined;
    const { apiKey, deleteKey, action, ...settings } = body ?? {};
    const saved = await saveChatSettings(settings, key);
    return Response.json({ ok: true, saved: chatAdminView(saved) });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message.slice(0, 400) }, { status: 500 });
  }
};
