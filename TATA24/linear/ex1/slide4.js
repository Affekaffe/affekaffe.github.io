import { Vector } from "../geometry/vector.js";
import { CoordinateCanvas } from "../geometry/canvas.js";
import { drawVector } from "../geometry/drawing.js";

let initialized = false;

export function initSlide4() {

    if (initialized) return;
    initialized = true;

    // --------------------------------------------------
    // Canvas
    // --------------------------------------------------

    const canvas =
        document.getElementById("dot-product-canvas");

    if (!canvas) {
        throw new Error(
            "Could not find #dot-product-canvas"
        );
    }

    const coordinateCanvas =
        new CoordinateCanvas(canvas);


    // --------------------------------------------------
    // Vectors
    // --------------------------------------------------

    let u =
        new Vector(3, 1);

    let v =
        new Vector(1, 2);


    const COLORS = {
        u: "#006eff",
        v: "#00ff73"
    };


    // --------------------------------------------------
    // Dragging
    // --------------------------------------------------

    let dragging = null;


    // --------------------------------------------------
    // Scalar product
    // --------------------------------------------------

    function dotProduct(a, b) {

        return a.x * b.x + a.y * b.y;
    }


    // --------------------------------------------------
    // Angle
    // --------------------------------------------------

    function angleBetween(a, b) {

        const lengthA = a.length();
        const lengthB = b.length();

        if (lengthA === 0 || lengthB === 0) {
            return 0;
        }

        const dot =
            dotProduct(a, b);

        const cosine =
            dot / (lengthA * lengthB);

        const clampedCosine =
            Math.max(-1, Math.min(1, cosine));

        return Math.acos(clampedCosine);
    }


    // --------------------------------------------------
    // Drawing
    // --------------------------------------------------

    function draw() {

        coordinateCanvas.drawGrid();


        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            u,
            COLORS.u,
            "u"
        );


        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            v,
            COLORS.v,
            "v"
        );


        updateInfo();
    }


    // --------------------------------------------------
    // Information
    // --------------------------------------------------

    function updateInfo() {

        const dot =
            dotProduct(u, v);

        const angle =
            angleBetween(u, v);

        const angleDegrees =
            angle * 180 / Math.PI;


        const dotElement =
            document.getElementById(
                "dot-product-value"
            );

        dotElement.textContent =
            dot.toFixed(2);


        if (dot > 0.001) {
            dotElement.style.color = "#00ff73";
        } else if (dot < -0.001) {
            dotElement.style.color = "#e74c3c";
        } else {
            dotElement.style.color = "#eee";
        }


        document.getElementById(
            "dot-product-angle"
        ).textContent =
            `${angleDegrees.toFixed(1)}°`;
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


            const uTip =
                coordinateCanvas.toScreen(u);

            const vTip =
                coordinateCanvas.toScreen(v);


            if (
                distance(mouse, uTip) < 20
            ) {

                dragging = "u";

                canvas.setPointerCapture(
                    event.pointerId
                );

            } else if (
                distance(mouse, vTip) < 20
            ) {

                dragging = "v";

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


            const newVector =
                new Vector(
                    Math.round(
                        mathPosition.x * 10
                    ) / 10,

                    Math.round(
                        mathPosition.y * 10
                    ) / 10
                );


            if (dragging === "u") {
                u = newVector;
            } else {
                v = newVector;
            }


            draw();
        }
    );


    // --------------------------------------------------
    // Pointer up
    // --------------------------------------------------

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
    // Helpers
    // --------------------------------------------------

    function distance(a, b) {

        return Math.sqrt(
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2
        );
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