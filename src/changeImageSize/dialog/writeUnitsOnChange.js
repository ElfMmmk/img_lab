	import setMpAfterChange from "./setMpAfterChange";
	import changeRatioSideInput from "./changeRatioSideInput";

	let units = document.getElementsByClassName("dialog_units");

	// baseW/baseH — «текущие» размеры (canvas) для расчёта "После изменений: Мп"
	// Исходные (оригинальные) размеры берём из window.__oz_origW / __oz_origH
	export default function writeUnitsOnChange(radio, baseW, baseH) {
		const inputWidth  = document.getElementById("input_width");
		const inputHeight = document.getElementById("input_height");
		const ratioCheck  = document.getElementsByClassName("ratio_check__input")[0];

		radio.onchange = function () {
			// подписи единиц
			if (units[0]) units[0].innerText = this.value;
			if (units[1]) units[1].innerText = this.value;

			// исходные размеры (для конвертации процентов)
			const origW = Math.max(1, Number(window.__oz_origW) || baseW || 1);
			const origH = Math.max(1, Number(window.__oz_origH) || baseH || 1);

			if (this.value === "%") {
			// текущие значения сейчас в пикселях → переведём в проценты от ИСХОДНИКА
			const curWpx = Math.max(1, Math.round(Number(inputWidth?.value)  || baseW || origW));
			const curHpx = Math.max(1, Math.round(Number(inputHeight?.value) || baseH || origH));

			const pW = Math.round((curWpx / origW) * 100);
			const pH = Math.round((curHpx / origH) * 100);

			if (inputWidth)  inputWidth.value  = pW;
			if (inputHeight) inputHeight.value = pH;

			// при "сохранить пропорции" — проценты равны
			if (ratioCheck && ratioCheck.checked && inputWidth && inputHeight) {
				inputHeight.value = inputWidth.value;
			}
			} else {
			// this.value === 'px' → проценты → пиксели от ИСХОДНИКА
			const curWp = Math.max(1, Math.round(Number(inputWidth?.value)  || 100));
			const curHp = Math.max(1, Math.round(Number(inputHeight?.value) || 100));

			const pxW = Math.max(1, Math.round((origW * curWp) / 100));
			const pxH = Math.max(1, Math.round((origH * curHp) / 100));

			if (inputWidth)  inputWidth.value  = pxW;
			if (inputHeight) inputHeight.value = pxH;

			// при "сохранить пропорции" — подгоняем H под W по исходному соотношению
			if (ratioCheck && ratioCheck.checked && inputWidth && inputHeight) {
				changeRatioSideInput(inputWidth, inputHeight, origH / origW);
			}
			}

			// "После изменений: Мп" считаем от ТЕКУЩЕЙ базы (canvas)
			setMpAfterChange(baseW, baseH);
		};
		}
