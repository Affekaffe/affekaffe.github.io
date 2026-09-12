export function drawLine3D(
    ctx,
    camera,
    a,
    b,
    color,
    width = 1
) {
    const p1 = camera.project(
        a.x,
        a.y,
        a.z ?? 0
    );

    const p2 = camera.project(
        b.x,
        b.y,
        b.z ?? 0
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}


export function drawArrow3D(
    ctx,
    camera,
    start,
    end,
    color,
    width = 4,
    headSize = 10
) {
    const p1 = camera.project(
        start.x,
        start.y,
        start.z ?? 0
    );

    const p2 = camera.project(
        end.x,
        end.y,
        end.z ?? 0
    );

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    // Shaft
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Arrow head
    const angle = Math.atan2(
        p2.y - p1.y,
        p2.x - p1.x
    );

    const spread = 0.5;

    ctx.beginPath();

    ctx.moveTo(p2.x, p2.y);

    ctx.lineTo(
        p2.x - headSize * Math.cos(angle - spread),
        p2.y - headSize * Math.sin(angle - spread)
    );

    ctx.lineTo(
        p2.x - headSize * Math.cos(angle + spread),
        p2.y - headSize * Math.sin(angle + spread)
    );

    ctx.closePath();
    ctx.fill();
}


export function drawVector3D(
    ctx,
    camera,
    vector,
    color,
    label,
    start = { x: 0, y: 0, z: 0 }
) {
    const end = {
        x: start.x + vector.x,
        y: start.y + vector.y,
        z: start.z + vector.z
    };

    drawArrow3D(
        ctx,
        camera,
        start,
        end,
        color,
        4,
        10
    );

    if (label) {

        const screen = camera.project(
            end.x,
            end.y,
            end.z
        );

        ctx.fillStyle = color;
        ctx.font = "bold 18px sans-serif";

        ctx.fillText(
            label,
            screen.x + 8,
            screen.y - 8
        );
    }
}


export function drawPolygon3D(
    ctx,
    camera,
    points,
    fillColor,
    strokeColor,
    width = 1
) {
    if (points.length < 3) {
        return;
    }

    const projected = points.map(point =>
        camera.project(
            point.x,
            point.y,
            point.z ?? 0
        )
    );

    ctx.beginPath();

    ctx.moveTo(
        projected[0].x,
        projected[0].y
    );

    for (let i = 1; i < projected.length; i++) {

        ctx.lineTo(
            projected[i].x,
            projected[i].y
        );
    }

    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}


export function drawPlaneGrid(
    ctx,
    camera,
    size,
    color
) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;

    for (let i = -size; i <= size; i++) {

        drawLine3D(
            ctx,
            camera,
            {
                x: -size,
                y: i,
                z: 0
            },
            {
                x: size,
                y: i,
                z: 0
            },
            color
        );

        drawLine3D(
            ctx,
            camera,
            {
                x: i,
                y: -size,
                z: 0
            },
            {
                x: i,
                y: size,
                z: 0
            },
            color
        );
    }
}