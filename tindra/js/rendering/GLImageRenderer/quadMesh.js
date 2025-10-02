class QuadMesh {
    constructor(gl) {
        this.gl = gl;

        const vertices = new Float32Array([
            -0.5, -0.5, 0, 0, 0,
             0.5, -0.5, 0, 1, 0,
             0.5,  0.5, 0, 1, 1,
            -0.5,  0.5, 0, 0, 1
        ]);

        const indices = new Uint16Array([0,1,2, 2,3,0]);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.indexCount = indices.length;
    }

    bind(shader) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        const posLoc = shader.getAttrib("aPosition");
        const uvLoc = shader.getAttrib("aUV");

        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 20, 0);

        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12);
    }
}

export default QuadMesh;