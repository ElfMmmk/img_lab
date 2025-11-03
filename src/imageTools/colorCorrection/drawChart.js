  import drawColorCorrectionLine from "./drawColorCorrectionLine";
  import checkColorCoords from "./checkColorCoords";
  import applyColorCorrection from "./applyColorCorrection";

  let colorCorrectionOffcanvas = document.getElementById('color_correction');

  let colorButton = document.getElementById("color_button");
  let submitColorCorrectionButton = document.getElementById("submit_color_correction_button");
  let resetColorCorrectionButton = document.getElementById("reset_color_correction_button");
  let closeColorpanelButton = document.getElementById("close_color_correction_button");
  let colorCorrectionInputs = document.getElementsByClassName('color_correction_input');
  let previewCheckbox = document.getElementById("color_correction_checkbox");

  // новые элементы режима
  const modeRGB   = document.getElementById('cc_mode_rgb');
  const modeAlpha = document.getElementById('cc_mode_alpha');

  export default function drawChart(imageData) {
    // сохраним последний буфер, чтобы при смене режима перерисовать график
    window.__cc_lastImageData__ = imageData;

    let chartContainer = document.getElementById('chart_container');
    chartContainer.innerHTML = ''; 

    // выясняем режим
    const mode = (modeAlpha && modeAlpha.checked) ? 'alpha' : 'rgb';

    let chart = anychart.line();

    chart.xAxis().labels().format(function() {
      return this.value == 0 || this.value == 255 ? this.value : '';
    });
    chart.xAxis().ticks().stroke('none');
    chart.xAxis().title('in');

    chart.yAxis().title('out');
    chart.yScale().minimum(0);
    chart.yScale().maximum(255);
    chart.yScale().ticks().set([0, 255]);

    chart.tooltip().enabled(false);

    if (mode === 'rgb') {
      // ===== гистограммы R/G/B =====
      let R = Array(256).fill(0);
      let G = Array(256).fill(0);
      let B = Array(256).fill(0);

      for (let i = 0; i < imageData.length; i += 4) {
        R[imageData[i    ]]++;
        G[imageData[i + 1]]++;
        B[imageData[i + 2]]++;
      }

      const maxVal = Math.max(Math.max(...R), Math.max(...G), Math.max(...B)) || 1;
      let chartData = new Array(256);
      for (let i = 0; i < 256; i++) {
        chartData[i] = [i, R[i] / maxVal, G[i] / maxVal, B[i] / maxVal];
      }

      const dataSet = anychart.data.set(chartData);
      const s1 = chart.line(dataSet.mapAs({x: 0, value: 1})); s1.name('R').stroke('red').hovered().markers().enabled(false);
      const s2 = chart.line(dataSet.mapAs({x: 0, value: 2})); s2.name('G').stroke('green').hovered().markers().enabled(false);
      const s3 = chart.line(dataSet.mapAs({x: 0, value: 3})); s3.name('B').stroke('blue').hovered().markers().enabled(false);
    } else {
      // ===== гистограмма Alpha =====
      let A = Array(256).fill(0);
      for (let i = 0; i < imageData.length; i += 4) {
        A[imageData[i + 3]]++;
      }
      const maxVal = Math.max(...A) || 1; // защита от деления на 0
      let chartData = new Array(256);
      for (let i = 0; i < 256; i++) {
        chartData[i] = [i, A[i] / maxVal];
      }

      const dataSet = anychart.data.set(chartData);
      const sa = chart.line(dataSet.mapAs({x: 0, value: 1}));
      sa.name('A').stroke('#666').hovered().markers().enabled(false);
    }

    chart.container(chartContainer).draw();

    // кривая, маркеры и диагональ — всегда рисуются ПОСЛЕДНИМИ внутри этой функции
    drawColorCorrectionLine(chart);

    // ====== UI handlers ======
    closeColorpanelButton.onclick = () => {
      colorButton.classList.remove('active');
      applyColorCorrection(false);
      previewCheckbox.checked = false;
    };

    resetColorCorrectionButton.onclick = () => {
      applyColorCorrection(false);
      drawColorCorrectionLine(chart, true);
    };

    submitColorCorrectionButton.onclick = () => {
      if (checkColorCoords()) {
        const off = bootstrap.Offcanvas.getInstance(colorCorrectionOffcanvas);
        if (off) {
          off.hide();
          colorButton.classList.remove('active');
        }
        applyColorCorrection();
        drawColorCorrectionLine(chart, true);
      }
    };

    previewCheckbox.onclick = () => {
      applyColorCorrection(previewCheckbox.checked);
    };

    for (let i = 0; i < 4; i++) {
      colorCorrectionInputs[i].onchange = () => {
        if (checkColorCoords()) {
          drawColorCorrectionLine(chart);
          if (previewCheckbox.checked) {
            applyColorCorrection(true);
          }
        }
      };
    }

    // переключение режима — перерисовать график и сбросить предпросмотр
    const rebind = (el) => {
      if (!el) return;
      el.onchange = () => {
        applyColorCorrection(false);
        previewCheckbox.checked = false;
        drawChart(window.__cc_lastImageData__); // перерисовать под новый режим
      };
    };
    rebind(modeRGB);
    rebind(modeAlpha);
  }
