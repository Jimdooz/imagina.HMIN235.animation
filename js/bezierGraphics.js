let canvasBezier = document.getElementById('BEZIERCURVE');
let ctxBezier = canvasBezier.getContext('2d', {alpha : false});

let BEZIERCURVE = {
  p1 : new Vector2(0, ctxBezier.canvas.offsetHeight),
  p2 : new Vector2(ctxBezier.canvas.offsetWidth, 0),
  getCurveCallback : null,
  setUpdateFunction(callback){
    BEZIERCURVE.getCurveCallback = callback;
  },
  setCurve(p1, p2){
    let w = ctxBezier.canvas.width;
    let h = ctxBezier.canvas.height;
    BEZIERCURVE.p1 = new Vector2(p1.x * w, (1 - p1.y) * h);
    BEZIERCURVE.p2 = new Vector2(p2.x * w, (1 - p2.y) * h);
    BEZIERCURVE.showCurve();
  },
  getCurve(){
    let w = ctxBezier.canvas.width;
    let h = ctxBezier.canvas.height;
    let p1 = new Vector2(BEZIERCURVE.p1.x / w, 1 - BEZIERCURVE.p1.y / h);
    let p2 = new Vector2(BEZIERCURVE.p2.x / w, 1 - BEZIERCURVE.p2.y / h);
    if(BEZIERCURVE.getCurveCallback) BEZIERCURVE.getCurveCallback(p1, p2);
  },
  showCurve(){
    ctxBezier.canvas.width  = ctxBezier.canvas.offsetWidth;
    ctxBezier.canvas.height = ctxBezier.canvas.offsetHeight;
    let w = ctxBezier.canvas.width;
    let h = ctxBezier.canvas.height;

    ctxBezier.fillStyle = "#424242";
    ctxBezier.fillRect(0,0,w,h);

    ctxBezier.strokeStyle = "#fff";

    let accuracy = 0.005,
      p0 = {x: 0, y: h},
      p1 = BEZIERCURVE.p1,
      p2 = BEZIERCURVE.p2,
      p3 = {x: w, y: 0};

    //show Line p1 p0
    ctxBezier.strokeStyle = "rgba(100, 100, 100, 0.5)";
    ctxBezier.beginPath();
    ctxBezier.moveTo(p0.x, p0.y);
    ctxBezier.lineTo(p3.x, p3.y);
    ctxBezier.stroke();

    //show Line p1 p0
    ctxBezier.beginPath();
    ctxBezier.strokeStyle = "rgba(247, 221, 114, 0.8)";
    ctxBezier.moveTo(p0.x, p0.y);
    ctxBezier.lineTo(p1.x, p1.y);
    ctxBezier.stroke();

    //show Line p1 p0
    ctxBezier.beginPath();
    ctxBezier.moveTo(p2.x, p2.y);
    ctxBezier.lineTo(p3.x, p3.y);
    ctxBezier.stroke();

    //Show P1
    ctxBezier.beginPath();
    ctxBezier.strokeStyle = "rgb(247, 221, 114)";
    ctxBezier.fillStyle = "rgb(247, 221, 114)";
    ctxBezier.arc(p1.x, p1.y, 4, 0, Math.PI * 2, true);
    ctxBezier.fill();
    ctxBezier.stroke();

    //Show p2
    ctxBezier.beginPath();
    ctxBezier.arc(p2.x, p2.y, 4, 0, Math.PI * 2, true);
    ctxBezier.fill();
    ctxBezier.stroke();

    //Draw curve
    ctxBezier.strokeStyle = "rgba(255,255,255,1)";
    ctxBezier.moveTo(p0.x, p0.y);


    //P0 -> Init point

    for (let i=0; i<1; i+=accuracy){
       let p = bezier(i, p0, p1, p2, p3);

       //Show P1
       // ctxBezier.beginPath();
       // ctxBezier.strokeStyle = "rgb(247, 221, 114)";
       // ctxBezier.fillStyle = "rgb(247, 221, 114)";
       // ctxBezier.arc(p.x, p.y, 4, 0, Math.PI * 2, true);
       // ctxBezier.fill();
       // ctxBezier.stroke();

       ctxBezier.lineTo(p.x, p.y);
    }
    ctxBezier.stroke();
    BEZIERCURVE.getCurve();
  }
}

window.addEventListener('mousemove', function(e) {
  if(BEZIERCURVE.p1_edit || BEZIERCURVE.p2_edit) getMousePos(canvasBezier, e);
  if(BEZIERCURVE.p1_edit){
    let x = MOUSE.x < 0 ? 0 : MOUSE.x > ctxBezier.canvas.width ? ctxBezier.canvas.width : MOUSE.x;
    let y = MOUSE.y < 0 ? 0 : MOUSE.y > ctxBezier.canvas.height ? ctxBezier.canvas.height : MOUSE.y;
    BEZIERCURVE.p1 = new Vector2(x, MOUSE.y);
    BEZIERCURVE.showCurve();
  }else if(BEZIERCURVE.p2_edit){
    let x = MOUSE.x < 0 ? 0 : MOUSE.x > ctxBezier.canvas.width ? ctxBezier.canvas.width : MOUSE.x;
    let y = MOUSE.y < 0 ? 0 : MOUSE.y > ctxBezier.canvas.height ? ctxBezier.canvas.height : MOUSE.y;
    BEZIERCURVE.p2 = new Vector2(x, MOUSE.y);
    BEZIERCURVE.showCurve();
  }
}, false);

canvasBezier.addEventListener('mousedown', function(e) {
  getMousePos(canvasBezier, e);
  if(distancePoint(MOUSE, BEZIERCURVE.p1) < distancePoint(MOUSE, BEZIERCURVE.p2)) BEZIERCURVE.p1_edit = true;
  else BEZIERCURVE.p2_edit = true;
});

window.addEventListener('mouseup', function(e) {
  getMousePos(canvasBezier, e);
  BEZIERCURVE.p1_edit = false;
  BEZIERCURVE.p2_edit = false;
});

BEZIERCURVE.showCurve();
