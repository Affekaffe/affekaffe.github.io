const buttons = document.querySelectorAll("#button-container button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const person = button.dataset.person;
    window.location.href = `${person}/index.html`; // redirect to the corresponding page
  });
});
