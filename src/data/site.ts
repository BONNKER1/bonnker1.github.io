export const site = {
  name: 'Boonker',
  tagline: 'Съёмная тонировка по лекалам',
  description:
    'Купить съёмную тонировку по лекалам для своего авто: силиконовая, классическая, атермальная и жёсткая Premium. Передние и задние полусферы, полный комплект, плёнка на отрез. Доставка по России из Новосибирска.',
  url: 'https://bonnker1.github.io',
  city: 'Новосибирск',
  telegram: 'https://t.me/kabuda1837',
  telegramHandle: '@kabuda1837',
  phone: '',
  email: 'kazulink@bk.ru',
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
