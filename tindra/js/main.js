import { clearScreen, drawWorld} from './rendering.js';
import { update, playerInit } from './player.js';
import { isMobileDevice } from './utils.js';
import { resizeMinimap, resizeCanvas } from './rendering.js';
import { inputInit, keys } from './input.js';
import { generateRandomCheckpoints } from './checkpoints.js';
import { generateChunk } from './terrain.js';
import { showEndScreen } from './ui.js';

let gameMode = "normal";
let gameOver = false;
const checkpointCount = 8;

async function startGame() {
  document.getElementById('start-screen').style.display = 'none';

  // Only request fullscreen on actual mobile
  if (isMobileDevice() && document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn("Fullscreen failed:", err);
    }
  }

  gameLoop();
}

function gameLoop() {
  if (!gameOver) {
    gameOver = update();
    clearScreen();
    drawWorld(gameMode);
    requestAnimationFrame(gameLoop);
  } else {
    showEndScreen();
  }
}

window.onload = () => {
  generateRandomCheckpoints(checkpointCount);
  resizeCanvas()
  resizeMinimap()
  generateChunk(0, 0);
  playerInit();
  inputInit();
}

document.getElementById('normal-button').addEventListener('click', () => {
  gameMode = "normal";
  startGame();
});

document.getElementById('night-button').addEventListener('click', () => {
  gameMode = "night";
  startGame();
});;

window.addEventListener('resize', resizeMinimap);
window.addEventListener('resize', resizeCanvas);

if (isMobileDevice()) {
  document.body.classList.add('mobile');
}
