export default function makeImageMatrix(imageData, imageWidth) {
    let imageMatrix = [];

	for (let y = 1; y <= imageData.length / (imageWidth * 4); y++) {
		imageMatrix[y] = [];
		let x = 1;
		for (let i = imageWidth * 4 * (y - 1); i < imageWidth * 4 * y; i++) {
			imageMatrix[y][x] = imageData[i];
			x += 1;
		}
	}

    return imageMatrix;
}
