import Vector3D from "../../utils/vector3D.js";
import GameObject from "./gameObject.js";
import TileType from "./tileType/tileType.js";

const _TILE_INSTANCE_TYPE = "tile";

class TileInstance extends GameObject{

  static _centerPosition = Vector3D.zero();

  /**
   * A TileInstance holds a TileType, and are distributed around a center of position at runtime
   * The position of a TileInstance is determined relative to the center of position, such as the player. 
   * @param {number} relativeX 
   * @param {number} relativeZ 
   * @param {TileType} tileType
   */
  constructor(relativeX, relativeZ, tileType) {
    super(_TILE_INSTANCE_TYPE, Vector3D.zero(), Vector3D.X_PI.scale(0.5));
    this._relativeX = relativeX;
    this._relativeZ = relativeZ;
    this._tileType = tileType;
    this.update();
  }

  get tileType(){
    return this._tileType;
  }

  get key(){
    return super.key + '.' + this.tileType.name;
  }

  update(){
    this.position = Vector3D.sum(TileInstance.centerPosition, {x: this._relativeX, y: 0, z: this._relativeZ});
  }

  /**
   * Getter of the center position of the TileInstance rendering
   */
  static get centerPosition(){
    return TileInstance._centerPosition;
  }

  /**
   * Setter of the center position of the TileInstance rendering
   * @param {Vector3D} newPosition
   */
  static set centerPosition(newPosition){
    TileInstance._centerPosition.setTo(newPosition).floor();
    TileInstance._centerPosition.y = 0;
  }

  static create(xOffset, zOffset, tileType){
    return new TileInstance(xOffset, zOffset, tileType);
  }
}

export default TileInstance;