// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
  site: 'https://stay.com.tr',
  output: 'server',
  trailingSlash: 'ignore',
  adapter: vercel({
    // Кэш страниц — на CDN Vercel по заголовкам из middleware (10 мин + stale-while-revalidate),
    // ключ кэша учитывает ?параметры фильтра. Сброс — по тегам (вебхук /api/revalidate, админка).
    imageService: false,
    imagesConfig: {
      sizes: [320, 640, 960, 1280, 1920],
      formats: ['image/avif', 'image/webp'],
      domains: ['portfolio.stayrepo.com', 'cdn-ru.bitrix24.ru', 'stay.com.tr', 'dev.stayproperty.com', 'i.ytimg.com'],
      minimumCacheTTL: 86400,
    },
  }),
  vite: { plugins: [tailwindcss()] },
});
