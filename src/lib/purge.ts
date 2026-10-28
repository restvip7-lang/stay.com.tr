/** Сброс кэша CDN по тегам (ТЗ 2.6 п. 3, 14): страницы помечаются тегами site и lang-X в middleware. */
export async function purge(tags: string[] = ['site']): Promise<boolean> {
  try {
    const { invalidateByTag } = await import('@vercel/functions');
    await invalidateByTag(tags);
    return true;
  } catch {
    return false; // локально тегов нет
  }
}
