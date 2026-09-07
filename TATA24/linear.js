const slides = document.querySelectorAll(".slide");
const progressDots = document.querySelectorAll(".progress-dot");

const previousButton =
    document.getElementById("previous");

const nextButton =
    document.getElementById("next");

const slideNumber =
    document.getElementById("slide-number");

let currentSlide = 1;

const totalSlides =
    slides.length;


function showSlide(number) {

    currentSlide = number;

    slides.forEach(slide => {

        const number =
            Number(slide.dataset.slide);

        slide.classList.toggle(
            "active",
            number === currentSlide
        );
    });


    window.dispatchEvent(
        new CustomEvent(
            "slidechange",
            {
                detail: currentSlide
            }
        )
    );


    progressDots.forEach(dot => {

        const number =
            Number(dot.dataset.slide);

        dot.classList.toggle(
            "active",
            number === currentSlide
        );
    });


    slideNumber.textContent =
        `${currentSlide} / ${totalSlides}`;


    previousButton.disabled =
        currentSlide === 1;

    nextButton.disabled =
        currentSlide === totalSlides;
}


nextButton.addEventListener(
    "click",
    () => {

        if (currentSlide < totalSlides) {
            showSlide(currentSlide + 1);
        }
    }
);


previousButton.addEventListener(
    "click",
    () => {

        if (currentSlide > 1) {
            showSlide(currentSlide - 1);
        }
    }
);


progressDots.forEach(dot => {

    dot.addEventListener(
        "click",
        () => {

            const number =
                Number(dot.dataset.slide);

            showSlide(number);
        }
    );
});


document.addEventListener(
    "keydown",
    event => {

        // Arrow keys belong to the game
        // while slide 6 is active.
        if (currentSlide === 6) {
            return;
        }

        if (
            event.key === "ArrowRight" &&
            currentSlide < totalSlides
        ) {
            showSlide(currentSlide + 1);
        }

        if (
            event.key === "ArrowLeft" &&
            currentSlide > 1
        ) {
            showSlide(currentSlide - 1);
        }
    }
);


showSlide(1);