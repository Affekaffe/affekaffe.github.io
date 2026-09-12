import { Vector3D } from "../geometry3D/vector3D.js";

import { Camera3D } from "../geometry3D/camera.js";

import {
    drawLine3D,
    drawArrow3D,
    drawVector3D,
    drawPolygon3D,
    drawPlaneGrid
} from "../geometry3D/drawing.js";


export function initSlide3() {

    const canvas = document.getElementById("closest-point-canvas");
    const ctx = canvas.getContext("2d");


    // --------------------------------------------------
    // Colors
    // --------------------------------------------------

    const COLORS = {
        grid: "#555",

        plane: "rgba(80, 150, 255, 0.20)",
        planeEdge: "#4f9cff",

        p: "#ffffff",
        normal: "#e74c3c",

        q: "#ff9f43",
        endpoint: "#f1c40f",

        text: "#eee"
    };


    // --------------------------------------------------
    // Plane
    // --------------------------------------------------

    const p = new Vector3D(1, 1, 1);

    const u = new Vector3D(2, 0, 0);

    const v = new Vector3D(0, 2, 1);

    const n = u.cross(v);


    // --------------------------------------------------
    // Given point
    // --------------------------------------------------

    const q = new Vector3D(2, -1, 3);


    // --------------------------------------------------
    // Camera
    // --------------------------------------------------

    const camera = new Camera3D(
        canvas,
        -1.4,
        -1.4
    );

    const GRID_SIZE = 5;
    const PLANE_TOLERANCE = 0.1;

    // --------------------------------------------------
    // Lambda
    // --------------------------------------------------

    function getCorrectLambda() {

        return n.dot(
            p.subtract(q)
        ) / n.dot(n);
    }


    let lambda = 0.5;


    // --------------------------------------------------
    // Current point
    // --------------------------------------------------

    function getCurrentPoint() {

        return q.add(
            n.multiply(lambda)
        );
    }


    // --------------------------------------------------
    // Plane
    // --------------------------------------------------

    function drawPlane() {

        const planeScale = 1.5;

        const points = [

            p
                .subtract(u.multiply(planeScale))
                .subtract(v.multiply(planeScale)),

            p
                .add(u.multiply(planeScale))
                .subtract(v.multiply(planeScale)),

            p
                .add(u.multiply(planeScale))
                .add(v.multiply(planeScale)),

            p
                .subtract(u.multiply(planeScale))
                .add(v.multiply(planeScale))
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


    // --------------------------------------------------
    // Draw q as a point
    // --------------------------------------------------

    function drawPoint(point, color, radius = 7) {

        const screen = camera.project(
            point.x,
            point.y,
            point.z
        );

        ctx.fillStyle = color;

        ctx.beginPath();

        ctx.arc(
            screen.x,
            screen.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // --------------------------------------------------
    // Draw lambda n
    // --------------------------------------------------

    function drawLambdaNormal() {

        const currentPoint = getCurrentPoint();

        drawArrow3D(
            ctx,
            camera,
            q,
            currentPoint,
            COLORS.normal,
            4,
            10
        );
    }


    // --------------------------------------------------
    // Draw current endpoint
    // --------------------------------------------------

    function drawCurrentPoint() {

        const currentPoint = getCurrentPoint();

        const distanceFromPlane =
            Math.abs(n.dot(currentPoint.subtract(p))) / n.length();

        const pointColor =
            distanceFromPlane < PLANE_TOLERANCE
                ? "#0be200"
                : "yellow";

        drawPoint(
            currentPoint,
            pointColor,
            7
        );


        const screen = camera.project(
            currentPoint.x,
            currentPoint.y,
            currentPoint.z
        );

        ctx.fillStyle = pointColor;
        ctx.font = "bold 18px sans-serif";

        ctx.fillText(
            "q + tn",
            screen.x + 10,
            screen.y - 10
        );
    }


    // --------------------------------------------------
    // Information
    // --------------------------------------------------

    function updateInfo() {

        // p

        document.getElementById("closest-px").textContent =
            p.x.toFixed(0);

        document.getElementById("closest-py").textContent =
            p.y.toFixed(0);

        document.getElementById("closest-pz").textContent =
            p.z.toFixed(0);


        // q

        document.getElementById("closest-qx").textContent =
            q.x.toFixed(0);

        document.getElementById("closest-qy").textContent =
            q.y.toFixed(0);

        document.getElementById("closest-qz").textContent =
            q.z.toFixed(0);


        // n

        document.getElementById("closest-nx").textContent =
            n.x.toFixed(0);

        document.getElementById("closest-ny").textContent =
            n.y.toFixed(0);

        document.getElementById("closest-nz").textContent =
            n.z.toFixed(0);


        // lambda

        document.getElementById("closest-lambda").textContent =
            lambda.toFixed(2);


        // Slider

        document.getElementById("lambda-slider").value =
            lambda;
    }


    // --------------------------------------------------
    // Draw
    // --------------------------------------------------

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // xy-plane

        drawPlaneGrid(
            ctx,
            camera,
            GRID_SIZE,
            COLORS.grid
        );


        // Main plane

        drawPlane();


        // p vector

        drawVector3D(
            ctx,
            camera,
            p,
            COLORS.p,
            "p"
        );

        const normalUnit = n.normalized();

        drawVector3D(
            ctx,
            camera,
            normalUnit,
            COLORS.normal,
            "n",
            p
        );


        // q point

        drawPoint(
            q,
            COLORS.q,
            8
        );


        // q label

        const qScreen = camera.project(
            q.x,
            q.y,
            q.z
        );

        ctx.fillStyle = COLORS.q;
        ctx.font = "bold 18px sans-serif";

        ctx.fillText(
            "q",
            qScreen.x + 10,
            qScreen.y - 10
        );


        // lambda n

        drawLambdaNormal();


        // Endpoint

        drawCurrentPoint();


        updateInfo();
    }


    // --------------------------------------------------
    // Lambda slider
    // --------------------------------------------------

    const slider =
        document.getElementById("lambda-slider");


    slider.addEventListener(
        "input",
        () => {

            lambda =
                parseFloat(slider.value);

            draw();
        }
    );


    // --------------------------------------------------
    // Camera controls
    // --------------------------------------------------

    let dragging = false;

    let lastMouseX = 0;
    let lastMouseY = 0;


    canvas.addEventListener(
        "pointerdown",
        event => {

            const rect =
                canvas.getBoundingClientRect();

            lastMouseX =
                event.clientX - rect.left;

            lastMouseY =
                event.clientY - rect.top;

            dragging = true;

            canvas.setPointerCapture(
                event.pointerId
            );
        }
    );


    canvas.addEventListener(
        "pointermove",
        event => {

            if (!dragging) return;

            const rect =
                canvas.getBoundingClientRect();

            const mouseX =
                event.clientX - rect.left;

            const mouseY =
                event.clientY - rect.top;

            const dx =
                mouseX - lastMouseX;

            const dy =
                mouseY - lastMouseY;

            camera.orbit(dx, dy);

            lastMouseX = mouseX;
            lastMouseY = mouseY;

            draw();
        }
    );


    canvas.addEventListener(
        "pointerup",
        event => {

            dragging = false;

            if (
                canvas.hasPointerCapture(
                    event.pointerId
                )
            ) {
                canvas.releasePointerCapture(
                    event.pointerId
                );
            }
        }
    );


    canvas.addEventListener(
        "pointercancel",
        () => {
            dragging = false;
        }
    );


    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    function resize() {

        camera.resize();

        draw();
    }


    window.addEventListener(
        "resize",
        resize
    );


    // --------------------------------------------------
    // Start
    // --------------------------------------------------

    resize();
}