import {getCanvas} from './ui.js';
import Npc from './npc.js';
import { getPlayerX, getPlayerY } from './playerHandler.js';
import { getRenderDistance } from './rendering.js';

let activeNpc = null;
let npcLife = 0;
let npcTimer = 10;
const canvas = getCanvas();
let npcs = [];

function loadNpcs(){
npcs.push(
  new Npc({
    name: 'G. Bergman',
    image: './assets/npc1.png',
    speed: 4
  })
  );
}

function updateNpcs() {
  // Countdown to spawn NPC
  npcTimer -= 1 / 60;
  npcLife -= 1 / 60;
  
  if (!activeNpc && npcTimer <= 0) {
    spawnRandomNpc(getRenderDistance() * 2);
  }

  if(activeNpc) updateNpc();
}

function updateNpc() {
  activeNpc.move();

  const isOutside = (Math.abs(activeNpc.getX() - getPlayerX()) > getRenderDistance() || Math.abs(activeNpc.getY() - getPlayerY()) > getRenderDistance()); 
  if (isOutside && npcLife <= 0) {
    activeNpc = null;
  }
}

function spawnRandomNpc(radius) {
  const spawnX = getPlayerY();
  const spawnY = getPlayerY();
  const spawnAngle = Math.random() * 2 * Math.PI;
  activeNpc = npcs[0];
  activeNpc.spawn(spawnX, spawnY, spawnAngle);
  activeNpc.moveDistance(-radius);
  npcLife = 5;
  npcTimer = 10 + Math.random() * 15;
}

function getActiveNpc(){
  return activeNpc;
}


export { updateNpcs,
  loadNpcs,
  getActiveNpc
};
