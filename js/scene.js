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
}

let mainMatrix = matrixScale(1); //Basic matrix
let rotateMatrix = matrixRotation(0);
let finalMatrix = Matrix.dotProduct(rotateMatrix, mainMatrix);

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
        EDIT_KEYFRAME_START = null;
        EDIT_KEYFRAME_END = null;
        EDIT_P1 = null;
        EDIT_P2 = null;
        if (objId == EDIT_ID) {
            finalMatrix = calculatedMatrix;
            let resultPosition = ANIMATION.getTypeBetween(objId, ANIMATION.currentFrame, "position", SCENE.objects[objId].position, SCENE.objects[objId].position);
            if (resultPosition.start) {

                EDIT_KEYFRAME_START = resultPosition.frameStart;
                EDIT_KEYFRAME_END = resultPosition.frameEnd;

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
                EDIT_P1 = p1;
                EDIT_P2 = p2;

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
        if (obj.shape && obj.shape.length > 0) {
            let pos = positionTransformation(obj, calculatedMatrix, 0);
            moveTo(pos.x, pos.y);
            for (let i = 1; i < obj.shape.length; i++) {
                pos = positionTransformation(obj, calculatedMatrix, i);
                lineTo(pos.x, pos.y);
            }
            if (obj.closeShape) ctx.closePath();
            ctx.stroke();
            let color = ANIMATION.getCurrentPosition
            ctx.fillStyle = "rgba(" + obj.color.a + "," + obj.color.g + "," + obj.color.b + "," + obj.color.a + ")";
            ctx.fill();
            for (let i = 0; i < obj.shape.length; i++) {
                let pos = positionTransformation(obj, calculatedMatrix, i);
                ctx.beginPath();
                ctx.fillStyle = "#fff";
                arc(pos.x, pos.y, 2, 0, Math.PI * 2, true);
                ctx.fill();
            }
        }
    }

    if (POS_EDIT !== null) {
        let obj = SCENE.objects[EDIT_ID];
        let pos = positionTransformation(obj, finalMatrix, POS_EDIT);
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
  ctx.arc(x + SCENE.position.x, y + SCENE.position.y, 2, 0, Math.PI * 2, true);
}

let POS_EDIT = null;

function getNear() {
    //Choose nearPoint
    let obj = SCENE.objects[EDIT_ID];
    let near = null;
    let min = -1;

    for (let i = 0; i < obj.shape.length; i++) {
        let pos = positionTransformation(obj, finalMatrix, i);
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
    let obj = SCENE.objects[EDIT_ID];
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
        if (POS_EDIT !== null) {
            obj.shape.splice(POS_EDIT, 1);
            POS_EDIT = null;
        }
    }
});

canvas.addEventListener('mousemove', function(evt) {
    let obj = SCENE.objects[EDIT_ID];
    let pos = null;
    if (POS_EDIT !== null) pos = positionTransformation(obj, finalMatrix, POS_EDIT);
    getMousePos(canvas, evt);

    // ANIMATION.currentFrame = Math.round(MOUSE.x / ctx.canvas.width * ANIMATION.size);


    if(evt.buttons == 0 || evt.buttons == 1){
      //Edit position bezier curve
      if (EDIT_KEYFRAME_START !== null && EDIT_P1_CURVE || EDIT_P2_CURVE) {
          let startKey = ANIMATION.keyframe[EDIT_ID][EDIT_KEYFRAME_START];
          let endKey = ANIMATION.keyframe[EDIT_ID][EDIT_KEYFRAME_END];
          let frameStartAnimation = startKey.position.value;
          let posEndAnimation = endKey.position.value;
          if (!startKey.position.curvePosition) startKey.position.curvePosition = { p1: new Vector2(0, 0), p2: new Vector2(0, 0) };
          if (EDIT_P1_CURVE) startKey.position.curvePosition.p1 = new Vector2(MOUSE.x - frameStartAnimation.x, MOUSE.y - frameStartAnimation.y);
          else startKey.position.curvePosition.p2 = new Vector2(MOUSE.x - posEndAnimation.x, MOUSE.y - posEndAnimation.y);
      } else {
          if (POS_EDIT !== null) {
              let mouseTranspos = linearTransformation(new Vector2(MOUSE.x - obj.position.x, MOUSE.y - obj.position.y), Matrix.invert(finalMatrix));
              if (MOUSE.down) obj.shape[POS_EDIT] = new Vector2(mouseTranspos.x, mouseTranspos.y);
          } else {
              POS_EDIT = getNear();
          }
      }
    }else if(evt.buttons == 4){
      SCENE.position.x = SCENE.lastMovePosition.x + MOUSE.screenX;
      SCENE.position.y = SCENE.lastMovePosition.y + MOUSE.screenY;
    }
}, false);

canvas.addEventListener('mousedown', function(evt) {
    getMousePos(canvas, evt);
    if(evt.button == 0){
      let obj = SCENE.objects[EDIT_ID];
      let pos = null;
      MOUSE.down = true;

      let stop = false;

      POS_EDIT = getNear();
      if (POS_EDIT !== null) pos = positionTransformation(obj, finalMatrix, POS_EDIT);

      if (POS_EDIT !== null && distancePoint(MOUSE, pos) < minArea) {
          // obj.shape[POS_EDIT] = new Vector2(MOUSE.x - obj.position.x, MOUSE.y - obj.position.y);
          stop = true;
      }
      if (EDIT_KEYFRAME_START !== null && POS_EDIT === null) {
          if (distancePoint(MOUSE, EDIT_P1) < 8) {
              EDIT_P1_CURVE = true;
              stop = true;
          } else if (distancePoint(MOUSE, EDIT_P2) < 8) {
              EDIT_P2_CURVE = true;
              stop = true;
          }
      }
      if (!stop) {
          let mouseTranspos = linearTransformation(new Vector2(MOUSE.x - obj.position.x, MOUSE.y - obj.position.y), Matrix.invert(finalMatrix));
          obj.shape.push(new Vector2(mouseTranspos.x, mouseTranspos.y));
          POS_EDIT = obj.shape.length - 1;
      }
    }else if(evt.button == 1){
      SCENE.lastMovePosition = new Vector2(SCENE.position.x - MOUSE.screenX, SCENE.position.y - MOUSE.screenY);
    }
})

window.addEventListener('mouseup', function(evt) {
    MOUSE.down = false;
    EDIT_P1_CURVE = false;
    EDIT_P2_CURVE = false;
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
        EDIT_ID = uid;
        POS_EDIT = null;
        // delete SCENE.objects[uid];
        // objectsCanvas.removeChild(objectElement);
    })
    objectsCanvas.appendChild(objectElement);
    return uid;
}

let EDIT_KEYFRAME_START = null;
let EDIT_KEYFRAME_END = null;
let EDIT_P1 = null;
let EDIT_P2 = null;
let EDIT_P1_CURVE = false;
let EDIT_P2_CURVE = false;

let EDIT_ID = createObjectScene(new Vector2(200, 200), "First Object", new Color(0, 255, 0, 0.5));
SCENE.objects[EDIT_ID].shape.push(new Vector2(27, -44));
SCENE.objects[EDIT_ID].shape.push(new Vector2(-55, 13));
SCENE.objects[EDIT_ID].shape.push(new Vector2(-5, 58));
SCENE.objects[EDIT_ID].shape.push(new Vector2(70, 7));

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

ANIMATION.keyframe[EDIT_ID] = {
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
            value: new Vector2(600, 600),
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
