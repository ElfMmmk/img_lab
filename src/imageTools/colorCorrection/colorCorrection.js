import drawChart from "./drawChart";

let colorButton = document.getElementById("color_button");

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

export default function colorCorrection() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    drawChart(imageData);

    colorButton.onclick = () => {
        canvas.onmousedown = () => {};
    }
}
