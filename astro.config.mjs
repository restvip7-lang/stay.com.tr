// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stay.com.tr',
  output: 'server',
  trailingSlash: 'ignore',
  adapter: vercel({
    // Страницы с объектами кэшируются на час, потом пересобираются из API.
    isr: { expiration: 60 * 60 },
  }),
  vite: { plugins: [tailwindcss()] },
});
