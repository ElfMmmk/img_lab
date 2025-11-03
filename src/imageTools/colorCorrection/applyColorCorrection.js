    import drawColorCorrectionLine from "./drawColorCorrectionLine";

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    let originalImageData = null; // снимок для предпросмотра

    export default function applyColorCorrection(preview) {
    // выясняем режим
    const modeAlpha = document.getElementById('cc_mode_alpha');
    const mode = (modeAlpha && modeAlpha.checked) ? 'alpha' : 'rgb';

    // получить текущий кадр
    let current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (preview === false) {
        // выключаем предпросмотр: вернуть оригинал, если он был
        if (originalImageData) {
        ctx.putImageData(originalImageData, 0, 0);
        originalImageData = null;
        }
        return;
    }

    // при первом превью — сохранить оригинал
    if (preview === true && !originalImageData) {
        originalImageData = new ImageData(
        new Uint8ClampedArray(current.data), current.width, current.height
        );
    }

    // строим LUT (округлённый и клампнутый) из текущей кривой
    const lut = drawColorCorrectionLine(); // вызов без chart → вернёт LUT[256]

    const src = preview ? new Uint8ClampedArray(originalImageData.data) : current.data;
    const dst = current.data;

    if (mode === 'rgb') {
        // применяем LUT к каналам R,G,B, не трогаем Alpha
        for (let i = 0; i < dst.length; i += 4) {
        dst[i    ] = lut[src[i    ]]; // R
        dst[i + 1] = lut[src[i + 1]]; // G
        dst[i + 2] = lut[src[i + 2]]; // B
        dst[i + 3] = src[i + 3];      // A — как был
        }
    } else {
        // режим Alpha: трогаем только альфу
        for (let i = 0; i < dst.length; i += 4) {
        dst[i    ] = src[i    ];
        dst[i + 1] = src[i + 1];
        dst[i + 2] = src[i + 2];
        dst[i + 3] = lut[src[i + 3]]; // A
        }
    }

    ctx.putImageData(current, 0, 0);

    // финальное применение (кнопка "Применить") — закрепляем и очищаем снапшот
    if (preview !== true) {
        originalImageData = null;
    }
    }
