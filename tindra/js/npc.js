import {getCanvas} from './ui.js';

let activeNPC = null;
let npcTimer = 0;
const canvas = getCanvas();

function updateNpcs(pX, pY) {
  // Countdown to spawn NPC
  npcTimer -= 1 / 60;
  
  if (!activeNPC && npcTimer <= 0) {
    // Spawn NPC
    const fromLeft = Math.random() < 0.5;
    const y = pY + (Math.random() * 400 - 200); // +/- 200px vertically
    activeNPC = {
      x: pX + (fromLeft ? -canvas.width / 2 - 100 : canvas.width / 2 + 100),
      y: pY,
      angle: fromLeft ? 0 : Math.PI,
      speed: 4 + Math.random() * 2,
      direction: fromLeft ? 1 : -1
    };
  
    // Set next spawn timer (10–30 sec)
    npcTimer = 10 + Math.random() * 15;
  }
  
  // Move NPC
  moveNpc(activeNPC, pX, pY);
}
function moveNpc(npc, pX, pY) {
  if (npc) {
    npc.x += npc.direction * npc.speed;

    // Despawn when far from player view
    if (Math.abs(npc.x - pX) > canvas.width) {
      npc = null;
    }
  }
}

function getActiveNpc(){
  return activeNPC;
}

export { updateNpcs,
  getActiveNpc
};
