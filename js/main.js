const startButton = document.querySelector(`.start-button`);

startButton.addEventListener(`click`, startGame);

sessionStorage.setItem(`transitionFromGame`, false);

function startGame() {
    const overlayDiv = document.querySelector(`.overlay`);
    const body = document.querySelector(`body`);
    overlayDiv.style.zIndex = `10`;
    overlayDiv.style.opacity = `1`;
    body.style.backgroundColor = `black`;
    setTimeout(() => {
        window.location = `game.html`;
    }, 2500);
    sessionStorage.setItem(`transitionFromGame`, true);
}