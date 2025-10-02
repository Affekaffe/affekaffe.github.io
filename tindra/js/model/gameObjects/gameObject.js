import Vector3D from "../../utils/vector3D.js";


class GameObject {
  /**
   * 
   * @param {String} type 
   * @param {Vector3D} position 
   * @param {Vector3D} rotation
   */
  constructor(type, position, rotation) {
    this._type = type;
    this._position = Vector3D.clone(position);
    this._rotation = Vector3D.clone(rotation);
  }

  get position(){
    return this._position;
  }

  set position(point){
    this._position = point;
  }

  get rotation(){
    return this._rotation;
  }

  set rotation(vector){
    this._rotation = vector;
  }

  get type(){
    return this._type;
  }

  get key(){
    return this._type;
  }

  //Implemented for each concrete subclass
  update(dTime){
    console.warn(`Update method of ${typeof(this)} is empty`);
  }
}

export default GameObject;