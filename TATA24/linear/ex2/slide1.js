import { Vector } from "../geometry/vector.js";
import { Camera3D } from "../geometry3D/camera.js";

import {
    drawVector3D,
    drawPlaneGrid,
    drawPolygon3D
} from "../geometry3D/drawing.js";

export function initSlide1() {

    const canvas = document.getElementById("cross-canvas");
    const ctx = canvas.getContext("2d");

    const COLORS = {
        grid: "#555",
        axis: "#aaa",
        u: "#006eff",
        v: "#00ff73",
        area: "rgba(199, 241, 255, 0.25)",
        cross: "#e74c3c",
        text: "#eee"
    };

    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    let vectorU = new Vector(2, -1);
    let vectorV = new Vector(0, 2);

    let dragging = null;

    let lastMouseX = 0;
    let lastMouseY = 0;

    const camera = new Camera3D(canvas, -1.3, -0.6); //init camera at nice rotation

    const GRID_SIZE = 4;


    // ------------------------------------------------------------
    // Cross product
    // ------------------------------------------------------------

    function getCrossProduct() {
        return vectorU.x * vectorV.y -
               vectorU.y * vectorV.x;
    }


    // ------------------------------------------------------------
    // Drawing
    // ------------------------------------------------------------

    function drawParallelogram() {

        const points = [
            {
                x: 0,
                y: 0,
                z: 0
            },
            {
                x: vectorU.x,
                y: vectorU.y,
                z: 0
            },
            {
                x: vectorU.x + vectorV.x,
                y: vectorU.y + vectorV.y,
                z: 0
            },
            {
                x: vectorV.x,
                y: vectorV.y,
                z: 0
            }
        ];

        drawPolygon3D(
            ctx,
            camera,
            points,
            COLORS.area,
            COLORS.area,
            2
        );
    }


    function drawCrossProduct() {

        const cross = getCrossProduct();

        drawVector3D(
            ctx,
            camera,
            {
                x: 0,
                y: 0,
                z: cross
            },
            COLORS.cross,
            "u × v"
        );
    }


    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawPlaneGrid(
            ctx,
            camera,
            GRID_SIZE,
            COLORS.grid
        );

        drawParallelogram();

        drawVector3D(
            ctx,
            camera,
            {
                x: vectorU.x,
                y: vectorU.y,
                z: 0
            },
            COLORS.u,
            "u"
        );

        drawVector3D(
            ctx,
            camera,
            {
                x: vectorV.x,
                y: vectorV.y,
                z: 0
            },
            COLORS.v,
            "v"
        );

        drawCrossProduct();

        updateInfo();
    }


    // ------------------------------------------------------------
    // Information panel
    // ------------------------------------------------------------

    function updateInfo() {

        document.getElementById("cross-ux").textContent =
            vectorU.x.toFixed(1);

        document.getElementById("cross-uy").textContent =
            vectorU.y.toFixed(1);

        document.getElementById("cross-vx").textContent =
            vectorV.x.toFixed(1);

        document.getElementById("cross-vy").textContent =
            vectorV.y.toFixed(1);

        document.getElementById("cross-value").textContent =
            getCrossProduct().toFixed(1);
    }


    // ------------------------------------------------------------
    // Mouse → xy-plane
    // ------------------------------------------------------------

    function getMousePosition(event) {

        const rect = canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }


    function screenToVector(mouseX, mouseY) {

        const position =
            camera.screenToPlane(mouseX, mouseY);

        return new Vector(
            Math.max(
                -GRID_SIZE,
                Math.min(GRID_SIZE, position.x)
            ),
            Math.max(
                -GRID_SIZE,
                Math.min(GRID_SIZE, position.y)
            )
        );
    }


    // ------------------------------------------------------------
    // Pointer interaction
    // ------------------------------------------------------------

    canvas.addEventListener("pointerdown", event => {

        const mouse = getMousePosition(event);

        const uScreen = camera.project(
            vectorU.x,
            vectorU.y,
            0
        );

        const vScreen = camera.project(
            vectorV.x,
            vectorV.y,
            0
        );

        const distanceU = Math.hypot(
            mouse.x - uScreen.x,
            mouse.y - uScreen.y
        );

        const distanceV = Math.hypot(
            mouse.x - vScreen.x,
            mouse.y - vScreen.y
        );

        if (distanceU < 20) {
            dragging = "u";
        }
        else if (distanceV < 20) {
            dragging = "v";
        }
        else {
            dragging = "scene";
        }

        lastMouseX = mouse.x;
        lastMouseY = mouse.y;

        canvas.setPointerCapture(event.pointerId);
    });


    canvas.addEventListener("pointermove", event => {

        if (!dragging) {
            return;
        }

        const mouse = getMousePosition(event);

        // --------------------------------------------------------
        // Orbit camera
        // --------------------------------------------------------

        if (dragging === "scene") {

            const dx = mouse.x - lastMouseX;
            const dy = mouse.y - lastMouseY;

            camera.orbit(dx, dy);

            lastMouseX = mouse.x;
            lastMouseY = mouse.y;

            draw();

            return;
        }


        // --------------------------------------------------------
        // Move vector
        // --------------------------------------------------------

        const vector =
            screenToVector(mouse.x, mouse.y);

        if (dragging === "u") {
            vectorU = vector;
        }

        if (dragging === "v") {
            vectorV = vector;
        }

        draw();
    });


    function stopDragging(event) {
        console.log(camera.rotationZ, camera.rotationX);
        dragging = null;

        if (
            event.pointerId !== undefined &&
            canvas.hasPointerCapture(event.pointerId)
        ) {
            canvas.releasePointerCapture(event.pointerId);
        }
    }


    canvas.addEventListener(
        "pointerup",
        event => {

            if (dragging === "u") {
                vectorU = snapVectorU(vectorU);
            }

            if (dragging === "v") {
                vectorV = snapVectorV(vectorV);
            }

            dragging = null;

            if (
                event.pointerId !== undefined &&
                canvas.hasPointerCapture(event.pointerId)
            ) {
                canvas.releasePointerCapture(
                    event.pointerId
                );
            }

            draw();
        }
    );
    canvas.addEventListener(
        "pointercancel",
        stopDragging
    );


    // ------------------------------------------------------------
    // Resize
    // ------------------------------------------------------------

    function resize() {

        camera.resize();

        draw();
    }

    window.addEventListener(
        "resize",
        resize
    );

    // -----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    function snapVectorU(vector) {

        const length = vector.length();

        // Snap to unit circle
        if (Math.abs(length - 1) < 0.12) {
            return normalize(vector);
        }

        // Snap to ±90° relative to v
        const angle =
            Math.atan2(vector.y, vector.x);

        const angleV =
            Math.atan2(vectorV.y, vectorV.x);

        const difference =
            normalizeAngle(angle - angleV);

        const ninety =
            Math.PI / 2;

        if (Math.abs(difference - ninety) < 0.12) {
            return rotateToAngle(vector, angleV + ninety);
        }

        if (Math.abs(difference + ninety) < 0.12) {
            return rotateToAngle(vector, angleV - ninety);
        }

        return vector;
    }


    function snapVectorV(vector) {

        const length = vector.length();

        // Snap to unit circle
        if (Math.abs(length - 1) < 0.12) {
            return normalize(vector);
        }

        // Snap to ±90° relative to u
        const angle =
            Math.atan2(vector.y, vector.x);

        const angleU =
            Math.atan2(vectorU.y, vectorU.x);

        const difference =
            normalizeAngle(angle - angleU);

        const ninety =
            Math.PI / 2;

        if (Math.abs(difference - ninety) < 0.12) {
            return rotateToAngle(vector, angleU + ninety);
        }

        if (Math.abs(difference + ninety) < 0.12) {
            return rotateToAngle(vector, angleU - ninety);
        }

        return vector;
    }


    function normalizeAngle(angle) {

        while (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }

        while (angle < -Math.PI) {
            angle += 2 * Math.PI;
        }

        return angle;
    }


    function rotateToAngle(vector, angle) {

        const length = vector.length();

        return new Vector(
            length * Math.cos(angle),
            length * Math.sin(angle)
        );
    }


    function normalize(vector) {

        const length = vector.length();

        if (length === 0) {
            return vector;
        }

        return vector.multiply(1 / length);
    }
    // ------------------------------------------------------------
    // Initial draw
    // ------------------------------------------------------------

    resize();
}