// Варианты (процент затемнения) карточек WB из экспорта личного кабинета.
// Запуск: node scripts/wb-variants.mjs [import/wb-export.csv]
// Результат: import/wb-variants.json — { "<артикул WB>": "5%" }
//
// Экспорт кабинета: Товары → Экспорт → XLSX/CSV с колонками «Артикул WB» и
// «Наименование варианта». CSV читается как latin1: нам нужны только цифры и «%».
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = process.argv[2] || 'import/wb-export.csv';
const OUT = path.resolve('import/wb-variants.json');

if (!fs.existsSync(SOURCE)) {
  console.log('Файла нет:', SOURCE);
  console.log('Скачайте экспорт из кабинета WB (Товары → Экспорт) и положите сюда.');
  process.exit(0);
}

const raw = fs.readFileSync(SOURCE, 'latin1');
const lines = raw.split(/\r?\n/).filter((line) => line.trim());
if (!lines.length) {
  console.log('Файл пустой');
  process.exit(0);
}

// Разделитель: точка с запятой или запятая — что встречается чаще.
const header = lines[0];
const sep = header.split(';').length > header.split(',').length ? ';' : ',';
const cols = header.split(sep).map((c) => c.trim());

// Ищем колонку с артикулом и колонку с названием варианта.
const idCol = cols.findIndex((c) => /артикул|nm|товар/i.test(c) && !/вариант/i.test(c));
const sizeCol = cols.findIndex((c) => /вариант|размер|цвет|size/i.test(c));
console.log('колонки:', cols.map((c, i) => `${i}:${c}`).join(' | '));
console.log('колонка артикула:', idCol, '| колонка варианта:', sizeCol);

if (idCol < 0 || sizeCol < 0) {
  console.log('Не нашли колонки артикула и варианта — пришлите файл, разберём вручную.');
  process.exit(1);
}

const variants = {};
let unknown = 0;
for (const line of lines.slice(1)) {
  const cells = line.split(sep);
  const id = (cells[idCol] || '').trim();
  const size = (cells[sizeCol] || '').trim();
  if (!/^\d{5,12}$/.test(id)) continue;
  const vlt = size.match(/(\d{1,2})\s*%/);
  if (!vlt) {
    unknown += 1;
    continue;
  }
  variants[id] = `${vlt[1]}%`;
}

fs.writeFileSync(OUT, JSON.stringify(variants, null, 1), 'utf8');
console.log('артикулов с процентом:', Object.keys(variants).length, '| без процента:', unknown);
console.log('сохранено:', OUT);
