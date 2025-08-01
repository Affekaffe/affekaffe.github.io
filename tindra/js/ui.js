
function getCanvas() {
  return document.getElementById('game');
}

function getCtx() {
  return getCanvas().getContext('2d');
}

function getMaskCanvas() {
  return document.getElementById('mask');
}

function getMaskCtx() {
  return getMaskCanvas().getContext('2d');
}

function getMinimapCanvas() {
  return document.getElementById('minimap');
}

function getMinimapCtx() {
  return getMinimapCanvas().getContext('2d');
}

function showEndScreen() {
  const endScreen = document.getElementById('end-screen');
  endScreen.style.display = 'flex';
  startConfetti();
}

function startConfetti() {
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const confetti = [];
  const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];

  for (let i = 0; i < 200; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 2,
      dx: Math.random() * 4 - 2,
      dy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let p of confetti) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y > confettiCanvas.height) {
        p.y = -10;
        p.x = Math.random() * confettiCanvas.width;
      }
    }
    requestAnimationFrame(draw);
  }

  draw();
}

export {getCanvas,
  getCtx,
  getMinimapCanvas,
  getMinimapCtx,
  getMaskCanvas,
  getMaskCtx,
  showEndScreen
};

