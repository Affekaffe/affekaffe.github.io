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

    /** @type {number} */
    this.sliderValue = 1;

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
    this.bindUI();
  } 

  bindUI() {
  const view = this.view;  

  const fields = ['mat-a', 'mat-b', 'mat-c', 'mat-d'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        const val = parseFloat(el.value);
        if (!isNaN(val)) {
          el.value = this._formatValue(val);
          this.matrix[id.split('-')[1]] = val;
          if (this.onChange) this.onChange();
          this.view.updateVectorList();
        }
      });
    }
  })

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
      this.matrix = Matrix2.identity();
      this.updateMatrixInputs();  
    })

    const toggleBtn = document.getElementById('toggle-added-vectors');
    toggleBtn.style.display = "inline-flex";
    toggleBtn.addEventListener('click', () => {
      this.showAddedVectors = !this.showAddedVectors;
      toggleBtn.classList.toggle('active', !this.showAddedVectors);
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

  setSliderValue(value) {
    this.sliderValue = value;

    const slider = document.getElementById('transform-slider');
    if (slider) slider.value = value;

    if (this.onChange) this.onChange();
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

  getMatrix() {
    return this.matrix
  }

  getSliderValue() {
    return this.sliderValue
  }

  _formatValue(value) {
    return parseFloat(value.toFixed(2));
  }
}

export default InputPanel