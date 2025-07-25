const keys = {};
let minimapVisible = false;
let isTouching = false;
let touchDistance = 0;
let touchAngle = 0;
let baseRect = null;

let joystickBase, joystickThumb, minimapCanvas;

function inputInit() {
  joystickBase = document.getElementById('joystick-base');
  joystickThumb = document.getElementById('joystick-thumb');
  minimapCanvas = document.getElementById('minimap');

  // Keyboard input
  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'm' || e.key === 'M') {
      minimapVisible = !minimapVisible;
      minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  // Minimap toggle button
  const mapToggleBtn = document.getElementById('map-toggle');
  if (mapToggleBtn) {
    mapToggleBtn.addEventListener('click', () => {
      minimapVisible = !minimapVisible;
      minimapCanvas.style.display = minimapVisible ? 'block' : 'none';
    });
  }

  // Touch joystick
  if (joystickBase && joystickThumb) {
    joystickBase.addEventListener('touchstart', (e) => {
      isTouching = true;
      baseRect = joystickBase.getBoundingClientRect();
      handleTouch(e);
    });

    joystickBase.addEventListener('touchmove', (e) => {
      handleTouch(e);
    });

    joystickBase.addEventListener('touchend', () => {
      isTouching = false;
      touchDistance = 0;
      joystickThumb.style.left = '30%';
      joystickThumb.style.top = '30%';
    });
  }

  // Prevent scrolling while using touch
  document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
}


function handleTouch(e) {
  const touch = e.touches[0];
  const baseCenterX = baseRect.left + baseRect.width / 2;
  const baseCenterY = baseRect.top + baseRect.height / 2;
  const dx = touch.clientX - baseCenterX;
  const dy = touch.clientY - baseCenterY;

  const maxDist = baseRect.width / 2;
  const dist = Math.min(Math.hypot(dx, dy), maxDist);
  const angle = Math.atan2(dy, dx);

  touchAngle = angle + Math.PI / 2;
  touchDistance = dist / maxDist;

  const thumbSize = baseRect.width * 0.4;
  joystickThumb.style.left =
    baseRect.width / 2 + Math.cos(angle) * dist - thumbSize / 2 + 'px';
  joystickThumb.style.top =
    baseRect.height / 2 + Math.sin(angle) * dist - thumbSize / 2 + 'px';
}

function getTouchAngle(){
  return touchAngle;
}

function getTouchDistance(){
  return touchDistance;
}

export {
  inputInit,
  keys,
  isTouching,
  getTouchDistance,
  getTouchAngle,
  baseRect,
  handleTouch,
  minimapVisible
};
