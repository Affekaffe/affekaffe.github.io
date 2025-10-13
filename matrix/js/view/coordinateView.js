import StyledVector2 from "./styledVector2.js";
import Vector2 from "../linalg/vector2.js";
import Matrix2 from "../linalg/matrix2.js";

/**
 * @typedef {import('../input.js').default} InputPanel
 * @typedef {import('../app.js').default} App
 */

/**
 * @typedef {Object} App
 * @property {InputPanel} input
 * @property {number} mobileWidth
 */

class CoordinateView {
  /**
   * @param {App} app
   */
  constructor(app) {
    /** @type {App} */
    this.app = app;

    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById("view");

    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");

    /** @type {HTMLElement} */
    this.labelsContainer = document.getElementById("vector-labels");

    /** @type {number} */
    this.zoom = 100;

    /** @type {{x:number, y:number}} */
    this.pan = { x: 0, y: 0 };

    /** @type {StyledVector2[]} */
    this.addedStyledVectors = []
    
    /** @type {StyledVector2[]} */
    this.basisStyledVectors = [
      new StyledVector2(1, 0, "red", true, "e₁"),
      new StyledVector2(0, 1, "green", true, "e₂")
    ];

    /** @type {Matrix2} */
    this.transformationMatrix = Matrix2.identity();

    /** @type {boolean} */
    this.animating = false;
  }

  initCanvas() {
    /** @type {InputController} */
    this.input = this.app.input;
    this.resizeCanvas();
    this.draw();
    this.updateVectorList();
  }

  update(matrix = this.transformationMatrix, t = 1) {
    const matrix_t = Matrix2.identity().lerp(matrix, t)

    this.transformationMatrix = matrix_t;
    let basisX = this.basisStyledVectors[0];
    let basisY = this.basisStyledVectors[1];
    
    if (!basisX.selected) basisX.vector2 = matrix_t.matmul(new Vector2(1, 0));
    if (!basisY.selected) basisY.vector2 = matrix_t.matmul(new Vector2(0, 1));

    for (let i = 0; i < this.addedStyledVectors.length; i++) {
      if(!this.addedStyledVectors[i].baseVector) this.addedStyledVectors[i].baseVector = this.addedStyledVectors[i].vector2
      this.addedStyledVectors[i].vector2 = matrix_t.matmul(this.addedStyledVectors[i].baseVector);
    }
    
    this.setCorrectDeviceView();
    this.resizeCanvas();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.setBackgroundColor("#222");

    this.drawGrid();
    this.drawVectors();
    this.updateVectorLabels();
    this.updateDeterminant();
  }


  setBackgroundColor(color = "#000") {
    this.ctx.fillStyle = color; // replace with any color you like
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateVectorLabels() {
    // Clear previous labels
    this.labelsContainer.innerHTML = "";

    for (let i = 0; i < this.basisStyledVectors.length; i++) {
      const basisStyledVector = this.basisStyledVectors[i];
      this._addVectorLabel(basisStyledVector);
    }

    for (let i = 0; i < this.addedStyledVectors.length; i++) {
      const styledVector = this.addedStyledVectors[i];
      this._addVectorLabel(styledVector);
    }
  }

  _addVectorLabel(styledVector, label) {
    const pos = this.toCanvasCoords(styledVector.vector2);
    const labelElement = document.createElement("div");
    labelElement.className = "vector-label";
    labelElement.textContent = styledVector.label;
    labelElement.style.left = `${pos.x + 10}px`;
    labelElement.style.top = `${pos.y - 5}px`;
    labelElement.style.color = styledVector.color;
    this.labelsContainer.appendChild(labelElement);
  }

  _drawLine(x1, y1, x2, y2, color = "#ddd", width = 1) {
      const ctx = this.ctx;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
  }
  
  _drawLineCanvas(start, end, color = "#ddd", width = 1) {
    const s = this.toCanvasCoords(start);
    const e = this.toCanvasCoords(end);
    this._drawLine(s.x, s.y, e.x, e.y, color, width);
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.save();

    const lineWidth = 1;
    const gridColor = "#444"; 
    const axesColor = "#888";
    const step = 1;            // logical units per grid line
    const range = 10;          // grid extends from -range to +range

    // Draw transformed grid lines
    this._drawGridLines(step, range, gridColor, lineWidth);

    // Draw transformed X-axis
    const xAxisStart = new Vector2(-range, 0)
    const xAxisEnd   = new Vector2(range, 0)
    this._drawLineCanvas(xAxisStart, xAxisEnd, axesColor, lineWidth * 2);

    // Draw transformed Y-axis
    const yAxisStart = new Vector2(0, -range)
    const yAxisEnd   = new Vector2(0, range)
    this._drawLineCanvas(yAxisStart, yAxisEnd, axesColor, lineWidth * 2);

    // Draw integer ticks along the axes
    this._drawAxisTicks(range, axesColor);

    ctx.restore();
  }

  _drawAxisTicks(range = 10, color = "#888", tickSize = 5) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.font = "12px sans-serif";

    // X-axis ticks
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = -range; i <= range; i++) {
      if (i === 0) continue;
      const pos = this.toCanvasCoords(new Vector2(i, 0));
      // Tick mark
      this._drawLine(pos.x, pos.y - tickSize / 2, pos.x, pos.y + tickSize / 2, color, 1);
      // Label
      ctx.fillText(i, pos.x, pos.y + tickSize / 2 + 2);
    }

    // Y-axis ticks
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let i = -range; i <= range; i++) {
      if (i === 0) continue;
      const pos = this.toCanvasCoords(new Vector2(0, i));
      // Tick mark
      this._drawLine(pos.x - tickSize / 2, pos.y, pos.x + tickSize / 2, pos.y, color, 1);
      // Label
      ctx.fillText(i, pos.x + tickSize / 2 + 2, pos.y);
    }

    ctx.restore();
  }



  _drawGridLines(step = 1, range = 10, color = "#444", width = 1) {
    for (let i = -range; i <= range; i += step) {
      // Vertical line at x = i
      let startV = this.transformationMatrix.matmul(new Vector2(i, -range));
      let endV   = this.transformationMatrix.matmul(new Vector2(i, range));
      this._drawLineCanvas(startV, endV, color, width);

      // Horizontal line at y = i
      let startH = this.transformationMatrix.matmul(new Vector2(-range, i));
      let endH   = this.transformationMatrix.matmul(new Vector2(range, i));
      this._drawLineCanvas(startH, endH, color, width);
    }
  }

  _drawAxes(originx, originy, axesColor = "#888", lineWidth = 2) {
    this._drawLine(0, originy, this.canvas.width, originy, axesColor, lineWidth); // X-axis
    this._drawLine(originx, 0, originx, this.canvas.height, axesColor, lineWidth);
  }

  

  drawVectors() {
    const ctx = this.ctx;
    ctx.save();

    const lineWidth = 3;

    this._drawAllBasisVectors(ctx, lineWidth);
    this._drawAllAddedVectors(ctx, lineWidth);

    ctx.restore();
  }

  _drawAllAddedVectors(ctx, lineWidth) {
    for (let i = 0; i < this.addedStyledVectors.length; i++) {
      const vec = this.addedStyledVectors[i];
      this._drawArrow(ctx, vec.vector2, vec.color, lineWidth);
    }
  }

  _drawAllBasisVectors(ctx, lineWidth) {
    for (let i = 0; i < this.basisStyledVectors.length; i++) {
      const vec = this.basisStyledVectors[i];
      this._drawArrow(ctx, vec.vector2, vec.color, lineWidth);
    }
  }

  _drawArrow(ctx, vec, color, lineWidth) {
    const origin = this.toCanvasCoords(new Vector2(0, 0));
    const end = this.toCanvasCoords(vec);

    this._drawLine(origin.x, origin.y, end.x, end.y, color, lineWidth);
    this._drawArrowhead(ctx, origin, end, color);
  }

  _drawArrowhead(ctx, start, end, color) {
    const headLength = 20; // pixel size of arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  startAnimation(speed = 0.5, start = 0, end = 1) {
    const duration = Math.abs(end - start) * 1000 / speed
    this.animating = true

    const sliderNearEnd = Math.abs(start - end) < 0.03;
    if (sliderNearEnd) {
      this._onAnimationEnd(end);
      return;
    }

    const startTime = performance.now();

    const animate = (time) => {
      const progress = (time - startTime) / duration;
      if (progress >= 1) {
        this._onAnimationEnd(end);
        return;
      }

      const value = start + (end - start) * Math.max(0, progress);
      this.input.setSliderValue(value); // update slider and trigger redraw
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  _onAnimationEnd(endTime){
      this.input.setSliderValue(endTime);
      this.animating = false;
  }

  addRandomVector(){
      // Generate a random vector near the origin
      const randX = Math.random() - 0.5
      const randY = Math.random() - 0.5

      const vectorNr = this.addedStyledVectors.length + 1;
      const newVec = new StyledVector2(randX, randY, this._getRandomColor(), false, `v${vectorNr}`);
      newVec.vector2 = newVec.vector2.normalize().scale(Math.random() * 2 + 1);

      const inv = this.transformationMatrix.inv();

      if (!inv.isInf) {
        newVec.baseVector = inv.matmul(newVec.vector2)
      }
      else {
        newVec.baseVector = newVec.vector2;
        newVec.vector2 = this.transformationMatrix.matmul(newVec.baseVector);
      }

      // Add it to the view
      this.addedStyledVectors.push(newVec);

      // Redraw canvas
      this.update();
      this.draw();
  }

  clearVectors(){
    this.addedStyledVectors = [];
    this.draw();
  }

    // Convert logical coordinates → canvas pixels
  toCanvasCoords(v) {
    return {
      x: this.canvas.width / (2) + (v.x + this.pan.x) * this.zoom,
      y: this.canvas.height / (2) - (v.y + this.pan.y) * this.zoom
    };
  }

  // Convert canvas pixels → logical coordinates
  fromCanvasCoords(px, py) {
    return new Vector2(
      (px - this.canvas.width / 2) / this.zoom - this.pan.x,
      (this.canvas.height / 2 - py) / this.zoom - this.pan.y
    );
  }

  setCorrectDeviceView(){
  const matrixLabel = document.querySelector('#matrix-input-container p');
  const addVectorButton = document.querySelector('#add-vector-button');
  const clearVectorButton = document.querySelector('#clear-vector-button');


  if (window.innerWidth < this.app.mobileWidth) {
    matrixLabel.textContent = 'M:';
    addVectorButton.textContent = '+v';
    clearVectorButton.textContent = "-";

  } else {
    matrixLabel.textContent = 'Matrix:';
    addVectorButton.textContent = '+ Add Vector';
    clearVectorButton.textContent = "- Clear";
  }
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width
    this.canvas.height = rect.height
  }

  // Helper: random color generator
  _getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  _calcBaseVectorFrom(v){
    let baseV;
      const inv = this.transformationMatrix.inv()
      if (!inv.isInf()) {
        baseV = inv.matmul(v);
      } else {
        baseV = new Vector2(1, 1);
      }
      return baseV;
    }

  updateDeterminant() {
    if (this.input.showDeterminant) this.drawUnitSquare(true);
  }

  updateVectorList() {
    const list = document.getElementById("vector-list");
    const toggleBtn = document.getElementById("toggle-added-vectors")
    if (!list) return;
    list.innerHTML = "";

    const allVectors = [
      { label: "e1", styled: this.basisStyledVectors[0] },
      { label: "e2", styled: this.basisStyledVectors[1] },
      ...this.addedStyledVectors.map((v, i) => ({
        label: "v" + (i + 1),
        styled: v
      }))
    ];

    const vectorBoxCount = this.input.showAddedVectors ? allVectors.length : 2;
    const basisVectorCount = 2;
    if (allVectors.length > basisVectorCount) {
        toggleBtn.classList.remove('hidden');
      } else {
        toggleBtn.classList.add('hidden');
      }

    for (let i = 0; i < vectorBoxCount; i++) {
      const { label, styled } = allVectors[i];
      const li = document.createElement("li");

      if (i < 2) {
        // Basis vectors
        li.innerHTML = `<span style="color:${styled.color}">${label}</span>: ${styled.vector2.x.toFixed(2)}, ${styled.vector2.y.toFixed(2)}`;
      }  else if (this.input.showAddedVectors) {
        // Extra vectors
        li.innerHTML = `
          <span style="color:${styled.color}">${label}</span>:
          <input type="number" step="0.01" value="${styled.vector2.x.toFixed(2)}" style="width:50px" />
          <input type="number" step="0.01" value="${styled.vector2.y.toFixed(2)}" style="width:50px" />
        `;

        const [xInput, yInput] = li.querySelectorAll("input");

        xInput.addEventListener("change", () => {
          const inputVector = new Vector2(parseFloat(xInput.value), parseFloat(yInput.value));
          styled.baseVector = this._calcBaseVectorFrom(inputVector);
          this.update();
        });

        yInput.addEventListener("change", () => {
          const inputVector = new Vector2(parseFloat(xInput.value), parseFloat(yInput.value));
          styled.baseVector = this._calcBaseVectorFrom(inputVector);
          this.update();
        });
      }

      list.appendChild(li);
    }
  }

  drawUnitSquare(highlight = false) {
    const ctx = this.ctx;
    const det = this.transformationMatrix.det();
    // Transformed basis vectors
    const e1 = this.transformationMatrix.matmul(new Vector2(1, 0));
    const e2 = this.transformationMatrix.matmul(new Vector2(0, 1));

    // Compute corners of parallelogram
    const origin = new Vector2(0, 0);
    const p1 = this.toCanvasCoords(origin);
    const p2 = this.toCanvasCoords(e1);
    const p3 = this.toCanvasCoords(e1.add(e2));
    const p4 = this.toCanvasCoords(e2);

    ctx.save();

    // Fill and border style
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();

    if (highlight) {
      if(det > 0) {
         ctx.fillStyle = "#0044ff22";
        ctx.strokeStyle = "#00ffff";
      } else {
        ctx.fillStyle = "#66000022"
        ctx.strokeStyle = "#ee0000";
      }
      ctx.fill();
      ctx.lineWidth = 2;

    } else {
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
    }

    ctx.stroke();

    // Optional: display determinant value in the center
    this._printDeterminant(ctx, e1, e2);

    ctx.restore();
  }


  _printDeterminant(ctx, e1, e2) {
    const det = this.transformationMatrix.det();
    const center = this.toCanvasCoords(e1.add(e2).scale(0.5));
    ctx.fillStyle = "#00ffff";
    ctx.font = "14px monospace";
    ctx.fillText(`${det.toFixed(2)}`, center.x - 16, center.y);
  }
}

export default CoordinateView
