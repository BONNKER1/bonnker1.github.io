import { modelSearchText, type CarBrand, type CarModel } from '../data/cars';
import { modelOzonLink, modelWbLink } from './marketplaces';

/** Сколько моделей показывать на странице марки за раз. */
export const MODELS_PER_PAGE = 50;

/** Экранирование для HTML-текста и значений атрибутов. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Разбивает список моделей на страницы по 50 штук. */
export function chunkModels(
  models: CarModel[],
  size: number = MODELS_PER_PAGE,
): CarModel[][] {
  const chunks: CarModel[][] = [];
  for (let i = 0; i < models.length; i += size) {
    chunks.push(models.slice(i, i + size));
  }
  return chunks;
}

/**
 * HTML-строка строки таблицы моделей.
 *
 * Единый источник разметки: её используют и страница марки (первые 50 моделей),
 * и JSON-эндпоинт с остальными страницами — поэтому «Показать ещё» подставляет
 * в таблицу ровно такие же строки, какие отрендерил бы Astro.
 */
export function renderModelRow(brand: CarBrand, model: CarModel): string {
  const wb = modelWbLink(brand, model);
  const ozon = modelOzonLink(brand, model);
  const href = `/catalog/${brand.slug}/${model.slug}/`;
  const body = model.body
    ? `<span class="models__body">${escapeHtml(model.body)}</span>`
    : '';

  return (
    `<tr data-row data-search="${escapeHtml(modelSearchText(brand, model))}">` +
    `<td class="models__name"><a href="${escapeHtml(href)}">${escapeHtml(model.name)}</a>${body}</td>` +
    `<td class="models__years">${escapeHtml(model.years ?? '—')}</td>` +
    `<td class="models__buy">` +
    `<a class="mkt mkt--wb" href="${escapeHtml(wb.href)}" target="_blank" rel="noopener nofollow" ` +
    `title="${wb.exact ? 'Товар на Wildberries' : 'Поиск на Wildberries'}">WB</a>` +
    `<a class="mkt mkt--oz" href="${escapeHtml(ozon.href)}" target="_blank" rel="noopener nofollow" ` +
    `title="${ozon.exact ? 'Товар на Ozon' : 'Поиск на Ozon'}">Ozon</a>` +
    `</td>` +
    `</tr>`
  );
}

/** Компактная ссылка на модель — для блока «все модели» внизу страницы. */
export function renderModelLink(brand: CarBrand, model: CarModel): string {
  const href = `/catalog/${brand.slug}/${model.slug}/`;
  const label = model.years ? `${model.name} (${model.years})` : model.name;
  return `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`;
}
