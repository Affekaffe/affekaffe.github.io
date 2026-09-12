import { Vector3D } from "../geometry3D/vector3D.js";
import { Camera3D } from "../geometry3D/camera.js";
import {
    drawVector3D,
    drawArrow3D,
    drawPolygon3D,
    drawPlaneGrid
} from "../geometry3D/drawing.js";

let initialized = false;

export function initSlide4() {

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

    const ctx = canvas.getContext("2d");

    const camera = new Camera3D(canvas);


    // =================================================
    // SETTINGS
    // =================================================

    const COLORS = {
        plane: "rgba(80, 80, 80, 0.25)",
        planeEdge: "#888",
        grid: "rgba(150, 150, 150, 0.25)",
        ball: "#00ff73",
        hole: "#111",
        goal: "#d3de07",
        axisX: "#006eff",
        axisY: "#00ff73"
    };

    const BOARD_SIZE = 8;

    const BALL_RADIUS = 0.18;

    const ACCELERATION = 0.004;
    const FRICTION = 0.985;
    const MAX_SPEED = 0.12;

    const MAX_TILT = 0.6;

    let level = 1;
    let holeCount = 4;

    const MAX_LEVEL = 20;

    const GRID_SIZE = 12;


    const HOLE_PROBABILITY = 0.20;


    // =================================================
    // STATE
    // =================================================

    let ball;
    let velocity;

    let goal;
    let holes = [];
    let walls = [];

    let tiltX = 0;
    let tiltY = 0;

    let gameStarted = false;
    let gameLoopRunning = false;

    let dead = false;
    let levelFinished = false;

    let resetTimeout = null;
    let levelTimeout = null;


    // =================================================
    // INPUT
    // =================================================

    const keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    const startButton =
        document.getElementById(
            "maze-start-button"
        );

    const overlay =
        document.getElementById(
            "maze-overlay"
        );

    const controlButtons =
        document.querySelectorAll(
            ".maze-controls button"
        );


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
    // START
    // =================================================

    startButton.addEventListener(
        "click",
        () => {

            if (gameStarted) {
                return;
            }

            gameStarted = true;

            overlay.style.display = "none";

            gameLoopRunning = true;

            gameLoop();
        }
    );


    // =================================================
    // LEVEL GENERATION
    // =================================================
    function findGoalCell(maze, start) {
        const candidates = [];

        for (let x = 1; x < GRID_SIZE; x += 2) {
            for (let y = 1; y < GRID_SIZE; y += 2) {

                if (maze[y][x] !== 0) {
                    continue;
                }

                const distance = Math.abs(x - start.x)
                    + Math.abs(y - start.y);

                if (distance >= GRID_SIZE - 4) {
                    candidates.push({ x, y });
                }
            }
        }

        if (candidates.length === 0) {
            return null;
        }

        return candidates[
            Math.floor(Math.random() * candidates.length)
        ];
    }
    function createLevel() {
        levelFinished = false;
        dead = false;

        tiltX = 0;
        tiltY = 0;

        velocity = new Vector3D();
        ball = new Vector3D(0, 0, 0);

        while (true) {
            const maze = generateMaze();

            const start = {
                x: Math.floor(GRID_SIZE / 2),
                y: Math.floor(GRID_SIZE / 2)
            };

            // Clear spawn and its four neighbours.
            maze[start.y][start.x] = 0;
            maze[start.y - 1][start.x] = 0;
            maze[start.y + 1][start.x] = 0;
            maze[start.y][start.x - 1] = 0;
            maze[start.y][start.x + 1] = 0;

            const goalCell = findGoalCell(maze, start);

            if (!goalCell) {
                continue;
            }

            const path = createPath(maze, start, goalCell);

            const newHoles = [];

            for (let x = 0; x < GRID_SIZE; x++) {
                for (let y = 0; y < GRID_SIZE; y++) {

                    // Maze walls become holes.
                    if (maze[y][x] === 1) {
                        newHoles.push(cellToPoint(x, y));
                    }
                }
            }

            holes = newHoles;
            walls = [];

            goal = cellToPoint(
                goalCell.x,
                goalCell.y
            );

            break;
        }

        draw();
    }
    function generateMaze() {
        const maze = [];

        for (let y = 0; y < GRID_SIZE; y++) {
            maze[y] = [];

            for (let x = 0; x < GRID_SIZE; x++) {
                maze[y][x] = 1;
            }
        }

        const visited = new Set();

        function key(x, y) {
            return `${x},${y}`;
        }

        function carve(x, y) {
            visited.add(key(x, y));
            maze[y][x] = 0;

            const directions = [
                { dx: 2, dy: 0 },
                { dx: -2, dy: 0 },
                { dx: 0, dy: 2 },
                { dx: 0, dy: -2 }
            ];

            // Randomize directions.
            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                [directions[i], directions[j]] =
                    [directions[j], directions[i]];
            }

            for (const direction of directions) {
                const nx = x + direction.dx;
                const ny = y + direction.dy;

                if (
                    nx <= 0 ||
                    nx >= GRID_SIZE - 1 ||
                    ny <= 0 ||
                    ny >= GRID_SIZE - 1
                ) {
                    continue;
                }

                if (visited.has(key(nx, ny))) {
                    continue;
                }

                // Remove the wall between the cells.
                maze[
                    y + direction.dy / 2
                ][
                    x + direction.dx / 2
                ] = 0;

                carve(nx, ny);
            }
        }

        carve(1, 1);

        return maze;
    }
    function randomGoalCell(start) {
        let goal;

        do {
            goal = randomCell();
        } while (
            goal.x === start.x &&
            goal.y === start.y
        );

        return goal;
    }
    function distanceCells(x1, y1, x2, y2) {
        return Math.max(
            Math.abs(x1 - x2),
            Math.abs(y1 - y2)
        );
    }
    function cellContainsWall(x, y, wallList) {
        const point = cellToPoint(x, y);

        const cellSize = BOARD_SIZE / GRID_SIZE;
        const half = cellSize * 0.45;

        return wallList.some(wall =>
            Math.abs(wall.x - point.x) < half &&
            Math.abs(wall.y - point.y) < half
        );
    }
    function drawWalls() {

        for (const wall of walls) {

            const size =
                BOARD_SIZE / GRID_SIZE;

            const half =
                size * 0.45;

            const points = [

                getPointOnPlane(
                    wall.x - half,
                    wall.y - half
                ),

                getPointOnPlane(
                    wall.x + half,
                    wall.y - half
                ),

                getPointOnPlane(
                    wall.x + half,
                    wall.y + half
                ),

                getPointOnPlane(
                    wall.x - half,
                    wall.y + half
                )
            ];

            drawPolygon3D(
                ctx,
                camera,
                points,
                "#6c0000",
                "#aa2222",
                2
            );
        }
    }

    function createPath(maze, start, goal) {
        const queue = [start];
        const previous = new Map();

        const startKey = `${start.x},${start.y}`;
        previous.set(startKey, null);

        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        while (queue.length > 0) {
            const current = queue.shift();

            if (
                current.x === goal.x &&
                current.y === goal.y
            ) {
                break;
            }

            for (const direction of directions) {
                const next = {
                    x: current.x + direction.dx,
                    y: current.y + direction.dy
                };

                if (
                    next.x < 0 ||
                    next.x >= GRID_SIZE ||
                    next.y < 0 ||
                    next.y >= GRID_SIZE
                ) {
                    continue;
                }

                if (maze[next.y][next.x] === 1) {
                    continue;
                }

                const key = `${next.x},${next.y}`;

                if (previous.has(key)) {
                    continue;
                }

                previous.set(
                    key,
                    `${current.x},${current.y}`
                );

                queue.push(next);
            }
        }

        const path = [];
        let current = goal;

        while (current) {
            path.push(current);

            const previousKey =
                previous.get(`${current.x},${current.y}`);

            if (!previousKey) {
                break;
            }

            const [x, y] = previousKey.split(",").map(Number);

            current = { x, y };
        }

        return path.reverse();
    }
    function cellToPoint(x, y) {

        const cellSize =
            BOARD_SIZE / GRID_SIZE;

        const center =
            (GRID_SIZE - 1) / 2;

        return new Vector3D(
            (x - center) * cellSize,
            (y - center) * cellSize,
            0
        );
    }


    function randomCell() {

        return {
            x: Math.floor(
                Math.random() * GRID_SIZE
            ),
            y: Math.floor(
                Math.random() * GRID_SIZE
            )
        };
    }
    function randomPoint() {

        const limit =
            BOARD_SIZE / 2 - 0.5;

        return new Vector3D(
            randomRange(-limit, limit),
            randomRange(-limit, limit),
            0
        );
    }


    function randomRange(min, max) {

        return (
            min +
            Math.random() *
            (max - min)
        );
    }


    // =================================================
    // PLANE
    // =================================================

    function planeHeight(x, y) {

        return (
            tiltX * x +
            tiltY * y
        );
    }


    function getPointOnPlane(x, y) {

        return new Vector3D(
            x,
            y,
            planeHeight(x, y)
        );
    }


    // =================================================
    // MOVEMENT
    // =================================================

    function updateMovement() {

        if (
            dead ||
            levelFinished
        ) {
            return;
        }


        // -------------------------------------------------
        // Tilt
        // -------------------------------------------------

        if (keys.up) {
            tiltY += 0.008;
        }

        if (keys.down) {
            tiltY -= 0.008;
        }

        if (keys.right) {
            tiltX += 0.008;
        }

        if (keys.left) {
            tiltX -= 0.008;
        }


        tiltX =
            Math.max(
                -MAX_TILT,
                Math.min(
                    MAX_TILT,
                    tiltX
                )
            );

        tiltY =
            Math.max(
                -MAX_TILT,
                Math.min(
                    MAX_TILT,
                    tiltY
                )
            );


       
        const gravity =
            new Vector3D(0, 0, -1);

        const normal =
            new Vector3D(
                -tiltX,
                -tiltY,
                1
            ).normalized();

        const normalComponent =
            normal.multiply(
                gravity.dot(normal)
            );

        const gravityOnPlane =
            gravity
                .subtract(normalComponent)
                .multiply(-1);

        velocity.x +=
            gravityOnPlane.x * ACCELERATION;

        velocity.y +=
            gravityOnPlane.y * ACCELERATION;

        // -------------------------------------------------
        // Speed
        // -------------------------------------------------

        const speed =
            Math.sqrt(
                velocity.x ** 2 +
                velocity.y ** 2
            );

        if (speed > MAX_SPEED) {

            const scale =
                MAX_SPEED / speed;

            velocity.x *= scale;
            velocity.y *= scale;
        }


        // -------------------------------------------------
        // Friction
        // -------------------------------------------------

        velocity.x *= FRICTION;
        velocity.y *= FRICTION;


        // -------------------------------------------------
        // Position
        // -------------------------------------------------

        const oldX = ball.x;
        const oldY = ball.y;

        ball.x += velocity.x;
        ball.y += velocity.y;


        clampBall();


        // -------------------------------------------------
        // Holes
        // -------------------------------------------------

        for (const hole of holes) {

            if (
                distance2D(
                    ball,
                    hole
                ) <
                BALL_RADIUS + 0.18
            ) {

                die();

                return;
            }
        }


        // -------------------------------------------------
        // Goal
        // -------------------------------------------------

        if (
            distance2D(
                ball,
                goal
            ) < 0.35
        ) {

            finishLevel();
        }
    }
    
    

    function clampBall() {

        const limit =
            BOARD_SIZE / 2 -
            BALL_RADIUS;

        ball.x =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    ball.x
                )
            );

        ball.y =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    ball.y
                )
            );
    }


    // =================================================
    // DEATH
    // =================================================

    function die() {
        if (dead) return;

        dead = true;

        velocity.x = 0;
        velocity.y = 0;

        tiltX = 0;
        tiltY = 0;

        if (resetTimeout !== null) {
            clearTimeout(resetTimeout);
        }

        resetTimeout = setTimeout(() => {
            resetTimeout = null;

            ball.x = 0;
            ball.y = 0;

            velocity.x = 0;
            velocity.y = 0;

            tiltX = 0;
            tiltY = 0;

            dead = false;
        }, 500);
    }


    // =================================================
    // LEVEL COMPLETE
    // =================================================

    function finishLevel() {

        if (levelFinished) {
            return;
        }

        levelFinished = true;

        velocity.x = 0;
        velocity.y = 0;


        if (levelTimeout !== null) {
            clearTimeout(levelTimeout);
        }


        levelTimeout =
            setTimeout(
                () => {

                    levelTimeout = null;

                    level++;

                    holeCount =
                        Math.min(
                            4 + level,
                            25
                        );

                    if (
                        level >
                        MAX_LEVEL
                    ) {
                        level = 1;
                        holeCount = 4;
                    }

                    createLevel();

                },
                700
            );
    }


    // =================================================
    // DRAW
    // =================================================

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        drawPlane();

        drawHoles();
        drawGoal();
        drawBall();

        drawControls();
    }


    function drawPlane() {

        const half =
            BOARD_SIZE / 2;

        const points = [

            getPointOnPlane(
                -half,
                -half
            ),

            getPointOnPlane(
                half,
                -half
            ),

            getPointOnPlane(
                half,
                half
            ),

            getPointOnPlane(
                -half,
                half
            )
        ];


        drawPolygon3D(
            ctx,
            camera,
            points,
            COLORS.plane,
            COLORS.planeEdge,
            2
        );


        // Grid follows the tilted plane.

        const steps = 8;

        for (
            let i = 0;
            i <= steps;
            i++
        ) {

            const value =
                -half +
                i *
                BOARD_SIZE /
                steps;

            drawLineOnPlane(
                -half,
                value,
                half,
                value
            );

            drawLineOnPlane(
                value,
                -half,
                value,
                half
            );
        }
    }


    function drawLineOnPlane(
        x1,
        y1,
        x2,
        y2
    ) {

        const a =
            camera.project(
                x1,
                y1,
                planeHeight(
                    x1,
                    y1
                )
            );

        const b =
            camera.project(
                x2,
                y2,
                planeHeight(
                    x2,
                    y2
                )
            );

        ctx.strokeStyle =
            COLORS.grid;

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
            a.x,
            a.y
        );

        ctx.lineTo(
            b.x,
            b.y
        );

        ctx.stroke();
    }


    function drawHoles() {

        for (const hole of holes) {

            const center =
                camera.project(
                    hole.x,
                    hole.y,
                    planeHeight(
                        hole.x,
                        hole.y
                    ) + 0.01
                );

            ctx.beginPath();

            ctx.arc(
                center.x,
                center.y,
                10,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                COLORS.hole;

            ctx.fill();
        }
    }


    function drawGoal() {

        const point =
            camera.project(
                goal.x,
                goal.y,
                planeHeight(
                    goal.x,
                    goal.y
                ) + 0.02
            );

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            10,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            COLORS.goal;

        ctx.lineWidth = 4;

        ctx.stroke();
    }


    function drawBall() {

        const point =
            camera.project(
                ball.x,
                ball.y,
                planeHeight(
                    ball.x,
                    ball.y
                ) + BALL_RADIUS
            );


        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            9,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            dead
                ? "#e74c3c"
                : COLORS.ball;

        ctx.fill();
    }


    function drawControls() {

        const origin =
            camera.project(
                0,
                0,
                planeHeight(0, 0)
            );


        drawArrow3D(
            ctx,
            camera,
            getPointOnPlane(0, 0),
            getPointOnPlane(1, 0),
            COLORS.axisX,
            3,
            8
        );


        drawArrow3D(
            ctx,
            camera,
            getPointOnPlane(0, 0),
            getPointOnPlane(0, 1),
            COLORS.axisY,
            3,
            8
        );
    }





    // =================================================
    // UTILITIES
    // =================================================

    function distance2D(a, b) {

        return Math.sqrt(
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2
        );
    }


    // =================================================
    // LOOP
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

            camera.resize();

            draw();
        }
    );


    createLevel();
}