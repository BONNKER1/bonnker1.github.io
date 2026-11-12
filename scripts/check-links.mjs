import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function resolveInternal(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return true;
  const candidate = path.join(dist, clean);
  if (await exists(candidate)) {
    const info = await stat(candidate);
    if (info.isFile()) return true;
    if (await exists(path.join(candidate, 'index.html'))) return true;
  }
  if (await exists(`${candidate}.html`)) return true;
  return false;
}

const htmlFiles = await walk(dist);
const missing = [];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const link of links) {
    if (!link.startsWith('/') || link.startsWith('//')) continue;
    if (!(await resolveInternal(link))) {
      missing.push(`${path.relative(dist, file)} → ${link}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`Битые внутренние ссылки: ${missing.length}`);
  for (const item of [...new Set(missing)]) console.error(` - ${item}`);
  process.exit(1);
}

console.log(`Проверено ${htmlFiles.length} страниц — битых внутренних ссылок нет.`);
