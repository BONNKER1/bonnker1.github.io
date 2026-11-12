import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(new URL('../public/og-default.svg', import.meta.url));
const target = fileURLToPath(new URL('../public/og-default.png', import.meta.url));

const svg = await readFile(source);
const png = await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(png).toFile(target);

const { width, height } = await sharp(target).metadata();
console.log(`OG image: ${target} (${width}×${height})`);
