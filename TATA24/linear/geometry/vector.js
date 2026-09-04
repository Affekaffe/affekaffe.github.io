export class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalized() {
        const length = this.length();

        if (length === 0) {
            return new Vector(0, 0);
        }

        return new Vector(
            this.x / length,
            this.y / length
        );
    }

    multiply(scalar) {
        return new Vector(
            this.x * scalar,
            this.y * scalar
        );
    }

    add(vector) {
        return new Vector(
            this.x + vector.x,
            this.y + vector.y
        );
    }

    subtract(vector) {
        return new Vector(
            this.x - vector.x,
            this.y - vector.y
        );
    }
}