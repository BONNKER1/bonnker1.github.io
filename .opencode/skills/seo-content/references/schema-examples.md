# Шаблоны JSON-LD

Подставляй реальные значения, а не примеры. Все URL — абсолютные.

## Статья (BlogPosting)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Заголовок статьи",
  "description": "Краткое описание статьи",
  "image": "https://example.com/og/article.png",
  "datePublished": "2026-01-15",
  "dateModified": "2026-02-01",
  "author": { "@type": "Person", "name": "Имя автора" },
  "publisher": {
    "@type": "Organization",
    "name": "Название сайта",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blog/slug/"
  }
}
```

## Сайт (WebSite) + Организация

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Название сайта",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Название сайта",
      "publisher": { "@id": "https://example.com/#organization" }
    }
  ]
}
```

## Хлебные крошки

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Блог", "item": "https://example.com/blog/" },
    { "@type": "ListItem", "position": 3, "name": "Статья" }
  ]
}
```

## FAQ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Вопрос?",
      "acceptedAnswer": { "@type": "Answer", "text": "Ответ." }
    }
  ]
}
```

Валидация: <https://search.google.com/test/rich-results>
