import type { CarBrand, CarModel } from '../data/cars';
import { films } from '../data/films';
import { site } from '../data/site';

/** Название авто для поиска на маркетплейсе: «Toyota Camry». */
export function modelLabel(brand: CarBrand, model: CarModel): string {
  return `${brand.name.replace(/\s*\([^)]*\)/, '')} ${model.name}`;
}

export function wbProductUrl(id?: number): string {
  return id ? `https://www.wildberries.ru/catalog/${id}/detail.aspx` : site.marketplaces.wildberries;
}

export function wbSearchUrl(query: string): string {
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(query)}`;
}

export function ozonSearchUrl(query: string): string {
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(query)}`;
}

/** Прямая карточка WB, если она есть в выгрузке, иначе — поиск по магазину. */
export function modelWbLink(brand: CarBrand, model: CarModel): { href: string; exact: boolean } {
  const id =
    model.wb?.silicone ??
    model.wb?.classic ??
    model.wb?.athermal ??
    model.wb?.hard;
  return id
    ? { href: wbProductUrl(id), exact: true }
    : { href: wbSearchUrl(modelLabel(brand, model)), exact: false };
}

/** Прямая карточка Ozon (любой комплект), иначе — поиск по магазину. */
export function modelOzonLink(brand: CarBrand, model: CarModel): { href: string; exact: boolean } {
  for (const film of films) {
    const offers = model.ozon?.[film.id];
    if (!offers) continue;
    for (const place of ['front', 'full', 'rear', 'windshield'] as const) {
      const offer = offers[place];
      if (offer?.id) return { href: `https://www.ozon.ru/product/${offer.id}/`, exact: true };
    }
  }
  return { href: ozonSearchUrl(modelLabel(brand, model)), exact: false };
}
