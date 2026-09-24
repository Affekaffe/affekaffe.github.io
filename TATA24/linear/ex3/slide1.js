import { Vector3D } from "../geometry3D/vector3D.js";
import { Camera3D } from "../geometry3D/camera.js";

import {
    drawVector3D,
    drawPolygon3D,
    drawLine3D
} from "../geometry3D/drawing.js";


export function initSlide1() {

    const canvas = document.getElementById("span-canvas");
    const ctx = canvas.getContext("2d");

    const COLORS = {
        plane: "rgba(100, 150, 255, 0.18)",
        planeEdge: "rgba(120, 170, 255, 0.7)",
        grid: "rgba(150, 150, 150, 0.25)",
        u: "#006eff",
        v: "#00ff73",
        w: "#ffd500"
    };


    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    const vectorU = new Vector3D(2, 1, 1);
    const vectorV = new Vector3D(-1, 2, 1);

    let c1 = 1;
    let c2 = 1;

    const camera = new Camera3D(canvas, 0.6, 0.5, 10);

    const PLANE_SIZE = 15;


    // ------------------------------------------------------------
    // Scaled vectors
    // ------------------------------------------------------------

    function getU() {
        return vectorU.multiply(c1);
    }

    function getV() {
        return vectorV.multiply(c2);
    }

    function getW() {
        return getU().add(getV());
    }


    // ------------------------------------------------------------
    // Plane
    // ------------------------------------------------------------

    function planePoint(a, b) {

        return vectorU
            .multiply(a)
            .add(vectorV.multiply(b));
    }


    function drawPlane() {

        const points = [
            planePoint(-PLANE_SIZE, -PLANE_SIZE),
            planePoint( PLANE_SIZE, -PLANE_SIZE),
            planePoint( PLANE_SIZE,  PLANE_SIZE),
            planePoint(-PLANE_SIZE,  PLANE_SIZE)
        ];

        drawPolygon3D(
            ctx,
            camera,
            points,
            COLORS.plane,
            COLORS.planeEdge,
            2
        );
    }


    // ------------------------------------------------------------
    // Grid aligned with u and v
    // ------------------------------------------------------------

    function drawPlaneGrid() {

        for (let i = -PLANE_SIZE; i <= PLANE_SIZE; i++) {

            // Lines parallel to v
            drawLine3D(
                ctx,
                camera,
                planePoint(i, -PLANE_SIZE),
                planePoint(i,  PLANE_SIZE),
                COLORS.grid
            );

            // Lines parallel to u
            drawLine3D(
                ctx,
                camera,
                planePoint(-PLANE_SIZE, i),
                planePoint( PLANE_SIZE, i),
                COLORS.grid
            );
        }
    }


    // ------------------------------------------------------------
    // Parallelogram for c₁u + c₂v
    // ------------------------------------------------------------

    function drawCombination() {

        const scaledU = getU();
        const scaledV = getV();

        const points = [
            new Vector3D(0, 0, 0),

            scaledU,

            scaledU.add(scaledV),

            scaledV
        ];

        drawPolygon3D(
            ctx,
            camera,
            points,
            "rgba(255, 213, 0, 0)",
            "rgba(255, 213, 0, 0)",
            1
        );
    }


    // ------------------------------------------------------------
    // Information
    // ------------------------------------------------------------

    function updateInfo() {

        const w = getW();

        document.getElementById("span-c1-display").textContent =
            c1.toFixed(1);

        document.getElementById("span-c2-display").textContent =
            c2.toFixed(1);

        document.getElementById("span-wx").textContent =
            w.x.toFixed(1);

        document.getElementById("span-wy").textContent =
            w.y.toFixed(1);

        document.getElementById("span-wz").textContent =
            w.z.toFixed(1);
    }


    // ------------------------------------------------------------
    // Drawing
    // ------------------------------------------------------------

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawPlane();
        drawPlaneGrid();
        drawCombination();


        drawVector3D(
            ctx,
            camera,
            getU(),
            COLORS.u,
            ""
        );

        drawVector3D(
            ctx,
            camera,
            getV(),
            COLORS.v,
            "",
            getU()
        );


        // Resulting vector
        drawVector3D(
            ctx,
            camera,
            getW(),
            COLORS.w,
            "c₁u + c₂v"
        );


        updateInfo();
    }


    // ------------------------------------------------------------
    // Sliders
    // ------------------------------------------------------------

    document
        .getElementById("span-c1")
        .addEventListener("input", event => {

            c1 = Number(event.target.value);

            draw();
        });


    document
        .getElementById("span-c2")
        .addEventListener("input", event => {

            c2 = Number(event.target.value);

            draw();
        });
    document.getElementById("span-ux").textContent =
        getU().x.toFixed(1);

    document.getElementById("span-uy").textContent =
        getU().y.toFixed(1);

    document.getElementById("span-uz").textContent =
        getU().z.toFixed(1);

    document.getElementById("span-vx").textContent =
        getV().x.toFixed(1);

    document.getElementById("span-vy").textContent =
        getV().y.toFixed(1);

    document.getElementById("span-vz").textContent =
        getV().z.toFixed(1);

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


    // ------------------------------------------------------------
    // Initial draw
    // ------------------------------------------------------------

    resize();
}