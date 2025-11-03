let inputWidth = document.getElementById('input_width');
let inputHeight = document.getElementById('input_height');
let mpAfterChange = document.getElementById("dialog_after_px"); 
let units = document.getElementsByClassName('dialog_units');

export default function setMpAfterChange(oldWidth, oldHeight) {
	let newWidth = 0;
	let newHeight = 0;

	if (units[0].innerHTML == 'px') {
		newWidth = inputWidth.value;
		newHeight = inputHeight.value;
	} else if (units[0].innerHTML == '%') {
		newWidth = inputWidth.value * oldWidth / 100;
		newHeight = inputHeight.value * oldHeight / 100;
	}

	mpAfterChange.innerText = "После изменений: " + (newWidth * newHeight / 1000000).toFixed(2) + " MP";
}
