/**
 * System where all the system take place
 */

/**
 * Generate unique ID
 */
function uniqueID() {
    function chr4() { return Math.random().toString(16).slice(-4); }
    return chr4() + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + chr4() + chr4();
}

let canvas = document.getElementById('SCENE');
let ctx = canvas.getContext('2d', { alpha: false });
let objectsCanvas = document.getElementById('OBJECTS');

//Distance point drag
const minArea = 7;

/*********************************************************/
/* MOUSE                                                 */
/*********************************************************/
let MOUSE = { x: 0, y: 0, screenX :0, screenY : 0, down: false };

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    MOUSE.screenX = evt.clientX - rect.left;
    MOUSE.screenY = evt.clientY - rect.top;
    MOUSE.x = MOUSE.screenX - SCENE.position.x;
    MOUSE.y = MOUSE.screenY - SCENE.position.y;
}

let SCENE = {
    objects: [],
    position : new Vector2(0,0),
    EDIT_ID : 0, //Represente l'object courrament selectionné
    SHAPE_EDIT : null, //Represente le point selectionné de la forme courrament selectionné
    selectedOptions : {
      EDIT_KEYFRAME_START : null, //Represente la position de la keyframe précédente
      EDIT_KEYFRAME_END : null, //Represente la position de la keyfram suivante
      bezierPosition : { //Represente les différents points de la courbe de Bézier dans l'espace
        p0 : null,
        p1 : null,
        p2 : null,
        p3 : null,
      },
      matrix : { //Represente la matrix appliqué visuellement sur l'object selectionné
        mainMatrix : matrixScale(1),
        rotateMatrix : matrixRotation(0),
        currentMatrix : Matrix.dotProduct(matrixRotation(0), matrixScale(1)),
      }
    },
    resetSelectedOptions(){
      SCENE.selectedOptions.EDIT_KEYFRAME_START = null;
      SCENE.selectedOptions.EDIT_KEYFRAME_END = null;
      SCENE.selectedOptions.bezierPosition = { p0 : null, p1 : null, p2 : null, p3 : null, };
      SCENE.selectedOptions.matrix = { mainMatrix : matrixScale(1), rotateMatrix : matrixRotation(0), currentMatrix : Matrix.dotProduct(matrixRotation(0), matrixScale(1)) };
    }
}

function draw(Time) {
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    //Animation
    if (ANIMATION.play) {
        ANIMATION.timePlayed += Time.delta * ANIMATION.fps;
        ANIMATION.setFrame(ANIMATION.timePlayed, false);
        // ANIMATION.currentFrame = ANIMATION.timePlayed;
        if (ANIMATION.currentFrame >= ANIMATION.size - 1) {
            ANIMATION.setFrame(ANIMATION.size - 1);
            ANIMATION.play = false;
        }
    }

    //Reset background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let objId in SCENE.objects) {
        let obj = SCENE.objects[objId];
        //Show center
        ctx.beginPath();
        ctx.fillStyle = "#ff0000";
        arc(obj.position.x, obj.position.y, 2, 0, Math.PI * 2, true);
        ctx.fill();
        //Draw shape

        let calculatedMatrix = ANIMATION.getCurrentMatrix(objId, ANIMATION.currentFrame);
        // SCENE.selectedOptions.EDIT_KEYFRAME_START = null;
        // SCENE.selectedOptions.EDIT_KEYFRAME_END = null;
        // SCENE.selectedOptions.bezierPosition.p0 = null;
        // SCENE.selectedOptions.bezierPosition.p3 = null;

         if (objId == SCENE.EDIT_ID && EDIT_MODE == "trajectory") {
            SCENE.selectedOptions.matrix.currentMatrix = calculatedMatrix;
            let resultPosition = ANIMATION.getTypeBetween(objId, ANIMATION.currentFrame, "position", SCENE.objects[objId].position, SCENE.objects[objId].position);
            if (resultPosition.start !== null) {
                SCENE.selectedOptions.EDIT_KEYFRAME_START = resultPosition.frameStart;
                SCENE.selectedOptions.EDIT_KEYFRAME_END = resultPosition.frameEnd;
                console.log("YUSS", SCENE.selectedOptions.EDIT_KEYFRAME_START);

                ctx.beginPath();
                let p0 = resultPosition.start;
                let p1, p2;
                if (ANIMATION.keyframe[objId][resultPosition.frameStart].position.curvePosition) {
                    p1 = ANIMATION.keyframe[objId][resultPosition.frameStart].position.curvePosition.p1;
                    p2 = ANIMATION.keyframe[objId][resultPosition.frameStart].position.curvePosition.p2;
                } else {
                    p1 = new Vector2(0, 0);
                    p2 = new Vector2(0, 0);
                }
                let p3 = resultPosition.end;
                p1 = addVector(p1, p0);
                p2 = addVector(p2, p3);
                SCENE.selectedOptions.bezierPosition.p0 = p1;
                SCENE.selectedOptions.bezierPosition.p3 = p2;

                //show Line p1 p0
                ctx.strokeStyle = "rgba(100, 100, 100, 0.5)";
                ctx.beginPath();
                moveTo(p0.x, p0.y);
                lineTo(p3.x, p3.y);
                ctx.stroke();

                //show Line p1 p0
                ctx.beginPath();
                ctx.strokeStyle = "rgba(247, 221, 114, 0.8)";
                moveTo(p0.x, p0.y);
                lineTo(p1.x, p1.y);
                ctx.stroke();

                //show Line p1 p0
                ctx.beginPath();
                moveTo(p2.x, p2.y);
                lineTo(p3.x, p3.y);
                ctx.stroke();

                //Show P1
                ctx.beginPath();
                ctx.strokeStyle = "rgb(247, 221, 114)";
                ctx.fillStyle = "rgb(247, 221, 114)";
                arc(p1.x, p1.y, 4, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();

                //Show p2
                ctx.beginPath();
                arc(p2.x, p2.y, 4, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = "rgba(255, 255, 255, 1)";
                ctx.setLineDash([4, 2]);

                ctx.beginPath();
                moveTo(p0.x, p0.y);
                for (let i = 0; i < 1; i += 0.01) {
                    let p = bezier(i, p0, p1, p2, p3);
                    lineTo(p.x, p.y);
                }
                ctx.stroke();

                ctx.setLineDash([4, 0]);
            }
            // ctx.moveTo(resultPosition.start.x, resultPosition.start.y);
            // ctx.lineTo(resultPosition.end.x, resultPosition.end.y);
            // ctx.stroke();
        }
        obj.position = ANIMATION.getCurrentPosition(objId, ANIMATION.currentFrame);
        obj.color = ANIMATION.getCurrentColor(objId, ANIMATION.currentFrame);

        //OBJECT DRAW
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        let borderPos = new MinMaxVector2();
        if (obj.shape && obj.shape.length > 0) {
            let pos = positionTransformation(obj, calculatedMatrix, 0);
            borderPos.addValue(new Vector2(pos.rel_x, pos.rel_y));
            moveTo(pos.x, pos.y);
            for (let i = 1; i < obj.shape.length; i++) {
                pos = positionTransformation(obj, calculatedMatrix, i);
                borderPos.addValue(new Vector2(pos.rel_x, pos.rel_y));
                lineTo(pos.x, pos.y);
            }
            if (obj.closeShape) ctx.closePath();
            ctx.stroke();
            let color = ANIMATION.getCurrentPosition
            ctx.fillStyle = "rgba(" + obj.color.r + "," + obj.color.g + "," + obj.color.b + "," + obj.color.a + ")";
            ctx.fill();
            //Draw points
            for (let i = 0; i < obj.shape.length; i++) {
                let pos = positionTransformation(obj, calculatedMatrix, i);
                ctx.beginPath();
                ctx.fillStyle = "#fff";
                arc(pos.x, pos.y, 2, 0, Math.PI * 2, true);
                ctx.fill();
            }
            //Show box
            if (objId == SCENE.EDIT_ID){
              ctx.beginPath();
              moveTo(borderPos.minPos.x + obj.position.x, borderPos.minPos.y + obj.position.y);
              lineTo(borderPos.maxPos.x + obj.position.x, borderPos.minPos.y + obj.position.y);
              lineTo(borderPos.maxPos.x + obj.position.x, borderPos.maxPos.y + obj.position.y);
              lineTo(borderPos.minPos.x + obj.position.x, borderPos.maxPos.y + obj.position.y);
              ctx.closePath();
              ctx.strokeStyle = "#5380c3";
              ctx.fillStyle = "#5380c3";
              ctx.setLineDash([5, 5]);
              ctx.stroke();
              ctx.setLineDash([4, 0]);
              ctx.beginPath();arc(borderPos.minPos.x + obj.position.x, borderPos.minPos.y + obj.position.y, 5, 0, Math.PI * 2, true); ctx.fill();
              ctx.beginPath();arc(borderPos.maxPos.x + obj.position.x, borderPos.minPos.y + obj.position.y, 5, 0, Math.PI * 2, true); ctx.fill();
              ctx.beginPath();arc(borderPos.maxPos.x + obj.position.x, borderPos.maxPos.y + obj.position.y, 5, 0, Math.PI * 2, true); ctx.fill();
              ctx.beginPath();arc(borderPos.minPos.x + obj.position.x, borderPos.maxPos.y + obj.position.y, 5, 0, Math.PI * 2, true); ctx.fill();
            }
        }
    }

    if (SCENE.SHAPE_EDIT !== null) {
        let obj = SCENE.objects[SCENE.EDIT_ID];
        let pos = positionTransformation(obj, SCENE.selectedOptions.matrix.currentMatrix, SCENE.SHAPE_EDIT);
        ctx.beginPath();
        ctx.strokeStyle = distancePoint(MOUSE, pos) < minArea ? "rgb(100,100,100)" : "#ff0000";
        arc(pos.x, pos.y, 3, 0, Math.PI * 2, true);
        ctx.stroke();
    }
}

function moveTo(x, y){
  ctx.moveTo(x + SCENE.position.x, y + SCENE.position.y);
}

function lineTo(x, y){
  ctx.lineTo(x + SCENE.position.x, y + SCENE.position.y);
}

function arc(x, y, ...datas){
  ctx.arc(x + SCENE.position.x, y + SCENE.position.y, ...datas);
}

/**
 * Retourn le point le plus proche de l'élément courrament selectionné
 */
function getNear() {
    //Choose nearPoint
    let obj = SCENE.objects[SCENE.EDIT_ID];
    let near = null;
    let min = -1;

    for (let i = 0; i < obj.shape.length; i++) {
        let pos = positionTransformation(obj, SCENE.selectedOptions.matrix.currentMatrix, i);
        let distance = distancePoint(pos, MOUSE);
        // console.log(distance);
        if ((distance < min || min == -1) && distancePoint(MOUSE, pos) < minArea) {
            min = distance;
            near = i;
        }
    }
    return near;
}

window.addEventListener('keydown', function(e) {
    let obj = SCENE.objects[SCENE.EDIT_ID];
    // console.log(e);
    if (e.code == "ArrowRight") {
        ANIMATION.setFrame(ANIMATION.currentFrame + 1);
        ANIMATION.play = false;
    } else if (e.code == "ArrowLeft") {
        ANIMATION.setFrame(ANIMATION.currentFrame - 1);
        ANIMATION.play = false;
    } else if (e.code == "Space") {
        ANIMATION.play = !ANIMATION.play;
        if (ANIMATION.currentFrame == ANIMATION.size - 1) ANIMATION.setFrame(0);
    } else if (e.code == "Delete") {
        if (SCENE.SHAPE_EDIT !== null) {
            obj.shape.splice(SCENE.SHAPE_EDIT, 1);
            SCENE.SHAPE_EDIT = null;
        }
    }
});

canvas.addEventListener('mousemove', function(evt) {
    let obj = SCENE.objects[SCENE.EDIT_ID];
    let pos = null;
    if (SCENE.SHAPE_EDIT !== null) pos = positionTransformation(obj, SCENE.selectedOptions.matrix.currentMatrix, SCENE.SHAPE_EDIT);
    getMousePos(canvas, evt);

    // ANIMATION.currentFrame = Math.round(MOUSE.x / ctx.canvas.width * ANIMATION.size);


    if(evt.buttons == 0 || evt.buttons == 1){
      console.log(SCENE.selectedOptions.EDIT_KEYFRAME_START, SCENE.selectedOptions.bezierPosition.p1, SCENE.selectedOptions.bezierPosition.p2);
      //Edit position bezier curve
      if(EDIT_MODE == "move" && MOUSE.down) moveTool();
      else if (SCENE.selectedOptions.EDIT_KEYFRAME_START !== null && SCENE.selectedOptions.bezierPosition.p1 || SCENE.selectedOptions.bezierPosition.p2 && EDIT_MODE == "trajectory") {
          let startKey = ANIMATION.keyframe[SCENE.EDIT_ID][SCENE.selectedOptions.EDIT_KEYFRAME_START];
          let endKey = ANIMATION.keyframe[SCENE.EDIT_ID][SCENE.selectedOptions.EDIT_KEYFRAME_END];
          let frameStartAnimation = startKey.position.value;
          let posEndAnimation = endKey.position.value;
          if (!startKey.position.curvePosition) startKey.position.curvePosition = { p1: new Vector2(0, 0), p2: new Vector2(0, 0) };
          if (SCENE.selectedOptions.bezierPosition.p1) startKey.position.curvePosition.p1 = new Vector2(MOUSE.x - frameStartAnimation.x, MOUSE.y - frameStartAnimation.y);
          else startKey.position.curvePosition.p2 = new Vector2(MOUSE.x - posEndAnimation.x, MOUSE.y - posEndAnimation.y);
      } else if(EDIT_MODE == "edit") {
          if (SCENE.SHAPE_EDIT !== null) {
              let mouseTranspos = linearTransformation(new Vector2(MOUSE.x - obj.position.x, MOUSE.y - obj.position.y), Matrix.invert(SCENE.selectedOptions.matrix.currentMatrix));
              if (MOUSE.down) obj.shape[SCENE.SHAPE_EDIT] = new Vector2(mouseTranspos.x, mouseTranspos.y);
          } else {
              SCENE.SHAPE_EDIT = getNear();
          }
      }
    }else if(evt.buttons == 4){
      SCENE.position.x = SCENE.lastMovePosition.x + MOUSE.screenX;
      SCENE.position.y = SCENE.lastMovePosition.y + MOUSE.screenY;
    }
}, false);

canvas.addEventListener('mousedown', function(evt) {
    getMousePos(canvas, evt); //On récupère la position de la souris
    MOUSE.down = true; //On active le fait que la souris appuie

    //On veux effectuer une action
    if(evt.button == 0){
      let obj = SCENE.objects[SCENE.EDIT_ID];
      if(EDIT_MODE == "move") moveTool();
      else if(EDIT_MODE == "scale ") scaleTool();
      else if(EDIT_MODE == "rotate ") rotateTool();
      else if(EDIT_MODE == "edit") editTool();
      else if(EDIT_MODE == "trajectory") trajectoryTool();
    }
    //On se déplace dans l'espace
    else if(evt.button == 1){
      SCENE.lastMovePosition = new Vector2(SCENE.position.x - MOUSE.screenX, SCENE.position.y - MOUSE.screenY);
    }
})

function moveTool(){
  ANIMATION.setValue(SCENE.EDIT_ID, ANIMATION.currentFrame, "position", new Vector2(MOUSE.x, MOUSE.y));
  if(!ANIMATION.keyframe[SCENE.EDIT_ID][ANIMATION.currentFrame]) ANIMATION.keyframe[SCENE.EDIT_ID][ANIMATION.currentFrame] = {};
  ANIMATION.keyframe[SCENE.EDIT_ID][ANIMATION.currentFrame].position = {
      value: new Vector2(MOUSE.x, MOUSE.y),
  };
}

function scaleTool(){

}

function rotateTool(){

}

function editTool(){
  let obj = SCENE.objects[SCENE.EDIT_ID];
  SCENE.SHAPE_EDIT = getNear();

  if (SCENE.SHAPE_EDIT !== null){
    let positionCornerSelected = positionTransformation(obj, SCENE.selectedOptions.matrix.currentMatrix, SCENE.SHAPE_EDIT);
  }else{
    addNewCornerShape(MOUSE);
  }
}

function trajectoryTool(){
  console.log(">>", SCENE.selectedOptions.EDIT_KEYFRAME_START);
  if (SCENE.selectedOptions.EDIT_KEYFRAME_START !== null) {
      console.log(new Vector2(MOUSE.x, MOUSE.y, SCENE.selectedOptions.bezierPosition.p0, SCENE.selectedOptions.bezierPosition.p3));
      if (distancePoint(MOUSE, SCENE.selectedOptions.bezierPosition.p0) < 8) {
          SCENE.selectedOptions.bezierPosition.p1 = true;
      } else if (distancePoint(MOUSE, SCENE.selectedOptions.bezierPosition.p3) < 8) {
          SCENE.selectedOptions.bezierPosition.p2 = true;
      }
  }
}

function addNewCornerShape(point){
  let obj = SCENE.objects[SCENE.EDIT_ID];
  if(obj){
    let mouseTranspos = linearTransformation(new Vector2(point.x - obj.position.x, point.y - obj.position.y), Matrix.invert(SCENE.selectedOptions.matrix.currentMatrix));
    obj.shape.push(new Vector2(mouseTranspos.x, mouseTranspos.y));
    SCENE.SHAPE_EDIT = obj.shape.length - 1;
  }
}

window.addEventListener('mouseup', function(evt) {
    MOUSE.down = false;
    SCENE.selectedOptions.bezierPosition.p1 = false;
    SCENE.selectedOptions.bezierPosition.p2 = false;
})

function createObjectScene(position, name, color) {
    let uid = uniqueID();
    SCENE.objects[uid] = {
        position: new Vector2(position.x, position.y),
        shape: [],
        closeShape: true,
        name: name,
        color: color,
    };

    let objectElement = document.createElement("div");
    objectElement.className = "font-min -padALL btn";
    objectElement.innerHTML = uid;
    objectElement.addEventListener("click", () => {
        SCENE.EDIT_ID = uid;
        SCENE.SHAPE_EDIT = null;
        SCENE.resetSelectedOptions();
        // delete SCENE.objects[uid];
        // objectsCanvas.removeChild(objectElement);
    })
    objectsCanvas.appendChild(objectElement);
    return uid;
}

let obj1 = createObjectScene(new Vector2(300, 300), "First Object", new Color(0, 255, 0, 0.5));
SCENE.objects[obj1].shape.push(new Vector2(50, -50));
SCENE.objects[obj1].shape.push(new Vector2(-50, -50));
SCENE.objects[obj1].shape.push(new Vector2(-50, 50));
SCENE.objects[obj1].shape.push(new Vector2(50, 50));

SCENE.EDIT_ID = createObjectScene(new Vector2(200, 200), "First Object", new Color(0, 255, 0, 0.5));
SCENE.objects[SCENE.EDIT_ID].shape.push(new Vector2(27, -44));
SCENE.objects[SCENE.EDIT_ID].shape.push(new Vector2(-55, 13));
SCENE.objects[SCENE.EDIT_ID].shape.push(new Vector2(-5, 58));
SCENE.objects[SCENE.EDIT_ID].shape.push(new Vector2(70, 7));

/*
SCENE.objects = {
"UNIQUE_ID_OBJECT" : {
position,
name,
...
}
}

keyframe = {
"UNIQUE_ID_OBJECT" : {
17 : {
position,
// matrix,
}
}
}
*/

ANIMATION.keyframe[SCENE.EDIT_ID] = {
    0: {
        matrix: {
            value: matrixScale(1),
            // curve : {
            //   p1 : {x: 1, y: 0},
            //   p2 : {x: 0, y: 1},
            // }
        },
        position: {
            value: new Vector2(200, 200),
        },
        color: {
            value: new Color(0, 0, 0, 0.5)
        }

    },
    // 8 : {
    //   position : {
    //     value : new Vector2(300,300),
    //   }
    // },
    20: {
        matrix: {
            value: Matrix.dotProduct(matrixScale(3), matrixRotation(45)),
        },
        position: {
            value: new Vector2(400, 400),
        },
        color: {
            value: new Color(255, 255, 255, 1)
        }
    },
    30: {
        position: {
            value: new Vector2(1200, 300),
        },
    }
}

/**
 * RUN MAIN LOOP
 */
let mainLoop = new Loop(draw);
