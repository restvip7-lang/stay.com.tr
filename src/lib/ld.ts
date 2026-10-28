/**
 * Structured data (ТЗ 9): RealEstateAgent в каждом layout, WebSite + SearchAction на главной,
 * BreadcrumbList, ItemList, FAQPage, RealEstateListing + Offer, ApartmentComplex + AggregateOffer,
 * VideoObject, Article, Service, Review + AggregateRating. Всё рендерится на сервере.
 */
import { SITE, type Lang } from '../i18n/config';
import { site } from './site';

const abs = (p: string) => (p.startsWith('http') ? p : SITE + p);
const ctx = 'https://schema.org';
export const ORG_ID = `${SITE}/#organization`;

export function orgLd(lang: Lang) {
  return {
    '@context': ctx,
    '@type': 'RealEstateAgent',
    '@id': ORG_ID,
    name: 'Stay Property',
    url: `${SITE}/${lang}/`,
    logo: `${SITE}/logo.png`,
    image: `${SITE}/og-default.jpg`,
    telephone: '+905301782916',
    email: site.email,
    address: { '@type': 'PostalAddress', streetAddress: 'Oba Mah., Mesut Cd., No: 54/A', addressLocality: 'Alanya', addressRegion: 'Antalya', postalCode: '07400', addressCountry: 'TR' },
    sameAs: site.socials.map((s) => s.href),
    areaServed: [
      { '@type': 'Country', name: 'Turkey' },
      { '@type': 'Country', name: 'Northern Cyprus' },
      { '@type': 'Country', name: 'United Arab Emirates' },
    ],
  };
}

export function websiteLd(lang: Lang) {
  return {
    '@context': ctx,
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: `${SITE}/${lang}/`,
    name: 'Stay Property',
    inLanguage: lang,
    publisher: { '@id': ORG_ID },
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/${lang}/search/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  };
}

export function breadcrumbLd(items: { label: string; href?: string }[]) {
  return {
    '@context': ctx,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, ...(it.href ? { item: abs(it.href) } : {}) })),
  };
}

export function itemListLd(items: { url: string; name: string }[]) {
  return {
    '@context': ctx,
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(it.url), name: it.name })),
  };
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    '@context': ctx,
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })),
  };
}

const HOUSE = new Set(['villas', 'townhouses']);

export function listingLd(x: {
  url: string; name: string; description: string; images: string[]; price: number | null; deal: 'sale' | 'rent'; type: string;
  rooms: number | null; area: number | null; city: string; region: string; country: string; sold?: boolean; updated?: string;
}) {
  const accommodation = x.type === 'land' || x.type === 'commercial'
    ? undefined
    : {
        '@type': HOUSE.has(x.type) ? 'House' : 'Apartment',
        name: x.name,
        ...(x.area ? { floorSize: { '@type': 'QuantitativeValue', value: x.area, unitCode: 'MTK' } } : {}),
        ...(x.rooms != null ? { numberOfRooms: x.rooms } : {}),
        address: { '@type': 'PostalAddress', addressCountry: x.country, addressLocality: x.city, addressRegion: x.region },
      };
  return {
    '@context': ctx,
    '@type': 'RealEstateListing',
    url: abs(x.url),
    name: x.name,
    description: x.description,
    ...(x.images.length ? { image: x.images.map(abs) } : {}),
    ...(x.updated ? { dateModified: x.updated } : {}),
    ...(x.price
      ? {
          offers: {
            '@type': 'Offer',
            price: x.price,
            priceCurrency: 'EUR',
            availability: x.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
            businessFunction: x.deal === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
            seller: { '@id': ORG_ID },
          },
        }
      : {}),
    ...(accommodation ? { about: accommodation } : {}),
  };
}

export function complexLd(x: {
  url: string; name: string; description: string; images: string[]; city: string; region: string; country: string;
  lat: number | null; lng: number | null; units: number | null; amenities: string[]; low: number | null; high: number | null; offers: number;
}) {
  return {
    '@context': ctx,
    '@type': 'ApartmentComplex',
    url: abs(x.url),
    name: x.name,
    description: x.description,
    address: { '@type': 'PostalAddress', addressCountry: x.country, addressLocality: x.city, addressRegion: x.region },
    ...(x.lat && x.lng ? { geo: { '@type': 'GeoCoordinates', latitude: x.lat, longitude: x.lng } } : {}),
    ...(x.units ? { numberOfAccommodationUnits: x.units } : {}),
    ...(x.images.length ? { photo: x.images.slice(0, 10).map((u) => ({ '@type': 'ImageObject', url: abs(u) })) } : {}),
    ...(x.amenities.length ? { amenityFeature: x.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })) } : {}),
    ...(x.low
      ? { offers: { '@type': 'AggregateOffer', lowPrice: x.low, highPrice: x.high ?? x.low, priceCurrency: 'EUR', offerCount: Math.max(1, x.offers) } }
      : {}),
  };
}

/** YouTube-ролик → VideoObject (ТЗ 9, 13). */
export function videoLd(url: string, name: string, description: string, uploadDate: string) {
  const id = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
  if (!id) return null;
  return {
    '@context': ctx,
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    uploadDate,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

export function articleLd(x: { url: string; headline: string; image: string | null; published: string; modified: string; author: { name: string; url: string; org?: boolean }; lang: Lang }) {
  return {
    '@context': ctx,
    '@type': 'Article',
    mainEntityOfPage: abs(x.url),
    headline: x.headline.slice(0, 110),
    inLanguage: x.lang,
    ...(x.image ? { image: [abs(x.image)] } : {}),
    datePublished: x.published,
    dateModified: x.modified,
    author: { '@type': x.author.org ? 'Organization' : 'Person', name: x.author.name, url: abs(x.author.url) },
    publisher: { '@id': ORG_ID },
  };
}

export function serviceLd(x: { url: string; name: string; description: string; lang: Lang }) {
  return {
    '@context': ctx,
    '@type': 'Service',
    url: abs(x.url),
    name: x.name,
    description: x.description,
    inLanguage: x.lang,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Turkey' },
  };
}

/** Отзывы. AggregateRating — только если у всех отзывов есть оценка (выдумывать рейтинг нельзя). */
export function reviewsLd(reviews: { author: string; date?: string; text: string; rating?: number | null }[]) {
  if (!reviews.length) return null;
  const rated = reviews.every((r) => typeof r.rating === 'number');
  const avg = rated ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length : 0;
  return {
    '@context': ctx,
    '@type': 'RealEstateAgent',
    '@id': ORG_ID,
    name: 'Stay Property',
    ...(rated ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Math.round(avg * 10) / 10, reviewCount: reviews.length, bestRating: 5, worstRating: 1 } } : {}),
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      ...(r.date ? { datePublished: r.date } : {}),
      reviewBody: r.text,
      ...(typeof r.rating === 'number' ? { reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 } } : {}),
    })),
  };
}
