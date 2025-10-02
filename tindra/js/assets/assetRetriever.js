const _TEXTURE_PATH_KEY = "texture.path";
const _TEXTURE_SCALE_KEY = "texture.scale";

class AssetRetriever {
  constructor(assetsMeta = {}, defaultMeta = {}) {
    this._assetsMeta = assetsMeta;
    this._defaultMeta = defaultMeta;
  }

  // Helper: safely get nested values from objects (supports arrays) [COPIED]
  _getNestedValue(obj, keyPath) {
    if (!keyPath) return undefined;

    return keyPath.split(".").reduce((acc, key) => {
      if (acc == null) return undefined;

      const index = Number(key);
      if (!isNaN(index) && Array.isArray(acc)) return acc[index];

      return acc[key];
    }, obj);
  }

  // Get metadata value for a specific asset, falling back to default
  _getAssetMetadataValue(assetKey, metadataKey) {
    const metadata = this._getNestedValue(this._assetsMeta, assetKey);
    let value = this._getNestedValue(metadata, metadataKey);

    if (value == null) {
      value = this._getNestedValue(this._defaultMeta, metadataKey);
    }

    return value;
  }

  // Get texture path
  getTextureImagePath(assetKey) {
    const path = this._getAssetMetadataValue(assetKey, _TEXTURE_PATH_KEY);
    return path;
  }

  // Get texture scale (from metadata)
  getTextureScale(assetKey) {
    return this._getAssetMetadataValue(assetKey, _TEXTURE_SCALE_KEY);
  }

  // Preload one or more assets [COPIED]
  async preload(assetKeys) {
    if (!Array.isArray(assetKeys)) assetKeys = [assetKeys];
    return Promise.all(assetKeys.map(key => this.getTextureImagePath(key)));
  }

  // Load an image asynchronously and return a promise [COPIED]
  loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image(128, 128);
      image.src = path;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    });
  }

  static create(assetsMetadata, defaultMetadata) {
    return new AssetRetriever(assetsMetadata, defaultMetadata);
  }

}

export default AssetRetriever;