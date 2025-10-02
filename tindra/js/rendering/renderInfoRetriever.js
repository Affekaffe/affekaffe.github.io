import AssetRetriever from "../assets/assetRetriever.js";
import { assetMetadata, defaultMetadata } from "../assets/assets.js";

class RenderInfoRetreiver{
  /**
   * 
   * @param {AssetRetriever} assetRetriever 
   */
  constructor(assetRetriever){
    this._assetRetriever = assetRetriever;
  }

  /**
   * 
   * @param {GameObject} gameObject 
   * @param {Number} animationframe 
   * @returns {ImageBitmap}
   */
  getTextureImagePath(gameObject){
    return this._assetRetriever.getTextureImagePath(gameObject.key);
  }

  /**
   * 
   * @param {GameObject} gameObject 
   * @returns The 2D projection on the screen of the GameObject's world position
   */
  getWorldPosition(gameObject){
    return gameObject.position;
  }

  getWorldRotation(gameObject){
    return gameObject.rotation;
  }

  static create(){
    return new RenderInfoRetreiver(AssetRetriever.create(assetMetadata, defaultMetadata));
  }
}

export default RenderInfoRetreiver;