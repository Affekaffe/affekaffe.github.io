import Camera from "../camera/camera.js";
import GrassTile from "../model/gameObjects/tileType/grassTile.js";
import TileType from "../model/gameObjects/tileType/tileType.js";
import RenderHandler from "../rendering/renderHandler.js";
import Vector3D from "../utils/vector3D.js";
import DefaultConfig from "./config.js";
import GameWorld from "./gameWorld.js";

const _CANVAS = document.getElementById('game');

class Game {

  /**
   * A Game holds a GameWorld and controls the model updates and render updates.
   * This is where the main game loop is located.
   * @param {Map} config 
   */
  constructor(config = {}) {
    this._config = { ...DefaultConfig, ...config };
  }

  async init() {
    this._gameOver = false;
    this._world = GameWorld.create();
    this._camera = Camera.create();
    this._renderer = RenderHandler.createGLRenderHandler(_CANVAS);
    this.start();
  }

  start() {
    this._gameOver = false;
    let player = this._world.createPlayer(0, 0, 0);
    this._camera.snapToObject(player);
    this._camera.positionOffset = new Vector3D(0, 0.3, -1);
    this._camera.rotationOffset = Vector3D.Y_PI;

    for (let i = -10; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
        this._world.createTileInstance(i, j, GrassTile);
      }
    }

    this.loop();
  }

  async loop() {
    if (this._gameOver) {
      this.end();
      return;
    }

    this._update();
    await this._render();

    requestAnimationFrame(() => this.loop());
  }

  end() {

  }

  _update() {
    this._world.updateAllObjectsInWorld();
    this._camera.update();
  }

  async _render() {
    await this._renderer.renderFrame(this._world.objects, this._camera);
  }
}

export default Game;