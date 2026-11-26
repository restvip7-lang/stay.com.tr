#!/usr/bin/env node
/**
 * Чистит готовые уменьшенные копии картинок (STAY_DATA_DIR/img-cache), которые давно никто не открывал.
 * /img обновляет дату файла, когда отдаёт копию (не чаще раза в сутки), так что дата = последний показ.
 * Удалённая копия ничего не ломает: при следующем показе /img соберёт её заново из сохранённого оригинала.
 * Оригиналы (media-src) этот скрипт не трогает.
 *
 *   node --env-file=/home/stay/stay.env scripts/img-cache-clean.mjs            # удалить копии старше 60 дней
 *   ... --days=30                                                              # другой срок
 *   ... --dry                                                                  # только посчитать, ничего не удалять
 *
 * Запускается сам после ночной полной загрузки объектов (scripts/portfolio-sync.mjs --full, 04:00).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function cleanImgCache({ days = 60, dry = false, dir } = {}) {
  const root = dir || path.resolve(process.env.STAY_DATA_DIR || 'data', 'img-cache');
  const edge = Date.now() - days * 86_400_000;
  let kept = 0, keptBytes = 0, removed = 0, removedBytes = 0;
  let subs = [];
  try { subs = await fs.readdir(root, { withFileTypes: true }); } catch { return { root, kept, removed, removedMB: 0, keptMB: 0, days, dry }; }
  for (const s of subs) {
    if (!s.isDirectory()) continue;
    const sub = path.join(root, s.name);
    for (const name of await fs.readdir(sub).catch(() => [])) {
      const f = path.join(sub, name);
      const st = await fs.stat(f).catch(() => null);
      if (!st?.isFile()) continue;
      // Недописанные .tmp старше часа — тоже мусор.
      const old = name.endsWith('.tmp') ? st.mtimeMs < Date.now() - 3_600_000 : st.mtimeMs < edge;
      if (!old) { kept++; keptBytes += st.size; continue; }
      if (!dry) await fs.rm(f).catch(() => {});
      removed++; removedBytes += st.size;
    }
  }
  const mb = (b) => Math.round(b / 1e5) / 10;
  return { root, days, dry, kept, keptMB: mb(keptBytes), removed, removedMB: mb(removedBytes) };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = process.argv.slice(2);
  const days = Number(args.find((a) => a.startsWith('--days='))?.split('=')[1]) || 60;
  console.log(JSON.stringify(await cleanImgCache({ days, dry: args.includes('--dry') })));
}
