    let colorCorrectionInputs = document.getElementsByClassName('color_correction_input');

    export default function checkColorCoords() {
        function check(input) {
            if (input.value > 255 || input.value < 0) {
                input.setCustomValidity('Допустимое значение точек [0:255]');   
                input.reportValidity();  
                return false;
            }
            
            return true;
        }

        for (let i = 0; i < 4; i++) {
            if (!check(colorCorrectionInputs[i])) {
                return false;
            }
        }
        
        if (parseInt(colorCorrectionInputs[0].value) >= parseInt(colorCorrectionInputs[2].value)) {
            colorCorrectionInputs[2].setCustomValidity('Входное значение второй точки должно быть больше входного значения первой.');
            colorCorrectionInputs[2].reportValidity();  
            return false;
        }

        return true;
    }
