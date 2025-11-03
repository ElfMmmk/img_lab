    // Основано на спецификации Oklab (Björn Ottosson).

    // ====== Конвертация ======
    function srgb8ToLinear(c8) {
        const cs = c8 / 255;
        return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
    }

    function linearRgbToLms(r, g, b) {
        // r,g,b — линейные [0..1]
        const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
        const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
        const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
        return [l, m, s];
    }

    function oklabFromLinearRgb(r, g, b) {
        const [l, m, s] = linearRgbToLms(r, g, b);
        const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
        const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
        const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
        const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
        return { L, a, b: b2 };
    }

    function oklchFromOklab(L, a, b) {
        const C = Math.hypot(a, b);
        let h = Math.atan2(b, a) * (180 / Math.PI);
        if (h < 0) h += 360;
        return { L, C, h };
    }

    // экспорт: sRGB 8бит -> OKLch
    export function srgbToOklch(r8, g8, b8) {
        const r = srgb8ToLinear(r8);
        const g = srgb8ToLinear(g8);
        const b = srgb8ToLinear(b8);
        const { L, a, b: bb } = oklabFromLinearRgb(r, g, b);
        return oklchFromOklab(L, a, bb);
    }

    // UI
    const fmt = (n, d = 4) => (Number.isFinite(n) ? Number(n).toFixed(d) : "—");

    function ensureOKLchRow(colorBlock) {
        let el = colorBlock.querySelector(".color_oklch");
        if (!el) {
            el = document.createElement("p");
            el.className = "color_oklch";
            el.setAttribute(
            "title",
            "OKLch (D65): L — перцептивная светлота [0..1], C — хрома (в пределах sRGB обычно ≤0.4), h — оттенок [0..360°]"
            );
        // добавим сразу после Lab
        const lab = colorBlock.querySelector(".color_lab");
        if (lab && lab.parentElement === colorBlock) {
            lab.insertAdjacentElement("afterend", el);
        } else {
            colorBlock.appendChild(el);
        }
        }
        return el;
    }

    /**
     * Обновляет строку OKLch в блоке одного цвета (".color")
     * @param {HTMLElement} colorBlock — контейнер одного цвета
     * @param {{r:number,g:number,b:number}} rgb — 8-битный sRGB
     * @returns {{L:number,C:number,h:number}} вычисленные значения
     */
    export default function updateOKLch(colorBlock, rgb) {
    if (!colorBlock || !rgb) return { L: NaN, C: NaN, h: NaN };

    const { L, C, h } = srgbToOklch(rgb.r, rgb.g, rgb.b);
    const row = ensureOKLchRow(colorBlock);
    // Если хрома практически нулевая (почти серый) или hue нечисловой — скрываем и C, и h
    const showHue = Number.isFinite(h) && C > 1e-6;
    const cTxt = showHue ? fmt(C, 4) : '—';
    const hTxt = showHue ? `${h.toFixed(1)}°` : '—';
    row.innerHTML = `OKLch:<br>L=${fmt(L, 4)}<br>C=${cTxt}<br>h=${hTxt}`;
    return { L, C, h };
    }
