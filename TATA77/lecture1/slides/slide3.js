export function initSlide3() {

    const canvas =
        document.getElementById(
            "test-function-canvas"
        );

    const slider =
        document.getElementById(
            "test-function-position"
        );

    const pairingDisplay =
        document.getElementById(
            "test-function-pairing"
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


    function pairing() {

        const min = -2;
        const max = 2;
        const steps = 1000;

        const dx =
            (max - min) / steps;

        let sum = 0;


        for (
            let i = 0;
            i <= steps;
            i++
        ) {

            const x =
                min + i * dx;


            const value =
                u(x) * phi(x);


            if (
                i === 0 ||
                i === steps
            ) {

                sum += value / 2;

            } else {

                sum += value;
            }
        }


        return sum * dx;
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

        const value =
            pairing();


        pairingDisplay.textContent =
            value.toFixed(3);


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


        // Axes

        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;


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


        // u(x)

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


        // φ(x)

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


        // Product u(x)φ(x)

        ctx.fillStyle =
            "rgba(255, 255, 255, 0.15)";


        ctx.beginPath();


        ctx.moveTo(
            xToCanvas(xMin),
            yToCanvas(0)
        );


        for (let i = 0; i <= steps; i++) {

            const x =
                xMin +
                (i / steps) *
                (xMax - xMin);


            const y =
                u(x) * phi(x);


            ctx.lineTo(
                xToCanvas(x),
                yToCanvas(y)
            );
        }


        ctx.lineTo(
            xToCanvas(xMax),
            yToCanvas(0)
        );


        ctx.closePath();

        ctx.fill();


        // Position marker

        ctx.setLineDash([5, 5]);

        ctx.strokeStyle = "#777";


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
            "u(x)",
            padding + 10,
            padding + 15
        );


        ctx.fillText(
            "φ(x)",
            padding + 10,
            padding + 35
        );
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