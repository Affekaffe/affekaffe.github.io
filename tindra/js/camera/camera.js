import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import Vector3D from "../utils/vector3D.js";

class Camera {
  constructor(position, rotation) {
    this._position = position;
    this._rotation = rotation;
    this._snappedObject = null;
    this._positionOffset = Vector3D.zero();
    this._rotationOffset = Vector3D.zero();
  }

  get position() {
    return this._position.add(this._positionOffset);
  }

  get rotation() {
    return this._rotation.add(this._rotationOffset);
  }

  set positionOffset(offset) { this._positionOffset = offset; }
  set rotationOffset(offset) { this._rotationOffset = offset; }

  snapToObject(gameObject) { this._snappedObject = gameObject; }

  transformToObject(gameObject) {
    this._position.setTo(gameObject.position);
    this._rotation.setTo(gameObject.rotation);
  }

  resetOffset() {
    this.rotationOffset = Vector3D.zero();
    this.positionOffset = Vector3D.zero();
  }

  update() {
    if (this._snappedObject) this.transformToObject(this._snappedObject);
    this._rotationOffset.add({x: 0, y: 0.01, z: 0})
  }

  getViewMatrix() {
      const view = mat4.create();

      mat4.rotateY(view, view, -this.rotation.y); // yaw
      mat4.rotateX(view, view, -this.rotation.x); // pitch
      mat4.rotateZ(view, view, -this.rotation.z); // roll

      mat4.translate(view, view, [-this.position.x, -this.position.y, -this.position.z]);

      return view;
  }


  getProjectionMatrix(fovDeg, aspect, near, far) {
    const proj = mat4.create();
    mat4.perspective(proj, fovDeg * Math.PI / 180, aspect, near, far);
    return proj;
  }

  static create() {
    return new Camera(Vector3D.zero(), Vector3D.zero());
  }
}

export default Camera;
