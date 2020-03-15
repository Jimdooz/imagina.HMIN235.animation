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