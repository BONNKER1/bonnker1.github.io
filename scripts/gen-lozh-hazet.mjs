// Ложемент Hazet 163-138L — реконструкция по замерам оригинального вектора
// Лист 470 x 470 мм. viewBox 1880 x 1880 => 1 unit = 0.25 мм
// Слои: красный = рез листа, чёрный = рез насквозь, зелёный = гравировка
import { readFileSync, writeFileSync } from 'node:fs'

const U = 0.25 // unit -> мм
const W = 1880, H = 1880

const geom = JSON.parse(readFileSync('hazet-geom.json', 'utf8'))

const cut = []
const eng = []
const boxes = []
const lbls = []

const reg = (n, x1, y1, x2, y2, grp) => boxes.push({ n, x1, y1, x2, y2, grp })
const rect = (n, x, y, w, h, rx = 0, grp = null) => {
  cut.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#000" stroke-width="1.6"/>`)
  reg(n, x, y, x + w, y + h, grp)
}
const circ = (n, x, y, r, grp = null) => {
  cut.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#000" stroke-width="1.6"/>`)
  reg(n, x - r, y - r, x + r, y + r, grp)
}
const slot = (n, x1, y1, x2, y2, grp = null) => { // вертикальный капсульный паз
  const w = x2 - x1, h = y2 - y1
  rect(n, x1, y1, w, h, w / 2, grp)
}
const path = (n, d, x1, y1, x2, y2, grp = null) => {
  cut.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="1.6"/>`)
  reg(n, x1, y1, x2, y2, grp)
}
const label = (x, y, t, s = 26, anchor = 'middle') => {
  eng.push(`<text x="${x}" y="${y}" font-family="Arial" font-size="${s}" fill="#0a0" text-anchor="${anchor}">${t}</text>`)
  const w = t.length * s * 0.62
  const x1 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  lbls.push({ t, x1, y1: y - s, x2: x1 + w, y2: y + s * 0.3 })
}

// ── 1. КРУГЛЫЕ ГНЁЗДА (точные центры и радиусы из замеров) ──
const STD_12 = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
const STD_14 = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

// Сложные формы исключаем из кружков — они реконструируются вручную ниже
const COMPLEX = ['901,281,893,211', '37,342,493,1084', '529,343,152,442', '692,527,181,249',
  '539,900,310,358', '1434,1019,295,530', '1484,590,96,411', '1618,817,112,138', '1628,573,93,200',
  '1453,1040,40,47']

const circles = geom
  .filter(g => !COMPLEX.includes(g.bb.join(',')))
  .filter(g => g.type === 'circle' || (g.round >= 0.78 && g.fill >= 0.66 && g.fill <= 0.90))
  .map(g => g.type === 'circle'
    ? { cx: g.cx, cy: g.cy, r: g.r }
    : { cx: g.bb[0] + g.bb[2] / 2, cy: g.bb[1] + g.bb[3] / 2, r: Math.min(g.bb[2], g.bb[3]) / 2 })
  .sort((a, b) => a.cx - b.cx || a.cy - b.cy)

for (const c of circles) {
  circ(`sock-${c.cx}-${c.cy}`, c.cx, c.cy, c.r)
  c.show = false
}

// Размеры головок — явно по колонкам (сверху вниз), чтобы не было дублей
const COL_LABELS = {
  480: ['12'], 640: ['9'], 800: ['10'],
  960: ['10', '11', '12', '13', '14', '15', '17', '19'],
  1120: ['22', '21', '19', '17', '16', '15', '14', '13'],
  1280: ['8', '9', '10', '11', '12', '13', '14', '15', '16'],
  1360: ['13', '12', '11', '10', '9', '8', '7', '6', '5.5', '5', '4.5', '4'],
  1440: [], 1760: []
}
const byCol = new Map()
for (const c of circles) {
  const k = Math.round(c.cx / 80) * 80
  if (!byCol.has(k)) byCol.set(k, [])
  byCol.get(k).push(c)
}
for (const [k, list] of byCol) {
  list.sort((a, b) => a.cy - b.cy)
  const names = COL_LABELS[k] || []
  list.forEach((c, i) => { if (names[i] !== undefined) { c.af = names[i]; c.show = true } })
}

// ── 2. СЛОЖНЫЕ ФОРМЫ (реконструкция по профилю) ──

// ГРЕБЁНКА ключей-шестигранников: перемычка + 11 зубьев
const prongs = [[919, 984], [1022, 1080], [1120, 1176], [1216, 1263], [1305, 1351],
  [1386, 1427], [1464, 1502], [1537, 1562], [1603, 1632], [1669, 1700], [1743, 1769]]
rect('comb-bar', 901, 281, 892, 49, 4, 'comb')
prongs.forEach(([a, b], i) => slot(`comb-prong-${i}`, a, 320, b, 486, 'comb'))
label(1347, 274, 'HEX KEYS 1.5 - 13', 22)

// ЛЕВЫЙ БЛОК
slot('ext-long', 113, 342, 163, 1345, 'toolA')   // длинный паз с шариком
circ('ext-ball', 138, 1358, 44, 'toolA')
// трещотка: купол + шейка + расширяющаяся ручка — ОДИН замкнутый контур
path('ratchet',
  'M 277 468 A 72 72 0 1 1 325 468 L 325 545 L 343 1258 A 42 36 0 0 1 259 1258 L 277 545 Z',
  259, 328, 343, 1294, 'toolB')
circ('ratchet-eye', 301, 385, 26, 'toolB')       // отверстие в голове
// отвёртка: широкая плоская рукоять + длинный стержень (раздельные гнёзда)
rect('bar-wide', 407, 342, 82, 100, 14, 'bar2')
slot('bar-shaft', 422, 452, 474, 1236, 'bar2')

// бит-драйвер: цельная рукоять
rect('sd-head', 565, 343, 82, 175, 16, 'sdA')

// Т-рукоятка: балка + стержень
rect('t-cross-bar', 529, 530, 152, 80, 14, 'tcross')
slot('t-cross-stem', 577, 620, 633, 786, 'tcross')

// УГЛОК (U-JOINT): крест одним контуром — вертикальный капсульный + горизонтальный
path('u-joint',
  'M 736 572.5 A 45.5 45.5 0 0 1 827 572.5 L 827 668 L 851 668 A 21 21 0 0 1 851 710 ' +
  'L 827 710 L 827 730.5 A 45.5 45.5 0 0 1 736 730.5 L 736 710 L 713 710 A 21 21 0 0 1 713 668 L 736 668 Z',
  692, 527, 872, 776, 'cross')

// T-PAIR: балка сверху + два вертикальных паза (ключи)
rect('tp-bar', 539, 900, 310, 66, 8, 'tp')
slot('tp-left', 565, 958, 671, 1258, 'tp')
slot('tp-right', 715, 958, 823, 1258, 'tp')

// ПРАВЫЙ НИЖНИЙ КЛАСТЕР: три стержня сверху, балка, три стержня снизу
slot('rcl-up1', 1664, 1019, 1684, 1275, 'rcl')
slot('rcl-up2', 1561, 1090, 1582, 1275, 'rcl')
slot('rcl-up3', 1440, 1161, 1509, 1275, 'rcl')
rect('rcl-bar', 1434, 1268, 293, 54, 10, 'rcl')
slot('rcl-dn1', 1438, 1318, 1500, 1549, 'rcl')
slot('rcl-dn2', 1537, 1318, 1610, 1549, 'rcl')
slot('rcl-dn3', 1660, 1318, 1697, 1549, 'rcl')

// отвёртка малая: рукоять + стержень
rect('sd2-handle', 1500, 590, 64, 120, 18, 'sd2')
slot('sd2-shaft', 1520, 720, 1544, 990, 'sd2')

// спиннер: стержень сквозь балку — один контур
path('spinner',
  'M 1653 594 A 21 21 0 0 1 1695 594 L 1695 655 L 1699 655 A 25 25 0 0 1 1699 705 ' +
  'L 1695 705 L 1695 752 A 21 21 0 0 1 1653 752 L 1653 705 L 1649 705 A 25 25 0 0 1 1649 655 L 1653 655 Z',
  1624, 573, 1724, 773, 'r4')

// Т-балка 1/4": балка + стержень — один контур
path('tbar-14',
  'M 1650.5 835 L 1697.5 835 A 32.5 32.5 0 0 1 1697.5 900 L 1686 900 L 1686 978 ' +
  'A 12 12 0 0 1 1662 978 L 1662 900 L 1650.5 900 A 32.5 32.5 0 0 1 1650.5 835 Z',
  1618, 835, 1730, 990, 'r3')

// ── 3. ГРАВИРОВКА РАЗМЕРОВ ГОЛОВОК ──
const freeAt = (x1, y1, x2, y2) => {
  if (x1 < 12 || x2 > W - 12 || y1 < 12 || y2 > H - 12) return false
  const hit = b => Math.min(x2, b.x2) - Math.max(x1, b.x1) > 1 && Math.min(y2, b.y2) - Math.max(y1, b.y1) > 1
  return !boxes.some(hit) && !lbls.some(hit)
}
for (const c of circles) {
  if (!c.show) continue
  const t = String(c.af)
  const fs = 20
  const lw = t.length * fs * 0.62
  const cand = [
    [c.cx + c.r + 6, c.cy - fs * 0.35, c.cx + c.r + 6 + lw, c.cy + fs * 0.9],       // справа
    [c.cx - c.r - 6 - lw, c.cy - fs * 0.35, c.cx - c.r - 6, c.cy + fs * 0.9],       // слева
    [c.cx - lw / 2, c.cy + c.r + 6, c.cx + lw / 2, c.cy + c.r + 6 + fs * 1.25],     // снизу
    [c.cx - lw / 2, c.cy - c.r - 6 - fs, c.cx + lw / 2, c.cy - c.r - 6],            // сверху
  ]
  const hit = cand.find(([a, b, c2, d]) => freeAt(a, b, c2, d))
  if (hit) {
    const anchor = hit[0] > c.cx ? 'start' : hit[2] < c.cx ? 'end' : 'middle'
    const lx = anchor === 'start' ? hit[0] : anchor === 'end' ? hit[2] : c.cx
    const ly = anchor === 'middle' ? (hit[1] + hit[3]) / 2 + fs * 0.35 : c.cy + fs * 0.35
    label(lx, ly, t, fs, anchor)
  }
}

// ── 4. ПОДПИСИ ГРУПП ──
label(138, 1445, 'EXTENSION', 24)
label(301, 1345, 'RATCHET 1/2"', 24)
label(448, 1280, 'SCREWDRIVER', 22)
label(690, 500, 'DRIVER', 20)
label(605, 820, 'T-HANDLE', 22)
label(782, 820, 'U-JOINT', 22)
label(694, 1295, 'WRENCHES', 24)
label(1745, 590, 'SPINNER', 20, 'start')
label(1660, 1012, 'T-BAR 1/4"', 20)
label(1531, 1042, 'SCREWDRIVER', 20)
label(1580, 1590, 'DRIVE 1/4"', 24)

// ── 5. ПРОВЕРКА ──
const problems = []
for (let i = 0; i < boxes.length; i++)
  for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]
    const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)
    const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)
    if (ox > 2 && oy > 2 && !(a.grp && a.grp === b.grp))
      problems.push(`ГНЁЗДА: ${a.n} ∩ ${b.n} (${ox.toFixed(0)}x${oy.toFixed(0)})`)
  }
for (const l of lbls)
  for (const b of boxes) {
    const ox = Math.min(l.x2, b.x2) - Math.max(l.x1, b.x1)
    const oy = Math.min(l.y2, b.y2) - Math.max(l.y1, b.y1)
    if (ox > 1 && oy > 1) problems.push(`ПОДПИСЬ "${l.t}" на ${b.n}`)
  }
for (let i = 0; i < lbls.length; i++)
  for (let j = i + 1; j < lbls.length; j++) {
    const a = lbls[i], b = lbls[j]
    const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)
    const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)
    if (ox > 1 && oy > 1) problems.push(`ПОДПИСИ "${a.t}" и "${b.t}" наехали друг на друга`)
  }
for (const b of boxes)
  if (b.x1 < 10 || b.x2 > W - 10 || b.y1 < 10 || b.y2 > H - 10) problems.push(`ЗА ЛИСТОМ: ${b.n}`)

// ── 6. ГАБАРИТЫ ЛИСТА: содержимое + поля 10 мм ──
let cx1 = 1e9, cy1 = 1e9, cx2 = -1e9, cy2 = -1e9
for (const b of boxes) { cx1 = Math.min(cx1, b.x1); cy1 = Math.min(cy1, b.y1); cx2 = Math.max(cx2, b.x2); cy2 = Math.max(cy2, b.y2) }
for (const l of lbls) { cx1 = Math.min(cx1, l.x1); cy1 = Math.min(cy1, l.y1); cx2 = Math.max(cx2, l.x2); cy2 = Math.max(cy2, l.y2) }

const M = 40 // поле 10 мм
const bx1 = Math.floor((cx1 - M) / 20) * 20
const by1 = Math.floor((cy1 - M) / 20) * 20
const bx2 = Math.ceil((cx2 + M) / 20) * 20
const by2 = Math.ceil((cy2 + M) / 20) * 20
const BW = bx2 - bx1, BH = by2 - by1

// ── 7. СБОРКА ──
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${(BW * U).toFixed(1)}mm" height="${(BH * U).toFixed(1)}mm" viewBox="${bx1} ${by1} ${BW} ${BH}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${bx1}" y="${by1}" width="${BW}" height="${BH}" fill="none" stroke="red" stroke-width="2"/>
${cut.join('\n')}
${eng.join('\n')}
</svg>
`
writeFileSync('lozh_hazet_470.svg', svg, 'utf8')

const bottom = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${(BW * U).toFixed(1)}mm" height="${(BH * U).toFixed(1)}mm" viewBox="${bx1} ${by1} ${BW} ${BH}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${bx1}" y="${by1}" width="${BW}" height="${BH}" fill="none" stroke="red" stroke-width="2"/>
</svg>
`
writeFileSync('lozh_hazet_470_bottom.svg', bottom, 'utf8')

console.log(`OK: круглых гнёзд ${circles.length}, всего вырезов ${cut.length}, подписей ${eng.length}`)
console.log(`Лист: ${(BW * U).toFixed(1)} x ${(BH * U).toFixed(1)} мм | содержимое ${((cx2 - cx1) * U).toFixed(1)} x ${((cy2 - cy1) * U).toFixed(1)} мм`)
console.log(problems.length ? 'ПРОБЛЕМЫ (' + problems.length + '):\n' + problems.slice(0, 30).join('\n') : 'Проверка пройдена')
