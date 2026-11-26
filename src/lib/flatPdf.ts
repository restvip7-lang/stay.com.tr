/**
 * PDF квартиры проекта STAY PROJECTS (по образцу mr-group): 1) обложка — фото и название проекта;
 * 2) планировка, параметры, цена и план этажа с выделенной квартирой; 3) генплан с корпусом и вид из окна.
 * Страницы/блоки без данных пропускаются. Планы — из админки «Планы проектов» (координаты в процентах).
 */
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { getFonts, C, LOGO_PATHS } from './selectionPdf';
import { loadImage } from './imageSource';
import { site } from './site';
import type { Lang } from '../i18n/config';
import type { Pt, ViewMark } from './plans';
import { FLAT_UI } from './flatText';

export interface FlatPdfData {
  lang: Lang;
  project: string;
  title: string;
  place: string;
  url: string;
  cover: string | null;
  plan: string | null;
  params: [string, string][];
  price: string;
  perM2: string | null;
  floorPlan: { image: string; shape: Pt[] | null } | null;
  genplan: { image: string; shape: Pt[] | null } | null;
  view: { image: string; mark: ViewMark } | null;
}

interface Pic { buf: Buffer; w: number; h: number }
async function pic(src: string | null | undefined, base: string, max = 1600, cover?: { w: number; h: number }): Promise<Pic | null> {
  try {
    const input = await loadImage(src, base);
    if (!input) return null;
    let s = sharp(input, { failOn: 'none', limitInputPixels: 80_000_000 }).rotate().flatten({ background: '#ffffff' });
    s = cover ? s.resize(cover.w, cover.h, { fit: 'cover' }) : s.resize(max, max, { fit: 'inside', withoutEnlargement: true });
    const { data, info } = await s.jpeg({ quality: 84 }).toBuffer({ resolveWithObject: true });
    return { buf: data, w: info.width, h: info.height };
  } catch {
    return null;
  }
}

export async function flatPdf(x: FlatPdfData, base: string): Promise<Buffer> {
  const L = FLAT_UI[x.lang] ?? FLAT_UI.en;
  const loc = x.lang === 'sr' ? 'sr-Latn' : x.lang;
  const [cover, plan, floor, gen, view] = await Promise.all([
    pic(x.cover, base, 0, { w: 1400, h: 1500 }),
    pic(x.plan, base),
    pic(x.floorPlan?.image, base),
    pic(x.genplan?.image, base),
    pic(x.view?.image, base),
  ]);

  const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: `${x.project} — ${x.title}`, Author: 'Stay Property', Creator: 'stay.com.tr' }, lang: x.lang });
  const F = getFonts();
  doc.registerFont('R', F.r);
  doc.registerFont('S', F.s);
  doc.registerFont('B', F.b);
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res, rej) => { doc.on('end', () => res(Buffer.concat(chunks))); doc.on('error', rej); });

  const M = 36;
  const PW = doc.page.width;
  const PH = doc.page.height;
  const W = PW - M * 2;
  const date = new Date().toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });

  const header = (left: 'logo' | string) => {
    if (left === 'logo') {
      doc.roundedRect(M, M - 6, 26, 26, 6).fill(C.logo);
      doc.save().translate(M + 3.2, M - 2).scale(0.65);
      for (const p of LOGO_PATHS) doc.path(p).fill('#fff');
      doc.restore();
      doc.font('B').fontSize(13).fillColor(C.text).text('STAY PROPERTY', M + 36, M + 1, { lineBreak: false, characterSpacing: 0.3 });
    } else {
      doc.font('S').fontSize(11).fillColor(C.text).text(left.toUpperCase(), M, M + 1, { lineBreak: false });
    }
    doc.font('R').fontSize(9).fillColor(C.text);
    doc.text(`${site.phone.label}   |   ${site.email}`, M, M + 2, { width: W, align: 'right', lineBreak: false });
  };
  const footer = () => {
    doc.page.margins.bottom = 0; // иначе текст у нижнего края переносится на новую страницу
    doc.font('R').fontSize(7).fillColor(C.gray).text(`${L.disclaimer} · ${date} · stay.com.tr`, M, PH - M - 4, { width: W, align: 'right', lineBreak: false });
  };
  /** Картинка «вписать» в рамку; возвращает её место на странице (для контуров). */
  const fit = (p: Pic, x0: number, y0: number, bw: number, bh: number) => {
    const k = Math.min(bw / p.w, bh / p.h);
    const w = p.w * k, h = p.h * k;
    const x = x0 + (bw - w) / 2, y = y0 + (bh - h) / 2;
    doc.image(p.buf, x, y, { width: w, height: h });
    return { x, y, w, h };
  };
  const shape = (r: { x: number; y: number; w: number; h: number }, pts: Pt[]) => {
    if (pts.length < 3) return;
    doc.save();
    doc.polygon(...pts.map(([px, py]) => [r.x + (px / 100) * r.w, r.y + (py / 100) * r.h] as [number, number]));
    doc.fillOpacity(0.35).strokeOpacity(1).lineWidth(1.2).fillAndStroke(C.accent, C.accent);
    doc.restore();
  };
  const frame = (x0: number, y0: number, w: number, h: number) => doc.roundedRect(x0, y0, w, h, 10).lineWidth(0.8).strokeColor(C.line).stroke();
  const h2 = (t: string, y: number) => { doc.font('B').fontSize(24).fillColor(C.text).text(t, M, y, { lineBreak: false }); return y + 40; };

  // 1. Обложка
  header('logo');
  const ch = PH - M * 2 - 150;
  doc.save().roundedRect(M, M + 36, W, ch, 12).clip();
  if (cover) doc.image(cover.buf, M, M + 36, { width: W, height: ch });
  else doc.rect(M, M + 36, W, ch).fill(C.ph);
  doc.restore();
  let y = M + 36 + ch + 18;
  doc.font('B').fontSize(30).fillColor(C.accent).text(x.project.toUpperCase(), M, y, { width: W, lineBreak: false, ellipsis: true });
  y += 40;
  doc.font('S').fontSize(15).fillColor(C.text).text(x.title, M, y, { width: W });
  doc.font('R').fontSize(11).fillColor(C.gray).text(x.place, M, doc.y + 4, { width: W });
  footer();

  // 2. Планировка и параметры + план этажа
  doc.addPage();
  header(x.project);
  y = M + 34;
  const bw = W * 0.56, bh = 300;
  frame(M, y, bw, bh);
  if (plan) fit(plan, M + 10, y + 10, bw - 20, bh - 20);
  const rx = M + bw + 18, rw = W - bw - 18;
  doc.font('B').fontSize(17).fillColor(C.text).text(x.title, rx, y, { width: rw });
  let ry = doc.y + 12;
  for (const [k, v] of x.params) {
    doc.font('R').fontSize(9.5);
    const vh = doc.heightOfString(v, { width: rw * 0.55 });
    doc.fillColor(C.gray).text(k, rx, ry, { width: rw * 0.45, lineBreak: false });
    doc.fillColor(C.text).font('S').text(v, rx + rw * 0.45, ry, { width: rw * 0.55, align: 'right' });
    ry += Math.max(vh, 12) + 4;
    doc.moveTo(rx, ry - 2).lineTo(rx + rw, ry - 2).lineWidth(0.5).dash(1.5, { space: 2 }).strokeColor(C.line).stroke().undash();
    ry += 3;
  }
  ry += 8;
  doc.font('B').fontSize(20).fillColor(C.text).text(x.price, rx, ry, { width: rw });
  ry = doc.y + 2;
  if (x.perM2) { doc.font('R').fontSize(10).fillColor(C.gray).text(x.perM2, rx, ry, { width: rw }); ry = doc.y; }
  ry += 10;
  doc.roundedRect(rx, ry, rw, 28, 9).lineWidth(0.9).strokeColor(C.accent).stroke();
  doc.font('S').fontSize(10).fillColor(C.accent).text(L.siteLink, rx, ry + 9, { width: rw, align: 'center', lineBreak: false });
  doc.link(rx, ry, rw, 28, x.url);
  y = Math.max(y + bh, ry + 28) + 26;
  if (floor) {
    y = h2(L.floorPlan, y);
    const fh = PH - M - 24 - y;
    frame(M, y, W, fh);
    const r = fit(floor, M + 10, y + 10, W - 20, fh - 20);
    if (x.floorPlan?.shape) shape(r, x.floorPlan.shape);
  }
  footer();

  // 3. Генплан и вид из окна
  if (gen || view) {
    doc.addPage();
    header(x.project);
    y = M + 34;
    const half = (PH - M * 2 - 34 - 24 - 110) / (gen && view ? 2 : 1);
    if (gen) {
      y = h2(`${L.genplan} ${x.project}`, y);
      doc.save().roundedRect(M, y, W, half, 12).clip();
      doc.rect(M, y, W, half).fill('#f4f4f7');
      const r = fit(gen, M, y, W, half);
      if (x.genplan?.shape) shape(r, x.genplan.shape);
      doc.restore();
      y += half + 26;
    }
    if (view && x.view) {
      y = h2(L.view, y);
      doc.save().roundedRect(M, y, W, half, 12).clip();
      doc.rect(M, y, W, half).fill('#f4f4f7');
      const r = fit(view, M, y, W, half);
      const m = x.view.mark;
      const cx = r.x + (m.x / 100) * r.w, cy = r.y + (m.y / 100) * r.h;
      const rad = r.w * 0.22;
      const spread = m.spread ?? 60;
      const a1 = ((m.dir - spread / 2) * Math.PI) / 180, a2 = ((m.dir + spread / 2) * Math.PI) / 180;
      const p = (a: number) => `${cx + rad * Math.sin(a)} ${cy - rad * Math.cos(a)}`;
      doc.path(`M ${cx} ${cy} L ${p(a1)} A ${rad} ${rad} 0 ${spread > 180 ? 1 : 0} 1 ${p(a2)} Z`).fillOpacity(0.45).fill(C.accent);
      doc.fillOpacity(1).circle(cx, cy, 6).fill('#ffffff').circle(cx, cy, 4).fill(C.accent);
      doc.restore();
    }
    footer();
  }

  doc.end();
  return done;
}
