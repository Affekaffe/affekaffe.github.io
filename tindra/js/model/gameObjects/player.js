import Vector3D from "../../utils/vector3D.js";
import Entity from "./entity.js";

const _IDLE_STATE = "idle";
const _PLAYER_NAME = "player";

class Player extends Entity {
  
  /**
   * 
   * @param {Vector3D} position 
   * @param {Vector3D} rotation
   */
  constructor(position, rotation) {
    super(_PLAYER_NAME, position, rotation);
    this._state = _IDLE_STATE;
  }

  get key(){
    return super.key + "." + this._state;
  }

  update(){
  }

  static create(x, y, z){
    return new Player(new Vector3D(x, y, z), new Vector3D(0, 0 ,0));
  }
}

export default Player;