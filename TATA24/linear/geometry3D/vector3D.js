export class Vector3D {

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }


    clone() {
        return new Vector3D(
            this.x,
            this.y,
            this.z
        );
    }


    add(vector) {
        return new Vector3D(
            this.x + vector.x,
            this.y + vector.y,
            this.z + vector.z
        );
    }


    subtract(vector) {
        return new Vector3D(
            this.x - vector.x,
            this.y - vector.y,
            this.z - vector.z
        );
    }


    multiply(scalar) {
        return new Vector3D(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }


    length() {
        return Math.sqrt(
            this.x ** 2 +
            this.y ** 2 +
            this.z ** 2
        );
    }


    normalized() {

        const length = this.length();

        if (length === 0) {
            return new Vector3D();
        }

        return this.multiply(
            1 / length
        );
    }


    dot(vector) {
        return (
            this.x * vector.x +
            this.y * vector.y +
            this.z * vector.z
        );
    }


    cross(vector) {
        return new Vector3D(

            this.y * vector.z -
            this.z * vector.y,

            this.z * vector.x -
            this.x * vector.z,

            this.x * vector.y -
            this.y * vector.x
        );
    }
}