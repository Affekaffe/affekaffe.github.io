export function initSlide1() {

    const canvas =
        document.getElementById(
            "density-canvas"
        );

    const slider =
        document.getElementById(
            "density-slider"
        );

    const nDisplay =
        document.getElementById(
            "density-n"
        );

    const widthDisplay =
        document.getElementById(
            "density-width"
        );

    const heightDisplay =
        document.getElementById(
            "density-height"
        );

    const areaDisplay =
        document.getElementById(
            "density-area"
        );


    if (!canvas || !slider) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


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


        // Axes

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


        ctx.beginPath();

        ctx.moveTo(
            xToCanvas(0),
            yToCanvas(0)
        );

        ctx.lineTo(
            xToCanvas(0),
            yToCanvas(yMax)
        );

        ctx.stroke();


        // Rectangle

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
            x2 - x1,
            yToCanvas(0) - y
        );


        ctx.strokeStyle =
            "#fff";

        ctx.lineWidth = 2;


        ctx.strokeRect(
            x1,
            y,
            x2 - x1,
            yToCanvas(0) - y
        );


        // Labels

        ctx.fillStyle = "#aaa";
        ctx.font = "14px sans-serif";


        ctx.fillText(
            "x",
            xToCanvas(2) - 10,
            yToCanvas(0) - 10
        );


        ctx.fillText(
            "0",
            xToCanvas(0) + 6,
            yToCanvas(0) + 18
        );


        ctx.fillText(
            `${n}`,
            xToCanvas(0) + 8,
            y + 18
        );


        nDisplay.textContent =
            n;

        widthDisplay.textContent =
            width.toFixed(3);

        heightDisplay.textContent =
            height.toFixed(3);

        areaDisplay.textContent =
            (width * height).toFixed(3);
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