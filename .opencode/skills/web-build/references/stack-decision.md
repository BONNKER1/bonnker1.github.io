# Выбор стека

| Сценарий | Стек | Почему |
| --- | --- | --- |
| Лендинг, визитка, блог, документация | Astro + Tailwind + TS | 0 KB JS по умолчанию, islands, SSG, Markdown-коллекции |
| Много интерактива, авторизация, SSR на запрос | Next.js (App Router) + TS + Tailwind | RSC, серверные экшены, зрелая экосистема |
| Одна страница без сборки | HTML + CSS (+ минимум JS) | Нет тулчейна, максимальная скорость |
| Нужна CMS для редакторов | Astro + headless CMS (Sanity / Contentful) | Контент отдельно от кода |

## Правила выбора

1. Сайт контентный — Astro, не Next.js.
2. Нужен React-остров — подключать точечно (`client:visible`, `client:idle`).
3. Нет аргумента за фреймворк — брать более простой вариант.
4. Пакетный менеджер `pnpm`. Форматирование и линт — Biome (или ESLint + Prettier).
5. Не добавлять зависимость, если 20 строк кода решают задачу.

## Базовые команды Astro

```sh
pnpm create astro@latest .
pnpm astro add tailwind sitemap
pnpm dev
pnpm build
pnpm preview
```
