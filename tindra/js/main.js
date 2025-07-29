import { clearScreen, drawWorld, resizeAllCanvas} from './rendering.js';
import { update, playerInit } from './playerHandler.js';
import { isMobileDevice } from './utils.js';
import { inputInit, keys } from './input.js';
import { generateRandomCheckpoints } from './checkpoints.js';
import { generateChunk, loadTiles } from './terrain.js';
import { showEndScreen } from './ui.js';
import { loadNpcs } from './npcHandler.js';
import { gameInit, game } from './gameConfig.js';

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
  const gameOver = game.gameOver;
  if (!gameOver) {
    update();
    clearScreen();
    drawWorld();
    requestAnimationFrame(gameLoop);
  } else {
    showEndScreen();
  }
}

window.onload = () => {
  gameInit();
  loadTiles();
  loadNpcs();
  generateChunk(0, 0);
  generateRandomCheckpoints(checkpointCount);
  resizeAllCanvas();
  playerInit();
  inputInit();
}

document.getElementById('normal-button').addEventListener('click', () => {
  game.gameMode = "normal";
  startGame();
});

document.getElementById('night-button').addEventListener('click', () => {
  game.gameMode = "night";
  startGame();
});;

window.addEventListener('resize', resizeAllCanvas);

if (isMobileDevice()) {
  document.body.classList.add('mobile');
}
