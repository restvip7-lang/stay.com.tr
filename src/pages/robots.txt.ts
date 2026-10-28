import type { APIRoute } from 'astro';
import { SITE } from '../i18n/config';

/**
 * robots.txt по ТЗ 11.1. AI-краулеры не блокируются. Пока сайт закрыт (STAY_NOINDEX),
 * страницы отдают заголовок x-robots-tag: noindex — robots.txt при этом остаётся целевым.
 */
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

Sitemap: ${SITE}/sitemap.xml
`;

export const GET: APIRoute = () => new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
