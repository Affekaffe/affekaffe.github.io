class Npc {
  constructor(name, imagePath, speed = 1) {
    this._name = name;
    this._speed = speed;
    this._x = null;
    this._y = null;
    this._angle = null;

    const image = new Image();
    image.src = imagePath;

    this._image = image;
  }

  move() {
    this._x += Math.cos(this._angle - Math.PI / 2) * this._speed;
    this._y += Math.sin(this._angle - Math.PI / 2) * this._speed;
  }

  moveDistance(distance) {
    this._x += Math.cos(this._angle - Math.PI / 2) * distance;
    this._y += Math.sin(this._angle - Math.PI / 2) * distance;
  }

  spawn(x, y, angle) {
    this._x = x;
    this._y = y;
    this._angle = angle;
  }

  despawn(){
    this._x = null;
    this._y = null;
    this._angle = null;
  }

  get x(){
    return this._x;
  }

  get y(){
    return this._y;
  }

  get angle(){
    return this._angle;
  }

  get image(){
    return this._image;
  }
}

export default Npc;