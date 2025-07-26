class Tile {
  constructor({name, color, image, speed = 1, impassable = false, blocksLight = false, semiBlocksLight = false}) {
    this.name = name;
    this.color = color;
    this.image = image;
    this.speed = speed;
    this.impassable = impassable;
    this.blocksLight = blocksLight;
    this.semiBlocksLight = semiBlocksLight;
  }
}

export default Tile;