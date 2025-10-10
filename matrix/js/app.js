import InputPanel from "./input.js";
import CoordinateView from "./view/coordinateView.js"


class App {
  constructor() {
    this.input = new InputPanel(this); // handles matrix inputs & slider
    this.view = new CoordinateView(this); // handles canvas rendering
    this.setup();
  }

  setup() {

    this.input.initUI()
    this.view.initCanvas()
    
    this.input.onChange = () => {
      this.update();
    };


  }

  update() {
    const matrix = this.input.getMatrix();
    const t = this.input.getSliderValue();
    // Pass matrix + t to view for interpolation
    // e.g., this.view.updateVectors(matrix, t);
    this.view.update(matrix, t)
    this.view.draw();
  }
}

export default App