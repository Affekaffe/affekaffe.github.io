import Vector3D from "../../utils/vector3D.js";
import GameObject from "./gameObject.js";

const _ENTITY_TYPE = "entity"

class Entity extends GameObject {
  /**
   * 
   * @param {String} name 
   * @param {Vector3D} position 
   * @param {Vector3D} rotation
   */
  constructor(name, position, rotation) {
    super(_ENTITY_TYPE, position, rotation);
    this._name = name;
  }

  get name(){
    return this._name;
  }

  get key(){
    return super.key + '.' + this.name;
  }
}

export default Entity;