export type FilmId = 'silicone' | 'classic' | 'athermal' | 'hard';
export type SetId = 'front' | 'rear' | 'full';

export interface Film {
  id: FilmId;
  name: string;
  short: string;
  description: string;
  basePrice: number;
  badge?: string;
  pros: string[];
  prices: Record<SetId, number>;
}

export interface FilmSet {
  id: SetId;
  name: string;
  short: string;
}

export interface WindshieldSet {
  id: 'windshield';
  name: string;
  short: string;
  price: number;
}

/** Цены за комплект: передние 2 стекла, задние 2 стекла, полный 4 стекла. */
export const films: Film[] = [
  {
    id: 'silicone',
    name: 'Съёмная силиконовая',
    short: 'Многоразовая, держится на статике',
    description:
      'Силиконовая плёнка без клея: прилипает к стеклу за счёт статики и выдерживает многократные снятия и установки. Не оставляет следов и подходит для сезонного использования.',
    basePrice: 1050,
    badge: 'Хит',
    pros: ['Многоразовая', 'Без клея и следов', 'Легко моется'],
    prices: { front: 1050, rear: 1050, full: 2100 },
  },
  {
    id: 'classic',
    name: 'Классическая',
    short: 'Рабочий вариант за свои деньги',
    description:
      'Обычная тонировочная плёнка с плотным затемнением. Держится за счёт статики, снимается без клея. Лучший выбор, если нужен результат без переплаты.',
    basePrice: 1350,
    pros: ['Плотное затемнение', 'Снимается без следов', 'Проверенный материал'],
    prices: { front: 1350, rear: 1350, full: 2700 },
  },
  {
    id: 'athermal',
    name: 'Атермальная',
    short: 'Почти прозрачная, меньше нагрева',
    description:
      'Атермальная плёнка отражает часть тепла и снижает нагрев салона, оставаясь почти прозрачной. Подходит для передних стёкол, где по ГОСТ нужно не менее 70% светопропускания.',
    basePrice: 1550,
    pros: ['Меньше нагрева салона', 'Прозрачная', 'Подходит для передних стёкол'],
    prices: { front: 1550, rear: 1550, full: 3100 },
  },
  {
    id: 'hard',
    name: 'Жёсткая Premium',
    short: 'Держит форму, служит дольше',
    description:
      'Жёсткая плёнка повышенной плотности. Меньше тянется, аккуратнее садится по кромке стекла и дольше сохраняет форму. Для тех, кто ставит тонировку надолго.',
    basePrice: 1750,
    pros: ['Держит форму', 'Плотная посадка', 'Ресурс выше обычной'],
    prices: { front: 1750, rear: 1750, full: 3500 },
  },
];

export const filmSets: FilmSet[] = [
  { id: 'front', name: 'Передние полусферы', short: '2 стекла' },
  { id: 'rear', name: 'Задние полусферы', short: '2 стекла' },
  { id: 'full', name: 'Полный комплект', short: '4 стекла' },
];

/** Лобовое стекло — только для ВАЗ, цена не зависит от типа плёнки. */
export const windshieldSet: WindshieldSet = {
  id: 'windshield',
  name: 'Лобовое стекло',
  short: '1 стекло',
  price: 1850,
};

/** Плёнка на отрез: цена за погонный метр, одинаковая для всех типов. */
export const filmByMeter = {
  price: 1750,
  unit: 'погонный метр',
} as const;

export const vltOptions = [5, 15, 20, 35, 50, 70] as const;

export function priceFor(film: Film, set: FilmSet | WindshieldSet): number {
  if (set.id === 'windshield') return set.price;
  return film.prices[set.id];
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}
