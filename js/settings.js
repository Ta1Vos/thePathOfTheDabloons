const luckOption = document.querySelector(`.luck-option`);
const skipOption = document.querySelector(`.skip-option`);

const homeButton = document.querySelector(`.settings-home-btn`);

homeButton.addEventListener(`click`, saveSettings);

//Save all options
function saveSettings() {
    if (luckOption.checked == true) {
        localStorage.setItem(`luck`, true);
    } else {
        localStorage.setItem(`luck`, false);
    }

    if (skipOption.checked == true) {
        localStorage.setItem(`skipping`, true);
    } else {
        localStorage.setItem(`skipping`, false);
    }
}

if (localStorage.getItem(`luck`) == `false`) {
    luckOption.checked = false;
}

if (localStorage.getItem(`skipping`) == `false`) {
    skipOption.checked = false;
}