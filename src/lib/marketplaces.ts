import type { CarBrand, CarModel } from '../data/cars';
import { films } from '../data/films';
import { site } from '../data/site';

/** Название авто для текстов и метаданных: «Toyota Camry». */
export function modelLabel(brand: CarBrand, model: CarModel): string {
  return `${brand.name.replace(/\s*\([^)]*\)/, '')} ${model.name}`;
}

const GENERATION_WITH_NUMBER =
  /(?:^|[\s,(])(?:\d{1,2}|I{1,3}|IV|V|VI{0,3}|IX|X)\s*[-–—]?\s*(?:е\s+)?поколени[ея](?=[\s,)]|$)/gi;

/**
 * Служебные слова каталога лекал, которых нет в названиях товаров на маркетплейсах.
 * Если оставить их в запросе, поиск выдаёт коврики и запчасти вместо тонировки.
 * В JS `\b` и `\w` не работают с кириллицей, поэтому границы — через `[\s,]`.
 */
const SEARCH_NOISE: RegExp[] = [
  // «2 поколение», «10-е поколение», «II поколение», «5 пок.», «1пок»
  GENERATION_WITH_NUMBER,
  /(?:^|[\s,(])\d{1,2}\s*(?:х\s*)?пок(?:оление)?\.?(?=[\s,)]|$)/gi,
  /(?:^|[\s,(\d])пок(?:оление)?\.?(?=[\s,)]|$)/gi,
  // «2х дверный», «5 дверей», «3 дв.», «4 д»
  /(?:^|[\s,(])\d{1,2}\s*(?:х\s*)?(?:дв\.?|двери|дверей|дверн[а-яё]*|д)(?=[\s,)]|$)/gi,
  // «3d», «купе», «седан»…
  /(?:^|[\s,(])(?:3d|5d|coupe|купе|седан|хэтчбек|хетчбек|универсал|пикап|кабриолет|минивэн|кроссовер|внедорожник|лифтбек)(?=[\s,)]|$)/gi,
  // «с форточкой», «без форточки», «форточка»
  /(?:^|[\s,(])(?:с|со)\s+форточк[а-яё]*(?=[\s,)]|$)/gi,
  /(?:^|[\s,(])без\s+форточк[а-яё]*(?=[\s,)]|$)/gi,
  /(?:^|[\s,(])форточк[а-яё]*(?=[\s,)]|$)/gi,
  // «до рестайлинга», «рестайлинг»
  /(?:^|[\s,(])(?:до|после)\s+рестайлинг[а-яё]*(?=[\s,)]|$)/gi,
  /(?:^|[\s,(])рестайлинг[а-яё]*(?=[\s,)]|$)/gi,
  // «он же», «кузов», «стекло», одиночное «и»
  /(?:^|[\s,(])(?:он|она|они)\s+же(?=[\s,)]|$)/gi,
  /(?:^|[\s,(])кузов[а-яё]*(?=[\s,)]|$)/gi,
  /(?:^|[\s,(])стекл[а-яё]*(?=[\s,)]|$)/gi,
  /(?:^|[\s,(])и(?=[\s,)]|$)/g,
];

/**
 * Короткое название для поиска на маркетплейсе: «Volvo XC70 2 поколение» → «Volvo XC70».
 * Поколение, кузов и число дверей есть в каталоге лекал, но не в названиях товаров на WB/Ozon,
 * поэтому в запросе они только мешают.
 */
export function searchLabel(brand: CarBrand, model: CarModel): string {
  const brandName = brand.name.replace(/\s*\([^)]*\)/, '');
  let name = model.name.normalize('NFC').replace(GENERATION_WITH_NUMBER, ' ');
  for (const re of SEARCH_NOISE) name = name.replace(re, ' ');
  name = name
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s+([,)])/g, '$1')
    .replace(/([,(])\s+/g, '$1')
    .replace(/[,\-–—\s]+/g, ' ')
    .trim();
  return `${brandName} ${name || model.name}`.replace(/\s+/g, ' ').trim();
}

/**
 * Поисковый запрос, по которому находятся именно комплекты тонировки.
 * Если знаем название нашей карточки — берём его: маркетплейс найдёт именно её.
 * Годы добавляем, только когда такая карточка в магазине действительно есть.
 */
export function searchQuery(
  brand: CarBrand,
  model: CarModel,
  phrase?: string,
): string {
  if (phrase) return `тонировка ${phrase}`;
  const base = `тонировка ${searchLabel(brand, model)}`;
  const years = (model.searchYears ?? '').trim();
  return years ? `${base} ${years}` : base;
}

/** Запрос для поиска по нашему магазину на Wildberries. */
export function wbSearchQuery(brand: CarBrand, model: CarModel): string {
  return searchQuery(brand, model, model.wbPhrase);
}

/** Запрос для поиска лобового стекла на Wildberries. */
export function wbWindshieldSearchQuery(brand: CarBrand, model: CarModel): string {
  if (model.wbWindshieldPhrase) return `тонировка ${model.wbWindshieldPhrase}`;
  const years = (model.searchYears ?? '').trim();
  return `тонировка лобовое стекло ${searchLabel(brand, model)}${years ? ` ${years}` : ''}`;
}

/** Запрос для поиска по нашему магазину на Ozon. */
export function ozonSearchQuery(brand: CarBrand, model: CarModel): string {
  return searchQuery(brand, model, model.ozonPhrase);
}

/** Запрос для поиска лобового стекла на Ozon. */
export function ozonWindshieldSearchQuery(brand: CarBrand, model: CarModel): string {
  if (model.ozonWindshieldPhrase) return `тонировка ${model.ozonWindshieldPhrase}`;
  const years = (model.searchYears ?? '').trim();
  return `тонировка лобовое стекло ${searchLabel(brand, model)}${years ? ` ${years}` : ''}`;
}

export function wbProductUrl(id?: number): string {
  return id ? `https://www.wildberries.ru/catalog/${id}/detail.aspx` : site.marketplaces.wildberries;
}

export function wbSearchUrl(query: string): string {
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(query)}&sort=popular&fsupplier=585856`;
}

export function ozonSearchUrl(query: string): string {
  return `https://www.ozon.ru/seller/boonker-semnaya-tonirovka/products/?text=${encodeURIComponent(query)}`;
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
    : { href: wbSearchUrl(wbSearchQuery(brand, model)), exact: false };
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
  return { href: ozonSearchUrl(ozonSearchQuery(brand, model)), exact: false };
}
