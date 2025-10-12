import StyledVector2 from "./styledVector2.js";
import Vector2 from "../linalg/vector2.js";
import Matrix2 from "../linalg/matrix2.js";

class CoordinateView {
  constructor(app) {
    this.app = app;
    this.canvas = document.getElementById("view");
    this.ctx = this.canvas.getContext("2d");
    this.labelsContainer = document.getElementById("vector-labels")
    this.zoom = 100;
    this.pan = { x: 0, y: 0 };
    this.styledVectors = [new StyledVector2(1, 0, "red", true), new StyledVector2(0, 1, "green", true)];
    this.transformationMatrix = Matrix2.identity()
  }

  update(matrix = this.transformationMatrix, t = 1) {
    const matrix_t = Matrix2.identity().lerp(matrix, t)

    this.transformationMatrix = matrix_t;

    this.styledVectors[0].vector2 = matrix_t.matmul(new Vector2(1, 0));
    this.styledVectors[1].vector2 = matrix_t.matmul(new Vector2(0, 1));

    for (let i = 2; i < this.styledVectors.length; i++) {
      if(!this.styledVectors[i].baseVector) this.styledVectors[i].baseVector = this.styledVectors[i].vector2
      this.styledVectors[i].vector2 = matrix_t.matmul(this.styledVectors[i].baseVector);
    }
    this.setCorrectDeviceView();
    this.resizeCanvas();
    this.draw();
  }


  initCanvas() {
    this.resizeCanvas();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.setBackgroundColor("#222");

    this.drawGrid();
    this.drawVectors();
    this.updateVectorLabels();
    this.updateVectorList();
  }


  setBackgroundColor(color = "#000") {
    this.ctx.fillStyle = color; // replace with any color you like
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateVectorLabels() {
    // Clear previous labels
    this.labelsContainer.innerHTML = "";

    for (let i = 0; i < this.styledVectors.length; i++) {
      const styled = this.styledVectors[i];
      const label = i === 0 ? "e₁" : i === 1 ? "e₂" : `v${i - 1}`;

      const pos = this.toCanvasCoords(styled.vector2);

      const labelEl = document.createElement("div");
      labelEl.className = "vector-label";
      labelEl.textContent = label;
      labelEl.style.left = `${pos.x + 10}px`;
      labelEl.style.top = `${pos.y - 5}px`;
      labelEl.style.color = styled.color;
      this.labelsContainer.appendChild(labelEl);
    }
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

    for (let i = 0; i < this.styledVectors.length; i++) {
      const vec = this.styledVectors[i].vector2;
      const color = this.styledVectors[i].color;

      const origin = this.toCanvasCoords(new Vector2(0, 0));
      const end = this.toCanvasCoords(vec);
      
      this._drawLine(origin.x, origin.y, end.x, end.y, color, lineWidth)

      this._drawArrowhead(ctx, origin, end, color);
    }

    ctx.restore();
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

  startAnimation(duration = 2000) {
    const input = this.app.input;
    const startTime = performance.now();

    const animate = (time) => {
      const t = (time - startTime) / duration;
      if (t >= 1) {
        input.setSliderValue(1); // ensure it ends at 1
        return; // stop
      }

      input.setSliderValue(t); // update slider and trigger redraw
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  addRandomVector(){
      // Generate a random vector near the origin
      const randX = Math.random() - 0.5
      const randY = Math.random() - 0.5

      const newVec = new StyledVector2(randX, randY, this._getRandomColor());
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
      this.styledVectors.push(newVec);

      // Redraw canvas
      this.update();
      this.draw();
  }

  clearVectors(){
    this.styledVectors = [this.styledVectors[0], this.styledVectors[1]];
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

updateVectorList() {
  const list = document.getElementById("vector-list");
  const toggleBtn = document.getElementById("toggle-added-vectors")
  if (!list) return;
  list.innerHTML = "";

  const allVectors = [
    { label: "e1", styled: this.styledVectors[0] },
    { label: "e2", styled: this.styledVectors[1] },
    ...this.styledVectors.slice(2).map((v, i) => ({
      label: "v" + (i + 1),
      styled: v
    }))
  ];

  const vectorBoxCount = this.app.input.showAddedVectors ? allVectors.length : 2;

  if (allVectors.length > 2) {
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
    }  else if (this.app.input.showAddedVectors) {
      // Extra vectors
      li.innerHTML = `
        <span style="color:${styled.color}">${label}</span>:
        <input type="number" step="0.01" value="${styled.vector2.x.toFixed(2)}" style="width:40px" />
        <input type="number" step="0.01" value="${styled.vector2.y.toFixed(2)}" style="width:40px" />
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



}

export default CoordinateView
