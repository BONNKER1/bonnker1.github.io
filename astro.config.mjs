import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://boonker.ru',
  integrations: [sitemap()],
  // 'true' сохраняет пробелы между inline-элементами (в v7 по умолчанию 'jsx').
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
