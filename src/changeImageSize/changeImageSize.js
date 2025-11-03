	import nearestResample from "./nearestNeighborAlg";
	import bilinearResample from "./bilinearAlg";

	export default function changeImageSize(image, scaleX, scaleY, opts = {}) {
		const method = String((opts.method || window.__oz_resizeMethod || "bilinear")).toLowerCase();

		const srcW = image.naturalWidth  || image.width;
		const srcH = image.naturalHeight || image.height;

		const sx = clamp(scaleX, 0.0001, 100);
		const sy = clamp(scaleY, 0.0001, 100);

		const dstW = Math.max(1, Math.round(srcW * sx));
		const dstH = Math.max(1, Math.round(srcH * sy));

		const sCanvas = document.createElement("canvas");
		sCanvas.width = srcW; sCanvas.height = srcH;
		const sCtx = sCanvas.getContext("2d");
		sCtx.drawImage(image, 0, 0);
		const src = sCtx.getImageData(0, 0, srcW, srcH);

		const dst = new ImageData(dstW, dstH);

		if (method === "nearest") {
			nearestResample(src, dst);
		} else {
			bilinearResample(src, dst); // ← дефолт
		}

		return dst;
		}

		function clamp(v, min, max) {
		v = Number(v);
		if (!Number.isFinite(v)) return min;
		return Math.min(max, Math.max(min, v));
		}
