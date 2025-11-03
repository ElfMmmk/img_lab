export default function changeInsetButtonStyle() {
    let parent = document.querySelector('.header');
    let button = parent.querySelectorAll('.tool_button');

    parent.addEventListener('click', (event) => {
        let target = event.target;
        
        if (target.classList.contains('active')) {
            target.classList.remove('active');
            return;
        }

        if (target.classList.contains('tool_button')) {
            for(let i = 0; i < button.length; i++) {
                button[i].classList.remove('active');
            }

            target.classList.add('active');
        }
    });
}
