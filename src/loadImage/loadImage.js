import createImage from "./createImage";
import drawScaledImage from "../drawScaledImage/drawScaledImage";
import activeTools from "../imageTools/activeTools";
import saveImage from "../saveImage";
import initLayersPanel from "../layers/layersPanel";
import { layersState } from "../layers/layersState";

function enableUi() {
  ["dialog_button", "save_button", "eyedropper_button", "hand_button", "color_button", "open_filter_offcanvas_button", "layers_button"]
    .forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
}

function clampScaleFromUi() {
  const sr = document.getElementById("scale_range");
  const sn = document.getElementById("scale_num");
  let val = Number(sr?.value || sn?.value || 100);
  if (!Number.isFinite(val)) val = 100;
  if (val < 12) val = 12;
  if (val > 300) val = 300;
  return val;
}

async function renderImage(image) {
  if (image.decode) {
    try { await image.decode(); } catch { /* ignore */ }
  }

  const draw = () => {
    // первичная отрисовка — авто-вписывание
    drawScaledImage(image);
    activeTools();

    // при ресайзе окна — если пользователь менял масштаб, держим его
    window.onresize = () => {
      const userScaled = !!window.__oz_userScaled;
      if (userScaled) {
        const val = clampScaleFromUi();
        drawScaledImage(image, val / 100, val / 100);
      } else {
        drawScaledImage(image);
      }
    };
  };

  if (image.complete && image.naturalWidth > 0) {
    draw();
    return;
  }
  image.onload = draw;
  image.onerror = (e) => {
    console.error("Ошибка загрузки изображения:", e);
    alert("Не удалось загрузить изображение. Проверьте файл или ссылку.");
  };
}

function bindSaveMenu() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const getImageData = () => ctx.getImageData(0, 0, canvas.width, canvas.height);

  const saveJpg = document.getElementById("save_as_jpg");
  const savePng = document.getElementById("save_as_png");
  const saveGb7 = document.getElementById("save_as_gb7");

  if (saveJpg) {
    saveJpg.addEventListener("click", (e) => {
      e.preventDefault();
      saveImage(getImageData(), "jpg", { quality: 0.92 });
    });
  }
  if (savePng) {
    savePng.addEventListener("click", (e) => {
      e.preventDefault();
      saveImage(getImageData(), "png");
    });
  }
  if (saveGb7) {
    saveGb7.addEventListener("click", (e) => {
      e.preventDefault();
      saveImage(getImageData(), "gb7", { gb7MaskFromAlpha: true });
    });
  }
}

export default function loadImage() {
  const setup = () => {
    const loadButton = document.getElementById("load_button");
    const urlInput   = document.getElementById("url_load_input");
    const fileInput  = document.getElementById("file_load_input");

    // флаг «пользователь менял масштаб»
    const scaleRange = document.getElementById("scale_range");
    const scaleNum   = document.getElementById("scale_num");
    scaleRange?.addEventListener("change", () => { window.__oz_userScaled = true; });
    scaleNum?.addEventListener("change", () => { window.__oz_userScaled = true; });

    // инициализируем панель слоёв и меню сохранения
    initLayersPanel();
    bindSaveMenu();

    if (!loadButton) {
      console.error("loadImage: не найден элемент #load_button");
      alert("Кнопка загрузки не найдена в DOM");
      return;
    }

    loadButton.onclick = async () => {
      try {
        const file = fileInput?.files?.[0] ?? null;
        const url  = urlInput?.value?.trim() || "";

        if (!file && !url) {
          alert("Выберите файл или укажите URL.");
          return;
        }

        const image = await createImage({ file, url: url || null });
        window.__oz_userScaled = false;
        await renderImage(image);

        // сброс слоёв/альф при новой загрузке и базовый слой = текущий canvas
        (()=>{ const st = layersState.get(); st.layers.length = 0; st.alphaChannels.length = 0; st.activeLayerId = null; })();
        layersState.ensureBaseLayerFromCanvas();

        if (urlInput)  urlInput.value  = "";
        if (fileInput) fileInput.value = "";

        enableUi();
      } catch (err) {
        console.error("loadImage error:", err?.name, err?.message, err);
        alert("Произошла ошибка при загрузке изображения");
      }
    };
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}
