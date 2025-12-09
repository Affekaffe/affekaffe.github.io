import InputPanel from "./input.js";
import CoordinateView from "./view/coordinateView.js"
import Interaction from "./view/interaction.js";

/**
 * @typedef {Object} App
 * @property {number} mobileWidth
 * @property {InputPanel} input
 * @property {CoordinateView} view
 * @property {Interaction} interaction
 */
class App {
  constructor() {
    /** @type {number} */
    this.mobileWidth = 775;

    /** @type {InputPanel} */
    this.input = new InputPanel(this);

    /** @type {CoordinateView} */
    this.view = new CoordinateView(this);

    /** @type {Interaction} */
    this.interaction = new Interaction(this);

    this.setup();
  }

  setup() {
    this.input.initUI();
    this.view.initCanvas();
    this.interaction.initInteraction();
    this.update();

    this.input.onChange = () => {
      this.update();
    };


  }

  update() {
    const matrix = this.input.getMatrix();
    const t = this.input.getSliderValue();
    const animateFromMatrix = this.input.getStartMatrix();

    this.view.update(matrix, t, animateFromMatrix)
  }
}

export default App