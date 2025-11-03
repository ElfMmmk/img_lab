export default function getImageData(image) {
    let canvasHelper = document.createElement('canvas');
    canvasHelper.width = image.width;
    canvasHelper.height = image.height;
        
    let canvasHelperCtx = canvasHelper.getContext('2d');
    canvasHelperCtx.drawImage(image, 0, 0);
        
    let imageData = canvasHelperCtx.getImageData(0, 0, image.width, image.height).data;

    return imageData;
}
