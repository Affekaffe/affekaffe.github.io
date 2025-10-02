import GLImageRenderer from "./GLImageRenderer/GLImageRenderer.js";
import Renderer from "./renderer.js";
import RenderInfoRetreiver from "./renderInfoRetriever.js";

class RenderHandler{
  /**
   * 
   * @param {HTMLCanvasElement} canvas
   * @param {RenderInfoRetreiver} renderInfoRetriever 
   * @param {Renderer} renderer
   */
  constructor(canvas, renderInfoRetriever, renderer){
    this._canvas = canvas;
    this._renderInfoRetriever = renderInfoRetriever;
    this._renderer = renderer;
  }

  /**
   * Render all the GameObjects in objectsToRender using the provided renderer.
   * @param {Set<GameObject>} objectsToRender 
   * @param {Camera} camera
   */
async renderFrame(objectsToRender, camera) {
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = camera.getProjectionMatrix(
      60, // FOV
      this._canvas.width / this._canvas.height,
      0.1,
      1000
    );

    const renderObjects = [...objectsToRender].map(obj => ({
        image: this._renderInfoRetriever.getTextureImagePath(obj),
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale ?? [1, 1, 1]
    }));

    // Await the async render call
    await this._renderer.render(renderObjects, viewMatrix, projectionMatrix);
}


  static createGLRenderHandler(canvas){
    return new RenderHandler(canvas, RenderInfoRetreiver.create(), GLImageRenderer.create(canvas));
  }
}

export default RenderHandler;