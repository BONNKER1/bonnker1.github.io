# Импорт ассортимента с Wildberries

Wildberries и Ozon закрывают автоматический доступ капчей, поэтому список товаров нужно
забрать из браузера, где страница продавца уже открыта. Подойдёт любой из трёх способов.

## Способ 1. Консоль браузера (самый быстрый)

1. Откройте `https://www.wildberries.ru/seller/585856` и дождитесь загрузки товаров.
2. Нажмите `F12` → вкладка **Console**.
3. Вставьте код ниже и нажмите Enter:

```js
(() => {
  const seen = new Map();
  document.querySelectorAll('a[href*="/catalog/"]').forEach((a) => {
    const id = (a.getAttribute('href') || '').match(/catalog\/(\d+)/)?.[1];
    if (!id || seen.has(id)) return;
    const card = a.closest('article') || a.closest('div[class*="product-card"]') || a;
    const text = (card.innerText || '').replace(/\s+/g, ' ').trim();
    seen.set(id, { id, href: a.href.split('?')[0], text });
  });
  const list = [...seen.values()];
  console.log('Найдено товаров:', list.length);
  copy(JSON.stringify(list, null, 2));
  return list;
})()
```

4. Список скопируется в буфер обмена. Создайте файл `import/wb-products.json` и вставьте туда
   содержимое (или сохраните через блокнот).
5. Напишите в чат «готово» — я разберу файл и соберу базу лекал.

## Способ 2. Ответ API из панели Network (самые полные данные)

1. `F12` → **Network** → фильтр **Fetch/XHR**.
2. Обновите страницу продавца.
3. Найдите запрос, в URL которого есть `catalog.wb.ru` и `supplier=585856`.
4. Правый клик по запросу → **Copy → Copy response**.
5. Сохраните в `import/wb-catalog.json`.

В ответе есть названия, бренды, цены и артикулы — этого достаточно, чтобы собрать базу
автоматически.

## Способ 3. Выгрузка из личного кабинета

В кабинете продавца WB: **Товары → Экспорт** → скачать XLSX/CSV, положить в `import/`.
Подойдёт файл с колонками «Наименование», «Артикул», «Цена».

## Что делать после

Напишите в чат, какой файл положили. Я:

1. разберу товары на марки и модели;
2. заменю демо-базу в `src/data/cars.ts`;
3. прогоню `pnpm build`, `pnpm check`, `pnpm links`;
4. закоммичу и запушу — сайт обновится на GitHub Pages автоматически.
