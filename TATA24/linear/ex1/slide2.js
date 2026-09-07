import { Vector } from "../geometry/vector.js";
import { Line } from "../geometry/line.js";
import { CoordinateCanvas } from "../geometry/canvas.js";
import {
    drawLine,
    drawPoint,
    drawVector
} from "../geometry/drawing.js";


export function initSlide2() {

    // --------------------------------------------------
    // Setup
    // --------------------------------------------------

    const canvas =
        document.getElementById("system-canvas");

    if (!canvas) {
        throw new Error(
            "Could not find #system-canvas"
        );
    }

    const coordinateCanvas =
        new CoordinateCanvas(canvas);


    // --------------------------------------------------
    // Lines
    // --------------------------------------------------

    const line1 =
        new Line(
            new Vector(-2, 1),
            new Vector(1, 0.5)
        );

    let vectorU =
        new Vector(1.5, 0);

    let vectorV =
        new Vector(-0.5, 1);



    // --------------------------------------------------
    // Colors
    // --------------------------------------------------

    const COLORS = {
        line1: "#e74c3c",
        line2: "#56a8ff",
        vectorV: "#006eff",
        vectorU: "#00ff73"
    };


    // --------------------------------------------------
    // Drawing
    // --------------------------------------------------

    function draw() {

        coordinateCanvas.drawGrid();


        // Line 1
        drawLine(
            coordinateCanvas,
            line1,
            COLORS.line1
        );


        // Line 2
        const line2 =
            new Line(
                vectorU,
                vectorV
            );

        drawLine(
            coordinateCanvas,
            line2,
            COLORS.line2
        );


        // Position vector u
        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            vectorU,
            COLORS.vectorU,
            "u"
        );


        // Direction vector v
        drawVector(
            coordinateCanvas,
            vectorU,
            vectorV,
            COLORS.vectorV,
            "v"
        );


        // Intersection
        const intersection =
            line1.intersectionWith(line2);

        if (intersection) {

            drawPoint(
                coordinateCanvas,
                intersection
            );
        }
    }


    // --------------------------------------------------
    // Dragging
    // --------------------------------------------------

    let dragging = null;

    canvas.addEventListener(
        "pointerdown",
        event => {

            const mouse =
                coordinateCanvas.pointerPosition(event);


            // Tip of position vector u
            const uScreen =
                coordinateCanvas.toScreen(
                    vectorU
                );


            // Tip of direction vector v
            const vTipScreen =
                coordinateCanvas.toScreen(
                    vectorU.add(vectorV)
                );


            // Drag direction vector
            if (
                distance(
                    mouse,
                    vTipScreen
                ) < 20
            ) {

                dragging = "direction";

                canvas.setPointerCapture(
                    event.pointerId
                );


            // Drag position vector
            } else if (
                distance(
                    mouse,
                    uScreen
                ) < 20
            ) {

                dragging = "point";

                canvas.setPointerCapture(
                    event.pointerId
                );
            }
        }
    );

    canvas.addEventListener(
        "pointermove",
        event => {

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


            // Move u
            if (dragging === "point") {

            vectorU =
                new Vector(
                    Math.round(mathPosition.x * 10) / 10,
                    Math.round(mathPosition.y * 10) / 10
                );


            // Change v
            } else {

                const newVector =
                    new Vector(
                        Math.round(
                            (mathPosition.x - vectorU.x) * 10
                        ) / 10,

                        Math.round(
                            (mathPosition.y - vectorU.y) * 10
                        ) / 10
                    );

                vectorV =
                    snapToLineDirection(newVector);
            }


            draw();
        }
    );

    canvas.addEventListener(
        "pointerup",
        event => {

            dragging = null;

            canvas.releasePointerCapture(
                event.pointerId
            );
        }
    );

    canvas.addEventListener(
        "pointercancel",
        () => {
            dragging = null;
        }
    );

    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    window.addEventListener(
        "resize",
        draw
    );

    //Helpers
    function distance(a, b) {

        return Math.sqrt(
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2
        );
    }

    function snapToLineDirection(vector) {

        const targetDirection =
            line1.direction.normalized();

        const length =
            vector.length();

        if (length === 0) {
            return vector;
        }

        const currentDirection =
            vector.normalized();

        const dot =
            currentDirection.x * targetDirection.x +
            currentDirection.y * targetDirection.y;

        const clampedDot =
            Math.max(-1, Math.min(1, dot));

        const angle =
            Math.acos(clampedDot);

        // Snap if within 3 degrees
        const snapAngle =
            3 * Math.PI / 180;

        if (angle < snapAngle) {

            return targetDirection.multiply(length);
        }

        // Also snap if pointing in the opposite direction
        if (Math.abs(angle - Math.PI) < snapAngle) {

            return targetDirection.multiply(-length);
        }

        return vector;
    }


    // --------------------------------------------------
    // Initial draw
    // --------------------------------------------------

    draw();
}