// Варианты (процент затемнения) карточек WB из экспорта личного кабинета.
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = process.argv[2] || 'import/wb-export.csv';
const OUT = path.resolve('import/wb-variants.json');

if (!fs.existsSync(SOURCE)) {
  console.log('Файла нет:', SOURCE);
  process.exit(0);
}

const raw = fs.readFileSync(SOURCE, 'utf8');
const lines = raw.split(/\r?\n/).filter((line) => line.trim());
if (!lines.length) {
  console.log('Файл пустой');
  process.exit(0);
}

const variants = {};
let unknown = 0;

for (const line of lines.slice(1)) {
  // ID is usually the first element in the CSV, often quoted.
  const idMatch = line.match(/^"(\d{5,12})"/);
  if (!idMatch) continue;
  const id = idMatch[1];
  
  // Percentage can be anywhere in the line.
  const vlt = line.match(/(\d{1,2})\s*%/);
  if (!vlt) {
    unknown += 1;
    continue;
  }
  variants[id] = `${vlt[1]}%`;
}

fs.writeFileSync(OUT, JSON.stringify(variants, null, 1), 'utf8');
console.log('артикулов с процентом:', Object.keys(variants).length, '| без процента:', unknown);
console.log('сохранено:', OUT);
