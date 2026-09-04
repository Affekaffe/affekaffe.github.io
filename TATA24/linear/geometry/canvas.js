export class CoordinateCanvas {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.scale = 50;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );
    }

    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        const dpr =
            window.devicePixelRatio || 1;

        this.canvas.width =
            rect.width * dpr;

        this.canvas.height =
            rect.height * dpr;

        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }

    get width() {
        return this.canvas.clientWidth;
    }

    get height() {
        return this.canvas.clientHeight;
    }

    toScreen(point) {

        return {
            x: this.width / 2 +
               point.x * this.scale,

            y: this.height / 2 -
               point.y * this.scale
        };
    }

    toMath(x, y) {

        return {
            x: (x - this.width / 2) /
               this.scale,

            y: (this.height / 2 - y) /
               this.scale
        };
    }

    clear() {

        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );
    }

    drawGrid() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;

        // Vertical grid
        for (
            let x = this.width / 2;
            x <= this.width;
            x += this.scale
        ) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (
            let x = this.width / 2 - this.scale;
            x >= 0;
            x -= this.scale
        ) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        // Horizontal grid
        for (
            let y = this.height / 2;
            y <= this.height;
            y += this.scale
        ) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        for (
            let y = this.height / 2 - this.scale;
            y >= 0;
            y -= this.scale
        ) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = "#777";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(this.width, this.height / 2);
        ctx.stroke();
    }

    pointerPosition(event) {

        const rect =
            this.canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}