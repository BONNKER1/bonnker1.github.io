// Выгрузка ассортимента магазина WB через отдельный Chrome с отладочным портом.
// Запуск: node scripts/wb-import.mjs [sellerId]
// Результат: import/wb-products.json
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SELLER = process.argv[2] || '585856';
const PORT = 9333;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = path.join(os.tmpdir(), 'opencode-wb-profile');
const OUT = path.resolve('import/wb-products.json');

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
      if (res.ok) {
        const info = await res.json();
        return info.webSocketDebuggerUrl;
      }
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
        return;
      }
      if (msg.method === 'Network.responseReceived') {
        const { url, mimeType } = msg.params.response;
        if (/catalog\.wb\.ru|wbxcontent|\/sellers\//.test(url) && /json/.test(mimeType || '')) {
          this.responses = this.responses || [];
          this.responses.push({ requestId: msg.params.requestId, sessionId: msg.sessionId, url });
        }
      }
    });
  }

  async send(method, params = {}, sessionId) {
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
      }, 60000);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function evaluate(cdp, sessionId, expression, awaitPromise = false) {
  const res = await cdp.send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise, userGesture: true },
    sessionId,
  );
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || 'ошибка evaluate');
  }
  return res.result.value;
}

const EXTRACT = `(() => {
  const seen = new Map();
  document.querySelectorAll('a[href*="/catalog/"]').forEach((a) => {
    const id = (a.getAttribute('href') || '').match(/catalog\\/(\\d+)/)?.[1];
    if (!id || seen.has(id)) return;
    const card = a.closest('article') || a.closest('div[class*="product-card"]') || a;
    const text = (card.innerText || '').replace(/\\s+/g, ' ').trim();
    const nameEl = card.querySelector('[class*="product-card__name"], [class*="__name"], h2, h3');
    const name = (nameEl?.innerText || '').replace(/\\s+/g, ' ').trim();
    const img = card.querySelector('img');
    const alt = (img?.getAttribute('alt') || '').replace(/\\s+/g, ' ').trim();
    seen.set(id, { id, href: a.href.split('?')[0], name, alt, text });
  });
  return [...seen.values()];
})()`;

async function main() {
  const child = launch();
  let cdp;
  try {
    const wsUrl = await devtoolsUrl();
    cdp = new CDP(wsUrl);
    const { targetId } = await cdp.send('Target.createTarget', {
      url: `https://www.wildberries.ru/seller/${SELLER}?sort=popular&page=1`,
    });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Network.enable', {}, sessionId);

    let state = '';
    let bodyText = '';
    let solved = false;
    for (let i = 0; i < 60; i += 1) {
      await sleep(1000);
      try {
        const info = await evaluate(
          cdp,
          sessionId,
          `({ state: document.readyState, text: (document.body ? document.body.innerText : '').slice(0, 400), cards: document.querySelectorAll('a[href*="/catalog/"]').length })`,
        );
        state = info?.state || '';
        bodyText = info?.text || '';
        if ((info?.cards || 0) > 0) {
          solved = true;
          break;
        }
        if (i % 5 === 0) console.log(`[${i}s] ${JSON.stringify(bodyText.slice(0, 60))} cards=${info?.cards}`);
      } catch {}
    }
    console.log('readyState:', state, '| проверка пройдена:', solved);
    console.log('начало страницы:', JSON.stringify(bodyText.slice(0, 200)));

    let last = 0;
    for (let i = 0; i < 25; i += 1) {
      const height = await evaluate(cdp, sessionId, 'document.body.scrollHeight');
      if (height === last) break;
      last = height;
      await evaluate(cdp, sessionId, `window.scrollTo(0, document.body.scrollHeight)`);
      await sleep(900);
    }
    await evaluate(cdp, sessionId, `window.scrollTo(0, 0)`);
    await sleep(400);

    // Пробуем забрать структурированный JSON того же API, что использует сайт (из контекста страницы,
    // с её cookies). Если не выйдет — падаем на разбор DOM.
    const apiScript = `(async () => {
      const out = [];
      const base = 'https://catalog.wb.ru/sellers/v2/catalog?appType=1&curr=rub&dest=-1257786&lang=ru&locale=ru&sort=popular&spp=30&supplier=${SELLER}&seller=${SELLER}&page=';
      for (let page = 1; page <= 60; page += 1) {
        const res = await fetch(base + page, { headers: { Accept: 'application/json, text/plain, */*' }, credentials: 'include' });
        if (!res.ok) return { error: 'HTTP ' + res.status, pages: page - 1, items: out };
        const json = await res.json();
        const products = json?.data?.products || json?.products || [];
        if (!products.length) break;
        for (const p of products) out.push({ id: p.id, name: p.name, brand: p.brand, price: p.sizes?.[0]?.price?.total ?? p.salePriceU ?? null, feedbacks: p.feedbacks ?? null, rating: p.reviewRating ?? null });
        if (products.length < 30) break;
      }
      return { pages: 'ok', items: out };
    })()`;

    let api = null;
    try {
      api = await evaluate(cdp, sessionId, apiScript, true);
    } catch (err) {
      console.log('API недоступен:', err.message);
    }
    console.log('API:', api ? `${api.error || 'ok'}, позиций: ${api.items?.length ?? 0}` : 'нет ответа');

    // Сохраняем тела JSON-ответов (страницы каталога продавца) — там точные названия и бренды.
    const raw = [];
    for (const r of cdp.responses || []) {
      try {
        const body = await cdp.send('Network.getResponseBody', { requestId: r.requestId }, r.sessionId);
        const json = JSON.parse(body.body);
        const products = json?.data?.products || json?.products || [];
        for (const p of products) {
          raw.push({
            id: p.id,
            name: p.name,
            brand: p.brand,
            subject: p.subjectName || p.entity || null,
            price: p.sizes?.[0]?.price?.total ?? p.salePriceU ?? null,
            feedbacks: p.feedbacks ?? null,
            rating: p.reviewRating ?? p.rating ?? null,
          });
        }
      } catch {}
    }
    const uniq = [...new Map(raw.map((p) => [p.id, p])).values()];
    console.log('из JSON-ответов:', uniq.length);
    if (uniq.length) {
      fs.mkdirSync(path.resolve('import/raw'), { recursive: true });
      fs.writeFileSync(path.resolve('import/wb-api.json'), JSON.stringify(uniq, null, 2), 'utf8');
      console.log('сохранено: import/wb-api.json');
    }

    const items = await evaluate(cdp, sessionId, EXTRACT);
    const pageTitle = await evaluate(cdp, sessionId, 'document.title');
    console.log('title:', pageTitle);
    console.log('товаров найдено:', items.length);

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    if (api?.items?.length) {
      fs.writeFileSync(path.resolve('import/wb-api.json'), JSON.stringify(api.items, null, 2), 'utf8');
      console.log('API сохранено: import/wb-api.json');
    }
    fs.writeFileSync(OUT, JSON.stringify(items, null, 2), 'utf8');
    console.log('сохранено:', OUT);
    if (items.length === 0) {
      console.log('ТЕКСТ СТРАНИЦЫ:', bodyText);
    }
  } finally {
    cdp?.close();
    child.kill();
  }
}

main().catch((err) => {
  console.error('ОШИБКА:', err.message);
  process.exitCode = 1;
});
