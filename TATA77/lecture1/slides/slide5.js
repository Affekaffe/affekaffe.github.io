export function initSlide5() {

    const canvas =
        document.getElementById(
            "distribution-convergence-canvas"
        );

    const slider =
        document.getElementById(
            "distribution-convergence-slider"
        );

    const nDisplay =
        document.getElementById(
            "distribution-n"
        );

    const pairingDisplay =
        document.getElementById(
            "distribution-pairing"
        );

    const phiZeroDisplay =
        document.getElementById(
            "distribution-phi-zero"
        );

    const errorDisplay =
        document.getElementById(
            "distribution-error"
        );


    if (!canvas || !slider) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    function phi(x) {

        return Math.exp(
            -4 * x * x
        );
    }


    function pairing(n) {

        const left =
            -1 / (2 * n);

        const right =
            1 / (2 * n);


        const steps = 500;

        const dx =
            (right - left) / steps;


        let sum = 0;


        for (
            let i = 0;
            i <= steps;
            i++
        ) {

            const x =
                left + i * dx;


            const value =
                phi(x);


            if (
                i === 0 ||
                i === steps
            ) {

                sum += value / 2;

            } else {

                sum += value;
            }
        }


        return n * sum * dx;
    }


    function resizeCanvas() {

        const rect =
            canvas.getBoundingClientRect();


        if (
            rect.width === 0 ||
            rect.height === 0
        ) {
            return;
        }


        canvas.width =
            rect.width;

        canvas.height =
            rect.height;


        draw();
    }


    function draw() {

        const n =
            Number(slider.value);


        const width =
            1 / n;

        const height =
            n;


        const yMax =
            50;


        const result =
            pairing(n);


        const phiZero =
            phi(0);


        const error =
            Math.abs(
                result - phiZero
            );


        nDisplay.textContent =
            n;

        pairingDisplay.textContent =
            result.toFixed(5);

        phiZeroDisplay.textContent =
            phiZero.toFixed(5);

        errorDisplay.textContent =
            error.toFixed(5);


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        const padding = 50;

        const graphWidth =
            canvas.width - 2 * padding;

        const graphHeight =
            canvas.height - 2 * padding;


        function xToCanvas(x) {

            return (
                padding +
                ((x + 2) / 4) *
                graphWidth
            );
        }


        function yToCanvas(y) {

            return (
                canvas.height -
                padding -
                (y / yMax) *
                graphHeight
            );
        }


        // Axis

        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.moveTo(
            xToCanvas(-2),
            yToCanvas(0)
        );

        ctx.lineTo(
            xToCanvas(2),
            yToCanvas(0)
        );

        ctx.stroke();


        // Test function φ

        ctx.strokeStyle = "#777";
        ctx.lineWidth = 2;


        ctx.beginPath();


        const steps = 600;


        for (let i = 0; i <= steps; i++) {

            const x =
                -2 +
                (i / steps) * 4;


            const y =
                phi(x);


            if (i === 0) {

                ctx.moveTo(
                    xToCanvas(x),
                    yToCanvas(y)
                );

            } else {

                ctx.lineTo(
                    xToCanvas(x),
                    yToCanvas(y)
                );
            }
        }


        ctx.stroke();


        // ρ_n

        const left =
            -width / 2;

        const right =
            width / 2;


        const x1 =
            xToCanvas(left);

        const x2 =
            xToCanvas(right);


        const y =
            yToCanvas(height);


        ctx.fillStyle =
            "rgba(255, 255, 255, 0.25)";


        ctx.fillRect(
            x1,
            y,
            Math.max(
                x2 - x1,
                2
            ),
            yToCanvas(0) - y
        );


        ctx.strokeStyle =
            "#fff";

        ctx.lineWidth = 2;


        ctx.strokeRect(
            x1,
            y,
            Math.max(
                x2 - x1,
                2
            ),
            yToCanvas(0) - y
        );


        // x = 0

        ctx.setLineDash([5, 5]);

        ctx.strokeStyle = "#777";


        ctx.beginPath();

        ctx.moveTo(
            xToCanvas(0),
            padding
        );

        ctx.lineTo(
            xToCanvas(0),
            canvas.height - padding
        );

        ctx.stroke();


        ctx.setLineDash([]);


        // Labels

        ctx.fillStyle = "#aaa";
        ctx.font = "14px sans-serif";


        ctx.fillText(
            "ρₙ",
            xToCanvas(0) + 8,
            y + 20
        );


        ctx.fillText(
            "φ",
            xToCanvas(1) + 10,
            yToCanvas(phi(1)) - 10
        );


        ctx.fillText(
            "x = 0",
            xToCanvas(0) + 8,
            yToCanvas(0) - 10
        );
    }


    slider.addEventListener(
        "input",
        draw
    );


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    resizeCanvas();
}