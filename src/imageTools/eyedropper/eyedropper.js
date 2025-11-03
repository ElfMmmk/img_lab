import getColorInfo from "./getColorInfo";

let eyedropperButton = document.getElementById("eyedropper_button");
let canvas = document.getElementById("canvas");
let closeColorpanelButton = document.getElementsByClassName("close_colorpanel_button")[0];

export default function eyedropper() {
    closeColorpanelButton.onclick = () => {
        eyedropperButton.classList.remove('active')
    }

    eyedropperButton.onclick = () => {
        canvas.onmousedown = () => {};

        getColorInfo();
    }
}
