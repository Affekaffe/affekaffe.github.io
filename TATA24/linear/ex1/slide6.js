import { Vector } from "../geometry/vector.js";
import { CoordinateCanvas } from "../geometry/canvas.js";
import { drawVector } from "../geometry/drawing.js";

let initialized = false;

export function initSlide6() {

    if (initialized) {
        return;
    }

    initialized = true;

    const canvas =
        document.getElementById("maze-canvas");

    if (!canvas) {
        throw new Error(
            "Could not find #maze-canvas"
        );
    }

    const coordinateCanvas =
        new CoordinateCanvas(canvas);


    // =================================================
    // SETTINGS
    // =================================================

    const COLORS = {
        u: "#006eff",
        v: "#00ff73",
        wall: "#6c0000",
        goal: "#d3de07",
        player: "#00ff73"
    };

    const WALL_SIZE = 1;
    const PLAYER_RADIUS = 0.18;

    const ACCELERATION = 0.003;
    const FRICTION = 0.985;
    const MAX_SPEED = 0.12;

    const WALL_PROBABILITY = 0.20;

    const MIN_BASIS_ANGLE = 15;


    // =================================================
    // STATE
    // =================================================

    let u;
    let v;

    let a = 0;
    let b = 0;

    let velocityA = 0;
    let velocityB = 0;

    let player;
    let goal;
    let walls;

    let deathTimeout = null;
    let courseTimeout = null;

    let hitWall = false;
    let courseFinished = false;

    let gameStarted = false;
    let gameLoopRunning = false;

    const startButton =
        document.getElementById("maze-start-button");

    const mazeOverlay =
        document.getElementById("maze-overlay");

    const keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };


    // =================================================
    // INPUT
    // =================================================

    startButton.addEventListener("click", () => {
        if (gameStarted) {
            return;
        }

        gameStarted = true;
        mazeOverlay.style.display = "none";

        gameLoopRunning = true;
        gameLoop();
    });

    window.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "ArrowUp" ||
                event.key === "ArrowDown" ||
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight"
            ) {
                event.preventDefault();

                if (event.key === "ArrowUp") {
                    keys.up = true;
                }

                if (event.key === "ArrowDown") {
                    keys.down = true;
                }

                if (event.key === "ArrowLeft") {
                    keys.left = true;
                }

                if (event.key === "ArrowRight") {
                    keys.right = true;
                }
            }
        }
    );

    window.addEventListener(
        "keyup",
        event => {

            if (event.key === "ArrowUp") {
                keys.up = false;
            }

            if (event.key === "ArrowDown") {
                keys.down = false;
            }

            if (event.key === "ArrowLeft") {
                keys.left = false;
            }

            if (event.key === "ArrowRight") {
                keys.right = false;
            }
        }
    );


    // =================================================
    // RANDOM BASIS
    // =================================================

    function createBasis() {

        const angle =
            Math.random() * Math.PI * 2;


        u =
            new Vector(
                Math.cos(angle),
                Math.sin(angle)
            );


        let vAngle;
        let candidate;


        do {

            vAngle =
                Math.random() * Math.PI * 2;

            candidate =
                new Vector(
                    Math.cos(vAngle),
                    Math.sin(vAngle)
                );

        } while (
            angleBetween(
                u,
                candidate
            ) < MIN_BASIS_ANGLE
        );


        v = candidate;
    }


    function angleBetween(a, b) {

        const dot =
            a.x * b.x +
            a.y * b.y;

        const lengths =
            a.length() *
            b.length();

        if (lengths === 0) {
            return 0;
        }

        const value =
            Math.max(
                -1,
                Math.min(
                    1,
                    dot / lengths
                )
            );

        const angle =
            Math.acos(value);

        // The smaller angle between the
        // two directions.
        return Math.min(
            angle,
            Math.PI - angle
        ) * 180 / Math.PI;
    }


    // =================================================
    // BOARD
    // =================================================

    function getBoardBounds() {

        const halfWidth =
            coordinateCanvas.width /
            coordinateCanvas.scale /
            2;

        const halfHeight =
            coordinateCanvas.height /
            coordinateCanvas.scale /
            2;


        return {

            minX:
                Math.ceil(
                    -halfWidth + 0.5
                ),

            maxX:
                Math.floor(
                    halfWidth - 0.5
                ),

            minY:
                Math.ceil(
                    -halfHeight + 0.5
                ),

            maxY:
                Math.floor(
                    halfHeight - 0.5
                )
        };
    }


    // =================================================
    // COURSE GENERATION
    // =================================================

    function createCourse() {

        if (courseTimeout !== null) {
            clearTimeout(courseTimeout);
            courseTimeout = null;
        }

        courseFinished = false;
        hitWall = false;

        createBasis();

        a = 0;
        b = 0;

        velocityA = 0;
        velocityB = 0;

        player =
            new Vector(0, 0);

        hitWall = false;


        const bounds =
            getBoardBounds();


        // -------------------------------------------------
        // Pick goal
        // -------------------------------------------------

        do {

            goal =
                new Vector(
                    randomGridPosition(
                        bounds.minX,
                        bounds.maxX
                    ),
                    randomGridPosition(
                        bounds.minY,
                        bounds.maxY
                    )
                );

        } while (
            goal.x === 0 &&
            goal.y === 0
        );


        // -------------------------------------------------
        // Generate a guaranteed path
        // -------------------------------------------------

        const path =
            createPath(
                new Vector(0, 0),
                goal
            );


        const pathKeys =
            new Set(
                path.map(
                    cell =>
                        cellKey(
                            cell.x,
                            cell.y
                        )
                )
            );


        // -------------------------------------------------
        // Add random deadly walls.
        //
        // Never place one on the guaranteed path.
        // -------------------------------------------------

        walls = [];


        for (
            let x = bounds.minX;
            x <= bounds.maxX;
            x++
        ) {

            for (
                let y = bounds.minY;
                y <= bounds.maxY;
                y++
            ) {

                const key =
                    cellKey(x, y);


                if (
                    pathKeys.has(key)
                ) {
                    continue;
                }


                if (
                    Math.random() <
                    WALL_PROBABILITY
                ) {

                    walls.push(
                        new Vector(x, y)
                    );
                }
            }
        }


        draw();
    }


    function randomGridPosition(min, max) {

        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }


    // =================================================
    // GUARANTEED PATH
    // =================================================

    function createPath(start, goal) {

        const path = [];

        let x = start.x;
        let y = start.y;


        path.push(
            new Vector(x, y)
        );


        // Move horizontally first.
        while (x !== goal.x) {

            x +=
                Math.sign(
                    goal.x - x
                );

            path.push(
                new Vector(x, y)
            );
        }


        // Then vertically.
        while (y !== goal.y) {

            y +=
                Math.sign(
                    goal.y - y
                );

            path.push(
                new Vector(x, y)
            );
        }


        return path;
    }


    function cellKey(x, y) {

        return `${x},${y}`;
    }


    // =================================================
    // MOVEMENT
    // =================================================

    function updateMovement() {

        if (hitWall) {
            return;
        }


        // -------------------------------------------------
        // Acceleration in basis directions
        // -------------------------------------------------

        if (keys.up) {
            velocityA += ACCELERATION;
        }

        if (keys.down) {
            velocityA -= ACCELERATION;
        }

        if (keys.right) {
            velocityB += ACCELERATION;
        }

        if (keys.left) {
            velocityB -= ACCELERATION;
        }


        // -------------------------------------------------
        // Limit speed
        // -------------------------------------------------

        velocityA =
            Math.max(
                -MAX_SPEED,
                Math.min(
                    MAX_SPEED,
                    velocityA
                )
            );

        velocityB =
            Math.max(
                -MAX_SPEED,
                Math.min(
                    MAX_SPEED,
                    velocityB
                )
            );


        // -------------------------------------------------
        // Friction
        // -------------------------------------------------

        velocityA *= FRICTION;
        velocityB *= FRICTION;


        // -------------------------------------------------
        // Calculate new position
        // -------------------------------------------------

        const newA =
            a + velocityA;

        const newB =
            b + velocityB;


        let newPosition =
            u
                .multiply(newA)
                .add(
                    v.multiply(newB)
                );


        // -------------------------------------------------
        // Board boundary
        // -------------------------------------------------

        newPosition =
            clampToBoard(
                newPosition
            );


        // -------------------------------------------------
        // Deadly wall collision
        // -------------------------------------------------

        if (
            isWallCollision(
                newPosition
            )
        ) {

            die();

            return;
        }


        // -------------------------------------------------
        // Accept movement
        // -------------------------------------------------

        const coordinates =
            toBasisCoordinates(
                newPosition
            );

        a = coordinates.a;
        b = coordinates.b;

        player =
            newPosition;


        // -------------------------------------------------
        // Goal
        // -------------------------------------------------

        if (
            !courseFinished &&
            distance(
                player,
                goal
            ) < 0.25
        ) {

            finishCourse();
        }
    }

    function finishCourse() {

        if (courseFinished) {
            return;
        }

        courseFinished = true;

        velocityA = 0;
        velocityB = 0;

        courseTimeout =
            setTimeout(
                () => {

                    courseTimeout = null;

                    createCourse();

                },
                600
            );
    }


    // =================================================
    // DEADLY WALL COLLISION
    // =================================================

    function isWallCollision(position) {

        for (const wall of walls) {

            const half =
                WALL_SIZE / 2;


            const minX =
                wall.x - half;

            const maxX =
                wall.x + half;

            const minY =
                wall.y - half;

            const maxY =
                wall.y + half;


            const closestX =
                Math.max(
                    minX,
                    Math.min(
                        position.x,
                        maxX
                    )
                );

            const closestY =
                Math.max(
                    minY,
                    Math.min(
                        position.y,
                        maxY
                    )
                );


            const dx =
                position.x -
                closestX;

            const dy =
                position.y -
                closestY;


            if (
                dx * dx +
                dy * dy
                <=
                PLAYER_RADIUS *
                PLAYER_RADIUS
            ) {

                return true;
            }
        }


        return false;
    }


    // =================================================
    // DEATH / RESET
    // =================================================

   function die() {

        hitWall = true;

        velocityA = 0;
        velocityB = 0;

        a = 0;
        b = 0;

        player =
            new Vector(0, 0);


        if (deathTimeout !== null) {
            clearTimeout(deathTimeout);
        }


        deathTimeout =
            setTimeout(
                () => {

                    deathTimeout = null;
                    hitWall = false;

                },
                150
            );
    }


    // =================================================
    // BOARD BOUNDARY
    // =================================================

    function clampToBoard(position) {

        const halfWidth =
            coordinateCanvas.width /
            coordinateCanvas.scale /
            2;

        const halfHeight =
            coordinateCanvas.height /
            coordinateCanvas.scale /
            2;


        const limitX =
            halfWidth -
            PLAYER_RADIUS;

        const limitY =
            halfHeight -
            PLAYER_RADIUS;


        return new Vector(

            Math.max(
                -limitX,
                Math.min(
                    limitX,
                    position.x
                )
            ),

            Math.max(
                -limitY,
                Math.min(
                    limitY,
                    position.y
                )
            )
        );
    }


    // =================================================
    // BASIS COORDINATES
    // =================================================

    function toBasisCoordinates(position) {

        const determinant =
            u.x * v.y -
            u.y * v.x;


        if (
            Math.abs(determinant)
            < 0.000001
        ) {

            return {
                a: 0,
                b: 0
            };
        }


        const a =
            (
                position.x * v.y -
                position.y * v.x
            ) / determinant;


        const b =
            (
                u.x * position.y -
                u.y * position.x
            ) / determinant;


        return {
            a,
            b
        };
    }


    // =================================================
    // DRAWING
    // =================================================

    function draw() {

        coordinateCanvas.drawGrid();

        drawMaze();

        drawBasisVectors();

        drawGoal();

        drawPlayer();
    }


    function drawBasisVectors() {

        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            u,
            COLORS.u,
            "u",
            3
        );


        drawVector(
            coordinateCanvas,
            new Vector(0, 0),
            v,
            COLORS.v,
            "v",
            3
        );
    }


    function drawMaze() {

        const ctx =
            coordinateCanvas.ctx;

        const cellSize =
            coordinateCanvas.scale;


        ctx.fillStyle =
            COLORS.wall;


        for (const wall of walls) {

            const screen =
                coordinateCanvas.toScreen(
                    wall
                );


            ctx.fillRect(

                screen.x -
                    cellSize / 2,

                screen.y -
                    cellSize / 2,

                cellSize,

                cellSize
            );
        }
    }


    function drawGoal() {

        const screen =
            coordinateCanvas.toScreen(
                goal
            );

        const ctx =
            coordinateCanvas.ctx;


        ctx.beginPath();

        ctx.arc(
            screen.x,
            screen.y,
            10,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            COLORS.goal;

        ctx.lineWidth = 4;

        ctx.stroke();
    }


    function drawPlayer() {

        const screen =
            coordinateCanvas.toScreen(
                player
            );

        const ctx =
            coordinateCanvas.ctx;


        ctx.beginPath();

        ctx.arc(
            screen.x,
            screen.y,
            7,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            hitWall
                ? "#e74c3c"
                : COLORS.player;

        ctx.fill();
    }


    // =================================================
    // UTILITIES
    // =================================================

    function distance(a, b) {

        return Math.sqrt(
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2
        );
    }


    // =================================================
    // GAME LOOP
    // =================================================

    function gameLoop() {

        if (!gameLoopRunning) {
            return;
        }

        updateMovement();

        draw();

        requestAnimationFrame(
            gameLoop
        );
    }


    window.addEventListener(
        "resize",
        () => {
            draw();
        }
    );


    createCourse();
}