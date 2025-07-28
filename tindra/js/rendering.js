import { getCanvas, getCtx, getMinimapCanvas, getMinimapCtx } from "./ui.js";
import { world, getTile } from "./terrain.js";
import { getActiveNpc } from "./npc.js";
import { getPlayerX, getPlayerY, getPlayerAngle, getStartPosition, isUpsideDown } from "./player.js";
import { getCheckpoints } from "./checkpoints.js";
import { minimapVisible } from "./input.js";

const canvas = getCanvas();
const ctx = getCtx();
const minimapCanvas = getMinimapCanvas();
const minimapCtx = getMinimapCtx();
const tileSize = world.tileSize;
const imageSize = tileSize; 

const playerImage = new Image();
playerImage.src = './assets/player.png';
const npc1 = new Image();
npc1.src = './assets/npc1.png';
const tileBackgroundImage = new Image();
tileBackgroundImage.src = './assets/base1.png';

const lightRadiusTiles = world.lightRadius; //tiles

function drawWorld(gameMode) {
  const pX = getPlayerX();
  const pY = getPlayerY();
  const pAngle = getPlayerAngle();
  const checkpoints = getCheckpoints();
  const lightRadius = lightRadiusTiles * tileSize;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-pAngle);
  ctx.translate(-pX, -pY);

  const minX = Math.floor((pX - lightRadius) / tileSize) - 1;
  const maxX = Math.floor((pX + lightRadius) / tileSize) + 1;
  const minY = Math.floor((pY - lightRadius) / tileSize) - 1;
  const maxY = Math.floor((pY + lightRadius) / tileSize) + 1;

for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const tile = getTile(x, y);
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;

    if (tileBackgroundImage) {
        ctx.drawImage(
        tileBackgroundImage,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
      );
    }
    if (tile.image) {
      ctx.drawImage(
        tile.image,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
      );
    }
  }
}

  checkpoints.forEach(cp => {
    if (!cp.found) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(cp.x * tileSize + tileSize / 2, cp.y * tileSize + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.drawImage(playerImage, -imageSize / 2, -imageSize / 2, imageSize, imageSize);
  ctx.restore();
  
  drawNpc();

  if(gameMode==="normal"){
    drawGradient(lightRadius);
  }
  else {
    drawFlashlight(pX, pY, pAngle, lightRadius);
  }

  drawCompass(pAngle);
  drawMinimapIfVisible(checkpoints);
}

function drawNpc() {
  const npc = getActiveNpc();
  if (npc) {
    ctx.save();
    ctx.translate(npc.x, npc.y);
    ctx.rotate(npc.angle);
    ctx.drawImage(npc1, -imageSize / 2, -imageSize / 2, imageSize, imageSize);
    ctx.restore();
  }
}

function drawGradient(lightRadius) {
    const px = canvas.width / 2;
    const py = canvas.height / 2;

    const gradient = ctx.createRadialGradient(px, py, 0, px, py, lightRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFlashlight(pX, pY, pAngle, lightRadius) {
  const beamAngle = 2 * Math.PI / 3;
  const px = canvas.width / 2;
  const py = canvas.height / 2;

  const gradient = ctx.createRadialGradient(px, py, 0, px, py, lightRadius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext('2d');

  maskCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  maskCtx.fillRect(0, 0, canvas.width, canvas.height);

  maskCtx.globalCompositeOperation = 'destination-out';
  maskCtx.beginPath();
  maskCtx.moveTo(px, py);

  for (let a = -beamAngle / 2; a <= beamAngle / 2; a += 0.03) {
    const screenAngle = -Math.PI / 2 + a;
    const worldAngle = screenAngle + pAngle;
    const dist = castRayWorld(pX, pY, worldAngle, lightRadius);
    const rx = px + Math.cos(screenAngle) * dist;
    const ry = py + Math.sin(screenAngle) * dist;
    maskCtx.lineTo(rx, ry);
  }

  maskCtx.closePath();
  maskCtx.fill();

  maskCtx.globalCompositeOperation = 'hue';
  maskCtx.fillStyle = gradient;
  maskCtx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(maskCanvas, 0, 0);
}

function castRayWorld(pX, pY, angle, maxDist) {
  const step = 4;
  let accumulatedOpacity = 0;
  for (let d = 0; d < maxDist; d += step) {
    const wx = pX + Math.cos(angle) * d;
    const wy = pY + Math.sin(angle) * d;
    const tileX = Math.floor(wx / tileSize);
    const tileY = Math.floor(wy / tileSize);
    const tile = getTile(tileX, tileY);

    if (tile.blocksLight) return d;
    if (tile.semiBlocksLight) {
      accumulatedOpacity += 0.1;
      if (accumulatedOpacity >= 1) return d;
    }
  }
  return maxDist;
}

function drawCompass(angle) {
  const size = 80;
  const cx = canvas.width - size - 20;
  const cy = size + 20;

  // Draw compass circle
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotate so that "N" always points north
  ctx.rotate(-angle);

  // Draw N arrow
  ctx.beginPath();
  ctx.moveTo(0, -size / 2 + 10);
  ctx.lineTo(-6, -size / 2 + 20);
  ctx.lineTo(6, -size / 2 + 20);
  ctx.closePath();
  ctx.fillStyle = 'red';
  ctx.fill();

  // Label N
  ctx.fillStyle = '#000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', 0, -size / 2 + 35);

  ctx.restore();
}


function drawMinimapIfVisible(checkpoints) {
  if (minimapVisible) drawMinimap(checkpoints);
}

function drawMinimap(checkpoints) {
  const startPosition = getStartPosition();

  const scale = 8; // 2x size tiles
  const halfW = minimapCanvas.width / 2;
  const halfH = minimapCanvas.height / 2;

  const mapCenterX = startPosition.x / tileSize;
  const mapCenterY = startPosition.y / tileSize;

  for (let dy = -25; dy <= 25; dy++) {
    for (let dx = -25; dx <= 25; dx++) {
    const tx = Math.floor(mapCenterX + dx);
    const ty = Math.floor(mapCenterY + dy);
    const tile = getTile(tx, ty);
    const color = tile.color || '#fff';
    minimapCtx.fillStyle = color;
    minimapCtx.fillRect(
      halfW + dx * scale,
      halfH + dy * scale,
      scale,
      scale
    );
    }
  }

  checkpoints.forEach((cp, index) => {
        const dx = cp.x - mapCenterX;
        const dy = cp.y - mapCenterY;
        const px = halfW + dx * scale;
        const py = halfH + dy * scale;
        minimapCtx.strokeStyle = 'purple';
        minimapCtx.lineWidth = 2;
        minimapCtx.beginPath();
        minimapCtx.arc(px, py, 10, 0, Math.PI * 2);
        minimapCtx.stroke();
        minimapCtx.fillStyle = 'purple';
        minimapCtx.font = 'bold 12px sans-serif';
        minimapCtx.fillText((index + 1).toString(), px - 4, py + 4);
  });

      // Draw lines between unfound checkpoints in order
      minimapCtx.strokeStyle = 'rgba(128, 0, 128, 0.6)'; // Semi-transparent purple
      minimapCtx.lineWidth = 2;
      minimapCtx.beginPath();
      
      const dx = startPosition.x - mapCenterX;
      const dy = startPosition.y - mapCenterY;
      const px = halfW + dx * scale;
      const py = halfH + dy * scale;
      minimapCtx.moveTo(px, py);
      
      checkpoints.forEach(cp => {
        const cdx = cp.x - mapCenterX;
        const cdy = cp.y - mapCenterY;
        const cpx = halfW + cdx * scale;
        const cpy = halfH + cdy * scale;
        minimapCtx.lineTo(cpx, cpy);
      });
      minimapCtx.stroke();


  // Draw player start position as hollow purple triangle
  minimapCtx.strokeStyle = 'purple';
  minimapCtx.lineWidth = 2;
  minimapCtx.beginPath();
  minimapCtx.moveTo(px, py - 20);
  minimapCtx.lineTo(px - 20, py + 15);
  minimapCtx.lineTo(px + 20, py + 15);
  minimapCtx.closePath();
  minimapCtx.stroke();
}

function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}  

function resizeMinimap() {
  minimapCanvas.width = window.innerWidth;
  minimapCanvas.height = window.innerHeight;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}



export{drawWorld,
  drawFlashlight,
  drawGradient,
  drawMinimapIfVisible,
  drawCompass,
  clearScreen,
  resizeCanvas,
  resizeMinimap
};