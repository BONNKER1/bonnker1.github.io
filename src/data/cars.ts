export interface CarModel {
  slug: string;
  name: string;
  years: string;
  body: string;
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

/**
 * База лекал.
 * Пока это демонстрационный набор популярных моделей.
 * Импорт полной базы из CSV — см. scripts/import-cars.ts.
 */
export const brands: CarBrand[] = [
  {
    slug: 'lada',
    name: 'Lada (ВАЗ)',
    aliases: ['лада', 'ваз'],
    models: [
      { slug: '2107', name: '2107', years: '1982–2012', body: 'седан' },
      { slug: '2109', name: '2109', years: '1987–2004', body: 'хэтчбек' },
      { slug: '2110', name: '2110', years: '1995–2007', body: 'седан' },
      { slug: '2114', name: '2114', years: '2001–2013', body: 'хэтчбек', popular: true },
      { slug: '2115', name: '2115', years: '1997–2012', body: 'седан' },
      { slug: 'granta', name: 'Granta', years: '2011–н.в.', body: 'седан / хэтчбек', popular: true },
      { slug: 'vesta', name: 'Vesta', years: '2015–н.в.', body: 'седан / универсал', popular: true },
      { slug: 'priora', name: 'Priora', years: '2007–2018', body: 'седан / хэтчбек' },
      { slug: 'niva', name: 'Niva', years: '1977–н.в.', body: 'внедорожник' },
    ],
  },
  {
    slug: 'toyota',
    name: 'Toyota',
    aliases: ['тойота'],
    models: [
      { slug: 'camry', name: 'Camry', years: '2006–н.в.', body: 'седан', popular: true },
      { slug: 'corolla', name: 'Corolla', years: '2007–н.в.', body: 'седан' },
      { slug: 'rav4', name: 'RAV4', years: '2006–н.в.', body: 'кроссовер' },
      { slug: 'land-cruiser', name: 'Land Cruiser', years: '2007–н.в.', body: 'внедорожник' },
    ],
  },
  {
    slug: 'kia',
    name: 'Kia',
    aliases: ['киа'],
    models: [
      { slug: 'rio', name: 'Rio', years: '2011–н.в.', body: 'седан / хэтчбек', popular: true },
      { slug: 'sportage', name: 'Sportage', years: '2010–н.в.', body: 'кроссовер', aliases: ['спортейдж'] },
      { slug: 'k5', name: 'K5', years: '2020–н.в.', body: 'седан', aliases: ['к5'] },
    ],
  },
  {
    slug: 'hyundai',
    name: 'Hyundai',
    aliases: ['хендай', 'хундай'],
    models: [
      { slug: 'solaris', name: 'Solaris', years: '2011–н.в.', body: 'седан / хэтчбек', popular: true },
      { slug: 'creta', name: 'Creta', years: '2016–н.в.', body: 'кроссовер' },
      { slug: 'tucson', name: 'Tucson', years: '2010–н.в.', body: 'кроссовер', aliases: ['туссан', 'туксон'] },
    ],
  },
  {
    slug: 'volkswagen',
    name: 'Volkswagen',
    aliases: ['фольксваген', 'vw'],
    models: [
      { slug: 'polo', name: 'Polo', years: '2010–н.в.', body: 'седан / хэтчбек', popular: true },
      { slug: 'tiguan', name: 'Tiguan', years: '2008–н.в.', body: 'кроссовер' },
      { slug: 'passat', name: 'Passat', years: '2005–н.в.', body: 'седан' },
    ],
  },
  {
    slug: 'renault',
    name: 'Renault',
    aliases: ['рено'],
    models: [
      { slug: 'logan', name: 'Logan', years: '2004–н.в.', body: 'седан', popular: true },
      { slug: 'duster', name: 'Duster', years: '2010–н.в.', body: 'кроссовер' },
    ],
  },
  {
    slug: 'skoda',
    name: 'Skoda',
    aliases: ['шкода'],
    models: [
      { slug: 'octavia', name: 'Octavia', years: '2004–н.в.', body: 'седан / универсал', popular: true },
      { slug: 'rapid', name: 'Rapid', years: '2012–н.в.', body: 'седан' },
    ],
  },
  {
    slug: 'ford',
    name: 'Ford',
    aliases: ['форд'],
    models: [
      { slug: 'focus', name: 'Focus', years: '2005–2019', body: 'седан / хэтчбек', popular: true },
    ],
  },
  {
    slug: 'nissan',
    name: 'Nissan',
    aliases: ['ниссан'],
    models: [
      { slug: 'qashqai', name: 'Qashqai', years: '2007–н.в.', body: 'кроссовер', aliases: ['кашкай'] },
      { slug: 'almera', name: 'Almera', years: '2012–2018', body: 'седан' },
    ],
  },
  {
    slug: 'chery',
    name: 'Chery',
    aliases: ['чери'],
    models: [
      { slug: 'tiggo-4', name: 'Tiggo 4', years: '2019–н.в.', body: 'кроссовер', popular: true },
      { slug: 'tiggo-7-pro', name: 'Tiggo 7 Pro', years: '2020–н.в.', body: 'кроссовер' },
    ],
  },
  {
    slug: 'haval',
    name: 'Haval',
    aliases: ['хавал'],
    models: [
      { slug: 'jolion', name: 'Jolion', years: '2021–н.в.', body: 'кроссовер', popular: true },
      { slug: 'f7', name: 'F7', years: '2019–н.в.', body: 'кроссовер', aliases: ['ф7'] },
    ],
  },
  {
    slug: 'bmw',
    name: 'BMW',
    aliases: ['бмв'],
    models: [
      { slug: '3-series', name: '3 серии', years: '2005–н.в.', body: 'седан' },
      { slug: 'x5', name: 'X5', years: '2007–н.в.', body: 'кроссовер', aliases: ['х5'] },
    ],
  },
  {
    slug: 'mercedes',
    name: 'Mercedes-Benz',
    aliases: ['мерседес', 'мерс'],
    models: [
      { slug: 'e-class', name: 'E-класс', years: '2009–н.в.', body: 'седан' },
      { slug: 'glc', name: 'GLC', years: '2015–н.в.', body: 'кроссовер' },
    ],
  },
  {
    slug: 'mazda',
    name: 'Mazda',
    aliases: ['мазда'],
    models: [
      { slug: '3', name: '3', years: '2009–н.в.', body: 'седан / хэтчбек' },
      { slug: '6', name: '6', years: '2008–н.в.', body: 'седан' },
      { slug: 'cx-5', name: 'CX-5', years: '2012–н.в.', body: 'кроссовер', aliases: ['сх-5', 'сх5'] },
    ],
  },
  {
    slug: 'chevrolet',
    name: 'Chevrolet',
    aliases: ['шевроле'],
    models: [
      { slug: 'cruze', name: 'Cruze', years: '2009–2016', body: 'седан / хэтчбек' },
      { slug: 'lacetti', name: 'Lacetti', years: '2004–2013', body: 'седан / хэтчбек' },
      { slug: 'aveo', name: 'Aveo', years: '2008–2015', body: 'седан / хэтчбек' },
    ],
  },
];

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
  brand.models
    .filter((model) => model.popular)
    .map((model) => ({ brand, model })),
);
