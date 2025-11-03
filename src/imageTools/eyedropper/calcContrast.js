export default function calcContrast(rgb1, rgb2) {
    const RED = 0.2126;
    const GREEN = 0.7152;
    const BLUE = 0.0722;
    
    const GAMMA = 2.4;
    
    function luminance(r, g, b) {
      let a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
          ? v / 12.92
          : Math.pow((v + 0.055) / 1.055, GAMMA);
      });
      return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
    }
    
    let lum1 = luminance(...rgb1);
    let lum2 = luminance(...rgb2);
    let brightest = Math.max(lum1, lum2);
    let darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}
