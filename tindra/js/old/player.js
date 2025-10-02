import Flashlight from './flashlight.js';

class Player {
  constructor() {
    this._x = 0;
    this._y = 0;
    this._angle = 0;
    this._speed = 4.0;
    this._flashlight = new Flashlight(0.5, false);
  }

  static newPlayer(){
    return new Player();
  }

  move(speedModifier=1, xModifier=1, yModifier=1) {
    this._x += Math.cos(this._angle - Math.PI / 2) * this._speed * speedModifier * xModifier;
    this._y += Math.sin(this._angle - Math.PI / 2) * this._speed * speedModifier * yModifier;
  }

  moveDistance(distance) {
    this._x += Math.cos(this._angle - Math.PI / 2) * distance;
    this._y += Math.sin(this._angle - Math.PI / 2) * distance;
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

  get flashlight(){
    return this._flashlight;
  }

  setPosition(x, y) {
    this._x = x;
    this._y = y;
  }

  setAngle(theta){
    this._angle = theta % (2 * Math.PI);
  }
  
  isUpsideDown() {
    return Math.abs(this.angle) > Math.PI / 2;
  }
}

export default Player;