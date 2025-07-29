class Npc {
  constructor({name, image, speed = 1}) {
    this.name = name;
    this.speed = speed;
    this.x = null;
    this.y = null;
    this.angle = null;

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

  spawn(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  despawn(){
    this.x = null;
    this.y = null;
    this.angle = null;
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

export default Npc;