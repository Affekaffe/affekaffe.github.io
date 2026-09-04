import { initSlide1 } from "./slide1.js";
import { initSlide2 } from "./slide2.js";

const initializers = {
    1: initSlide1,
    2: initSlide2
};

window.addEventListener("slidechange", event => {

    const slideNumber = event.detail;
    const init = initializers[slideNumber];

    if (init) {
        init();
    }
});

initSlide1();