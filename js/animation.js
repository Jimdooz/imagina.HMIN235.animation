/**
 * Apply a linear transformation to a position of the object path graphic
 */
function positionTransformation(obj, matrix2, index) {
    let pos = new Vector2(obj.shape[index].x, obj.shape[index].y);
    pos = linearTransformation(pos, matrix2);
    pos.x += obj.position.x;
    pos.y += obj.position.y;
    return pos;
}

let ANIMATION = {
    fps: 25, //Image per seconds
    size: 60,
    play: false,
    timePlayed: 0, //Actual Time ms
    currentFrame: 0, //Actual frame
    keyframe: {}, //All keyframes

    existKey(objId, frame, keyName) {
        return ANIMATION.keyframe[objId] && ANIMATION.keyframe[objId][frame] && ANIMATION.keyframe[objId][frame][keyName];
    },

    existCurve(objId, frame, keyName) {
        return ANIMATION.existKey(objId, frame, keyName) && ANIMATION.keyframe[objId][frame][keyName].curve;
    },

    setFrame(frame, changeTime = true) {
        frame = frame < 0 ? 0 : frame > ANIMATION.size - 1 ? ANIMATION.size - 1 : frame;
        let posRect = Math.floor(frame);
        ANIMATION.currentFrame = posRect;
        if (changeTime) ANIMATION.timePlayed = ANIMATION.currentFrame;
        else ANIMATION.timePlayed = frame;
        TIMELINE.updateGraphics(ANIMATION);
    },

    getCurrentPosition(id, frame) {
        if (!ANIMATION.keyframe[id]) return SCENE.objects[id].position;
        let result = ANIMATION.getTypeBetween(id, frame, "position", SCENE.objects[id].position, SCENE.objects[id].position);
        // console.log(result.start);
        if (ANIMATION.existCurve(id, result.frameStart, "position")) {
            let curve = ANIMATION.keyframe[id][result.frameStart]["position"].curve;
            let p0 = result.start;
            let p1, p2;
            if (ANIMATION.keyframe[id][result.frameStart].position.curvePosition) {
                p1 = ANIMATION.keyframe[id][result.frameStart].position.curvePosition.p1;
                p2 = ANIMATION.keyframe[id][result.frameStart].position.curvePosition.p2;
            } else {
                p1 = new Vector2(0, 0);
                p2 = new Vector2(0, 0);
            }
            let p3 = result.end;
            p1 = addVector(p1, p0);
            p2 = addVector(p2, p3);
            return bezier(bezierInterpolation(0, 1, result.percentage, curve.p1, curve.p2), p0, p1, p2, p3);
        }
        return new Vector2(linearInterpolation(result.start.x, result.end.x, result.percentage), linearInterpolation(result.start.y, result.end.y, result.percentage));
    },

    getCurrentMatrix(id, frame) {
        if (!ANIMATION.keyframe[id]) return matrixScale(1); //Not found
        let result = ANIMATION.getTypeBetween(id, frame, "matrix", matrixScale(1), matrixScale(1));
        if (ANIMATION.existCurve(id, result.frameStart, "matrix")) {
            let curve = ANIMATION.keyframe[id][result.frameStart]["matrix"].curve;
            return bezierInterpolationMatrix(result.start, result.end, result.percentage, curve);
        }
        return linearInterpolationMatrix(result.start, result.end, result.percentage);
    },
    getCurrentColor(id, frame) {
        if (!ANIMATION.keyframe[id]) return SCENE.objects[id].color; //Not found
        let result = ANIMATION.getTypeBetween(id, frame, "color", SCENE.objects[id].color, SCENE.objects[id].color);
        if (ANIMATION.existCurve(id, result.frameStart, "color")) {
            let curve = ANIMATION.keyframe[id][result.frameStart]["matrix"].curve;
            return new Color(
                bezierInterpolation(result.start.r, result.end.r, result.percentage, curve.p1, curve.p2),
                bezierInterpolation(result.start.g, result.end.g, result.percentage, curve.p1, curve.p2),
                bezierInterpolation(result.start.b, result.end.b, result.percentage, curve.p1, curve.p2),
                bezierInterpolation(result.start.a, result.end.a, result.percentage, curve.p1, curve.p2)
            );
        }
        return new Color(
            linearInterpolation(result.start.r, result.end.r, result.percentage),
            linearInterpolation(result.start.g, result.end.g, result.percentage),
            linearInterpolation(result.start.b, result.end.b, result.percentage),
            linearInterpolation(result.start.a, result.end.a, result.percentage)
        );
    },

    getTypeBetween(id, frame, type, initA, initB) {
        let start = initA;
        let end = initB;
        let startType = ANIMATION.getStartType(id, frame, type);
        let endType = ANIMATION.getEndType(id, frame, type);
        if (typeof startType.output != "undefined") start = startType.output;
        if (typeof endType.output != "undefined") end = endType.output;
        let frameStart = startType.frame;
        let frameEnd = endType.frame;
        if (frameStart >= frameEnd) {
            frameEnd = frameStart;
            end = start;
        }
        let percentage = frame == frameStart ? 0 : frame >= frameEnd ? 1 : (frame - frameStart) / (frameEnd - frameStart);
        return {
            start,
            end,
            frameStart,
            frameEnd,
            percentage,
        }
    },

    getStartType(id, frame, type) {
        let result = { frame: -1 }
        for (let i in ANIMATION.keyframe[id]) {
            if (typeof ANIMATION.keyframe[id][i][type] == "undefined") continue;
            i = Number(i);
            if (i <= frame && i > result.frame) {
                result.frame = i;
                result.output = ANIMATION.keyframe[id][i][type].value;
            }
        }
        if (result.frame == -1) return { frame: 0 };
        return result;
    },

    getEndType(id, frame, type) {
        let result = { frame: -1 }
        for (let i in ANIMATION.keyframe[id]) {
            if (typeof ANIMATION.keyframe[id][i][type] == "undefined") continue;
            i = Number(i);
            if (i > frame && (i < result.frame || result.frame == -1)) {
                result.frame = i;
                result.output = ANIMATION.keyframe[id][i][type].value;
            }
        }
        if (result.frame == -1) return { frame: 0 };
        return result;
    }
}

class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}