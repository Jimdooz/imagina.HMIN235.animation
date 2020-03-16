let EDIT_MODE = "move";

//modes :
// move : deplacement de l'objet 
// scale : scale de l'objet
// rotate : tourne l'objet
// edit : modifie l'objet pour ajouter des points ou déplacer des points
// trajectory : modifie la courbe de la trajectoire de l'objet

document.getElementById("move").addEventListener("click", onclickIcon);

document.getElementById("scale").addEventListener("click", onclickIcon);

document.getElementById("rotate").addEventListener("click", onclickIcon);

document.getElementById("edit").addEventListener("click", onclickIcon);

document.getElementById("trajectory").addEventListener("click", onclickIcon);

function onclickIcon(e) {
    EDIT_MODE = this.id;
    let others = document.getElementsByClassName("edit-btn");
    for (o of others) {
        o.classList.remove("-dark-logo");
        o.classList.add("-clear-logo");
    }
    this.classList.remove("-clear-logo");
    this.classList.add("-dark-logo");
}
const picker = new iro.ColorPicker('#picker', {
    width: 160,
    color: "rgb(255, 0, 0)",
    borderWidth: 1,
    borderColor: "#fff",
    layout: [{
            component: iro.ui.Box,
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'hue'
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'alpha'
            }
        }
    ]
});
const picker2 = Pickr.create({
    el: '.pickr',
    theme: 'classic',

    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            hsva: true,
            cmyk: true,
            input: true,
            clear: true,
            save: true
        }
    }
});