	import changeImageSize from '../changeImageSize/changeImageSize';
	import renderImageData from './renderImageData';
	import setDialogData from '../changeImageSize/dialog/setDialogData';
	import saveImage from "../saveImage";
	import getImageMargins from './getImageMargins';


	let con = document.getElementsByClassName("con")[0];
	let conWidth = con.offsetWidth;
	let conHeight = con.offsetHeight;
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext('2d');

	let scaleRange = document.getElementById("scale_range");
	let scaleNum = document.getElementById("scale_num");

	let saveImageButton = document.getElementById("save_button");

	// export default function drawScaledImage(image, widthScale, heightScale) {
	// 	let firstLoad = false;

	// 	if (!widthScale) {
	// 		let scale = Math.min((conWidth - 100) / image.width, (conHeight - 100) / image.height);
	// 		widthScale = scale;
	// 		heightScale = scale;
	// 		firstLoad = true;
	// 	}
		
	// 	let margins = getImageMargins(conWidth, conHeight, image.width * widthScale, image.height * heightScale, firstLoad);

	// 	canvas.style.marginLeft = margins.left + 'px';
	// 	canvas.style.marginTop = margins.top + 'px';
	// 	canvas.style.position = 'static';

	// 	canvas.width = image.width * widthScale;
	// 	canvas.height = image.height * heightScale;

	// 	scaleRange.value = (widthScale * 100).toFixed(2);
	// 	scaleNum.value = (widthScale * 100).toFixed(2);

	// 	let scaledImage = changeImageSize(image, widthScale, heightScale);

	// 	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// 	ctx.putImageData(scaledImage, 0, 0);
			
	// 	saveImageButton.onclick = () => { saveImage(scaledImage) } ;

	// 	renderImageData(image, canvas, ctx);
	// 	setDialogData(image);
	// }
	export default function drawScaledImage(image, widthScale, heightScale) {
		// Берём актуальные размеры контейнера на каждый вызов
		const cw = con.offsetWidth;
		const ch = con.offsetHeight;

		// Исходные размеры изображения
		const iw = image.naturalWidth  || image.width;
		const ih = image.naturalHeight || image.height;

		// Клэмп для диапазона 12%..300%
		const clampScale = v => Math.max(0.12, Math.min(3.0, v));

		// Определяем, ручной ли это масштаб (переданы аргументы)
		const isManualScale = (typeof widthScale === 'number') && (typeof heightScale === 'number');

		let firstLoad = false;

		// Авто-вписывание (если масштаб не передан): поля 50px → (cw-100, ch-100)
		if (!isManualScale) {
			const scale = Math.min((cw - 100) / iw, (ch - 100) / ih); // 50px + 50px
			widthScale  = clampScale(scale || 1);
			heightScale = clampScale(scale || 1);
			firstLoad = true;
		} else {
			// Ручной масштаб — просто нормализуем в границы
			widthScale  = clampScale(widthScale);
			heightScale = clampScale(heightScale);
		}

		// Целевые размеры канвы под текущее масштабирование
		const targetW = Math.round(iw * widthScale);
		const targetH = Math.round(ih * heightScale);

		// --- ЦЕНТРИРОВАНИЕ ---
		// Если ручной масштаб → принудительно центрируем по контейнеру
		let margins;
		if (isManualScale) {
			const left = Math.floor((cw - targetW) / 2);
			const top  = Math.floor((ch - targetH) / 2);
			margins = { left, top };
		} else {
			margins = getImageMargins(cw, ch, targetW, targetH, firstLoad);
		}

		canvas.style.marginLeft = margins.left + 'px';
		canvas.style.marginTop  = margins.top  + 'px';
		canvas.style.position   = 'static';

		// Размер канвы = размеру результирующего изображения
		canvas.width  = targetW;
		canvas.height = targetH;

		// Синхронизация контролов масштаба
		const percent = widthScale * 100;
		scaleRange.value = percent.toFixed(2);
		scaleNum.value   = percent.toFixed(2);

		// Ресемплинг функции и единичная отрисовка
		const scaledImage = changeImageSize(image, widthScale, heightScale);

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.putImageData(scaledImage, 0, 0);
		canvas.__oz_meta__ = image?.__oz_meta__ || null;
		saveImageButton.onclick = () => { saveImage(scaledImage); };

		renderImageData(image, canvas, ctx);
		setDialogData(image);
		}