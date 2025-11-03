function clamp8(v){ return v < 0 ? 0 : v > 255 ? 255 : v | 0; }

export function blendRGB(mode, src, dst) {
  const [sr, sg, sb] = src;
  const [dr, dg, db] = dst;

  switch (mode) {
    case 'multiply':
      return [(sr*dr)/255, (sg*dg)/255, (sb*db)/255].map(clamp8);

    case 'screen':
      return [
        255 - ((255 - sr)*(255 - dr))/255,
        255 - ((255 - sg)*(255 - dg))/255,
        255 - ((255 - sb)*(255 - db))/255,
      ].map(clamp8);

    case 'overlay': {
      const f = (s,d) => d < 128 ? (2*s*d)/255 : 255 - (2*(255-s)*(255-d))/255;
      return [f(sr,dr), f(sg,dg), f(sb,db)].map(clamp8);
    }

    case 'normal':
    default:
      return [sr, sg, sb].map(clamp8);
  }
}
