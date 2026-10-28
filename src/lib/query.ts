import type { ListingQuery } from './api';
import type { TypeGroup } from './dict';

const GROUPS = ['apartments', 'villas', 'duplexes', 'all'];

/** Параметры фильтра из адреса страницы (?type=villas&price_to=300000…). */
export function parseQuery(sp: URLSearchParams, operation: 'sale' | 'rental'): ListingQuery {
  const n = (k: string) => {
    const v = Number((sp.get(k) || '').replace(/\s/g, ''));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  const type = sp.get('type') || (operation === 'sale' ? 'apartments' : 'all');
  return {
    operation,
    group: (GROUPS.includes(type) ? type : 'all') as TypeGroup | 'all',
    country: sp.get('country') || undefined,
    city: sp.get('city') || undefined,
    area: sp.get('area') || undefined,
    ref: sp.get('ref') || undefined,
    priceFrom: n('price_from'),
    priceTo: n('price_to'),
    seaFrom: n('sea_from'),
    seaTo: n('sea_to'),
    rooms: sp.getAll('rooms').filter(Boolean),
    sort: (sp.get('sort') as ListingQuery['sort']) || undefined,
    page: n('page'),
  };
}
