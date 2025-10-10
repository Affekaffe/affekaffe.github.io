import Vector2 from "./vector2.js"

class Matrix2 {
  constructor(a = 1, b = 0, c = 0, d = 1) {
    this.a = a; // first row
    this.b = b; // first row
    this.c = c; // second row
    this.d = d; // second row
  }

  col1() { return new Vector2(this.a, this.c); }
  col2() { return new Vector2(this.b, this.d); }
  row1() { return new Vector2(this.a, this.b); }
  row2() { return new Vector2(this.c, this.d); }

  matmul(other) {
    // Matrix2 * Vector2
    if (other instanceof Vector2) {
      const x = this.row1().dot(other);
      const y = this.row2().dot(other);
      return new Vector2(x, y);
    }

    // Matrix2 * Matrix2
    if (other instanceof Matrix2) {
      const a = this.row1().dot(other.col1());
      const b = this.row1().dot(other.col2());
      const c = this.row2().dot(other.col1());
      const d = this.row2().dot(other.col2());
      return new Matrix2(a, b, c, d);
    }

    throw new TypeError("Matrix2.matmul: argument must be Matrix2 or Vector2");
  }

  add(other) {
    return new Matrix2(this.a + other.a, this.b + other.b, this.c + other.c, this.d + other.d)
  }

  subtract(other) {
    return new Matrix2(this.a - other.a, this.b - other.b, this.c - other.c, this.d - other.d);
  }

  scale(z) {
    return new Matrix2(this.a * z, this.b * z, this.c * z, this.d * z)
  }

  T(){
    return new Matrix2(this.a, this.c, this.b, this.d)
  }

  det(){
    return this.a * this.d - this.b * this.c
  }

  clone() {
    return new Matrix2(this.a, this.b, this.c, this.d);
  }

  toArray() {
    return [[this.a, this.b], [this.c, this.d]];
  }

  lerp(other, t) {
    return this.add(other.subtract(this).scale(t))
  }

  inv(){
    return new Matrix2(this.d, -this.b, -this.c, this.a).scale(1/(this.det()))
  }

  isInf() {
    return (
      !isFinite(this.a) ||
      !isFinite(this.b) ||
      !isFinite(this.c) ||
      !isFinite(this.d)
    );
  }

  static identity(){
    return new Matrix2(1, 0, 0, 1)
  }
}

export default Matrix2