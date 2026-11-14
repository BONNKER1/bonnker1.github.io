// Импорт базы лекал с публичного каталога lekalo-rf.ru.
// Собирает марки → модели → годы выпуска из карточек «передние боковые стёкла».
// Запуск: node scripts/lekalo-import.mjs
//
// Результат: import/lekalo.json
//   { generatedAt, brands: [{ slug, name, url, items: [{ title, name, years, url }] }] }
//
// Скрипт вежливый: не больше CONCURRENCY параллельных запросов и пауза между ними.
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://lekalo-rf.ru';
const CATALOG_PATH = '/bokovie_stekla/';
const LIMIT = 120;
const CONCURRENCY = 3;
const PAUSE_MS = 120;
const OUT = path.resolve('import/lekalo.json');

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'ru-RU,ru;q=0.9',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, attempt = 1) {
  try {
    const response = await fetch(url, { headers, redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (attempt >= 3) throw error;
    await sleep(600 * attempt);
    return fetchText(url, attempt + 1);
  }
}

const decode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const stripTags = (value) => decode(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** «Toyota 4Runner (08.2009 - 2020) лекало…» → «2009–2020». */
function parseYears(title) {
  const cleaned = title.replace(/\s*лекало[\s\S]*$/i, ' ');
  const matches = [...cleaned.matchAll(/(\d{4})\s*[-–—]\s*(н\.?\s?в\.?|\d{4}|\.{2,})/gi)];
  if (!matches.length) return undefined;
  const [, from, rawTo] = matches[matches.length - 1];
  let to = rawTo.replace(/\s+/g, '');
  if (/^(\.{2,}|н\.?в\.?)$/i.test(to)) to = 'н.в.';
  if (to === from) return from;
  return `${from}–${to}`;
}

/** Убираем марку, годы и служебный хвост — остаётся поколение/кузов. */
function parseName(title, brandName) {
  let name = title.replace(/\s*лекало[\s\S]*$/i, ' ').trim();
  const brandPattern = new RegExp(`^${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
  name = name.replace(brandPattern, '');
  name = name
    .replace(/\(?\s*\d{1,2}\.\d{4}\s*[-–—]\s*(?:\d{1,2}\.\d{4}|\d{4}|н\.?\s?в\.?|\.{2,})\s*\)?/gi, ' ')
    .replace(/\(?\s*\d{4}\s*[-–—]\s*(?:\d{4}|н\.?\s?в\.?|\.{2,})\s*\)?/gi, ' ')
    .replace(/\s*[-–—,;]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return name || title.replace(/\s*лекало[\s\S]*$/i, '').trim();
}

/** «Лекала для тонировки на передние боковые стекла Акура (Acura)» → «Acura». */
function cleanBrandName(raw) {
  let name = raw
    .replace(/^Лекала для тонировки на передние боковые стекла\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const paren = name.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (paren) name = /[A-Za-z]/.test(paren[2]) ? paren[2].trim() : paren[1].trim();

  if (name.includes('/')) {
    const parts = name.split('/').map((part) => part.trim()).filter(Boolean);
    name = parts.find((part) => /[A-Za-z]/.test(part)) ?? parts[0];
  }

  return name.trim();
}

function parseProducts(html) {
  const items = [];
  const seen = new Set();
  const titleRe = /itemprop="name">([\s\S]*?)<\/span>/g;
  const hrefRe = /itemprop="url"\s+href="([^"]+)"/g;

  const titles = [...html.matchAll(titleRe)].map((match) => stripTags(match[1]));
  const hrefs = [...html.matchAll(hrefRe)].map((match) => decode(match[1]));
  const count = Math.min(titles.length, hrefs.length);

  for (let index = 0; index < count; index += 1) {
    const title = titles[index];
    const url = hrefs[index];
    if (!/лекало/i.test(title) || seen.has(url)) continue;
    seen.add(url);
    items.push({ title, url });
  }
  return items;
}

function maxPage(html) {
  const pages = [...html.matchAll(/[?&]page=(\d+)/g)].map((match) => Number(match[1]));
  return pages.length ? Math.max(...pages) : 1;
}

async function loadBrand(link) {
  const slug = link.replace(/\/$/, '').split('/').pop();
  const url = `${BASE}${link}?limit=${LIMIT}`;
  const first = await fetchText(url);
  const h1 = first.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const name = cleanBrandName(h1 ? stripTags(h1[1]) : slug.replace(/^bok_/, ''));
  const items = parseProducts(first);
  const pages = Math.min(maxPage(first), 15);

  for (let page = 2; page <= pages; page += 1) {
    await sleep(PAUSE_MS);
    const html = await fetchText(`${url}&page=${page}`);
    items.push(...parseProducts(html));
  }

  // Дубли по ссылке (например, товар выведен в блоке «рекомендуемые»).
  const unique = new Map();
  for (const item of items) unique.set(item.url, item);

  const models = [...unique.values()]
    .filter((item) => !/^базы лекал/i.test(item.name))
    .map((item) => ({
      ...item,
      name: parseName(item.title, name),
      years: parseYears(item.title),
    }));

  console.log(`${name.padEnd(24)} ${String(models.length).padStart(4)} моделей, страниц ${pages}`);
  return { slug, name, url: `${BASE}${link}`, items: models };
}

async function main() {
  console.log('Читаю список марок…');
  const index = await fetchText(`${BASE}${CATALOG_PATH}`);
  const links = [
    ...new Set(
      [...index.matchAll(/href="([^"]*\/bokovie_stekla\/[^"/]+\/)"/g)]
        .map((match) => match[1])
        .map((href) => href.replace(BASE, ''))
        .filter((href) => !href.includes('stekla_gruzovie')),
    ),
  ].sort();

  console.log(`Найдено марок: ${links.length}`);

  const brands = [];
  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < links.length) {
      const link = links[cursor];
      cursor += 1;
      try {
        brands.push(await loadBrand(link));
      } catch (error) {
        console.error(`Ошибка на ${link}: ${error.message}`);
      }
      await sleep(PAUSE_MS);
    }
  });

  await Promise.all(workers);
  brands.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  const total = brands.reduce((sum, brand) => sum + brand.items.length, 0);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), brands }, null, 2),
    'utf8',
  );
  console.log(`\nГотово: ${brands.length} марок, ${total} моделей → ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
