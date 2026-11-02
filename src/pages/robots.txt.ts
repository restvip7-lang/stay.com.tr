import type { APIRoute } from 'astro';
import { SITE } from '../i18n/config';

/**
 * robots.txt по ТЗ 11.1. Пока сайт закрыт (STAY_NOINDEX), страницы отдают заголовок
 * x-robots-tag: noindex — robots.txt при этом остаётся целевым.
 *
 * Защита от AI-парсеров: закрыты боты, которые собирают данные для обучения моделей и
 * массовые сборщики. ИИ-поиск (ChatGPT search, Perplexity, Claude) оставлен открытым,
 * чтобы нас советовали в ответах (llms.txt по SEO-ТЗ). Google и Яндекс не затронуты:
 * Google-Extended влияет только на Gemini, не на поиск. Жёсткая защита — в Vercel Firewall.
 */
const TRAINING_BOTS = [
  'GPTBot', 'ClaudeBot', 'anthropic-ai', 'Claude-Web', 'CCBot', 'Google-Extended', 'Applebot-Extended',
  'Bytespider', 'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'FacebookBot', 'Amazonbot', 'cohere-ai',
  'cohere-training-data-crawler', 'Diffbot', 'ImagesiftBot', 'Omgilibot', 'Omgili', 'PanguBot',
  'Timpibot', 'img2dataset', 'AI2Bot', 'Ai2Bot-Dolma', 'YouBot', 'DeepSeekBot',
];

const body = `User-agent: *
Disallow: /*/favorites/
Disallow: /*/search/
Disallow: /favorites/
Disallow: /search/
Disallow: /*?*sort=
Disallow: /*?*view=
Disallow: /api/
Disallow: /admin

User-agent: Yandex
Disallow: /*/favorites/
Disallow: /*/search/
Disallow: /api/
Disallow: /admin
Clean-param: sort&view&utm_source&utm_medium&utm_campaign&utm_content&utm_term

${TRAINING_BOTS.map((b) => `User-agent: ${b}`).join('\n')}
Disallow: /

Sitemap: ${SITE}/sitemap.xml
`;

export const GET: APIRoute = () => new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
