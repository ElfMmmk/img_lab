let units = document.getElementsByClassName('dialog_units');

export default function changeRatioSideInput(activeSide, otherSide, scale) {
    if (units[0].innerHTML == 'px') {
        otherSide.value = Math.round(activeSide.value * scale);
    } else {
        otherSide.value = activeSide.value;
    }
}
