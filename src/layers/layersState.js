import { blendRGB } from "./blend";

const state = {
  layers: [],          // [{id,name,imageData,visible,opacity(0..1),blendMode}]
  alphaChannels: [],   // [{id,name,imageData(A=яркость),visible}]
  activeLayerId: null,
  maxLayers: 2,
};

let __id = 0;
function uid(){ return 'L' + (++__id); }
function canvasEl(){ return document.getElementById('canvas'); }
function ctx(){ return canvasEl().getContext('2d'); }

function cloneImageData(idata){
  return new ImageData(new Uint8ClampedArray(idata.data), idata.width, idata.height);
}

function solidImageData(width, height, rgba){
  const data = new Uint8ClampedArray(width*height*4);
  for (let i=0,p=0;i<width*height;i++,p+=4){
    data[p]=rgba[0]; data[p+1]=rgba[1]; data[p+2]=rgba[2]; data[p+3]=rgba[3]??255;
  }
  return new ImageData(data, width, height);
}

function fitImageToCanvas(img, width, height){
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const cctx = c.getContext('2d');
  cctx.drawImage(img, 0, 0, width, height);
  return cctx.getImageData(0, 0, width, height);
}

export const layersState = {
  get(){ return state; },

  ensureBaseLayerFromCanvas(){
    if (state.layers.length) return;
    const c = canvasEl(); if (!c) return;
    const base = ctx().getImageData(0,0,c.width,c.height);
    const id = uid();
    state.layers.push({
      id, name:'Слой 1', imageData: cloneImageData(base),
      visible: true, opacity: 1, blendMode: 'normal'
    });
    state.activeLayerId = id;
  },

  addLayerFromImage(img){
    const c = canvasEl();
    const idata = fitImageToCanvas(img, c.width, c.height);
    const id = uid();
    state.layers.push({
      id, name:`Слой ${state.layers.length+1}`, imageData: idata,
      visible:true, opacity:1, blendMode:'normal'
    });
    state.activeLayerId = id;
  },

  addLayerSolid(colorRGBA){
    const c = canvasEl();
    const idata = solidImageData(c.width, c.height, colorRGBA);
    const id = uid();
    state.layers.push({
      id, name:`Слой ${state.layers.length+1}`, imageData: idata,
      visible:true, opacity:1, blendMode:'normal'
    });
    state.activeLayerId = id;
  },

  removeLayer(id){
    const i = state.layers.findIndex(l=>l.id===id);
    if (i>=0) state.layers.splice(i,1);
    if (state.activeLayerId===id) state.activeLayerId = state.layers[0]?.id || null;
  },

  setActiveLayer(id){ state.activeLayerId = id; },

  updateLayer(id, patch){
    const l = state.layers.find(l=>l.id===id);
    if (l) Object.assign(l, patch);
  },

  reorderLayers(from, to){
    const len = state.layers.length;
    if (from<0||to<0||from>=len||to>=len) return;
    const [l] = state.layers.splice(from,1);
    state.layers.splice(to,0,l);
  },

  addAlphaChannelFromImage(img){
    const c = canvasEl();
    const idata = fitImageToCanvas(img, c.width, c.height);
    const d = idata.data;
    for (let i=0;i<d.length;i+=4){
      const a = Math.round(0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]);
      d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=a;
    }
    state.alphaChannels.push({ id: uid(), name:`Альфа ${state.alphaChannels.length+1}`, imageData: idata, visible:true });
  },

  removeAlphaChannel(id){
    const i = state.alphaChannels.findIndex(a=>a.id===id);
    if (i>=0) state.alphaChannels.splice(i,1);
  },

  updateAlphaChannel(id, patch){
    const a = state.alphaChannels.find(a=>a.id===id);
    if (a) Object.assign(a, patch);
  },

  compositeToCanvas(){
    const c = canvasEl(); if (!c) return;
    const out = ctx().createImageData(c.width, c.height);
    const od = out.data;

    // clear
    for (let i=0;i<od.length;i+=4){ od[i]=0; od[i+1]=0; od[i+2]=0; od[i+3]=0; }

    // сводная альфа
    const mask = new Float32Array(c.width*c.height).fill(1);
    state.alphaChannels.forEach(A=>{
      if (!A.visible) return;
      const dd = A.imageData.data;
      for (let p=0,px=0;p<dd.length;p+=4,px++) mask[px] *= (dd[p+3]/255);
    });

    // слои (снизу вверх)
    state.layers.forEach(L=>{
      if (!L.visible) return;
      const ld = L.imageData.data;
      const op = Math.max(0,Math.min(1,L.opacity??1));
      const mode = L.blendMode || 'normal';

      for (let p=0,px=0;p<ld.length;p+=4,px++){
        const sr=ld[p], sg=ld[p+1], sb=ld[p+2], sa=ld[p+3]/255;
        if (sa===0 && op===0) continue;

        const dr=od[p], dg=od[p+1], db=od[p+2], da=od[p+3]/255;

        const [br,bg,bb] = blendRGB(mode,[sr,sg,sb],[dr,dg,db]);
        const aS = sa*op;
        const aOut = aS + da*(1-aS);

        const rOut = (br*aS + dr*da*(1-aS)) / (aOut || 1);
        const gOut = (bg*aS + dg*da*(1-aS)) / (aOut || 1);
        const bOut = (bb*aS + db*da*(1-aS)) / (aOut || 1);

        od[p]   = rOut|0;
        od[p+1] = gOut|0;
        od[p+2] = bOut|0;
        od[p+3] = (aOut*255)|0;
      }
    });

    // применяем сводную альфу
    let has = false;
    for (let i=0;i<mask.length;i++){ if (mask[i]!==1){ has=true; break; } }
    if (has){
      for (let p=0,px=0;p<od.length;p+=4,px++) od[p+3] = (od[p+3]*mask[px])|0;
    }

    ctx().putImageData(out,0,0);
  }
};
