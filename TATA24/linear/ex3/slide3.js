import { Vector3D } from "../geometry3D/vector3D.js";
import { Camera3D } from "../geometry3D/camera.js";

import {
    drawPolygon3D,
    drawLine3D
} from "../geometry3D/drawing.js";


export function initSlide3() {

    const canvas = document.getElementById("subspace-canvas");
    const ctx = canvas.getContext("2d");


    const COLORS = {

        plane1:
            "rgba(0, 110, 255, 0.18)",

        plane1Edge:
            "rgba(0, 110, 255, 0.55)",

        plane2:
            "rgba(0, 255, 115, 0.18)",

        plane2Edge:
            "rgba(0, 255, 115, 0.55)",

        grid1:
            "rgba(0, 110, 255, 0.25)",

        grid2:
            "rgba(0, 255, 115, 0.25)",

        intersection:
            "#ffd500"
    };


    // ------------------------------------------------------------
    // Camera
    // ------------------------------------------------------------

    const camera = new Camera3D(
        canvas,
        0.6,
        0.5,
        20
    );


    // ------------------------------------------------------------
    // Plane 1
    //
    // z = 0
    //
    // Spanned by x- and y-axis
    // ------------------------------------------------------------

    const plane1U =
        new Vector3D(1, 0, 0);

    const plane1V =
        new Vector3D(0, 1, 0);


    // ------------------------------------------------------------
    // Plane 2
    //
    // Spanned by:
    //
    // x-axis
    // and a tilted direction in the yz-plane
    //
    // Therefore both planes contain the x-axis.
    // ------------------------------------------------------------

    const plane2U =
        new Vector3D(1, 0, 0);

    const plane2V =
        new Vector3D(0, 1, 1);


    const PLANE_SIZE = 5;


    // ------------------------------------------------------------
    // Plane points
    // ------------------------------------------------------------

    function planePoint(u, v, a, b) {

        return u
            .multiply(a)
            .add(v.multiply(b));
    }


    // ------------------------------------------------------------
    // Draw plane
    // ------------------------------------------------------------

    function drawPlane(
        u,
        v,
        fillColor,
        edgeColor
    ) {

        const points = [

            planePoint(
                u,
                v,
                -PLANE_SIZE,
                -PLANE_SIZE
            ),

            planePoint(
                u,
                v,
                 PLANE_SIZE,
                -PLANE_SIZE
            ),

            planePoint(
                u,
                v,
                 PLANE_SIZE,
                 PLANE_SIZE
            ),

            planePoint(
                u,
                v,
                -PLANE_SIZE,
                 PLANE_SIZE
            )
        ];


        drawPolygon3D(
            ctx,
            camera,
            points,
            fillColor,
            edgeColor,
            2
        );
    }


    // ------------------------------------------------------------
    // Draw grid
    // ------------------------------------------------------------

    function drawGrid(
        u,
        v,
        color
    ) {

        const GRID_SIZE = 5;
        const GRID_STEP = 1;


        for (
            let i = -GRID_SIZE;
            i <= GRID_SIZE;
            i += GRID_STEP
        ) {

            // Lines parallel to v

            drawLine3D(
                ctx,
                camera,

                planePoint(
                    u,
                    v,
                    i,
                    -GRID_SIZE
                ),

                planePoint(
                    u,
                    v,
                    i,
                     GRID_SIZE
                ),

                color
            );


            // Lines parallel to u

            drawLine3D(
                ctx,
                camera,

                planePoint(
                    u,
                    v,
                    -GRID_SIZE,
                    i
                ),

                planePoint(
                    u,
                    v,
                     GRID_SIZE,
                    i
                ),

                color
            );
        }
    }


    // ------------------------------------------------------------
    // Intersection line
    //
    // Both planes contain the x-axis.
    // ------------------------------------------------------------

    function drawIntersection() {

        const start =
            new Vector3D(-PLANE_SIZE, 0, 0);

        const end =
            new Vector3D(PLANE_SIZE, 0, 0);


        drawLine3D(
            ctx,
            camera,
            start,
            end,
            COLORS.intersection,
            5
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


        // Plane 1

        drawPlane(
            plane1U,
            plane1V,
            COLORS.plane1,
            COLORS.plane1Edge
        );


        // Plane 2

        drawPlane(
            plane2U,
            plane2V,
            COLORS.plane2,
            COLORS.plane2Edge
        );


        // Grids

        drawGrid(
            plane1U,
            plane1V,
            COLORS.grid1
        );


        drawGrid(
            plane2U,
            plane2V,
            COLORS.grid2
        );


        // Intersection

        drawIntersection();
    }


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
