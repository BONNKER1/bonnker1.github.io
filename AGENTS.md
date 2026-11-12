# Проект: Boonker — съёмная тонировка по лекалам

## О проекте

Каталог съёмной тонировки по готовым лекалам: силиконовая, жёсткая Premium и классическая
плёнка, передние/задние полусферы и полный комплект. Заказ — через Telegram и маркетплейсы
(Wildberries, Ozon). Услуги установки нет: продаём только комплекты плёнки.

## Стек

- **Astro 7 + TypeScript** (статическая генерация, SSG)
- **Свой CSS на дизайн-токенах** (`src/styles/tokens.css`), Tailwind не используется
- Пакетный менеджер: `pnpm`
- Деплой: Cloudflare Pages (планируется)
- `astro check` работает только с TypeScript 6 (TS 7 не поддерживается)

## Структура

```
src/
  pages/            # маршруты: главная, каталог, типы плёнки, доставка, FAQ, контакты, 404
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

## Что заменить перед запуском

- `src/data/cars.ts` — демо-база (15 марок, 43 модели) на реальную базу лекал из CSV.
- `src/data/site.ts` — Telegram-ник, email, город, домен.
- `astro.config.mjs`, `public/robots.txt` — домен `boonker.ru` указан как placeholder.
- Цены в `src/data/films.ts` — демонстрационные (1 190 / 1 490 / 1 890 ₽).

## Навыки

- `web-build` — полный цикл создания сайта
- `design-system` — визуальные правила и токены
- `web-quality` — производительность, a11y, тесты
- `seo-content` — SEO и структура контента
- `workflow` — процесс работы
