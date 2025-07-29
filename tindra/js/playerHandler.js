import { keys, isTouching, getTouchDistance, getTouchAngle } from './input.js';
import { getTile } from './terrain.js';
import { getCheckpoint, getCheckpointCount } from './checkpoints.js';
import { updateNpcs } from './npcHandler.js';
import { game } from './gameConfig.js';

let player = {
  x: 0,
  y: 0,
  angle: 0
};

let score = 0;
let startTime = null;
let startPosition = 0;
let startAngle = 0;
let flashlightStrength = 1;
const baseSpeed = 3.0;
const turnSpeed = 0.05;
const tileSize = game.tileSize;

function playerInit() {
  startPosition = { x: 0, y: 0}; // Declared early to avoid ReferenceError
  startAngle = Math.random() * 6;
  setPlayerPositionAndAngle(startPosition.x, startPosition.y, startAngle);
  flashlightStrength = 0.5;
}

function getFlashlightStrength(){
  return flashlightStrength;
}

function getStartPosition() {
  return startPosition;
}

function setPlayerPositionAndAngle(x, y, theta) {
  player.x = x;
  player.y = y;
  player.angle = theta % Math.PI;
}

function isUpsideDown() {
  return Math.abs(player.angle) > Math.PI / 2;
}

function setPlayerAngle(theta){
  player.angle = theta % (2 * Math.PI);
}

function setPlayerPosition(x, y){
  player.x = x;
  player.y = y;
}

function getPlayerX() {
  return player.x;
}

function getPlayerY(){
  return player.y;
}

function getPlayerAngle(){
  return player.angle;
}

function turnPlayer(speed){
  setPlayerAngle(player.angle + speed);
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

  let dx = 0, dy = 0;
  let currentTile = getTileAtPlayer();
  let currentSpeedModifier = currentTile.speed;
  const actualSpeed = baseSpeed * currentSpeedModifier;

  if (keys['ArrowUp'] || isTouching) {
    const moveStrength = Math.cos(getTouchAngle()); // forward=1, backward=-1
    const moveSpeed = actualSpeed * moveStrength * (getTouchDistance() || 1);
    dx = Math.cos(player.angle - Math.PI / 2) * moveSpeed;
    dy = Math.sin(player.angle - Math.PI / 2) * moveSpeed;
  }
  if (keys['ArrowDown']) {
    dx = -Math.cos(player.angle - Math.PI / 2) * actualSpeed;
    dy = -Math.sin(player.angle - Math.PI / 2) * actualSpeed;
  }
  
  const nextCheckpoint = getCheckpoint(score);
  if (nextCheckpoint) increaseIfCheckpointFound(nextCheckpoint);
  
  if (score==getCheckpointCount()) {
    game.gameOver = true;
  }

  movePlayerIfPossible(dx, dy);
  updateNpcs();

  game.gameOver = false;
}

//If impassable, move along edge
function movePlayerIfPossible(dx, dy) {
  movePlayer(dx, dy);
  if (!getTileAtPlayer().impassable) return;
  
  movePlayer(-dx, 0);
  if (!getTileAtPlayer().impassable) return;
 
  movePlayer(dx, -dy);
  if (!getTileAtPlayer().impassable) return;

  movePlayer(-dx, 0)
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

function movePlayer(dx, dy) {
  player.x = player.x + dx;
  player.y = player.y + dy;
}

export {
  playerInit,
  update,
  getPlayerX,
  getPlayerY,
  getPlayerAngle,
  getStartPosition,
  getFlashlightStrength,
  isUpsideDown
};

