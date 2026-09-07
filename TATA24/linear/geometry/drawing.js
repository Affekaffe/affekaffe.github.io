// --------------------------------------------------
// Draw Line
// --------------------------------------------------

export function drawLine(
    coordinateCanvas,
    line,
    style = "#56a8ff",
    width = 2,
    dashed = false
) {
    const ctx = coordinateCanvas.ctx;

    const p =
        coordinateCanvas.toScreen(line.point);

    const direction =
        line.direction.normalized();

    const extension =
        Math.max(
            coordinateCanvas.width,
            coordinateCanvas.height
        );

    const start = {
        x: p.x - direction.x * extension,
        y: p.y + direction.y * extension
    };

    const end = {
        x: p.x + direction.x * extension,
        y: p.y - direction.y * extension
    };

    ctx.strokeStyle = style;
    ctx.lineWidth = width;

    ctx.setLineDash(
        dashed ? [8, 8] : []
    );

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.setLineDash([]);
}


// --------------------------------------------------
// Draw Point
// --------------------------------------------------

export function drawPoint(
    coordinateCanvas,
    point,
    radius = 7,
    fillStyle = "#fff",
    strokeStyle = null
) {
    const ctx = coordinateCanvas.ctx;

    const screen =
        coordinateCanvas.toScreen(point);

    ctx.beginPath();

    ctx.arc(
        screen.x,
        screen.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = fillStyle;
    ctx.fill();

    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}


// --------------------------------------------------
// Draw Vector
// --------------------------------------------------

export function drawVector(
    coordinateCanvas,
    start,
    vector,
    color = "#0052bc",
    label = "",
    width = 4
) {
    const ctx = coordinateCanvas.ctx;

    const startScreen =
        coordinateCanvas.toScreen(start);

    const endScreen =
        coordinateCanvas.toScreen(
            start.add(vector)
        );


    // --------------------------------------------------
    // Vector shaft
    // --------------------------------------------------

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();

    ctx.moveTo(
        startScreen.x,
        startScreen.y
    );

    ctx.lineTo(
        endScreen.x,
        endScreen.y
    );

    ctx.stroke();


    // --------------------------------------------------
    // Arrow head
    // --------------------------------------------------

    const angle =
        Math.atan2(
            endScreen.y - startScreen.y,
            endScreen.x - startScreen.x
        );

    const size = 12;

    ctx.beginPath();

    ctx.moveTo(
        endScreen.x,
        endScreen.y
    );

    ctx.lineTo(
        endScreen.x -
        size * Math.cos(angle - Math.PI / 6),

        endScreen.y -
        size * Math.sin(angle - Math.PI / 6)
    );

    ctx.lineTo(
        endScreen.x -
        size * Math.cos(angle + Math.PI / 6),

        endScreen.y -
        size * Math.sin(angle + Math.PI / 6)
    );

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();


    // --------------------------------------------------
    // Label
    // --------------------------------------------------

    if (label) {

        ctx.font = "bold 22px sans-serif";
        ctx.fillStyle = color;

        ctx.fillText(
            label,
            endScreen.x + 10,
            endScreen.y - 10
        );
    }
}