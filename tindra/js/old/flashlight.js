class Flashlight {
  constructor(strength = 1.0, isOn = true) {
    this._strength = strength
    this.isOn = isOn;
  }

  turnOn(){
    this.isOn = true;
  }

  turnOff(){
    this.isOn = false;
  }

  isOn(){
    return this.isOn;
  }

  get strength(){
    return this._strength;
  }
}

export default Flashlight;