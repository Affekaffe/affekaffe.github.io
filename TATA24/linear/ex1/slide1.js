import { Vector } from "../geometry/vector.js";
import { Line } from "../geometry/line.js";
import { CoordinateCanvas } from "../geometry/canvas.js";

export function initSlide1() {

    // --------------------------------------------------
    // Setup
    // --------------------------------------------------

    const canvasElement =
        document.getElementById("line-canvas");

    const coordinateCanvas =
        new CoordinateCanvas(canvasElement);

    const ctx = coordinateCanvas.ctx;

    const COLORS = {
        point: "#0761d6",
        vector: "#0052bc",
        line: "#56a8ff",
        target: "#e74c3c"
    };

    // Student's line
    let studentPoint =
        new Vector(2, 1);

    let studentDirection =
        new Vector(2, 1);


    // Target line
    function createTargetLine() {

        const angle =
            Math.random() * Math.PI;

        const direction =
            new Vector(
                Math.cos(angle),
                Math.sin(angle)
            );

        const point =
            new Vector(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );

        return new Line(point, direction);
    }

    const targetLine =
        createTargetLine();


    let dragging = null;


    // --------------------------------------------------
    // Drawing
    // --------------------------------------------------

    function drawLine(line, style, width = 2) {

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

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }


    function drawVector(point, vector) {

        const start =
            coordinateCanvas.toScreen(point);

        const end =
            coordinateCanvas.toScreen(
                point.add(vector)
            );

        ctx.strokeStyle = COLORS.vector;
        ctx.fillStyle = COLORS.vector;
        ctx.lineWidth = 4;

        // Vector shaft
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Arrow head
        const angle =
            Math.atan2(
                end.y - start.y,
                end.x - start.x
            );

        const size = 12;

        ctx.beginPath();

        ctx.moveTo(end.x, end.y);

        ctx.lineTo(
            end.x -
            size * Math.cos(angle - Math.PI / 6),

            end.y -
            size * Math.sin(angle - Math.PI / 6)
        );

        ctx.lineTo(
            end.x -
            size * Math.cos(angle + Math.PI / 6),

            end.y -
            size * Math.sin(angle + Math.PI / 6)
        );

        ctx.closePath();
        ctx.fillStyle = COLORS.vector;
        ctx.fill();


        // Point
        ctx.fillStyle = COLORS.point;

        ctx.beginPath();

        ctx.arc(
            start.x,
            start.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Labels
        ctx.font = "bold 22px sans-serif";

        ctx.fillText(
            "p",
            start.x + 12,
            start.y - 12
        );

        ctx.fillText(
            "v",
            end.x + 10,
            end.y - 10
        );
    }


    function draw() {

        coordinateCanvas.drawGrid();

        const studentLine =
            new Line(
                studentPoint,
                studentDirection
            );


        // Target
        drawLine(
            targetLine,
            COLORS.target,
            3
        );


        // Student line
        drawLine(
            studentLine,
            COLORS.line,
            2
        );


        // Student vector
        drawVector(
            studentPoint,
            studentDirection
        );


        updateInfo(studentLine);
    }


    // --------------------------------------------------
    // Information
    // --------------------------------------------------

    function updateInfo(line) {

        document.getElementById("point-x")
            .textContent =
            studentPoint.x.toFixed(1);

        document.getElementById("point-y")
            .textContent =
            studentPoint.y.toFixed(1);

        document.getElementById("direction-x")
            .textContent =
            studentDirection.x.toFixed(1);

        document.getElementById("direction-y")
            .textContent =
            studentDirection.y.toFixed(1);


        const success =
            line.coincidesWith(targetLine);

        const status =
            document.getElementById("success-message");

        if (success) {

            status.textContent =
                "✓ Linjerna matchar!";

            status.classList.add("success");

        } else {

            status.textContent = "";

            status.classList.remove("success");
        }
    }


    // --------------------------------------------------
    // Interaction
    // --------------------------------------------------

    function distance(a, b) {

        return Math.sqrt(
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2
        );
    }


    canvasElement.addEventListener(
        "pointerdown",
        event => {

            const mouse =
                coordinateCanvas.pointerPosition(event);

            const p =
                coordinateCanvas.toScreen(
                    studentPoint
                );

            const tip =
                coordinateCanvas.toScreen(
                    studentPoint.add(
                        studentDirection
                    )
                );


            if (distance(mouse, tip) < 20) {

                dragging = "direction";

                canvasElement.setPointerCapture(
                    event.pointerId
                );

            } else if (distance(mouse, p) < 20) {

                dragging = "point";

                canvasElement.setPointerCapture(
                    event.pointerId
                );
            }
        }
    );


    canvasElement.addEventListener(
        "pointermove",
        event => {

            if (!dragging) return;

            const mouse =
                coordinateCanvas.pointerPosition(event);

            const position =
                coordinateCanvas.toMath(
                    mouse.x,
                    mouse.y
                );


            if (dragging === "point") {

                studentPoint =
                    new Vector(
                        Math.round(position.x * 10) / 10,
                        Math.round(position.y * 10) / 10
                    );

            } else {

                studentDirection =
                    new Vector(
                        Math.round(
                            (position.x - studentPoint.x) * 10
                        ) / 10,

                        Math.round(
                            (position.y - studentPoint.y) * 10
                        ) / 10
                    );
            }

            draw();
        }
    );


    canvasElement.addEventListener(
        "pointerup",
        event => {

            dragging = null;

            canvasElement.releasePointerCapture(
                event.pointerId
            );
        }
    );


    canvasElement.addEventListener(
        "pointercancel",
        () => {
            dragging = null;
        }
    );

    draw();

    window.addEventListener(
        "resize",
        () => draw()
    );
}