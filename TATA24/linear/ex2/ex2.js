import { initSlide1 } from "./slide1.js";
import { initSlide2 } from "./slide2.js";
import { initSlide3 } from "./slide3.js";
import { initSlide4 } from "./slide4.js";



const initializers = {
    1: initSlide1,
    2: initSlide2,
    3: initSlide3,
    4: initSlide4
};

window.addEventListener("slidechange", event => {

    const slideNumber = event.detail;
    const init = initializers[slideNumber];

    if (init) {
        init();
    }
});

initSlide1();