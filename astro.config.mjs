// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';


// Куда собираем: на Vercel (там есть переменная VERCEL) — адаптер Vercel, иначе — обычный Node-сервер для VPS.
// Можно задать явно: STAY_TARGET=node или STAY_TARGET=vercel.
const target = process.env.STAY_TARGET || (process.env.VERCEL ? 'vercel' : 'node');

/** Сайты, с которых разрешено сжимать картинки (и на Vercel, и на своём сервере — src/pages/img.ts). */
export const IMAGE_DOMAINS = ['portfolio.stayrepo.com', 'adminer.stayproperty.com', 'cdn-ru.bitrix24.ru', 'stay.com.tr', 'dev.stayproperty.com', 'eu2.contabostorage.com', 'stay-property.fra1.cdn.digitaloceanspaces.com', 'i.ytimg.com'];

// Свой сервер: домены, которым сайт доверяет в заголовке Host (иначе формы админки получают 403 от проверки Origin,
// а адреса страниц строятся от localhost). Список через запятую в STAY_DOMAINS при сборке.
const domains = (process.env.STAY_DOMAINS || 'stay.com.tr,www.stay.com.tr').split(',').map((d) => d.trim()).filter(Boolean);
const allowedDomains = [...domains, '127.0.0.1', 'localhost'].map((hostname) => ({ hostname }));

export default defineConfig({
  site: 'https://stay.com.tr',
  output: 'server',
  trailingSlash: 'ignore',
  security: target === 'node' ? { allowedDomains } : undefined,
  adapter: target === 'node' ? node({ mode: 'standalone' }) : vercel({
    // Кэш страниц — на CDN Vercel по заголовкам из middleware (10 мин + stale-while-revalidate),
    // ключ кэша учитывает ?параметры фильтра. Сброс — по тегам (вебхук /api/revalidate, админка).
    imageService: false,
    imagesConfig: {
      sizes: [320, 640, 960, 1280, 1920],
      formats: ['image/avif', 'image/webp'],
      domains: IMAGE_DOMAINS,
      minimumCacheTTL: 86400,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.STAY_TARGET': JSON.stringify(target),
      'import.meta.env.STAY_IMAGE_DOMAINS': JSON.stringify(IMAGE_DOMAINS.join(',')),
    },
  },
});
