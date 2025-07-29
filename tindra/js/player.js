class Player {
  constructor({name, image, speed = 1}) {
    this.name = name;
    this.speed = speed;
    this.x = 0;
    this.y = 0;
    this.angle = 0;

    const imageObj = new Image();
    imageObj.src = image;

    this.image = imageObj;
  }

  move() {
    this.x += Math.cos(this.angle - Math.PI / 2) * this.speed;
    this.y += Math.sin(this.angle - Math.PI / 2) * this.speed;
  }

  moveDistance(distance) {
    this.x += Math.cos(this.angle - Math.PI / 2) * distance;
    this.y += Math.sin(this.angle - Math.PI / 2) * distance;
  }

  getX(){
    return this.x;
  }

  getY(){
    return this.y;
  }

  getAngle(){
    return this.angle;
  }
}

export default Player;