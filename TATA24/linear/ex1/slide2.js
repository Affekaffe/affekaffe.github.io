export function initSlide2() {

    const canvas =
        document.getElementById("system-canvas");

    if (!canvas) {
        throw new Error("Could not find #system-canvas");
    }

    const coordinateCanvas =
        new CoordinateCanvas(canvas);

    /* =========================================================
    LINES
    ========================================================= */

    const line1 = new Line(
        new Vector(-2, 1),
        new Vector(1, 0.5)
    );

    const line2 = new Line(
        new Vector(1, -2),
        new Vector(-0.5, 1)
    );


    /* =========================================================
    COLORS
    ========================================================= */

    const COLORS = {
        line1: "#56a8ff",
        line2: "#e74c3c"
    };


    /* =========================================================
    DRAW LINE
    ========================================================= */

    function drawLine(line, color, width = 3) {

        const ctx = coordinateCanvas.ctx;

        const direction = line.direction.normalized();

        const length = Math.max(
            coordinateCanvas.width,
            coordinateCanvas.height
        ) / coordinateCanvas.scale * 2;

        const start = line.point.subtract(
            direction.multiply(length)
        );

        const end = line.point.add(
            direction.multiply(length)
        );

        const startScreen = coordinateCanvas.toScreen(start);
        const endScreen = coordinateCanvas.toScreen(end);

        ctx.beginPath();

        ctx.moveTo(
            startScreen.x,
            startScreen.y
        );

        ctx.lineTo(
            endScreen.x,
            endScreen.y
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = width;

        ctx.stroke();
    }


    /* =========================================================
    DRAW
    ========================================================= */

    function draw() {

        coordinateCanvas.drawGrid();

        drawLine(
            line1,
            COLORS.line1
        );

        drawLine(
            line2,
            COLORS.line2
        );

        drawIntersection();
    }



    /* =========================================================
    INTERSECTION
    ========================================================= */

    function getIntersection(lineA, lineB) {

        const p = lineA.point;
        const r = lineA.direction;

        const q = lineB.point;
        const s = lineB.direction;

        const cross =
            r.x * s.y -
            r.y * s.x;

        // Parallel lines
        if (Math.abs(cross) < 0.000001) {
            return null;
        }

        const qMinusP = q.subtract(p);

        const t =
            (qMinusP.x * s.y -
            qMinusP.y * s.x) / cross;

        return lineA.pointAt(t);
    }


    function drawIntersection() {

        const intersection =
            getIntersection(line1, line2);

        if (!intersection) {
            return;
        }

        const screen =
            coordinateCanvas.toScreen(intersection);

        const ctx = coordinateCanvas.ctx;

        ctx.beginPath();

        ctx.arc(
            screen.x,
            screen.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#fff";
        ctx.fill();

        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.stroke();
    }


    /* =========================================================
    DRAGGING
    ========================================================= */

    let dragging = false;
    let dragStart = null;

    canvas.addEventListener("pointerdown", event => {

        const position =
            coordinateCanvas.pointerPosition(event);

        const mathPosition =
            coordinateCanvas.toMath(
                position.x,
                position.y
            );

        /*
        * Find the closest point on line2.
        */

        const difference =
            new Vector(
                mathPosition.x - line2.point.x,
                mathPosition.y - line2.point.y
            );

        const direction =
            line2.direction;

        const directionLengthSquared =
            direction.x ** 2 +
            direction.y ** 2;

        const t =
            (
                difference.x * direction.x +
                difference.y * direction.y
            ) /
            directionLengthSquared;

        const closestPoint =
            line2.pointAt(t);

        const distance =
            closestPoint.subtract(
                new Vector(
                    mathPosition.x,
                    mathPosition.y
                )
            ).length();

        if (distance < 0.25) {

            dragging = true;

            dragStart = {
                x: mathPosition.x,
                y: mathPosition.y
            };

            canvas.setPointerCapture(event.pointerId);
        }
    });


    canvas.addEventListener("pointermove", event => {

        if (!dragging) {
            return;
        }

        const position =
            coordinateCanvas.pointerPosition(event);

        const mathPosition =
            coordinateCanvas.toMath(
                position.x,
                position.y
            );

        const dx =
            mathPosition.x - dragStart.x;

        const dy =
            mathPosition.y - dragStart.y;

        line2.point.x += dx;
        line2.point.y += dy;

        dragStart = {
            x: mathPosition.x,
            y: mathPosition.y
        };

        draw();
    });


    canvas.addEventListener("pointerup", event => {

        dragging = false;

        canvas.releasePointerCapture(
            event.pointerId
        );
    });


    canvas.addEventListener("pointercancel", () => {
        dragging = false;
    });


    /* =========================================================
    RESIZE
    ========================================================= */

    window.addEventListener("resize", draw);


    /* =========================================================
    INITIAL DRAW
    ========================================================= */

    draw();

}