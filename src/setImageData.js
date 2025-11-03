import setDialogData from "./changeImageSize/dialog/setDialogData";
import renderImageData from "./drawScaledImage/renderImageData";
import saveImage from "./saveImage";

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

let saveImageButton = document.getElementById("save_button");

export default function setImageData(buffer, imageData, width, height, isPreview = null) {
    let canvasHelper = document.createElement('canvas');
    canvasHelper.width = width;
    canvasHelper.height = height;
        
    let canvasHelperCtx = canvasHelper.getContext('2d');
	let newImageData = canvasHelperCtx.createImageData(width, height);

    if (isPreview === false) {
        newImageData.data.set(imageData);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
        return;
    }

    newImageData.data.set(buffer);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(newImageData, 0, 0);

    if (isPreview === null) {
        saveImageButton.onclick = () => { saveImage(newImageData) } ;

        let image = new Image();
        image.src = canvas.toDataURL();
        image.onload = () => {
            renderImageData(image, canvas, ctx);
            setDialogData(image);
        }
    }    
}
