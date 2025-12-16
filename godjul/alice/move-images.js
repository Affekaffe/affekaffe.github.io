const stage = document.getElementById("stage");
const prefix = stage.dataset.prefix;

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);


// Image filenames for each page
const images = [
  `${prefix}1.png`,
  `${prefix}2.png`
];
// Number of copies per image
const copies = 2;

// Loop over each image
images.forEach(src => {
  for (let i = 0; i < copies; i++) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "moving-image";

    // Random initial position
    let x = Math.random() * window.innerWidth / 2;
    let y = Math.random() * window.innerHeight / 2;

    // Random velocity
    let vx = (Math.random() * 5 + 1) * (Math.random() < 0.5 ? 1 : -1);
    let vy = (Math.random() * 5 + 1) * (Math.random() < 0.5 ? 1 : -1);

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    stage.appendChild(img);

    function animate() {
      x += vx;
      y += vy;

      // Bounce off edges
      if (x < 0 || x + img.width > window.innerWidth) vx *= -1;
      if (y < 0 || y + img.height > window.innerHeight) vy *= -1;

      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      drawParticles();
      requestAnimationFrame(animate);
    }

    img.onload = animate;
  }
});

const particles = [];
const colors = ["#ff3b3b", "#3bff7a", "#3b7aff", "#fff"];

for (let i = 0; i < 150; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 3 + 1,
    d: Math.random() * 1 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 10
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  updateParticles();
}

function updateParticles() {
  particles.forEach(p => {
    p.y += p.d;
    p.x += Math.sin(p.tilt);

    if (p.y > canvas.height) {
      p.y = -10;
      p.x = Math.random() * canvas.width;
    }
  });
}

const textEl = document.getElementById("christmas-text");
const name = stage.dataset.prefix.charAt(0).toUpperCase() + stage.dataset.prefix.slice(1);
textEl.textContent = `GOD JUL ${name.toUpperCase()}!!!`;
// Add additional festive text elements
// Add additional festive text elements
const extraTexts = [
  "Alice är verkligen riktigt snygg och snäll. Precis som passar julen till!",
  "Alla tycker att ett sällskap med Alice är ett riktigt bra sällskap.",
  "Precis sådär nördig som man ska vara.Speciellt när det kommer till konceptmusikaler."
];

const placedPositions = [];
const minDistance = 150;

extraTexts.forEach(text => {
  const el = document.createElement("div");
  el.className = "festive-text";
  el.textContent = text;

  // Random color
  el.style.color = `hsl(${Math.random() * 360}, 80%, 60%)`;

  // Generate random position not too close to others
  function getRandomPosition() {
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 100);
    for (let pos of placedPositions) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      if (Math.sqrt(dx*dx + dy*dy) < minDistance) return getRandomPosition();
    }
    return { x, y };
  }

  const pos = getRandomPosition();
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  placedPositions.push(pos);

  // Random velocity
  let vx = (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? 1 : -1);
  let vy = (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? 1 : -1);

  stage.appendChild(el);

  // Animate drifting
  function animateText() {
    let x = parseFloat(el.style.left);
    let y = parseFloat(el.style.top);

    x += vx;
    y += vy;

    // Bounce off edges
    if (x < 0 || x + el.offsetWidth > window.innerWidth) vx *= -1;
    if (y < 0 || y + el.offsetHeight > window.innerHeight) vy *= -1;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    requestAnimationFrame(animateText);
  }

  animateText();
});

