import makeImageMatrix from "../../changeImageSize/makeImageMatrix";
import setImageData from "../../setImageData";
import edgeHandling from "./edgeHandling";

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

let imageData;

export default function kernelTurn(kernel, isPreview = null) {
    let width = Math.floor(canvas.width);
    let height = Math.floor(canvas.height);
    let buffer = new Uint8ClampedArray(width * height * 4);

    if (!imageData || imageData.length / 4 / width != height) {
        imageData = ctx.getImageData(0, 0, width, height).data;
    }

    let imageMatrix = makeImageMatrix(imageData, width);
    imageMatrix = edgeHandling(imageMatrix, width, height);

    let pos = 0;

    for (let y = 2; y <= height + 1; y++) {
		for (let x = 8; x <= width * 4 + 4; x+=4) {
            let R = 0;
            let G = 0;
            let B = 0;
            for (let s = -1; s <= 1; s++) {
                for (let t = -1; t <= 1; t++) {
                    R += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 3 + s * 4];
                    G += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 2 + s * 4];
                    B += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 1 + s * 4];
                }
            }

            buffer[pos] = R;
            buffer[pos + 1] = G;
            buffer[pos + 2] = B;
            buffer[pos + 3] = 255;

            pos += 4;
        }
    }

    setImageData(buffer, imageData, width, height, isPreview);

    if (isPreview === null) {
        imageData = null;
    }
}
