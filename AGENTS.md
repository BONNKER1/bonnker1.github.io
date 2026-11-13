# Проект: Boonker — съёмная тонировка по лекалам

## О проекте

Каталог съёмной тонировки по готовым лекалам: силиконовая, жёсткая Premium и классическая
плёнка, передние/задние полусферы и полный комплект. Заказ — через Telegram и маркетплейсы
(Wildberries, Ozon). Услуги установки нет: продаём только комплекты плёнки.

## Стек

- **Astro 7 + TypeScript** (статическая генерация, SSG)
- **Свой CSS на дизайн-токенах** (`src/styles/tokens.css`), Tailwind не используется
- Пакетный менеджер: `pnpm`
- Деплой: GitHub Pages (`.github/workflows/deploy.yml`, адрес `https://bonnker1.github.io/`)
- `astro check` работает только с TypeScript 6 (TS 7 не поддерживается)

## Структура

```
src/
  pages/            # маршруты: главная, каталог, типы плёнки, плёнка на отрез, доставка, FAQ, контакты, 404
    catalog/
      index.astro           # каталог с фильтром по марке и поиском
      [brand]/index.astro   # страница марки
      [brand]/[model].astro # карточка модели + конфигуратор
  layouts/          # BaseLayout.astro (SEO, OG, JSON-LD)
  components/       # Header, Footer, CarPicker, ProductCard, FilmCard, GlassSwatch и др.
  data/
    cars.ts         # база лекал: марки → модели (демо-набор, заменить реальной базой)
    films.ts        # типы плёнки, комплекты, VLT, формула цены
    site.ts         # бренд, ссылки, контакты, статистика
  lib/schema.ts     # JSON-LD: Organization, WebSite, BreadcrumbList, Product, FAQPage
  styles/           # tokens.css, global.css
public/             # favicon, robots.txt, og-default.png
scripts/            # импорт базы лекал и служебные скрипты
```

## Команды

```sh
pnpm dev       # локальная разработка
pnpm build     # сборка в dist/
pnpm preview   # просмотр сборки
pnpm check     # astro check (типы и ошибки в .astro)
pnpm og        # пересобрать OG-картинку из SVG
```

## Правила

- Стили — только через токены из `src/styles/tokens.css`, без Tailwind-классов.
- Данные товаров — в `src/data/`, контент страниц — в `.astro`-шаблонах.
- Один `h1` на страницу; метаданные и JSON-LD — через `src/layouts/BaseLayout.astro` и `src/lib/schema.ts`.
- Цены считаются одной формулой `priceFor()` в `src/data/films.ts` — не дублировать расчёт в разметке.
- Перед «готово» — `pnpm build`, `pnpm check` и чек-лист `.opencode/skills/web-build/references/launch-checklist.md`.

## База лекал

- `src/data/cars.ts` генерируется: 33 марки, 227 моделей из ассортимента WB-магазина.
- У каждой модели есть артикулы WB по типам плёнки (`wb`) — кнопка «Купить на Wildberries» ведёт на конкретный товар.
- Пересборка: `node scripts/wb-import.mjs 585856` → `node scripts/build-cars.mjs`.
- Правила разбора названий и ручные поправки — в начале `scripts/build-cars.mjs`.

## Что заменить перед запуском

- `src/data/site.ts` — email (сейчас пустой, скрыт), домен при переезде с GitHub Pages.
- `astro.config.mjs`, `public/robots.txt` — домен `bonnker1.github.io`.
- Цены в `src/data/films.ts` — реальные: 1 050 / 1 350 / 1 550 / 1 750 ₽ за 2 стекла,
  полный комплект 2×, лобовое 1 850 ₽ (только ВАЗ), отрез 1 750 ₽/пог. м.

## Навыки

- `web-build` — полный цикл создания сайта
- `design-system` — визуальные правила и токены
- `web-quality` — производительность, a11y, тесты
- `seo-content` — SEO и структура контента
- `workflow` — процесс работы
