class Vector3D {

  static get X() { return new Vector3D(1, 0, 0) }
  static get Y() { return new Vector3D(0, 1, 0) }
  static get Z() { return new Vector3D(0, 0, 1) }
  static get X_PI() { return new Vector3D(Math.PI, 0, 0) }
  static get Y_PI() { return new Vector3D(0, Math.PI, 0) }
  static get Z_PI() { return new Vector3D(0, 0, Math.PI) }


  /**
   * A Vector3D holds an x, y and z coordinate
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  constructor(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
  }

  get z() {
    return this._z;
  }

  set z(value) {
    this._z = value;
  }

  /**
   * Sets the coordinates of this Vector3D to that of another Vector3D
   * or Object with x, y and z properties
   * @param {{x: number, y: number, z: number} | Vector3D} other 
   * @returns this
   */
  setTo(other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  /**
   * Floor every coordinate
   * @returns this
   */
  floor() {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.z = Math.floor(z);
    return this;
  }

  /**
   * Add the coordinates of another Vector3D (or Object with x, y and z properties) to this Vector3D
   * @param {{x: number, y: number, z: number} | Vector3D} other 
   */
  add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  scale(c) {
    this.x *= c;
    this.y *= c;
    this.z *= c;
    return this;
  }

  /**
   * 
   * @param {Vector3D} other 
   */
  copy() {
    return new Vector3D(this.x, this.y, this.z);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * Create a new Vector3D with the same coordinates as another Vector3D
   * or Object with numeric x, y and z properties.
   * @param {{x: number, y: number, z: number} | Vector3D} other 
   * @returns {Vector3D} A new Vector3D with the copied coordinates
   */
  static clone(other) {
    return new Vector3D(other.x, other.y, other.z);
  }

  /**
   * Create a new Vector3D with the sum of the coordinates of two other instances of Vector3D
   * or Object with numeric x, y and z properties
   * @param {{x: number, y: number, z: number} | Vector3D} v1 
   * @param {{x: number, y: number, z: number} | Vector3D} v2 
   * @returns {Vector3D} A new Vector3D whose coordinates are the sum of v1 and v2
   */
  static sum(v1, v2) {
    return Vector3D.clone(v1).add(v2);
  }


  /**
   * Create a new Vector3D at the origin
   * @returns Vector3D(0, 0, 0)
   */
  static zero() {
    return new Vector3D(0, 0, 0);
  }
}

export default Vector3D;