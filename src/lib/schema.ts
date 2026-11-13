import { site } from '../data/site';
import type { CarBrand, CarModel } from '../data/cars';
import type { Film } from '../data/films';

export function canonicalUrl(pathname: string): string {
  return new URL(pathname, site.url).href;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    description: site.description,
    ...(site.email ? { email: site.email } : {}),
    logo: canonicalUrl('/og-default.png'),
    sameAs: [site.marketplaces.wildberries, site.marketplaces.ozon, site.telegram],
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressCountry: 'RU',
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: 'ru-RU',
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export function breadcrumbsSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.url),
    })),
  };
}

export function productSchema({
  brand,
  model,
  film,
  lowPrice,
  highPrice,
  offerCount = 3,
}: {
  brand: CarBrand;
  model: CarModel;
  film: Film;
  lowPrice: number;
  highPrice: number;
  offerCount?: number;
}) {
  const name = `Тонировка ${brand.name} ${model.name} — ${film.name}`;
  const url = `/catalog/${brand.slug}/${model.slug}/`;
  const meta = [model.years, model.body].filter(Boolean).join(', ');
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: `${name}. Лекала под ${brand.name} ${model.name}${meta ? ` (${meta})` : ''}. Передние и задние полусферы, полный комплект.`,
    url: canonicalUrl(url),
    image: canonicalUrl('/og-default.png'),
    brand: { '@type': 'Brand', name: site.name },
    category: 'Автомобильная тонировка',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice,
      highPrice,
      offerCount,
      availability: 'https://schema.org/InStock',
      url: canonicalUrl(url),
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
