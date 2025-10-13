import CoordinateView from "./coordinateView.js";

const touchThreshold = 20;
const snapThreshold = 5;

class Interaction {
  constructor(app) {
    this.view = app.view;
    this.input = app.input;
    this.draggingVector = null;
    this.mouseStart = null;
    this.actualSliderValue = this.input.getSliderValue();
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
    const mousePosCanvasCoords = this._getCanvasOffset(event, this.view.canvas);
    const mousePos = this.view.fromCanvasCoords(mousePosCanvasCoords.x, mousePosCanvasCoords.y);
    this.draggingVector = null

    for (let i = 0; i < this.view.styledVectors.length; i++) {
      const styledV = this.view.styledVectors[i];
      const vector = styledV.vector2;

      const distanceToVector = mousePos.subtract(vector).length();
      if (distanceToVector < this.getCorrectedTouchThreshold()) {
        this.draggingVector = styledV;
        break;
      }
    }

    if (this.draggingVector !== null) {
      this.draggingVector.selected = true;
      this.mouseStart = mousePos;
      this.actualSliderValue = this.input.getSliderValue();
      this.view.startAnimation(10, this.actualSliderValue, 1)
    }

    this.handleDragMove(event);
  }

  handleDragMove(event) {
    if (this.view.animating) return;
    if (!this.draggingVector) return;
    const mousePosCanvasCoords = this._getCanvasOffset(event, this.view.canvas);
    const mousePos = this.view.fromCanvasCoords(mousePosCanvasCoords.x, mousePosCanvasCoords.y);
    
    if(this.draggingVector.isBasis){
      this._updateBasisVectors(mousePos);
    } else {
      this._updateAddedVectors(mousePos);
    }

    this.input.updateMatrixInputs();
  }


  _updateBasisVectors(mousePos) {
    this.draggingVector.vector2 = this._getSnappedPos(mousePos);
    this._updateMatrixEntries();
  }

  _updateAddedVectors(mousePos) {
    const inv = this.view.transformationMatrix.inv();
    if (!inv.isInf()) {
      this.draggingVector.baseVector = inv.matmul(this._getSnappedPos(mousePos));
    }
  }

  _getSnappedPos(pos){
    const snappedPos = pos.clone();
    if(Math.abs(Math.round(pos.x) - pos.x) < snapThreshold / this.view.zoom) snappedPos.x = Math.round(pos.x);
    if(Math.abs(Math.round(pos.y) - pos.y) < snapThreshold / this.view.zoom ) snappedPos.y = Math.round(pos.y);
    return snappedPos;
  }

  _updateMatrixEntries() {
    this.input.matrix.a = this.view.styledVectors[0].vector2.x;
    this.input.matrix.c = this.view.styledVectors[0].vector2.y;
    this.input.matrix.b = this.view.styledVectors[1].vector2.x;
    this.input.matrix.d = this.view.styledVectors[1].vector2.y;
  }

  handleDragEnd(event) {
    this.handleDragMove(event);
    this.draggingVector.selected = false;
    this.draggingVector = null;
    this.mouseStart = null;
    this.view.startAnimation(10, 1, this.actualSliderValue)
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

  getCorrectedTouchThreshold(){
    return touchThreshold / this.view.zoom
  }
}

export default Interaction;
