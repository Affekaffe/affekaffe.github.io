import { canvas, ctx, minimapCanvas, minimapCtx, maskCanvas, maskCtx} from "./ui.js";
import { getTile } from "./terrain.js";
import { getActiveNpc } from "./npcHandler.js";
import { player, getStartPosition } from "./playerHandler.js";
import { getCheckpoints } from "./checkpoints.js";
import { minimapVisible } from "./input.js";
import { game } from "../config.js";


const tileBackgroundImage = new Image();
tileBackgroundImage.src = './assets/base1.png';

function drawWorld() {
  const imageSize = game.tileSize;
  const checkpoints = getCheckpoints();
  const npc = getActiveNpc();

  drawTerrain();
  
  drawPlayer(imageSize);
  if (npc) drawNpc(npc, imageSize);

  drawLighting();

  drawCompass(player.angle);
  drawMinimapIfVisible(checkpoints);
}

function drawTerrain() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-player.angle);
  ctx.translate(-player.x, -player.y);

  drawTiles(player.x, player.y, getRenderDistance());
  drawCheckpoints();

  ctx.restore();
}

function drawCheckpoints() {
  const tileSize = game.tileSize;

  getCheckpoints().forEach(cp => {
    if (!cp.found) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(cp.x * tileSize + tileSize / 2, cp.y * tileSize + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawTiles(centerX, centerY, radius) {
  const tileSize = game.tileSize;

  const minX = Math.floor((centerX - radius) / tileSize) - 1;
  const maxX = Math.floor((centerX + radius) / tileSize) + 1;
  const minY = Math.floor((centerY - radius) / tileSize) - 1;
  const maxY = Math.floor((centerY + radius) / tileSize) + 1;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const tile = getTile(x, y);

      drawBackgroundTile(x, y, tileSize);
      drawTile(tile, x, y, tileSize);
    }
  }
}

function drawLighting() {
  const lightRadius = getRenderDistance();

  if (game.gameMode === "normal") {
    drawGradient(ctx, 'rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 1)', lightRadius);  
  }
  else if (game.gameMode === "night") {
    drawGradient(ctx, 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 1)', lightRadius);
    drawAllNightMasks(getActiveNpc())
  }
}

function drawTile(tile, x, y, tileSize) {
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

function drawBackgroundTile(x, y, tileSize) {
  if (tileBackgroundImage) {
    ctx.drawImage(
      tileBackgroundImage,
      x * tileSize,
      y * tileSize,
      tileSize,
      tileSize
    );
  }
}

function drawPlayer(imageSize) {
  if (player.image){
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.drawImage(player.image, -imageSize / 2, -imageSize / 2, imageSize, imageSize);
    ctx.restore();
  }
}

function drawNpc(npc, imageSize) {
  if (npc.image) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-player.angle);
    ctx.translate(npc.x - player.x, npc.y - player.y);
    ctx.rotate(npc.angle);
    ctx.drawImage(npc.image, -imageSize/2, -imageSize/2, imageSize, imageSize);
    ctx.restore();
  }
}

function drawGradient(_ctx, c1, c2, lightRadius) {
    const gradient = createGradient(c1, c2, lightRadius);

    _ctx.fillStyle = gradient;
    _ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createGradient(c1, c2, lightRadius) {
  const width = canvas.width;
  const height = canvas.height;

  ctx.resetTransform();
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, lightRadius);
  gradient.addColorStop(0, c1);
  gradient.addColorStop(1, c2);

  return gradient;
}

function drawDarknessMask() {
  const width = canvas.width;
  const height = canvas.height;

  maskCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  maskCtx.fillRect(0, 0, width, height);
}

function drawAllNightMasks(npc) {
  const lightRadius = getRenderDistance();

  ctx.save();
  maskCtx.save();

  drawDarknessMask();
  drawFlashlightMasks(npc);
  drawGradient(maskCtx, 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0)', lightRadius * player.flashlight.strength)

  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();
  maskCtx.restore();
}

function drawFlashlightMasks(npc) {
  const strength = player.flashlight.strength;

  maskCtx.globalCompositeOperation = 'destination-out';
  
  drawFlashlightMaskAtPlayer(strength);
  if (npc) drawFlashlightMaskAtNpc(npc, strength * 2);
}

function drawFlashlightMaskAtNpc(npc, strength) {
  const lightRadius = getRenderDistance();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-player.angle);
  ctx.translate(npc.x - player.x, npc.y - player.y);
  ctx.rotate(npc.angle);


  maskCtx.setTransform(ctx.getTransform());

  drawFlashlightBeams(npc.x, npc.y, npc.angle, lightRadius * strength);
  ctx.resetTransform();
  maskCtx.resetTransform();
}

function drawFlashlightMaskAtPlayer(strength) {
  const lightRadius = getRenderDistance();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  maskCtx.setTransform(ctx.getTransform());

  drawFlashlightBeams(player.x, player.y, player.angle, lightRadius * strength);
  ctx.resetTransform();
  maskCtx.resetTransform();
}

function drawFlashlightBeams(x, y, angle, length) {
  const offset = 30;

  maskCtx.translate(0, offset);
  const beamAngle = 2 * Math.PI / 3;
  
  const gradient = maskCtx.createRadialGradient(0, 0, length * 0.1, 0, 0, length);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  maskCtx.fillStyle = gradient;

  maskCtx.beginPath();
  maskCtx.moveTo(0, 0);

  for (let a = -beamAngle / 2; a <= beamAngle / 2; a += 0.03) {
    const singleBeamAngle = -Math.PI / 2 + a;
    const NetBeamAngle = singleBeamAngle + angle;
    const dist = castRayWorld(x, y, NetBeamAngle, length);
    const rx = Math.cos(singleBeamAngle) * dist;
    const ry = Math.sin(singleBeamAngle) * dist;
    maskCtx.lineTo(rx, ry);
  }

  maskCtx.closePath();
  maskCtx.fill();
}

function castRayWorld(x, y, angle, maxDist) {
  const step = 4;
  let accumulatedOpacity = 0;
  for (let d = 0; d < maxDist; d += step) {
    const wx = x + Math.cos(angle) * d;
    const wy = y + Math.sin(angle) * d;
    const tileX = Math.floor(wx / game.tileSize);
    const tileY = Math.floor(wy / game.tileSize);
    const tile = getTile(tileX, tileY);

    if (tile.blocksLight) return d;
    if (tile.semiBlocksLight) {
      accumulatedOpacity += 0.08;
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
  const tileSize = game.tileSize;
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

function resizeAllCanvas(){
  game.tileSize = window.innerHeight / (2 * game.lightRadius);

  resizeCanvas();
  resizeMask();
  resizeMinimap();
}

function resizeMinimap() {
  minimapCanvas.width = window.innerWidth;
  minimapCanvas.height = window.innerHeight;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function resizeMask() {
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
}

function getRenderDistance(){
  return game.lightRadius * game.tileSize;
}



export{drawWorld,
  drawFlashlightMaskAtPlayer as drawFlashlight,
  drawGradient,
  drawMinimapIfVisible,
  drawCompass,
  clearScreen,
  resizeAllCanvas,
  getRenderDistance
};