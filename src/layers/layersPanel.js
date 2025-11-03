import { layersState } from "./layersState";

// helpers
const $ = (id) => document.getElementById(id);

function drawPreview(canvas, idata){
  const w = canvas.width, h = canvas.height;
  const tmp = document.createElement('canvas');
  tmp.width = idata.width; tmp.height = idata.height;
  tmp.getContext('2d').putImageData(idata,0,0);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  ctx.drawImage(tmp,0,0,w,h);
}

function buildLayerItem(L, idx){
  const tpl = $('#tpl_layer_item');
  if (!tpl) return null;
  const node = tpl.content.firstElementChild.cloneNode(true);

  if (L.id === layersState.get().activeLayerId) node.classList.add('border-primary');

  const vis     = node.querySelector('.js-vis');
  const preview = node.querySelector('.js-preview');
  const nameBtn = node.querySelector('.js-name');
  const btnUp   = node.querySelector('.js-up');
  const btnDown = node.querySelector('.js-down');
  const btnDel  = node.querySelector('.js-del');
  const opacity = node.querySelector('.js-opacity');
  const blend   = node.querySelector('.js-blend');

  vis.checked = !!L.visible;
  nameBtn.textContent = L.name;
  opacity.value = String(Math.round((L.opacity??1)*100));
  blend.value = L.blendMode || 'normal';
  drawPreview(preview, L.imageData);

  nameBtn.addEventListener('click', ()=>{
    layersState.setActiveLayer(L.id);
    rebuildUI();
  });
  vis.addEventListener('change', ()=>{
    layersState.updateLayer(L.id,{visible:vis.checked});
    layersState.compositeToCanvas();
  });
  opacity.addEventListener('input', ()=>{
    layersState.updateLayer(L.id,{opacity: Math.max(0,Math.min(1, opacity.value/100))});
    layersState.compositeToCanvas();
  });
  blend.addEventListener('change', ()=>{
    layersState.updateLayer(L.id,{blendMode: blend.value});
    layersState.compositeToCanvas();
  });
  btnDel.addEventListener('click', ()=>{
    if (confirm('Удалить слой?')){
      layersState.removeLayer(L.id);
      layersState.compositeToCanvas();
      rebuildUI();
    }
  });
  btnUp.addEventListener('click', ()=>{
    layersState.reorderLayers(idx, Math.max(0,idx-1));
    layersState.compositeToCanvas();
    rebuildUI();
  });
  btnDown.addEventListener('click', ()=>{
    layersState.reorderLayers(idx, Math.min(layersState.get().layers.length-1, idx+1));
    layersState.compositeToCanvas();
    rebuildUI();
  });

  return node;
}

function buildAlphaItem(A){
  const tpl = $('#tpl_alpha_item');
  if (!tpl) return null;
  const node = tpl.content.firstElementChild.cloneNode(true);

  const vis     = node.querySelector('.js-vis');
  const preview = node.querySelector('.js-preview');
  const nameEl  = node.querySelector('.js-name');
  const btnDel  = node.querySelector('.js-del');

  vis.checked = !!A.visible;
  nameEl.textContent = A.name;
  drawPreview(preview, A.imageData);

  vis.addEventListener('change', ()=>{
    layersState.updateAlphaChannel(A.id,{visible:vis.checked});
    layersState.compositeToCanvas();
  });
  btnDel.addEventListener('click', ()=>{
    if (confirm('Удалить альфа-канал?')){
      layersState.removeAlphaChannel(A.id);
      layersState.compositeToCanvas();
      rebuildUI();
    }
  });

  return node;
}

function rebuildUI(){
  const st = layersState.get();
  const { layers, alphaChannels } = st;

  const list = $('#layers_list');
  const listEmpty = $('#layers_empty');
  const alpha = $('#alpha_list');
  const alphaEmpty = $('#alpha_empty');

  if (!list || !alpha) return;

  while (list.firstChild) list.removeChild(list.firstChild);
  while (alpha.firstChild) alpha.removeChild(alpha.firstChild);

  layers.forEach((L, idx)=>{
    const node = buildLayerItem(L, idx);
    if (node) list.appendChild(node);
  });
  if (listEmpty) listEmpty.style.display = layers.length ? 'none' : '';

  alphaChannels.forEach(A=>{
    const node = buildAlphaItem(A);
    if (node) alpha.appendChild(node);
  });
  if (alphaEmpty) alphaEmpty.style.display = alphaChannels.length ? 'none' : '';

  const addBtn = document.querySelector('#layers_add_btn, [data-role="layers-add"]');
  if (addBtn) addBtn.disabled = layers.length >= st.maxLayers;
}

function bindAddLayerModal(){
  const modeFile   = $('#add_layer_mode_file');
  const modeColor  = $('#add_layer_mode_color');
  const fileInput  = $('#add_layer_file');
  const colorRow   = $('#add_layer_color_row');
  const colorInput = $('#add_layer_color');
  const nameInput  = $('#add_layer_name');
  const createBtn  = $('#add_layer_create');

  if (!modeFile || !modeColor || !fileInput || !colorRow || !nameInput || !createBtn){
    // нет модалки — сделаем fallback в initLayersPanel()
    return;
  }

  function updateMode(){
    const byFile = modeFile.checked;
    fileInput.closest('.mb-2').style.display = byFile ? '' : 'none';
    colorRow.style.display = byFile ? 'none' : '';
  }
  modeFile.addEventListener('change', updateMode);
  modeColor.addEventListener('change', updateMode);
  updateMode();

  createBtn.addEventListener('click', ()=>{
    const name = (nameInput.value||'').trim() || `Слой ${layersState.get().layers.length+1}`;
    if (modeFile.checked){
      const f = fileInput.files?.[0];
      if (!f){ alert('Выберите файл'); return; }
      const img = new Image();
      img.onload = ()=>{
        layersState.addLayerFromImage(img);
        layersState.updateLayer(layersState.get().activeLayerId, { name });
        layersState.compositeToCanvas();
        rebuildUI();
        bootstrap.Modal.getInstance($('#add_layer_modal')).hide();
        fileInput.value = '';
      };
      img.onerror = ()=> alert('Не удалось прочитать изображение');
      img.src = URL.createObjectURL(f);
    } else {
      const hex = ($('#add_layer_color')?.value || '#000000').replace('#','');
      const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
      layersState.addLayerSolid([r,g,b,255]);
      layersState.updateLayer(layersState.get().activeLayerId, { name });
      layersState.compositeToCanvas();
      rebuildUI();
      bootstrap.Modal.getInstance($('#add_layer_modal')).hide();
    }
  });
}

export default function initLayersPanel(){
  const btn = $('#layers_button');
  if (!btn) return;

  // при открытии панели — гарантируем базовый слой и строим UI
  btn.addEventListener('click', ()=>{
    layersState.ensureBaseLayerFromCanvas();
    rebuildUI();
  });

  // Добавить слой → модалка если есть, иначе — файл-пикер (fallback)
  const addBtn = document.querySelector('#layers_add_btn, [data-role="layers-add"]');
  addBtn?.addEventListener('click', ()=>{
    const st = layersState.get();
    if (st.layers.length >= st.maxLayers){
      alert(`Максимум слоёв: ${st.maxLayers}`);
      return;
    }
    const modalEl = $('#add_layer_modal');
    if (modalEl && window.bootstrap?.Modal){
      new bootstrap.Modal(modalEl).show();
      return;
    }
    // fallback: быстро добавить слой из файла
    let picker = document.createElement('input');
    picker.type = 'file'; picker.accept = 'image/*'; picker.hidden = true;
    document.body.appendChild(picker);
    picker.onchange = () => {
      const f = picker.files?.[0];
      if (!f){ document.body.removeChild(picker); return; }
      const img = new Image();
      img.onload = ()=>{
        layersState.addLayerFromImage(img);
        layersState.compositeToCanvas();
        rebuildUI();
        document.body.removeChild(picker);
      };
      img.onerror = ()=>{ alert('Не удалось прочитать изображение'); document.body.removeChild(picker); };
      img.src = URL.createObjectURL(f);
    };
    picker.click();
  });

  // Добавить альфа-канал (+ создаём скрытый input, если его нет в разметке)
  const addAlphaBtn = document.querySelector('#alpha_add_btn, [data-role="alpha-add"]');
  let alphaFile = $('#alpha_file_input');
  if (!alphaFile){
    alphaFile = document.createElement('input');
    alphaFile.type = 'file'; alphaFile.accept = 'image/*'; alphaFile.hidden = true; alphaFile.id = 'alpha_file_input';
    document.body.appendChild(alphaFile);
  }
  addAlphaBtn?.addEventListener('click', ()=> alphaFile.click());
  alphaFile?.addEventListener('change', ()=>{
    const f = alphaFile.files?.[0]; if (!f) return;
    const img = new Image();
    img.onload = ()=>{
      layersState.addAlphaChannelFromImage(img);
      layersState.compositeToCanvas();
      rebuildUI();
      alphaFile.value = '';
    };
    img.onerror = ()=> alert('Не удалось прочитать изображение');
    img.src = URL.createObjectURL(f);
  });

  // Модалка (если она есть в разметке)
  bindAddLayerModal();
}
