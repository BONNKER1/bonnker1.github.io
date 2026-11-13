// Генерация src/data/cars.ts из выгрузки Wildberries (import/wb-api.json).
// Запуск: node scripts/build-cars.mjs
import fs from 'node:fs';

/* ------------------------------------------------------------------ */
/* 1. Словарь марок                                                    */
/* ------------------------------------------------------------------ */

/** [канонический slug, отображаемое имя, алиасы (в нижнем регистре), сортировка] */
const MAKES = [
  ['lada', 'Lada (ВАЗ)', ['lada', 'ваз', 'лада', 'ba3', 'baz'], 0],
  ['toyota', 'Toyota', ['toyota', 'тойота'], 1],
  ['bmw', 'BMW', ['bmw', 'бмв'], 2],
  ['citroen', 'Citroen', ['citroen', 'ситроен'], 3],
  ['chevrolet', 'Chevrolet', ['chevrolet', 'шевроле'], 4],
  ['dodge', 'Dodge', ['dodge', 'додж'], 5],
  ['daewoo', 'Daewoo', ['daewoo', 'дэу', 'деу'], 6],
  ['acura', 'Acura', ['acura', 'акура'], 7],
  ['audi', 'Audi', ['audi', 'ауди'], 8],
  ['volkswagen', 'Volkswagen', ['volkswagen', 'фольксваген', 'vw'], 9],
  ['nissan', 'Nissan', ['nissan', 'ниссан'], 10],
  ['fiat', 'Fiat', ['fiat', 'фиат'], 11],
  ['kia', 'Kia', ['kia', 'киа'], 12],
  ['ford', 'Ford', ['ford', 'форд'], 13],
  ['opel', 'Opel', ['opel', 'опель'], 14],
  ['skoda', 'Skoda', ['skoda', 'шкода'], 15],
  ['hyundai', 'Hyundai', ['hyundai', 'хендай', 'хундай', 'хёндэ'], 16],
  ['mazda', 'Mazda', ['mazda', 'мазда'], 17],
  ['suzuki', 'Suzuki', ['suzuki', 'сузуки'], 18],
  ['honda', 'Honda', ['honda', 'хонда'], 19],
  ['renault', 'Renault', ['renault', 'рено'], 20],
  ['mitsubishi', 'Mitsubishi', ['mitsubishi', 'мицубиси', 'мицубиши'], 21],
  ['uaz', 'УАЗ', ['uaz', 'уаз'], 22],
  ['volvo', 'Volvo', ['volvo', 'вольво'], 23],
  ['subaru', 'Subaru', ['subaru', 'субару'], 24],
  ['mercedes', 'Mercedes-Benz', ['mercedes', 'мерседес', 'мерс'], 25],
  ['ssangyong', 'SsangYong', ['ssangyong', 'ssang yong', 'ссанг'], 26],
  ['datsun', 'Datsun', ['datsun', 'датсун'], 27],
  ['gaz', 'ГАЗ', ['gaz', 'газ', 'газон', 'газель'], 28],
  ['lexus', 'Lexus', ['lexus', 'лексус'], 29],
  ['geely', 'Geely', ['geely', 'джили'], 30],
  ['volga', 'Волга', ['волга'], 31],
  ['landrover', 'Land Rover', ['land rover', 'ленд ровер'], 32],
  ['baic', 'BAIC', ['baic', 'баик'], 33],
  ['chery', 'Chery', ['chery', 'чери'], 34],
  ['haval', 'Haval', ['haval', 'хавал'], 35],
  ['lifan', 'Lifan', ['lifan', 'лифан'], 36],
  ['greatwall', 'Great Wall', ['great wall', 'грэйт вол'], 37],
];

const MAKE_BY_ALIAS = new Map();
const MAKE_WORDS = new Set();
for (const [slug, name, aliases] of MAKES) {
  for (const a of [slug, name.toLowerCase(), ...aliases]) {
    MAKE_BY_ALIAS.set(a, { slug, name });
    MAKE_WORDS.add(a);
  }
}
MAKE_WORDS.add('мерседес');
MAKE_WORDS.add('ленд');
MAKE_WORDS.add('ровер');
MAKE_WORDS.add('йонг');

/** Что не является лекалом — пропускаем. */
const SKIP = [/^\s*на\s+холсте/i, /ракель/i, /фетр/i, /^полоса\s+на\s+лобовое/i, /^съёмная\s+тонировка$/i, /^тонировка$/i];

const FILM_PREFIX = [
  /^съёмная\s+тонировка\s+жёсткая\s+premium/i,
  /^съёмная\s+тонировка\s+жёсткая/i,
  /^жёсткая\s+тонировка/i,
  /^жесткая\s+тонировка/i,
  /^съёмная\s+тонировка\s+силиконовая/i,
  /^съёмная\s+тонировка\s+на\s+лобовое\s+стекло/i,
  /^съёмная\s+тонировка/i,
  /^съёмная\s+тонировка/i,
  /^тонировка\s+съёмная(\s+силиконовая)?/i,
  /^съёмная\s+тонировка/i,
  /^классическая\s+тонировка/i,
  /^атермальная\s+тонировка/i,
  /^тонировка/i,
  /^съёмная/i,
];

const HOMOGLYPHS = {
  а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x', і: 'i',
  А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', У: 'Y', Х: 'X',
};

function deHomoglyph(word) {
  return [...word].map((ch) => HOMOGLYPHS[ch] ?? ch).join('');
}

function cleanPrefix(name) {
  let t = name.replace(/\s+/g, ' ').trim();
  for (const p of FILM_PREFIX) t = t.replace(p, '').trim();
  return t.replace(/^[-–—\s|,]+/, '').trim();
}


/** Ручные поправки написания моделей. */
const DISPLAY_FIX = {
  'rav 4': 'RAV4',
  'e-tron': 'e-Tron',
  'e-tron sportback': 'e-Tron Sportback',
  'opa': 'OPA',
  'c-crosser': 'C-Crosser',
  lachetti: 'Lacetti',
  kaptu: 'Captur',
  'e-class e-класс': 'E-класс',
};

/** Ручные переименования моделей: ключ `${марка}/${slug}`. */
const MODEL_RENAME = {
  'gaz/next': 'Газон Next',
};
const BODY_WORDS = [
  [/хэтчбек|hatchback/i, 'хэтчбек'],
  [/универсал|wagon/i, 'универсал'],
  [/кроссовер|crossover/i, 'кроссовер'],
  [/внедорожник|suv/i, 'внедорожник'],
  [/минивэн|minivan/i, 'минивэн'],
  [/купе|coupe/i, 'купе'],
  [/седан|sedan/i, 'седан'],
];

const isCyr = (s) => /^[А-Яа-яЁё]/.test(s);const isLatin = (s) => /^[A-Za-z0-9]/.test(s);

function titleize(word) {
  if (/\d/.test(word)) return word.toUpperCase();
  if (word.length <= 3 && /^[a-z]+$/.test(word)) return word.toUpperCase();
  return word[0].toUpperCase() + word.slice(1);
}

function modelTitle(tokens) {
  return tokens.map(titleize).join(' ');
}

function slugify(text) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
    м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ------------------------------------------------------------------ */
/* 2. Разбор названий                                                  */
/* ------------------------------------------------------------------ */

const data = JSON.parse(fs.readFileSync('import/wb-api.json', 'utf8'));

const entries = new Map(); // `${brandSlug}/${modelSlug}` -> {brandSlug, name, years, aliases:Set, count}
const skipped = [];

function detectMake(rest) {
  const lower = rest.toLowerCase();
  const firstTwo = lower.split(' ').slice(0, 2).join(' ');
  if (MAKE_BY_ALIAS.has(firstTwo)) {
    return { make: MAKE_BY_ALIAS.get(firstTwo), tail: rest.split(' ').slice(2).join(' ') };
  }
  const first = lower.split(' ')[0];
  if (MAKE_BY_ALIAS.has(first)) {
    return { make: MAKE_BY_ALIAS.get(first), tail: rest.split(' ').slice(1).join(' ') };
  }
  const fixed = deHomoglyph(first);
  if (MAKE_BY_ALIAS.has(fixed.toLowerCase())) {
    return { make: MAKE_BY_ALIAS.get(fixed.toLowerCase()), tail: rest.split(' ').slice(1).join(' ') };
  }
  return null;
}

for (const product of data) {
  const name = product.name || '';
  if (SKIP.some((re) => re.test(name))) {
    skipped.push(name);
    continue;
  }
  const rest = cleanPrefix(name);
  if (!rest) {
    skipped.push(name);
    continue;
  }
  const detected = detectMake(rest);
  if (!detected) {
    skipped.push(name);
    continue;
  }
  const { make, tail } = detected;
  let modelPart = tail.trim();
  if (!modelPart) {
    if (make.slug === 'gaz') {
      modelPart = 'Газель';
    } else {
      // «Съёмная тонировка Лада» — модель не указана
      skipped.push(name);
      continue;
    }
  }
  modelPart = modelPart.replace(/^(ваз|lada|лада)\s+/i, '');

  let years = '';
  const yearMatch = modelPart.match(/((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|н\.?\s?в\.?)/i);
  if (yearMatch) {
    const to = yearMatch[2].replace(/\s+/g, '').replace(/н\.?в\.?/i, 'н.в.');
    years = `${yearMatch[1]}–${to}`;
    modelPart = modelPart.replace(yearMatch[0], ' ');
  }

  let body = '';
  for (const [re, label] of BODY_WORDS) {
    if (re.test(modelPart)) {
      body = label;
      modelPart = modelPart.replace(re, ' ');
    }
  }

  // Токены: выкидываем мусор, названия марок и повторы.
  let tokens = modelPart
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[.,;:]+/g, ' ')
    .replace(/\b\d{2}\s*[-–—]\s*(?=\s|$)/g, ' ')
    .replace(/[-–—]\s*\d{2}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  // «ку5», «с4» и подобное — русская запись латинской модели: приводим к латинице,
  // а если такая модель уже была раньше в строке — выбрасываем как дубль.
  const seenLatin = new Set();
  tokens = tokens
    .map((t, i) => {
      const hasCyr = /[А-Яа-яЁё]/.test(t);
      if (hasCyr && /\d/.test(t)) {
        const fixed = deHomoglyph(t);
        if (i > 0 && tokens.slice(0, i).some((prev) => /^[A-Za-z0-9]/.test(prev))) return '';
        return fixed;
      }
      return /\d/.test(t) ? deHomoglyph(t) : t;
    })
    .filter(Boolean)
    .filter((t) => {
      const low = t.toLowerCase();
      if (seenLatin.has(low)) return false;
      seenLatin.add(low);
      return true;
    });

  tokens = tokens.filter((t, i) => {
    const low = t.toLowerCase();
    if (!low) return false;
    if (MAKE_WORDS.has(low)) return false;
    if (/^(19|20)\d{2}$/.test(t) && i > 0) return false;
    return true;
  });
  tokens = tokens.filter((t, i) => tokens.indexOf(t) === i);

  let display;
  let aliases = [];

  if (!tokens.length) {
    if (make.slug === 'gaz') {
      display = 'Газель';
    } else if (years) {
      display = years;
      years = '';
    } else {
      skipped.push(name);
      continue;
    }
  }

  const firstCyr = tokens.findIndex((t) => isCyr(t));
  const latinRun = firstCyr === -1 ? tokens : tokens.slice(0, firstCyr);
  const hasLatin = latinRun.length > 0 && latinRun.every((t) => isLatin(t));

  if (hasLatin) {
    display = modelTitle(latinRun);
    aliases = tokens.slice(latinRun.length).filter((t) => isCyr(t) && !/\d/.test(t) && t.length <= 20);
  } else if (!display && tokens.length) {
    display = tokens
      .map((w) => (/\d/.test(w) || w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
      .join(' ');
    aliases = [];
  } else if (!display) {
    skipped.push(name);
    continue;
  }
  display = display.replace(/\s+/g, ' ').trim();
  display = DISPLAY_FIX[display.toLowerCase()] ?? display;
  if (!display) {
    skipped.push(name);
    continue;
  }

  let slug = slugify(display) || slugify(name);
  const renamed = MODEL_RENAME[`${make.slug}/${slug}`];
  if (renamed) {
    display = renamed;
    slug = slugify(display);
  }
  const key = `${make.slug}/${slug}`;
  const prev = entries.get(key);
  if (prev) {
    prev.count += 1;
    if (years) prev.yearSet.add(years);
    for (const a of aliases) prev.aliases.add(a.toLowerCase());
  } else {
    entries.set(key, {
      brandSlug: make.slug,
      brandName: make.name,
      name: display,
      slug,
      years,
      yearSet: new Set(years ? [years] : []),
      body,
      bodySet: new Set(body ? [body] : []),
      aliases: new Set(aliases.map((a) => a.toLowerCase())),
      count: 1,
    });
  }
}

// Годы и тип кузова оставляем, только если данных не противоречат друг другу.
for (const e of entries.values()) {
  e.years = e.yearSet.size === 1 ? [...e.yearSet][0] : '';
  e.body = e.bodySet.size === 1 ? [...e.bodySet][0] : '';
}

/* ------------------------------------------------------------------ */
/* 3. Сборка файла                                                     */
/* ------------------------------------------------------------------ */

const byBrand = new Map();
for (const e of entries.values()) {
  if (!byBrand.has(e.brandSlug)) byBrand.set(e.brandSlug, { slug: e.brandSlug, name: e.brandName, models: [] });
  byBrand.get(e.brandSlug).models.push(e);
}

for (const brand of byBrand.values()) {
  brand.models.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'));
}

const brandList = [...byBrand.values()].sort(
  (a, b) => b.models.length - a.models.length || a.name.localeCompare(b.name, 'ru'),
);

// «Популярные» — витрина на главной: самые спрашиваемые лекала.
const POPULAR = [
  ['lada', ['2109', '2114', '2115']],
  ['lada', ['2105', '2107']],
  ['lada', ['Гранта']],
  ['lada', ['Веста']],
  ['toyota', ['Camry']],
  ['toyota', ['Corolla']],
  ['bmw', ['5']],
  ['kia', ['Rio']],
  ['hyundai', ['Solaris']],
  ['volkswagen', ['Polo']],
  ['renault', ['Logan']],
  ['chevrolet', ['Cruze']],
];

const popular = new Set();
for (const [brandSlug, needles] of POPULAR) {
  const candidates = [...entries.values()].filter((e) => e.brandSlug === brandSlug);
  const exact = candidates.find((e) => needles.some((n) => e.name === n));
  const hit = exact ?? candidates.find((e) => needles.some((n) => e.name.includes(n)));
  if (hit) popular.add(`${hit.brandSlug}/${hit.slug}`);
}

const esc = (s) => s.replace(/'/g, "\\'");

let out = `// ВНИМАНИЕ: файл сгенерирован из выгрузки Wildberries (import/wb-api.json).
// Пересобрать: node scripts/build-cars.mjs
// Правки вручную лучше вносить в scripts/build-cars.mjs (словарь марок и правила разбора).

export interface CarModel {
  slug: string;
  name: string;
  years?: string;
  body?: string;
  popular?: boolean;
  /** Русские названия и частые варианты написания для поиска. */
  aliases?: string[];
}

export interface CarBrand {
  slug: string;
  name: string;
  aliases?: string[];
  models: CarModel[];
}

const BRAND_ALIASES: Record<string, string[]> = {
${MAKES.map(([slug, , aliases]) => `  ${slug}: [${aliases.filter((a) => a !== slug).map((a) => `'${esc(a)}'`).join(', ')}],`).join('\n')}
};

/** База лекал магазина. */
export const brands: CarBrand[] = [
`;

for (const brand of brandList) {
  const aliases = brand.slug === 'lada' ? ['лада', 'ваз'] : undefined;
  out += `  {\n    slug: '${brand.slug}',\n    name: '${esc(brand.name)}',\n`;
  if (aliases) out += `    aliases: [${aliases.map((a) => `'${a}'`).join(', ')}],\n`;
  out += `    models: [\n`;
  for (const m of brand.models) {
    const parts = [`slug: '${m.slug}'`, `name: '${esc(m.name)}'`];
    if (m.years) parts.push(`years: '${esc(m.years)}'`);
    if (m.body) parts.push(`body: '${esc(m.body)}'`);
    if (popular.has(`${brand.slug}/${m.slug}`)) parts.push('popular: true');
    const al = [...m.aliases].filter((a) => a && a !== m.name.toLowerCase());
    if (al.length && al.length <= 4) parts.push(`aliases: [${al.map((a) => `'${esc(a)}'`).join(', ')}]`);
    out += `      { ${parts.join(', ')} },\n`;
  }
  out += `    ],\n  },\n`;
}

out += `];

export const totalModels = brands.reduce((sum, brand) => sum + brand.models.length, 0);

export function getBrand(slug: string): CarBrand | undefined {
  return brands.find((brand) => brand.slug === slug);
}

export function getModel(brandSlug: string, modelSlug: string) {
  const brand = getBrand(brandSlug);
  const model = brand?.models.find((item) => item.slug === modelSlug);
  return brand && model ? { brand, model } : undefined;
}

export const popularModels = brands.flatMap((brand) =>
  brand.models.filter((model) => model.popular).map((model) => ({ brand, model })),
);

/** Строка «2006–2011 · седан» без лишних разделителей. */
export function modelMeta(model: CarModel): string {
  return [model.years, model.body].filter(Boolean).join(' · ');
}

/** Все написания модели для поиска. */
export function modelSearchText(brand: CarBrand, model: CarModel): string {
  return [brand.name, ...(brand.aliases ?? []), ...(BRAND_ALIASES[brand.slug] ?? []), model.name, ...(model.aliases ?? [])]
    .join(' ')
    .toLowerCase();
}
`;

fs.writeFileSync('src/data/cars.ts', out, 'utf8');

console.log('марок:', brandList.length, '| моделей:', entries.size, '| пропущено:', skipped.length);
console.log('популярные:', [...popular].join(', '));
fs.writeFileSync('import/skipped.txt', skipped.join('\n'), 'utf8');
