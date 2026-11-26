#!/usr/bin/env node
/**
 * Разовое ужатие уже сохранённых оригиналов чужих фото (STAY_DATA_DIR/media-src) до 1920 px —
 * так же, как теперь их сохраняет сам сайт (shrinkOriginal в src/lib/imageSource.ts).
 * Готовые уменьшенные копии (img-cache) остаются как были: сайт показывает их, оригинал нужен только для новых размеров.
 *
 *   node --env-file=/home/stay/stay.env scripts/media-src-shrink.mjs            # проверка: только посчитать, ничего не менять
 *   node --env-file=/home/stay/stay.env scripts/media-src-shrink.mjs --apply    # ужать по-настоящему
 *
 * Проверка без --apply смотрит только размеры картинок (быстро) и оценивает, сколько места освободится.
 * С --apply каждый файл заменяется уменьшенным, только если он вышел меньше. Можно прервать и запустить снова:
 * уже ужатые файлы пропускаются. Запасную копию не делает (на диске нет места на ещё 12 ГБ):
 * при необходимости оригиналы заново скачиваются с исходных сайтов.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
// sharp — из папки сайта (скрипт можно запустить и из другой папки: STAY_APP_DIR=/home/stay/app).
const sharp = createRequire(path.join(process.env.STAY_APP_DIR || path.resolve(import.meta.dirname, '..'), 'package.json'))('sharp');

const APPLY = process.argv.includes('--apply');
const KEEP_WIDTH = 1920;
const KEEP_BYTES = 1.5 * 1024 * 1024;
const ROOT = path.resolve(process.env.STAY_DATA_DIR || 'data', 'media-src');
sharp.concurrency(1);
sharp.cache(false);

const mb = (b) => Math.round(b / 1e5) / 10;
const t0 = Date.now();
let files = 0, totalBytes = 0, candidates = 0, candBytes = 0, done = 0, before = 0, after = 0, failed = 0;
let sampleIn = 0, sampleOut = 0; // проверка: каждый 20-й большой файл ужимаем в памяти, чтобы честно оценить экономию

async function shrink(file, size) {
  // Размеры — из заголовка файла, без чтения целиком (проверка проходит быстро).
  const m = await sharp(file, { failOn: 'none', limitInputPixels: 80_000_000 }).metadata();
  if (!m.width || m.format === 'svg' || m.format === 'gif' || (m.pages ?? 1) > 1) return null;
  if (m.width <= KEEP_WIDTH && size <= KEEP_BYTES) return null;
  candidates++; candBytes += size;
  if (!APPLY && candidates % 20 !== 1) return null;
  const input = await fs.readFile(file);
  const r = sharp(input, { failOn: 'none', limitInputPixels: 80_000_000 }).rotate().resize({ width: KEEP_WIDTH, withoutEnlargement: true });
  const out = m.hasAlpha ? await r.webp({ quality: 90 }).toBuffer() : await r.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  if (!APPLY) { sampleIn += input.length; sampleOut += Math.min(out.length, input.length); return null; }
  if (out.length >= input.length) return null;
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, out);
  await fs.rename(tmp, file);
  done++; before += input.length; after += out.length;
  return out.length;
}

for (const sub of await fs.readdir(ROOT).catch(() => [])) {
  const dir = path.join(ROOT, sub);
  for (const name of await fs.readdir(dir).catch(() => [])) {
    if (name.endsWith('.tmp')) continue;
    const file = path.join(dir, name);
    try {
      const st = await fs.stat(file);
      if (!st.isFile()) continue;
      files++; totalBytes += st.size;
      await shrink(file, st.size);
    } catch { failed++; }
    if (files % 1000 === 0) console.log(`… просмотрено ${files}, ${Math.round((Date.now() - t0) / 1000)} с`);
  }
}

const estimate = APPLY || !sampleIn ? 0 : Math.round(candBytes * (1 - sampleOut / sampleIn));
console.log(JSON.stringify({
  mode: APPLY ? 'ужатие' : 'проверка (ничего не менялось)',
  folder: ROOT,
  files, totalMB: mb(totalBytes),
  bigFiles: candidates, bigFilesMB: mb(candBytes),
  ...(APPLY ? { shrunk: done, freedMB: mb(before - after), afterMB: mb(totalBytes - (before - after)) } : { freesAboutMB: mb(estimate), afterAboutMB: mb(totalBytes - estimate) }),
  failed, seconds: Math.round((Date.now() - t0) / 1000),
}, null, 1));
