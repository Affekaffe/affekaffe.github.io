import QuadMesh from "./quadMesh.js";
import ShaderProgram from "./shaderProgram.js";
import TextureManager from "./textureManager.js";
import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

const vertexSrc = `
attribute vec3 aPosition;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUV;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vUV = aUV;
}
`;

const fragmentSrc = `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vUV;

void main(void) {
    vec4 color = texture2D(uTexture, vUV);
    if (color.a < 0.5) discard; // binary cutout
    gl_FragColor = color;
}
`;


class GLImageRenderer {
    constructor(gl, shader, mesh) {
        this.gl = gl;
        this.shader = shader;
        this.mesh = mesh;
        this.textureManager = new TextureManager(gl); // internal cache
        
    }

    async render(objects, viewMatrix, projectionMatrix) {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.shader.use();
        gl.uniformMatrix4fv(this.shader.getUniform("uViewMatrix"), false, viewMatrix);
        gl.uniformMatrix4fv(this.shader.getUniform("uProjectionMatrix"), false, projectionMatrix);

        for (const obj of objects) {
            await this._renderSingle(obj); // wait for texture to load if needed
        }
    }

    async _renderSingle(obj) {
        const gl = this.gl;
        const texture = await this.textureManager.getTexture(obj.image); // await the texture

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.shader.getUniform("uTexture"), 0);

        const modelMatrix = this._buildModelMatrix(obj.position, obj.rotation, obj.scale);
        gl.uniformMatrix4fv(this.shader.getUniform("uModelMatrix"), false, modelMatrix);

        this.mesh.bind(this.shader);
        gl.drawElements(gl.TRIANGLES, this.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }
    _buildModelMatrix(position, rotation, scale = [1, 1, 1]) {
        const m = mat4.create();

        mat4.translate(m, m, position);
        
        mat4.rotateY(m, m, rotation[1]); // yaw
        mat4.rotateX(m, m, rotation[0]); // pitch
        mat4.rotateZ(m, m, rotation[2]); // roll

        mat4.scale(m, m, scale);

        return m;
    }


    static create(canvas) {
        const gl = canvas.getContext("webgl");

        GLImageRenderer._setupDefaults(gl);

        const shader = new ShaderProgram(gl, vertexSrc, fragmentSrc);
        const mesh = new QuadMesh(gl);
        return new GLImageRenderer(gl, shader, mesh);
    }

    static _setupDefaults(gl) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }
}

export default GLImageRenderer;