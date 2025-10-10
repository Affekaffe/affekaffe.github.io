import CoordinateView from "./coordinateView.js";

const touchThreshold = 0.2

class Interaction {
  constructor(view, input) {
    this.view = view;
    this.input = input;
    this.draggingVector = null;
    this.mouseStart = null;
    this.setupEvents();
  }

  setupEvents() {
    const canvas = this.view.canvas;
    canvas.addEventListener('mousedown', (e) => this.handleDragStart(e));
    canvas.addEventListener('mousemove', (e) => this.handleDragMove(e));
    canvas.addEventListener('mouseup', (e) => this.handleDragEnd(e));
    canvas.addEventListener('wheel', (e) => this.handleWheel(e));
  }

  handleDragStart(event) {
    const mousePos = this.view.fromCanvasCoords(event.offsetX, event.offsetY);
    this.draggingVector = null

    for (let i = 0; i < this.view.styledVectors.length; i++) {
      const styledV = this.view.styledVectors[i];
      const vector = styledV.vector2;

      const distanceToVector = mousePos.subtract(vector).length();

      if (distanceToVector < touchThreshold) {
        this.draggingVector = styledV;
        break;
      }
    }

    if (this.draggingVector !== null) {
      this.mouseStart = mousePos;
      if (this.draggingVector.isBasis) this.input.setSliderValue(1);
    }
  }

  handleDragMove(event) {
    if (!this.draggingVector) return;

    const pos = this.view.fromCanvasCoords(event.offsetX, event.offsetY);
    if(this.draggingVector.isBasis){
      this.draggingVector.vector2.x = pos.x;
      this.draggingVector.vector2.y = pos.y;
      this._updateMatrixEntries();
    } else {
      const inv = this.view.transformationMatrix.inv()
      if (!inv.isInf()){
        this.draggingVector.baseVector = inv.matmul(pos)
      }
    }
    this.input.updateMatrixInputs();
  }


  _updateMatrixEntries() {
    this.input.matrix.a = this.view.styledVectors[0].vector2.x;
    this.input.matrix.c = this.view.styledVectors[0].vector2.y;
    this.input.matrix.b = this.view.styledVectors[1].vector2.x;
    this.input.matrix.d = this.view.styledVectors[1].vector2.y;
  }

  handleDragEnd(event) {
    this.draggingVector = null;
    this.mouseStart = null;
  }

  handleWheel(event) {
    event.preventDefault();
    const zoomFactor = 1.1;
    this.view.zoom *= (event.deltaY < 0) ? zoomFactor : 1 / zoomFactor;
    this.view.draw();
  }
}

export default Interaction;
