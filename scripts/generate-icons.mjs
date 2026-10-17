// One-off script: generates simple placeholder PWA icons (no design tool / no
// network image asset available for this milestone). Produces solid-color PNGs
// with a simple lime "wallet pill" mark on an obsidian background, matching the
// Finly palette. Run with: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const DARK = [0x1c, 0x1e, 0x21];
const LIME = [0xd8, 0xfa, 0x36];

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inRoundedSquare(x, y, cx, cy, half, radius) {
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  if (dx > half || dy > half) return false;
  const cornerX = half - radius;
  const cornerY = half - radius;
  if (dx <= cornerX || dy <= cornerY) return true;
  return inCircle(dx, dy, cornerX, cornerY, radius);
}

function generate(size, { maskable = false } = {}) {
  const width = size;
  const height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  // maskable icons need extra safe-zone padding (~20%) so nothing gets cropped
  const pad = maskable ? width * 0.22 : width * 0.14;
  const half = width / 2 - pad;
  const radius = half * 0.42;

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      let [r, g, b] = DARK;

      // lime rounded "card" mark
      if (inRoundedSquare(x, y, cx, cy, half, radius)) {
        [r, g, b] = LIME;
      }
      // dark inner pill notch (evokes a wallet/expense card slot)
      const notchHalfW = half * 0.62;
      const notchHalfH = half * 0.16;
      const notchY = cy - half * 0.18;
      if (
        inRoundedSquare(x, y, cx, notchY, Math.max(notchHalfW, notchHalfH), Math.min(notchHalfW, notchHalfH)) &&
        Math.abs(x - cx) <= notchHalfW &&
        Math.abs(y - notchY) <= notchHalfH
      ) {
        [r, g, b] = DARK;
      }
      // small lime dot accent bottom-right of the notch area
      if (inCircle(x, y, cx + half * 0.42, cy + half * 0.32, half * 0.14)) {
        [r, g, b] = LIME;
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw, { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', generate(192));
writeFileSync('public/icons/icon-512.png', generate(512));
writeFileSync('public/icons/maskable-512.png', generate(512, { maskable: true }));
writeFileSync('public/icons/apple-touch-icon.png', generate(180));
console.log('Generated placeholder icons in public/icons/');
