let canvasTimeline = document.getElementById('TIMELINE');
let ctxTimeline = canvasTimeline.getContext('2d', {alpha : false});

let TIMELINE = {
  updateGraphics : updateGraphics,
  layerObjectSize : 250,
  timeLineSpace : 20,
  dragTime : false,
  scrollPosition : 0,
  keyframesEvent : [],
  actionKeyFrame : null,
  keyFrameSelected : {},
  setKeyFrameSelected: (anim, obj, keyPosition, keyAnim) => {
    TIMELINE.keyFrameSelected = {
      obj,
      keyPosition,
      keyAnim
    }
    //Set callback BEZIERCURVE
    BEZIERCURVE.setUpdateFunction((p1, p2) => {
      let curve = anim.keyframe[obj][keyPosition][keyAnim].curve;
      if(!curve){
        anim.keyframe[obj][keyPosition][keyAnim].curve = {};
        curve = anim.keyframe[obj][keyPosition][keyAnim].curve;
      }
      curve.p1 = p1;
      curve.p2 = p2;
    });

    let curve = anim.keyframe[obj][keyPosition][keyAnim].curve;
    if(curve){ BEZIERCURVE.setCurve(curve.p1, curve.p2); }
    else{
      BEZIERCURVE.setCurve(new Vector2(0,0), new Vector2(1,1));
    }
  }
}

function updateGraphics(anim){
  ctxTimeline.canvas.width  = ctxTimeline.canvas.offsetWidth;
  ctxTimeline.canvas.height = ctxTimeline.canvas.offsetHeight;

  //Reset Values
  TIMELINE.keyframesEvent = [];
  // canvasTimeline.style.height = ctxTimeline.canvas.height + "px";
  let otherPart = ctxTimeline.canvas.width - TIMELINE.layerObjectSize;
  TIMELINE.timeLineSpace = otherPart / (anim.size + 1);

  ctxTimeline.fillStyle = "#424242";
  ctxTimeline.fillRect(0,0,ctxTimeline.canvas.width, ctxTimeline.canvas.height);

  ctxTimeline.beginPath();

  let spaceTop = 30;

  for (let i = 0; i < anim.size; i++) {
    ctxTimeline.strokeStyle = "rgba(43,43,43,"+(i % 10 == 0 ? '1' : '0.5')+")";
    ctxTimeline.lineWidth = 1;
    ctxTimeline.beginPath();
    ctxTimeline.moveTo((i + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize, spaceTop);
    ctxTimeline.lineTo((i + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize, ctxTimeline.canvas.height);
    ctxTimeline.stroke();
  }

  ctxTimeline.lineWidth = 2;
  ctxTimeline.beginPath();
  ctxTimeline.strokeStyle = "#5380c3";
  ctxTimeline.moveTo((anim.timePlayed + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize, spaceTop);
  ctxTimeline.lineTo((anim.timePlayed + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize, ctxTimeline.canvas.height);
  ctxTimeline.stroke();

  let mainPos = 0;
  //Each objects
  for (let o in anim.keyframe) {
    let obj = anim.keyframe[o];
    let maxPos = 1;
    let writeText = false;
    let posKey = {};
    //Each Keys
    for(let key in obj){
      if(countProperties(obj[key]) == 0){
        delete obj[key];
        break;
      }
      //Little system to save the drag keyframe
      let previousKey = null;
      let previousContentKey = null;
      let currKey = key;
      let currContent = obj[key];
      drawKeyFrame(ctxTimeline, (Number(key) + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize, spaceTop + 20 + mainPos * 20 - TIMELINE.scrollPosition, "#fcbf31", 12, (position) => {
        if(previousKey != null){
          obj[previousKey] = previousContentKey;
          if(typeof previousContentKey == "undefined") delete obj[previousKey];
        }
          previousKey = position;
          previousContentKey = obj[position];
        if(position != currKey){
          delete obj[currKey];
        }
        obj[position] = currContent;
        TIMELINE.updateGraphics(anim);
      });
      if(writeText){
        ctxTimeline.fillStyle = "#fff";
        ctxTimeline.fillText((SCENE.objects[o].name + ""), 10, spaceTop + 20 + mainPos * 20 - TIMELINE.scrollPosition);
      }
      let pos = 0;
      //Each keyAnimation ex: position or matrix
      for(let keyAnim in obj[key]){
        pos++;
        let posGet = 1;
        if(posKey[keyAnim]) posGet = posKey[keyAnim];
        else{
          posKey[keyAnim] = countProperties(posKey) + 1;
          posGet = posKey[keyAnim];
        }
        let currContent = obj[key][keyAnim];
        drawKeyFrame(ctxTimeline, (Number(key) + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize, spaceTop + 20 + posGet * 20 + mainPos * 20 - TIMELINE.scrollPosition, "#31fcbc", 12, (position) => {
          if(previousKey != null){
            if(typeof obj[previousKey] == "undefined") obj[previousKey] = {};
            obj[previousKey][keyAnim] = previousContentKey;
            if(typeof previousContentKey == "undefined"){
              delete obj[previousKey][keyAnim];
              if(countProperties(obj[previousKey]) == 0){
                delete obj[previousKey];
              }
            }
          }

          previousKey = position;
          previousContentKey = typeof obj[position] == "undefined" ? undefined : obj[position][keyAnim];

          if(position != currKey && obj[currKey]){
            delete obj[currKey][keyAnim];
          }
          if(typeof obj[position] == "undefined") obj[position] = {};
          obj[position][keyAnim] = currContent;
          TIMELINE.updateGraphics(anim);
        }, () => { TIMELINE.setKeyFrameSelected(anim, o, key, keyAnim); });
        if(writeText){
          ctxTimeline.fillStyle = "#fff";
          ctxTimeline.fillText((keyAnim + ""), 20, spaceTop + 20 + posGet*20 + mainPos * 20 - TIMELINE.scrollPosition);
        }
      }
      if(pos > maxPos) maxPos = pos;
      writeText = true;
    }
    mainPos += maxPos + 1;
  }

  ctxTimeline.fillStyle = "#2b2b2b";
  ctxTimeline.fillRect(TIMELINE.layerObjectSize,0,ctxTimeline.canvas.width, spaceTop);
  // ctxTimeline.fillRect(0,0,TIMELINE.layerObjectSize, ctxTimeline.canvas.height);

  ctxTimeline.fillStyle = "#5380c3";
  rectArrondi(ctxTimeline, (anim.timePlayed + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize - 20, spaceTop / 6, 40,spaceTop / 1.5,4);

  for (let i = 0; i < anim.size; i++) {
    if(i % 10 == 0 || i == anim.timePlayed){
      ctxTimeline.font = "10px Arial";
      ctxTimeline.fillStyle = "#fff";
      ctxTimeline.fillText(i, (i + 1) * TIMELINE.timeLineSpace + TIMELINE.layerObjectSize - (Math.round(Math.log(i == 0 ? 1 : i) + 1) * 1.5), spaceTop / 2 + 3);
    }
  }
}

canvasTimeline.addEventListener('mousemove', function(e) {
  getMousePos(canvasTimeline, e);
  if(TIMELINE.dragTime) drageTimePosition();
  if(TIMELINE.actionKeyFrame){
    TIMELINE.actionKeyFrame(Math.round(getPercentageTime()));
  }
}, false);

canvasTimeline.addEventListener('mousedown', function(e) {
  getMousePos(canvasTimeline, e);
  let foundKeyFrame = false;
  for(let i = 0; i < TIMELINE.keyframesEvent.length; i++){
    if(TIMELINE.keyframesEvent[i].test()){
      TIMELINE.actionKeyFrame = TIMELINE.keyframesEvent[i].action;
      foundKeyFrame = true;
      TIMELINE.keyframesEvent[i].actionClick();
      break;
    }
  }
  if(!foundKeyFrame){
    TIMELINE.dragTime = true;
    if(TIMELINE.dragTime) drageTimePosition();
  }
});

canvasTimeline.addEventListener('mousewheel', function(e) {
  TIMELINE.scrollPosition += e.deltaY / 8;
  if(TIMELINE.scrollPosition < 0) TIMELINE.scrollPosition = 0;
  updateGraphics(ANIMATION);
}, {passive : true});

window.addEventListener('mouseup', function(e) {
  getMousePos(canvasTimeline, e);
  TIMELINE.dragTime = false;
  TIMELINE.actionKeyFrame = null;
});

function getPercentageTime(){
  let p = (mouse.x - TIMELINE.layerObjectSize - TIMELINE.timeLineSpace) / (ctxTimeline.canvas.width - TIMELINE.layerObjectSize) * (ANIMATION.size + 1);
  return p <= 0 ? 0 : p > ANIMATION.size - 1 ? ANIMATION.size - 1 : p;
}

function drageTimePosition(){
  ANIMATION.setPosition(getPercentageTime(), false);
}

function drawKeyFrame(ctx, x, y, color = "#fcbf31", size = 12, onDrag = () => {}, onClick = () => {}){
  ctx.beginPath();
  ctx.moveTo(x, y - size/2);
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x, y + size / 2);
  ctx.lineTo(x - size / 2, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();

  TIMELINE.keyframesEvent.push({
    test : () => { return distancePoint(mouse, new Vector2(x, y)) < size / 2; },
    action : onDrag,
    actionClick : onClick,
  })
}

function rectArrondi(ctx, x, y, largeur, hauteur, rayon) {
  ctx.beginPath();
  ctx.moveTo(x, y + rayon);
  ctx.lineTo(x, y + hauteur - rayon);
  ctx.quadraticCurveTo(x, y + hauteur, x + rayon, y + hauteur);
  ctx.lineTo(x + largeur - rayon, y + hauteur);
  ctx.quadraticCurveTo(x + largeur, y + hauteur, x + largeur, y + hauteur - rayon);
  ctx.lineTo(x + largeur, y + rayon);
  ctx.quadraticCurveTo(x + largeur, y, x + largeur - rayon, y);
  ctx.lineTo(x + rayon,y);
  ctx.quadraticCurveTo(x, y, x, y + rayon);
  ctx.fill();
}

function countProperties(obj) {
    return Object.keys(obj).length;
}

TIMELINE.updateGraphics(ANIMATION);
