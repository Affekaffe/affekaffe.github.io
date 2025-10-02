import Player from "../model/gameObjects/player.js";
import TileInstance from "../model/gameObjects/tileInstance.js";

class GameWorld {
  /**
   * A GameWorld instantiates and contains all the GameObjects in a game
   */
  constructor() {
    this._objects = [];
  }


  /**
   * 
   * @param {GameObject} gameObject 
   */
  createPlayer(x, y, z){
    let player = Player.create(x, y, z);
    this._objects.push(player);
    return player;
  }

  createTileInstance(xOffset, zOffset, tileType){
    let tileInstance = TileInstance.create(xOffset, zOffset, tileType);
    this._objects.push(tileInstance);
    return tileInstance;
  }

  clearWorld(){
    this._objects = [];
  }
  
  updateAllObjectsInWorld(){
    this._objects.forEach(gameObject => {
      gameObject.update();
    });
  }
  
  static create(){
    return new GameWorld();
  }

  get objects(){
    return this._objects;
  }
}

export default GameWorld;