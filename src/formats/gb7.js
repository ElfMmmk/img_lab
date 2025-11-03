// Поддержка формата GrayBit-7 (GB7)

export async function loadGb7FromFile(file) {
  const buf = await file.arrayBuffer();
  return parseGb7(buf);
}

export async function loadGb7FromBlob(blob) {
  const buf = await blob.arrayBuffer();
  return parseGb7(buf);
}

export async function loadGb7FromUrl(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`GB7: fetch failed ${resp.status}`);
  const buf = await resp.arrayBuffer();
  return parseGb7(buf);
}

export function isGb7Buffer(buf) {
  if (!buf || buf.byteLength < 12) return false;
  const dv = new DataView(buf);
  return (
    dv.getUint8(0) === 0x47 &&
    dv.getUint8(1) === 0x42 &&
    dv.getUint8(2) === 0x37 &&
    dv.getUint8(3) === 0x1D
  );
}

function parseGb7(buf) {
  const dv = new DataView(buf);
  // 1) Сигнатура
  if (!isGb7Buffer(buf)) throw new Error('Invalid GB7 signature');
  // 2) Версия
  const version = dv.getUint8(4);
  if (version !== 0x01) throw new Error(`Unsupported GB7 version: ${version}`);
  // 3) Флаги
  const flags = dv.getUint8(5);
  const hasMask = (flags & 0x01) === 1;
  // 4) Геометрия (big endian)
  const width  = dv.getUint16(6, false);
  const height = dv.getUint16(8, false);
  if (width === 0 || height === 0) throw new Error('GB7: zero width/height');

  // 6) Длина
  const pixelCount = width * height;
  const needBytes = 12 + pixelCount;
  if (buf.byteLength < needBytes) {
    throw new Error(`GB7: buffer too small (got ${buf.byteLength}, need ${needBytes})`);
  }

  // 7) Декодирование в RGBA
  const rgba = new Uint8ClampedArray(pixelCount * 4);
  let si = 12, di = 0;
  for (let i = 0; i < pixelCount; i++, si++) {
    const byte = dv.getUint8(si);
    const gray7 = byte & 0x7F;                          // 7 бит яркости
    const gray8 = Math.round(gray7 * 255 / 127);        // нормализация до 8 бит
    const maskBit = (byte & 0x80) ? 1 : 0;              // MSB — маска (если hasMask)

    rgba[di]   = gray8; // R
    rgba[di+1] = gray8; // G
    rgba[di+2] = gray8; // B
    rgba[di+3] = hasMask ? (maskBit ? 255 : 0) : 255;   // A
    di += 4;
  }

  return {
    width, height, hasMask, depth: 7,
    data: rgba,
  };
}

// Упаковываем в <img>, чтобы не ломать HTMLImageElement
export async function gb7ToImageElement(gb7) {
  const canvas = document.createElement('canvas');
  canvas.width = gb7.width;
  canvas.height = gb7.height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(gb7.data, gb7.width, gb7.height);
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  img.__oz_meta__ = { depth: 7, hasMask: gb7.hasMask };
  return img;
}
