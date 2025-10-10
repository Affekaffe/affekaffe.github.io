class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y)
  }

  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y)
  }

  subtract(other) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(c) {
    return new Vector2(this.x * c, this.y * c)
  }

  dot(other) {
    return this.x * other.x + this.y * other.y
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    const l = this.length()
    return new Vector2(this.x / l, this.y / l)
  }

  lerp(other, t) {
    return this.add(other.subtract(this).scale(t))
  }

  toArray() {
    return [this.x, this.y]
  }

  static fromArray(array) {
    return new Vector2(array[0], array[1])
  }
}

export default Vector2