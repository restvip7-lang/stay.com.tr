import type { APIRoute } from 'astro';
import { SITE } from '../i18n/config';
import { getItems, getComplexes, stats, catUrl, type Item } from '../lib/catalog';
import { cityBySlug, districtBySlug, countryBySlug } from '../lib/geo';
import { SERVICES, serviceUrl } from '../lib/services';
import { site } from '../lib/site';

/** /llms.txt (ТЗ 11.1): о компании, разделы и ценовая сводка по городам и районам из каталога. */
const eur = (n: number | null) => (n == null ? '—' : `€${Math.round(n).toLocaleString('en-GB')}`);

export const GET: APIRoute = async () => {
  const items = (await getItems()).filter((x) => x.deal === 'sale');
  const complexes = await getComplexes();
  const groups = new Map<string, { label: string; href: string; list: Item[] }>();
  const push = (k: string, label: string, href: string, x: Item) => {
    const g = groups.get(k) ?? { label, href, list: [] };
    g.list.push(x);
    groups.set(k, g);
  };
  for (const x of items) {
    const city = cityBySlug(x.city)!;
    const country = countryBySlug(x.country)!;
    push(x.city, `${city.name.en}, ${country.name.en}`, catUrl('en', { country: x.country, city: x.city, deal: 'sale' }), x);
    if (x.district) push(`${x.city}/${x.district}`, `${districtBySlug(x.city, x.district)?.name.en ?? x.district}, ${city.name.en}`, catUrl('en', { country: x.country, city: x.city, district: x.district, deal: 'sale' }), x);
  }
  const rows = [...groups.values()].filter((g) => g.list.length >= 3).sort((a, b) => b.list.length - a.list.length).map((g) => {
    const s = stats(g.list);
    return `- [${g.label}](${SITE}${g.href}): ${s.n} properties for sale; prices ${eur(s.minPrice)} – ${eur(s.maxPrice)}; average ${eur(s.avgPerM2)}/m²`;
  });
  const updated = new Date().toISOString().slice(0, 10);
  const body = `# Stay Property

> Stay Property is a licensed real estate agency and developer based in Alanya, Turkey. We sell new-build and resale apartments, villas and duplexes in Turkey (mainly Alanya and the Antalya coast), Northern Cyprus and the UAE, offer long-term rentals, and support buyers with legal checks, residence permits and Turkish citizenship by investment.

Languages: Russian (/ru/), English (/en/), Turkish (/tr/), German (/de/), Serbian Latin (/sr/).
Contacts: ${site.phones[0].label} (WhatsApp), ${site.email}, ${site.address}.

## Main sections

- [Property for sale in Turkey](${SITE}${catUrl('en', { country: 'turkey', deal: 'sale' })})
- [Property for sale in Alanya](${SITE}${catUrl('en', { country: 'turkey', city: 'alanya', deal: 'sale' })})
- [Long-term rentals in Turkey](${SITE}${catUrl('en', { country: 'turkey', deal: 'rent' })})
- [New developments and residential complexes](${SITE}${catUrl('en', { country: 'turkey' }, { complexes: true })}) — ${complexes.length} complexes
- [Services](${SITE}${serviceUrl('en')}): ${SERVICES.map((s) => `[${s.tr.en.title}](${SITE}${serviceUrl('en', s.slug)})`).join(', ')}
- [Blog: laws, area guides, news](${SITE}/en/blog/)
- [About](${SITE}/en/about/), [Team](${SITE}/en/team/), [Reviews](${SITE}/en/reviews/), [Contacts](${SITE}/en/contacts/)

## Price summary (sale)

Data updated: ${updated}. Prices are indicative and in euros; this is not a public offer. Check the current price and availability with a Stay Property manager.

${rows.join('\n')}
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cdn-cache-control': 'public, s-maxage=1800, stale-while-revalidate=86400' } });
};
