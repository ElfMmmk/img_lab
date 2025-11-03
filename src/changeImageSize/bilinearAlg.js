    export default function bilinearResample(src, dst) {
        const sw = src.width,  sh = src.height;
        const dw = dst.width,  dh = dst.height;

        const S = src.data;
        const D = dst.data;

        // Маппинг по всей области (включая края), чтобы не терять последний столбец/строку
        const sxRatio = (sw - 1) / Math.max(1, dw - 1);
        const syRatio = (sh - 1) / Math.max(1, dh - 1);

        for (let y = 0; y < dh; y++) {
            const fy = y * syRatio;
            const y0 = Math.floor(fy);
            const y1 = Math.min(y0 + 1, sh - 1);
            const wy = fy - y0; // 0..1

            for (let x = 0; x < dw; x++) {
            const fx = x * sxRatio;
            const x0 = Math.floor(fx);
            const x1 = Math.min(x0 + 1, sw - 1);
            const wx = fx - x0; // 0..1

            const i00 = (y0 * sw + x0) * 4;
            const i10 = (y0 * sw + x1) * 4;
            const i01 = (y1 * sw + x0) * 4;
            const i11 = (y1 * sw + x1) * 4;
            const di  = (y * dw + x) * 4;

            // Смешиваем четыре соседних пикселя по каждому каналу
            for (let c = 0; c < 4; c++) {
                const v =
                S[i00 + c] * (1 - wx) * (1 - wy) +
                S[i10 + c] * (      wx) * (1 - wy) +
                S[i01 + c] * (1 - wx) * (      wy) +
                S[i11 + c] * (      wx) * (      wy);
                D[di + c] = v;
            }
            }
        }
        }
