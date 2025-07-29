import { game } from "./gameConfig.js";
import { getTile } from "./terrain.js";
import { generateChunk } from "./terrain.js";

const mapSize = game.mapSize;
const chunkSize = game.chunkSize;

let checkpoints = [];

function generateRandomCheckpoints(checkpointCount) {
  checkpoints = [];
  const used = new Set();
  while (checkpoints.length < checkpointCount) {
    const x = Math.floor((Math.random() - 0.5) * mapSize);
    const y = Math.floor((Math.random() - 0.5) * mapSize);
    const key = `${x},${y}`;
    if (!used.has(key)) {
      // Ensure chunk is generated
      const cx = Math.floor(x / chunkSize);
      const cy = Math.floor(y / chunkSize);
      generateChunk(cx, cy);

      const tile = getTile(x, y);
      if (tile.impassable) continue; // Avoid invalid tiles

      const minDistance = 6; // in tiles
      let tooClose = false;
      for (const cp of checkpoints) {
        const dx = cp.x - x;
        const dy = cp.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      used.add(key);
      checkpoints.push({ x, y, found: false });
    }
  }
}

function getCheckpoint(number){
  if (checkpoints.length > number) return checkpoints[number];
  return null;
}

function getCheckpoints(){
  return checkpoints
}

function getCheckpointCount(){
  return checkpoints.length;
}



export{generateRandomCheckpoints,
  getCheckpoint,
  getCheckpoints,
  getCheckpointCount
};