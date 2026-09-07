import { Vector } from "./vector.js";

export class Line {

    constructor(point, direction) {
        this.point = point;
        this.direction = direction;
    }

    pointAt(t) {
        return this.point.add(
            this.direction.multiply(t)
        );
    }

    intersectionWith(other) {

        const p = this.point;
        const r = this.direction;

        const q = other.point;
        const s = other.direction;

        const cross =
            r.x * s.y -
            r.y * s.x;

        // Parallel lines do not have a unique intersection
        if (Math.abs(cross) < 0.000001) {
            return null;
        }

        const qMinusP =
            q.subtract(p);

        const t =
            (
                qMinusP.x * s.y -
                qMinusP.y * s.x
            ) / cross;

        return this.pointAt(t);
    }

    // Check whether a point lies approximately on the line
    containsPoint(point, tolerance = 0.1) {

        const d = this.direction;

        const cross =
            (point.x - this.point.x) * d.y -
            (point.y - this.point.y) * d.x;

        return Math.abs(cross) < tolerance;
    }

    // Check whether another line represents
        // the same geometric line.
    coincidesWith(other, angleTolerance = 2, distanceTolerance = 0.1) {
        const a = this.direction;
        const b = other.direction;

        const lengthA = a.length();
        const lengthB = b.length();

        if (lengthA === 0 || lengthB === 0) {
            return false;
        }

        // Calculate angle between direction vectors
        const dot =
            (a.x * b.x + a.y * b.y) /
            (lengthA * lengthB);

        // Clamp because of floating-point errors
        const clampedDot = Math.max(-1, Math.min(1, dot));

        const angle = Math.acos(clampedDot) * 180 / Math.PI;

        // Lines are parallel if angle is close to 0° or 180°
        const parallel =
            angle < angleTolerance ||
            Math.abs(angle - 180) < angleTolerance;

        if (!parallel) {
            return false;
        }

        // Still need to check that the lines are actually on top of each other
        return other.containsPoint(this.point, distanceTolerance);
    }
}