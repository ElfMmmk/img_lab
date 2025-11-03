import fillMatrix from "./fillMatrix";
import kernelTurn from "./kernelTurn";

let canvas = document.getElementById("canvas");

let filterOffcanvas = document.getElementById('filter_offcanvas');

let filterButton = document.getElementById("open_filter_offcanvas_button");
let closeFilterOffcanvasButton = document.getElementsByClassName("close_filter_offcanvas_button")[0];
let submitFilterOffcanvasButton = document.getElementById("submit_filter_offcanvas_button");
let resetFilterOffcanvasButton = document.getElementById("reset_filter_offcanvas_button");
let previewCheckbox = document.getElementById("filter_offcanvas_checkbox");
let filterSelect = document.getElementById("filter_select");

let kernel;

export default function filter() {
    const identity = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ];
    
    const sharp = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
    ];

    const gauss = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1],
    ];

    const rectblur = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
    ];
    const prewittX = [
        [-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1],
    ];
    const prewittY = [
        [ 1,  1,  1],
        [ 0,  0,  0],
        [-1, -1, -1],
    ];

    kernel = identity;

    filterSelect.onchange = () => {
        if (filterSelect.value == 'default') { 
            fillMatrix(identity); 
            kernel = identity; 
        }
        if (filterSelect.value == 'sharp') { 
            fillMatrix(sharp); 
            kernel = sharp; 
        }
        if (filterSelect.value == 'gauss') { 
            fillMatrix(gauss);  
            kernel = gauss.map((el) => el.map((e) => e / 16)); 
        }
        if (filterSelect.value == 'rectblur') { 
            fillMatrix(rectblur);
            kernel = rectblur.map((el) => el.map((e) => e / 9)); 
        }
        if (filterSelect.value == 'prewittX') { 
            fillMatrix(prewittX); 
            kernel = prewittX; 
        }
        if (filterSelect.value == 'prewittY') { 
            fillMatrix(prewittY); 
            kernel = prewittY; 
        }

        if (previewCheckbox.checked) {
            kernelTurn(kernel, previewCheckbox.checked);
        }
    };

    closeFilterOffcanvasButton.onclick = () => {
        filterButton.classList.remove('active');
        kernelTurn(kernel, false);
        previewCheckbox.checked = false;
    };
    
    resetFilterOffcanvasButton.onclick = () => {
        kernelTurn(kernel, false);
        kernel = identity;
    };
    
    submitFilterOffcanvasButton.onclick = () => {
        let filterOffcanvasInstance = bootstrap.Offcanvas.getInstance(filterOffcanvas);

        if (filterOffcanvasInstance) {
            filterOffcanvasInstance.hide();
            filterButton.classList.remove('active');
        }

        kernelTurn(kernel);
        kernel = identity;
    };
    
    previewCheckbox.onclick = () => {
        kernelTurn(kernel, previewCheckbox.checked);
    };
    
    filterButton.onclick = () => {
        canvas.onmousedown = () => {};
    };
}
