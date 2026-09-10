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

    // Physical size of the whole playing field.
    const BOARD_SIZE = 8;

    // Grid starts at 8x8 and increases to 16x16.
    let gridSize = 8;
    const MAX_GRID_SIZE = 16;

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

    const controlButtons =
        document.querySelectorAll(
            ".maze-controls button"
        );


    // =================================================
    // INPUT
    // =================================================

    controlButtons.forEach(button => {

        const direction =
            button.dataset.direction;

        button.addEventListener(
            "pointerdown",
            event => {
                event.preventDefault();
                keys[direction] = true;
            }
        );

        button.addEventListener(
            "pointerup",
            event => {
                event.preventDefault();
                keys[direction] = false;
            }
        );

        button.addEventListener(
            "pointercancel",
            () => {
                keys[direction] = false;
            }
        );

        button.addEventListener(
            "pointerleave",
            () => {
                keys[direction] = false;
            }
        );
    });


    startButton.addEventListener(
        "click",
        () => {

            if (gameStarted) {
                return;
            }

            gameStarted = true;

            mazeOverlay.style.display = "none";

            gameLoopRunning = true;

            gameLoop();
        }
    );


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

        return Math.min(
            angle,
            Math.PI - angle
        ) * 180 / Math.PI;
    }


    // =================================================
    // BOARD
    // =================================================
    function isSpawnCell(x, y) {

        const cellSize =
            getCellSize();

        const half =
            cellSize / 2;

        const centerX =
            gridToWorld(x);

        const centerY =
            gridToWorld(y);

        const minX =
            centerX - half;

        const maxX =
            centerX + half;

        const minY =
            centerY - half;

        const maxY =
            centerY + half;

        const closestX =
            Math.max(
                minX,
                Math.min(0, maxX)
            );

        const closestY =
            Math.max(
                minY,
                Math.min(0, maxY)
            );

        const dx = closestX;
        const dy = closestY;

        return (
            dx * dx +
            dy * dy
            <=
            (PLAYER_RADIUS + 0.05) ** 2
        );
    }
    function getCellSize() {

        return BOARD_SIZE / gridSize;
    }


    function getBoardBounds() {

        const half =
            BOARD_SIZE / 2;

        return {
            minX: -half,
            maxX: half,
            minY: -half,
            maxY: half
        };
    }


    function gridToWorld(index) {

        const cellSize =
            getCellSize();

        const center =
            (gridSize - 1) / 2;

        return (
            (index - center) *
            cellSize
        );
    }


    // =================================================
    // COURSE GENERATION
    // =================================================

    function createCourse() {

        if (courseTimeout !== null) {

            clearTimeout(
                courseTimeout
            );

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


        // -------------------------------------------------
        // Pick goal
        // -------------------------------------------------

        let goalX;
        let goalY;

        do {

            goalX =
                Math.floor(
                    Math.random() *
                    gridSize
                );

            goalY =
                Math.floor(
                    Math.random() *
                    gridSize
                );

        } while (
            goalX === Math.floor(gridSize / 2) &&
            goalY === Math.floor(gridSize / 2)
        );


        goal =
            new Vector(
                gridToWorld(goalX),
                gridToWorld(goalY)
            );


        // -------------------------------------------------
        // Guaranteed path
        // -------------------------------------------------

        const startX = Math.floor(gridSize / 2);
        const startY = Math.floor(gridSize / 2);

        const start =
            new Vector(startX, startY);

        const path =
            createPath(
                start,
                new Vector(goalX, goalY)
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
        // Random walls
        // -------------------------------------------------

        // -------------------------------------------------
// Random walls
// -------------------------------------------------

walls = [];

for (
    let x = 0;
    x < gridSize;
    x++
) {

    for (
        let y = 0;
        y < gridSize;
        y++
    ) {

        const key =
            cellKey(x, y);

        if (pathKeys.has(key)) {
            continue;
        }

        if (
            Math.random() <
            WALL_PROBABILITY
        ) {

            walls.push({
                x: gridToWorld(x),
                y: gridToWorld(y)
            });
        }
    }
}


// -------------------------------------------------
// Clear spawn area
// -------------------------------------------------

    walls =
        walls.filter(
            wall =>
                !wallOverlapsPlayer(
                    wall,
                    new Vector(0, 0)
                )
        );

    draw();
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


        // Horizontal first.

        while (x !== goal.x) {

            x +=
                Math.sign(
                    goal.x - x
                );

            path.push(
                new Vector(x, y)
            );
        }


        // Vertical second.

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
        // Acceleration
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
        // New position
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
            ) < getCellSize() * 0.25
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

                    if (
                        gridSize <
                        MAX_GRID_SIZE
                    ) {
                        gridSize++;
                    }

                    createCourse();

                },
                600
            );
    }


    // =================================================
    // DEADLY WALL COLLISION
    // =================================================
    function wallOverlapsPlayer(wall, position) {

        const half =
            getCellSize() / 2;

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

        return (
            dx * dx +
            dy * dy
            <=
            PLAYER_RADIUS *
            PLAYER_RADIUS
        );
    }
    function isWallCollision(position) {

    for (const wall of walls) {

        if (
            wallOverlapsPlayer(
                wall,
                position
            )
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

            clearTimeout(
                deathTimeout
            );
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

        const half =
            BOARD_SIZE / 2;


        const limit =
            half -
            PLAYER_RADIUS;


        return new Vector(

            Math.max(
                -limit,
                Math.min(
                    limit,
                    position.x
                )
            ),

            Math.max(
                -limit,
                Math.min(
                    limit,
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

    const ctx =
        coordinateCanvas.ctx;

    ctx.clearRect(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );

    drawMaze();
    drawBoardBorder();
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

    function drawBoardBorder() {

        const ctx =
            coordinateCanvas.ctx;

        const topLeft =
            coordinateCanvas.toScreen(
                new Vector(
                    -BOARD_SIZE / 2,
                    BOARD_SIZE / 2
                )
            );

        const bottomRight =
            coordinateCanvas.toScreen(
                new Vector(
                    BOARD_SIZE / 2,
                    -BOARD_SIZE / 2
                )
            );

        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;

        ctx.strokeRect(
            topLeft.x,
            topLeft.y,
            bottomRight.x - topLeft.x,
            bottomRight.y - topLeft.y
        );
    }
    function drawMaze() {

        const ctx =
            coordinateCanvas.ctx;

        const cellSize =
            getCellSize() *
            coordinateCanvas.scale;


        ctx.fillStyle =
            COLORS.wall;


        for (const wall of walls) {

            const screen =
                coordinateCanvas.toScreen(
                    new Vector(
                        wall.x,
                        wall.y
                    )
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
            Math.max(
                6,
                getCellSize() *
                coordinateCanvas.scale *
                0.15
            ),
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