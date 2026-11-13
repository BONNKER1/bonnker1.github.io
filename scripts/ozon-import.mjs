// Выгрузка ассортимента магазина Ozon через отдельный Chrome с отладочным портом.
// Запуск: node scripts/ozon-import.mjs [ссылка на магазин]
// Результат: import/ozon-api.json
//   { seller, importedAt, products: [{ id, name, url, film, place, vlt: { "15": { id, url, price } } }] }
//
// Ozon не отдаёт страницу обычному fetch (307-петля), поэтому все запросы идут
// из контекста открытой страницы ozon.ru — там есть куки и заголовки браузера.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SELLER = process.argv[2] || 'https://www.ozon.ru/seller/boonker-semnaya-tonirovka/';
const SELLER_PATH = new URL(SELLER).pathname;
const SELLER_PRODUCTS = `${SELLER_PATH.replace(/\/$/, '')}/products/`;
const PORT = 9334;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = path.join(os.tmpdir(), 'opencode-ozon-profile');
const OUT = path.resolve('import/ozon-api.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function launch() {
  const args = [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    ...(process.env.HEADFUL === '1' ? [] : ['--headless=new']),
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--lang=ru-RU',
    '--window-size=1440,1200',
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

const API = '/api/composer-api.bx/page/json/v2?url=';

/** Собираем все карточки магазина, листая пагинатор. */
const COLLECT = `(async () => {
  const out = new Map();
  const pages = [];
  let next = ${JSON.stringify(SELLER_PRODUCTS)};
  for (let p = 0; p < 80 && next; p += 1) {
    const res = await fetch(${JSON.stringify(API)} + encodeURIComponent(next), { headers: { accept: 'application/json' } });
    if (!res.ok) { pages.push({ path: next, error: res.status }); break; }
    let json;
    try { json = await res.json(); } catch { pages.push({ path: next, error: 'не JSON' }); break; }
    let found = 0;
    let pageNext = null;
    for (const [name, state] of Object.entries(json.widgetStates || {})) {
      let value;
      try { value = JSON.parse(state); } catch { continue; }
      if (Array.isArray(value.items) && /tileGrid/i.test(name)) {
        for (const item of value.items) {
          const nm = item.mainState?.find((s) => s.id === 'name')?.textDS?.text || '';
          if (!/тониров|плёнк|пленк|силикон/i.test(nm)) continue;
          const id = String(item.sku || item.id || '');
          if (!id || out.has(id)) continue;
          out.set(id, { id, name: nm, link: (item.action?.link || '').split('?')[0] });
          found += 1;
        }
      }
      if (/paginator/i.test(name) && value && typeof value === 'object' && value.nextPage) {
        pageNext = value.nextPage;
      }
    }
    pages.push({ path: next, found, total: out.size });
    if (!pageNext || pageNext === next) break;
    next = pageNext;
  }
  return { pages, items: [...out.values()] };
})()`;

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
    });
  }
  return out;
})()`;

const charValue = (product, key) =>
  product.characters.find((c) => c.key === key)?.values?.[0] ?? '';

/** Тип плёнки: в названии и характеристиках Ozon. */
function detectFilm(product) {
  const text = [product.title, ...product.characters.flatMap((c) => c.values), product.description]
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

async function main() {
  const child = launch();
  let cdp;
  try {
    cdp = new CDP(await devtoolsUrl());
    const { targetId } = await cdp.send('Target.createTarget', { url: SELLER });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.enable', {}, sessionId);

    // Ждём загрузку страницы магазина, чтобы появились куки.
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
    await sleep(2000);

    console.log('Собираю карточки магазина…');
    const collected = await evaluate(cdp, sessionId, COLLECT, true, 600000);
    for (const page of collected.pages) {
      console.log(
        `страница ${page.path.includes('page=') ? page.path.match(/page=(\\d+)/)?.[1] : 1}: +${page.found ?? 0}, всего ${page.total ?? 0}${page.error ? ` (ошибка ${page.error})` : ''}`,
      );
    }
    const items = collected.items;
    console.log('уникальных карточек:', items.length);
    if (!items.length) throw new Error('карточки не найдены');

    const products = [];
    const BATCH = 6;
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
      const details = await evaluate(cdp, sessionId, DETAILS(batch.map((x) => x.id)), true, 600000);
      for (const detail of details) {
        const listing = batch.find((x) => x.id === detail.id);
        const film = detectFilm(detail);
        const place = detectPlace(detail);
        const vlt = {};
        for (const variant of detail.variants) {
          if (variant.key !== 'LightTransmissionAuto') continue;
          const value = Number(variant.vlt);
          if (!value || !variant.sku) continue;
          vlt[value] = {
            id: variant.sku,
            url: `https://www.ozon.ru${variant.url}`,
            price: variant.price,
          };
        }
        const ownVlt = Number(charValue(detail, 'LightTransmissionAuto'));
        if (ownVlt && !vlt[ownVlt]) {
          vlt[ownVlt] = { id: detail.id, url: `https://www.ozon.ru${detail.url}`, price: null };
        }
        products.push({
          id: detail.id,
          name: listing?.name || detail.title,
          url: `https://www.ozon.ru${detail.url}`,
          film,
          place,
          placeText: charValue(detail, 'PlaceMount') || null,
          material: charValue(detail, 'Material_Auto') || null,
          vlt,
        });
      }
      console.log(`товары ${Math.min(i + BATCH, items.length)}/${items.length}`);
    }

    fs.writeFileSync(
      OUT,
      JSON.stringify({ seller: SELLER, importedAt: new Date().toISOString(), products }, null, 2),
      'utf8',
    );
    const byFilm = {};
    const byPlace = {};
    for (const p of products) {
      byFilm[p.film ?? 'нет'] = (byFilm[p.film ?? 'нет'] || 0) + 1;
      byPlace[p.place ?? 'нет'] = (byPlace[p.place ?? 'нет'] || 0) + 1;
    }
    console.log('сохранено:', OUT);
    console.log('по плёнке:', JSON.stringify(byFilm));
    console.log('по месту:', JSON.stringify(byPlace));
  } finally {
    cdp?.close();
    child.kill();
  }
}

main().catch((err) => {
  console.error('ОШИБКА:', err.message);
  process.exitCode = 1;
});
