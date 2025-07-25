const tileSize = 40; //pixels
const chunkSize = 10; //tiles
const mapSize = 30; //tiles

const speedModifiers = {
  '.': 1.0,
  'T': 0.4,
  '#': 1.5,
  '~': 0.1
};

const impassableTiles = ['X'];
const darkTiles = ['X']; // Only buildings block light fully

const semiDarkTiles = ['T']; // Dense vegetation blocks light 50%

const world = {tileSize: tileSize, chunkSize: chunkSize, mapSize: mapSize}
let terrainChunks = new Map();

function getTile(x, y) {
  const cx = Math.floor(x / chunkSize);
  const cy = Math.floor(y / chunkSize);
  generateChunk(cx, cy);
  const chunk = terrainChunks.get(`${cx},${cy}`);
  const tx = ((x % chunkSize) + chunkSize) % chunkSize;
  const ty = ((y % chunkSize) + chunkSize) % chunkSize;
  return chunk[ty][tx];
}

function generateChunk(cx, cy) {
  const key = `${cx},${cy}`;
  if (terrainChunks.has(key)) return;

  const chunk = [];

  // Step 1: Initialize with mostly trees and ground, no water
  for (let y = 0; y < chunkSize; y++) {
    const row = [];
    for (let x = 0; x < chunkSize; x++) {
      const r = Math.random();
      let tile = '.';
      if (r < 0.05) tile = 'X';      // Building
      else if (r < 0.25) tile = 'T'; // Trees
      else if (r < 0.3) tile = '#';  // Open ground
      row.push(tile);
    }
    chunk.push(row);
  }

  // Step 2: Smoothing to form clusters of trees/buildings
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < chunkSize; y++) {
      for (let x = 0; x < chunkSize; x++) {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < chunkSize && ny < chunkSize) {
              neighbors.push(chunk[ny][nx]);
            }
          }
        }

        const count = (symbol) => neighbors.filter(n => n === symbol).length;

        if (count('T') >= 4 && Math.random() < 0.8) chunk[y][x] = 'T';
        else if (count('X') >= 4 && Math.random() < 0.4) chunk[y][x] = 'X';
      }
    }
  }

  // Step 3: Add a lake (patch of water)
  if (Math.random() < 0.2) {
    const cx = Math.floor(Math.random() * chunkSize);
    const cy = Math.floor(Math.random() * chunkSize);
    const radius = Math.floor(Math.random() * 3) + 2;

    for (let y = 0; y < chunkSize; y++) {
      for (let x = 0; x < chunkSize; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          chunk[y][x] = '~';
        }
      }
    }
  }

  // Step 4: Add a river (single tile width line)
  if (Math.random() < 0.3) {
    const vertical = Math.random() < 0.5;
    let linePos = Math.floor(Math.random() * chunkSize);
    let wiggle = 0;

    for (let i = 0; i < chunkSize; i++) {
      const x = vertical ? linePos + wiggle : i;
      const y = vertical ? i : linePos + wiggle;

      if (x >= 0 && y >= 0 && x < chunkSize && y < chunkSize) {
        chunk[y][x] = '~';
        // Occasionally wiggle the line to make it more natural
        if (Math.random() < 0.4) wiggle += Math.floor(Math.random() * 3) - 1;
        wiggle = Math.max(-2, Math.min(2, wiggle)); // Limit curve
      }
    }
  }

  terrainChunks.set(key, chunk);
}


export {world, 
  generateChunk, 
  getTile, 
  impassableTiles, 
  speedModifiers};