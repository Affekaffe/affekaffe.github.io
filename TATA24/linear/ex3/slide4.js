export function initSlide4() {

    const canvas =
        document.getElementById("chocolate-canvas");

    const ctx =
        canvas.getContext("2d");


    const startButton =
        document.getElementById("chocolate-start");

    const overlay =
        document.getElementById("chocolate-overlay");

    const scoreDisplay =
        document.getElementById("chocolate-score");

    const massDisplay =
        document.getElementById("chocolate-mass");

    const leftButton =
        document.getElementById("chocolate-left");

    const rightButton =
        document.getElementById("chocolate-right");


    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    let running = false;
    let gameOver = false;

    let animationFrame = null;
    let lastTime = 0;

    let score = 0;
    let mass = 1;

    let worldSpeed = 160;

    let spawnTimer = 0;
    let spawnInterval = 0.8;

    let difficultyTimer = 0;

    let playerX = 0;
    let playerY = 0;

    let playerRadius = 0;


    const balls = [];


    // ------------------------------------------------------------
    // Controls
    // ------------------------------------------------------------

    let moveLeft = false;
    let moveRight = false;


    // ------------------------------------------------------------
    // Resize
    // ------------------------------------------------------------

    function resize() {

        const rect =
            canvas.getBoundingClientRect();

        const dpr =
            window.devicePixelRatio || 1;

        canvas.width =
            rect.width * dpr;

        canvas.height =
            rect.height * dpr;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        playerY =
            rect.height - 80;

        if (!running) {

            playerX =
                rect.width / 2;
        }

        updatePlayerRadius();

        draw();
    }


    window.addEventListener(
        "resize",
        resize
    );


    // ------------------------------------------------------------
    // Player size
    // ------------------------------------------------------------

    function updatePlayerRadius() {

        /*
         * The size of the chocolate ball is directly
         * determined by its mass.
         *
         * mass = 0 -> radius = 0
         */

        if (mass <= 0) {

            playerRadius = 0;

            return;
        }


        playerRadius =
            Math.sqrt(mass) * 22;
    }


    // ------------------------------------------------------------
    // Control speed
    // ------------------------------------------------------------

    function getControlSpeed() {

        /*
         * Starts at 360 px/s.
         *
         * At 1000 points:
         *     360 -> 720 px/s
         *
         * The square-root curve makes the increase
         * noticeable early, but increasingly slower.
         */

        const progress =
            Math.min(
                1,
                score / 1000
            );


        const easedProgress =
            Math.sqrt(progress);


        return (
            360 +
            360 * easedProgress
        );
    }


    // ------------------------------------------------------------
    // Player
    // ------------------------------------------------------------

    function updatePlayer(dt) {

        const rect =
            canvas.getBoundingClientRect();


        /*
         * Control speed increases with score.
         */

        const playerSpeed =
            getControlSpeed();


        if (moveLeft) {

            playerX -=
                playerSpeed * dt;
        }


        if (moveRight) {

            playerX +=
                playerSpeed * dt;
        }


        updatePlayerRadius();


        const margin =
            playerRadius + 5;


        if (margin > 0) {

            playerX =
                Math.max(
                    margin,
                    Math.min(
                        rect.width - margin,
                        playerX
                    )
                );

        } else {

            playerX =
                Math.max(
                    0,
                    Math.min(
                        rect.width,
                        playerX
                    )
                );
        }
    }


    // ------------------------------------------------------------
    // Difficulty
    // ------------------------------------------------------------

    function updateDifficulty(dt) {

        difficultyTimer +=
            dt;


        /*
         * World speed.
         *
         * The speed approaches a maximum using
         * exponential easing.
         *
         * Early game:
         *     noticeable acceleration
         *
         * Mid game:
         *     slower acceleration
         *
         * Late game:
         *     almost constant
         */

        const START_SPEED =
            160;

        const MAX_SPEED =
            520;

        const ACCELERATION =
            0.045;


        worldSpeed =
            START_SPEED +
            (MAX_SPEED - START_SPEED) *
            (
                1 -
                Math.exp(
                    -ACCELERATION *
                    difficultyTimer
                )
            );


        /*
         * Spawn interval also slows its decrease
         * as the game progresses.
         */

        const START_INTERVAL =
            0.8;

        const MIN_INTERVAL =
            0.28;

        const SPAWN_ACCELERATION =
            0.035;


        spawnInterval =
            MIN_INTERVAL +
            (START_INTERVAL - MIN_INTERVAL) *
            Math.exp(
                -SPAWN_ACCELERATION *
                difficultyTimer
            );
    }


    // ------------------------------------------------------------
    // Spawn balls
    // ------------------------------------------------------------

    function spawnBall() {

        const rect =
            canvas.getBoundingClientRect();


        const isAntimatter =
            Math.random() < 0.36;


        let radius;
        let ballMass;


        // --------------------------------------------------------
        // Chocolate
        // --------------------------------------------------------

        if (!isAntimatter) {

            radius =
                10 +
                Math.random() * 8;


            /*
             * Matter balls give a small amount of mass.
             */

            ballMass =
                radius / 10;
        }


        // --------------------------------------------------------
        // Antimatter
        // --------------------------------------------------------

        else {

            /*
             * Antimatter becomes stronger as the player
             * becomes more massive.
             *
             * Growing larger therefore does NOT make
             * the game completely safe.
             */

            ballMass =
                0.5 +
                Math.sqrt(mass) *
                (0.9 + Math.random() * 1.1);


            /*
             * Convert antimatter mass into visual size.
             */

            radius =
                8 +
                ballMass * 7;


            /*
             * Occasionally create a dangerous
             * antimatter ball.
             */

            if (Math.random() < 0.10) {

                const multiplier =
                    2.5 +
                    Math.random() * 1.5;


                radius *=
                    multiplier;


                ballMass *=
                    multiplier;
            }


            /*
             * ----------------------------------------------------
             * Maximum antimatter size
             * ----------------------------------------------------
             *
             * An antimatter ball can never become larger than
             * 95% of the player's current chocolate ball.
             *
             * This prevents balls from becoming physically
             * impossible to dodge.
             */

            const currentPlayerRadius =
                Math.sqrt(
                    Math.max(mass, 0)
                ) * 22;


            const maxRadius =
                currentPlayerRadius * 0.95;


            if (
                radius >
                maxRadius
            ) {

                radius =
                    maxRadius;


                /*
                 * Keep the antimatter mass consistent with
                 * its actual visual size.
                 *
                 * radius = 8 + mass * 7
                 */

                ballMass =
                    Math.max(
                        0,
                        (radius - 8) / 7
                    );
            }
        }


        /*
         * Safety check:
         *
         * If the player is extremely small, prevent
         * a zero-sized antimatter ball from spawning.
         */

        if (
            isAntimatter &&
            radius <= 1
        ) {

            radius = 1;
            ballMass = 0.1;
        }


        balls.push({

            x:
                radius +
                Math.random() *
                Math.max(
                    1,
                    rect.width -
                    radius * 2
                ),

            y:
                -radius - 10,

            radius,

            mass:
                ballMass,

            type:
                isAntimatter
                    ? "antimatter"
                    : "matter",

            speed:
                worldSpeed *
                (0.8 + Math.random() * 0.5)
        });
    }


    // ------------------------------------------------------------
    // Update balls
    // ------------------------------------------------------------

    function updateBalls(dt) {

        /*
         * Zero mass means there is no chocolate left.
         */

        if (mass <= 0) {

            mass = 0;

            updatePlayerRadius();

            endGame();

            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        for (
            let i = balls.length - 1;
            i >= 0;
            i--
        ) {

            const ball =
                balls[i];


            ball.y +=
                ball.speed * dt;


            // ----------------------------------------------------
            // Remove balls that leave the screen
            // ----------------------------------------------------

            if (
                ball.y >
                rect.height +
                ball.radius
            ) {

                balls.splice(
                    i,
                    1
                );

                continue;
            }


            // ----------------------------------------------------
            // Collision
            // ----------------------------------------------------

            const dx =
                ball.x -
                playerX;

            const dy =
                ball.y -
                playerY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                ball.radius +
                playerRadius
            ) {


                // ------------------------------------------------
                // MATTER
                // ------------------------------------------------

                if (
                    ball.type ===
                    "matter"
                ) {

                    mass +=
                        ball.mass;


                    score +=
                        10;


                    balls.splice(
                        i,
                        1
                    );


                    updatePlayerRadius();


                    continue;
                }


                // ------------------------------------------------
                // ANTIMATTER
                // ------------------------------------------------

                const ratio =
                    ball.radius /
                    Math.max(
                        playerRadius,
                        1
                    );


                /*
                 * Extremely large antimatter balls
                 * completely annihilate the player.
                 *
                 * Since antimatter is now capped at 95%
                 * of the player's size, this condition is
                 * mostly reserved for unusual edge cases.
                 */

                if (
                    ratio > 1.5
                ) {

                    mass = 0;

                    updatePlayerRadius();

                    endGame();

                    return;
                }


                /*
                 * Otherwise antimatter removes its
                 * own mass from the player's mass.
                 */

                mass -=
                    ball.mass;


                /*
                 * Prevent tiny negative floating-point
                 * values.
                 */

                mass =
                    Math.max(
                        0,
                        mass
                    );


                score +=
                    5;


                balls.splice(
                    i,
                    1
                );


                updatePlayerRadius();


                /*
                 * The player can be completely annihilated
                 * by accumulated antimatter mass.
                 */

                if (
                    mass <= 0
                ) {

                    mass = 0;

                    updatePlayerRadius();

                    endGame();

                    return;
                }
            }
        }
    }


    // ------------------------------------------------------------
    // Score
    // ------------------------------------------------------------

    function updateScore(dt) {

        /*
         * Score continuously increases with time.
         */

        score +=
            dt * 10;


        scoreDisplay.textContent =
            `Poäng: ${Math.floor(score)}`;


        massDisplay.textContent =
            `Massa: ${mass.toFixed(1)}`;
    }


    // ------------------------------------------------------------
    // Drawing background
    // ------------------------------------------------------------

    function drawBackground() {

        const rect =
            canvas.getBoundingClientRect();


        ctx.fillStyle =
            "#f7f1e3";


        ctx.fillRect(
            0,
            0,
            rect.width,
            rect.height
        );


        /*
         * Moving horizontal lines make it look
         * like the player is moving forward.
         */

        const offset =
            (
                difficultyTimer *
                worldSpeed
            ) % 40;


        ctx.strokeStyle =
            "rgba(80, 50, 30, 0.08)";

        ctx.lineWidth =
            1;


        for (
            let y = -40 + offset;
            y < rect.height;
            y += 40
        ) {

            ctx.beginPath();


            ctx.moveTo(
                0,
                y
            );


            ctx.lineTo(
                rect.width,
                y
            );


            ctx.stroke();
        }
    }


    // ------------------------------------------------------------
    // Draw player
    // ------------------------------------------------------------

    function drawPlayer() {

        /*
         * At zero mass the chocolate ball completely
         * disappears.
         */

        if (
            mass <= 0 ||
            playerRadius <= 0
        ) {

            return;
        }


        // Shadow

        ctx.beginPath();


        ctx.arc(
            playerX + 3,
            playerY + 4,
            playerRadius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "rgba(0, 0, 0, 0.15)";


        ctx.fill();


        // Chocolate

        ctx.beginPath();


        ctx.arc(
            playerX,
            playerY,
            playerRadius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#6b3518";


        ctx.fill();


        ctx.strokeStyle =
            "#3d1d0e";

        ctx.lineWidth =
            3;


        ctx.stroke();


        // Highlight

        ctx.beginPath();


        ctx.arc(
            playerX -
                playerRadius * 0.35,

            playerY -
                playerRadius * 0.35,

            playerRadius * 0.18,

            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "rgba(255, 255, 255, 0.35)";


        ctx.fill();
    }


    // ------------------------------------------------------------
    // Draw balls
    // ------------------------------------------------------------

    function drawBalls() {

        for (
            const ball of balls
        ) {

            if (
                ball.type ===
                "matter"
            ) {

                drawMatterBall(
                    ball
                );

            } else {

                drawAntimatterBall(
                    ball
                );
            }
        }
    }


    // ------------------------------------------------------------
    // Matter ball
    // ------------------------------------------------------------

    function drawMatterBall(ball) {

        ctx.beginPath();


        ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#7b3f1d";


        ctx.fill();


        ctx.strokeStyle =
            "#3d1d0e";


        ctx.lineWidth =
            2;


        ctx.stroke();


        // Highlight

        ctx.beginPath();


        ctx.arc(
            ball.x -
                ball.radius * 0.3,

            ball.y -
                ball.radius * 0.3,

            ball.radius * 0.15,

            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "rgba(255,255,255,0.35)";


        ctx.fill();
    }


    // ------------------------------------------------------------
    // Antimatter ball
    // ------------------------------------------------------------

    function drawAntimatterBall(ball) {

        ctx.beginPath();


        ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#263238";


        ctx.fill();


        ctx.strokeStyle =
            "#111820";


        ctx.lineWidth =
            3;


        ctx.stroke();


        /*
         * Antimatter symbol.
         */

        ctx.strokeStyle =
            "#ffffff";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            ball.x -
                ball.radius * 0.45,

            ball.y -
                ball.radius * 0.45
        );


        ctx.lineTo(
            ball.x +
                ball.radius * 0.45,

            ball.y +
                ball.radius * 0.45
        );


        ctx.moveTo(
            ball.x +
                ball.radius * 0.45,

            ball.y -
                ball.radius * 0.45
        );


        ctx.lineTo(
            ball.x -
                ball.radius * 0.45,

            ball.y +
                ball.radius * 0.45
        );


        ctx.stroke();
    }


    // ------------------------------------------------------------
    // Drawing
    // ------------------------------------------------------------

    function draw() {

        drawBackground();

        drawBalls();

        drawPlayer();
    }


    // ------------------------------------------------------------
    // Game loop
    // ------------------------------------------------------------

    function gameLoop(time) {

        if (!running) {

            return;
        }


        const dt =
            Math.min(
                0.033,
                (time - lastTime) / 1000
            );


        lastTime =
            time;


        /*
         * Update difficulty and score before
         * calculating the player's control speed.
         */

        updateDifficulty(dt);

        updateScore(dt);

        updatePlayer(dt);

        updateBalls(dt);


        spawnTimer +=
            dt;


        if (
            spawnTimer >=
            spawnInterval
        ) {

            spawnTimer = 0;

            spawnBall();
        }


        draw();


        animationFrame =
            requestAnimationFrame(
                gameLoop
            );
    }


    // ------------------------------------------------------------
    // Start game
    // ------------------------------------------------------------

    function startGame() {

        cancelAnimationFrame(
            animationFrame
        );


        balls.length = 0;


        running = true;
        gameOver = false;


        score = 0;
        mass = 1;


        worldSpeed =
            160;


        spawnTimer =
            0;


        spawnInterval =
            0.8;


        difficultyTimer =
            0;


        updatePlayerRadius();


        const rect =
            canvas.getBoundingClientRect();


        playerX =
            rect.width / 2;


        playerY =
            rect.height - 80;


        scoreDisplay.textContent =
            "Poäng: 0";


        massDisplay.textContent =
            "Massa: 1.0";


        overlay.style.display =
            "none";


        lastTime =
            performance.now();


        animationFrame =
            requestAnimationFrame(
                gameLoop
            );
    }


    // ------------------------------------------------------------
    // Game over
    // ------------------------------------------------------------

    function endGame() {

        if (!running) {

            return;
        }


        running = false;
        gameOver = true;


        cancelAnimationFrame(
            animationFrame
        );


        overlay.innerHTML = `

            <div
                style="
                    text-align:center;
                    color:white;
                "
            >

                <h2>
                    ANNIHILATION
                </h2>

                <p>
                    Poäng:
                    ${Math.floor(score)}
                </p>

                <button
                    id="chocolate-restart"
                    class="maze-start-button"
                    type="button"
                >
                    Försök igen
                </button>

            </div>
        `;


        overlay.style.display =
            "flex";


        document
            .getElementById(
                "chocolate-restart"
            )
            .addEventListener(
                "click",
                startGame
            );
    }


    // ------------------------------------------------------------
    // Keyboard controls
    // ------------------------------------------------------------

    window.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "ArrowLeft" ||
                event.key.toLowerCase() === "a"
            ) {

                moveLeft = true;

                event.preventDefault();
            }


            if (
                event.key === "ArrowRight" ||
                event.key.toLowerCase() === "d"
            ) {

                moveRight = true;

                event.preventDefault();
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

            if (
                event.key === "ArrowLeft" ||
                event.key.toLowerCase() === "a"
            ) {

                moveLeft = false;
            }


            if (
                event.key === "ArrowRight" ||
                event.key.toLowerCase() === "d"
            ) {

                moveRight = false;
            }
        }
    );


    // ------------------------------------------------------------
    // Mobile controls
    // ------------------------------------------------------------

    function holdButton(
        button,
        direction
    ) {

        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();


                if (
                    direction === "left"
                ) {

                    moveLeft = true;
                }


                if (
                    direction === "right"
                ) {

                    moveRight = true;
                }


                button.setPointerCapture(
                    event.pointerId
                );
            }
        );


        button.addEventListener(
            "pointerup",
            () => {

                if (
                    direction === "left"
                ) {

                    moveLeft = false;
                }


                if (
                    direction === "right"
                ) {

                    moveRight = false;
                }
            }
        );


        button.addEventListener(
            "pointercancel",
            () => {

                if (
                    direction === "left"
                ) {

                    moveLeft = false;
                }


                if (
                    direction === "right"
                ) {

                    moveRight = false;
                }
            }
        );


        button.addEventListener(
            "pointerleave",
            () => {

                if (
                    direction === "left"
                ) {

                    moveLeft = false;
                }


                if (
                    direction === "right"
                ) {

                    moveRight = false;
                }
            }
        );
    }


    holdButton(
        leftButton,
        "left"
    );


    holdButton(
        rightButton,
        "right"
    );


    // ------------------------------------------------------------
    // Start button
    // ------------------------------------------------------------

    startButton.addEventListener(
        "click",
        startGame
    );


    // ------------------------------------------------------------
    // Initial resize
    // ------------------------------------------------------------

    resize();
}
