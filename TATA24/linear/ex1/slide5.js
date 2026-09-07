import { Vector } from "../geometry/vector.js";
import { CoordinateCanvas } from "../geometry/canvas.js";
import { drawVector } from "../geometry/drawing.js";

let initialized = false;

export function initSlide5() {

    if (initialized) {
        return;
    }

    initialized = true;

    // --------------------------------------------------
    // Canvas
    // --------------------------------------------------

    const canvas =
        document.getElementById("projection-canvas");

    if (!canvas) {
        throw new Error(
            "Could not find #projection-canvas"
        );
    }

    const coordinateCanvas =
        new CoordinateCanvas(canvas);


    // --------------------------------------------------
    // Vectors
    // --------------------------------------------------

    const u =
        new Vector(3, 1);

    let v =
        new Vector(1, 3);


    const COLORS = {
        u: "#006eff",
        v: "#ffffff",
        parallel: "#00ff73",
        perpendicular: "#e74c3c"
    };


    // --------------------------------------------------
    // Scalar product
    // --------------------------------------------------

    function dotProduct(a, b) {

        return a.x * b.x + a.y * b.y;
    }


    // --------------------------------------------------
    // Projection
    // --------------------------------------------------

    function projectionOnto(v, u) {

        const denominator =
            dotProduct(u, u);

        if (denominator === 0) {
            return new Vector(0, 0);
        }

        const scalar =
            dotProduct(v, u) / denominator;

        return u.multiply(scalar);
    }


    // --------------------------------------------------
    // Dragging
    // --------------------------------------------------

    let dragging = false;


    // --------------------------------------------------
    // Drawing
    // --------------------------------------------------

    function draw() {

        coordinateCanvas.drawGrid();


        // Projection of v onto u
        const vParallel =
            projectionOnto(v, u);


        // Perpendicular component
        const vPerpendicular =
            v.subtract(vParallel);


        // --------------------------------------------------
        // Fixed vector u
        // --------------------------------------------------

        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            u,
            COLORS.u,
            "u"
        );


        // --------------------------------------------------
        // Original vector v
        // --------------------------------------------------

        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            v,
            COLORS.v,
            "v"
        );


        // --------------------------------------------------
        // Parallel component
        // --------------------------------------------------

        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            vParallel,
            COLORS.parallel,
            "v∥",
            3
        );


        // --------------------------------------------------
        // Perpendicular component
        // --------------------------------------------------

        if (vPerpendicular.length() > 0.01) {

            drawVector(
                coordinateCanvas,
                vParallel,
                vPerpendicular,
                COLORS.perpendicular,
                "v⊥",
                3
            );
        }


        updateInfo(
            vParallel,
            vPerpendicular
        );
    }


    // --------------------------------------------------
    // Information
    // --------------------------------------------------

    function updateInfo(
        vParallel,
        vPerpendicular
    ) {

        const dot =
            dotProduct(u, v);

        document.getElementById(
            "projection-dot-product"
        ).textContent =
            dot.toFixed(2);


        document.getElementById(
            "projection-parallel-length"
        ).textContent =
            vParallel.length().toFixed(2);


        document.getElementById(
            "projection-perpendicular-length"
        ).textContent =
            vPerpendicular.length().toFixed(2);
    }


    // --------------------------------------------------
    // Pointer down
    // --------------------------------------------------

    canvas.addEventListener(
        "pointerdown",
        event => {

            const mouse =
                coordinateCanvas.pointerPosition(
                    event
                );

            const vTip =
                coordinateCanvas.toScreen(v);

            if (
                distance(mouse, vTip) < 20
            ) {

                dragging = true;

                canvas.setPointerCapture(
                    event.pointerId
                );
            }
        }
    );


    // --------------------------------------------------
    // Pointer move
    // --------------------------------------------------

    canvas.addEventListener(
        "pointermove",
        event => {

            if (!dragging) {
                return;
            }

            const position =
                coordinateCanvas.pointerPosition(
                    event
                );

            const mathPosition =
                coordinateCanvas.toMath(
                    position.x,
                    position.y
                );

            v =
                new Vector(
                    Math.round(
                        mathPosition.x * 10
                    ) / 10,

                    Math.round(
                        mathPosition.y * 10
                    ) / 10
                );

            snapToDotProduct(5);


            draw();
        }
    );


    // --------------------------------------------------
    // Pointer up
    // --------------------------------------------------

    canvas.addEventListener(
        "pointerup",
        event => {

            dragging = false;

            canvas.releasePointerCapture(
                event.pointerId
            );
        }
    );


    canvas.addEventListener(
        "pointercancel",
        () => {
            dragging = false;
        }
    );


    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    function distance(a, b) {

        return Math.sqrt(
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2
        );
    }


    function snapToDotProduct(target) {

        const currentDot =
            dotProduct(u, v);

        if (
            currentDot >= target - 0.2 &&
            currentDot <= target + 0.2
        ) {

            const parallel =
                projectionOnto(v, u);

            const perpendicular =
                v.subtract(parallel);

            const targetParallel =
                u.multiply(
                    target / dotProduct(u, u)
                );

            v =
                targetParallel.add(
                    perpendicular
                );
        }
    }


    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    window.addEventListener(
        "resize",
        draw
    );


    // --------------------------------------------------
    // Initial draw
    // --------------------------------------------------

    draw();
}