import InputPanel from "./input.js";
import CoordinateView from "./view/coordinateView.js"
import Interaction from "./view/interaction.js";


class App {
  constructor() {
    this.mobileWidth = 775;

    this.input = new InputPanel(this); // handles matrix inputs & slider
    this.view = new CoordinateView(this); // handles canvas rendering
    this.interaction = new Interaction(this);
    this.setup();
  }

  setup() {

    this.input.initUI();
    this.view.initCanvas();
    this.interaction.setupEvents();

    this.input.onChange = () => {
      this.update();
    };


  }

  update() {
    const matrix = this.input.getMatrix();
    const t = this.input.getSliderValue();

    this.view.update(matrix, t)
  }
}

export default App