/**
 * Динамические OG-картинки 1200×630 (ТЗ 2.2): фото объекта/ЖК + цена, тип, комнатность, площадь, логотип.
 * Рисуем через @vercel/og (satori), отдаём JPEG через sharp, чтобы уложиться в 300 КБ.
 */
import { ImageResponse } from '@vercel/og';
import sharp from 'sharp';
import cyr400 from '../assets/og/inter-cyrillic-400-normal.woff?inline';
import cyr600 from '../assets/og/inter-cyrillic-600-normal.woff?inline';
import lat400 from '../assets/og/inter-latin-400-normal.woff?inline';
import lat600 from '../assets/og/inter-latin-600-normal.woff?inline';
import ext400 from '../assets/og/inter-latin-ext-400-normal.woff?inline';
import ext600 from '../assets/og/inter-latin-ext-600-normal.woff?inline';

const buf = (dataUrl: string) => {
  const b = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};
let fonts: { name: string; data: ArrayBuffer; weight: 400 | 600; style: 'normal' }[] | null = null;
const getFonts = () =>
  (fonts ??= [
    { name: 'Inter', data: buf(lat400), weight: 400, style: 'normal' },
    { name: 'InterExt', data: buf(ext400), weight: 400, style: 'normal' },
    { name: 'InterCyr', data: buf(cyr400), weight: 400, style: 'normal' },
    { name: 'Inter', data: buf(lat600), weight: 600, style: 'normal' },
    { name: 'InterExt', data: buf(ext600), weight: 600, style: 'normal' },
    { name: 'InterCyr', data: buf(cyr600), weight: 600, style: 'normal' },
  ]);

const LOGO = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 28"><path fill="#fff" fill-rule="evenodd" d="M12.717 12.722l2.54-2.54c3.662 3.639 6.52 6.537 10.181 10.176v7.207h-7.957l5.037-5.037-9.805-9.806h.004zM5.086 27.561v-7.208l7.212 7.208H5.086z"/><path fill="#fff" fill-rule="evenodd" d="M14.887 25.063l-9.801-9.8H0L15.262 0 30.53 15.262h-5.09L15.257 5.082l-7.631 7.63 9.805 9.81-2.545 2.541z"/></svg>').toString('base64')}`;

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({ type, props: { style, children, ...extra } });

/** Фото может не загрузиться — тогда фон бренда. */
async function photoDataUrl(src: string | null): Promise<string | null> {
  if (!src) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const jpg = await sharp(Buffer.from(await res.arrayBuffer())).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 78 }).toBuffer();
    return `data:image/jpeg;base64,${jpg.toString('base64')}`;
  } catch {
    return null;
  }
}

export interface OgCard { title: string; subtitle?: string; price?: string; chips?: string[]; image?: string | null }

export async function ogJpeg(c: OgCard): Promise<Response> {
  const photo = await photoDataUrl(c.image ?? null);
  const tree = h('div', { width: 1200, height: 630, display: 'flex', position: 'relative', backgroundColor: '#090714', fontFamily: 'Inter, InterCyr, InterExt', color: '#fff' }, [
    photo ? h('img', { position: 'absolute', left: 0, top: 0, width: 1200, height: 630, objectFit: 'cover' }, undefined, { src: photo, width: 1200, height: 630 }) : null,
    h('div', { position: 'absolute', left: 0, top: 0, width: 1200, height: 630, display: 'flex', backgroundImage: photo ? 'linear-gradient(180deg, rgba(9,7,20,0.15) 0%, rgba(9,7,20,0.35) 45%, rgba(9,7,20,0.9) 100%)' : 'linear-gradient(135deg, #090714 0%, #2a1d5c 100%)' }),
    h('div', { position: 'absolute', left: 56, top: 48, display: 'flex', alignItems: 'center', gap: 14 }, [
      h('img', { width: 44, height: 41 }, undefined, { src: LOGO, width: 44, height: 41 }),
      h('div', { fontSize: 24, fontWeight: 600, letterSpacing: 1 }, 'STAY PROPERTY'),
    ]),
    h('div', { position: 'absolute', left: 56, right: 56, bottom: 52, display: 'flex', flexDirection: 'column' }, [
      c.chips?.length ? h('div', { display: 'flex', gap: 10, marginBottom: 18 }, c.chips.slice(0, 4).map((t) => h('div', { display: 'flex', padding: '8px 16px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', fontSize: 22 }, t))) : null,
      h('div', { fontSize: 54, fontWeight: 600, lineHeight: 1.1, maxWidth: 1000 }, c.title),
      c.subtitle ? h('div', { fontSize: 28, marginTop: 12, opacity: 0.85 }, c.subtitle) : null,
      c.price ? h('div', { display: 'flex', marginTop: 22, alignSelf: 'flex-start', padding: '10px 22px', borderRadius: 16, backgroundColor: '#754be9', fontSize: 38, fontWeight: 600 }, c.price) : null,
    ]),
  ]);
  const png = Buffer.from(await new ImageResponse(tree as any, { width: 1200, height: 630, fonts: getFonts() }).arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: {
      'content-type': 'image/jpeg',
      'cache-control': 'public, max-age=86400',
      'cdn-cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}

/** Логотип 512×512 PNG для Organization.logo. */
export async function logoPng(): Promise<Response> {
  const tree = h('div', { width: 512, height: 512, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090714' }, [
    h('img', { width: 300, height: 280 }, undefined, { src: LOGO, width: 300, height: 280 }),
  ]);
  const png = await new ImageResponse(tree as any, { width: 512, height: 512, fonts: getFonts() }).arrayBuffer();
  return new Response(png, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=604800' } });
}
