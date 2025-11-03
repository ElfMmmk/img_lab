// Универсальное сохранение: JPG/PNG/GB7
export default async function saveImage(imageData, format = "jpg", opts = {}) {
const nameBase = opts.nameBase || "moskvitin_image";
let blob;
if (format === "gb7") {
    // собственный энкодер GB7 (см. ниже)
    const useMask = opts.gb7MaskFromAlpha !== false; // по умолчанию: брать маску из альфы
    blob = encodeGB7(imageData, useMask);
} else {
    // холст для стандартных форматов
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
    const mime =
    format === "png" ? "image/png" :
    format === "jpg" ? "image/jpeg" :
    "image/png";
    const quality = typeof opts.quality === "number" ? opts.quality : 0.92;
    blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, mime, mime === "image/jpeg" ? quality : undefined)
    );
}
const suggestedName =
    format === "jpg" ? `${nameBase}.jpg` :
    format === "png" ? `${nameBase}.png` :
    `${nameBase}.gb7`;
const types =
    format === "jpg"
    ? [{ description: "JPEG", accept: { "image/jpeg": [".jpg", ".jpeg"] } }]
    : format === "png"
    ? [{ description: "PNG", accept: { "image/png": [".png"] } }]
    : [
        {
            description: "GB7",
            accept: {
            "application/octet-stream": [".gb7"],
            "image/gb7": [".gb7"],
            },
        },
        ];
await saveBlob(blob, suggestedName, types);
}
// ===== helpers =====
async function saveBlob(blob, suggestedName, types) {
const supportsFileSystemAccess =
    "showSaveFilePicker" in window &&
    (() => {
    try {
        return window.self === window.top;
    } catch {
        return false;
    }
    })();
if (supportsFileSystemAccess) {
    try {
    const handle = await showSaveFilePicker({
        suggestedName,
        types,
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
    } catch (err) {
    if (err?.name === "AbortError") return;
    console.error(err);
    }
}
// fallback: <a download>
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = suggestedName;
document.body.appendChild(a);
a.click();
setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
}, 1000);
}
// Энкодер GB7 (симметричен парсеру)
// Формат (big-endian):
// 0..3:  'G','B','7',0x1D
// 4:     version = 0x01
// 5:     flags bit0 = hasMask
// 6..7:  width  (uint16 BE)
// 8..9:  height (uint16 BE)
// 10..11: reserved (0)
// 12.. : pixelCount байт: bit7 = mask, bit0..6 = gray7 (0..127)
function encodeGB7(imageData, maskFromAlpha = true) {
const { width, height, data } = imageData;
const pixelCount = width * height;
const buf = new ArrayBuffer(12 + pixelCount);
const dv = new DataView(buf);
// сигнатура + версия + флаги
dv.setUint8(0, 0x47); // 'G'
dv.setUint8(1, 0x42); // 'B'
dv.setUint8(2, 0x37); // '7'
dv.setUint8(3, 0x1d);
dv.setUint8(4, 0x01); // version
dv.setUint8(5, maskFromAlpha ? 0x01 : 0x00); // flags
// геометрия (BE)
dv.setUint16(6, width, false);
dv.setUint16(8, height, false);
dv.setUint16(10, 0, false); // reserved
// пиксели
let si = 0;
for (let i = 0; i < pixelCount; i++, si += 4) {
    const r = data[si];
    const g = data[si + 1];
    const b = data[si + 2];
    const a = data[si + 3];
    // luma sRGB
    const gray8 = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    // квантуем в 7 бит (симметрично декодеру: gray8 ≈ round(gray7 * 255 / 127))
    let gray7 = Math.round((gray8 * 127) / 255);
    if (gray7 < 0) gray7 = 0;
    if (gray7 > 127) gray7 = 127;
    const maskBit = maskFromAlpha && a >= 128 ? 0x80 : 0x00;
    dv.setUint8(12 + i, maskBit | gray7);
}
return new Blob([buf], { type: "application/octet-stream" });
}
