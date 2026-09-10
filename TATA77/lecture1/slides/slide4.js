export function initSlide4() {

    const canvas =
        document.getElementById(
            "restriction-canvas"
        );

    const slider =
        document.getElementById(
            "restriction-position"
        );

    const positionDisplay =
        document.getElementById(
            "restriction-position-value"
        );

    const insideDisplay =
        document.getElementById(
            "restriction-inside"
        );


    if (!canvas || !slider) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    let position =
        Number(slider.value);


    function u(x) {

        return (
            0.7 * Math.sin(2 * x) +
            0.25 * Math.cos(5 * x)
        );
    }


    function phi(x) {

        return Math.exp(
            -8 *
            Math.pow(
                x - position,
                2
            )
        );
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


        const xMin = -2;
        const xMax = 2;

        const yMin = -1;
        const yMax = 1.5;


        function xToCanvas(x) {

            return (
                padding +
                ((x - xMin) /
                    (xMax - xMin)) *
                graphWidth
            );
        }


        function yToCanvas(y) {

            return (
                canvas.height -
                padding -
                ((y - yMin) /
                    (yMax - yMin)) *
                graphHeight
            );
        }


        // Restricted region Ω = (-1, 1)

        ctx.fillStyle =
            "rgba(255, 255, 255, 0.06)";


        ctx.fillRect(
            xToCanvas(-1),
            padding,
            xToCanvas(1) - xToCanvas(-1),
            graphHeight
        );


        // Region boundaries

        ctx.setLineDash([6, 6]);

        ctx.strokeStyle = "#777";
        ctx.lineWidth = 1;


        [-1, 1].forEach(
            x => {

                ctx.beginPath();

                ctx.moveTo(
                    xToCanvas(x),
                    padding
                );

                ctx.lineTo(
                    xToCanvas(x),
                    canvas.height - padding
                );

                ctx.stroke();
            }
        );


        ctx.setLineDash([]);


        // Axis

        ctx.strokeStyle = "#555";


        ctx.beginPath();

        ctx.moveTo(
            xToCanvas(xMin),
            yToCanvas(0)
        );

        ctx.lineTo(
            xToCanvas(xMax),
            yToCanvas(0)
        );

        ctx.stroke();


        // u

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;


        ctx.beginPath();


        const steps = 600;


        for (let i = 0; i <= steps; i++) {

            const x =
                xMin +
                (i / steps) *
                (xMax - xMin);


            const y =
                u(x);


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


        // φ

        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 2;


        ctx.beginPath();


        for (let i = 0; i <= steps; i++) {

            const x =
                xMin +
                (i / steps) *
                (xMax - xMin);


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


        // Position marker

        ctx.setLineDash([5, 5]);

        ctx.strokeStyle = "#888";


        ctx.beginPath();

        ctx.moveTo(
            xToCanvas(position),
            padding
        );

        ctx.lineTo(
            xToCanvas(position),
            canvas.height - padding
        );

        ctx.stroke();


        ctx.setLineDash([]);


        // Labels

        ctx.fillStyle = "#aaa";
        ctx.font = "14px sans-serif";


        ctx.fillText(
            "Ω = (−1, 1)",
            xToCanvas(-0.85),
            padding + 20
        );


        positionDisplay.textContent =
            position.toFixed(2);


        insideDisplay.textContent =
            Math.abs(position) < 1
                ? "ja"
                : "nej";
    }


    slider.addEventListener(
        "input",
        () => {

            position =
                Number(slider.value);

            draw();
        }
    );


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    resizeCanvas();
}