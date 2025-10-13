import Vector2 from "../linalg/vector2.js"

class StyledVector2{
  constructor(x, y, color="red", isBasis = false){
    this.vector2 = new Vector2(x, y)
    this.color = color
    this.isBasis = isBasis
    this.baseVector = this.vector2.clone()
    this.selected = false;
  }

  add(other){
    this.vector2 = this.vector2.add(other)
  }

  subtract(other){
    this.vector2 = this.vector2.subtract(other)
  }

  scale(c){
    this.vector2 = this.vector2.scale(c)
  }
}

export default StyledVector2