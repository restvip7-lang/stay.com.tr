import type { APIRoute } from 'astro';
import { isLang } from '../../../../i18n/config';
import { t } from '../../../../i18n/ui';
import { findItem } from '../../../../lib/catalog';
import { cityBySlug, districtBySlug } from '../../../../lib/geo';
import { TYPE_WORDS } from '../../../../lib/segments';
import { moneyL, numL } from '../../../../lib/format';
import { ogJpeg } from '../../../../lib/og';
import { findSeen } from '../../../../lib/seen';

/** OG-картинка объекта: фото + тип, комнатность, площадь, район, цена. */
export const GET: APIRoute = async ({ params, url }) => {
  const q = url.searchParams.get('lang');
  const lang = isLang(q) ? q : 'en';
  const d = t(lang);
  const deal = params.deal === 'rent' ? 'rent' : 'sale';
  const id = params.id ?? '';
  const x = (await findItem(id)) ?? (await findSeen(deal, id));
  if (!x || x.deal !== deal) return new Response('Not found', { status: 404 });
  const place = [x.district ? districtBySlug(x.city, x.district)?.name[lang] : null, cityBySlug(x.city)?.name[lang]].filter(Boolean).join(', ');
  return ogJpeg({
    title: `${TYPE_WORDS[lang][x.type].one}${x.rooms ? ` ${x.rooms}` : ''}${x.area ? `, ${numL(lang, x.area)} ${d.m2}` : ''}`,
    subtitle: place,
    price: x.price ? moneyL(lang, x.price) + (x.deal === 'rent' ? d.perMonth : '') : d.priceOnRequest,
    chips: [x.deal === 'rent' ? d.rent : d.sale, `ID ${("ref" in x && x.ref) || x.id}`],
    image: x.image,
  });
};
