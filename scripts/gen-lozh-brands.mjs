// Три ложемента в стиле других инструментальных фирм: STAHLWILLE / WERA / TENG
// Стилизация по составу и компоновке, без чужих логотипов на изделии.
// Единицы: 1 unit = 0.25 мм. Слои: красный = рез листа, чёрный = рез, зелёный = гравировка.
import { writeFileSync } from 'node:fs'

const U = 0.25

function builder() {
  const cut = [], eng = [], boxes = [], lbls = []
  const reg = (n, x1, y1, x2, y2, grp) => boxes.push({ n, x1, y1, x2, y2, grp })
  const rect = (n, x, y, w, h, rx = 0, grp = null) => {
    cut.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#000" stroke-width="1.6"/>`)
    reg(n, x, y, x + w, y + h, grp)
  }
  const circ = (n, cx, cy, r, grp = null) => {
    cut.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#000" stroke-width="1.6"/>`)
    reg(n, cx - r, cy - r, cx + r, cy + r, grp)
  }
  const path = (n, d, x1, y1, x2, y2, grp = null) => {
    cut.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="1.6"/>`)
    reg(n, x1, y1, x2, y2, grp)
  }
  const slotH = (n, x, y, w, h, grp = null) => rect(n, x, y, w, h, h / 2, grp)
  const label = (x, y, t, s = 22, anchor = 'middle') => {
    eng.push(`<text x="${x}" y="${y}" font-family="Arial" font-size="${s}" fill="#0a0" text-anchor="${anchor}">${t}</text>`)
    const w = t.length * s * 0.62
    const x1 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
    lbls.push({ t, x1, y1: y - s, x2: x1 + w, y2: y + s * 0.3 })
  }
  const freeAt = (x1, y1, x2, y2) => {
    const hit = b => Math.min(x2, b.x2) - Math.max(x1, b.x1) > 1 && Math.min(y2, b.y2) - Math.max(y1, b.y1) > 1
    return !boxes.some(hit) && !lbls.some(hit)
  }
  // подпись рядом с кругом: справа -> слева -> снизу -> сверху
  const tag = (cx, cy, r, t, s = 20) => {
    const w = t.length * s * 0.62
    const cand = [
      [cx + r + 6, cy - s * 0.35, cx + r + 6 + w, cy + s * 0.9, 'start'],
      [cx - r - 6 - w, cy - s * 0.35, cx - r - 6, cy + s * 0.9, 'end'],
      [cx - w / 2, cy + r + 6, cx + w / 2, cy + r + 6 + s * 1.25, 'middle'],
      [cx - w / 2, cy - r - 6 - s, cx + w / 2, cy - r - 6, 'middle'],
    ]
    const hit = cand.find(([a, b, c, d]) => freeAt(a, b, c, d))
    if (hit) label((hit[4] === 'start' ? hit[0] : hit[4] === 'end' ? hit[2] : cx), hit[1] + s * 0.35 + (hit[4] === 'middle' ? (hit[3] - hit[1] - s * 1.25) / 2 + s * 1.25 - s * 0.35 : 0), t, s, hit[4])
  }
  return { cut, eng, boxes, lbls, rect, circ, path, slotH, label, freeAt, tag }
}

// колонка головок: выравнивание по верху, диаметры по убыванию/возрастанию
function socketCol(b, cx, yTop, items, gap = 20) {
  let cy = yTop + items[0][0]
  items.forEach(([r, t], i) => {
    b.circ(`sk-${cx}-${i}`, cx, cy, r)
    b.tag(cx, cy, r, t)
    if (i < items.length - 1) cy += r + items[i + 1][0] + gap
  })
}

// ── A. STAHLWILLE: головки лесенкой + трещотка + удлинители + шестигранники ──
function stahlwille() {
  const b = builder()
  // трещотка 1/2" (контур из базового макета)
  b.path('ratchet', 'M 68 176 A 72 72 0 1 1 116 176 L 116 257 L 134 970 A 42 36 0 0 1 50 970 L 68 257 Z', 50, 36, 134, 1006, 'rat')
  b.circ('ratchet-eye', 92, 92, 26, 'rat')
  b.label(110, 1240, 'RATCHET 1/2"', 24)
  // удлинители
  b.rect('ext-1', 185, 60, 50, 360, 25)
  b.rect('ext-2', 185, 440, 50, 260, 25)
  b.rect('ext-3', 185, 740, 50, 120, 25)
  // угловой крест
  b.path('u-joint',
    'M 185 965 A 25 25 0 0 1 235 965 L 235 1040 L 249 1040 A 21 21 0 0 1 249 1082 L 235 1082 L 235 1165 A 25 25 0 0 1 185 1165 L 185 1082 L 171 1082 A 21 21 0 0 1 171 1040 L 185 1040 Z',
    150, 940, 270, 1190)
  b.label(210, 890, 'EXTENSIONS', 22)
  // головки 1/2" лесенкой
  b.label(620, 44, 'SOCKETS 1/2"', 22)
  socketCol(b, 380, 70, [[50, '19'], [48, '18'], [46, '17'], [44, '16'], [42, '15']])
  socketCol(b, 560, 70, [[40, '14'], [38, '13'], [36, '12'], [34, '11'], [32, '10']])
  socketCol(b, 740, 70, [[30, '9'], [28, '8'], [26, '7'], [24, '6']])
  // головки 1/4"
  b.label(920, 44, 'SOCKETS 1/4"', 20)
  socketCol(b, 920, 70, [[26, '13'], [25, '12'], [24, '11'], [23, '10'], [22, '9'], [21, '8']], 16)
  // глубокие головки
  b.label(615, 690, 'DEEP SOCKETS 22-30', 22)
  const deep = [[380, 56, '22'], [526, 60, '24'], [682, 66, '27'], [850, 72, '30']]
  deep.forEach(([cx, r, t], i) => {
    // глубокая головка = длинная капсула, верх на одном уровне, длина по размеру
    const top = 720, h = Math.round(r * 4.6)
    b.rect(`deep-${i}`, cx - r, top, r * 2, h, r)
    b.label(cx, top + h + 28, t, 20)
  })
  // шестигранники 8-19
  const widths = [72, 66, 60, 54, 48, 42, 36, 32]
  const xs = [1266, 1348, 1424, 1494, 1558, 1616, 1668, 1714]
  const bots = [520, 500, 480, 460, 440, 420, 400, 380]
  b.rect('comb-bar', 1250, 60, 510, 49, 4, 'comb')
  widths.forEach((w, i) => b.rect(`comb-${i}`, xs[i], 100, w, bots[i] - 100, w / 2, 'comb'))
  b.label(1500, 40, 'HEX KEYS 8 - 19', 22)
  // отвёртки
  b.rect('sd1-handle', 1300, 560, 80, 110, 14)
  b.rect('sd1-shaft', 1315, 690, 50, 550, 25)
  b.rect('sd2-handle', 1450, 560, 70, 100, 14)
  b.rect('sd2-shaft', 1462, 680, 46, 420, 23)
  b.label(1340, 1290, 'SCREWDRIVER', 22)
  b.label(1490, 1140, 'SCREWDRIVER', 22)
  emit(b, 'lozh_stahlwille_style')
}

// ── B. WERA: биты 25 мм + мелкий крепёж + отвёртки ──
function wera() {
  const b = builder()
  // два ряда битов
  for (let row = 0; row < 2; row++) {
    const y = row === 0 ? 60 : 190
    for (let i = 0; i < 12; i++) {
      const cx = 112 + i * 84
      b.rect(`bit-${row}-${i}`, cx - 13, y, 26, 110, 13)
    }
  }
  b.label(560, 46, 'BITS 25 MM', 22)
  // трещотка 1/4"
  b.path('ratchet', 'M 92 485 A 54 54 0 1 1 128 485 L 128 540 L 141 960 A 31.5 27 0 0 1 79 960 L 92 540 Z', 79, 380, 141, 987, 'rat')
  b.circ('ratchet-eye', 110, 420, 19.5, 'rat')
  b.label(115, 1030, 'RATCHET 1/4"', 24)
  // головки 1/4"
  socketCol(b, 320, 380, [[26, '13'], [25, '12'], [24, '11'], [23, '10'], [22, '9'], [21, '8'], [20, '7'], [19, '6']], 16)
  socketCol(b, 480, 380, [[24, '12'], [23, '11'], [22, '10'], [21, '9'], [20, '8'], [19, '7'], [18, '6'], [17, '5']], 16)
  b.label(400, 356, 'SOCKETS 1/4"', 22)
  // отвёртки
  b.rect('sd1-handle', 620, 400, 90, 120, 18)
  b.rect('sd1-shaft', 640, 540, 60, 550, 30)
  b.rect('sd2-handle', 780, 400, 80, 110, 16)
  b.rect('sd2-shaft', 795, 530, 50, 520, 25)
  b.rect('sd3-handle', 920, 400, 60, 90, 14)
  b.rect('sd3-shaft', 930, 510, 40, 390, 20)
  b.label(760, 380, 'SCREWDRIVERS', 22)
  // спиннер и Т-балка
  b.path('spinner',
    'M 1185 430 A 30 30 0 0 1 1245 430 L 1245 520 L 1250 520 A 30 30 0 0 1 1250 580 L 1245 580 L 1245 650 A 30 30 0 0 1 1185 650 L 1185 580 L 1180 580 A 30 30 0 0 1 1180 520 L 1185 520 Z',
    1150, 400, 1280, 680)
  b.label(1300, 450, 'SPINNER', 22, 'start')
  b.path('tbar',
    'M 1185 720 L 1245 720 A 35 35 0 0 1 1245 790 L 1227 790 L 1227 868 A 12 12 0 0 1 1203 868 L 1203 790 L 1185 790 A 35 35 0 0 1 1185 720 Z',
    1150, 720, 1280, 880)
  b.label(1300, 750, 'T-BAR 1/4"', 22, 'start')
  // шестигранники 1.5-10 внизу
  const widths = [66, 62, 56, 50, 46, 42, 36, 32, 28, 24]
  const heights = [300, 288, 276, 264, 252, 240, 230, 220, 210, 200]
  b.rect('comb-bar', 90, 1120, 1200, 49, 4, 'comb')
  widths.forEach((w, i) => b.rect(`comb-${i}`, 120 + i * 120, 1160, w, heights[i], w / 2, 'comb'))
  b.label(400, 1100, 'HEX KEYS 1.5 - 10', 22)
  emit(b, 'lozh_wera_style')
}

// ── C. TENG: ключи 10-19 + головки 3/8" ──
function teng() {
  const b = builder()
  // ключи веером горизонтально
  const rows = [
    [40, '19', 602], [37, '17', 566], [33, '15', 530], [32, '14', 512],
    [30, '13', 494], [28, '12', 476], [27, '11', 458], [25, '10', 440],
  ]
  const cys = [110, 247, 384, 521, 658, 795, 932, 1069]
  rows.forEach(([r, s, L], i) => {
    const cy = cys[i]
    const r2 = Math.round(r * 0.72)
    b.circ(`wr-ring-${s}`, 90, cy, r, 'wr')
    b.rect(`wr-slot-${s}`, 90, cy - 15, L, 30, 15, 'wr')
    b.circ(`wr-open-${s}`, 90 + L, cy, r2, 'wr')
    b.label(760, cy, s, 22, 'start')
  })
  b.label(400, 52, 'WRENCHES 10 - 19', 22)
  // трещотка 3/8"
  b.path('ratchet', 'M 940 178.6 A 61 61 0 1 1 980 178.6 L 980 240 L 995 660 A 35 30 0 0 1 925 660 L 940 240 Z', 925, 60, 995, 690, 'rat')
  b.circ('ratchet-eye', 960, 105, 22, 'rat')
  b.label(930, 730, 'RATCHET 3/8"', 24)
  // удлинители
  b.rect('ext-1', 1035, 240, 50, 280, 25)
  b.rect('ext-2', 1035, 540, 50, 180, 25)
  b.rect('ext-3', 1035, 740, 50, 120, 25)
  // угловой крест
  b.path('u-joint',
    'M 1035 915 A 25 25 0 0 1 1085 915 L 1085 975 L 1099 975 A 21 21 0 0 1 1099 1017 L 1085 1017 L 1085 1075 A 25 25 0 0 1 1035 1075 L 1035 1017 L 1021 1017 A 21 21 0 0 1 1021 975 L 1035 975 Z',
    1000, 890, 1120, 1100)
  b.label(1060, 1150, 'EXTENSIONS', 22)
  // головки 3/8"
  b.label(1310, 52, 'SOCKETS 3/8"', 22)
  socketCol(b, 1250, 90, [[40, '19'], [38, '18'], [36, '17'], [34, '16'], [32, '15'], [30, '14'], [28, '13']], 16)
  socketCol(b, 1430, 90, [[26, '12'], [25, '11'], [24, '10'], [23, '9'], [22, '8'], [21, '7'], [20, '6']], 16)
  emit(b, 'lozh_teng_style')
}

// ── проверка и сборка ──
function emit(b, name) {
  const problems = []
  for (let i = 0; i < b.boxes.length; i++)
    for (let j = i + 1; j < b.boxes.length; j++) {
      const a = b.boxes[i], c = b.boxes[j]
      const ox = Math.min(a.x2, c.x2) - Math.max(a.x1, c.x1)
      const oy = Math.min(a.y2, c.y2) - Math.max(a.y1, c.y1)
      if (ox > 2 && oy > 2 && !(a.grp && a.grp === c.grp))
        problems.push(`ГНЁЗДА: ${a.n} ∩ ${c.n} (${ox.toFixed(0)}x${oy.toFixed(0)})`)
    }
  for (const l of b.lbls)
    for (const c of b.boxes) {
      const ox = Math.min(l.x2, c.x2) - Math.max(l.x1, c.x1)
      const oy = Math.min(l.y2, c.y2) - Math.max(l.y1, c.y1)
      if (ox > 1 && oy > 1) problems.push(`ПОДПИСЬ "${l.t}" на ${c.n}`)
    }
  for (let i = 0; i < b.lbls.length; i++)
    for (let j = i + 1; j < b.lbls.length; j++) {
      const a = b.lbls[i], c = b.lbls[j]
      const ox = Math.min(a.x2, c.x2) - Math.max(a.x1, c.x1)
      const oy = Math.min(a.y2, c.y2) - Math.max(a.y1, c.y1)
      if (ox > 1 && oy > 1) problems.push(`ПОДПИСИ "${a.t}" и "${c.t}" наехали`)
    }
  // габариты листа: содержимое + поле 10 мм
  let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9
  for (const c of b.boxes) { x1 = Math.min(x1, c.x1); y1 = Math.min(y1, c.y1); x2 = Math.max(x2, c.x2); y2 = Math.max(y2, c.y2) }
  for (const l of b.lbls) { x1 = Math.min(x1, l.x1); y1 = Math.min(y1, l.y1); x2 = Math.max(x2, l.x2); y2 = Math.max(y2, l.y2) }
  const M = 40
  const bx1 = Math.max(0, Math.floor((x1 - M) / 20) * 20)
  const by1 = Math.max(0, Math.floor((y1 - M) / 20) * 20)
  const bx2 = Math.ceil((x2 + M) / 20) * 20
  const by2 = Math.ceil((y2 + M) / 20) * 20
  const BW = bx2 - bx1, BH = by2 - by1
  for (const c of b.boxes)
    if (c.x1 < bx1 + 10 || c.x2 > bx2 - 10 || c.y1 < by1 + 10 || c.y2 > by2 - 10)
      problems.push(`ЗА ЛИСТОМ: ${c.n}`)
  for (const l of b.lbls)
    if (l.x1 < bx1 + 10 || l.x2 > bx2 - 10 || l.y1 < by1 + 10 || l.y2 > by2 - 10)
      problems.push(`ЗА ЛИСТОМ подпись: "${l.t}"`)

  const head = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${(BW * U).toFixed(1)}mm" height="${(BH * U).toFixed(1)}mm" viewBox="${bx1} ${by1} ${BW} ${BH}" xmlns="http://www.w3.org/2000/svg">\n  <rect x="${bx1}" y="${by1}" width="${BW}" height="${BH}" fill="none" stroke="red" stroke-width="2"/>\n`
  writeFileSync(`${name}.svg`, head + b.cut.join('\n') + '\n' + b.eng.join('\n') + '\n</svg>\n', 'utf8')
  writeFileSync(`${name}_bottom.svg`, head + '</svg>\n', 'utf8')
  console.log(`\n=== ${name}: ${(BW * U).toFixed(0)} x ${(BH * U).toFixed(0)} мм | вырезов ${b.cut.length}, подписей ${b.eng.length}`)
  console.log(problems.length ? 'ПРОБЛЕМЫ:\n' + problems.join('\n') : 'Проверка пройдена')
}

stahlwille()
wera()
teng()
