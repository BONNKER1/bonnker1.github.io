# Boonker — съёмная тонировка по лекалам

Статический каталог съёмной тонировки по готовым лекалам: силиконовая, классическая,
атермальная и жёсткая Premium плёнка, передние и задние полусферы, полный комплект и
плёнка на отрез.

- **Стек:** Astro 7 + TypeScript, собственный CSS на дизайн-токенах (без Tailwind)
- **Сборка:** `pnpm build` → `dist/`
- **Хостинг:** GitHub Pages (workflow `.github/workflows/deploy.yml`)

## Локальный запуск

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # сборка в dist/
pnpm preview    # просмотр сборки
pnpm check      # проверка типов в .astro
pnpm links      # проверка битых внутренних ссылок
```

## Деплой на GitHub Pages

Сайт рассчитан на корневой адрес `https://bonnker1.github.io/`, поэтому репозиторий должен
называться `bonnker1.github.io`.

1. Создайте на GitHub публичный репозиторий `bonnker1.github.io`.
2. Запушьте ветку `main`:

   ```sh
   git remote add origin https://github.com/bonnker1/bonnker1.github.io.git
   git push -u origin main
   ```

3. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Каждый пуш в `main` пересобирает и публикует сайт. Адрес — `https://bonnker1.github.io/`.

## Где менять данные

- `src/data/cars.ts` — база лекал (марки → модели). Демо-набор, заменить реальной выгрузкой.
- `src/data/films.ts` — типы плёнки, комплекты, цены, `priceFor()`.
- `src/data/site.ts` — бренд, Telegram, город, ссылки на маркетплейсы, домен.
- `src/lib/schema.ts` — JSON-LD (Organization, WebSite, BreadcrumbList, Product, FAQPage).
