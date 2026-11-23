import type { APIRoute } from 'astro';
import { ogJpeg } from '../lib/og';

/** Брендовая OG-картинка для страниц без своей (ТЗ 2.2). */
export const GET: APIRoute = () =>
  ogJpeg({ title: 'Недвижимость в Турции · Property in Turkey', subtitle: 'Alanya · Antalya · Northern Cyprus · UAE', image: '/media/about/stay-property-office.jpg' });
