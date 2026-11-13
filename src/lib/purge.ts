/** Сброс кэша страниц по тегам (ТЗ 2.6 п. 3, 14): страницы помечаются тегами site и lang-X в middleware. */
import { pageCacheOn, purgePages } from './pageCache';

export async function purge(tags: string[] = ['site']): Promise<boolean> {
  // Свой сервер: кэш в памяти процесса.
  if (pageCacheOn()) {
    purgePages(tags);
    return true;
  }
  try {
    const { invalidateByTag } = await import('@vercel/functions');
    await invalidateByTag(tags);
    return true;
  } catch {
    return false; // локально тегов нет
  }
}
