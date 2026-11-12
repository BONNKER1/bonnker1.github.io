export interface Film {
  id: 'classic' | 'silicone' | 'hard';
  name: string;
  short: string;
  description: string;
  basePrice: number;
  badge?: string;
  pros: string[];
}

export interface FilmSet {
  id: 'front' | 'rear' | 'full';
  name: string;
  short: string;
  multiplier: number;
}

export const films: Film[] = [
  {
    id: 'classic',
    name: 'Классическая',
    short: 'Рабочий вариант за свои деньги',
    description:
      'Обычная тонировочная плёнка с плотным затемнением. Держится за счёт статики, снимается без клея. Лучший выбор, если нужен результат без переплаты.',
    basePrice: 1190,
    pros: ['Плотное затемнение', 'Снимается без следов', 'Самая доступная цена'],
  },
  {
    id: 'silicone',
    name: 'Съёмная силиконовая',
    short: 'Многоразовая, держится на статике',
    description:
      'Силиконовая плёнка без клея: прилипает к стеклу за счёт статики и выдерживает многократные снятия и установки. Не оставляет следов и подходит для сезонного использования.',
    basePrice: 1490,
    badge: 'Хит',
    pros: ['Многоразовая', 'Без клея и следов', 'Легко моется'],
  },
  {
    id: 'hard',
    name: 'Жёсткая Premium',
    short: 'Держит форму, служит дольше',
    description:
      'Жёсткая плёнка повышенной плотности. Меньше тянется, аккуратнее садится по кромке стекла и дольше сохраняет форму. Для тех, кто ставит тонировку надолго.',
    basePrice: 1890,
    pros: ['Держит форму', 'Плотная посадка', 'Ресурс выше обычной'],
  },
];

export const filmSets: FilmSet[] = [
  { id: 'front', name: 'Передние полусферы', short: '2 стекла', multiplier: 1 },
  { id: 'rear', name: 'Задние полусферы', short: '2 стекла', multiplier: 0.92 },
  { id: 'full', name: 'Полный комплект', short: '4 стекла', multiplier: 1.75 },
];

export const vltOptions = [5, 15, 20, 35, 50, 70] as const;

export function priceFor(film: Film, set: FilmSet, vlt: number): number {
  const surcharge = vlt >= 50 ? 150 : 0;
  return Math.round(((film.basePrice * set.multiplier + surcharge) / 10)) * 10;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}
