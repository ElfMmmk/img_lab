	export default function nearestResample(src, dst) {
		const sw = src.width,  sh = src.height;
		const dw = dst.width,  dh = dst.height;
		const S = src.data,    D = dst.data;

		const rx = sw / dw;
		const ry = sh / dh;

		for (let y = 0; y < dh; y++) {
			const sy = Math.min(sh - 1, Math.floor(y * ry));
			const syOff = sy * sw;
			for (let x = 0; x < dw; x++) {
			const sx = Math.min(sw - 1, Math.floor(x * rx));
			const si = (syOff + sx) * 4;
			const di = (y * dw + x) * 4;

			D[di]     = S[si];
			D[di + 1] = S[si + 1];
			D[di + 2] = S[si + 2];
			D[di + 3] = S[si + 3];
			}
		}
		}