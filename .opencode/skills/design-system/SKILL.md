---
name: Design System
description: Правила визуального дизайна и UI-системы сайта — дизайн-токены, типографика, отступы, цвет, сетка, компоненты, адаптивность и анти-шаблонные ограничения. Использовать при создании или правке любых страниц и компонентов.
---

# Design System

Цель — предсказуемый аккуратный интерфейс, а не «сгенерированный на вид» сайт.

## Токены (сначала, потом стили)

Всё оформление задаётся CSS-переменными в `src/styles/tokens.css`:

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;

  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem);
  --step-0:  clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1:  clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --step-2:  clamp(1.56rem, 1.4rem + 0.8vw, 2rem);
  --step-3:  clamp(1.95rem, 1.7rem + 1.25vw, 2.75rem);
  --step-4:  clamp(2.44rem, 2rem + 2vw, 3.75rem);

  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;    --space-6: 1.5rem;  --space-8: 2rem;
  --space-12: 3rem;   --space-16: 4rem;   --space-24: 6rem;

  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 20px;

  --color-bg: #fbfaf8;
  --color-surface: #ffffff;
  --color-text: #1a1a18;
  --color-muted: #6b6a66;
  --color-border: #e4e1db;
  --color-accent: #1f5eff;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-md: 0 8px 24px rgb(0 0 0 / 0.08);
}
```

Правила:

- Компоненты используют **только токены** — без «магических» px и hex.
- Не больше 6 размеров текста (модульный масштаб).
- Максимум 2 семейства шрифтов: sans для текста, display для акцентов.
- Тёмная тема — переопределение тех же переменных, а не второй набор классов.

## Сетка и адаптивность

- Контейнер: `width: min(100% - 2.5rem, 72rem); margin-inline: auto;`
- Верстать от 320 px. Проверять 320 / 768 / 1024 / 1440.
- Мобильная навигация — с первого дня.
- Никаких горизонтальных скроллов и обрезанного текста.

## Компоненты

Один компонент — один файл, типизированные пропсы, состояния default / hover / focus-visible / disabled.
Минимальный набор: Button, Link, Card, Badge, Input, Header, Footer, Container, Prose, Section.

Фокус виден всегда:

```css
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
```

## Анти-шаблонные ограничения (обязательно)

- Не более одного градиента на страницу; никаких «фиолетовых ИИ-градиентов».
- Иконки — один набор (например, Lucide), не эмодзи вместо иконок.
- Не скруглять всё до `rounded-3xl`.
- Тени только `--shadow-sm` / `--shadow-md`, без свечений.
- Главный заголовок — конкретная польза, а не «Добро пожаловать».
- Не более одной акцентной кнопки в зоне видимости.
- Анимации 120–240 мс, `ease-out`, с учётом `prefers-reduced-motion`.
- Отступы секций: 64–96 px на десктопе, 40–56 px на мобиле.

## Детали, которые выдают качество

- `text-wrap: balance` для заголовков.
- `max-width: 65ch` для текста статей.
- Даты и числа через `Intl.DateTimeFormat` / `Intl.NumberFormat`.
- Оформленные 404 и пустые состояния, а не голый текст.
