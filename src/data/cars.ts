// ВНИМАНИЕ: файл сгенерирован из выгрузки Wildberries (import/wb-api.json).
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
  lada: ['ваз', 'лада', 'ba3', 'baz'],
  toyota: ['тойота'],
  bmw: ['бмв'],
  citroen: ['ситроен'],
  chevrolet: ['шевроле'],
  dodge: ['додж'],
  daewoo: ['дэу', 'деу'],
  acura: ['акура'],
  audi: ['ауди'],
  volkswagen: ['фольксваген', 'vw'],
  nissan: ['ниссан'],
  fiat: ['фиат'],
  kia: ['киа'],
  ford: ['форд'],
  opel: ['опель'],
  skoda: ['шкода'],
  hyundai: ['хендай', 'хундай', 'хёндэ'],
  mazda: ['мазда'],
  suzuki: ['сузуки'],
  honda: ['хонда'],
  renault: ['рено'],
  mitsubishi: ['мицубиси', 'мицубиши'],
  uaz: ['уаз'],
  volvo: ['вольво'],
  subaru: ['субару'],
  mercedes: ['мерседес', 'мерс'],
  ssangyong: ['ssang yong', 'ссанг'],
  datsun: ['датсун'],
  gaz: ['газ', 'газон', 'газель'],
  lexus: ['лексус'],
  geely: ['джили'],
  volga: ['волга'],
  landrover: ['land rover', 'ленд ровер'],
  baic: ['баик'],
  chery: ['чери'],
  haval: ['хавал'],
  lifan: ['лифан'],
  greatwall: ['great wall', 'грэйт вол'],
};

/** База лекал магазина. */
export const brands: CarBrand[] = [
  {
    slug: 'toyota',
    name: 'Toyota',
    models: [
      { slug: 'land-cruiser', name: 'Land Cruiser', aliases: ['крузер'] },
      { slug: 'rav4', name: 'RAV4', aliases: ['рав'] },
      { slug: 'sprinter', name: 'Sprinter', aliases: ['спринтер'] },
      { slug: 'prius', name: 'Prius', years: '1997–2003', aliases: ['приус'] },
      { slug: 'mark-2', name: 'Mark 2', aliases: ['марк'] },
      { slug: 'premio', name: 'Premio', years: '1997–1999', aliases: ['премио'] },
      { slug: 'matrix', name: 'Matrix', aliases: ['матрикс'] },
      { slug: 'solara', name: 'Solara', years: '2003–2009', aliases: ['солара'] },
      { slug: 'spacio', name: 'Spacio', aliases: ['спасио'] },
      { slug: 'nadia', name: 'Nadia', years: '1998–2003', aliases: ['надя'] },
      { slug: 'progres', name: 'Progres', years: '1998–2007', aliases: ['прогрес', 'прогресс'] },
      { slug: 'opa', name: 'OPA', years: '2000–2005', aliases: ['опа'] },
      { slug: 'platz', name: 'Platz', aliases: ['платц'] },
      { slug: 'prius-alpha', name: 'Prius Alpha', aliases: ['приус'] },
      { slug: 'prius-v', name: 'Prius V', aliases: ['приус'] },
      { slug: 'probox', name: 'Probox', years: '2002–2019', aliases: ['пробокс'] },
      { slug: 'levin', name: 'Levin', aliases: ['левин'] },
      { slug: 'mark-x', name: 'Mark X', aliases: ['марк'] },
      { slug: 'prius-c', name: 'Prius C', aliases: ['приус'] },
      { slug: 'camry-xv40', name: 'Camry XV40', years: '2006–2011', popular: true, aliases: ['камри'] },
      { slug: 'carina', name: 'Carina', years: '1996–2001', aliases: ['карина'] },
      { slug: 'corolla', name: 'Corolla', popular: true, aliases: ['королла'] },
      { slug: 'corolla-e120', name: 'Corolla E120', aliases: ['королла'] },
      { slug: 'ipsum', name: 'Ipsum', aliases: ['ипсум'] },
      { slug: 'land-cruiser-prado-120', name: 'Land Cruiser Prado 120', years: '2002–2009' },
      { slug: 'rav4-xa10', name: 'RAV4 XA10', years: '1994–2000', aliases: ['рав'] },
      { slug: 'auris-e150', name: 'Auris E150', years: '2006–2012', aliases: ['аурис'] },
      { slug: 'camry-gracia', name: 'Camry Gracia', aliases: ['грация'] },
      { slug: 'camry-xv10', name: 'Camry XV10', years: '1991–1996', aliases: ['камри'] },
      { slug: 'chaser', name: 'Chaser', aliases: ['чайзер'] },
      { slug: 'corsa', name: 'Corsa', aliases: ['корса'] },
      { slug: 'corsa-l50', name: 'Corsa L50', years: '1994–2000', aliases: ['корса'] },
      { slug: 'cresta-100', name: 'Cresta 100', years: '1996–2001', aliases: ['креста'] },
      { slug: 'cresta-90', name: 'Cresta 90', years: '1992–1996', aliases: ['креста'] },
      { slug: 'crown', name: 'Crown', aliases: ['краун'] },
      { slug: 'crown-151-157', name: 'Crown 151-157', aliases: ['кровн'] },
      { slug: 'crown-171', name: 'Crown 171', years: '1999–2003', aliases: ['кровн'] },
      { slug: 'curren', name: 'Curren', years: '1994–1998', aliases: ['каррен'] },
      { slug: 'harrier', name: 'Harrier', aliases: ['харриер'] },
      { slug: 'harrier-xu30', name: 'Harrier XU30', aliases: ['харриер'] },
      { slug: 'hilux-surf', name: 'Hilux Surf', aliases: ['хайлюкс', 'сурф'] },
      { slug: 'kluger', name: 'Kluger', aliases: ['клюгер'] },
      { slug: 'land-cruiser-200', name: 'Land Cruiser 200', aliases: ['лэнд', 'крузер'] },
      { slug: 'prius-alpha-xw40', name: 'Prius Alpha XW40', aliases: ['приус', 'альфа'] },
      { slug: 'rav4-xa30', name: 'RAV4 XA30', years: '2006–2012', aliases: ['рав'] },
      { slug: 'yaris-xp90', name: 'Yaris XP90', years: '2006–2009', aliases: ['ярис'] },
    ],
  },
  {
    slug: 'audi',
    name: 'Audi',
    models: [
      { slug: 'a6', name: 'A6' },
      { slug: 'a4', name: 'A4' },
      { slug: 'a8', name: 'A8' },
      { slug: 'a3', name: 'A3' },
      { slug: '100', name: '100' },
      { slug: 'a5', name: 'A5' },
      { slug: 'a7', name: 'A7' },
      { slug: 'q5', name: 'Q5' },
      { slug: 'q7', name: 'Q7' },
      { slug: 'a1', name: 'A1' },
      { slug: 'e-tron', name: 'e-Tron', aliases: ['е-трон'] },
      { slug: 'e-tron-sportback', name: 'e-Tron Sportback', aliases: ['е-трон', 'спортбэк'] },
      { slug: 'q3', name: 'Q3' },
      { slug: 'q8', name: 'Q8' },
    ],
  },
  {
    slug: 'citroen',
    name: 'Citroen',
    models: [
      { slug: 'c4', name: 'C4' },
      { slug: 'berlingo', name: 'Berlingo', aliases: ['берлинго'] },
      { slug: 'c4-picasso', name: 'C4 Picasso', aliases: ['пикассо'] },
      { slug: 'c5', name: 'C5' },
      { slug: 'c-crosser', name: 'C-Crosser', aliases: ['си-кроссер', 'с-кроссер'] },
      { slug: 'c-elysee', name: 'C-Elysee', aliases: ['с-элизе', 'с-элизэ'] },
      { slug: 'c3', name: 'C3' },
      { slug: 'c6', name: 'C6' },
      { slug: 'xsara', name: 'Xsara', aliases: ['ксара'] },
      { slug: 'xsara-picasso', name: 'Xsara Picasso', aliases: ['ксара'] },
      { slug: 'c4-spacetourer', name: 'C4 Spacetourer' },
      { slug: 'grand-c4', name: 'Grand C4', aliases: ['гранд'] },
      { slug: 'c4-spacetourer-c', name: 'C4 Spacetourer C' },
      { slug: 'grand-c4-spacetourer', name: 'Grand C4 Spacetourer' },
    ],
  },
  {
    slug: 'lada',
    name: 'Lada (ВАЗ)',
    aliases: ['лада', 'ваз'],
    models: [
      { slug: 'granta', name: 'Гранта', popular: true },
      { slug: '2108-2113', name: '2108 2113' },
      { slug: '2109-2114-2115', name: '2109 2114 2115', popular: true },
      { slug: '2101-2106', name: '2101 2106' },
      { slug: '2105-2107', name: '2105 2107', popular: true },
      { slug: '2110-2111-2112', name: '2110 2111 2112' },
      { slug: 'vesta', name: 'Веста', popular: true },
      { slug: 'kalina', name: 'Калина' },
      { slug: 'niva-trevel', name: 'Нива Тревел' },
      { slug: 'oka', name: 'ОКА' },
      { slug: '2121', name: '2121', aliases: ['нива'] },
      { slug: '2131', name: '2131', aliases: ['нива'] },
      { slug: 'largus', name: 'Ларгус' },
      { slug: 'priora-2110-2111-2112', name: 'Приора 2110 2111 2112' },
    ],
  },
  {
    slug: 'chevrolet',
    name: 'Chevrolet',
    models: [
      { slug: 'tahoe', name: 'Tahoe', aliases: ['тахо'] },
      { slug: 'aveo', name: 'Aveo', aliases: ['авео'] },
      { slug: 'cobalt', name: 'Cobalt', aliases: ['кобальт'] },
      { slug: 'cruze', name: 'Cruze', popular: true, aliases: ['круз'] },
      { slug: 'epica', name: 'Epica', aliases: ['эпика'] },
      { slug: 'evanda', name: 'Evanda', aliases: ['эванда'] },
      { slug: 'lacetti', name: 'Lacetti', aliases: ['лачетти'] },
      { slug: 'spark', name: 'Spark', years: '2005–2010', aliases: ['спарк'] },
      { slug: 'bolt', name: 'Bolt', years: '2016–2021', aliases: ['болт'] },
      { slug: 'captiva', name: 'Captiva', aliases: ['каптива'] },
      { slug: 'lanos', name: 'Lanos', aliases: ['ланос'] },
      { slug: 'niva', name: 'Niva', aliases: ['нива'] },
    ],
  },
  {
    slug: 'nissan',
    name: 'Nissan',
    models: [
      { slug: 'sunny', name: 'Sunny', years: '1998–2004', aliases: ['санни'] },
      { slug: 'ad', name: 'AD', years: '1990–1999', aliases: ['ад'] },
      { slug: 'almera-classic', name: 'Almera Classic', aliases: ['альмера'] },
      { slug: 'almera-tino', name: 'Almera Tino', aliases: ['альмера', 'тино'] },
      { slug: 'juke', name: 'Juke', years: '2011–н.в.', aliases: ['джук'] },
      { slug: 'leaf', name: 'Leaf', years: '2009–2017', aliases: ['лиф'] },
      { slug: 'micra-march', name: 'Micra March', aliases: ['микра', 'марч'] },
      { slug: 'murano', name: 'Murano', years: '2008–2016', aliases: ['мурано'] },
      { slug: 'note', name: 'Note', years: '2012–2020', aliases: ['ноут'] },
      { slug: 'pathfinder', name: 'Pathfinder', aliases: ['патфайндер'] },
      { slug: 'qashqai', name: 'Qashqai', years: '2013–н.в.', aliases: ['кашкай'] },
      { slug: 'x-trail', name: 'X-Trail', years: '2001–2007', aliases: ['х-трейл'] },
    ],
  },
  {
    slug: 'volkswagen',
    name: 'Volkswagen',
    models: [
      { slug: 'golf-4', name: 'Golf 4', aliases: ['гольф'] },
      { slug: 'golf-7', name: 'Golf 7', aliases: ['гольф'] },
      { slug: 'polo', name: 'Polo', popular: true, aliases: ['поло'] },
      { slug: 'tiguan', name: 'Tiguan', aliases: ['тигуан'] },
      { slug: 'amarok', name: 'Amarok', aliases: ['амарок'] },
      { slug: 'arteon', name: 'Arteon', aliases: ['артеон'] },
      { slug: 'bora', name: 'Bora', years: '1998–2006', aliases: ['бора'] },
      { slug: 'golf-5', name: 'Golf 5', aliases: ['гольф'] },
      { slug: 'golf-6', name: 'Golf 6', aliases: ['гольф'] },
      { slug: 'golf-plus', name: 'Golf Plus', aliases: ['гольф'] },
      { slug: 'jetta', name: 'Jetta', aliases: ['джетта'] },
      { slug: 'passat', name: 'Passat', aliases: ['пассат'] },
    ],
  },
  {
    slug: 'dodge',
    name: 'Dodge',
    models: [
      { slug: 'caravan', name: 'Caravan', aliases: ['караван'] },
      { slug: 'charger', name: 'Charger', aliases: ['чарджер'] },
      { slug: 'ram', name: 'Ram', aliases: ['рам'] },
      { slug: 'caliber', name: 'Caliber', aliases: ['калибер'] },
      { slug: 'intrepid', name: 'Intrepid', aliases: ['интрепид'] },
      { slug: 'neon', name: 'Neon', aliases: ['неон'] },
      { slug: 'nitro', name: 'Nitro', aliases: ['нитро'] },
      { slug: 'stratus', name: 'Stratus', aliases: ['стратус'] },
      { slug: 'durango', name: 'Durango', aliases: ['дуранго'] },
      { slug: 'durango-dakota', name: 'Durango-Dakota', aliases: ['дуранго-дакота'] },
    ],
  },
  {
    slug: 'bmw',
    name: 'BMW',
    models: [
      { slug: '5', name: '5', popular: true },
      { slug: '7', name: '7' },
      { slug: 'x5', name: 'X5' },
      { slug: '3', name: '3' },
      { slug: '1', name: '1' },
      { slug: 'x6', name: 'X6', years: '2008–2014' },
      { slug: '2', name: '2', years: '2019–н.в.' },
      { slug: 'x4', name: 'X4' },
      { slug: '4', name: '4', years: '2014–2020' },
    ],
  },
  {
    slug: 'daewoo',
    name: 'Daewoo',
    models: [
      { slug: 'gentra', name: 'Gentra', aliases: ['джентра'] },
      { slug: 'espero', name: 'Espero', aliases: ['эсперо'] },
      { slug: 'matiz', name: 'Matiz', aliases: ['матиз'] },
      { slug: 'leganza', name: 'Leganza', aliases: ['леганза'] },
      { slug: 'nubira', name: 'Nubira', aliases: ['нубира'] },
      { slug: 'tacuma', name: 'Tacuma', aliases: ['такума'] },
      { slug: 'winstorm', name: 'Winstorm', aliases: ['винсторм'] },
      { slug: 'nexia', name: 'Nexia', aliases: ['нексия'] },
    ],
  },
  {
    slug: 'kia',
    name: 'Kia',
    models: [
      { slug: 'rio', name: 'Rio', popular: true, aliases: ['рио'] },
      { slug: 'ceed', name: 'Ceed', aliases: ['сид'] },
      { slug: 'cerato', name: 'Cerato', aliases: ['церато'] },
      { slug: 'k5', name: 'K5' },
      { slug: 'optima', name: 'Optima', aliases: ['оптима'] },
      { slug: 'sephia', name: 'Sephia', aliases: ['сефия'] },
      { slug: 'sorento', name: 'Sorento', aliases: ['соренто'] },
      { slug: 'spectra', name: 'Spectra', aliases: ['спектра'] },
    ],
  },
  {
    slug: 'ford',
    name: 'Ford',
    models: [
      { slug: 'escape', name: 'Escape', aliases: ['эскейп'] },
      { slug: 'focus-3', name: 'Focus 3', aliases: ['фокус'] },
      { slug: 'expedition', name: 'Expedition', aliases: ['экспедишн'] },
      { slug: 'explorer', name: 'Explorer', aliases: ['эксплорер'] },
      { slug: 'focus', name: 'Focus', aliases: ['фокус'] },
      { slug: 'mondeo', name: 'Mondeo', aliases: ['мондео'] },
      { slug: 's-max', name: 'S-MAX', aliases: ['эс-макс'] },
    ],
  },
  {
    slug: 'opel',
    name: 'Opel',
    models: [
      { slug: 'astra', name: 'Astra', aliases: ['астра'] },
      { slug: 'vectra', name: 'Vectra', aliases: ['вектра'] },
      { slug: 'corsa', name: 'Corsa', aliases: ['корса'] },
      { slug: 'insignia', name: 'Insignia', aliases: ['инсигния'] },
      { slug: 'mokka', name: 'Mokka', aliases: ['мокка'] },
      { slug: 'zafira', name: 'Zafira', aliases: ['зафира'] },
    ],
  },
  {
    slug: 'fiat',
    name: 'Fiat',
    models: [
      { slug: '500l', name: '500L' },
      { slug: 'albea', name: 'Albea', aliases: ['альбеа'] },
      { slug: 'doblo', name: 'Doblo', aliases: ['добло'] },
      { slug: 'idea', name: 'Idea', aliases: ['идеа'] },
      { slug: 'panda', name: 'Panda', aliases: ['панда'] },
    ],
  },
  {
    slug: 'honda',
    name: 'Honda',
    models: [
      { slug: 'civic-ferio', name: 'Civic Ferio', years: '2000–2005', aliases: ['ферио'] },
      { slug: 'fit', name: 'Fit', years: '2001–2007', aliases: ['фит'] },
      { slug: 'partner', name: 'Partner', years: '1996–2004', aliases: ['партнер'] },
      { slug: 'pilot', name: 'Pilot', years: '2008–2015', aliases: ['пилот'] },
      { slug: 'stepwgn', name: 'Stepwgn', years: '2009–2015', aliases: ['стэпвэгон'] },
    ],
  },
  {
    slug: 'hyundai',
    name: 'Hyundai',
    models: [
      { slug: 'grandeur', name: 'Grandeur', years: '2005–2011', aliases: ['грандер'] },
      { slug: 'accent', name: 'Accent', years: '1999–2006', aliases: ['акцент'] },
      { slug: 'elantra', name: 'Elantra', years: '2000–2009', aliases: ['элантра'] },
      { slug: 'i30', name: 'I30', years: '2011–2017' },
      { slug: 'solaris', name: 'Solaris', years: '2017–2020', popular: true, aliases: ['солярис'] },
    ],
  },
  {
    slug: 'mazda',
    name: 'Mazda',
    models: [
      { slug: 'cx-5', name: 'CX-5', years: '2016–н.в.' },
      { slug: '3', name: '3', years: '2018–н.в.' },
      { slug: '323', name: '323', years: '1998–2003' },
      { slug: 'demio', name: 'Demio', years: '2002–2007', aliases: ['демио'] },
      { slug: 'premacy', name: 'Premacy', years: '1999–2005', aliases: ['премаси'] },
    ],
  },
  {
    slug: 'acura',
    name: 'Acura',
    models: [
      { slug: 'rdx', name: 'RDX', aliases: ['рдх'] },
      { slug: 'mdx', name: 'MDX', aliases: ['мдх'] },
      { slug: 'slx', name: 'SLX', aliases: ['слх'] },
      { slug: 'tlx', name: 'TLX', aliases: ['тлх'] },
    ],
  },
  {
    slug: 'mitsubishi',
    name: 'Mitsubishi',
    models: [
      { slug: 'diamante', name: 'Diamante', aliases: ['диамант'] },
      { slug: 'lancer', name: 'Lancer', aliases: ['лансер'] },
      { slug: 'pajero', name: 'Pajero', aliases: ['паджеро'] },
      { slug: 'pajero-pinin', name: 'Pajero Pinin', aliases: ['паджеро'] },
    ],
  },
  {
    slug: 'renault',
    name: 'Renault',
    models: [
      { slug: 'captur', name: 'Captur', years: '2016–н.в.', aliases: ['каптур'] },
      { slug: 'laguna', name: 'Laguna', years: '2007–2010', aliases: ['лагуна'] },
      { slug: 'logan', name: 'Logan', years: '2014–н.в.', popular: true, aliases: ['логан'] },
      { slug: 'symbol', name: 'Symbol', years: '1999–2008', aliases: ['симбол'] },
    ],
  },
  {
    slug: 'skoda',
    name: 'Skoda',
    models: [
      { slug: 'rapid', name: 'Rapid', aliases: ['рапид'] },
      { slug: 'octavia', name: 'Octavia', aliases: ['октавия'] },
      { slug: 'superb', name: 'Superb', years: '2002–2008', aliases: ['суперб'] },
      { slug: 'kodiaq', name: 'Kodiaq', years: '2016–2020', aliases: ['кодиак'] },
    ],
  },
  {
    slug: 'lexus',
    name: 'Lexus',
    models: [
      { slug: 'lx', name: 'LX' },
      { slug: 'lx-570', name: 'LX 570', years: '2007–2020' },
      { slug: 'rx', name: 'RX', years: '1997–2009' },
    ],
  },
  {
    slug: 'mercedes',
    name: 'Mercedes-Benz',
    models: [
      { slug: '1975-1986', name: '1975–1986' },
      { slug: 'a-class', name: 'A-Class' },
      { slug: 'e-klass', name: 'E-класс' },
    ],
  },
  {
    slug: 'suzuki',
    name: 'Suzuki',
    models: [
      { slug: 'grand-vitara', name: 'Grand Vitara', aliases: ['гранд'] },
      { slug: 'swift', name: 'Swift', aliases: ['свифт'] },
      { slug: 'sx4', name: 'SX4' },
    ],
  },
  {
    slug: 'volvo',
    name: 'Volvo',
    models: [
      { slug: '850', name: '850' },
      { slug: '940', name: '940' },
      { slug: 'v90-cross-country', name: 'V90 Cross Country' },
    ],
  },
  {
    slug: 'gaz',
    name: 'ГАЗ',
    models: [
      { slug: 'gazon-next', name: 'Газон Next' },
      { slug: 'gazel', name: 'Газель' },
    ],
  },
  {
    slug: 'geely',
    name: 'Geely',
    models: [
      { slug: 'monjaro', name: 'Monjaro', aliases: ['монджаро'] },
      { slug: 'tugella', name: 'Tugella', aliases: ['тугелла'] },
    ],
  },
  {
    slug: 'subaru',
    name: 'Subaru',
    models: [
      { slug: 'legacy', name: 'Legacy', aliases: ['легаси'] },
      { slug: 'xv', name: 'XV', years: '2012–2017', aliases: ['хв'] },
    ],
  },
  {
    slug: 'volga',
    name: 'Волга',
    models: [
      { slug: 'sayber', name: 'Сайбер' },
    ],
  },
  {
    slug: 'uaz',
    name: 'УАЗ',
    models: [
      { slug: 'patriot', name: 'Патриот' },
    ],
  },
  {
    slug: 'datsun',
    name: 'Datsun',
    models: [
      { slug: 'on-do', name: 'On-DO', aliases: ['он-до'] },
    ],
  },
  {
    slug: 'landrover',
    name: 'Land Rover',
    models: [
      { slug: 'range-rover-sport', name: 'Range Rover Sport' },
    ],
  },
  {
    slug: 'ssangyong',
    name: 'SsangYong',
    models: [
      { slug: 'actyon', name: 'Actyon', aliases: ['актион'] },
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
