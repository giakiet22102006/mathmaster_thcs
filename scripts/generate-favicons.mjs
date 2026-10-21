// ==============================================================================
// MathMaster THCS - Trình Tạo Bộ Favicon & PWA Icons Đồng Nhất (#4f46e5)
// Tự động sinh:
//   - src/app/favicon.ico (đa kích thước 16x16, 32x32, 48x48 chuẩn ICO)
//   - src/app/apple-icon.png (180x180 nền đặc không trong suốt cho iOS/macOS)
//   - public/icon-192.png (192x192 cho Android/PWA)
//   - public/icon-512.png (512x512 cho Android/PWA)
//   - public/icon-maskable-512.png (512x512 vùng an toàn maskable 80%)
// Sử dụng Signed Distance Field (SDF) + 4x4 Supersampling + bộ mã hoá PNG/ICO thuần Node.js
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT_DIR = process.cwd();

// Bảng tra CRC32 chuẩn PNG (IEEE 802.3)
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const crcInput = Buffer.concat([typeBuf, dataBuf]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

/**
 * Mã hoá bộ đệm RGBA (width * height * 4) sang định dạng PNG chuẩn
 */
function encodePngRGBA(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: 6 (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const rawScanlines = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    rawScanlines[rowStart] = 0; // Filter type 0 (None)
    rgbaBuffer.copy(rawScanlines, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  return Buffer.concat([
    signature,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', compressed),
    makePngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Đóng gói nhiều ảnh PNG (16, 32, 48) thành file .ico đa kích thước chuẩn
 */
function encodeMultiSizeIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved = 0
  header.writeUInt16LE(1, 2); // Type = 1 (ICO)
  header.writeUInt16LE(count, 4); // Image count

  const dirEntries = [];
  const payloads = [];
  let offset = 6 + count * 16;

  for (const frame of frames) {
    const entry = Buffer.alloc(16);
    entry[0] = frame.size >= 256 ? 0 : frame.size; // Width
    entry[1] = frame.size >= 256 ? 0 : frame.size; // Height
    entry[2] = 0; // Color palette
    entry[3] = 0; // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel (32-bit RGBA)
    entry.writeUInt32LE(frame.png.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset of image data

    dirEntries.push(entry);
    payloads.push(frame.png);
    offset += frame.png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...payloads]);
}

// Hàm khoảng cách có dấu (SDF) cho hình chữ nhật bo góc tâm (cx, cy), bán kính rộng (hx, hy), bo góc r
function sdRoundedBox(px, py, cx, cy, hx, hy, r) {
  const qx = Math.abs(px - cx) - (hx - r);
  const qy = Math.abs(py - cy) - (hy - r);
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist - r;
}

// SDF cho đoạn thẳng có độ dày bo tròn (capsule) từ (ax, ay) tới (bx, by) với bán kính r
function sdCapsule(px, py, ax, ay, bx, by, r) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

// Khoảng cách SDF tới chữ Pi (π) trong hệ toạ độ chuẩn hoá 64x64
function sdPiGlyph(ux, uy) {
  // 1. Thanh ngang trên của chữ Pi: từ (15.5, 22.5) đến (46.5, 22.5), bán kính nét 4.1
  const dTopBar = sdCapsule(ux, uy, 15.5, 22.5, 46.5, 22.5, 4.1);

  // 2. Chân trái của chữ Pi: từ (22, 22.5) xuống (22, 47.5) kèm chân móc nhẹ sang trái (19.5, 51)
  const dLeftLeg = Math.min(
    sdCapsule(ux, uy, 22.0, 22.5, 22.0, 47.5, 4.0),
    sdCapsule(ux, uy, 22.0, 47.5, 19.5, 51.0, 3.9)
  );

  // 3. Chân phải của chữ Pi: từ (39, 22.5) xuống (39, 47.5) kèm chân móc toán học sang phải (46.5, 51)
  const dRightLeg = Math.min(
    sdCapsule(ux, uy, 39.0, 22.5, 39.0, 47.5, 4.0),
    sdCapsule(ux, uy, 39.0, 47.5, 46.5, 51.0, 3.9)
  );

  return Math.min(dTopBar, dLeftLeg, dRightLeg);
}

/**
 * Vẽ icon MathMaster THCS ở kích thước bất kỳ với 4x4 MSAA Supersampling
 * @param {number} size Kích thước ảnh đích (px)
 * @param {object} options { solidBackground: boolean, maskable: boolean }
 */
function renderMathMasterIcon(size, options = {}) {
  const { solidBackground = false, maskable = false } = options;
  const rgba = Buffer.alloc(size * size * 4);
  const subSamples = 4; // 4x4 = 16 mẫu mỗi điểm ảnh

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let rAcc = 0;
      let gAcc = 0;
      let bAcc = 0;
      let aAcc = 0;

      for (let sy = 0; sy < subSamples; sy++) {
        for (let sx = 0; sx < subSamples; sx++) {
          const fx = (x + (sx + 0.5) / subSamples) / size;
          const fy = (y + (sy + 0.5) / subSamples) / size;

          // Quy đổi về hệ toạ độ thiết kế 64x64
          const ux = fx * 64;
          const uy = fy * 64;

          // Kiểm tra biên nền bo góc (nếu không phải nền đặc toàn khung)
          let bgAlpha = 1.0;
          if (!solidBackground && !maskable) {
            const dBg = sdRoundedBox(ux, uy, 32, 32, 32, 32, 14);
            bgAlpha = dBg <= -0.5 ? 1.0 : dBg >= 0.5 ? 0.0 : 0.5 - dBg;
          }

          if (bgAlpha <= 0) {
            continue;
          }

          // Màu nền gradient Indigo (#4f46e5 -> #3730a3)
          const tGrad = Math.max(0, Math.min(1, (fx + fy) * 0.5));
          let r = Math.round(79 * (1 - tGrad) + 55 * tGrad);
          let g = Math.round(70 * (1 - tGrad) + 48 * tGrad);
          let b = Math.round(229 * (1 - tGrad) + 163 * tGrad);

          // Nếu là biến thể maskable, thu phóng biểu tượng vào vùng an toàn 78% ở tâm
          let gx = ux;
          let gy = uy;
          if (maskable) {
            gx = (ux - 32) / 0.78 + 32;
            gy = (uy - 32) / 0.78 + 32;
          }

          // Điểm nhấn toán học màu vàng hổ phách (#fbbf24) tại (52, 12.5), bán kính 3.8
          const dSpark = Math.hypot(gx - 52, gy - 12.5) - 3.8;
          if (dSpark < 0.6) {
            const wSpark = dSpark <= -0.6 ? 1.0 : (0.6 - dSpark) / 1.2;
            r = Math.round(r * (1 - wSpark) + 251 * wSpark);
            g = Math.round(g * (1 - wSpark) + 191 * wSpark);
            b = Math.round(b * (1 - wSpark) + 36 * wSpark);
          }

          // Chữ Pi (π) trắng tinh khiết (#ffffff)
          const dPi = sdPiGlyph(gx, gy);
          if (dPi < 0.6) {
            const wPi = dPi <= -0.6 ? 1.0 : (0.6 - dPi) / 1.2;
            r = Math.round(r * (1 - wPi) + 255 * wPi);
            g = Math.round(g * (1 - wPi) + 255 * wPi);
            b = Math.round(b * (1 - wPi) + 255 * wPi);
          }

          rAcc += r * bgAlpha;
          gAcc += g * bgAlpha;
          bAcc += b * bgAlpha;
          aAcc += bgAlpha;
        }
      }

      const totalSamples = subSamples * subSamples;
      const outIdx = (y * size + x) * 4;
      if (solidBackground || maskable) {
        rgba[outIdx] = Math.round(rAcc / totalSamples);
        rgba[outIdx + 1] = Math.round(gAcc / totalSamples);
        rgba[outIdx + 2] = Math.round(bAcc / totalSamples);
        rgba[outIdx + 3] = 255; // Nền đặc 100% không trong suốt
      } else if (aAcc > 0) {
        rgba[outIdx] = Math.round(rAcc / aAcc);
        rgba[outIdx + 1] = Math.round(gAcc / aAcc);
        rgba[outIdx + 2] = Math.round(bAcc / aAcc);
        rgba[outIdx + 3] = Math.round((aAcc / totalSamples) * 255);
      }
    }
  }

  return encodePngRGBA(size, size, rgba);
}

function main() {
  // 1. Tạo favicon.ico đa kích thước (16x16, 32x32, 48x48)
  const icoFrames = [16, 32, 48].map((sz) => ({
    size: sz,
    png: renderMathMasterIcon(sz, { solidBackground: false, maskable: false }),
  }));
  const icoBuf = encodeMultiSizeIco(icoFrames);
  const icoPath = path.join(ROOT_DIR, 'src', 'app', 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuf);

  // 2. Tạo apple-icon.png (180x180, nền đặc không trong suốt)
  const applePng = renderMathMasterIcon(180, { solidBackground: true, maskable: false });
  const applePath = path.join(ROOT_DIR, 'src', 'app', 'apple-icon.png');
  fs.writeFileSync(applePath, applePng);

  // 3. Tạo bộ icon PWA trong public/ (192x192, 512x512, và maskable 512x512)
  const icon192 = renderMathMasterIcon(192, { solidBackground: false, maskable: false });
  const icon512 = renderMathMasterIcon(512, { solidBackground: false, maskable: false });
  const iconMaskable512 = renderMathMasterIcon(512, { solidBackground: true, maskable: true });

  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'icon-192.png'), icon192);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'icon-512.png'), icon512);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'icon-maskable-512.png'), iconMaskable512);

  console.log('Đã sinh thành công bộ Favicon & PWA Icons cho MathMaster THCS:');
  console.log(` - src/app/favicon.ico (${icoBuf.length} bytes, đa kích thước 16/32/48)`);
  console.log(` - src/app/apple-icon.png (${applePng.length} bytes, 180x180 nền đặc)`);
  console.log(` - public/icon-192.png (${icon192.length} bytes, 192x192)`);
  console.log(` - public/icon-512.png (${icon512.length} bytes, 512x512)`);
  console.log(` - public/icon-maskable-512.png (${iconMaskable512.length} bytes, 512x512 maskable)`);
}

main();
