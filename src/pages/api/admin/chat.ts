import type { APIRoute } from 'astro';
import { badOrigin, ipOf, userCan } from '../../../lib/adminAuth';
import { audit } from '../../../lib/adminAudit';
import { chatAdminView, getChatSettings, resolveApiKey, saveChatSettings } from '../../../lib/chatConfig';
import { askAssistant } from '../../../lib/chatAgent';
import { explainAiError, recordAiError } from '../../../lib/chatError';

export const prerender = false;

/** Сохранение настроек ИИ-помощника и проверка, что ключ работает. */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const user = await userCan(cookies, 'chat');
  if (!user) return new Response('Нет доступа', { status: 403 });
  if (badOrigin(request)) return new Response('Bad origin', { status: 403 });
  try {
    const body = await request.json();
    if (body?.action === 'test') {
      const s = await getChatSettings();
      if (!resolveApiKey(s)) return Response.json({ ok: false, error: 'Ключ не задан' });
      const t = Date.now();
      let r;
      try {
        r = await askAssistant(s, [{ role: 'user', content: 'Подбери 2 квартиры 1+1 в Аланье до 150 000 €' }]);
      } catch (e) {
        await recordAiError(e);
        return Response.json({ ok: false, error: explainAiError(e) });
      }
      return Response.json({ ok: true, ms: Date.now() - t, text: r.text.slice(0, 600), cards: r.cards.length });
    }
    const key = body?.deleteKey ? null : typeof body?.apiKey === 'string' ? body.apiKey : undefined;
    const { apiKey, deleteKey, action, ...settings } = body ?? {};
    const saved = await saveChatSettings(settings, key);
    await audit(user, 'chat.save', key === null ? 'ключ удалён' : key ? 'ключ заменён' : '', ipOf(request, clientAddress));
    return Response.json({ ok: true, saved: chatAdminView(saved) });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message.slice(0, 400) }, { status: 500 });
  }
};
