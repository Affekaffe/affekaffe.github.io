const lightRadius = 6;
const chunkSize = 10; //tiles
const mapSize = 30; //tiles
let tileSize = 40;
let game = {};

function gameInit() {
  tileSize = window.innerHeight / (2 * lightRadius); //pixels
  game = {
    lightRadius: lightRadius, 
    tileSize: tileSize, 
    mapSize: mapSize, 
    chunkSize: chunkSize, 
    gameOver: false,
    gameMode: "normal"
  }
}

gameInit();

export {gameInit, game};