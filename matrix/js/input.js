import Matrix2 from "./linalg/matrix2.js";

/**
 * @typedef {import('./view/coordinateView.js').default} CoordinateView
 * @typedef {import('./app.js').default} App
 */

class InputPanel {
  /**
   * @param {App} app
   */
  constructor(app) {
    /** @type {App} */
    this.app = app;

    /** @type {Matrix2} */
    this.matrix = Matrix2.identity();
    /** @type {Matrix2} */
    this.nMatrix = Matrix2.identity();

    /** @type {number} */
    this.sliderValue = 1;

    /** @type {Matrix2} */
    this.startMatrix = Matrix2.identity();

    /** @type {boolean} */
    this.showAddedVectors = true;

    /** @type {() => void | null} */
    this.onChange = null; // callback to notify App

    /** @type {boolean} */
    this.showDeterminant = false;
    
    /** @type {boolean} */
    this.showGhostVectors = false;
  }

  initUI(){
    /**@type {CoordinateView} */
    this.view = this.app.view;

    const ids = ['mat-a', 'mat-b', 'mat-c', 'mat-d'];
    const keys = ['a', 'b', 'c', 'd']; // Matrix2 properties
    ids.forEach((id, i) => {
    document.getElementById(id).value = this.matrix[keys[i]];
    });
    
    const nIds = ['n-a', 'n-b', 'n-c', 'n-d'];
    nIds.forEach((id, i) => {
    document.getElementById(id).value = this.nMatrix[keys[i]];
    });
    this.bindUI();
  } 

  bindUI() {
    const view = this.view;  

    const fields = ['mat-a', 'mat-b', 'mat-c', 'mat-d'];
    const nFields = ['n-a', 'n-b', 'n-c', 'n-d'];

    this._addMatrixEntriesParsing(this.matrix, fields);
    this._addMatrixEntriesParsing(this.nMatrix, nFields);


    // Slider
    const slider = document.getElementById('transform-slider');
    slider.addEventListener('input', (e) => {
      this.sliderValue = parseFloat(e.target.value);
      if (this.onChange) this.onChange();
    });

    const playButton = document.getElementById("play-button");
    playButton.addEventListener("click", () => {
      view.startAnimation();
    });

    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
      this.setSliderValue(0);
      
    });

    const addVectorButton = document.getElementById("add-vector-button");
    addVectorButton.addEventListener("click", () => {
      view.addRandomVector()
      view.updateVectorList();
    });

    const clearVectorButton = document.getElementById("clear-vector-button");
    clearVectorButton.addEventListener("click", () => {
      view.clearVectors()
      view.updateVectorList();
    });

    const identityButton = document.getElementById("identity-button");
    identityButton.addEventListener("click", () => {
      this.startMatrix.setTo(Matrix2.identity());
      this.matrix.setTo(Matrix2.identity());
      this.updateMatrix(false);  
    })

    const squareButton = document.getElementById("square-button");
    squareButton.addEventListener("click", () => {
      this.startMatrix.setTo(this.matrix);
      this.matrix.setTo(this.matrix.matmul(this.matrix)); // M × M
      this.updateMatrixAndAnimate();
    });
    
    const multplyByNButton = document.getElementById("multiply-n-button");
    multplyByNButton.addEventListener("click", () => {
      console.log(this.matrix)
      this.startMatrix.setTo(this.matrix);
      this.matrix.setTo(this.matrix.matmul(this.nMatrix));
      console.log(this.matrix)
      this.updateMatrixAndAnimate();
    });


    const toggleAddedVectorsButton = document.getElementById('toggle-added-vectors');
    toggleAddedVectorsButton.style.display = "inline-flex";
    toggleAddedVectorsButton.addEventListener('click', () => {
      this.showAddedVectors = !this.showAddedVectors;
      toggleAddedVectorsButton.classList.toggle('active', !this.showAddedVectors);
      view.updateVectorList();
      view.update();
    });

    
    const settingsButton = document.getElementById("settings-button");
    const settingsPanel = document.getElementById("settings-panel");

      settingsButton.addEventListener("click", () => {
        settingsPanel.classList.toggle("show");
      }); 
    
    const showDeterminantCheck = document.getElementById("show-determinant");
    showDeterminantCheck.addEventListener("change", (e) => {
      this.showDeterminant = e.target.checked;
      if (this.onChange) this.onChange();
    });

    const showGhostVectorsCheck = document.getElementById("show-ghost-vectors");
    showGhostVectorsCheck.addEventListener("change", (e) => {
      this.showGhostVectors = e.target.checked;
      if (this.onChange) this.onChange();
    });
  }

  updateMatrixAndAnimate() {
    this.setSliderValue(0);
    this.updateMatrix(false);
    this.view.startAnimation();
  }

  //Right now the ids must have mat-a or n-a form, that is just unnecessary.
  _addMatrixEntriesParsing(matrix, fields) {
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        console.log(el, id, matrix, fields)
        el.addEventListener('change', () => {
          const val = parseFloat(el.value);
          if (!isNaN(val)) {
            el.value = this._formatValue(val);
            matrix[id.split('-')[1]] = val;
            if (this.onChange) this.onChange();
            this.view.updateVectorList();
            this.updateMatrix();
          }
        });
      }
    });
  }

  setSliderValue(value) {
    this.sliderValue = value;

    const slider = document.getElementById('transform-slider');
    if (slider) slider.value = value;

    if (this.onChange) this.onChange();
  }

  updateMatrix(resetStartMatrix=true) {
    if (resetStartMatrix) this.startMatrix.setTo(Matrix2.identity());
    this.updateNMatrixInputs();
    this.updateMatrixInputs()
  }

  updateMatrixInputs() {
    const a = document.getElementById('mat-a');
    const b = document.getElementById('mat-b');
    const c = document.getElementById('mat-c');
    const d = document.getElementById('mat-d');

    if (!a || !b || !c || !d) return;

    a.value = this._formatValue(this.matrix.a);
    b.value = this._formatValue(this.matrix.b);
    c.value = this._formatValue(this.matrix.c);
    d.value = this._formatValue(this.matrix.d);

    
    if (this.onChange) this.onChange();
  }

  updateNMatrixInputs() {
    
    const a = document.getElementById('n-a');
    const b = document.getElementById('n-b');
    const c = document.getElementById('n-c');
    const d = document.getElementById('n-d');

    if (!a || !b || !c || !d) return;

    a.value = this._formatValue(this.nMatrix.a);
    b.value = this._formatValue(this.nMatrix.b);
    c.value = this._formatValue(this.nMatrix.c);
    d.value = this._formatValue(this.nMatrix.d);

    if (this.onChange) this.onChange();
  }

  getMatrix() {
    return this.matrix
  }

  getSliderValue() {
    return this.sliderValue
  }

  getStartMatrix() {
    return this.startMatrix;
  }

  _formatValue(value) {
    return parseFloat(value.toFixed(2));
  }
}

export default InputPanel