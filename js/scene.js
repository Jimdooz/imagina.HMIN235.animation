/**
* System where all the system take place
*/

function uniqueID(){
  function chr4(){ return Math.random().toString(16).slice(-4); }
  return chr4() + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + chr4() + chr4();
}


let canvas = document.getElementById('SCENE');
let ctx = canvas.getContext('2d', {alpha: false});
let objectsCanvas = document.getElementById('OBJECTS');

const minArea = 7;

let mouse = { x : 0, y : 0, down : false };

let SCENE = {
  objects : [],
}

let ANIMATION = {
  fps : 60, //Image per seconds
  size : 60,
  play : false,
  timePlayed : 0,
  position : 0,
  keyframe : {

  },
  existKey(id, position, keyName){
    return ANIMATION.keyframe[id] && ANIMATION.keyframe[id][position] && ANIMATION.keyframe[id][position][keyName];
  },
  existCurve(id, position, keyName){
    return ANIMATION.existKey(id, position, keyName) && ANIMATION.keyframe[id][position][keyName].curve;
  },
  setPosition(position, changeTime = true){
    position = position < 0 ? 0 : position > ANIMATION.size - 1 ? ANIMATION.size - 1 : position;
    let posRect = Math.floor(position);
    ANIMATION.position = posRect;
    if(changeTime) ANIMATION.timePlayed = ANIMATION.position;
    else ANIMATION.timePlayed = position;
    TIMELINE.updateGraphics(ANIMATION);
  },
  getCurrentPosition(id, position){
    if(!ANIMATION.keyframe[id]) return SCENE.objects[id].position;
    let result = ANIMATION.getTypeBetween(id, position, "position", SCENE.objects[id].position, SCENE.objects[id].position);
    // console.log(result.start);
    if(ANIMATION.existCurve(id, result.posStart, "position")){
      let curve = ANIMATION.keyframe[id][result.posStart]["position"].curve;
      if(true){
        let p0 = result.start;
        let p1, p2;
        if(ANIMATION.keyframe[id][result.posStart].position.curvePosition){
          p1 = ANIMATION.keyframe[id][result.posStart].position.curvePosition.p1;
          p2 = ANIMATION.keyframe[id][result.posStart].position.curvePosition.p2;
        }else{
          p1 = new Vector2(0,0);
          p2 = new Vector2(0,0);
        }
        let p3 = result.end;
        p1 = addVector(p1, p0);
        p2 = addVector(p2, p3);
        return bezier(bezierInterpolation(0, 1, result.percentage, curve.p1, curve.p2), p0, p1, p2, p3);
      }
      return new Vector2( bezierInterpolation(result.start.x, result.end.x, result.percentage, curve.p1, curve.p2),
                          bezierInterpolation(result.start.y, result.end.y, result.percentage, curve.p1, curve.p2));
    }
    return new Vector2(linearInterpolation(result.start.x, result.end.x, result.percentage), linearInterpolation(result.start.y, result.end.y, result.percentage));
  },
  getCurrentMatrix(id, position){
    if(!ANIMATION.keyframe[id]) return matrixScale(1); //Not found
    let result = ANIMATION.getTypeBetween(id, position, "matrix", matrixScale(1), matrixScale(1));
    if(ANIMATION.existCurve(id, result.posStart, "matrix")){
      let curve = ANIMATION.keyframe[id][result.posStart]["matrix"].curve;
      return bezierAnimation(result.start, result.end, result.percentage, curve);
    }
    return linearAnimation(result.start, result.end, result.percentage);
  },
  getTypeBetween(id, position, type, initA, initB){
    let start = initA;
    let end = initB;
    let startType = ANIMATION.getStartType(id, position, type);
    let endType = ANIMATION.getEndType(id, position, type);
    if(typeof startType.output != "undefined") start = startType.output;
    if(typeof endType.output != "undefined") end = endType.output;
    let posStart = startType.pos;
    let posEnd = endType.pos;
    if(posStart >= posEnd){
      posEnd = posStart;
      end = start;
    }
    let percentage = position == posStart ? 0 : position >= posEnd ? 1 : (position - posStart) / (posEnd - posStart);
    return {
      start,
      end,
      posStart,
      posEnd,
      percentage,
    }
  },
  getStartType(id, position, type){
    let result = { pos : -1 }
    for(let i in ANIMATION.keyframe[id]){
      if(typeof ANIMATION.keyframe[id][i][type] == "undefined") continue;
      i = Number(i);
      if(i <= position && i > result.pos){
        result.pos = i;
        result.output = ANIMATION.keyframe[id][i][type].value;
      }
    }
    if(result.pos == -1) return { pos : 0 };
    return result;
  },
  getEndType(id, position, type){
    let result = { pos : -1 }
    for(let i in ANIMATION.keyframe[id]){
      if(typeof ANIMATION.keyframe[id][i][type] == "undefined") continue;
      i = Number(i);
      if(i > position && (i < result.pos || result.pos == -1)){
        result.pos = i;
        result.output = ANIMATION.keyframe[id][i][type].value;
      }
    }
    if(result.pos == -1) return { pos : 0 };
    return result;
  }
}

class ObjectScene {
  constructor(name, position, drawFunction) {
    this.name = name;
    this.position = position;
    this.draw = drawFunction;
  }
}

/**
 * Represent a Vector 2
 * with x and y
 */
class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function addVector(vec1, vec2){
  return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
}

/**
 * Represent a matrix 2x2
 * [ a b ]
 * [ c d ]
 * a = matrix[0][0]
 * b = matrix[0][1]
 * c = matrix[1][0]
 * d = matrix[1][1]
 */
const Matrix2 = function(a = 0, b = 0, c = 0, d = 0){
  return [[a, b], [c, d]];
}

const Matrix = {
  scalar(matrix, scalar){
    let _a = matrix[0][0] * scalar;
    let _b = matrix[0][1] * scalar;
    let _c = matrix[1][0] * scalar;
    let _d = matrix[1][1] * scalar;
    return Matrix2(_a, _b, _c, _d);
  },
  dotProduct(a, b){
    let _a = a[0][0] * b[0][0] + a[0][1] * b[1][0];
    let _b = a[0][0] * b[0][1] + a[0][1] * b[1][1];
    let _c = a[1][0] * b[0][0] + a[1][1] * b[1][0];
    let _d = a[1][0] * b[0][1] + a[1][1] * b[1][1];
    return Matrix2(_a, _b, _c, _d);
  },
  copy(matrixReference, matrixPaste){
    matrixPaste[0][0] = matrixReference[0][0];
    matrixPaste[0][1] = matrixReference[0][1];
    matrixPaste[1][0] = matrixReference[1][0];
    matrixPaste[1][1] = matrixReference[1][1];
  },
  invert(matrix){
    let a = matrix[0][0];
    let b = matrix[0][1];
    let c = matrix[1][0];
    let d = matrix[1][1];
    return Matrix.scalar(Matrix2(d, -b, -c, a), 1 / ((a*d) - (b*c)));
  }
}

/**
 * Linear transformation
 * take a Vector2 and a Matrix2
 * return a new Vector2
 */
function linearTransformation(vector2, matrix2){
  return new Vector2(vector2.x * matrix2[0][0] + vector2.y * matrix2[0][1], vector2.x * matrix2[1][0] + vector2.y * matrix2[1][1]);
}

/**
 * Apply a linear transformation to a position of the object path graphic
 */
function positionTransformation(obj, matrix2, index){
  let pos = new Vector2(obj.shape[index].x, obj.shape[index].y);
  pos = linearTransformation(pos, matrix2);
  pos.x += obj.position.x;
  pos.y += obj.position.y;
  return pos;
}

/**
 * Linear transition from matrixA to matrixB , with percentage of power
 */
function linearAnimation(matrixA, matrixB, power){
  let linearMatrix = Matrix2();
  linearMatrix[0][0] = linearInterpolation(matrixA[0][0], matrixB[0][0], power);
  linearMatrix[0][1] = linearInterpolation(matrixA[0][1], matrixB[0][1], power);
  linearMatrix[1][0] = linearInterpolation(matrixA[1][0], matrixB[1][0], power);
  linearMatrix[1][1] = linearInterpolation(matrixA[1][1], matrixB[1][1], power);
  return linearMatrix;
}

/**
 * Linear transition from matrixA to matrixB , with percentage of power
 */
function bezierAnimation(matrixA, matrixB, power, curve){
  let linearMatrix = Matrix2();
  linearMatrix[0][0] = bezierInterpolation(matrixA[0][0], matrixB[0][0], power, curve.p1, curve.p2);
  linearMatrix[0][1] = bezierInterpolation(matrixA[0][1], matrixB[0][1], power, curve.p1, curve.p2);
  linearMatrix[1][0] = bezierInterpolation(matrixA[1][0], matrixB[1][0], power, curve.p1, curve.p2);
  linearMatrix[1][1] = bezierInterpolation(matrixA[1][1], matrixB[1][1], power, curve.p1, curve.p2);
  return linearMatrix;
}

/**
 * Basic linear interpolation between 2 value, by power [0,1]
 */
function linearInterpolation(a, b, power){
  return a + (b - a) * power;
}

function bezierInterpolation(a, b, power, p1, p2){
  if(!p2) p2 = p1;
  let p0 = {x: 0, y: 0},
      p3 = {x: 1, y: 1};
  // console.log(p1, p2);
  power = bezier(power, p0, p1, p2, p3).y;
  return linearInterpolation(a, b, power);
}

function bezier(t, p0, p1, p2, p3){
  let cX = 3 * (p1.x - p0.x),
      bX = 3 * (p2.x - p1.x) - cX,
      aX = p3.x - p0.x - cX - bX;

  let cY = 3 * (p1.y - p0.y),
      bY = 3 * (p2.y - p1.y) - cY,
      aY = p3.y - p0.y - cY - bY;

  let x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
  let y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

  return {x: x, y: y};
}

function distancePoint(a, b) {
  return Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)));
}

function matrixRotation(angle){
  return Matrix2(Math.cos(angle), - Math.sin(angle), Math.sin(angle), Math.cos(angle));
}

function matrixScale(scale){
  return Matrix.scalar(Matrix2(1,0,0,1), scale);
}

let mainMatrix = matrixScale(1); //Basic matrix
let rotateMatrix = matrixRotation(0);
let finalMatrix = Matrix.dotProduct(rotateMatrix, mainMatrix);

function draw(Time){
  ctx.canvas.width  = ctx.canvas.offsetWidth;
  ctx.canvas.height = ctx.canvas.offsetHeight;

  //Animation
  if(ANIMATION.play){
    ANIMATION.timePlayed += Time.delta * ANIMATION.fps;
    ANIMATION.setPosition(ANIMATION.timePlayed, false);
    // ANIMATION.position = ANIMATION.timePlayed;
    if(ANIMATION.position >= ANIMATION.size - 1){
      ANIMATION.setPosition(ANIMATION.size - 1);
      ANIMATION.play = false;
    }
  }

  //Reset background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for(let o in SCENE.objects){
    let obj = SCENE.objects[o];
    //Show center
    ctx.beginPath();
    ctx.fillStyle = "#ff0000";
    ctx.arc(obj.position.x, obj.position.y, 2, 0, Math.PI * 2, true);
    ctx.fill();
    //Draw shape

    let calculatedMatrix = ANIMATION.getCurrentMatrix(o, ANIMATION.position);
    EDIT_KEYFRAME_START = null;
    EDIT_KEYFRAME_END = null;
    EDIT_P1 = null;
    EDIT_P2 = null;
    if(o == EDIT_ID){
      finalMatrix = calculatedMatrix;
      let resultPosition = ANIMATION.getTypeBetween(o, ANIMATION.position, "position", SCENE.objects[o].position, SCENE.objects[o].position);
      if(resultPosition.start){

        EDIT_KEYFRAME_START = resultPosition.posStart;
        EDIT_KEYFRAME_END = resultPosition.posEnd;

        ctx.beginPath();
        let p0 = resultPosition.start;
        let p1, p2;
        if(ANIMATION.keyframe[o][resultPosition.posStart].position.curvePosition){
          p1 = ANIMATION.keyframe[o][resultPosition.posStart].position.curvePosition.p1;
          p2 = ANIMATION.keyframe[o][resultPosition.posStart].position.curvePosition.p2;
        }else{
          p1 = new Vector2(0,0);
          p2 = new Vector2(0,0);
        }
        let p3 = resultPosition.end;
        p1 = addVector(p1, p0);
        p2 = addVector(p2, p3);
        EDIT_P1 = p1;
        EDIT_P2 = p2;

        //show Line p1 p0
        ctx.strokeStyle = "rgba(100, 100, 100, 0.5)";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        //show Line p1 p0
        ctx.beginPath();
        ctx.strokeStyle = "rgba(247, 221, 114, 0.8)";
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        //show Line p1 p0
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        //Show P1
        ctx.beginPath();
        ctx.strokeStyle = "rgb(247, 221, 114)";
        ctx.fillStyle = "rgb(247, 221, 114)";
        ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();

        //Show p2
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.setLineDash([4, 2]);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        for (let i=0; i<1; i+= 0.01){
           let p = bezier(i, p0, p1, p2, p3);
           ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        ctx.setLineDash([4, 0]);
      }
      // ctx.moveTo(resultPosition.start.x, resultPosition.start.y);
      // ctx.lineTo(resultPosition.end.x, resultPosition.end.y);
      // ctx.stroke();
    }
    obj.position = ANIMATION.getCurrentPosition(o, ANIMATION.position);


    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if(obj.shape && obj.shape.length > 0){
      let pos = positionTransformation(obj, calculatedMatrix, 0);
      ctx.moveTo(pos.x, pos.y);
      for (let i = 1; i < obj.shape.length; i++) {
        pos = positionTransformation(obj, calculatedMatrix, i);
        ctx.lineTo(pos.x, pos.y);
      }
      if(obj.closeShape) ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba("+ (o == EDIT_ID ? 0 : 255) +","+ (o == EDIT_ID ? 255 : 0) +",0,0.5)";
      ctx.fill();
      for (let i = 0; i < obj.shape.length; i++) {
        let pos = positionTransformation(obj, calculatedMatrix, i);
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2, true);
        ctx.fill();
      }
    }
  }

  if(POS_EDIT !== null){
    let obj = SCENE.objects[EDIT_ID];
    let pos = positionTransformation(obj, finalMatrix, POS_EDIT);
    ctx.beginPath();
    ctx.strokeStyle = distancePoint(mouse, pos) < minArea ? "rgb(100,100,100)" : "#ff0000";
    ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2, true);
    ctx.stroke();
  }
}

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  mouse.x = evt.clientX - rect.left;
  mouse.y = evt.clientY - rect.top;
}

let POS_EDIT = null;

function getNear(){
  //Choose nearPoint
  let obj = SCENE.objects[EDIT_ID];
  let near = null;
  let min = -1;

  for (let i = 0; i < obj.shape.length; i++) {
    let pos = positionTransformation(obj, finalMatrix, i);
    let distance = distancePoint(pos, mouse);
    // console.log(distance);
    if((distance < min || min == -1) && distancePoint(mouse, pos) < minArea){
      min = distance;
      near = i;
    }
  }
  return near;
}

window.addEventListener('keydown', function(e){
  let obj = SCENE.objects[EDIT_ID];
  // console.log(e);
  if(e.code == "ArrowRight"){
    ANIMATION.setPosition(ANIMATION.position + 1);
      ANIMATION.play = false;
  }else if(e.code == "ArrowLeft"){
    ANIMATION.setPosition(ANIMATION.position - 1);
      ANIMATION.play = false;
  }else if(e.code == "Space"){
    ANIMATION.play = !ANIMATION.play;
    if(ANIMATION.position == ANIMATION.size - 1) ANIMATION.setPosition(0);
  } else if(e.code == "Delete"){
    if(POS_EDIT !== null) {
      obj.shape.splice(POS_EDIT, 1);
      POS_EDIT = null;
    }
  }
});

canvas.addEventListener('mousemove', function(evt) {
  let obj = SCENE.objects[EDIT_ID];
  let pos = null;
  if(POS_EDIT !== null) pos = positionTransformation(obj, finalMatrix, POS_EDIT);
  getMousePos(canvas, evt);

  // ANIMATION.position = Math.round(mouse.x / ctx.canvas.width * ANIMATION.size);


  //Edit position bezier curve
  if(EDIT_KEYFRAME_START !== null && EDIT_P1_CURVE || EDIT_P2_CURVE){
    let startKey = ANIMATION.keyframe[EDIT_ID][EDIT_KEYFRAME_START];
    let endKey = ANIMATION.keyframe[EDIT_ID][EDIT_KEYFRAME_END];
    let posStartAnimation = startKey.position.value;
    let posEndAnimation = endKey.position.value;
    if(!startKey.position.curvePosition) startKey.position.curvePosition = { p1 : new Vector2(0,0), p2 : new Vector2(0,0) };
    if(EDIT_P1_CURVE) startKey.position.curvePosition.p1 = new Vector2(mouse.x - posStartAnimation.x, mouse.y- posStartAnimation.y);
    else startKey.position.curvePosition.p2 = new Vector2(mouse.x - posEndAnimation.x, mouse.y - posEndAnimation.y);
  }else{
    if(POS_EDIT !== null){
      let mouseTranspos = linearTransformation(new Vector2(mouse.x - obj.position.x, mouse.y - obj.position.y), Matrix.invert(finalMatrix));
      if(mouse.down) obj.shape[POS_EDIT] = new Vector2(mouseTranspos.x, mouseTranspos.y);
    }else{
      POS_EDIT = getNear();
    }
  }
}, false);

canvas.addEventListener('mousedown', function(evt) {
  let obj = SCENE.objects[EDIT_ID];
  let pos = null;
  mouse.down = true;

  let stop = false;

  POS_EDIT = getNear();
  if(POS_EDIT !== null) pos = positionTransformation(obj, finalMatrix, POS_EDIT);

  if(POS_EDIT !== null && distancePoint(mouse, pos) < minArea){
    // obj.shape[POS_EDIT] = new Vector2(mouse.x - obj.position.x, mouse.y - obj.position.y);
    stop = true;
  }
  if(EDIT_KEYFRAME_START !== null && POS_EDIT === null){
    if(distancePoint(mouse, EDIT_P1) < 8){ EDIT_P1_CURVE = true; stop = true; }
    else if(distancePoint(mouse, EDIT_P2) < 8){ EDIT_P2_CURVE = true; stop = true; }
  }
  if(!stop){
    let mouseTranspos = linearTransformation(new Vector2(mouse.x - obj.position.x, mouse.y - obj.position.y), Matrix.invert(finalMatrix));
    obj.shape.push(new Vector2(mouseTranspos.x, mouseTranspos.y));
    POS_EDIT = obj.shape.length -1;
  }



})

window.addEventListener('mouseup', function(evt) {
  mouse.down = false;
  EDIT_P1_CURVE = false;
  EDIT_P2_CURVE = false;
})

function createObjectScene(position, name){
  let uid = uniqueID();
  SCENE.objects[uid] = {
    position : new Vector2(position.x, position.y),
    shape : [],
    closeShape : true,
    name : name,
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

let EDIT_ID = createObjectScene(new Vector2(200,200), "First Object");
let EDIT_KEYFRAME_START = null;
let EDIT_KEYFRAME_END = null;
let EDIT_P1 = null;
let EDIT_P2 = null;
let EDIT_P1_CURVE = false;
let EDIT_P2_CURVE = false;
ANIMATION.keyframe[EDIT_ID] = {
  0 : {
    // matrix : {
    //   value : matrixScale(1),
    //   // curve : {
    //   //   p1 : {x: 1, y: 0},
    //   //   p2 : {x: 0, y: 1},
    //   // }
    // },
    position : {
      value : new Vector2(200,200),
    }

  },
  // 8 : {
  //   position : {
  //     value : new Vector2(300,300),
  //   }
  // },
  20 : {
    // matrix : {
    //   value : Matrix.dotProduct(matrixScale(3), matrixRotation(45)),
    // },
    position : {
      value : new Vector2(600,600),
    }
  },
  30 : {
    position : {
      value : new Vector2(1200,300),
    }
  }
}

/**
 * RUN MAIN LOOP
 */
let mainLoop = new Loop(draw);
