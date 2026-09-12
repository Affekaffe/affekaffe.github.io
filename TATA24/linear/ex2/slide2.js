import { Vector3D } from "../geometry3D/vector3D.js";

import { Camera3D } from "../geometry3D/camera.js";

import {
    drawLine3D,
    drawVector3D,
    drawPolygon3D,
    drawPlaneGrid
} from "../geometry3D/drawing.js";


export function initSlide2() {

    const canvas = document.getElementById("plane-canvas");
    const ctx = canvas.getContext("2d");


    // --------------------------------------------------
    // Colors
    // --------------------------------------------------

    const COLORS = {
        grid: "#555",
        plane: "rgba(80, 150, 255, 0.20)",
        planeEdge: "#4f9cff",

        p: "#ffffff",
        u: "#006eff",
        v: "#00ff73",
        normal: "#e74c3c",

        intersection: "#5f7a9000",

        axis: "#aaa",
        text: "#eee"
    };


    // --------------------------------------------------
    // Plane
    // --------------------------------------------------

    // A point on the plane
    const p = new Vector3D(1, 1, 1);

    // Two spanning vectors
    const u = new Vector3D(-2, 0, 2);
    const v = new Vector3D(2, -1, 0);

    // Normal vector
    const n = u.cross(v);


    // --------------------------------------------------
    // Camera
    // --------------------------------------------------

    const camera = new Camera3D(
        canvas,
        -1.3,
        -0.6
    );


    const GRID_SIZE = 5;


    // --------------------------------------------------
    // View mode
    // --------------------------------------------------

    let normalForm = false;


    // --------------------------------------------------
    // Camera dragging
    // --------------------------------------------------

    let dragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;


    canvas.addEventListener("pointerdown", event => {

        const rect = canvas.getBoundingClientRect();

        lastMouseX = event.clientX - rect.left;
        lastMouseY = event.clientY - rect.top;

        dragging = true;

        canvas.setPointerCapture(event.pointerId);
    });


    canvas.addEventListener("pointermove", event => {

        if (!dragging) return;

        const rect = canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;

        camera.orbit(dx, dy);

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        draw();
    });


    canvas.addEventListener("pointerup", event => {

        dragging = false;

        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
    });


    canvas.addEventListener("pointercancel", () => {
        dragging = false;
    });


    // --------------------------------------------------
    // Draw the plane
    // --------------------------------------------------

    function drawPlane() {

        const planeScale = 2;

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
    // Find intersection between plane and xy-plane
    // --------------------------------------------------

   function getXYIntersection() {

        const direction = new Vector3D(
            -n.y,
            n.x,
            0
        );

        const directionLength = direction.length();

        if (directionLength < 1e-8) {
            return null;
        }

        let point;

        // Set x = 0 and solve for y
        if (Math.abs(n.y) > 1e-8) {

            const y =
                p.y +
                (n.x * p.x + n.z * p.z) / n.y;

            point = new Vector3D(
                0,
                y,
                0
            );

        } else {

            // n.y = 0, so solve for x
            const x =
                p.x +
                (n.y * p.y + n.z * p.z) / n.x;

            point = new Vector3D(
                x,
                0,
                0
            );
        }

        const unitDirection =
            direction.normalized();

        const length = GRID_SIZE * 1.5;

        return {
            start: point.subtract(
                unitDirection.multiply(length)
            ),

            end: point.add(
                unitDirection.multiply(length)
            )
        };
    }


    // --------------------------------------------------
    // Draw the intersection line
    // --------------------------------------------------

    function drawXYIntersection() {

        const intersection = getXYIntersection();

        if (!intersection) return;

        drawLine3D(
            ctx,
            camera,
            intersection.start,
            intersection.end,
            COLORS.intersection,
            5
        );
    }


    // --------------------------------------------------
    // Update displayed vectors
    // --------------------------------------------------

    function updateInfo() {

        // p
        document.getElementById("plane-px").textContent =
            p.x.toFixed(0);

        document.getElementById("plane-py").textContent =
            p.y.toFixed(0);

        document.getElementById("plane-pz").textContent =
            p.z.toFixed(0);


        // u
        document.getElementById("plane-ux").textContent =
            u.x.toFixed(0);

        document.getElementById("plane-uy").textContent =
            u.y.toFixed(0);

        document.getElementById("plane-uz").textContent =
            u.z.toFixed(0);


        // v
        document.getElementById("plane-vx").textContent =
            v.x.toFixed(0);

        document.getElementById("plane-vy").textContent =
            v.y.toFixed(0);

        document.getElementById("plane-vz").textContent =
            v.z.toFixed(0);


        // n
        document.getElementById("plane-nx").textContent =
            n.x.toFixed(0);

        document.getElementById("plane-ny").textContent =
            n.y.toFixed(0);

        document.getElementById("plane-nz").textContent =
            n.z.toFixed(0);

        document.getElementById("plane-px-normal").textContent =
            p.x.toFixed(0);

        document.getElementById("plane-py-normal").textContent =
            p.y.toFixed(0);

        document.getElementById("plane-pz-normal").textContent =
            p.z.toFixed(0);
    }


    // --------------------------------------------------
    // Main drawing
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


        // Intersection with xy-plane
        drawXYIntersection();


        // Point vector
        drawVector3D(
            ctx,
            camera,
            p,
            COLORS.p,
            "p"
        );


        if (!normalForm) {

            // Parameterform:
            //
            // x = p + su + tv

            drawVector3D(
                ctx,
                camera,
                u,
                COLORS.u,
                "u",
                p
            );

            drawVector3D(
                ctx,
                camera,
                v,
                COLORS.v,
                "v",
                p
            );

        } else {

            // Normalform:
            //
            // n · (x - p) = 0

            drawVector3D(
                ctx,
                camera,
                n,
                COLORS.normal,
                "n",
                p
            );
        }


        updateInfo();
    }


    // --------------------------------------------------
    // View buttons
    // --------------------------------------------------

    const parameterButton =
        document.getElementById("plane-parameter-button");

    const normalButton =
        document.getElementById("plane-normal-button");

    const parameterInfo =
        document.getElementById("plane-parameter-info");

    const normalInfo =
        document.getElementById("plane-normal-info");


    function setView(mode) {

        normalForm = mode === "normal";


        parameterButton.classList.toggle(
            "active",
            !normalForm
        );

        normalButton.classList.toggle(
            "active",
            normalForm
        );


        parameterInfo.style.display =
            normalForm ? "none" : "block";

        normalInfo.style.display =
            normalForm ? "block" : "none";


        draw();
    }


    parameterButton.addEventListener(
        "click",
        () => setView("parameter")
    );

    normalButton.addEventListener(
        "click",
        () => setView("normal")
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