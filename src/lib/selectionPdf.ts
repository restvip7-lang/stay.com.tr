/**
 * PDF-файл «Подборка недвижимости» из чата с Доми: шапка с логотипом, таблица сравнения,
 * карточки с фото и подвал — тот же вид, что у страницы печати, но готовым файлом для скачивания.
 * Рисуем через pdfkit (текст остаётся текстом, ссылки кликабельны), шрифт Inter с кириллицей и латиницей.
 */
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { CHAT_UI } from './chatI18n';
import { loadImage } from './imageSource';
import { site } from './site';
import type { Lang } from '../i18n/config';
import interRegular from '../assets/pdf/Inter-Regular.ttf?inline';
import interSemi from '../assets/pdf/Inter-SemiBold.ttf?inline';
import interBold from '../assets/pdf/Inter-Bold.ttf?inline';

export interface PdfFacts { place?: string; rooms?: string; area?: number; sea?: number; price?: number; ppm?: number; from?: boolean }
export interface PdfCard { title: string; subtitle: string; price: string; image: string | null; url: string; facts?: PdfFacts }

const fontBuf = (dataUrl: string) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
let fonts: { r: Buffer; s: Buffer; b: Buffer } | null = null;
export const getFonts = () => (fonts ??= { r: fontBuf(interRegular), s: fontBuf(interSemi), b: fontBuf(interBold) });

export const C = { text: '#141414', gray: '#6b6b76', accent: '#754be9', line: '#e3e3ea', head: '#f3f0fd', ph: '#ecebf5', logo: '#090714' };
export const LOGO_PATHS = [
  'M12.717 12.722l2.54-2.54c3.662 3.639 6.52 6.537 10.181 10.176v7.207h-7.957l5.037-5.037-9.805-9.806h.004zM5.086 27.561v-7.208l7.212 7.208H5.086z',
  'M14.887 25.063l-9.801-9.8H0L15.262 0 30.53 15.262h-5.09L15.257 5.082l-7.631 7.63 9.805 9.81-2.545 2.541z',
];

/** Фото карточки → JPEG нужного размера (обрезка по центру). Не загрузилось — серая заглушка. */
async function photo(src: string | null, base: string): Promise<Buffer | null> {
  try {
    const input = await loadImage(src, base);
    if (!input) return null;
    return await sharp(input, { failOn: 'none', limitInputPixels: 80_000_000 }).rotate().resize(360, 272, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return null;
  }
}

export async function selectionPdf(lang: Lang, cards: PdfCard[], base: string): Promise<Buffer> {
  const T = CHAT_UI[lang];
  const loc = lang === 'sr' ? 'sr-Latn' : lang;
  const num = (n: number) => n.toLocaleString(loc).replace(/ | /g, ' ');
  const eur = (n?: number) => (n ? `${num(n)} €` : '—');
  const [mU, kmU, m2U] = lang === 'ru' ? ['м', 'км', 'м²'] : ['m', 'km', 'm²'];
  const sea = (n?: number) => (n ? (n >= 1000 ? `${num(Math.round(n / 100) / 10)} ${kmU}` : `${num(n)} ${mU}`) : '—');
  const abs = (u: string) => { try { const x = new URL(u, base); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } };
  const date = new Date().toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });
  const photos = await Promise.all(cards.map((c) => photo(c.image, base)));

  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: false, info: { Title: `${T.pdfTitle} — Stay Property`, Author: 'Stay Property', Creator: 'stay.com.tr' }, lang });
  const F = getFonts();
  doc.registerFont('R', F.r);
  doc.registerFont('S', F.s);
  doc.registerFont('B', F.b);
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res, rej) => { doc.on('end', () => res(Buffer.concat(chunks))); doc.on('error', rej); });

  const M = 40;
  const W = doc.page.width - M * 2;
  const bottom = () => doc.page.height - M;
  let y = M;
  const fits = (h: number) => y + h <= bottom();
  const newPage = () => { doc.addPage(); y = M; };

  // Шапка: логотип, STAY PROPERTY, дата и сайт справа, фиолетовая линия.
  const L = 30;
  doc.roundedRect(M, y, L, L, 7).fill(C.logo);
  doc.save().translate(M + 3.75, y + 4.7).scale(0.75);
  for (const p of LOGO_PATHS) doc.path(p).fill('#fff');
  doc.restore();
  doc.font('B').fontSize(15).fillColor(C.text).text('STAY PROPERTY', M + L + 11, y + 6.5, { lineBreak: false, characterSpacing: 0.3 });
  doc.font('R').fontSize(10).fillColor(C.gray);
  doc.text(date, M, y + 1, { width: W, align: 'right', lineBreak: false });
  doc.text('stay.com.tr', M, y + 15, { width: W, align: 'right', lineBreak: false, link: base });
  y += L + 10;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(2).strokeColor(C.accent).stroke();
  y += 20;

  doc.font('B').fontSize(20).fillColor(C.text).text(T.pdfTitle, M, y, { width: W, lineBreak: false });
  y += 34;

  // Таблица сравнения.
  const cols = [163, 85, 53, 53, 51, 58, 52];
  const right = [false, false, false, false, false, true, true];
  const pad = 4.5;
  const FS = 8.5;
  const cellsH = (cells: string[], font: string) => {
    doc.font(font).fontSize(FS);
    return Math.max(...cells.map((t, i) => doc.heightOfString(t, { width: cols[i] - pad * 2 }))) + pad * 2 + 1;
  };
  const drawRow = (cells: string[], fontsOf: (i: number) => string, bg?: string, link?: string) => {
    const h = Math.max(...cells.map((t, i) => { doc.font(fontsOf(i)).fontSize(FS); return doc.heightOfString(t, { width: cols[i] - pad * 2 }); })) + pad * 2 + 1;
    if (bg) doc.rect(M, y, W, h).fill(bg);
    let x = M;
    cells.forEach((t, i) => {
      doc.font(fontsOf(i)).fontSize(FS).fillColor(C.text).text(t, x + pad, y + pad + 0.5, { width: cols[i] - pad * 2, align: right[i] ? 'right' : 'left' });
      x += cols[i];
    });
    if (link) doc.link(M, y, cols[0], h, link);
    y += h;
    doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.75).strokeColor(C.line).stroke();
  };
  const head = T.pdfCols;
  const drawHead = () => drawRow(head, () => 'S', C.head);
  drawHead();
  cards.forEach((c, i) => {
    const f = c.facts ?? {};
    const cells = [
      `${i + 1}. ${c.title}`,
      f.place || c.subtitle || '—',
      f.rooms || '—',
      f.area ? `${num(f.area)} ${m2U}` : '—',
      sea(f.sea),
      f.price ? (f.from ? c.price : eur(f.price)) : c.price || '—',
      eur(f.ppm),
    ];
    if (!fits(cellsH(cells, 'S'))) { newPage(); drawHead(); }
    drawRow(cells, (k) => (k === 0 ? 'S' : 'R'), undefined, abs(c.url) || undefined);
  });
  y += 18;

  // Карточки с фото, по две в ряд.
  const gap = 10;
  const cw = (W - gap) / 2;
  const cp = 9;
  const iw = 92;
  const ih = 70;
  const tw = cw - cp * 3 - iw;
  const cardText = (c: PdfCard, i: number) => {
    const u = abs(c.url);
    return { title: `${i + 1}. ${c.title}`, sub: c.subtitle, price: c.price, url: u.replace(/^https?:\/\//, '') };
  };
  const textH = (t: ReturnType<typeof cardText>) => {
    let h = doc.font('S').fontSize(10).heightOfString(t.title, { width: tw });
    if (t.sub) h += 2 + doc.font('R').fontSize(8).heightOfString(t.sub, { width: tw });
    if (t.price) h += 5 + doc.font('B').fontSize(10.5).heightOfString(t.price, { width: tw });
    if (t.url) h += 3 + doc.font('R').fontSize(7).heightOfString(t.url, { width: tw });
    return h;
  };
  for (let i = 0; i < cards.length; i += 2) {
    const pair = cards.slice(i, i + 2).map((c, k) => ({ c, n: i + k, t: cardText(c, i + k) }));
    const h = Math.max(ih, ...pair.map((p) => textH(p.t))) + cp * 2;
    if (!fits(h)) newPage();
    pair.forEach((p, k) => {
      const x = M + k * (cw + gap);
      doc.roundedRect(x + 0.4, y + 0.4, cw - 0.8, h - 0.8, 10).lineWidth(0.8).strokeColor(C.line).stroke();
      const img = photos[p.n];
      doc.save();
      doc.roundedRect(x + cp, y + cp, iw, ih, 7).clip();
      if (img) doc.image(img, x + cp, y + cp, { width: iw, height: ih });
      else doc.rect(x + cp, y + cp, iw, ih).fill(C.ph);
      doc.restore();
      const tx = x + cp * 2 + iw;
      let ty = y + cp - 1;
      doc.font('S').fontSize(10).fillColor(C.text).text(p.t.title, tx, ty, { width: tw });
      ty = doc.y;
      if (p.t.sub) { doc.font('R').fontSize(8).fillColor(C.gray).text(p.t.sub, tx, ty + 2, { width: tw }); ty = doc.y; }
      if (p.t.price) { doc.font('B').fontSize(10.5).fillColor(C.text).text(p.t.price, tx, ty + 5, { width: tw }); ty = doc.y; }
      if (p.t.url) doc.font('R').fontSize(7).fillColor(C.accent).text(p.t.url, tx, ty + 3, { width: tw });
      const link = abs(p.c.url);
      if (link) doc.link(x, y, cw, h, link);
    });
    y += h + gap;
  }

  // Подвал.
  const foot = `${T.pdfFoot}\nStay Property · ${site.phone.label} · ${site.email} · stay.com.tr`;
  doc.font('R').fontSize(9);
  const fh = doc.heightOfString(foot, { width: W, lineGap: 2 }) + 14;
  if (!fits(fh)) newPage();
  y += 4;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.75).strokeColor(C.line).stroke();
  doc.fillColor(C.gray).text(foot, M, y + 10, { width: W, lineGap: 2 });

  doc.end();
  return done;
}
