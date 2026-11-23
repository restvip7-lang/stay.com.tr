/**
 * Хранилище настроек сайта (главная, SEO, отметки объектов, ИИ-помощник, счётчики).
 * Два режима:
 * - Vercel: файлы в Vercel Blob (нужен BLOB_READ_WRITE_TOKEN);
 * - свой сервер (VPS): JSON-файлы на диске в папке STAY_DATA_DIR (по умолчанию ./data).
 * Режим диска включается переменной STAY_STORAGE=fs или сам, если сайт запущен не на Vercel и токена Blob нет.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const env = (k: string): string | undefined => process.env[k] || (import.meta.env as Record<string, string | undefined>)[k];

export const dataDir = () => path.resolve(env('STAY_DATA_DIR') || 'data');
export const blobToken = () => env('BLOB_READ_WRITE_TOKEN');

export function storeMode(): 'blob' | 'fs' {
  const m = env('STAY_STORAGE');
  if (m === 'fs' || m === 'blob') return m;
  if (blobToken()) return 'blob';
  return env('VERCEL') ? 'blob' : 'fs';
}


/** Ключ вида config/home.json → путь внутри папки данных (без выхода за её пределы). */
const fileOf = (key: string) => {
  const p = path.resolve(dataDir(), key);
  if (!p.startsWith(dataDir() + path.sep)) throw new Error('bad key');
  return p;
};

/** Можно ли сохранять настройки. */
export function storeReady(): boolean {
  return storeMode() === 'fs' || !!blobToken();
}

export async function readJson<T = unknown>(key: string): Promise<T | null> {
  try {
    if (storeMode() === 'fs') return JSON.parse(await readFile(fileOf(key), 'utf8')) as T;
    if (!blobToken()) return null;
    const { head } = await import('@vercel/blob');
    const meta = await head(key, { token: blobToken() });
    const res = await fetch(`${meta.url}?v=${meta.uploadedAt.valueOf()}`, { cache: 'no-store' });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null; // файла ещё нет
  }
}

export async function writeJson(key: string, value: unknown, pretty = false): Promise<void> {
  const body = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
  if (storeMode() === 'fs') {
    const f = fileOf(key);
    await mkdir(path.dirname(f), { recursive: true });
    // Пишем во временный файл и переименовываем: файл не окажется недописанным при сбое.
    const tmp = `${f}.${process.pid}.tmp`;
    await writeFile(tmp, body, 'utf8');
    await rename(tmp, f);
    return;
  }
  if (!blobToken()) throw new Error('Хранилище не подключено');
  const { put } = await import('@vercel/blob');
  await put(key, body, { access: 'public', token: blobToken(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
}
