// Ложемент по образцу Hazet 163-138L — лист 450 x 350 мм
// Слои: красный = рез листа, чёрный = рез насквозь, зелёный = гравировка
// Генератор проверяет пересечения гнёзд и подписей.
import { writeFileSync } from 'node:fs'

const W = 450, H = 350

const cut = []
const eng = []
const boxes = []
const lblBoxes = []
const skipPair = new Set()

const reg = (name, x1, y1, x2, y2) => boxes.push({ name, x1, y1, x2, y2 })

const rect = (name, x, y, w, h, rx = 0) => {
  cut.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#000" stroke-width="0.4"/>`)
  reg(name, x, y, x + w, y + h)
}
const circ = (name, x, y, r) => {
  cut.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#000" stroke-width="0.4"/>`)
  reg(name, x - r, y - r, x + r, y + r)
}
const path = (name, d, x1, y1, x2, y2) => {
  cut.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.4"/>`)
  reg(name, x1, y1, x2, y2)
}
const label = (x, y, t, s = 5.5, anchor = 'middle') => {
  eng.push(`<text x="${x}" y="${y}" font-family="Arial" font-size="${s}" fill="#0a0" text-anchor="${anchor}">${t}</text>`)
  const w = t.length * s * 0.62
  const x1 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  lblBoxes.push({ name: t, x1, y1: y - s, x2: x1 + w, y2: y + s * 0.3 })
}
const capsule = (name, x, y, w, h) => rect(name, x, y, w, h, w / 2)

function hexBit(x, y, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6
    pts.push(`${(x + r * Math.cos(a)).toFixed(2)} ${(y + r * Math.sin(a)).toFixed(2)}`)
  }
  path(`hex${Math.round(x)}`, `M ${pts.join(' L ')} Z`, x - r, y - r, x + r, y + r)
}

// Трещотка: круглая голова с отверстием + ручка (один цельный контур)
function ratchet(name, cx, cy, headR, hw, len) {
  const dy = Math.sqrt(Math.max(headR * headR - (hw / 2) ** 2, 1))
  path(name,
    `M ${cx - hw / 2} ${cy + dy}
     A ${headR} ${headR} 0 1 1 ${cx + hw / 2} ${cy + dy}
     L ${cx + hw / 2} ${len}
     Q ${cx + hw / 2} ${len + 11} ${cx} ${len + 11}
     Q ${cx - hw / 2} ${len + 11} ${cx - hw / 2} ${len}
     Z`,
    cx - headR, cy - headR, cx + headR, len + 11)
  circ(name + '-eye', cx, cy - headR * 0.30, headR * 0.30)
  skipPair.add(`${name}-eye|${name}`)
  skipPair.add(`${name}|${name}-eye`)
}

// Крест (кардан)
function plus(name, cx, cy, arm, w) {
  const a = arm, b = w / 2
  path(name,
    `M ${cx - b} ${cy - a} L ${cx + b} ${cy - a} L ${cx + b} ${cy - b} L ${cx + a} ${cy - b}
     L ${cx + a} ${cy + b} L ${cx + b} ${cy + b} L ${cx + b} ${cy + a} L ${cx - b} ${cy + a}
     L ${cx - b} ${cy + b} L ${cx - a} ${cy + b} L ${cx - a} ${cy - b} L ${cx - b} ${cy - b} Z`,
    cx - a, cy - a, cx + a, cy + a)
}

// ═══════════════ ЛЕВАЯ ЗОНА — ИНСТРУМЕНТЫ ПО ГРУППАМ ═══════════════

label(26, 17, 'BOONKER', 7)

// 1. Удлинители
capsule('ext-250', 6, 28, 16, 230)
capsule('ext-125', 27, 28, 14, 146)
label(23, 276, 'EXT 250/125')

// 2. Трещотка 1/2"
ratchet('ratchet', 70, 50, 21, 20, 205)
label(68, 262, 'RATCHET 1/2"')

// 3. Отвёртки
rect('sd1-shaft', 102, 28, 13, 168, 2)
circ('sd1-handle', 108.5, 210, 14)
rect('sd2-shaft', 128, 28, 13, 130, 2)
circ('sd2-handle', 134.5, 172, 12)
label(110, 232, 'SCREWDRIVERS')

// 4. Рожково-накидные ключи
capsule('wrench-a', 151, 28, 22, 168)
capsule('wrench-b', 178, 28, 20, 130)
label(175, 214, 'WRENCHES')

// 5. Т-образный вороток (перекладина + стойка)
rect('t-handle-bar', 152, 232, 50, 26)
rect('t-handle-stem', 170, 250, 12, 70)
skipPair.add('t-handle-bar|t-handle-stem')
skipPair.add('t-handle-stem|t-handle-bar')
label(177, 336, 'T-HANDLE')

// 6. Адаптеры / мелкие гнёзда
circ('adapter-a', 104, 272, 12)
circ('adapter-b', 136, 268, 9.5)
circ('adapter-c', 136, 292, 7.5)
label(116, 252, 'ADAPTERS')

// Нижний ряд битов (левая часть)
for (let i = 0; i < 15; i++) hexBit(12 + i * 10, 312, 4.5)
label(80, 332, 'BITS 1/4"', 5)

// ═══════════════ ГРЕБЁНКА — КЛЮЧИ-ШЕСТИГРАННИКИ ═══════════════

const hexSizes = [1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
hexSizes.forEach((s, i) => {
  const x = 212 + i * 13
  const w = 7.5 - i * 0.3
  const h = 66 - i * 2.9
  rect(`hexkey-${s}`, x, 14, w, h, 1)
  label(x + w / 2, 14 + h + 7, s, 4.2)
})
label(216, 9, 'HEX KEYS 1.5-13', 4.5)

// ═══════════════ БЛОК ГОЛОВОК 1/2" — ЛЕСЕНКА ═══════════════

const colA = [8, 9, 10, 11, 12, 13]
colA.forEach((d, i) => {
  const r = d / 2 + 0.5
  const y = 94 + i * 26
  circ(`sockA-${d}`, 228, y, r)
  label(228 + r + 3, y + 2, d, 5, 'start')
})

const colB = [14, 15, 16, 17, 18, 19]
colB.forEach((d, i) => {
  const r = d / 2 + 0.5
  const y = 96 + i * 30
  circ(`sockB-${d}`, 268, y, r)
  label(268 + r + 3, y + 2, d, 5, 'start')
})

const colC = [21, 22, 24, 27, 30]
colC.forEach((d, i) => {
  const r = d / 2 + 0.5
  const y = 98 + i * 36
  circ(`sockC-${d}`, 312, y, r)
  label(312 + r + 3, y + 2, d, 5, 'start')
})

const colD = [10, 11, 12, 13, 14, 15]
colD.forEach((d, i) => {
  const r = d / 2 + 0.5
  const y = 94 + i * 24
  circ(`sockD-${d}`, 358, y, r)
  label(358 - r - 3, y + 2, d, 5, 'end')
})

// Нижний ряд битов (правая часть)
for (let i = 0; i < 13; i++) hexBit(218 + i * 13.5, 312, 4.5)
label(298, 332, 'BITS 1/4"', 5)

// ═══════════════ КРАЙНИЙ ПРАВЫЙ СТОЛБЕЦ — ДРАЙВ 1/4" ═══════════════

capsule('ext-125b', 406, 28, 13, 96)
rect('sd3-shaft', 430, 30, 10, 90, 2)
circ('sd3-handle', 435, 132, 11)
plus('u-joint', 425, 160, 15, 9)
ratchet('ratchet-s', 425, 208, 16, 12, 278)
label(425, 300, 'DRIVE 1/4"')

// ═══════════════ ПРОВЕРКА ═══════════════

const problems = []
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]
    if (skipPair.has(`${a.name}|${b.name}`) || skipPair.has(`${b.name}|${a.name}`)) continue
    const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)
    const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)
    if (ox > 1 && oy > 1) problems.push(`ГНЁЗДА: ${a.name} ∩ ${b.name} (${ox.toFixed(1)}x${oy.toFixed(1)})`)
  }
}
for (const l of lblBoxes) {
  for (const b of boxes) {
    const ox = Math.min(l.x2, b.x2) - Math.max(l.x1, b.x1)
    const oy = Math.min(l.y2, b.y2) - Math.max(l.y1, b.y1)
    if (ox > 0.5 && oy > 0.5) problems.push(`ПОДПИСЬ: "${l.name}" на ${b.name}`)
  }
}
for (const l of lblBoxes) {
  if (l.x1 < 2 || l.x2 > W - 2 || l.y1 < 2 || l.y2 > H - 2) problems.push(`ПОДПИСЬ: "${l.name}" за листом`)
}
for (const b of boxes) {
  if (b.x1 < 2 || b.x2 > W - 2 || b.y1 < 2 || b.y2 > H - 2) problems.push(`ГНЁЗДО: ${b.name} за листом`)
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="red" stroke-width="1.2"/>
${cut.join('\n')}
${eng.join('\n')}
</svg>
`
writeFileSync('lozh_hazet_163.svg', svg, 'utf8')

const bottom = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="red" stroke-width="1.2"/>
</svg>
`
writeFileSync('lozh_hazet_163_bottom.svg', bottom, 'utf8')

console.log(`OK: ${cut.length} вырезов, ${eng.length} подписей`)
console.log(problems.length ? 'ПРОБЛЕМЫ:\n' + problems.join('\n') : 'Проверка пройдена — пересечений нет')
