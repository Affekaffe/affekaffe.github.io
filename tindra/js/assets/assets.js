
class Asset { //COPIED
  constructor(properties = {}) {
    for (const [category, value] of Object.entries(properties)) {
      if (category in defaultMetadata) {
        this[category] = this._normalizeCategory(value, defaultMetadata[category]);
      } else {
        this[category] = value;
      }
    }
  }

  _normalizeCategory(value, defaults) {
    // Deep copy of defaults
    const normalized = JSON.parse(JSON.stringify(defaults));

    if (typeof value === "string") {
      normalized.path = value;
    } else if (typeof value === "object" && value !== null) {
      this._deepMerge(normalized, value);
    }

    return normalized;
  }

  _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        typeof target[key] === "object" &&
        target[key] !== null
      ) {
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

/**
 * Defaults for each allowed metadata
 */
const defaultMetadata = {
  texture: {
    path: "assets/assetNotFound.png",
    offset: {x:0, y:0},
    scale: 1,
  },
}

function asset(p){
  return new Asset(p);
}

/**
 * Metadata for each asset
 * 
 * The keys should match the return value of the key() method in each object
 * 
 * If the value is not an object, but a primitive, it will be assumed to be
 * referencing the *first key* of the corresponding category in the defaultMetadata
 */
const assetMetadata = {
  entity: {
    player: {
      idle: asset({ texture: "assets/entity/player/idle/player.png"}),
    },
    npc: {
      bergman: asset({ texture: "assets/entity/npcs/bergman.png" }),
    },
  },
  tile: {
    grass: asset({ texture: "assets/tiles/open1.png" }),
    water: asset({ texture: "assets/tiles/water1.png" }),
    tree: asset({
      texture: {
        path: "assets/tiles/tree1.png",
        offset: { x: 0, y: -64 },
      },
    }),
    building: asset({ texture: "assets/tiles/building1.png" }),
    base: asset({ texture: "assets/tiles/base1.png" }),
    ground: asset({ texture: "assets/tiles/ground1.png" }),
  },
};


export {assetMetadata, defaultMetadata};