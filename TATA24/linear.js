const canvas = document.getElementById("line-canvas");
const ctx = canvas.getContext("2d");

let point = {
    x: 2,
    y: 1
};

let direction = {
    x: 2,
    y: 1
};

let dragging = null;

const scale = 50;

const slides = document.querySelectorAll(".slide");
const progressDots = document.querySelectorAll(".progress-dot");

const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const slideNumber = document.getElementById("slide-number");

let currentSlide = 1;
const totalSlides = slides.length;


// --------------------------------------------------
// Canvas setup
// --------------------------------------------------

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw();
}


// --------------------------------------------------
// Coordinate conversion
// --------------------------------------------------

function toScreen(x, y) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    return {
        x: width / 2 + x * scale,
        y: height / 2 - y * scale
    };
}

function toMath(x, y) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    return {
        x: (x - width / 2) / scale,
        y: (height / 2 - y) / scale
    };
}


// --------------------------------------------------
// Drawing
// --------------------------------------------------

function drawGrid() {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#333";

    for (let x = width / 2; x < width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let x = width / 2; x > 0; x -= scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = height / 2; y < height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    for (let y = height / 2; y > 0; y -= scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}


function drawLine() {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const p = toScreen(point.x, point.y);

    // Direction vector length
    const length = Math.sqrt(
        direction.x ** 2 +
        direction.y ** 2
    );

    if (length < 0.001) return;

    const dx = direction.x / length;
    const dy = direction.y / length;

    // Extend line across canvas
    const extension = Math.max(width, height);

    const x1 = p.x - dx * extension;
    const y1 = p.y + dy * extension;

    const x2 = p.x + dx * extension;
    const y2 = p.y - dy * extension;

    ctx.strokeStyle = "#d08585";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


function drawVector() {

    const p = toScreen(point.x, point.y);

    const tip = toScreen(
        point.x + direction.x,
        point.y + direction.y
    );

    // Vector
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // Arrow head
    const angle = Math.atan2(
        tip.y - p.y,
        tip.x - p.x
    );

    const arrowSize = 12;

    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);

    ctx.lineTo(
        tip.x - arrowSize * Math.cos(angle - Math.PI / 6),
        tip.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );

    ctx.lineTo(
        tip.x - arrowSize * Math.cos(angle + Math.PI / 6),
        tip.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );

    ctx.closePath();
    ctx.fill();

    // Point
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = "bold 18px sans-serif";

    ctx.fillText("p", p.x + 12, p.y - 12);
    ctx.fillText("v", tip.x + 10, tip.y - 10);
}


function draw() {
    drawGrid();
    drawLine();
    drawVector();
    updateInfo();
}


// --------------------------------------------------
// Information display
// --------------------------------------------------

function updateInfo() {

    document.getElementById("point-x").textContent =
        point.x.toFixed(1);

    document.getElementById("point-y").textContent =
        point.y.toFixed(1);

    document.getElementById("direction-x").textContent =
        direction.x.toFixed(1);

    document.getElementById("direction-y").textContent =
        direction.y.toFixed(1);
}


// --------------------------------------------------
// Mouse / touch interaction
// --------------------------------------------------

function pointerPosition(event) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}


function distance(a, b) {
    return Math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2
    );
}


canvas.addEventListener("pointerdown", event => {

    const mouse = pointerPosition(event);

    const p = toScreen(point.x, point.y);

    const tip = toScreen(
        point.x + direction.x,
        point.y + direction.y
    );

    if (distance(mouse, tip) < 20) {

        dragging = "direction";
        canvas.setPointerCapture(event.pointerId);

    } else if (distance(mouse, p) < 20) {

        dragging = "point";
        canvas.setPointerCapture(event.pointerId);
    }
});


canvas.addEventListener("pointermove", event => {

    if (!dragging) return;

    const mouse = pointerPosition(event);
    const pos = toMath(mouse.x, mouse.y);

    if (dragging === "point") {

        point.x = Math.round(pos.x * 10) / 10;
        point.y = Math.round(pos.y * 10) / 10;

    } else if (dragging === "direction") {

        direction.x =
            Math.round((pos.x - point.x) * 10) / 10;

        direction.y =
            Math.round((pos.y - point.y) * 10) / 10;
    }

    draw();
});


canvas.addEventListener("pointerup", event => {

    dragging = null;

    canvas.releasePointerCapture(event.pointerId);
});


canvas.addEventListener("pointercancel", () => {
    dragging = null;
});


/* =========================================================
   SHOW SLIDE
   ========================================================= */

function showSlide(number) {

    currentSlide = number;

    slides.forEach(slide => {
        const slideNumber =
            Number(slide.dataset.slide);

        slide.classList.toggle(
            "active",
            slideNumber === currentSlide
        );
    });

    window.dispatchEvent(
    new CustomEvent("slidechange", {
        detail: currentSlide
    })
);

    progressDots.forEach(dot => {
        const dotNumber =
            Number(dot.dataset.slide);

        dot.classList.toggle(
            "active",
            dotNumber === currentSlide
        );
    });

    slideNumber.textContent =
        `${currentSlide} / ${totalSlides}`;

    previousButton.disabled =
        currentSlide === 1;

    nextButton.disabled =
        currentSlide === totalSlides;
}


/* =========================================================
   NEXT / PREVIOUS
   ========================================================= */

nextButton.addEventListener("click", () => {

    if (currentSlide < totalSlides) {
        showSlide(currentSlide + 1);
    }

});


previousButton.addEventListener("click", () => {

    if (currentSlide > 1) {
        showSlide(currentSlide - 1);
    }

});


/* =========================================================
   PROGRESS DOTS
   ========================================================= */

progressDots.forEach(dot => {

    dot.addEventListener("click", () => {

        const number =
            Number(dot.dataset.slide);

        showSlide(number);

    });

});


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "ArrowRight") {
        if (currentSlide < totalSlides) {
            showSlide(currentSlide + 1);
        }
    }

    if (event.key === "ArrowLeft") {
        if (currentSlide > 1) {
            showSlide(currentSlide - 1);
        }
    }

});


/* =========================================================
   INITIALIZE
   ========================================================= */

showSlide(1);

// --------------------------------------------------
// Start
// --------------------------------------------------

window.addEventListener("resize", resizeCanvas);

resizeCanvas();