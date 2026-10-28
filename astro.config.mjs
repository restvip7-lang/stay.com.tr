// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { createHash } from 'node:crypto';

// Токен сброса кэша выводим из токена хранилища — так он есть и при сборке, и в функции.
const blob = process.env.BLOB_READ_WRITE_TOKEN;
const bypassToken = blob ? createHash('sha256').update('isr:' + blob).digest('hex') : undefined;

export default defineConfig({
  site: 'https://stay.com.tr',
  output: 'server',
  trailingSlash: 'ignore',
  adapter: vercel({
    // Страницы с объектами кэшируются на час, потом пересобираются из API.
    // Админка и её API не кэшируются. После сохранения в админке главная сбрасывается сразу.
    isr: { expiration: 60 * 60, bypassToken, exclude: [/^\/admin/, /^\/api\/admin/, /^\/api\/chat/] },
  }),
  vite: { plugins: [tailwindcss()] },
});
