import type { APIRoute } from 'astro';
import { brands, type CarBrand } from '../../../data/cars';
import { chunkModels, renderModelRow } from '../../../lib/brand-models';

/** Статика: файл собирается на этапе билда. */
export const prerender = true;

interface Props {
  brand: CarBrand;
}

/** Только марки, которым есть что догружать: первая страница уже в HTML. */
export function getStaticPaths() {
  return brands
    .filter((brand) => chunkModels(brand.models).length > 1)
    .map((brand) => ({
      params: { brand: brand.slug },
      props: { brand } satisfies Props,
    }));
}

/**
 * Остальные страницы моделей марки готовыми HTML-строками.
 * Клиент по кнопке «Показать ещё» подставляет их в таблицу.
 */
export const GET: APIRoute = ({ props }) => {
  const brand = props.brand as CarBrand;
  const more = chunkModels(brand.models)
    .slice(1)
    .map((chunk) => chunk.map((model) => renderModelRow(brand, model)));

  return new Response(JSON.stringify({ more }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
