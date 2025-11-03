  // src/loadImage/createImage.js
  // PNG/JPG — как раньше, плюс поддержка GrayBit-7 (.gb7) с автосниффингом сигнатуры.
  import {
    loadGb7FromFile,
    loadGb7FromBlob,
    loadGb7FromUrl,
    gb7ToImageElement,
    isGb7Buffer,
  } from "../formats/gb7";

  export default async function createImage({ file, url }) {
    // === Локальный файл ===
    if (file) {
      const name = (file.name || "").toLowerCase();

      // Явный .gb7 по расширению
      if (name.endsWith(".gb7")) {
        const gb7 = await loadGb7FromFile(file);
        return await gb7ToImageElement(gb7);
      }

      // Сниффинг сигнатуры GB7 (на случай «не того» расширения)
      try {
        const head = await file.slice(0, 16).arrayBuffer();
        if (isGb7Buffer(head)) {
          const gb7 = await loadGb7FromFile(file);
          return await gb7ToImageElement(gb7);
        }
      } catch (e) {
        console.warn("GB7 sniff error (file):", e);
      }

      // Обычные форматы (PNG/JPG/WebP и т.п.)
      const img = new Image();
      img.src = URL.createObjectURL(file);
      return img;
    }

    // === Загрузка по URL ===
    if (url) {
      const lower = url.toLowerCase();

      // Явный .gb7 по расширению
      if (lower.endsWith(".gb7")) {
        const gb7 = await loadGb7FromUrl(url);
        return await gb7ToImageElement(gb7);
      }

      // Пробуем скачать blob и проверить сигнатуру
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`fetch failed ${resp.status}`);
        const blob = await resp.blob();

        const head = await blob.slice(0, 16).arrayBuffer();
        if (isGb7Buffer(head)) {
          const gb7 = await loadGb7FromBlob(blob);
          return await gb7ToImageElement(gb7);
        }

        // Иначе — как обычную картинку
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        return img;
      } catch (e) {
        // Фоллбэк — напрямую в <img src="..."> (иногда спасает от CORS/content-type)
        console.warn("createImage URL path failed, fallback to <img src=url>:", e);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        return img;
      }
    }

    throw new Error("createImage: neither file nor url provided");
  }
