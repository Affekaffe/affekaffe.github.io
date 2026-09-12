export class Camera3D {

    constructor(canvas, rotX = 0.55, rotZ = -0.7) {

        this.canvas = canvas;

        this.scale = 45;

        this.rotationX = rotX;
        this.rotationZ = rotZ;

        this.originX = 0;
        this.originY = 0;

        this.resize();
    }


    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        this.canvas.width =
            rect.width;

        this.canvas.height =
            rect.height;

        this.originX =
            this.canvas.width / 2;

        this.originY =
            this.canvas.height * 0.65;
    }


    project(x, y, z) {

        const cosZ =
            Math.cos(this.rotationZ);

        const sinZ =
            Math.sin(this.rotationZ);

        const rotatedX =
            x * cosZ -
            y * sinZ;

        const rotatedY =
            x * sinZ +
            y * cosZ;


        const cosX =
            Math.cos(this.rotationX);

        const sinX =
            Math.sin(this.rotationX);

        const finalY =
            rotatedY * cosX -
            z * sinX;


        return {
            x:
                this.originX +
                rotatedX * this.scale,

            y:
                this.originY -
                finalY * this.scale
        };
    }


    screenToPlane(mouseX, mouseY) {

        const sx =
            (mouseX - this.originX) /
            this.scale;

        const sy =
            -(mouseY - this.originY) /
            this.scale;


        const cosX =
            Math.cos(this.rotationX);

        const rotatedY =
            sy / cosX;

        const rotatedX =
            sx;


        const cosZ =
            Math.cos(this.rotationZ);

        const sinZ =
            Math.sin(this.rotationZ);


        return {
            x:
                rotatedX * cosZ +
                rotatedY * sinZ,

            y:
                -rotatedX * sinZ +
                rotatedY * cosZ
        };
    }


    orbit(dx, dy) {

        this.rotationZ +=
            dx * 0.01;

        this.rotationX +=
            dy * 0.01;


        this.rotationX =
            Math.max(
                -1.4,
                Math.min(
                    1.4,
                    this.rotationX
                )
            );
    }
}