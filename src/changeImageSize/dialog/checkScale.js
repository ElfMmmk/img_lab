let units = document.getElementsByClassName('dialog_units');

export default function checkScale(input, sideValue) {
    let scale = 1;

    if (units[0].innerHTML == 'px') {
        scale = input.value / sideValue;
    } else {
        scale = input.value / 100;
    }

    if (scale < 0.12 || scale > 3) {
        input.setCustomValidity('Недопустимый коэффициент масштабирования');
        input.reportValidity();
        return false;
    } else {
        input.setCustomValidity('');
        input.reportValidity();
        return scale;
    }
}
