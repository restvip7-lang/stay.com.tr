import type { APIRoute } from 'astro';
import { isLang } from '../../../i18n/config';
import { t } from '../../../i18n/ui';
import { getComplexes } from '../../../lib/catalog';
import { cityBySlug, districtBySlug } from '../../../lib/geo';
import { moneyL } from '../../../lib/format';
import { ogJpeg } from '../../../lib/og';

/** OG-картинка жилого комплекса: фото + название, район, цена от. */
export const GET: APIRoute = async ({ params, url }) => {
  const q = url.searchParams.get('lang');
  const lang = isLang(q) ? q : 'en';
  const d = t(lang);
  const c = (await getComplexes()).find((x) => x.slug === params.slug);
  if (!c) return new Response('Not found', { status: 404 });
  const place = [c.district ? districtBySlug(c.city, c.district)?.name[lang] : null, cityBySlug(c.city)?.name[lang]].filter(Boolean).join(', ');
  return ogJpeg({
    title: c.title,
    subtitle: place,
    price: c.priceFrom ? d.from(moneyL(lang, c.priceFrom)) : d.priceOnRequest,
    chips: [d.nav.complexes, ...(c.rooms ?? []).slice(0, 3)],
    image: c.image,
  });
};
