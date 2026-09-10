export function initSlide2() {

    const canvas =
        document.getElementById(
            "convergence-function-canvas"
        );

    const slider =
        document.getElementById(
            "function-n-slider"
        );

    const nDisplay =
        document.getElementById(
            "function-n"
        );


    if (!canvas || !slider) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    function f(x, n) {

        return Math.pow(x, n);
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
                x * graphWidth
            );
        }


        function yToCanvas(y) {

            return (
                canvas.height -
                padding -
                y * graphHeight
            );
        }


        // Grid

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;


        for (let i = 0; i <= 10; i++) {

            const x =
                xToCanvas(i / 10);

            ctx.beginPath();

            ctx.moveTo(
                x,
                padding
            );

            ctx.lineTo(
                x,
                canvas.height - padding
            );

            ctx.stroke();


            const y =
                yToCanvas(i / 10);

            ctx.beginPath();

            ctx.moveTo(
                padding,
                y
            );

            ctx.lineTo(
                canvas.width - padding,
                y
            );

            ctx.stroke();
        }


        // Axes

        ctx.strokeStyle = "#666";


        ctx.beginPath();

        ctx.moveTo(
            padding,
            yToCanvas(0)
        );

        ctx.lineTo(
            canvas.width - padding,
            yToCanvas(0)
        );

        ctx.stroke();


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


        // Limit function

        ctx.setLineDash([6, 6]);

        ctx.strokeStyle = "#777";
        ctx.lineWidth = 1.5;


        ctx.beginPath();

        ctx.moveTo(
            xToCanvas(0),
            yToCanvas(0)
        );

        ctx.lineTo(
            xToCanvas(1),
            yToCanvas(0)
        );

        ctx.stroke();


        ctx.setLineDash([]);


        // f_n

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;


        ctx.beginPath();


        const steps = 500;


        for (let i = 0; i <= steps; i++) {

            const x =
                i / steps;

            const y =
                f(x, n);


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


        // Labels

        ctx.fillStyle = "#aaa";
        ctx.font = "14px sans-serif";


        ctx.fillText(
            "x",
            canvas.width - padding + 5,
            yToCanvas(0) - 8
        );


        ctx.fillText(
            "1",
            xToCanvas(1) - 5,
            yToCanvas(0) + 20
        );


        ctx.fillText(
            "fₙ(x)",
            padding + 5,
            padding - 15
        );


        nDisplay.textContent =
            n;
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