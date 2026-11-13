// ВНИМАНИЕ: файл сгенерирован из выгрузки Wildberries (import/wb-api.json).
// Пересобрать: node scripts/build-cars.mjs
// Правки вручную лучше вносить в scripts/build-cars.mjs (словарь марок и правила разбора).

import type { FilmId } from './films';

export interface CarModel {
  slug: string;
  name: string;
  years?: string;
  body?: string;
  popular?: boolean;
  /** Русские названия и частые варианты написания для поиска. */
  aliases?: string[];
  /** Артикулы Wildberries по типу плёнки — для прямых ссылок на товар. */
  wb?: Partial<Record<FilmId, number>>;
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
      { slug: 'land-cruiser', name: 'Land Cruiser', aliases: ['крузер'], wb: { classic: 783251605, athermal: 783251468 } },
      { slug: 'rav4', name: 'RAV4', aliases: ['рав'], wb: { classic: 785802475, athermal: 785802500 } },
      { slug: 'sprinter', name: 'Sprinter', aliases: ['спринтер'], wb: { classic: 785802428, athermal: 785802473 } },
      { slug: 'prius', name: 'Prius', years: '1997–2003', aliases: ['приус'], wb: { silicone: 127004685, classic: 785530408, athermal: 785530409 } },
      { slug: 'mark-2', name: 'Mark 2', aliases: ['марк'], wb: { classic: 783529058, athermal: 783528762 } },
      { slug: 'premio', name: 'Premio', years: '1997–1999', aliases: ['премио'], wb: { silicone: 127004737, classic: 783596522, athermal: 783596525 } },
      { slug: 'matrix', name: 'Matrix', aliases: ['матрикс'], wb: { classic: 783528866, athermal: 783528910 } },
      { slug: 'solara', name: 'Solara', years: '2003–2009', aliases: ['солара'], wb: { silicone: 127004750, classic: 785802550, athermal: 785802552 } },
      { slug: 'spacio', name: 'Spacio', aliases: ['спасио'], wb: { classic: 785802542, athermal: 785802413 } },
      { slug: 'nadia', name: 'Nadia', years: '1998–2003', aliases: ['надя'], wb: { silicone: 127004728, classic: 783596420 } },
      { slug: 'progres', name: 'Progres', years: '1998–2007', aliases: ['прогрес', 'прогресс'], wb: { silicone: 127004701, classic: 785530069, athermal: 785530070 } },
      { slug: 'opa', name: 'OPA', years: '2000–2005', aliases: ['опа'], wb: { silicone: 127004707, classic: 783596443, athermal: 783596445 } },
      { slug: 'platz', name: 'Platz', aliases: ['платц'], wb: { classic: 783596465, athermal: 783596470 } },
      { slug: 'prius-alpha', name: 'Prius Alpha', aliases: ['приус'], wb: { classic: 785529996, athermal: 785529998 } },
      { slug: 'prius-v', name: 'Prius V', aliases: ['приус'], wb: { classic: 785530165, athermal: 785530168 } },
      { slug: 'probox', name: 'Probox', years: '2002–2019', aliases: ['пробокс'], wb: { silicone: 127004687, classic: 785530270, athermal: 785530273 } },
      { slug: 'levin', name: 'Levin', aliases: ['левин'], wb: { classic: 783528960, athermal: 783528965 } },
      { slug: 'mark-x', name: 'Mark X', aliases: ['марк'], wb: { classic: 783528823, athermal: 783528826 } },
      { slug: 'prius-c', name: 'Prius C', aliases: ['приус'], wb: { classic: 785530514, athermal: 785530516 } },
      { slug: 'camry-xv40', name: 'Camry XV40', years: '2006–2011', popular: true, aliases: ['камри'], wb: { silicone: 123082603 } },
      { slug: 'carina', name: 'Carina', years: '1996–2001', aliases: ['карина'], wb: { silicone: 123082623, athermal: 492649263 } },
      { slug: 'corolla', name: 'Corolla', popular: true, aliases: ['королла'], wb: { classic: 492788296, athermal: 492788310 } },
      { slug: 'corolla-e120', name: 'Corolla E120', aliases: ['королла'], wb: { silicone: 123441185 } },
      { slug: 'ipsum', name: 'Ipsum', aliases: ['ипсум'], wb: { classic: 497961587 } },
      { slug: 'land-cruiser-prado-120', name: 'Land Cruiser Prado 120', years: '2002–2009', wb: { silicone: 124395845 } },
      { slug: 'rav4-xa10', name: 'RAV4 XA10', years: '1994–2000', aliases: ['рав'], wb: { silicone: 127004744 } },
      { slug: 'auris-e150', name: 'Auris E150', years: '2006–2012', aliases: ['аурис'], wb: { silicone: 103823237 } },
      { slug: 'camry-gracia', name: 'Camry Gracia', aliases: ['грация'], wb: { athermal: 492646157 } },
      { slug: 'camry-xv10', name: 'Camry XV10', years: '1991–1996', aliases: ['камри'], wb: { silicone: 123082596 } },
      { slug: 'chaser', name: 'Chaser', aliases: ['чайзер'], wb: { classic: 492767649 } },
      { slug: 'corsa', name: 'Corsa', aliases: ['корса'], wb: { classic: 492846567 } },
      { slug: 'corsa-l50', name: 'Corsa L50', years: '1994–2000', aliases: ['корса'], wb: { silicone: 123441188 } },
      { slug: 'cresta-100', name: 'Cresta 100', years: '1996–2001', aliases: ['креста'], wb: { silicone: 123441196 } },
      { slug: 'cresta-90', name: 'Cresta 90', years: '1992–1996', aliases: ['креста'], wb: { silicone: 123441180 } },
      { slug: 'crown', name: 'Crown', aliases: ['краун'], wb: { classic: 492864806 } },
      { slug: 'crown-151-157', name: 'Crown 151-157', aliases: ['кровн'], wb: { silicone: 123441176 } },
      { slug: 'crown-171', name: 'Crown 171', years: '1999–2003', aliases: ['кровн'], wb: { silicone: 123441186 } },
      { slug: 'curren', name: 'Curren', years: '1994–1998', aliases: ['каррен'], wb: { silicone: 123861066 } },
      { slug: 'harrier', name: 'Harrier', aliases: ['харриер'], wb: { classic: 497954932 } },
      { slug: 'harrier-xu30', name: 'Harrier XU30', aliases: ['харриер'], wb: { silicone: 123861087 } },
      { slug: 'hilux-surf', name: 'Hilux Surf', aliases: ['хайлюкс', 'сурф'], wb: { silicone: 311475006 } },
      { slug: 'kluger', name: 'Kluger', aliases: ['клюгер'], wb: { classic: 497961627 } },
      { slug: 'land-cruiser-200', name: 'Land Cruiser 200', aliases: ['лэнд', 'крузер'], wb: { silicone: 124395846 } },
      { slug: 'prius-alpha-xw40', name: 'Prius Alpha XW40', aliases: ['приус', 'альфа'], wb: { silicone: 127004686 } },
      { slug: 'rav4-xa30', name: 'RAV4 XA30', years: '2006–2012', aliases: ['рав'], wb: { silicone: 127004763 } },
      { slug: 'yaris-xp90', name: 'Yaris XP90', years: '2006–2009', aliases: ['ярис'], wb: { silicone: 127505466 } },
    ],
  },
  {
    slug: 'audi',
    name: 'Audi',
    models: [
      { slug: 'a6', name: 'A6', wb: { silicone: 274451105, classic: 474372827 } },
      { slug: 'a4', name: 'A4', wb: { silicone: 566655045 } },
      { slug: 'a8', name: 'A8', wb: { silicone: 566700343 } },
      { slug: 'a3', name: 'A3', wb: { silicone: 566646803 } },
      { slug: '100', name: '100', wb: { silicone: 552468732 } },
      { slug: 'a5', name: 'A5', wb: { silicone: 566667666 } },
      { slug: 'a7', name: 'A7', wb: { silicone: 566698155 } },
      { slug: 'q5', name: 'Q5', wb: { silicone: 566716030 } },
      { slug: 'q7', name: 'Q7', wb: { silicone: 566771036 } },
      { slug: 'a1', name: 'A1', wb: { silicone: 566644714 } },
      { slug: 'e-tron', name: 'e-Tron', aliases: ['е-трон'], wb: { silicone: 566708030 } },
      { slug: 'e-tron-sportback', name: 'e-Tron Sportback', aliases: ['е-трон', 'спортбэк'], wb: { silicone: 566709466 } },
      { slug: 'q3', name: 'Q3', wb: { silicone: 566711150 } },
      { slug: 'q8', name: 'Q8', wb: { silicone: 566776685 } },
    ],
  },
  {
    slug: 'lada',
    name: 'Lada (ВАЗ)',
    aliases: ['лада', 'ваз'],
    models: [
      { slug: 'granta', name: 'Гранта', popular: true, wb: { silicone: 62320207 } },
      { slug: '2108-2113', name: '2108 2113', wb: { silicone: 62317953, classic: 443846687 } },
      { slug: '2109-2114-2115', name: '2109 2114 2115', popular: true, wb: { silicone: 62318707, athermal: 444078728 } },
      { slug: '2110-2111-2112', name: '2110 2111 2112', aliases: ['приора'], wb: { silicone: 61820890, athermal: 444263767 } },
      { slug: '2101-2106', name: '2101 2106', wb: { silicone: 62204342, classic: 444078700 } },
      { slug: '2105-2107', name: '2105 2107', popular: true, wb: { silicone: 62249029 } },
      { slug: 'vesta', name: 'Веста', popular: true, wb: { silicone: 62333674 } },
      { slug: 'kalina', name: 'Калина', wb: { silicone: 62332870 } },
      { slug: 'niva-trevel', name: 'Нива Тревел', wb: { silicone: 501352589, hard: 896024431 } },
      { slug: 'oka', name: 'ОКА', wb: { silicone: 62342643 } },
      { slug: '2121', name: '2121', aliases: ['нива'], wb: { silicone: 288062728 } },
      { slug: '2131', name: '2131', aliases: ['нива'], wb: { silicone: 288070121 } },
      { slug: 'largus', name: 'Ларгус', wb: { classic: 445112314 } },
    ],
  },
  {
    slug: 'chevrolet',
    name: 'Chevrolet',
    models: [
      { slug: 'tahoe', name: 'Tahoe', aliases: ['тахо'], wb: { silicone: 1772061938, classic: 1792611120, athermal: 1792611124 } },
      { slug: 'aveo', name: 'Aveo', aliases: ['авео'], wb: { silicone: 1770771539, classic: 1792611631, athermal: 1792611635 } },
      { slug: 'cobalt', name: 'Cobalt', aliases: ['кобальт'], wb: { silicone: 1770874009, classic: 1792613510, athermal: 1792613514 } },
      { slug: 'cruze', name: 'Cruze', popular: true, aliases: ['круз'], wb: { silicone: 173426110, classic: 1792612127, athermal: 1792612130 } },
      { slug: 'epica', name: 'Epica', aliases: ['эпика'], wb: { silicone: 1771006517, classic: 1792610245, athermal: 1792610247 } },
      { slug: 'evanda', name: 'Evanda', aliases: ['эванда'], wb: { silicone: 1771455662, classic: 1792610409, athermal: 1792610410 } },
      { slug: 'lacetti', name: 'Lacetti', aliases: ['лачетти'], wb: { silicone: 173704019, classic: 1792613735, athermal: 1792613736 } },
      { slug: 'spark', name: 'Spark', years: '2005–2010', aliases: ['спарк'], wb: { silicone: 173704541, classic: 1792614274, athermal: 1792614278 } },
      { slug: 'bolt', name: 'Bolt', years: '2016–2021', aliases: ['болт'], wb: { silicone: 1770821782, classic: 1792611839 } },
      { slug: 'captiva', name: 'Captiva', aliases: ['каптива'], wb: { silicone: 1770850451, classic: 1792834679, athermal: 1792834684 } },
      { slug: 'lanos', name: 'Lanos', aliases: ['ланос'], wb: { silicone: 1771753349, classic: 1792610699, athermal: 1792610704 } },
      { slug: 'niva', name: 'Niva', aliases: ['нива'], wb: { silicone: 173704421, classic: 1792610863 } },
    ],
  },
  {
    slug: 'citroen',
    name: 'Citroen',
    models: [
      { slug: 'c4', name: 'C4', wb: { silicone: 1793141148, classic: 1840527520, athermal: 1836956180 } },
      { slug: 'berlingo', name: 'Berlingo', aliases: ['берлинго'], wb: { silicone: 1793018863, classic: 1836956827, athermal: 1836956828 } },
      { slug: 'c4-picasso', name: 'C4 Picasso', aliases: ['пикассо'], wb: { silicone: 1793099732, classic: 1836955967, athermal: 1837064709 } },
      { slug: 'c5', name: 'C5', wb: { silicone: 1793171668, classic: 1836957921, athermal: 1836957922 } },
      { slug: 'c-crosser', name: 'C-Crosser', aliases: ['си-кроссер', 'с-кроссер'], wb: { silicone: 1793206484, classic: 1837183839, athermal: 1837183844 } },
      { slug: 'c-elysee', name: 'C-Elysee', aliases: ['с-элизе', 'с-элизэ'], wb: { silicone: 1793221301, classic: 1837183898, athermal: 1837183901 } },
      { slug: 'c3', name: 'C3', wb: { silicone: 1793060295, classic: 1836958054, athermal: 1836958058 } },
      { slug: 'c4-spacetourer', name: 'C4 Spacetourer', wb: { silicone: 1793114009, classic: 1837070419, athermal: 1837070423 } },
      { slug: 'c6', name: 'C6', wb: { silicone: 1793187902, classic: 1837184105, athermal: 1837184107 } },
      { slug: 'grand-c4-spacetourer', name: 'Grand C4 Spacetourer', aliases: ['гранд'], wb: { silicone: 1793241015, classic: 1837183946, athermal: 1837183948 } },
      { slug: 'xsara', name: 'Xsara', aliases: ['ксара'], wb: { silicone: 1793255042, classic: 1837184028, athermal: 1837184029 } },
      { slug: 'xsara-picasso', name: 'Xsara Picasso', aliases: ['ксара'], wb: { silicone: 1793273220, classic: 1840527804, athermal: 1840527807 } },
    ],
  },
  {
    slug: 'nissan',
    name: 'Nissan',
    models: [
      { slug: 'sunny', name: 'Sunny', years: '1998–2004', aliases: ['санни'], wb: { silicone: 136731167 } },
      { slug: 'ad', name: 'AD', years: '1990–1999', aliases: ['ад'], wb: { silicone: 134240706 } },
      { slug: 'almera-classic', name: 'Almera Classic', aliases: ['альмера'], wb: { silicone: 134241022 } },
      { slug: 'almera-tino', name: 'Almera Tino', aliases: ['альмера', 'тино'], wb: { silicone: 134241384 } },
      { slug: 'juke', name: 'Juke', years: '2011–н.в.', aliases: ['джук'], wb: { silicone: 135903493 } },
      { slug: 'leaf', name: 'Leaf', years: '2009–2017', aliases: ['лиф'], wb: { silicone: 135963196 } },
      { slug: 'micra-march', name: 'Micra March', aliases: ['микра', 'марч'], wb: { silicone: 135966232 } },
      { slug: 'murano', name: 'Murano', years: '2008–2016', aliases: ['мурано'], wb: { silicone: 135967717 } },
      { slug: 'note', name: 'Note', years: '2012–2020', aliases: ['ноут'], wb: { silicone: 135970389 } },
      { slug: 'pathfinder', name: 'Pathfinder', aliases: ['патфайндер'], wb: { silicone: 135974447 } },
      { slug: 'qashqai', name: 'Qashqai', years: '2013–н.в.', aliases: ['кашкай'], wb: { silicone: 136731077 } },
      { slug: 'x-trail', name: 'X-Trail', years: '2001–2007', aliases: ['х-трейл'], wb: { silicone: 136732444 } },
    ],
  },
  {
    slug: 'volkswagen',
    name: 'Volkswagen',
    models: [
      { slug: 'golf-4', name: 'Golf 4', aliases: ['гольф'], wb: { silicone: 64614119 } },
      { slug: 'golf-7', name: 'Golf 7', aliases: ['гольф'], wb: { silicone: 64983926 } },
      { slug: 'polo', name: 'Polo', popular: true, aliases: ['поло'], wb: { silicone: 190901537 } },
      { slug: 'tiguan', name: 'Tiguan', aliases: ['тигуан'], wb: { silicone: 191376095 } },
      { slug: 'amarok', name: 'Amarok', aliases: ['амарок'], wb: { silicone: 627872122 } },
      { slug: 'arteon', name: 'Arteon', aliases: ['артеон'], wb: { silicone: 627879896 } },
      { slug: 'bora', name: 'Bora', years: '1998–2006', aliases: ['бора'], wb: { silicone: 627888668 } },
      { slug: 'golf-5', name: 'Golf 5', aliases: ['гольф'], wb: { silicone: 627929960 } },
      { slug: 'golf-6', name: 'Golf 6', aliases: ['гольф'], wb: { silicone: 627940751 } },
      { slug: 'golf-plus', name: 'Golf Plus', aliases: ['гольф'], wb: { silicone: 627949723 } },
      { slug: 'jetta', name: 'Jetta', aliases: ['джетта'], wb: { silicone: 190882796 } },
      { slug: 'passat', name: 'Passat', aliases: ['пассат'], wb: { silicone: 190889197 } },
    ],
  },
  {
    slug: 'bmw',
    name: 'BMW',
    models: [
      { slug: '5', name: '5', popular: true, wb: { silicone: 159238685, classic: 1768460010, athermal: 1768456186 } },
      { slug: '7', name: '7', wb: { silicone: 1584765995, classic: 1768455874, athermal: 1768455876 } },
      { slug: 'x5', name: 'X5', wb: { silicone: 1584799700, classic: 1768457859, athermal: 1768457864 } },
      { slug: '3', name: '3', wb: { silicone: 1584827567, classic: 1586310676, athermal: 1586310679 } },
      { slug: '1', name: '1', wb: { silicone: 159237186, classic: 1586311093, athermal: 1586311219 } },
      { slug: 'x6', name: 'X6', years: '2008–2014', wb: { silicone: 159239733, classic: 1768458476, athermal: 1768458477 } },
      { slug: '2', name: '2', years: '2019–н.в.', wb: { silicone: 1584818592, classic: 1586311283, athermal: 1586311285 } },
      { slug: 'x4', name: 'X4', wb: { silicone: 312773838 } },
      { slug: '4', name: '4', years: '2014–2020', wb: { silicone: 1584893440 } },
    ],
  },
  {
    slug: 'dodge',
    name: 'Dodge',
    models: [
      { slug: 'caravan', name: 'Caravan', aliases: ['караван'], wb: { silicone: 268696240, classic: 1844681090, athermal: 1844681094 } },
      { slug: 'charger', name: 'Charger', aliases: ['чарджер'], wb: { silicone: 1844415086, classic: 1846598764, athermal: 1846598965 } },
      { slug: 'ram', name: 'Ram', aliases: ['рам'], wb: { silicone: 1844487078, classic: 1846598167, athermal: 1846598172 } },
      { slug: 'caliber', name: 'Caliber', aliases: ['калибер'], wb: { silicone: 1844377579, classic: 1844680668, athermal: 1844680673 } },
      { slug: 'durango', name: 'Durango', aliases: ['дуранго-дакота', 'дакота', 'дуранго'], wb: { silicone: 1844433285, classic: 1846597785, athermal: 1846597787 } },
      { slug: 'intrepid', name: 'Intrepid', aliases: ['интрепид'], wb: { silicone: 1844439986, classic: 1846617495, athermal: 1846617500 } },
      { slug: 'neon', name: 'Neon', aliases: ['неон'], wb: { silicone: 1844445407, classic: 1846599095, athermal: 1846599096 } },
      { slug: 'nitro', name: 'Nitro', aliases: ['нитро'], wb: { silicone: 1844451433, classic: 1846617895, athermal: 1846617897 } },
      { slug: 'stratus', name: 'Stratus', aliases: ['стратус'], wb: { silicone: 1844501016, classic: 1846617244, athermal: 1846617246 } },
    ],
  },
  {
    slug: 'daewoo',
    name: 'Daewoo',
    models: [
      { slug: 'gentra', name: 'Gentra', aliases: ['джентра'], wb: { silicone: 1843623615, classic: 1844334970, athermal: 1844335092 } },
      { slug: 'espero', name: 'Espero', aliases: ['эсперо'], wb: { silicone: 198332041, classic: 1844334874, athermal: 1844334878 } },
      { slug: 'matiz', name: 'Matiz', aliases: ['матиз'], wb: { silicone: 198378961, classic: 1844335423, athermal: 1844335424 } },
      { slug: 'leganza', name: 'Leganza', aliases: ['леганза'], wb: { silicone: 1843645558, classic: 1844335163, athermal: 1844335165 } },
      { slug: 'nubira', name: 'Nubira', aliases: ['нубира'], wb: { silicone: 1843742819, classic: 1844335780, athermal: 1844335782 } },
      { slug: 'tacuma', name: 'Tacuma', aliases: ['такума'], wb: { silicone: 1843703356, classic: 1844335706, athermal: 1844335709 } },
      { slug: 'winstorm', name: 'Winstorm', aliases: ['винсторм'], wb: { silicone: 1843714895, classic: 1844335266, athermal: 1844335270 } },
      { slug: 'nexia', name: 'Nexia', aliases: ['нексия'], wb: { silicone: 198379277, classic: 1844335512 } },
    ],
  },
  {
    slug: 'kia',
    name: 'Kia',
    models: [
      { slug: 'rio', name: 'Rio', popular: true, aliases: ['рио'], wb: { silicone: 238935329, hard: 993420652 } },
      { slug: 'ceed', name: 'Ceed', aliases: ['сид'], wb: { silicone: 238697553 } },
      { slug: 'cerato', name: 'Cerato', aliases: ['церато'], wb: { silicone: 238698655, hard: 984633436 } },
      { slug: 'k5', name: 'K5', wb: { silicone: 238701596 } },
      { slug: 'optima', name: 'Optima', aliases: ['оптима'], wb: { silicone: 482382769 } },
      { slug: 'sephia', name: 'Sephia', aliases: ['сефия'], wb: { silicone: 239507506 } },
      { slug: 'sorento', name: 'Sorento', aliases: ['соренто'], wb: { silicone: 239510180 } },
      { slug: 'spectra', name: 'Spectra', aliases: ['спектра'], wb: { silicone: 239515824 } },
    ],
  },
  {
    slug: 'ford',
    name: 'Ford',
    models: [
      { slug: 'escape', name: 'Escape', aliases: ['эскейп'], wb: { silicone: 220259896 } },
      { slug: 'focus-3', name: 'Focus 3', aliases: ['фокус'], wb: { silicone: 72798136 } },
      { slug: 'expedition', name: 'Expedition', aliases: ['экспедишн'], wb: { silicone: 220261957 } },
      { slug: 'explorer', name: 'Explorer', aliases: ['эксплорер'], wb: { silicone: 220265806 } },
      { slug: 'focus', name: 'Focus', aliases: ['фокус'], wb: { silicone: 220269919 } },
      { slug: 'mondeo', name: 'Mondeo', aliases: ['мондео'], wb: { silicone: 220274176 } },
      { slug: 's-max', name: 'S-MAX', aliases: ['эс-макс'], wb: { silicone: 220276245 } },
    ],
  },
  {
    slug: 'opel',
    name: 'Opel',
    models: [
      { slug: 'astra', name: 'Astra', aliases: ['астра'], wb: { silicone: 223536796 } },
      { slug: 'vectra', name: 'Vectra', aliases: ['вектра'], wb: { silicone: 225905784 } },
      { slug: 'corsa', name: 'Corsa', aliases: ['корса'], wb: { silicone: 223540337 } },
      { slug: 'insignia', name: 'Insignia', aliases: ['инсигния'], wb: { silicone: 225415831 } },
      { slug: 'mokka', name: 'Mokka', aliases: ['мокка'], wb: { silicone: 225416962 } },
      { slug: 'zafira', name: 'Zafira', aliases: ['зафира'], wb: { silicone: 225905897 } },
    ],
  },
  {
    slug: 'fiat',
    name: 'Fiat',
    models: [
      { slug: '500l', name: '500L', wb: { silicone: 1846751452, classic: 1846944033, athermal: 1846944035 } },
      { slug: 'albea', name: 'Albea', aliases: ['альбеа'], wb: { silicone: 1846765816, classic: 1846944090 } },
      { slug: 'doblo', name: 'Doblo', aliases: ['добло'], wb: { silicone: 1846773285 } },
      { slug: 'idea', name: 'Idea', aliases: ['идеа'], wb: { silicone: 1846782277 } },
      { slug: 'panda', name: 'Panda', aliases: ['панда'], wb: { silicone: 1846787264 } },
    ],
  },
  {
    slug: 'honda',
    name: 'Honda',
    models: [
      { slug: 'civic-ferio', name: 'Civic Ferio', years: '2000–2005', aliases: ['ферио'], wb: { silicone: 165864310 } },
      { slug: 'fit', name: 'Fit', years: '2001–2007', aliases: ['фит'], wb: { silicone: 166045514 } },
      { slug: 'partner', name: 'Partner', years: '1996–2004', aliases: ['партнер'], wb: { silicone: 166141146 } },
      { slug: 'pilot', name: 'Pilot', years: '2008–2015', aliases: ['пилот'], wb: { silicone: 166141338 } },
      { slug: 'stepwgn', name: 'Stepwgn', years: '2009–2015', aliases: ['стэпвэгон'], wb: { silicone: 166142142 } },
    ],
  },
  {
    slug: 'hyundai',
    name: 'Hyundai',
    models: [
      { slug: 'grandeur', name: 'Grandeur', years: '2005–2011', aliases: ['грандер'], wb: { silicone: 148194766 } },
      { slug: 'accent', name: 'Accent', years: '1999–2006', aliases: ['акцент'], wb: { silicone: 147765815 } },
      { slug: 'elantra', name: 'Elantra', years: '2000–2009', aliases: ['элантра'], wb: { silicone: 147772002 } },
      { slug: 'i30', name: 'I30', years: '2011–2017', wb: { silicone: 147932681 } },
      { slug: 'solaris', name: 'Solaris', years: '2017–2020', popular: true, aliases: ['солярис'], wb: { silicone: 72811517 } },
    ],
  },
  {
    slug: 'mazda',
    name: 'Mazda',
    models: [
      { slug: 'cx-5', name: 'CX-5', years: '2016–н.в.', wb: { silicone: 142750261 } },
      { slug: '3', name: '3', years: '2018–н.в.', wb: { silicone: 142730466 } },
      { slug: '323', name: '323', years: '1998–2003', wb: { silicone: 142734959 } },
      { slug: 'demio', name: 'Demio', years: '2002–2007', aliases: ['демио'], wb: { silicone: 142753512 } },
      { slug: 'premacy', name: 'Premacy', years: '1999–2005', aliases: ['премаси'], wb: { silicone: 142780376 } },
    ],
  },
  {
    slug: 'acura',
    name: 'Acura',
    models: [
      { slug: 'rdx', name: 'RDX', aliases: ['рдх'], wb: { silicone: 1578532947, classic: 1584534585, athermal: 1584534589 } },
      { slug: 'mdx', name: 'MDX', aliases: ['мдх'], wb: { silicone: 1578532595, classic: 1584534434, athermal: 1584552926 } },
      { slug: 'slx', name: 'SLX', aliases: ['слх'], wb: { silicone: 1578532443, classic: 1584535205, athermal: 1584535208 } },
      { slug: 'tlx', name: 'TLX', aliases: ['тлх'], wb: { silicone: 1578532517, classic: 1584535321, athermal: 1584535323 } },
    ],
  },
  {
    slug: 'mitsubishi',
    name: 'Mitsubishi',
    models: [
      { slug: 'diamante', name: 'Diamante', aliases: ['диамант'], wb: { silicone: 198275869 } },
      { slug: 'lancer', name: 'Lancer', aliases: ['лансер'], wb: { silicone: 198279304 } },
      { slug: 'pajero', name: 'Pajero', aliases: ['паджеро'], wb: { silicone: 198283367 } },
      { slug: 'pajero-pinin', name: 'Pajero Pinin', aliases: ['паджеро'], wb: { silicone: 198282271 } },
    ],
  },
  {
    slug: 'renault',
    name: 'Renault',
    models: [
      { slug: 'captur', name: 'Captur', years: '2016–н.в.', aliases: ['каптур'], wb: { silicone: 172785767 } },
      { slug: 'laguna', name: 'Laguna', years: '2007–2010', aliases: ['лагуна'], wb: { silicone: 172924005 } },
      { slug: 'logan', name: 'Logan', years: '2014–н.в.', popular: true, aliases: ['логан'], wb: { silicone: 172924096 } },
      { slug: 'symbol', name: 'Symbol', years: '1999–2008', aliases: ['симбол'], wb: { silicone: 173026536 } },
    ],
  },
  {
    slug: 'skoda',
    name: 'Skoda',
    models: [
      { slug: 'rapid', name: 'Rapid', aliases: ['рапид'], wb: { silicone: 194554000 } },
      { slug: 'octavia', name: 'Octavia', aliases: ['октавия'], wb: { silicone: 194553200 } },
      { slug: 'superb', name: 'Superb', years: '2002–2008', aliases: ['суперб'], wb: { silicone: 194555531 } },
      { slug: 'kodiaq', name: 'Kodiaq', years: '2016–2020', aliases: ['кодиак'], wb: { silicone: 194550682 } },
    ],
  },
  {
    slug: 'lexus',
    name: 'Lexus',
    models: [
      { slug: 'lx', name: 'LX', wb: { hard: 917862229 } },
      { slug: 'lx-570', name: 'LX 570', years: '2007–2020', wb: { silicone: 182138554 } },
      { slug: 'rx', name: 'RX', years: '1997–2009', wb: { silicone: 182140337 } },
    ],
  },
  {
    slug: 'mercedes',
    name: 'Mercedes-Benz',
    models: [
      { slug: '1975-1986', name: '1975–1986', wb: { silicone: 197705295 } },
      { slug: 'a-class', name: 'A-Class', wb: { hard: 1028364084 } },
      { slug: 'e-klass', name: 'E-класс', wb: { silicone: 197695607 } },
    ],
  },
  {
    slug: 'suzuki',
    name: 'Suzuki',
    models: [
      { slug: 'grand-vitara', name: 'Grand Vitara', aliases: ['гранд'], wb: { silicone: 504059326 } },
      { slug: 'swift', name: 'Swift', aliases: ['свифт'], wb: { silicone: 523190464 } },
      { slug: 'sx4', name: 'SX4', wb: { classic: 464610464 } },
    ],
  },
  {
    slug: 'volvo',
    name: 'Volvo',
    models: [
      { slug: '850', name: '850', wb: { silicone: 218992397 } },
      { slug: '940', name: '940', wb: { silicone: 219132737 } },
      { slug: 'v90-cross-country', name: 'V90 Cross Country', wb: { silicone: 219144457 } },
    ],
  },
  {
    slug: 'gaz',
    name: 'ГАЗ',
    models: [
      { slug: 'gazon-next', name: 'Газон Next', wb: { silicone: 243586163, classic: 481503937 } },
      { slug: 'gazel', name: 'Газель', wb: { silicone: 243584470 } },
    ],
  },
  {
    slug: 'geely',
    name: 'Geely',
    models: [
      { slug: 'monjaro', name: 'Monjaro', aliases: ['монджаро'], wb: { silicone: 288039618 } },
      { slug: 'tugella', name: 'Tugella', aliases: ['тугелла'], wb: { silicone: 288050949 } },
    ],
  },
  {
    slug: 'subaru',
    name: 'Subaru',
    models: [
      { slug: 'legacy', name: 'Legacy', aliases: ['легаси'], wb: { silicone: 150743359 } },
      { slug: 'xv', name: 'XV', years: '2012–2017', aliases: ['хв'], wb: { silicone: 151464756 } },
    ],
  },
  {
    slug: 'volga',
    name: 'Волга',
    models: [
      { slug: 'sayber', name: 'Сайбер', wb: { silicone: 62343917 } },
    ],
  },
  {
    slug: 'uaz',
    name: 'УАЗ',
    models: [
      { slug: 'patriot', name: 'Патриот', wb: { silicone: 221974637, classic: 481510701 } },
    ],
  },
  {
    slug: 'datsun',
    name: 'Datsun',
    models: [
      { slug: 'on-do', name: 'On-DO', aliases: ['он-до'], wb: { silicone: 222429978, classic: 501454357 } },
    ],
  },
  {
    slug: 'landrover',
    name: 'Land Rover',
    models: [
      { slug: 'range-rover-sport', name: 'Range Rover Sport', wb: { silicone: 283691201 } },
    ],
  },
  {
    slug: 'ssangyong',
    name: 'SsangYong',
    models: [
      { slug: 'actyon', name: 'Actyon', aliases: ['актион'], wb: { silicone: 223019697 } },
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
