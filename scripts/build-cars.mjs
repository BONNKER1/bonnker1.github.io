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

/** Все написания марки по её slug — для чистки названий моделей и поиска. */
const MAKE_ALIASES_BY_SLUG = new Map();
for (const [slug, name, aliases] of MAKES) {
  MAKE_ALIASES_BY_SLUG.set(slug, [name, name.replace(/\s*\([^)]*\)/, ''), ...aliases]);
}

/** Марки, которых не было в словаре: добавляются из базы лекал на лету. */
const DYNAMIC_MAKES = [];

/** «Лекала для тонировки на передние боковые стекла Акура (Acura)» → «Acura». */
function normalizeBrandName(raw) {
  let name = raw
    .replace(/^Лекала для тонировки на передние боковые стекла\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const paren = name.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (paren) {
    const outer = paren[1].trim();
    const inner = paren[2].trim();
    name = /[A-Za-z]/.test(inner) ? inner : outer;
  }

  if (name.includes('/')) {
    const parts = name.split('/').map((part) => part.trim()).filter(Boolean);
    name = parts.find((part) => /[A-Za-z]/.test(part)) ?? parts[0];
  }

  return name.trim();
}

/** Марка из базы лекал → канонический slug и имя (или новая марка). */
function resolveMake(rawName) {
  const name = normalizeBrandName(rawName);
  const key = name.toLowerCase();

  if (MAKE_BY_ALIAS.has(key)) return MAKE_BY_ALIAS.get(key);

  const slug = slugify(name) || key.replace(/[^a-z0-9]+/g, '-');
  const make = { slug, name };
  MAKE_BY_ALIAS.set(key, make);
  MAKE_BY_ALIAS.set(slug, make);
  MAKE_WORDS.add(key);
  DYNAMIC_MAKES.push(make);
  MAKE_ALIASES_BY_SLUG.set(slug, [name, key]);
  return make;
}

/** Что не является лекалом — пропускаем. */
const SKIP = [/^\s*на\s+холсте/i, /ракель/i, /фетр/i, /^полоса\s+на\s+лобовое/i, /^съёмная\s+тонировка$/i, /^тонировка$/i];

const FILM_PREFIX = [
  /^съёмная\s+многоразовая\s+силиконовая\s+тонировка/i,
  /^съёмная\s+многоразовая\s+тонировка/i,
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

/** Тип плёнки по названию товара: артикулы WB раскладываем по типам. */
function filmKind(name) {
  if (/жёстк|жестк|premium|премиум|strong/i.test(name)) return 'hard';
  if (/атермальн/i.test(name)) return 'athermal';
  if (/классическ/i.test(name)) return 'classic';
  return 'silicone';
}

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
  'lada/priora-2110-2111-2112': '2110 2111 2112',
  'dodge/durango-dakota': 'Durango',
  'citroen/c4-spacetourer-c': 'C4 Spacetourer',
  'citroen/grand-c4': 'Grand C4 Spacetourer',
};

/** Дополнительные написания для поиска: `${марка}/${slug}` → алиасы. */
const EXTRA_ALIASES = {
  'lada/2110-2111-2112': ['приора'],
  'dodge/durango': ['дакота'],
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

const wbData = JSON.parse(fs.readFileSync('import/wb-api.json', 'utf8'));
// Варианты (процент затемнения) карточек WB — из экспорта личного кабинета.
const WB_VARIANTS_FILE = 'import/wb-variants.json';
const WB_VARIANTS = fs.existsSync(WB_VARIANTS_FILE)
  ? JSON.parse(fs.readFileSync(WB_VARIANTS_FILE, 'utf8'))
  : {};

// Варианты (процент затемнения) карточек Ozon — из экспорта личного кабинета.
const OZON_VARIANTS_FILE = 'import/ozon-variants.json';
const OZON_VARIANTS = fs.existsSync(OZON_VARIANTS_FILE)
  ? JSON.parse(fs.readFileSync(OZON_VARIANTS_FILE, 'utf8'))
  : {};
const OZON_FILE = 'import/ozon-api.json';
const ozonData = fs.existsSync(OZON_FILE)
  ? JSON.parse(fs.readFileSync(OZON_FILE, 'utf8'))
  : { products: [] };
const data = [
  ...wbData.map((product) => ({ ...product, source: 'wb' })),
  ...(ozonData.products ?? []).map((product) => ({ ...product, source: 'ozon' })),
];

const entries = new Map(); // `${brandSlug}/${modelSlug}` -> {brandSlug, name, years, aliases:Set, count}
const skipped = [];
const ozonSkipped = [];
const ozonPending = [];
// Годы товаров магазина по «ядру» названия: нужны, чтобы поисковый запрос
// не требовал от карточки лишних слов (тогда маркетплейс ничего не находит).
const storeYears = new Map();
// Название карточки магазина по «ядру» названия — из него получается точный запрос.
const storeNames = new Map();

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

/** Прикрепляем товар Ozon к модели: тип плёнки → комплект → варианты по светопропусканию. */
function attachOzon(entry, product) {
  const film = product.film;
  // У карточек про боковые стёкла Ozon нет характеристики «Место установки» —
  // считаем их полным комплектом (обе стороны).
  const place = product.place || 'full';
  if (!film) {
    ozonSkipped.push(product.name || String(product.id));
    return;
  }
  const byFilm = (entry.ozon[film] ??= {});
  const vlt = {};
  for (const [value, item] of Object.entries(product.vlt ?? {})) {
    const sku = Number(item?.id);
    if (Number(value) && sku) vlt[Number(value)] = sku;
  }
  const prev = byFilm[place];
  
  // Добавляем проценты из экспорта Ozon, если они там есть
  const variant = OZON_VARIANTS[String(product.id)];
  if (variant) {
    const vltNum = Number(String(variant).replace('%', ''));
    if (vltNum) {
      vlt[vltNum] = Number(product.id);
    }
  }

  if (!prev) {
    byFilm[place] = { id: Number(product.id), vlt };
    if (place === 'windshield') entry.ozonWindshieldPhrase = storePhrase(product.name);
    else entry.ozonPhrase = storePhrase(product.name);
    return;
  }
  const nextCount = Object.keys(vlt).length;
  const prevCount = Object.keys(prev.vlt ?? {}).length;
  Object.assign((prev.vlt ??= {}), vlt);
  if (nextCount > prevCount) prev.id = Number(product.id);
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
  } else {
    // «07-16г», «98-04» — короткий диапазон лет в названиях WB.
    const shortMatch = modelPart.match(/(?:^|[\s,])(\d{2})\s*[-–—]\s*(\d{2})\s*г?(?=[\s,]|$)/i);
    if (shortMatch) {
      const century = (yy) => (Number(yy) >= 70 ? `19${yy}` : `20${yy}`);
      years = `${century(shortMatch[1])}–${century(shortMatch[2])}`;
      modelPart = modelPart.replace(shortMatch[0], ' ');
    }
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
  noteStoreYears(make.slug, display, years);
  // Лобовое стекло — отдельная карточка, в общий запрос она не годится.
  if (!/лобов/i.test(name)) {
    noteStoreName(make.slug, display, name, product.source === 'ozon' ? 'ozon' : 'wb');
  }
  // Ozon-товары прикрепляем позже: сначала собираем базу лекал, чтобы понимать,
  // к какой модели (с учётом поколения и годов) относится товар.
  if (product.source === 'ozon') {
    ozonPending.push({ product, brandSlug: make.slug, display, years, key });
    continue;
  }
  for (const extra of EXTRA_ALIASES[key] ?? []) aliases.push(extra);
  const prev = entries.get(key);
  if (prev) {
    if (product.source !== 'ozon') prev.count += 1;
    if (years) prev.yearSet.add(years);
    if (body) prev.bodySet.add(body);
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
      wb: {},
      wbVlt: {},
      ozon: {},
      count: 1,
    });
  }

  const entry = entries.get(key);
  if (product.source === 'ozon') {
    attachOzon(entry, product);
    continue;
  }

  // Артикул WB для типа плёнки: из нескольких карточек берём лучшую.
  // Карточки, которых нет в наличии, WB открывает с ошибкой — их пропускаем.
  // Лобовое стекло — отдельный комплект, его не мешаем с боковыми стёклами.
  const kind = /лобов/i.test(name) ? 'windshield' : filmKind(name);
  const feedbacks = Number(product.feedbacks) || 0;
  const quantity = product.quantity;
  const stock = quantity === null || quantity === undefined ? undefined : Number(quantity) > 0;
  if (stock === false) continue;
  const current = entry.wb[kind];
  const candidate = { id: Number(product.id), feedbacks, stock };
  if (betterWb(candidate, current)) {
    entry.wb[kind] = candidate;
    if (kind === 'windshield') entry.wbWindshieldPhrase = storePhrase(product.name);
    else entry.wbPhrase = storePhrase(product.name);
  }

  // Процент затемнения этой карточки (если знаем) — по нему открываем точный вариант.
  const variant = WB_VARIANTS[String(product.id)];
  if (variant) {
    const vlt = Number(String(variant).replace('%', ''));
    if (vlt) {
      const byVlt = (entry.wbVlt[kind] ??= {});
      byVlt[vlt] = Number(product.id);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 2b. База лекал с lekalo-rf.ru                                       */
/* ------------------------------------------------------------------ */

const LEKALO_FILE = 'import/lekalo.json';
const lekaloData = fs.existsSync(LEKALO_FILE)
  ? JSON.parse(fs.readFileSync(LEKALO_FILE, 'utf8'))
  : { brands: [] };

/** Служебные позиции каталога («Базы лекал оптом») — не модели. */
const LEKALO_JUNK = /^базы лекал/i;

const normName = (value) =>
  deHomoglyph(value).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();

/** «(04.1989 - 1995)», «2007 - ...», «2016 - 05.2020», «2024» → «1989–1995» / «2024». */
function parseLekaloYears(title) {
  const text = title.replace(/\s*лекало[\s\S]*$/i, ' ');
  const shortOpen = text.match(/\((\d{2})\s*[-–—]\s*\.{2,}\)/);
  if (shortOpen) return `20${shortOpen[1]}–н.в.`;
  const shortRange = text.match(/\((\d{2})\s*[-–—]\s*(\d{2})\)/);
  if (shortRange) return `20${shortRange[1]}–20${shortRange[2]}`;
  // «Accord 6 america 97-02» — сокращённые годы без скобок.
  const bareShort = text.match(/\b(\d{2})\s*[-–—]\s*(\d{2})\b/);
  if (bareShort) {
    const century = (yy) => (Number(yy) >= 70 ? `19${yy}` : `20${yy}`);
    return `${century(bareShort[1])}–${century(bareShort[2])}`;
  }
  const ranges = [
    ...text.matchAll(
      /((?:\d{1,2}\.)?(?:19|20)\d{2})\s*[-–—]\s*((?:\d{1,2}\.)?(?:19|20)\d{2}|н\.?\s?в\.?|\.{2,})/gi,
    ),
  ];
  if (ranges.length) {
    const [, rawFrom, rawTo] = ranges[ranges.length - 1];
    const from = rawFrom.replace(/^\d{1,2}\./, '');
    let to = rawTo.replace(/\s+/g, '');
    if (/^\d{1,2}\./.test(to)) to = to.replace(/^\d{1,2}\./, '');
    if (/^(\.{2,}|н\.?в\.?)$/i.test(to)) to = 'н.в.';
    return to === from ? from : `${from}–${to}`;
  }
  const singles = [...text.matchAll(/\b((?:19|20)\d{2})\b/g)];
  return singles.length ? singles[singles.length - 1][1] : undefined;
}

/** Слова, которые можно срезать в начале названия модели. */
const MAKE_PREFIX_ONLY = {
  gaz: ['газ', 'gaz'],
  uaz: ['уаз', 'uaz'],
  volga: ['волга'],
  lada: ['lada', 'ваз', 'лада', 'ba3', 'baz'],
};

/** Убираем марку в начале названия: «Toyota 4Runner…» → «4Runner…», «ВАЗ Лада Нива» → «Нива». */
function stripBrandPrefix(name, make) {
  const variants = new Set(
    (MAKE_PREFIX_ONLY[make.slug] ?? MAKE_ALIASES_BY_SLUG.get(make.slug) ?? [make.name]).map((alias) =>
      normName(alias),
    ),
  );
  let words = name.split(/\s+/).filter(Boolean);

  for (let pass = 0; pass < 3 && words.length; pass += 1) {
    const firstTwo = normName(words.slice(0, 2).join(' '));
    if (words.length > 2 && variants.has(firstTwo)) {
      words = words.slice(2);
      continue;
    }
    if (variants.has(normName(words[0]))) {
      words = words.slice(1);
      continue;
    }
    break;
  }

  return words.join(' ');
}

/** Название модели без годов, марки и служебного хвоста «лекало…». */
function cleanLekaloModel(title, make) {
  let name = title.replace(/\s*лекало[\s\S]*$/i, ' ').trim();
  name = name.replace(/\s*\(\d{2}\s*[-–—]\s*\.{2,}\)\s*/g, ' ');
  name = name.replace(/\s*\(\d{2}\s*[-–—]\s*\d{2}\)\s*/g, ' ');
  name = name.replace(/\b\d{2}\s*[-–—]\s*\d{2}\b/g, ' ');
  name = name.replace(
    /\(?\s*(?:\d{1,2}\.)?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:\d{1,2}\.)?(?:19|20)\d{2}|н\.?\s?в\.?|\.{2,})\s*\)?/gi,
    ' ',
  );
  name = name.replace(/\(?\s*(?:\d{1,2}\.)?(?:19|20)\d{2}\s*\)?/g, ' ');
  name = stripBrandPrefix(name, make);
  // Частые опечатки-гомоглифы в названиях каталога.
  name = name.replace(/tou[аa]reg/gi, 'Touareg').replace(/^x(\d)\b/i, 'X$1');
  return name
    .replace(/^[-–—,;:\s]+/, '')
    .replace(/[-–—,;:\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** «ПАТРИОТ» → «Патриот», «largus (ларгус)» → «Largus (ларгус)». */
function smartCase(name) {
  if (name.length > 3 && name === name.toUpperCase() && /[А-ЯЁ]/.test(name)) {
    return name
      .toLowerCase()
      .replace(/(^|[\s-])([а-яё])/g, (_, prefix, char) => prefix + char.toUpperCase());
  }
  return name
    .split(' ')
    .map((word) => (/^[A-Z]{4,}$/.test(word) ? word[0] + word.slice(1).toLowerCase() : word))
    .join(' ')
    .replace(/\b([a-zа-я])(?=\d)/g, (char) => char.toUpperCase())
    .replace(/^([a-zа-я])(?=[a-zа-я])/, (char) => char.toUpperCase());
}

/** Приводим пунктуацию и пробелы в названии к аккуратному виду. */
function tidyName(name) {
  return name
    .normalize('NFC')
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '')
    .replace(/(?:\s*,\s*)+/g, ', ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/\s+[-–—]\s+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,;.\s]+/, '')
    .replace(/[,;.\s]+$/, '')
    .trim();
}

/** Тип кузова выносим из названия в отдельное поле. */
const LEKALO_BODY_WORDS = [
  [/(?:^|[\s,])джип\s*\/?\s*suv(?=[\s,]|$)/i, 'внедорожник'],
  [/(?:^|[\s,])suv(?=[\s,]|$)/i, 'внедорожник'],
  [/(?:^|[\s,])внедорожник(?=[\s,]|$)/i, 'внедорожник'],
  [/(?:^|[\s,])кроссовер(?=[\s,]|$)/i, 'кроссовер'],
  [/(?:^|[\s,])хэтчбек(?=[\s,]|$)/i, 'хэтчбек'],
  [/(?:^|[\s,])универсал(?=[\s,]|$)/i, 'универсал'],
  [/(?:^|[\s,])минивэн(?=[\s,]|$)/i, 'минивэн'],
  [/(?:^|[\s,])купе(?=[\s,]|$)/i, 'купе'],
  [/(?:^|[\s,])кабриолет(?=[\s,]|$)/i, 'кабриолет'],
  [/(?:^|[\s,])открытый кузов\s*\d*(?=[\s,]|$)/i, 'кабриолет'],
  [/(?:^|[\s,])седан(?=[\s,]|$)/i, 'седан'],
  [/(?:^|[\s,])лифтбек(?=[\s,]|$)/i, 'лифтбек'],
];

function splitBody(name) {
  let body = '';
  let rest = ` ${name} `;
  for (const [re, label] of LEKALO_BODY_WORDS) {
    if (re.test(rest)) {
      body ||= label;
      rest = rest.replace(re, ' ');
    }
  }
  return { name: tidyName(rest), body };
}


/** Ручные соответствия лекал и уже существующих моделей. */
const LEKALO_MODEL_FIX = {
  lada: {
    '2101-06': '2101 2106',
    '2105-07': '2105 2107',
    '2108, 2113': '2108 2113',
    '2109, 21099, 2114, 2115': '2109 2114 2115',
    '2110, приора': '2110 2111 2112',
    '21124 (12 купе)': '2112',
    'largus (ларгус)': 'Ларгус',
    'нива urban': 'Нива Урбан',
  },
  volga: {
    'сайбер седан, 1 поколение': 'Сайбер',
  },
};

function applyModelFix(name, make) {
  const map = LEKALO_MODEL_FIX[make.slug];
  if (!map) return name;
  return map[name.toLowerCase().replace(/\s+/g, ' ').trim()] ?? name;
}

const nameIndex = new Map();
for (const entry of entries.values()) {
  nameIndex.set(`${entry.brandSlug}/${normName(entry.name)}`, entry);
}

let lekaloAdded = 0;
let lekaloMerged = 0;
let lekaloSkipped = 0;

for (const rawBrand of lekaloData.brands ?? []) {
  const items = (rawBrand.items ?? []).filter((item) => !LEKALO_JUNK.test(item.name ?? ''));
  if (!items.length) continue;

  let make = resolveMake(rawBrand.name);

  for (const item of items) {
    let targetMake = make;
    const rawName = item.name ?? '';
    const preStripped = stripBrandPrefix(rawName, make);

    // В каталоге ГАЗ / УАЗ / Волга лежат вперемешку — разводим по своим маркам.
    if (/^газ(?:ель|он)?(?![а-яё])/i.test(preStripped)) targetMake = resolveMake('ГАЗ');
    else if (/^уаз(?![а-яё])/i.test(preStripped)) targetMake = resolveMake('УАЗ');
    else if (/^волга(?![а-яё])/i.test(preStripped)) targetMake = resolveMake('Волга');

    const title = item.title || rawName;
    const years = item.years || parseLekaloYears(title);
    const cleaned = applyModelFix(cleanLekaloModel(rawName, targetMake), targetMake);
    const { name: namePart, body } = splitBody(cleaned);
    const display = smartCase(tidyName(namePart));
    if (!display) {
      lekaloSkipped += 1;
      continue;
    }

    const baseSlug = slugify(display).slice(0, 70).replace(/-+$/, '') || slugify(title);
    if (!baseSlug) {
      lekaloSkipped += 1;
      continue;
    }

    const nameKey = `${targetMake.slug}/${normName(display)}`;
    let entry = nameIndex.get(nameKey);

    if (entry) {
      if (years) entry.yearSet.add(years);
      if (years && !entry.years) entry.years = years;
      if (body) entry.bodySet.add(body);
      if (item.url && !entry.lekaloUrl) entry.lekaloUrl = item.url;
      lekaloMerged += 1;
      continue;
    }

    let slug = baseSlug;
    let counter = 2;
    while (entries.has(`${targetMake.slug}/${slug}`)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    entry = {
      brandSlug: targetMake.slug,
      brandName: targetMake.name,
      name: display,
      slug,
      years: years ?? '',
      yearSet: new Set(years ? [years] : []),
      body,
      bodySet: new Set(body ? [body] : []),
      aliases: new Set(),
      wb: {},
      wbVlt: {},
      ozon: {},
      count: 0,
      lekaloUrl: item.url,
    };
    entries.set(`${targetMake.slug}/${slug}`, entry);
    nameIndex.set(nameKey, entry);
    lekaloAdded += 1;
  }
}

// Название, состоящее только из годов («1975–1986»), — это не модель, а подпись товара.
const YEAR_ONLY =
  /^(?:(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|н\.?\s?в\.?)|(?:19|20)\d{2})$/i;
for (const [key, e] of entries) {
  if (YEAR_ONLY.test(e.name.trim())) entries.delete(key);
}

// Годы и тип кузова оставляем, только если данные не противоречат друг другу.
for (const e of entries.values()) {
  e.years = e.yearSet.size === 1 ? [...e.yearSet][0] : '';
  e.body = e.bodySet.size === 1 ? [...e.bodySet][0] : '';
}

/* ------------------------------------------------------------------ */
/* 2c. Слияние карточек маркетплейсов с моделями базы лекал              */
/* ------------------------------------------------------------------ */

/** Диапазон лет из строки «2000–2007» или «2018–н.в.». */
function yearRange(text) {
  if (!text) return null;
  const open = text.match(/(\d{4})\D*н\.?\s?в\.?/i);
  if (open) return [Number(open[1]), 9999];
  const range = text.match(/(\d{4})\D+(\d{4})/);
  if (range) return [Number(range[1]), Number(range[2])];
  const one = text.match(/(\d{4})/);
  if (one) return [Number(one[1]), Number(one[1])];
  return null;
}

/** Совместимы ли диапазоны лет: пересечение должно быть существенным. */
function yearsCompatible(a, b) {
  const ra = yearRange(a);
  const rb = yearRange(b);
  if (!ra || !rb) return true;
  const overlap = Math.min(ra[1], rb[1]) - Math.max(ra[0], rb[0]) + 1;
  if (overlap <= 0) return false;
  const lenA = ra[1] - ra[0] + 1;
  const lenB = rb[1] - rb[0] + 1;
  return overlap >= 2 || overlap >= 0.5 * Math.min(lenA, lenB);
}

/** Слова названия модели — по ним сравниваем карточку товара и модель сайта. */
function modelTokens(name) {
  return normName(name).split(' ').filter(Boolean);
}

/** «Ядро» названия: первая группа слов — по ней ищем модель в базе. */
function coreOf(name) {
  return String(name ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)[0] ?? '';
}

/** Диапазон лет в виде «2006-2011» — для сравнения строк. */
function normRange(text) {
  if (!text) return '';
  const range = text.match(/(\d{4})\D+(\d{4})/);
  if (range) return `${range[1]}-${range[2]}`;
  const open = text.match(/(\d{4})\D*н\.?\s?в\.?/i);
  if (open) return `${open[1]}-н.в.`;
  const one = text.match(/(\d{4})/);
  return one ? `${one[1]}-${one[1]}` : '';
}

/** Запоминаем, какие годы встречаются в товарах магазина для этого «ядра» названия. */
function noteStoreYears(brandSlug, display, years) {
  if (!years) return;
  const key = `${brandSlug}|${coreOf(display)}`;
  const set = storeYears.get(key) ?? new Set();
  set.add(normRange(years));
  storeYears.set(key, set);
}

/** Запоминаем название карточки магазина для этого «ядра» — по нему строим запрос. */
function noteStoreName(brandSlug, display, name, source) {
  const key = `${brandSlug}|${coreOf(display)}`;
  const entry = storeNames.get(key) ?? {};
  if (!entry[source]) entry[source] = storePhrase(name);
  storeNames.set(key, entry);
}

/**
 * Название нашей карточки без слов про тип плёнки — из него получается точный
 * поисковый запрос: маркетплейс найдёт именно наш товар, а не чужие коврики.
 */
function storePhrase(name) {
  return String(name ?? '')
    .replace(
      /^\s*(?:съёмная|съемная|классическая|атермальная|жёсткая|жесткая)?\s*(?:многоразовая)?\s*(?:силиконовая)?\s*тонировк[а-яёa-z]*\s*/i,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Модель сайта для карточки товара: «Camry» → «Camry XV40», «XC70» → «XC70 3 поколение».
 * Сравниваем первые слова названия и годы; если подходит несколько моделей — не гадаем.
 */
function findModelMatch(brandSlug, display, years, { exclude = null, lekaloOnly = false } = {}) {
  const tokens = modelTokens(display);
  if (!tokens.length) return null;
  const candidates = [...entries.values()].filter((e) => {
    if (e === exclude) return false;
    if (lekaloOnly && !e.lekaloUrl) return false;
    if (e.brandSlug !== brandSlug) return false;
    const ct = modelTokens(e.name);
    if (!ct.length || ct[0] !== tokens[0]) return false;
    // «Camry Solara» — не «Camry»: второе слово должно совпадать, если оба названия его имеют.
    if (tokens.length > 1 && ct.length > 1 && ct[1] !== tokens[1]) return false;
    return true;
  });
  if (!candidates.length) return null;
  const exact = candidates.filter((e) => normName(e.name) === normName(display));
  if (exact.length === 1) return exact[0];
  // Точное совпадение годов: «Camry 2006–2011» → «Camry XV40 7 поколение».
  if (years) {
    const sameYears = candidates.filter((e) => e.years === years);
    if (sameYears.length === 1) return sameYears[0];
  }
  const compatible = candidates.filter((e) => yearsCompatible(e.years, years));
  return compatible.length === 1 ? compatible[0] : null;
}

/** Сколько ссылок на маркетплейсы у модели. */
function linksCount(entry) {
  const wb = Object.keys(entry.wb ?? {}).length;
  const ozon = Object.values(entry.ozon ?? {}).reduce(
    (sum, places) => sum + Object.keys(places ?? {}).length,
    0,
  );
  return wb + ozon;
}

/** Лучше ли новая карточка WB текущей: сначала наличие, потом отзывы. */
function betterWb(candidate, current) {
  if (!current) return true;
  if (candidate.stock === true && current.stock !== true) return true;
  if (current.stock === true && candidate.stock !== true) return false;
  return (candidate.feedbacks ?? 0) > (current.feedbacks ?? 0);
}

/** Переносим ссылки с одной модели на другую. */
function mergeLinks(target, source) {
  if (!target.wbPhrase && source.wbPhrase) target.wbPhrase = source.wbPhrase;
  if (!target.wbWindshieldPhrase && source.wbWindshieldPhrase) {
    target.wbWindshieldPhrase = source.wbWindshieldPhrase;
  }
  if (!target.ozonPhrase && source.ozonPhrase) target.ozonPhrase = source.ozonPhrase;
  if (!target.ozonWindshieldPhrase && source.ozonWindshieldPhrase) {
    target.ozonWindshieldPhrase = source.ozonWindshieldPhrase;
  }
  for (const [kind, data] of Object.entries(source.wb ?? {})) {
    const current = target.wb[kind];
    if (betterWb(data, current)) target.wb[kind] = data;
  }
  for (const [kind, map] of Object.entries(source.wbVlt ?? {})) {
    const byVlt = (target.wbVlt[kind] ??= {});
    for (const [vlt, id] of Object.entries(map)) byVlt[vlt] = id;
  }
  for (const [film, places] of Object.entries(source.ozon ?? {})) {
    const byFilm = (target.ozon[film] ??= {});
    for (const [place, offer] of Object.entries(places ?? {})) {
      const current = byFilm[place];
      if (!current) {
        byFilm[place] = offer;
        continue;
      }
      const vlt = (current.vlt ??= {});
      for (const [value, id] of Object.entries(offer.vlt ?? {})) vlt[value] = id;
    }
  }
  target.count += source.count ?? 0;
}

// Одни и те же модели под разными названиями («Camry XV10 4 поколение» и
// «Camry 4 поколение, XV10») объединяем: ссылки остаются на одной странице.
let duplicatesMerged = 0;
{
  const groups = new Map();
  for (const [key, entry] of entries) {
    if (!entry.years) continue;
    const signature = `${entry.brandSlug}|${[...modelTokens(entry.name)].sort().join(' ')}|${entry.years}`;
    const list = groups.get(signature) ?? [];
    list.push([key, entry]);
    groups.set(signature, list);
  }
  for (const [, list] of groups) {
    if (list.length < 2) continue;
    list.sort((a, b) => linksCount(b[1]) - linksCount(a[1]) || a[1].name.length - b[1].name.length);
    const [, keep] = list[0];
    for (const [key, entry] of list.slice(1)) {
      mergeLinks(keep, entry);
      entries.delete(key);
      duplicatesMerged += 1;
    }
  }
}

// Карточки WB без пары в базе лекал прикрепляем к модели с тем же «ядром»
// названия и совместимыми годами: «XC70» → «XC70 3 поколение».
let wbMerged = 0;
for (const [key, entry] of [...entries.entries()]) {
  if (entry.lekaloUrl) continue;
  const target = findModelMatch(entry.brandSlug, entry.name, entry.years, {
    exclude: entry,
    lekaloOnly: true,
  });
  if (!target || target === entry) continue;
  mergeLinks(target, entry);
  entries.delete(key);
  wbMerged += 1;
}

// Товары Ozon: прикрепляем к точной модели или к модели лекала с тем же «ядром».
let ozonAttached = 0;
for (const item of ozonPending) {
  const entry = entries.get(item.key) ?? findModelMatch(item.brandSlug, item.display, item.years);
  if (!entry) {
    ozonSkipped.push(item.product.name);
    continue;
  }
  attachOzon(entry, item.product);
  ozonAttached += 1;
}

// Годы для поискового запроса: добавляем только если в нашем магазине действительно
// есть карточка с такими годами — иначе маркетплейс не найдёт ничего.
for (const entry of entries.values()) {
  const key = `${entry.brandSlug}|${coreOf(entry.name)}`;
  const ranges = storeYears.get(key);
  entry.searchYears =
    entry.years && ranges && ranges.has(normRange(entry.years))
      ? entry.years.replace(/[–—]/g, '-')
      : '';
  // Если своя карточка не привязалась (например, поколение неоднозначно),
  // берём название карточки магазина — поиск всё равно приведёт к нашему товару.
  const names = storeNames.get(key);
  if (!entry.wbPhrase && names?.wb) entry.wbPhrase = names.wb;
  if (!entry.ozonPhrase && names?.ozon) entry.ozonPhrase = names.ozon;
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

const brandList = [...byBrand.values()].sort((a, b) => {
  // Lada — первая: с неё чаще всего начинают выбор.
  if (a.slug === 'lada') return -1;
  if (b.slug === 'lada') return 1;
  return a.name.localeCompare(b.name, 'ru');
});

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
  const scored = (e) => {
    const feedbacks = Math.max(
      0,
      ...Object.values(e.wb ?? {}).map((item) => item.feedbacks ?? 0),
    );
    return linksCount(e) * 1000 + feedbacks;
  };
  const hit =
    exact ??
    candidates
      .filter((e) => needles.some((n) => e.name.includes(n)))
      .sort((a, b) => scored(b) - scored(a))[0];
  if (hit) popular.add(`${hit.brandSlug}/${hit.slug}`);
}

const ALL_MAKES = [...MAKES];
for (const make of DYNAMIC_MAKES) {
  if (!ALL_MAKES.some(([slug]) => slug === make.slug)) {
    ALL_MAKES.push([make.slug, make.name, [make.name.toLowerCase()].filter((alias) => alias !== make.slug), 999]);
  }
}

const BRAND_ALIASES_MAP = {};
for (const [slug, , aliases] of ALL_MAKES) {
  BRAND_ALIASES_MAP[slug] = [...new Set(aliases.filter((alias) => alias && alias !== slug))];
}

const esc = (s) => s.replace(/'/g, "\\'");
const FILM_ORDER = ['silicone', 'classic', 'athermal', 'hard', 'windshield'];
const OZON_SET_ORDER = ['front', 'rear', 'full', 'windshield'];

/** Литерал поля wbVlt: артикулы WB по проценту затемнения. */
function wbVltLiteral(model) {
  const groups = [];
  for (const kind of FILM_ORDER) {
    const map = model.wbVlt?.[kind];
    if (!map || !Object.keys(map).length) continue;
    const items = Object.entries(map)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([vlt, id]) => `${vlt}: ${id}`);
    groups.push(`${kind}: { ${items.join(', ')} }`);
  }
  return groups.length ? `wbVlt: { ${groups.join(', ')} }` : '';
}

/** Литерал поля ozon для сгенерированного файла. */
function ozonLiteral(model) {
  const groups = [];
  for (const kind of FILM_ORDER) {
    const places = model.ozon[kind];
    if (!places) continue;
    const offers = OZON_SET_ORDER.filter((place) => places[place]).map((place) => {
      const offer = places[place];
      const vlt = Object.entries(offer.vlt ?? {})
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([value, id]) => `${value}: ${id}`);
      return `${place}: { id: ${offer.id}${vlt.length ? `, vlt: { ${vlt.join(', ')} }` : ''} }`;
    });
    if (offers.length) groups.push(`${kind}: { ${offers.join(', ')} }`);
  }
  return groups.length ? `ozon: { ${groups.join(', ')} }` : '';
}

let out = `// ВНИМАНИЕ: файл сгенерирован из выгрузок Wildberries (import/wb-api.json),
// Ozon (import/ozon-api.json) и базы лекал (import/lekalo.json).
// Пересобрать: node scripts/build-cars.mjs
// Правки вручную лучше вносить в scripts/build-cars.mjs (словарь марок и правила разбора).

import type { FilmId, SetId } from './films';

/** Прямая ссылка на товар Ozon: базовый SKU и варианты по светопропусканию. */
export interface OzonOffer {
  /** SKU товара Ozon. */
  id: number;
  /** Светопропускание, % → SKU конкретного варианта. */
  vlt?: Record<number, number>;
}

export interface CarModel {
  slug: string;
  name: string;
  years?: string;
  /** Годы для поискового запроса — есть только если в магазине есть такая карточка. */
  searchYears?: string;
  /** Название нашей карточки на WB — из него получается точный поисковый запрос. */
  wbPhrase?: string;
  /** То же для карточки на лобовое стекло. */
  wbWindshieldPhrase?: string;
  /** Название нашей карточки на Ozon. */
  ozonPhrase?: string;
  /** То же для карточки на лобовое стекло. */
  ozonWindshieldPhrase?: string;
  body?: string;
  popular?: boolean;
  /** Русские названия и частые варианты написания для поиска. */
  aliases?: string[];
  /** Артикулы Wildberries по типу плёнки — для прямых ссылок на товар. */
  wb?: Partial<Record<FilmId | 'windshield', number>>;
  /** Артикулы Wildberries по проценту затемнения: плёнка → % → товар. */
  wbVlt?: Partial<Record<FilmId, Record<number, number>>>;
  /** Товары Ozon: тип плёнки → комплект → SKU. */
  ozon?: Partial<Record<FilmId, Partial<Record<SetId | 'windshield', OzonOffer>>>>;
}

export interface CarBrand {
  slug: string;
  name: string;
  aliases?: string[];
  models: CarModel[];
}

const BRAND_ALIASES: Record<string, string[]> = {
${ALL_MAKES.map(([slug, , aliases]) => `  '${slug}': [${aliases.filter((a) => a && a !== slug).map((a) => `'${esc(a)}'`).join(', ')}],`).join('\n')}
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
    if (m.searchYears) parts.push(`searchYears: '${esc(m.searchYears)}'`);
    if (m.wbPhrase) parts.push(`wbPhrase: '${esc(m.wbPhrase)}'`);
    if (m.wbWindshieldPhrase) parts.push(`wbWindshieldPhrase: '${esc(m.wbWindshieldPhrase)}'`);
    if (m.ozonPhrase) parts.push(`ozonPhrase: '${esc(m.ozonPhrase)}'`);
    if (m.ozonWindshieldPhrase) parts.push(`ozonWindshieldPhrase: '${esc(m.ozonWindshieldPhrase)}'`);
    if (m.body) parts.push(`body: '${esc(m.body)}'`);
    if (popular.has(`${brand.slug}/${m.slug}`)) parts.push('popular: true');
    const al = [...m.aliases].filter((a) => a && a !== m.name.toLowerCase());
    if (al.length && al.length <= 4) parts.push(`aliases: [${al.map((a) => `'${esc(a)}'`).join(', ')}]`);
    const wb = FILM_ORDER.filter((kind) => m.wb[kind]).map((kind) => `${kind}: ${m.wb[kind].id}`);
    if (wb.length) parts.push(`wb: { ${wb.join(', ')} }`);
    const wbVlt = wbVltLiteral(m);
    if (wbVlt) parts.push(wbVlt);
    const ozon = ozonLiteral(m);
    if (ozon) parts.push(ozon);
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

/* Поисковый индекс: каталог и подбор модели загружают его по требованию. */
const brandPositions = new Map(brandList.map((brand, index) => [brand.slug, index]));
const indexBrands = brandList.map((brand) => [
  brand.slug,
  brand.name,
  [...new Set([brand.name, ...(brand.aliases ?? []), ...(BRAND_ALIASES_MAP[brand.slug] ?? [])])]
    .join(' ')
    .toLowerCase(),
]);
const indexModels = [];
for (const brand of brandList) {
  for (const model of brand.models) {
    indexModels.push([
      brandPositions.get(brand.slug),
      model.slug,
      model.name,
      model.years ?? '',
      [...(model.aliases ?? [])].join(' '),
    ]);
  }
}
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync(
  'public/catalog-index.json',
  JSON.stringify({ brands: indexBrands, models: indexModels }),
  'utf8',
);

console.log(
  'марок:',
  brandList.length,
  '| моделей:',
  entries.size,
  '| из лекал добавлено:',
  lekaloAdded,
  '| объединено:',
  lekaloMerged,
  '| пропущено лекал:',
  lekaloSkipped,
  '| пропущено WB:',
  skipped.length,
  '| карточек WB слито с лекалами:',
  wbMerged,
  '| дублей моделей объединено:',
  duplicatesMerged,
  '| товаров Ozon привязано:',
  ozonAttached,
);
console.log('популярные:', [...popular].join(', '));
fs.writeFileSync('import/skipped.txt', skipped.join('\n'), 'utf8');

const ozonProducts = ozonData.products ?? [];
const ozonModels = [...entries.values()].filter((e) => Object.keys(e.ozon).length).length;
console.log(
  'Ozon: товаров в выгрузке',
  ozonProducts.length,
  '| моделей со ссылками',
  ozonModels,
  '| пропущено',
  ozonSkipped.length,
);
fs.writeFileSync('import/skipped-ozon.txt', ozonSkipped.join('\n'), 'utf8');
