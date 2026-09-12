import { Vector } from "../geometry/vector.js";
import { Line } from "../geometry/line.js";
import { CoordinateCanvas } from "../geometry/canvas.js";
import {
    drawLine,
    drawVector
} from "../geometry/drawing.js";

export function initSlide1() {

    // --------------------------------------------------
    // Setup
    // --------------------------------------------------

    const canvasElement =
        document.getElementById("line-canvas");

    const coordinateCanvas =
        new CoordinateCanvas(canvasElement);


    const COLORS = {
        point: "#006eff",
        vector: "#00ff73",
        line: "#c7f1ff",
        target: "#e74c3c"
    };


    // --------------------------------------------------
    // Student's line
    // --------------------------------------------------

    let vectorU =
        new Vector(2, 0);

    let vectorV =
        new Vector(0, 2);


    // --------------------------------------------------
    // Target line
    // --------------------------------------------------

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

        return new Line(
            point,
            direction
        );
    }


    const targetLine =
        createTargetLine();

    let dragging = null;


    // --------------------------------------------------
    // Drawing
    // --------------------------------------------------

    function draw() {

        coordinateCanvas.drawGrid();

        const studentLine =
            new Line(
                vectorU,
                vectorV
            );


        // Target line
        drawLine(
            coordinateCanvas,
            targetLine,
            COLORS.target,
            3
        );


        // Student line
        drawLine(
            coordinateCanvas,
            studentLine,
            COLORS.line,
            2,
            true
        );


        // Position vector u
        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            vectorU,
            COLORS.point,
            "u"
        );


        // Direction vector v
        drawVector(
            coordinateCanvas,
            vectorU,
            vectorV,
            COLORS.vector,
            "v"
        );


        updateInfo(studentLine);
    }


    // --------------------------------------------------
    // Information
    // --------------------------------------------------

    function updateInfo(line) {

        document.getElementById("point-x")
            .textContent =
            vectorU.x.toFixed(1);

        document.getElementById("point-y")
            .textContent =
            vectorU.y.toFixed(1);

        document.getElementById("direction-x")
            .textContent =
            vectorV.x.toFixed(1);

        document.getElementById("direction-y")
            .textContent =
            vectorV.y.toFixed(1);


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


            const pointScreen =
                coordinateCanvas.toScreen(
                    vectorU
                );


            const tipScreen =
                coordinateCanvas.toScreen(
                    vectorU.add(vectorV)
                );


            // Drag direction vector
            if (
                distance(
                    mouse,
                    tipScreen
                ) < 20
            ) {

                dragging = "direction";

                canvasElement.setPointerCapture(
                    event.pointerId
                );


            // Drag position vector
            } else if (
                distance(
                    mouse,
                    pointScreen
                ) < 20
            ) {

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

            if (!dragging) {
                return;
            }


            const mouse =
                coordinateCanvas.pointerPosition(event);


            const position =
                coordinateCanvas.toMath(
                    mouse.x,
                    mouse.y
                );


            // Move position vector u
            if (dragging === "point") {

                vectorU =
                    new Vector(
                        Math.round(position.x * 10) / 10,
                        Math.round(position.y * 10) / 10
                    );


            // Change direction vector v
            } else {

                vectorV =
                    new Vector(
                        Math.round(
                            (position.x - vectorU.x) * 10
                        ) / 10,

                        Math.round(
                            (position.y - vectorU.y) * 10
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

            if (
                canvasElement.hasPointerCapture(
                    event.pointerId
                )
            ) {
                canvasElement.releasePointerCapture(
                    event.pointerId
                );
            }
        }
    );


    canvasElement.addEventListener(
        "pointercancel",
        () => {
            dragging = null;
        }
    );


    // --------------------------------------------------
    // Initial draw
    // --------------------------------------------------

    draw();


    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    window.addEventListener(
        "resize",
        () => draw()
    );
}