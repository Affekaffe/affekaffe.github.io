import { initSlide1 } from "./slides/slide1.js";
import { initSlide2 } from "./slides/slide2.js";
import { initSlide3 } from "./slides/slide3.js";
import { initSlide4 } from "./slides/slide4.js";
import { initSlide5 } from "./slides/slide5.js";
import { initSlide6 } from "./slides/slide6.js";


const slides = [
    initSlide1,
    initSlide2,
    initSlide3,
    initSlide4,
    initSlide5,
    initSlide6
];


let currentSlide = 0;


const slideElements =
    document.querySelectorAll(".slide");


const previousButton =
    document.getElementById("previous");

const nextButton =
    document.getElementById("next");

const topNextButton =
    document.getElementById("top-next");

const slideNumber =
    document.getElementById("slide-number");

const slideProgress =
    document.getElementById("slide-progress");


function showSlide(index) {

    currentSlide = index;


    slideElements.forEach(
        (slide, i) => {

            slide.classList.toggle(
                "active",
                i === currentSlide
            );
        }
    );


    slideNumber.textContent =
        `${currentSlide + 1} / ${slideElements.length}`;


    slideProgress.textContent =
        `${currentSlide + 1} / ${slideElements.length}`;


    previousButton.disabled =
        currentSlide === 0;


    nextButton.disabled =
        currentSlide === slideElements.length - 1;


    topNextButton.disabled =
        currentSlide === slideElements.length - 1;


    /*
     * Hidden canvases have 0x0 dimensions.
     * Once the new slide becomes visible,
     * tell all slide visualizations to resize.
     */
    window.dispatchEvent(
        new Event("resize")
    );
}


function nextSlide() {

    if (
        currentSlide <
        slideElements.length - 1
    ) {

        showSlide(
            currentSlide + 1
        );
    }
}


function previousSlide() {

    if (currentSlide > 0) {

        showSlide(
            currentSlide - 1
        );
    }
}


previousButton.addEventListener(
    "click",
    previousSlide
);


nextButton.addEventListener(
    "click",
    nextSlide
);


topNextButton.addEventListener(
    "click",
    nextSlide
);


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "ArrowLeft") {

            previousSlide();
        }


        if (event.key === "ArrowRight") {

            nextSlide();
        }
    }
);


// Initialize each slide's own logic.
slides.forEach(
    init => init()
);


showSlide(0);