import { Vector } from "../geometry/vector.js";
import { CoordinateCanvas } from "../geometry/canvas.js";
import {
    drawVector,
    drawPoint
} from "../geometry/drawing.js";

let initialized = false;

export function initSlide3() {

    if (initialized) {
        return;
    }

    initialized = true;

    // --------------------------------------------------
    // Canvas
    // --------------------------------------------------

    const canvas =
        document.getElementById("basis-canvas");

    if (!canvas) {
        throw new Error(
            "Could not find #basis-canvas"
        );
    }

    const coordinateCanvas =
        new CoordinateCanvas(canvas);


    // --------------------------------------------------
    // Basis vectors
    // --------------------------------------------------

    const u =
        new Vector(1, 1);

    const v =
        new Vector(1, -1);


    // --------------------------------------------------
    // Target
    // --------------------------------------------------

    function createTarget() {
        let x, y;

        do {
            x = [1, 2, -1, -2, -3][Math.floor(Math.random() * 5)];
            y = Math.floor(Math.random() * 5) - 2;
        } while (Math.abs(x) === Math.abs(y));

        return new Vector(x, y);
    }

    const target = createTarget();


    // --------------------------------------------------
    // Coefficients
    // --------------------------------------------------

    let a = 0;
    let b = 0;


    // --------------------------------------------------
    // Colors
    // --------------------------------------------------

    const COLORS = {
        u: "#006eff",
        v: "#00ff73",
        result: "#ffffff",
        target: "#e74c3c"
    };


    // --------------------------------------------------
    // Sliders
    // --------------------------------------------------

    const aSlider =
        document.getElementById(
            "basis-a-slider"
        );

    const bSlider =
        document.getElementById(
            "basis-b-slider"
        );


    aSlider.addEventListener(
        "input",
        () => {

            a =
                Number(aSlider.value);

            draw();
        }
    );


    bSlider.addEventListener(
        "input",
        () => {

            b =
                Number(bSlider.value);

            draw();
        }
    );


    // --------------------------------------------------
    // Calculate result
    // --------------------------------------------------

    function calculateResult() {

        return u
            .multiply(a)
            .add(
                v.multiply(b)
            );
    }


    // --------------------------------------------------
    // Drawing
    // --------------------------------------------------

    function draw() {

        coordinateCanvas.drawGrid();

        const result =
            calculateResult();


        // Target

        drawPoint(
            coordinateCanvas,
            target,
            8,
            COLORS.target
        );


        // Basis vectors

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


        // au

        if (a !== 0) {

            drawVector(
                coordinateCanvas,
                new Vector(0, 0),
                u.multiply(a),
                COLORS.u,
                "",
                2
            );
        }


        // bv

        if (b !== 0) {

            drawVector(
                coordinateCanvas,
                u.multiply(a),
                v.multiply(b),
                COLORS.v,
                "",
                2
            );
        }


        // Result

        if (result.length() > 0) {

            drawVector(
                coordinateCanvas,
                new Vector(0, 0),
                result,
                COLORS.result,
                "au + bv"
            );
        }


        updateInfo(result);
    }


    // --------------------------------------------------
    // Information
    // --------------------------------------------------

    function updateInfo(result) {

        document.getElementById("basis-a")
            .textContent =
            a.toFixed(1);

        document.getElementById("basis-b")
            .textContent =
            b.toFixed(1);


        document.getElementById("basis-result-x")
            .textContent =
            result.x.toFixed(1);

        document.getElementById("basis-result-y")
            .textContent =
            result.y.toFixed(1);

        const status =
            document.getElementById(
                "basis-success"
            );


        const success =
            Math.abs(result.x - target.x) < 0.05 &&
            Math.abs(result.y - target.y) < 0.05;


        if (success) {

            status.textContent =
                "✓ Du nådde punkten 😎";

            status.classList.add(
                "success"
            );

        } else {

            status.textContent = "";

            status.classList.remove(
                "success"
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