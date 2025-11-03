	import drawScaledImage from "./drawScaledImage";

	const imageSize         = document.getElementById("image_size");
	const imageDepth        = document.getElementById("image_depth");
	const pixelCoordinates  = document.getElementById("pixel_coordinates");
	const pixelColorBlock   = document.getElementById("pixel_color_block");
	const pixelColor        = document.getElementById("pixel_color");

	const scaleLabel   = document.getElementById("scale_label");
	const scaleRange   = document.getElementById("scale_range");
	const scaleNum     = document.getElementById("scale_num");
	const scalePercent = document.getElementById("scale_percent");

	export default function renderImageData(image, canvas, ctx) {
	// Показываем текущие размеры отрисованного изображения
	const w = (canvas && canvas.width)  || (image?.naturalWidth ?? image?.width)  || 0;
	const h = (canvas && canvas.height) || (image?.naturalHeight ?? image?.height) || 0;
	if (imageSize) imageSize.textContent = `Размер: ${w} * ${h}`;

	// Глубина: из GB7-метаданных (если есть) иначе по канве
	const depth =
		(image && image.__oz_meta__ && image.__oz_meta__.depth) ??
		__detectDepth__(canvas, ctx);
	if (imageDepth) imageDepth.textContent = `Глубина: ${depth} бит`;

	// Клик по канве: один слушатель (без дубликатов при повторных вызовах)
	if (!canvas.__oz_pixelListenerAdded) {
		canvas.addEventListener("mousedown", (e) => {
		const [r, g, b] = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
		if (pixelCoordinates) pixelCoordinates.textContent = `x: ${e.offsetX} y: ${e.offsetY}`;
		if (pixelColor)       pixelColor.textContent = `rgb(${r}, ${g}, ${b})`;
		if (pixelColorBlock) {
			pixelColorBlock.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
			pixelColorBlock.style.display = "inline-block";
		}
		});
		canvas.__oz_pixelListenerAdded = true;
	}

	// Показать контролы масштаба
	if (scaleLabel)   scaleLabel.style.display = "inline-block";
	if (scaleRange)   scaleRange.style.display = "inline-block";
	if (scaleNum)     scaleNum.style.display   = "inline-block";
	if (scalePercent) scalePercent.style.display = "inline-block";

	// Слушатели масштаба без дублирования
	if (scaleRange && !scaleRange.__oz_bound__) {
		scaleRange.addEventListener("change", function () {
		drawScaledImage(image, this.value / 100, this.value / 100);
		});
		scaleRange.__oz_bound__ = true;
	}

	if (scaleNum && !scaleNum.__oz_bound__) {
		scaleNum.addEventListener("change", function () {
		let val = parseInt(this.value, 10);
		if (val < 12) val = 12;
		if (val > 300) val = 300;
		this.value = val;
		drawScaledImage(image, val / 100, val / 100);
		});
		scaleNum.__oz_bound__ = true;
	}
	}

	// Определение глубины по канве (если нет метаданных GB7)
	function __detectDepth__(canvas, ctx) {
	try {
		const w = Math.min((canvas && canvas.width)  || 0, 64);
		const h = Math.min((canvas && canvas.height) || 0, 64);
		if (!w || !h) return 24;
		const data = ctx.getImageData(0, 0, w, h).data;
		for (let i = 3; i < data.length; i += 4) {
		if (data[i] !== 255) return 32; // есть полупрозрачные пиксели
		}
		return 24;
	} catch {
		return 24;
	}
	}
