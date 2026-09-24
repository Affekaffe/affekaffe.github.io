import { Vector3D } from "../geometry3D/vector3D.js";
import { Camera3D } from "../geometry3D/camera.js";

import {
    drawVector3D,
    drawPolygon3D,
    drawLine3D
} from "../geometry3D/drawing.js";


export function initSlide2() {

    const canvas = document.getElementById("span2-canvas");
    const ctx = canvas.getContext("2d");

    const COLORS = {
        plane: "rgba(100, 150, 255, 0.18)",
        planeEdge: "rgba(120, 170, 255, 0.7)",
        grid: "rgba(150, 150, 150, 0.35)",
        u: "#006eff",
        v: "#00ff73"
    };


    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    const vectorV = new Vector3D(0, 2, 2);

    const U_LENGTH = 2.8;

    let uAngle = -45;


    // ------------------------------------------------------------
    // Camera
    // ------------------------------------------------------------

    const camera = new Camera3D(
        canvas,
        -0.5,
        -1.5,
        30
    );


    // ------------------------------------------------------------
    // u
    // ------------------------------------------------------------

    function getU() {

        const angle =
            uAngle * Math.PI / 180;

        return new Vector3D(
            0,
            U_LENGTH * Math.cos(angle),
            U_LENGTH * Math.sin(angle)
        );
    }


    // ------------------------------------------------------------
    // Points in the span
    // ------------------------------------------------------------

    function planePoint(a, b) {

        return getU()
            .multiply(a)
            .add(vectorV.multiply(b));
    }


    // ------------------------------------------------------------
    // Plane
    // ------------------------------------------------------------

    function drawPlane() {

        const PLANE_SIZE = 4;

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

        const PLANE_SIZE = 4;

        const GRID_STEP = 0.5;

        for (
            let i = -PLANE_SIZE;
            i <= PLANE_SIZE;
            i += GRID_STEP
        ) {

            // Lines parallel to v
            drawLine3D(
                ctx,
                camera,
                planePoint(i, -PLANE_SIZE),
                planePoint(i, PLANE_SIZE),
                COLORS.grid
            );


            // Lines parallel to u
            drawLine3D(
                ctx,
                camera,
                planePoint(-PLANE_SIZE, i),
                planePoint(PLANE_SIZE, i),
                COLORS.grid
            );
        }
    }


    // ------------------------------------------------------------
    // Vectors
    // ------------------------------------------------------------

    function drawVectors() {

        const u = getU();

        drawVector3D(
            ctx,
            camera,
            u,
            COLORS.u,
            "u"
        );


        drawVector3D(
            ctx,
            camera,
            vectorV,
            COLORS.v,
            "v"
        );
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

        drawVectors();
    }


    // ------------------------------------------------------------
    // Slider
    // ------------------------------------------------------------

    document
        .getElementById("span2-u-angle")
        .addEventListener("input", event => {

            uAngle =
                Number(event.target.value);

            draw();
        });


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
