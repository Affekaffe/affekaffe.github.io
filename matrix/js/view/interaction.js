import CoordinateView from "./coordinateView.js";

const touchThreshold = 20

class Interaction {
  constructor(app) {
    this.view = app.view;
    this.input = app.input;
    this.draggingVector = null;
    this.mouseStart = null;
  }

  setupEvents() {
    const canvas = this.view.canvas;
    canvas.addEventListener('mousedown', (e) => this.handleDragStart(e));
    canvas.addEventListener('mousemove', (e) => this.handleDragMove(e));
    canvas.addEventListener('mouseup', (e) => this.handleDragEnd(e));
    canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    
    //mobile
    canvas.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0]));
    canvas.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0]));
    canvas.addEventListener('touchend', (e) => this.handleDragEnd(e.changedTouches[0]));

    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => this.handleResize());
  }

  handleResize(){
    this.view.update()
  }

  handleDragStart(event) {
    console.log(event);
    const mousePosCanvasCoords = this._getCanvasOffset(event, this.view.canvas);
    const mousePos = this.view.fromCanvasCoords(mousePosCanvasCoords.x, mousePosCanvasCoords.y);
    this.draggingVector = null

    for (let i = 0; i < this.view.styledVectors.length; i++) {
      const styledV = this.view.styledVectors[i];
      const vector = styledV.vector2;

      const distanceToVector = mousePos.subtract(vector).length();
      if (distanceToVector < touchThreshold / this.view.zoom) {
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
    const mousePosCanvasCoords = this._getCanvasOffset(event, this.view.canvas);
    const mousePos = this.view.fromCanvasCoords(mousePosCanvasCoords.x, mousePosCanvasCoords.y);
    if(this.draggingVector.isBasis){
      this.draggingVector.vector2.x = mousePos.x;
      this.draggingVector.vector2.y = mousePos.y;
      this._updateMatrixEntries();
    } else {
      const inv = this.view.transformationMatrix.inv()
      if (!inv.isInf()){
        this.draggingVector.baseVector = inv.matmul(mousePos)
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

  _getCanvasOffset(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
}

export default Interaction;
