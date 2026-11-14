# Импорт ассортимента: лекала, Wildberries и Ozon

## База лекал (lekalo-rf.ru)

Основной источник марок и моделей — публичный каталог `https://lekalo-rf.ru/bokovie_stekla/`
(OpenCart). Парсер `scripts/lekalo-import.mjs` собирает марки, названия позиций, годы выпуска
и ссылки в `import/lekalo.json` (около 100 марок / 1800 позиций).

```sh
node scripts/lekalo-import.mjs     # обновить import/lekalo.json
```

`scripts/build-cars.mjs` сливает эту базу с товарами WB и Ozon: чистит названия, вытаскивает
годы и тип кузова, разводит ГАЗ / УАЗ / Волга, объединяет одинаковые модели, добавляет
недостающие марки и генерирует `src/data/cars.ts` + `public/catalog-index.json`.

## Wildberries

Данные магазина `https://www.wildberries.ru/seller/585856` лежат в `import/wb-api.json`
(1100 товаров: id, название, бренд). Из них берутся артикулы `wb` для прямых ссылок.

## Ozon

Данные магазина `https://www.ozon.ru/seller/boonker-semnaya-tonirovka/` лежат в `import/ozon-api.json`
(товары: id, название, url, тип плёнки, комплект, варианты по светопропусканию). Из них
строится поле `ozon` в `src/data/cars.ts`.

## Обновить базу (обычный путь)

```sh
node scripts/lekalo-import.mjs      # выгрузить каталог лекал в import/lekalo.json
node scripts/wb-import.mjs 585856   # выгрузить товары с WB в import/wb-api.json
node scripts/ozon-import.mjs        # выгрузить товары с Ozon в import/ozon-api.json
node scripts/build-cars.mjs         # собрать src/data/cars.ts и public/catalog-index.json
pnpm build && pnpm check && pnpm links
```

`scripts/wb-import.mjs` запускает отдельный Chrome (headless не проходит антибот-проверку
Wildberries, поэтому окно открывается на пару минут), ждёт загрузки каталога продавца,
прокручивает страницу до конца и сохраняет тела JSON-ответов каталога. Если WB отвечает
`Проверяем браузер`, скрипт повторяет попытку; при повторной неудаче запустите его ещё раз.

`scripts/build-cars.mjs` разбирает названия вида
`Boonker / СЪЁМНАЯ ТОНИРОВКА Ваз 2109 2114 2115` на марку и модель, склеивает варианты
одной модели, вытаскивает годы и русские написания для поиска. Затем сливает результат с
базой лекал: чистит названия и годы, выносит тип кузова, разводит ГАЗ / УАЗ / Волга и
добавляет модели без артикулов. Словарь марок и ручные поправки (`LEKALO_MODEL_FIX`,
`DISPLAY_FIX`, `MODEL_RENAME`, `POPULAR`) — в начале файла. Что не является лекалом
(лобовое, полоса, ракель, холсты), отбрасывается и попадает в `import/skipped.txt`.

## Если автоматический путь не работает

Wildberries и Ozon закрывают доступ по TLS-отпечатку и капчей, поэтому иногда нужен браузер
пользователя. Тогда подойдёт один из ручных способов.

### Копирование текста страницы (без консоли)

1. Откройте `https://www.wildberries.ru/seller/585856`.
2. Прокрутите вниз до конца, пока не перестанут подгружаться товары.
3. Кликните по пустому месту страницы, нажмите `Ctrl+A`, затем `Ctrl+C`.
4. Текст можно передать в чат — его разберут вручную.

### Консоль браузера

> Chrome блокирует вставку: один раз вручную наберите `allow pasting` и нажмите Enter.

```js
(() => {
  const seen = new Map();
  document.querySelectorAll('a[href*="/catalog/"]').forEach((a) => {
    const id = (a.getAttribute('href') || '').match(/catalog\/(\d+)/)?.[1];
    if (!id || seen.has(id)) return;
    const card = a.closest('article') || a.closest('div[class*="product-card"]') || a;
    seen.set(id, { id, href: a.href.split('?')[0], text: (card.innerText || '').replace(/\s+/g, ' ').trim() });
  });
  const list = [...seen.values()];
  console.log('Найдено товаров:', list.length);
  copy(JSON.stringify(list, null, 2));
  return list;
})()
```

### Ответ API из панели Network

`F12` → **Network** → **Fetch/XHR** → обновить страницу → найти запрос с `catalog.wb.ru`
и `supplier=585856` → правый клик → **Copy → Copy response** → сохранить в `import/`.

### Выгрузка из личного кабинета

**Товары → Экспорт** → XLSX/CSV с колонками «Наименование», «Артикул», «Цена».
