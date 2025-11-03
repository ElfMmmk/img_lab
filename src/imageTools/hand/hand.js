import move from "./move";


let canvas = document.getElementById("canvas");
let handButton = document.getElementById("hand_button");
let colorDataOffcanvas = document.getElementById('colorData');
let colorCorrectionOffcanvas = document.getElementById('color_correction');
let filterOffcanvas = document.getElementById('filter_offcanvas');

export default function hand() {
    handButton.onclick = () => {
        let colorDataOffcanvasInstance = bootstrap.Offcanvas.getInstance(colorDataOffcanvas);
        let colorCorrectionOffcanvasInstance = bootstrap.Offcanvas.getInstance(colorCorrectionOffcanvas);
        let filterOffcanvasInstance = bootstrap.Offcanvas.getInstance(filterOffcanvas);

        if (colorDataOffcanvasInstance) {
            colorDataOffcanvasInstance.hide();
        }

        if (colorCorrectionOffcanvasInstance) {
            colorCorrectionOffcanvasInstance.hide();
        }

        if (filterOffcanvasInstance) {
            filterOffcanvasInstance.hide();
        }

        if (handButton.classList.contains('active')) {
            canvas.onmousedown = () => {};
        } else {
            move();
        }
    }
}
