import TileType from "./tileType.js";

const _GRASS_TILE_NAME = "grass";

class GrassTile extends TileType {
  constructor() {
    super(_GRASS_TILE_NAME);
  }
}

const _GRASS_TILE_INSTANCE = new GrassTile();

export default _GRASS_TILE_INSTANCE;