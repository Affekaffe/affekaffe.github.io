import { keys, isTouching, getTouchDistance, getTouchAngle } from './input.js';
import { getTile } from './terrain.js';
import { getCheckpoint, getCheckpointCount } from './checkpoints.js';
import { updateNpcs } from './npcHandler.js';
import { game } from '../config.js';
import Player from './player.js';

let player = null;

let score = 0;
let startTime = null;
let startPosition = {x: 0, y: 0};
let startAngle = 0;

const turnSpeed = 0.05;
const tileSize = game.tileSize;

function playerInit() {
  const playerImagePath = './assets/player.png';

  player = new Player(playerImagePath);
  setStartPosition();
}

function setStartPosition() {
  startPosition = { x: 0, y: 0 };
  startAngle = Math.random() * 6;
  player.setPosition(startPosition.x, startPosition.y);
  player.setAngle(startAngle);
}

function getStartPosition() {
  return startPosition;
}

function turnPlayer(speed){
  player.setAngle(player.angle + speed);
}

function getTileAtPlayer(){
  return getTile(Math.floor(player.x / game.tileSize), Math.floor(player.y / game.tileSize));
}

function update() {
  if (!startTime) startTime = Date.now();
  const currentTime = (Date.now() - startTime) / 1000;

  //Keyboard controls
  if (keys['ArrowLeft']) turnPlayer(-turnSpeed);
  if (keys['ArrowRight']) turnPlayer(turnSpeed);

  // Mobile turning (horizontal axis of touch)
  if (isTouching) {
    // Rotation based on horizontal input only
    const turnStrength = Math.sin(getTouchAngle()); // -1 to 1
    turnPlayer(turnStrength * turnSpeed);
  }

  let currentTile = getTileAtPlayer();
  let speedModifier = 0;

  if (keys['ArrowUp']) {
   // forward=1, backward=-1
    speedModifier = currentTile.speed;
  }
  if (keys['ArrowDown']) {
    speedModifier = -currentTile.speed;
  }
  if (isTouching) {
    const moveStrength = Math.cos(getTouchAngle());
    speedModifier = currentTile.speed * moveStrength * (getTouchDistance() || 1);
  }
  
  const nextCheckpoint = getCheckpoint(score);
  if (nextCheckpoint) increaseIfCheckpointFound(nextCheckpoint);
  

  movePlayerIfPossible(speedModifier);
  updateNpcs();

  game.gameOver = false;

  if (score==getCheckpointCount()) {
    game.gameOver = true;
  }
}

//If impassable, move along edge
function movePlayerIfPossible(speedModifier) {
  player.move(speedModifier, 1, 1);
  if (!getTileAtPlayer().impassable) return;
  
  player.move(speedModifier, -1, 0);
  if (!getTileAtPlayer().impassable) return;
 
  player.move(speedModifier, 1, -1);
  if (!getTileAtPlayer().impassable) return;

  player.move(speedModifier, -1, 0)
}

function increaseIfCheckpointFound(nextCheckpoint) {
  const cx = nextCheckpoint.x * tileSize + tileSize / 2;
  const cy = nextCheckpoint.y * tileSize + tileSize / 2;
  const dist = Math.hypot(player.x - cx, player.y - cy);
  if (dist < tileSize / 2) {
    nextCheckpoint.found = true;
    score++;
  }
}

export {
  playerInit,
  player,
  update,
  getStartPosition,
};

