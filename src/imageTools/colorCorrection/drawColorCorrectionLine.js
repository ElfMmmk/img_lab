    let colorCorrectionInputs = document.getElementsByClassName('color_correction_input');
    let chartData = [];

    /**
     * Рисует линию коррекции и возвращает LUT при вызове без chart.
     * @param {anychart.core.Cartesian} [chart]
     * @param {boolean} [isDefault]
     * @returns {number[]|void} LUT[256] если chart не передан
     */
    export default function drawColorCorrectionLine(chart, isDefault) {
    // Возврат LUT (округление + кламп)
    if (!chart) {
        return chartData.map((el) => {
        let y = Math.round(el[1]);
        if (y < 0) y = 0;
        if (y > 255) y = 255;
        return y;
        });
    }

    // Чистим только динамические серии: кривая, маркеры и прошлую диагональ
    for (let i = chart.getSeriesCount() - 1; i >= 0; i--) {
        const s = chart.getSeries(i);
        const name = typeof s.name === 'function' ? s.name() : '';
        if (name === 'Correction' || name === 'Point 1' || name === 'Point 2' || name === 'Diagonal') {
        chart.removeSeriesAt(i);
        }
    }

    let firstIn  = parseInt(colorCorrectionInputs[0].value);
    let firstOut = parseInt(colorCorrectionInputs[1].value);
    let secondIn = parseInt(colorCorrectionInputs[2].value);
    let secondOut= parseInt(colorCorrectionInputs[3].value);

    if (isDefault) {
        firstIn = 0; firstOut = 0;
        secondIn = 255; secondOut = 255;
    }

    // Кусочно-линейная функция
    chartData = [];
    const k = (secondOut - firstOut) / (secondIn - firstIn);
    const b = firstOut - k * firstIn;

    for (let x = 0; x < firstIn; x++)     chartData[x] = [x, firstOut];
    for (let x = firstIn; x < secondIn; x++) chartData[x] = [x, k * x + b];
    for (let x = secondIn; x < 256; x++)  chartData[x] = [x, secondOut];

    // Линия коррекции
    const seriesData = anychart.data.set(chartData).mapAs({ x: 0, value: 1 });
    const correction = chart.line(seriesData);
    correction.name('Correction');
    correction.stroke('black', 2);
    correction.hovered().markers().enabled(false);

    // Маркеры двух точек
    const p1 = chart.marker(anychart.data.set([[firstIn, firstOut]]).mapAs({ x: 0, value: 1 }));
    p1.name('Point 1'); p1.type('circle').size(6).fill('#ffffff').stroke('#000000');

    const p2 = chart.marker(anychart.data.set([[secondIn, secondOut]]).mapAs({ x: 0, value: 1 }));
    p2.name('Point 2'); p2.type('circle').size(6).fill('#000000').stroke('#000000');

    // Подписи по X
    chart.xAxis().labels().format(function () {
        return (this.value == 0 || this.value == 255 || this.value == firstIn || this.value == secondIn) ? this.value : '';
    });

    // Диагональ — теперь как серия из 256 точек (никаких «дыр»)
    const diagArr = new Array(256);
    for (let i = 0; i < 256; i++) diagArr[i] = [i, i];
    const diagData = anychart.data.set(diagArr).mapAs({ x: 0, value: 1 });
    const diagonal = chart.line(diagData);
    diagonal.name('Diagonal');
    diagonal.stroke('rgba(0,0,200,0.95)', 3, '5 4'); // заметный пунктир
    diagonal.hovered().markers().enabled(false);
    if (typeof diagonal.zIndex === 'function') diagonal.zIndex(10000);

    chart.container('chart_container').draw();
    }
