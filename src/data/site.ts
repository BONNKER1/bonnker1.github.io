export const site = {
  name: 'Boonker',
  tagline: 'Съёмная тонировка по лекалам',
  description:
    'Съёмная тонировка по готовым лекалам для популярных автомобилей: силиконовая, жёсткая и классическая. Передние и задние полусферы, доставка по России.',
  url: 'https://boonker.ru',
  city: 'Москва',
  telegram: 'https://t.me/boonker',
  telegramHandle: '@boonker',
  phone: '',
  email: 'info@boonker.ru',
  marketplaces: {
    wildberries: 'https://www.wildberries.ru/seller/585856',
    ozon: 'https://www.ozon.ru/seller/boonker-semnaya-tonirovka/',
  },
  stats: [
    { value: 'Все марки', label: 'в базе лекал' },
    { value: '2–4 стекла', label: 'в комплекте' },
    { value: 'Без клея', label: 'снимается за минуту' },
    { value: 'СДЭК / Почта', label: 'доставка по РФ' },
  ],
} as const;

export function telegramOrderLink(text: string): string {
  return `${site.telegram}?text=${encodeURIComponent(text)}`;
}
