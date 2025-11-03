export default function convertXYZtoLab([x, y, z]) {
    x = x / 95.047
    y = y / 100.000
    z = z / 108.883

    x = Math.cbrt(x)
    y = Math.cbrt(y)
    z = Math.cbrt(z)

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
      

    return [l, a, b]
}
