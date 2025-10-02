class TextureManager {
    /**
     * @param {WebGLRenderingContext} gl 
     */
    constructor(gl) {
        this.gl = gl;
        this.cache = new Map(); // cache textures by URL
    }

    /**
     * Loads an image from a URL and returns a Promise of HTMLImageElement
     * @param {string} url
     */
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(`Failed to load image: ${url}`);
        });
    }

    /**
     * Returns a WebGLTexture. If not loaded, loads it first.
     * @param {string} path 
     * @returns {Promise<WebGLTexture>}
     */
    async getTexture(path) {
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        const gl = this.gl;
        const image = await this.loadImage(path);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        this.cache.set(path, texture);
        return texture;
    }
}

export default TextureManager;
