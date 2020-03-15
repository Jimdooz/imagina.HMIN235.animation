/**
* All functions that treat about matrix, Vector, Bezier curve etc...
*/

/*********************************************************/
/* VECTORS                                               */
/*********************************************************/

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

function distancePoint(a, b) {
  return Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)));
}

class MinMaxVector2 {
  constructor() {
    this.minPos = new Vector2(Number.MAX_SAFE_INTEGER , Number.MAX_SAFE_INTEGER);
    this.maxPos = new Vector2(0 , 0);
  }

  addValue(vec2){
    if(vec2.x < this.minPos.x) minPos.x = vec2.x;
    if(vec2.y < this.minPos.y) minPos.y = vec2.y;

    if(vec2.x > this.maxPos.x) maxPos.x = vec2.x;
    if(vec2.y > this.maxPos.y) maxPos.y = vec2.y;
  }
}


/*********************************************************/
/* MATRIXS                                               */
/*********************************************************/

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

function matrixRotation(angle){
  return Matrix2(Math.cos(angle), - Math.sin(angle), Math.sin(angle), Math.cos(angle));
}

function matrixScale(scale){
  return Matrix.scalar(Matrix2(1,0,0,1), scale);
}

/*********************************************************/
/* BEZIER                                        */
/*********************************************************/


function bezier(t, p0, p1, p2, p3){
  let cX = 3 * (p1.x - p0.x),
  bX = 3 * (p2.x - p1.x) - cX,
  aX = p3.x - p0.x - cX - bX;

  let cY = 3 * (p1.y - p0.y),
  bY = 3 * (p2.y - p1.y) - cY,
  aY = p3.y - p0.y - cY - bY;

  let x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
  let y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

  return { x, y };
}

/*********************************************************/
/* TRANSFORMATIONS                                       */
/*********************************************************/

/**
* Linear transformation
* take a Vector2 and a Matrix2
* return a new Vector2
*/
function linearTransformation(vector2, matrix2){
  return new Vector2(vector2.x * matrix2[0][0] + vector2.y * matrix2[0][1], vector2.x * matrix2[1][0] + vector2.y * matrix2[1][1]);
}


/*********************************************************/
/* INTERPOLATIONS                                        */
/*********************************************************/

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

  if(power === 1 || power === 0) return linearInterpolation(a, b, power);

  //Get the bezier function x near power
  for(let i = 0; i < 1; i += 0.01){
    let r = bezier(i, p0, p1, p2, p3);
    if(r.x >= power){
      power = r.y;
      break;
    }
  }

  return linearInterpolation(a, b, power);
}


/*********************************************************/
/* MATIX INTERPOLATIONS                                  */
/*********************************************************/

/**
 * Linear transition from matrixA to matrixB , with percentage of power
 */
function linearInterpolationMatrix(matrixA, matrixB, power){
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
function bezierInterpolationMatrix(matrixA, matrixB, power, curve){
  let linearMatrix = Matrix2();
  linearMatrix[0][0] = bezierInterpolation(matrixA[0][0], matrixB[0][0], power, curve.p1, curve.p2);
  linearMatrix[0][1] = bezierInterpolation(matrixA[0][1], matrixB[0][1], power, curve.p1, curve.p2);
  linearMatrix[1][0] = bezierInterpolation(matrixA[1][0], matrixB[1][0], power, curve.p1, curve.p2);
  linearMatrix[1][1] = bezierInterpolation(matrixA[1][1], matrixB[1][1], power, curve.p1, curve.p2);
  return linearMatrix;
}
