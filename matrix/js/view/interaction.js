import Vector2 from "../linalg/vector2.js";
import CoordinateView from "./coordinateView.js";

const touchThreshold = 20;
const snapThreshold = 5;

/**
 * @typedef {import('./coordinateView.js').default} CoordinateView
 * @typedef {import('../input.js').default} InputPanel
 * @typedef {import('../app.js').default} App
 */


class Interaction {
  /**
   * @param {App} app
   */
  constructor(app) {
    /** @type {App} */
    this.app = app;

    /** @type {Vector2 | null} */
    this.draggingVector = null;

    /** @type {Vector2 | null} */
    this.mouseStart = null;

    /** @type {number} */
    this.actualSliderValue = 0;
  }

  initInteraction(){
    /** @type {CoordinateView} */
    this.view = this.app.view;
    /** @type {InputPanel} */
    this.input = this.app.input;
    this.setupEvents();
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

    this._setDraggingVectorFromPos(mousePos);

    if (!this.draggingVector) return; 
    
    this.draggingVector.selected = true;
    this.mouseStart = mousePos;
    
    if (this.draggingVector.isBasis){
      this.actualSliderValue = this.input.getSliderValue();
      this.view.startAnimation(10, this.actualSliderValue, 1)
      
    }

    this.handleDragMove(event);
  }

  _setDraggingVectorFromPos(mousePos) {
    this.draggingVector = this._getVectorNearPosFromList(mousePos, this.view.basisStyledVectors); //Prioritize Basis Vectors
    if (!this.draggingVector) this.draggingVector = this._getVectorNearPosFromList(mousePos, this.view.addedStyledVectors);
  }

  _getVectorNearPosFromList(mousePos, vectorList) {
    for (let i = 0; i < vectorList.length; i++) {

      const styledV = vectorList[i];
      const distanceToVector = mousePos.subtract(styledV.vector2).length();

      if (distanceToVector < this.getCorrectedTouchThreshold()) return styledV;
    }
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

    this.view.updateVectorList();
    this.input.updateMatrixInputs();
  }


  _updateBasisVectors(mousePos) {
    this.draggingVector.vector2 = this._getSnappedPos(mousePos);
    this._updateMatrixEntries();
  }

  _updateAddedVectors(mousePos) {
    const inv = this.view.transformationMatrix.inv();
    console.log(inv)
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
    this.input.matrix.a = this.view.basisStyledVectors[0].vector2.x;
    this.input.matrix.c = this.view.basisStyledVectors[0].vector2.y;
    this.input.matrix.b = this.view.basisStyledVectors[1].vector2.x;
    this.input.matrix.d = this.view.basisStyledVectors[1].vector2.y;
  }

  handleDragEnd(event) {
    this.handleDragMove(event);
    if (!this.draggingVector) return;
    if (this.draggingVector.isBasis) this.view.startAnimation(10, 1, this.actualSliderValue);
    
    this.mouseStart = null; 
    this.draggingVector.selected = false;
    this.draggingVector = null;
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
