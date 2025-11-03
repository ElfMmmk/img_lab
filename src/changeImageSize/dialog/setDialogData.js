    import drawScaledImage from "../../drawScaledImage/drawScaledImage";
    import checkScale from "./checkScale";
    import setMpAfterChange from "./setMpAfterChange";
    import writeUnitsOnChange from "./writeUnitsOnChange";
    import changeRatioSideInput from "./changeRatioSideInput";

    const dialogButton       = document.getElementById("dialog_button");
    const closeDialogButton  = document.getElementById("close_dialog_button");
    const submitDialogButton = document.getElementById("submit_dialog_button");

    const unitsEls       = document.getElementsByClassName("dialog_units");
    const mpBeforeChange = document.getElementById("dialog_before_px");
    const mpAfterChange  = document.getElementById("dialog_after_px");

    const radioPercent = document.getElementById("radio_percent");
    const radioPx      = document.getElementById("radio_px");

    const inputWidth  = document.getElementById("input_width");
    const inputHeight = document.getElementById("input_height");

    const ratioCheck = document.getElementsByClassName("ratio_check__input")[0];
    const algoSelect = document.getElementById("select_algorithm");


    function isPxMode() {
        return (unitsEls && unitsEls[0] && unitsEls[0].innerText === "px");
    }

    export default function setDialogData(image) {
        if (!dialogButton) return;
    // База: реальные пиксели исходника (независимо от масштаба канвы)
        const baseW = Number(window.__oz_origW) || image.naturalWidth  || image.width  || 0;
        const baseH = Number(window.__oz_origH) || image.naturalHeight || image.height || 0;
    // ===== ОТКРЫТИЕ ДИАЛОГА =====
        if (!dialogButton.__oz_bound__) {
        dialogButton.addEventListener("click", () => {
            // «оригинал» для расчётов: та же база, что и в статус-баре
            const origW = baseW;
            const origH = baseH;
            window.__oz_origW = origW;
            window.__oz_origH = origH;
        // Стартовый режим — пиксели
            radioPx.checked = true;
            if (unitsEls[0]) unitsEls[0].innerText = radioPx.value; // "px"
            if (unitsEls[1]) unitsEls[1].innerText = radioPx.value;

            // Подставляем текущие размеры в поля
            inputWidth.value  = baseW;
            inputHeight.value = baseH;

            // «До изменений: … MP» — тоже от исходных габаритов
            if (mpBeforeChange) mpBeforeChange.innerText = "До изменений: " + (baseW * baseH / 1e6).toFixed(2) + " MP";
            if (mpAfterChange)  mpAfterChange.innerText  = "После изменений: " + (baseW * baseH / 1e6).toFixed(2) + " MP";

            // По умолчанию — сохранять пропорции
            if (ratioCheck) ratioCheck.checked = true;

            // Корректная смена единиц (px ↔ %) с учётом чекбокса
            writeUnitsOnChange(radioPercent, baseW, baseH);
            writeUnitsOnChange(radioPx, baseW, baseH);

            // Алгоритм по умолчанию — Bilinear
            if (algoSelect) {
                if (!algoSelect.value || algoSelect.value === "neighbor") {
                algoSelect.value = "bilinear";
                }
                window.__oz_resizeMethod = algoSelect.value;
                if (!algoSelect.__oz_bound__) {
                algoSelect.addEventListener("change", () => {
                    window.__oz_resizeMethod = algoSelect.value;
                });
                algoSelect.__oz_bound__ = true;
                }
            } else {
                window.__oz_resizeMethod = "bilinear";
            }

            // Открыть диалог
            window.dialog && window.dialog.showModal();

            // Чекбокс «Сохранить пропорции»
            if (ratioCheck && !ratioCheck.__oz_bound__) {
                ratioCheck.addEventListener("change", () => {
                if (ratioCheck.checked) {
                    if (isPxMode()) {
                    // приводим H к текущей W по исходному соотношению исходника
                    changeRatioSideInput(inputWidth, inputHeight, (origH / origW));
                    } else {
                    // проценты — одинаковые % по обеим сторонам
                    inputHeight.value = inputWidth.value;
                    }
                    setMpAfterChange(baseW, baseH); // «После изменений» считаем от текущей базы
                }
                });
                ratioCheck.__oz_bound__ = true;
            }

            // Ввод ширины
            if (inputWidth && !inputWidth.__oz_bound__) {
                inputWidth.addEventListener("input", () => {
                if (ratioCheck && ratioCheck.checked) {
                    changeRatioSideInput(inputWidth, inputHeight, (origH / origW));
                }
                setMpAfterChange(baseW, baseH); // базу берём из natural
                checkScale(inputWidth,  origW); // масштаб считаем от ОРИГИНАЛА // масштаб считаем от ОРИГИНАЛА
                });
                inputWidth.__oz_bound__ = true;
            }

            // Ввод высоты
            if (inputHeight && !inputHeight.__oz_bound__) {
                inputHeight.addEventListener("input", () => {
                if (ratioCheck && ratioCheck.checked) {
                    changeRatioSideInput(inputHeight, inputWidth, (origW / origH));
                }
                setMpAfterChange(baseW, baseH);
                checkScale(inputHeight, origH);
                });
                inputHeight.__oz_bound__ = true;
            }

            // Применить
            if (submitDialogButton && !submitDialogButton.__oz_bound__) {
                submitDialogButton.addEventListener("click", () => {
                const widthScale  = checkScale(inputWidth,  origW);
                const heightScale = checkScale(inputHeight, origH);
                if (widthScale && heightScale) {
                    const isPx = isPxMode(); // см. твою реализацию: читает .dialog_units
                    // 1) считаем новые пиксели
                    let newW, newH;
                    if (isPx) {
                        newW = Math.max(1, Number(inputWidth?.value)  || 0);
                        newH = Math.max(1, Number(inputHeight?.value) || 0);
                    } else {
                        const wPct = Math.max(0, Number(inputWidth?.value)  || 0);
                        const hPct = Math.max(0, Number(inputHeight?.value) || 0);
                        newW = Math.max(1, Math.round(origW * wPct / 100));
                        newH = Math.max(1, Math.round(origH * hPct / 100));
                    }
                    // 2) коэффициенты масштабирования от базы
                    const widthScale  = newW / origW;
                    const heightScale = newH / origH;
                    if (widthScale > 0 && heightScale > 0 && Number.isFinite(widthScale) && Number.isFinite(heightScale)) {
                        // 3) применяем ресайз
                        drawScaledImage(image, widthScale, heightScale);
                        // 4) обновляем базу → статус-бар и следующий диалог увидят новые размеры
                        window.__oz_origW = newW;
                        window.__oz_origH = newH;
                        // 5) закрываем диалог надёжно по id (в некоторых версиях window.dialog не задан)
                        const dlg = document.getElementById('dialog_change_image_size');
                        if (dlg && typeof dlg.close === 'function') dlg.close();
                    }
                }});
                submitDialogButton.__oz_bound__ = true;
            }

            // Закрыть
            if (closeDialogButton && !closeDialogButton.__oz_bound__) {
                closeDialogButton.addEventListener("click", () => window.dialog && window.dialog.close());
                closeDialogButton.__oz_bound__ = true;
            }
            });
            dialogButton.__oz_bound__ = true;
            // ── Tooltip теперь задаётся в public/index.html.
            // Здесь только проставим title (если его нет) и отметим, что всё готово.
            const methodSelect = dialog.querySelector('#select_algorithm');
            if (methodSelect) {
                if (!methodSelect.title) {
                    methodSelect.title = 'Билинейный — плавнее; Ближайший сосед — резче, но со «ступеньками».';
                }
              methodSelect.__ozTooltipAdded = true; // защита от повторных вставок в старом коде
                }
            }
        }
