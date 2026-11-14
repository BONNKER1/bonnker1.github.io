// Выгрузка ассортимента магазина Ozon через отдельный Chrome с отладочным портом.
// Запуск: node scripts/ozon-import.mjs [ссылка на магазин]
// Результат: import/ozon-api.json
//   { seller, importedAt, products: [{ id, name, url, film, place, vlt: { "15": { id, url, price } } }] }
//
// Ozon прячет каталог за виртуальной прокруткой и антиботом, поэтому карточки собираем
// с реальной страницы магазина (прокрутка вниз до конца), а характеристики и варианты
// по светопропусканию — из composer API в контексте этой же страницы.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SELLER = process.argv[2] || 'https://www.ozon.ru/seller/boonker-semnaya-tonirovka/';
const PORT = 9334;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = path.join(os.tmpdir(), 'opencode-ozon-profile');
const OUT = path.resolve('import/ozon-api.json');
const TINT_RE = /тониров|плёнк|пленк|силикон/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function launch({ headful }) {
  const args = [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    ...(headful ? [] : ['--headless=new']),
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--lang=ru-RU',
    '--window-size=1440,1600',
    'about:blank',
  ];
  return spawn(CHROME, args, { stdio: 'ignore' });
}

async function devtoolsUrl() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('Chrome не отдал отладочный порт');
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (e) => reject(new Error('WS error: ' + e.message)));
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  async send(method, params = {}, sessionId, timeout = 60000) {
    await this.ready;
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, timeout);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function evaluate(cdp, sessionId, expression, awaitPromise = false, timeout = 60000) {
  const res = await cdp.send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise, userGesture: true },
    sessionId,
    timeout,
  );
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || 'ошибка evaluate');
  }
  return res.result.value;
}

/** Карточки товаров, которые сейчас отрисованы на странице магазина. */
const COLLECT = `(() => {
  const seen = new Map();
  document.querySelectorAll('a[href*="/product/"]').forEach((a) => {
    const m = (a.getAttribute('href') || '').match(/\\/product\\/(?:[^/]*?-)?(\\d{6,})\\//);
    if (!m) return;
    const id = m[1];
    const card = a.closest('article') || a.closest('[class*="product-card"]') || a.parentElement?.parentElement || a;
    // Обёртка карточки содержит название и цену.
    const text = (a.innerText || card.innerText || '').replace(/\\s+/g, ' ').trim();
    if (!seen.has(id)) seen.set(id, { id, href: a.href.split('?')[0], text });
  });
  return [...seen.values()];
})()`;

const API = '/api/composer-api.bx/page/json/v2?url=';

/** Подробности карточек: название, плёнка, место установки, варианты по светопропусканию. */
const DETAILS = (ids) => `(async () => {
  const ids = ${JSON.stringify(ids)};
  const api = ${JSON.stringify(API)};
  const getJson = async (url) => {
    const res = await fetch(api + encodeURIComponent(url), { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    try { return await res.json(); } catch { return null; }
  };
  const widget = (json, re) => {
    for (const [name, state] of Object.entries(json?.widgetStates || {})) {
      if (!re.test(name)) continue;
      try { return JSON.parse(state); } catch {}
    }
    return null;
  };
  const clean = (u) => (u || '').split('?')[0];
  const out = [];
  for (const id of ids) {
    const p1 = await getJson('/product/' + id + '/');
    const p2 = await getJson('/product/' + id + '/?layout_container=pdpPage2column&layout_page_index=2');
    const head = widget(p1, /^webProductHeading/);
    const aspects = widget(p1, /^webAspects/);
    const chars = widget(p2, /^webCharacteristics/);
    const desc = widget(p2, /^webDescription/);
    const sellerIdMatch = JSON.stringify(p1?.widgetStates || {}).match(/\"sellerId\"\\s*:\\s*\"?(\\d+)\"?/);
    const sellerId = sellerIdMatch ? sellerIdMatch[1] : null;
    const variants = [];
    for (const aspect of aspects?.aspects || []) {
      if (!/LightTransmission|PlaceMount/i.test(aspect.aspectKey || '')) continue;
      for (const v of aspect.variants || []) {
        variants.push({
          key: aspect.aspectKey,
          sku: String(v.sku || ''),
          vlt: v.data?.searchableText || null,
          price: v.price ?? null,
          url: clean(v.link),
          active: Boolean(v.active),
        });
      }
    }
    const characters = [];
    for (const block of chars?.characteristics || []) {
      for (const c of block.short || []) {
        characters.push({ key: c.key, name: c.name, values: (c.values || []).map((x) => x.text) });
      }
    }
    out.push({
      id,
      title: head?.title || '',
      url: '/product/' + id + '/',
      variants,
      characters,
      description: desc?.richAnnotation || '',
      sellerId,
    });
  }
  return out;
})()`;

const charValue = (product, key) =>
  product.characters.find((c) => c.key === key)?.values?.[0] ?? '';

/** Тип плёнки: в названии и характеристиках Ozon. */
function detectFilm(product) {
  const text = [product.title, ...product.characters.flatMap((c) => c.values)]
    .join(' ')
    .toLowerCase();
  if (/атермальн/.test(text)) return 'athermal';
  if (/жёстк|жестк|премиум|premium/.test(text)) return 'hard';
  if (/классическ/.test(text)) return 'classic';
  if (/силикон/.test(text)) return 'silicone';
  return null;
}

/** Комплект: «Место установки» из характеристик. */
function detectPlace(product) {
  const place = charValue(product, 'PlaceMount').toLowerCase();
  if (/лобов/.test(place)) return 'windshield';
  if (/полн|все\s+стёкл|все\s+стекл/.test(place)) return 'full';
  if (/передн/.test(place)) return 'front';
  if (/задн/.test(place)) return 'rear';
  if (/боков/.test(place)) return 'full';
  return null;
}

/** Прокручиваем магазин до конца и собираем все карточки. */
async function collectCards(cdp, sessionId) {
  let stable = 0;
  let last = 0;
  const all = new Map();
  for (let round = 0; round < 300; round += 1) {
    const items = await evaluate(cdp, sessionId, COLLECT, false, 120000);
    for (const item of items) if (!all.has(item.id)) all.set(item.id, item);
    if (all.size === last) {
      stable += 1;
      if (stable >= 5) break;
    } else {
      stable = 0;
      last = all.size;
    }
    await evaluate(cdp, sessionId, 'window.scrollTo(0, document.body.scrollHeight)', false, 30000);
    await sleep(1200);
  }
  await evaluate(cdp, sessionId, 'window.scrollTo(0, 0)', false, 30000);
  return [...all.values()];
}

async function openSeller() {
  const child = launch({ headful: process.env.HEADFUL === '1' });
  const cdp = new CDP(await devtoolsUrl());
  const { targetId } = await cdp.send('Target.createTarget', { url: SELLER });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  for (let i = 0; i < 60; i += 1) {
    await sleep(1000);
    try {
      const ready = await evaluate(
        cdp,
        sessionId,
        `location.hostname === 'www.ozon.ru' && document.readyState === 'complete'`,
      );
      if (ready) break;
    } catch {}
  }
  await sleep(2500);
  return { child, cdp, sessionId };
}

async function run() {
  let session = null;
  try {
    console.log(process.env.HEADFUL === '1' ? 'Открываю видимое окно Chrome…' : 'Пробую headless…');
    session = await openSeller();
    let cards = await collectCards(session.cdp, session.sessionId);
    console.log('headless собрано карточек:', cards.length);
    if (process.env.HEADFUL !== '1' && cards.length < 20) {
      console.log('Слишком мало — перезапускаю в видимом окне Chrome…');
      session.cdp.close();
      session.child.kill();
      await sleep(1500);
      process.env.HEADFUL = '1';
      session = await openSeller();
      cards = await collectCards(session.cdp, session.sessionId);
      console.log('видимое окно собрало карточек:', cards.length);
    }

    const tint = cards.filter((c) => TINT_RE.test(c.text));
    console.log('из них тонировка:', tint.length, '| всего карточек:', cards.length);
    if (!tint.length) throw new Error('карточки не найдены');

    const products = new Map();
    const BATCH = 6;
    const CONCURRENCY = 6;
    const batches = [];
    for (let i = 0; i < tint.length; i += BATCH) batches.push(tint.slice(i, i + BATCH));

    let done = 0;
    const worker = async () => {
      while (batches.length) {
        const batch = batches.shift();
        if (!batch) break;
        let details = [];
        try {
          details = await evaluate(session.cdp, session.sessionId, DETAILS(batch.map((x) => x.id)), true, 600000);
        } catch (err) {
          console.log('  подробности не получены:', err.message);
          details = [];
        }
        for (const id of batch.map((x) => x.id)) {
          const listing = batch.find((x) => x.id === id);
          const detail = details.find((x) => String(x.id) === String(id));
          if (!detail) {
            // Без подробностей сохраняем только если в названии явно тонировка.
            const name = (listing?.text || '').replace(/\s+/g, ' ').trim();
            if (!TINT_RE.test(name)) continue;
            products.set(id, {
              id,
              name,
              url: `https://www.ozon.ru/product/${id}/`,
              film: /атерм/i.test(name) ? 'athermal' : /классич/i.test(name) ? 'classic' : 'silicone',
              place: /лобов/i.test(name) ? 'windshield' : 'full',
              placeText: null,
              material: null,
              vlt: {},
            });
            continue;
          }
          // Товары чужих продавцов, попавшие в выдачу как «похожие», пропускаем.
          if (detail.sellerId && detail.sellerId !== '406187') continue;
          // Товары-рекомендации других продавцов в выдаче магазина отбрасываем.
          if (!TINT_RE.test(detail.title || '')) continue;
          const film = detectFilm(detail);
          const place = detectPlace(detail);
          const vlt = {};
          for (const variant of detail.variants) {
            if (variant.key !== 'LightTransmissionAuto') continue;
            const value = Number(variant.vlt);
            if (!value || !variant.sku) continue;
            vlt[value] = { id: variant.sku, url: `https://www.ozon.ru${variant.url}`, price: variant.price };
          }
          const ownVlt = Number(charValue(detail, 'LightTransmissionAuto'));
          if (ownVlt && !vlt[ownVlt]) {
            vlt[ownVlt] = { id: detail.id, url: `https://www.ozon.ru${detail.url}`, price: null };
          }
          products.set(id, {
            id: detail.id,
            name: detail.title || (listing?.text || '').replace(/\s+/g, ' ').trim(),
            url: `https://www.ozon.ru${detail.url}`,
            film,
            place,
            placeText: charValue(detail, 'PlaceMount') || null,
            material: charValue(detail, 'Material_Auto') || null,
            vlt,
          });
        }
        done += batch.length;
        console.log(`товары ${done}/${tint.length}`);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    const list = [...products.values()];

    fs.writeFileSync(
      OUT,
      JSON.stringify({ seller: SELLER, importedAt: new Date().toISOString(), products: list }, null, 2),
      'utf8',
    );
    const byFilm = {};
    const byPlace = {};
    for (const p of list) {
      byFilm[p.film ?? 'нет'] = (byFilm[p.film ?? 'нет'] || 0) + 1;
      byPlace[p.place ?? 'нет'] = (byPlace[p.place ?? 'нет'] || 0) + 1;
    }
    console.log('сохранено:', OUT);
    console.log('по плёнке:', JSON.stringify(byFilm));
    console.log('по месту:', JSON.stringify(byPlace));
  } finally {
    if (session) {
      session.cdp?.close();
      session.child.kill();
    }
  }
}

run().catch((err) => {
  console.error('ОШИБКА:', err.message);
  process.exitCode = 1;
});
