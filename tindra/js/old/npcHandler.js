import Npc from './npc.js';
import { player } from './playerHandler.js';
import { getRenderDistance } from './rendering.js';

let activeNpc = null;
let npcLife = 0;
let npcTimer = 10;
let npcs = [];

function loadNpcs(){
npcs.push(
  new Npc(
    'G. Bergman',
    './assets/npc1.png',
    4
  )
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

  const isOutside = (Math.abs(activeNpc.x - player.x) > getRenderDistance() || Math.abs(activeNpc.y - player.y) > getRenderDistance()); 
  if (isOutside && npcLife <= 0) {
    activeNpc = null;
  }
}

function spawnRandomNpc(radius) {
  const spawnX = player.x;
  const spawnY = player.y;
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
