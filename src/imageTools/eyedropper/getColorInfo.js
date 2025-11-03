    import calcContrast from "./calcContrast";
    import convertRBGtoXYZ from "./convertRBGtoXYZ";
    import convertXYZtoLab from "./convertXYZtoLab";
    import updateOKLch from './oklch.js';

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    let firstColorCoord = document.getElementsByClassName('color_coord')[0];
    let firstColorSwatch = document.getElementsByClassName('color_swatch')[0];
    let firstColorRGB = document.getElementsByClassName('color_rgb')[0];
    let firstColorXYZ = document.getElementsByClassName('color_xyz')[0];
    let firstColorLab = document.getElementsByClassName('color_lab')[0];
    let firstColorBlock = document.getElementsByClassName('color')[0];

    let secColorCoord = document.getElementsByClassName('color_coord')[1];
    let secColorSwatch = document.getElementsByClassName('color_swatch')[1];
    let secColorRGB = document.getElementsByClassName('color_rgb')[1];
    let secColorXYZ = document.getElementsByClassName('color_xyz')[1];
    let secColorLab = document.getElementsByClassName('color_lab')[1];
    let secColorBlock = document.getElementsByClassName('color')[1];

    let contrastLabel = document.getElementsByClassName('contrast_label')[0];
    let contrastValue = document.getElementsByClassName('contrast_value')[0];
    let contrastAlert = document.getElementsByClassName('contrast_alert')[0];

    // ===== GB7: helpers для строки "Native L127" =====
    function isGB7Active() {
        // метаданные лежат в canvas.__oz_meta__ из drawScaledImage.js
        return !!(canvas && canvas.__oz_meta__ && canvas.__oz_meta__.depth === 7);
    }
    function ensureGb7Row(colorBlock) {
        let el = colorBlock.querySelector(".gb7_native");
        if (!el) {
        el = document.createElement("p");
        el.className = "gb7_native";
        el.setAttribute("title", "Исходная 7-битная светлота пикселя (0..127) из формата GB7");
        const lab = colorBlock.querySelector(".color_lab");
        if (lab && lab.parentElement === colorBlock) lab.insertAdjacentElement("afterend", el);
        else colorBlock.appendChild(el);
        }
        return el;
    }
    function updateGb7NativeL(colorBlock, r /*8-бит sRGB*/ ) {
        if (!isGB7Active() || !colorBlock) return;
    // Обратное сопоставление: 255-уровневый sRGB -> 127-уровневый код GB7
        const L127 = Math.round((r * 127) / 255);
        const row = ensureGb7Row(colorBlock);
        row.textContent = `Native L127: ${L127}`;
    }

    export default function getColorInfo() {
        let [R1, G1, B1] = [];
        let [R2, G2, B2] = [];
        let fixedColor1 = [];
        let fixedColor2 = [];
        let isFirstColorLocked = false;
        let isSecColorLocked = false;
        canvas.addEventListener('mousemove', e => {
        if (e.ctrlKey) {
            [R2, G2, B2] = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
            if (!isSecColorLocked) {
            secColorSwatch.style.backgroundColor = `rgb(${R2}, ${G2}, ${B2})`;
            // Числовые поля (XYZ/Lab/OKLch/Native L127) обновляем по клику
            }
        } else {
            [R1, G1, B1] = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
            if (!isFirstColorLocked) {
            firstColorSwatch.style.backgroundColor = `rgb(${R1}, ${G1}, ${B1})`;
            }
        }
        });

        canvas.addEventListener('mousedown', e => {
        if (e.ctrlKey) {
            [R2, G2, B2] = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
            fixedColor2 = [R2, G2, B2];
            let [X2, Y2, Z2] = convertRBGtoXYZ([R2, G2, B2]).map((coord) => coord.toFixed(1));
            let [L2, a2, b2] = convertXYZtoLab([X2, Y2, Z2]).map((coord) => coord.toFixed(1));
            secColorCoord.innerText = `x: ${e.offsetX} y: ${e.offsetY} `;
            secColorRGB.innerText   = `RGB (${R2}, ${G2}, ${B2})`;
            secColorXYZ.innerText   = `XYZ (${X2}, ${Y2}, ${Z2})`;
            secColorLab.innerText   = `Lab (${L2}, ${a2}, ${b2})`;
            secColorSwatch.style.backgroundColor = `rgb(${R2}, ${G2}, ${B2})`;
            updateOKLch(secColorBlock, { r: R2, g: G2, b: B2 });
        // GB7 Native L127 — если активна GB7
            updateGb7NativeL(secColorBlock, R2);

            isSecColorLocked = true;
        } else {
            [R1, G1, B1] = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
            fixedColor1 = [R1, G1, B1];

            let [X1, Y1, Z1] = convertRBGtoXYZ([R1, G1, B1]).map((coord) => coord.toFixed(1));
            let [L1, a1, b1] = convertXYZtoLab([X1, Y1, Z1]).map((coord) => coord.toFixed(1));

            firstColorCoord.innerText = `x: ${e.offsetX} y: ${e.offsetY} `;
            firstColorRGB.innerText   = `RGB (${R1}, ${G1}, ${B1})`;
            firstColorXYZ.innerText   = `XYZ (${X1}, ${Y1}, ${Z1})`;
            firstColorLab.innerText   = `Lab (${L1}, ${a1}, ${b1})`;
            firstColorSwatch.style.backgroundColor = `rgb(${R1}, ${G1}, ${B1})`;
            updateOKLch(firstColorBlock, { r: R1, g: G1, b: B1 });
        // GB7 Native L127 — если активна GB7
            updateGb7NativeL(firstColorBlock, R1);

            isFirstColorLocked = true;
            }

            if (isFirstColorLocked && isSecColorLocked) {
            let contrast = calcContrast(fixedColor1, fixedColor2).toFixed(1);

            if (contrast < 4.5) {
                contrastAlert.style.display = 'block';
                contrastValue.style.color = 'red';
            } else {
                contrastAlert.style.display = 'none';
                contrastValue.style.color = 'black';
            }

            contrastLabel.style.display = 'block';
            contrastValue.innerText = contrast + ':1';
            }
        });
        }
