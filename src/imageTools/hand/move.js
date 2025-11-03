let canvas = document.getElementById("canvas");
let resizingCon = document.getElementsByClassName("resizing_con")[0];
let main = document.getElementsByClassName("main")[0];
let headerHeight = document.getElementsByClassName("header")[0].offsetHeight;

export default function move() {
    canvas.onmousedown = function(e) {
        let coords = getCoords(canvas, main);
        let shiftX = e.pageX - coords.left;
        let shiftY = e.pageY - coords.top;

        canvas.style.marginLeft = '0px';
		canvas.style.marginTop = '0px';
        canvas.style.position = 'relative';
        
        moveAt(e);

        function moveAt(e) {
            canvas.style.left = e.pageX - shiftX + 'px';
            canvas.style.top = e.pageY - headerHeight - shiftY + 'px';
            
            if (canvas.offsetLeft < 0) {
                canvas.style.left = '0px';
                
                resizingCon.style.width = resizingCon.offsetWidth + 1 + 'px';
                main.scrollTo(main.scrollLeft + 1, main.scrollTop);

            } else if (canvas.offsetLeft > 0 && canvas.getBoundingClientRect().left < 0) {
                canvas.style.left = '0px';
                resizingCon.style.width = resizingCon.offsetWidth - 1 + 'px';
            }

            if (canvas.offsetTop < 0) {
                canvas.style.top = '0px';
                
                resizingCon.style.height = resizingCon.offsetHeight + 1 + 'px';
                main.scrollTo(main.scrollLeft, main.scrollTop + 1);
            } else if (canvas.offsetTop > 0 && canvas.getBoundingClientRect().top - headerHeight < 0) {
                canvas.style.top = '0px';
                resizingCon.style.height = resizingCon.offsetHeight - 1 + 'px';
            }

            coords = getCoords(canvas, main);
            shiftX = e.pageX - coords.left;
            shiftY = e.pageY - coords.top;
        }

        document.onmousemove = function(e) {
            moveAt(e);
        }
        
        document.onmouseup = function() {
            document.onmousemove = null;
            canvas.onmouseup = null;
        }
    }
    
    canvas.ondragstart = function() {
        return false;
    };
    
    function getCoords(elem, con) {
        var box = elem.getBoundingClientRect();
        return {
            top: box.top + con.scrollTop,
            left: box.left + con.scrollLeft,
        };
    }
}
