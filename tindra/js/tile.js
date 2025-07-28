class Tile {
  constructor({name, color, image, speed = 1, impassable = false, blocksLight = false, semiBlocksLight = false}) {
    this.name = name;
    this.color = color;
    this.speed = speed;
    this.impassable = impassable;
    this.blocksLight = blocksLight;
    this.semiBlocksLight = semiBlocksLight;

    const imageObj = new Image();
    imageObj.src = image;
    this.image = imageObj;
  }
}

export default Tile;