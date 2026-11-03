/**
 * Draws the app icon (a white speech bubble with three dots on green) as PNG files, with no
 * image library: pixels are computed, supersampled for smooth edges, and encoded with node:zlib.
 * The bubble stays inside the central 80% circle, so the same image works as a maskable icon.
 *
 * Usage: pnpm icons
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

type Rgb = [number, number, number];

const GREEN: Rgb = [22, 163, 74];
const WHITE: Rgb = [255, 255, 255];
const SAMPLES = 4;

/** Colour of a point in the unit square, before antialiasing. */
function colourAt(x: number, y: number): Rgb {
  const inBubble = ((x - 0.5) / 0.31) ** 2 + ((y - 0.46) / 0.24) ** 2 <= 1;
  const inTail = y >= 0.6 && y <= 0.76 && x >= 0.3 && x <= 0.42 && x - 0.3 <= (0.76 - y) * 0.75;
  if (!inBubble && !inTail) {
    return GREEN;
  }
  const inDot = [0.38, 0.5, 0.62].some((dotX) => (x - dotX) ** 2 + (y - 0.46) ** 2 <= 0.045 ** 2);
  return inDot ? GREEN : WHITE;
}

function renderPixels(size: number): Buffer {
  // Each row starts with a filter byte (0 = none), then RGB triples.
  const rows = Buffer.alloc(size * (size * 3 + 1));
  for (let row = 0; row < size; row += 1) {
    rows[row * (size * 3 + 1)] = 0;
    for (let column = 0; column < size; column += 1) {
      const sum = [0, 0, 0];
      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const colour = colourAt((column + (sx + 0.5) / SAMPLES) / size, (row + (sy + 0.5) / SAMPLES) / size);
          colour.forEach((channel, index) => {
            sum[index]! += channel;
          });
        }
      }
      const offset = row * (size * 3 + 1) + 1 + column * 3;
      sum.forEach((channel, index) => {
        rows[offset + index] = Math.round(channel / SAMPLES ** 2);
      });
    }
  }
  return rows;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(size: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bits per channel
  header[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(renderPixels(size))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconsDir = join(import.meta.dirname, '../public/icons');
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
] as const) {
  writeFileSync(join(iconsDir, name), png(size));
  console.log(`Wrote ${name}`);
}
