const dialogBox = document.querySelector(`.dialog-box`);
const optionBox = document.querySelector(`.option-box`);
const removeItemsBox = document.querySelector(`.option-box-overlay`);
const imageDisplay = document.querySelector(`.image-display`);
const dabloonCounter = document.querySelector(`.dabloon-amount`);
const body = document.querySelector(`body`);

// Extras menu queryselectors
const extrasDiv = document.querySelector(`.extras-menu`);
const extrasButton = document.querySelector(`.extras-button img`);
const menuOverlay = document.querySelector(`.menu-overlay`);
const inventoryTab = document.querySelector(`.inventory-tab`);
const inventoryButton = document.querySelector(`.inventory-button`);
const questsTab = document.querySelector(`.quests-tab`);
const questsButton = document.querySelector(`.quests-button`);
const settingsTab = document.querySelector(`.settings-tab`);
const settingsButton = document.querySelector(`.settings-button`);

// Stats Queryselectors
const statsTab = document.querySelector(`.game-stats`);
const statsSettingsButton = document.querySelector(`.display-stats`);
const luckLocation = document.querySelector(`.luck-counter`);
const healthLocation = document.querySelector(`.health-counter`);
const regenLocation = document.querySelector(`.regen-counter`);
const poisonLocation = document.querySelector(`.poison-counter`);
const distanceLocation = document.querySelector(`.distance-counter`);

let currentConfirmButton = document.querySelector(`.confirm-button`);

extrasButton.addEventListener(`click`, toggleExtrasTab);

//Eventlisteners with direct function

//Toggle the inventory
inventoryButton.addEventListener(`click`, function () {
    inventoryTab.classList.toggle(`add-opacity`);
});
//Toggle the quests tab
questsButton.addEventListener(`click`, function () {
    questsTab.classList.toggle(`add-opacity`);
});
//Toggle the settings tab
settingsButton.addEventListener(`click`, function () {
    settingsTab.classList.toggle(`add-opacity`);
});
//Toggle the in-game stats tab
statsSettingsButton.addEventListener(`click`, function () {
    statsTab.classList.toggle(`remove-opacity`);
});

let extrasTabOpen = false;
let dialogTyping = true;

//RNG Values
let RNGlimit = 4;
let maxRNG = 14;

//Player values
let inventoryList = [``, ``, ``, ``, ``, ``, ``, ``, ``, ``, ``, ``];
let inventoryMax = [2, false, false, false];
let questsList = [];
let luckEnabled = true;
let luckAmount = 0;
let healthAmount = 100;
let dabloonAmount = 0;

let repellentEffect = 0;
let playerHasLantern = false;
//Hp amount[0], regeneration[1], regen duration[2], poison[3], poison duration[4], damage amount[5], changeLuck[6]
let playerEffects = [0, 0, 0, 0, 0, 0, 0];
let playerIsDead = false;

//Shop variables
let addConfirmAfterDialog = false;
let currentItemInView = [``, 0];

//General settings loaders
if (localStorage.getItem(`luck`) == `false`) {
    luckEnabled = false;
    luckLocation.innerHTML = `Disabled`;
}

if (localStorage.getItem(`skipping`) == `false`) {
    dialogTyping = false;
}

//All items
const existingItems = [
    //Common items
    [`water`, `sandwich`, `twig`, `plastic knife`, `small pouch`, `cookie`],
    //Uncommon items
    [`teleportation potion`, `backpack`, `dull knife`, `lottery ticket`, `fortune cookie`],
    //Rare items
    [`camping pack`, `strange sandwich`, `map`, `new knife`, `thief repellent`, `lantern`],
    //Unique items
    [`item magnet`, `dagger`],
    //Legendary items
    [`reverse card`, `Dabloon knife`]
];

//Prioritizer
let dialogRunning = false;

//Open the menu
function toggleExtrasTab() {
    menuOverlay.classList.toggle(`display-grid`);
    extrasButton.classList.toggle(`go-left`);
    extrasDiv.classList.toggle(`add-opacity`);
}

// --------------------------- GAME FUNCTIONS ---------------------------

//Add button to the option menu
function addOptionButton(content) {
    const newDiv = document.createElement(`div`);
    newDiv.classList.add(`option-box-option`);
    newDiv.textContent = content;
    optionBox.appendChild(newDiv);
}

//Change the image in the middle
function changeGameImage(image) {
    imageDisplay.innerHTML = `<img class="game-image" src="/img/${image}.jpg" alt="forest">`;
}

//Change the theme of the game
function changeBackgroundColor(color) {
    if (color == `default`) {
        body.style.backgroundColor = `#DDF8E8`;
        dialogBox.style.backgroundColor = `#5f943c`;
        optionBox.style.backgroundColor = `#A9D18E`;
        dabloonCounter.style.color = `black`;
    } else if (color == `dark`) {
        body.style.backgroundColor = `rgb(0, 46, 21)`;
        dialogBox.style.backgroundColor = `#3f6327`;
        optionBox.style.backgroundColor = `#708a5e`;
        dabloonCounter.style.color = `green`;
    }
}

//This function takes care of the dabloon-add up animation. This also edits the dabloonAmount value.
function updateDabloonCounter(amount) {
    amount = Math.round(amount);
    if (amount < 0) {
        dabloonAmount = dabloonAmount - 1;
        dabloonCounter.innerHTML = `${dabloonAmount}`;
        setTimeout(() => {
            updateDabloonCounter(amount + 1);
        }, 75);
    } else if (amount > 0) {
        dabloonAmount = dabloonAmount + 1;
        dabloonCounter.innerHTML = `${dabloonAmount}`;
        setTimeout(() => {
            updateDabloonCounter(amount - 1);
        }, 75);
    }
}

//Apply affects to player, this will update and affect health, regen, poison, distance and luck.
function editPlayerEffects(damageUpdate, itemUsed) {
    const hpAmount = playerEffects[0];
    let regenPercentage = playerEffects[1];
    const regenDuration = playerEffects[2];
    const poisonDamage = playerEffects[3];
    const poisonDuration = playerEffects[4];
    const damageAmount = playerEffects[5];
    const changeLuck = playerEffects[6];

    //Deals damage to players
    if (damageAmount > 0) {
        healthAmount = healthAmount - damageAmount;
        playerEffects[5] = 0;
    }

    //Deals poison damage
    if (poisonDuration > 0 && itemUsed != true) {
        healthAmount = healthAmount - poisonDamage;
        playerEffects[4] = playerEffects[4] - 1;
    }

    //Item effects
    if (damageUpdate != true) {
        //Adding hp when items are used.
        if (damageUpdate != true && hpAmount > 0) {
            healthAmount = healthAmount + hpAmount;
            playerEffects[0] = 0;
        }

        //Change the player's luck
        if (changeLuck != 0) {
            if (luckEnabled == true) {
                playerEffects[6] = 0;
                luckAmount = luckAmount + changeLuck;
            } else if (luckEnabled == false) {
                dialogPrioritizer(`Luck is not enabled.`);
            }
        }

        luckLocation.innerHTML = luckAmount;
    }

    if (damageUpdate != true && itemUsed != true) {
        //Regen hp
        regenPercentage = regenPercentage + 1;
        healthAmount = healthAmount + Math.ceil(healthAmount / 100 * regenPercentage);

        //If the regen worn off it will be removed
        if (regenDuration <= 0) {
            playerEffects[1] = 0;
        } else {
            playerEffects[2] = playerEffects[2] - 1;
        }

        if (RNGlimit < 4) {
            RNGlimit = 4;
        }

        if (repellentEffect > 0) {
            repellentEffect--;
            if (repellentEffect == 0) {
                dialogPrioritizer(`The thief repellent worn off....`);
            }
        }

        distanceLocation.innerHTML = RNGlimit - 4;
        regenLocation.innerHTML = `${regenPercentage}%`;

        if (healthAmount < 0) {
            playerIsDead = true;
            removeItemsBox.classList.remove(`remove-opacity`);
            removeItemsBox.innerHTML = ``;
            optionBox.innerHTML = ``;
            setTimeout(() => {
                optionBox.innerHTML = ``;
                removeItemsBox.innerHTML = ``;
                setTimeout(() => {
                    dialogPrioritizer(`You have died, as your health reached 0 or less. Start a new game in the side-menu (press the 9 dots to open).`);
                }, 1000);
            }, 1000);
        }
    }

    //If health is over 100 it is set to 100
    if (healthAmount > 100) {
        healthAmount = 100;
    }

    healthLocation.innerHTML = healthAmount;
    poisonLocation.innerHTML = poisonDamage;
}

//This function creates a random number within the given limit, if this is undefined it will follow the set RNGMax
function generateRandomNumber(limit) {
    let numberLimit;
    if (limit == undefined) {
        numberLimit = maxRNG;
    } else if (limit == RNGlimit) {
        if (limit > maxRNG) {
            limit = maxRNG;
        }
    } else {
        numberLimit = limit;
    }

    const generatedNumber = Math.floor(Math.random() * limit);
    return generatedNumber;
}

//This function will check if the user has enough inventory space, otherwise it will prompt the user to throw one item away. After the user has thrown one away it will replace that item
//with the new item, or throw the new item away.
function checkInventory(addItem, itemRemoved, boughtItem) {
    let inventoryOccupiedSpace = 0;

    if (itemRemoved == true) {
        removeItemsBox.classList.add(`remove-opacity`);
        removeItemsBox.innerHTML = ``;
        //If the player doesn't want to drop items
        if (addItem == `none`) {
            dialogPrioritizer(`You left behind the ${currentItemInView[0]} you just got..`);
            inventoryOccupiedSpace--;
        } else {
            for (i = 0; i < inventoryList.length; i++) {
                if (inventoryList[i] == addItem) {
                    addItem = currentItemInView[0];
                    dialogPrioritizer(`You left behind the ${inventoryList[i]}..`);
                    dialogPrioritizer(`${addItem} has been added to your inventory!`);

                    inventoryList[i] = addItem;
                    document.querySelector(`.block${i + 1}`).innerHTML = `<img src="/icons/${addItem}.png" alt="${addItem}" style="width: 100%; height: 100%;"></img>`;
                    break;
                }
            }

            return;
        }
    }

    //Counts how many items the user has
    for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i] != ``) {
            inventoryOccupiedSpace++;
        }
    }

    //Checks if the user has too many items
    if (inventoryOccupiedSpace >= inventoryMax[0]) {
        listOptions(`drop-items`);
        dialogPrioritizer(`Oh no! It seems that your inventory is full.. Which item would you like to leave behind?`);
    } else {
        for (let i = 0; i < inventoryMax[0]; i++) {
            if (inventoryList[i] == ``) {
                inventoryList[i] = addItem;
                setTimeout(() => {
                    dialogPrioritizer(`${addItem} has been added to your inventory!`);
                    // document.querySelector(`.block${i + 1}`).innerHTML = `${addItem}`;
                    document.querySelector(`.block${i + 1}`).innerHTML = `<img src="/icons/${addItem}.png" alt="${addItem}" style="width: 100%; height: 100%;"></img>`;
                    return true;
                }, 500);
                break;
            }
        }
    }
}

//Completely remove an item from the inventory
function removeItemFromInventory(item) {
    for (let i = 0; inventoryList.length; i++) {
        if (inventoryList[i] == item) {
            inventoryList[i] = ``;
            document.querySelector(`.block${i + 1}`).innerHTML = ``;
            return;
        }
    }
}

//This function empties every box that contains information
async function newEvent(limit, ignoreTimeout) {
    if (ignoreTimeout == true) {
        optionBox.innerHTML = ``;
        dialogBox.innerHTML = ``;
        eventList(generateRandomNumber(limit));
        return;
    }

    let timeOut = 1500;

    optionBox.innerHTML = ``;
    editPlayerEffects();

    if (dialogRunning == false) {
        setTimeout(() => {
            dialogBox.innerHTML = ``;
        }, 1000);

        setTimeout(() => {
            eventList(generateRandomNumber(limit));
        }, timeOut);
    } else {
        setTimeout(() => {
            dialogBox.innerHTML = ``;
            setTimeout(() => {
                eventList(generateRandomNumber(limit));
            }, 250);
        }, 3250);
    }
}

//This function makes it so only 1 dialog can run at a time.
function dialogPrioritizer(dialogText, nextFunction, addConfirmButton) {
    if (dialogRunning == false) {
        dialogRunning = true;

        if (addConfirmButton != undefined) {
            addConfirmAfterDialog = addConfirmButton;
        }

        runDialog(dialogText, nextFunction);
    } else {
        setTimeout(() => {
            dialogPrioritizer(dialogText, nextFunction, addConfirmButton);
        }, 600);
    }
}

//This function places letters by letters in dialogs
function runDialog(dialogText, nextFunction, letterCount) {
    let timeOut = 25;

    if (letterCount == undefined) {
        dialogBox.innerHTML += `<p>`;
        letterCount = 0;
    }

    //Skip a line or place a letter
    if (dialogText.charAt(letterCount) == `|`) {
        dialogBox.innerHTML += `<br>`;
    } else {
        if (dialogTyping == true) {
            if (dialogText.charAt(letterCount) == `.` || dialogText.charAt(letterCount) == `!` || dialogText.charAt(letterCount) == `?` || dialogText.charAt(letterCount) == `,`) {
                timeOut = 300;
            }
        } else {
            timeOut = 0;
        }

        dialogBox.innerHTML += dialogText.charAt(letterCount);
    }

    //Function keeps running until the entire dialog has finished
    if (dialogText.length != letterCount) {
        letterCount++;
        setTimeout(() => {
            runDialog(dialogText, nextFunction, letterCount);
        }, timeOut);
        //When the dialog line has finished generating
    } else {
        dialogBox.innerHTML += `</p>`;
        dialogRunning = false;

        //If a function should be called
        if (nextFunction != undefined) {
            //WARNING: THE EVAL() METHOD IS INSANELY UNSAFE, REMINDER FOR MYSELF: TRY TO FIND OTHER WAYS TO CONVERT THIS VALUE/STRING INTO CODE SAFELY
            //The eval method converts **ANY** string into executable code. In this way I can easily call/start other functions after dialogue finishes.
            //Perhaps try using this soon: window[this.actionCallback]("testArgument");
            if (nextFunction.length < 40) {
                // eval(nextFunction);
                new Function(nextFunction)();
            }
        }

        //Add a confirm button and remove other ones
        if (addConfirmAfterDialog != false) {
            //Remove all confirm buttons
            if (currentConfirmButton) {
                currentConfirmButton = document.querySelectorAll(`.confirm-button`);
                for (let i = 0; i < currentConfirmButton.length; i++) {
                    currentConfirmButton[i].remove();
                }
            }

            dialogBox.innerHTML += `<button class="confirm-button">Confirm</button>`;
            currentConfirmButton = document.querySelector(`.confirm-button`);

            //Add a confirm button
            if (addConfirmAfterDialog == true) {
                currentConfirmButton.addEventListener(`click`, buyItem);
                //If the call came from an item use
            } else if (addConfirmAfterDialog == `useItem`) {
                currentConfirmButton.addEventListener(`click`, function () {
                    currentConfirmButton.remove();
                    viewItemInfo(currentItemInView[0], true, true);
                });
            } else if (addConfirmAfterDialog == `sellItem`) {
                currentConfirmButton.addEventListener(`click`, function () {
                    currentConfirmButton.remove();
                    viewItemInfo(currentItemInView[0], true, undefined, true);
                });
            }

            addConfirmAfterDialog = false;
        }
    }
}

//This function generates a random rarity, which is affected by luck. It will return either common, uncommon rare, unique or legendary with the given rarity numbers.
function generateRarity(common, uncommon, rare, unique, lengendary) {
    let localLuck = luckAmount;
    //Common-uncommon-rare-unique-legendary
    let rarityChances = [common, uncommon, rare, unique, lengendary];
    let removeChances = 0;
    //This loop extracts amounts from common & uncommon and adds them up to the rare rarities. This is to calculate the amount of luck.
    //If the luck is negative, it will extract from the rare ones and add them up to the common ones.
    for (let i = 0; i < rarityChances.length; i++) {
        const chance = rarityChances[i];
        if (chance > 20 && luckAmount > 0 && i <= 1) {
            let calculatedChance = Math.floor(luckAmount ** 2 / (luckAmount / 2));
            if (i == 1) {
                calculatedChance = calculatedChance - calculatedChance / 5;
            }
            while (chance - calculatedChance < 0) {
                calculatedChance = calculatedChance - 0.1;
            }
            rarityChances[i] = chance - calculatedChance;
            let addChances = calculatedChance / 10;
            rarityChances[1] = rarityChances[1] + addChances * 4.5;
            rarityChances[2] = rarityChances[2] + addChances * 3;
            rarityChances[3] = rarityChances[3] + addChances * 1.5;
            rarityChances[4] = rarityChances[4] + addChances * 1;
        }
        if (luckAmount < 0) {
            let tempValue;
            switch (i) {
                //rare
                case 1:
                    tempValue = luckAmount;
                    removeChances = removeChances - tempValue;
                    rarityChances[1] = rarityChances[1] + tempValue;
                    break;
                case 2:
                    tempValue = luckAmount / 2;
                    removeChances = removeChances - tempValue;
                    rarityChances[2] = rarityChances[2] + tempValue;
                    break;
                //unique
                case 3:
                    tempValue = luckAmount / 4;
                    removeChances = removeChances - tempValue;
                    rarityChances[3] = rarityChances[3] + tempValue;
                    break;
                //legendary
                case 4:
                    tempValue = luckAmount / 6;
                    removeChances = removeChances - tempValue;
                    rarityChances[4] = rarityChances[4] + tempValue;
                    break;
            }
            while (rarityChances[i] < 0) {
                removeChances = removeChances - 0.1;
                rarityChances[i] = rarityChances[i] + 0.1;
            }
        }
    }
    rarityChances[0] = rarityChances[0] + removeChances;
    const randomNumber = Math.floor(Math.random() * 10000) / 100;

    if (randomNumber < rarityChances[0]) {
        return `common`;
    } else if (randomNumber < rarityChances[1] + rarityChances[0]) {
        return `uncommon`;
    } else if (randomNumber < rarityChances[2] + rarityChances[1] + rarityChances[0]) {
        return `rare`;
    } else if (randomNumber < rarityChances[3] + rarityChances[2] + rarityChances[1] + rarityChances[0]) {
        return `unique`;
    } else {
        return `legendary`;
    }
}

//This function generates items where you can give the amount it returns and the rarity of these items.
function generateShopItems(itemAmount, shopRarity) {
    let randomItemList = [];
    let chosenItems = [];
    let rarity;

    for (let i = 0; i < itemAmount; i++) {
        let sameItemCount = 0;
        switch (shopRarity) {
            case `legendary`:
                rarity = generateRarity(30, 34, 18, 9.5, 8.5);
                break;
            case `unique`:
                rarity = generateRarity(50, 27.6, 13.5, 7, 1.9);
                break;
            case `rare`:
                rarity = generateRarity(65, 21.5, 7.5, 4.9, 1.1);
                break;
            case `uncommon`:
                rarity = generateRarity(75, 18.5, 4, 2.25, 0.25);
                break;
            default:
                rarity = generateRarity(85, 12.5, 2, 0.5, 0);
        }

        if (rarity == `common`) {
            const itemList = existingItems[0];
            const randomNumber = generateRandomNumber(itemList.length);
            randomItemList.push(itemList[randomNumber]);
        } else if (rarity == `uncommon`) {
            const itemList = existingItems[1];
            const randomNumber = generateRandomNumber(itemList.length);
            randomItemList.push(itemList[randomNumber]);
        } else if (rarity == `rare`) {
            const itemList = existingItems[2];
            const randomNumber = generateRandomNumber(itemList.length);
            randomItemList.push(itemList[randomNumber]);
        } else if (rarity == `unique`) {
            const itemList = existingItems[3];
            const randomNumber = generateRandomNumber(itemList.length);
            randomItemList.push(itemList[randomNumber]);
        } else {
            const itemList = existingItems[4];
            const randomNumber = generateRandomNumber(itemList.length);
            randomItemList.push(itemList[randomNumber]);
        }

        //Loop checks if the item isnt in the shop already
        for (let x = 0; x < randomItemList.length; x++) {
            const currentItem = randomItemList[i];
            if (currentItem == chosenItems[x]) {
                randomItemList.pop();
                i--;
                break;
            }
            //The item only get added if the loop has ended and the item hasn't been the same
            if (x + 1 >= randomItemList.length && currentItem != chosenItems[x]) {
                chosenItems.push(currentItem);
                break;
            }
        }
    }

    return chosenItems;
}

//This function lists options in the option box.
function listOptions(optionType, optionList, sellItem) {
    let entireOptionList;

    //Different kind of formats
    if (optionType == `continue`) {
        optionBox.innerHTML = ``;

        addOptionButton(`Continue`);
        entireOptionList = document.querySelectorAll(`.option-box-option`);
    } else if (optionType == `drop-items`) {
        optionList = [];

        for (let i = 0; i < inventoryList.length; i++) {
            if (inventoryList[i] != ``) {
                removeItemsBox.innerHTML += `<div class="remove-items-option">${inventoryList[i]}</div>`;
            }
        }

        removeItemsBox.innerHTML += `<div class="remove-items-option">none</div>`;
        removeItemsBox.classList.remove(`remove-opacity`);
        entireOptionList = document.querySelectorAll(`.remove-items-option`);
    } else if (optionType == `search-item`) {
        optionBox.innerHTML = ``;

        addOptionButton(`Continue`);
        addOptionButton(`Search item`);
        entireOptionList = document.querySelectorAll(`.option-box-option`);
    } else if (optionType == `show-inventory`) {
        optionBox.innerHTML = ``;

        for (let i = 0; i < inventoryList.length; i++) {
            if (inventoryList[i] != ``) {
                addOptionButton(inventoryList[i]);
            }
        }

        addOptionButton(`none`);
        entireOptionList = document.querySelectorAll(`.option-box-option`);
    }

    for (let i = 0; i < entireOptionList.length; i++) {
        let clearOptionBox = true;

        entireOptionList[i].addEventListener(`click`, function () {
            if (dialogRunning == false) {
                if (optionType == `drop-items`) {
                    //Drop items
                    checkInventory(entireOptionList[i].innerHTML, true);
                    clearOptionBox = false;
                } else if (optionType == `show-inventory`) {
                    //Show inventory options for selling and using items

                    if (sellItem == true) {
                        viewItemInfo(entireOptionList[i].innerHTML, true, undefined, `show`);
                        clearOptionBox = false;
                    } else {
                        //When using an item
                        viewItemInfo(entireOptionList[i].innerHTML, true);
                        clearOptionBox = false;
                    }
                } else if (optionList != undefined) {
                    //Triggers if the question is related to something important
                    optionChosen(entireOptionList[i].innerHTML, optionType);
                } else {
                    //Triggers if the question isn't anything special.
                    optionChosen(entireOptionList[i].innerHTML);
                }

                if (clearOptionBox == true) {
                    optionBox.innerHTML = ``;
                }
            }
        });
    }
}

//Create a question, all questions must be inside of an array
async function createQuestion(questions) {
    optionBox.innerHTML = ``;

    for (let i = 0; i < questions.length; i++) {
        addOptionButton(questions[i]);
    }

    entireOptionList = document.querySelectorAll(`.option-box-option`);

    let promise = new Promise((resolve) => {
        for (let i = 0; i < entireOptionList.length; i++) {
            const currentOption = entireOptionList[i];

            currentOption.addEventListener(`click`, function () {
                if (currentOption.innerHTML == `yes`) {
                    resolve(`yes`);
                } else if (currentOption.innerHTML == `no`) {
                    resolve(`no`);
                }

                optionBox.innerHTML = ``;
            });
        }
    });

    let answer = await promise;
    return answer;
}

//This function executes specific code after an option has been pressed.
function optionChosen(chosenOption, optionType, extraShopPrice) {
    //The confirm button is removed here to prevent spam glitches
    if (optionType == undefined) {
        if (chosenOption == `Continue`) {
            dialogPrioritizer(`You headed on with your journey..`, `newEvent(RNGlimit);`);
        } else if (chosenOption == `Search item`) {
            dialogPrioritizer(`You left the path behind yourself and explored the area.`, `searchItem();`)
        }
    } else {
        //When the user pressed leave
        if (chosenOption == `leave`) {
            optionBox.innerHTML = ``;
            dialogPrioritizer(`"Thank you for visiting, traveler, good luck on your journey!"`, `newEvent(RNGlimit);`);
            return;
        }
        //If there's a shop, the item will be searched that has been picked
        if (optionType == `shop`) {
            viewItemInfo(chosenOption, false, false, false, extraShopPrice);
        }
    }
}

//This function is a list with all items in-game with their prices and descriptions.
function viewItemInfo(chosenOption, dontPurchaseItem, itemUsed, sellItem, extraPrice) {
    let itemPrize;
    let itemDescription;
    let itemUsable = false;
    let healAmount;
    let itemLuck;
    //Percentage, duration
    let regen = [0, 0];
    //Items
    let common;
    let uncommon;
    let rare;
    let unique;
    let legendary;

    //This loop puts every item in the existing items array into a rarity so I won't have to edit too much. In this way it will
    //always be the same and mistakes in spelling won't matter in the code
    for (let i = 0; i < existingItems.length; i++) {
        const itemArray = existingItems[i];
        let tempArray = [];
        for (let x = 0; x < itemArray.length; x++) {
            const currentItem = itemArray[x];
            tempArray.push(currentItem);
        }

        switch (i) {
            case 0:
                common = tempArray;
                break;
            case 1:
                uncommon = tempArray;
                break;
            case 2:
                rare = tempArray;
                break;
            case 3:
                unique = tempArray;
                break;
            case 4:
                legendary = tempArray;
        }
    }

    switch (chosenOption) {
        //common items
        case common[0]:
            itemPrize = 2;
            regen = [5, 5];
            itemDescription = `Increase regeneration by ${regen[0]}% for ${regen[1]} turns. Refreshing!`;
            itemUsable = true;
            break;
        case common[1]:
            itemPrize = 2;
            healAmount = 10;
            itemDescription = `Heal ${healAmount} hp. Yummy!`;
            itemUsable = true;
            break;
        case common[2]:
            itemPrize = 5;
            itemDescription = `30% chance to fend off thieves. Can be used until it has fended someone off. But seriously, it's literally a twig.`;
            break;
        case common[3]:
            itemPrize = 6;
            itemDescription = `Stab an enemy to stun them in pain. Beware that not everybody can be stunned by this.`;
            break;
        case common[4]:
            itemPrize = 10;
            itemDescription = `Increases inventory space by 2. Useful to hold a few small items in!`;
            break;
        case common[5]:
            itemPrize = 3;
            healAmount = 5;
            regen = [10, 3];
            itemDescription = `Heal ${healAmount} hp and increase regeneration by ${regen[0]}% for ${regen[1]} turns. Delicious!`;
            itemUsable = true;
            break;
        //uncommon items
        case uncommon[0]:
            itemPrize = 13;
            itemDescription = `Teleport to a random location to escape thieves. 
            There's a label on the back that warns you about something, although it is written in a weird language. Great way of making people buy this.`;
            itemUsable = true;
            break;
        case uncommon[1]:
            itemPrize = 25;
            itemDescription = `Increases inventory space by 4. Great to hold a lot of small items!`;
            break;
        case uncommon[2]:
            itemPrize = 15;
            itemDescription = `Threaten people with a dull knife! The label says to not use it in fights.. huh..`;
            break;
        case uncommon[3]:
            itemPrize = 10;
            itemDescription = `Small chance to win the lottery… Let's hope you will… Luck has effect, but it will decline after use.`;
            break;
        case uncommon[4]:
            itemPrize = 12;
            itemLuck = 3;

            if (luckAmount > 0) {
                itemLuck = 1;
                healAmount = 30;
            }

            itemDescription = `If you don't have any luck, increase luck by 3, otherwise increase luck by 1 and heal 30 hp.`;
            itemUsable = true;
            break;
        //Rare items
        case rare[0]:
            itemPrize = 65;
            itemDescription = `Increases inventory space by 4. Can hold multiple large items. How can you wear so many backpacks?`;
            break;
        case rare[1]:
            itemPrize = 30;
            healAmount = 100;
            itemDescription = `Heals 100 hp. … What is even in this?`;
            itemUsable = true;
            break;
        case rare[2]:
            itemPrize = 40;
            itemDescription = `Displays all locations where you've been, easy to return to these locations! Finally, no need to get lost anymore!`;
            itemUsable = true;
            break;
        case rare[3]:
            itemPrize = 50;
            itemDescription = `Use for self defense. Finally, actually something to defend yourself with.`;
            break;
        case rare[4]:
            itemPrize = 35;
            itemDescription = `Avoid thieves for 15 events. Finally, those swarms won't sting you anymore.. wait-`;
            itemUsable = true;
            break;
        case rare[5]:
            itemPrize = 30;
            itemDescription = `Light the path in darkest of times. You only need to purchase this once.`;
            break;
        //Unique
        case unique[0]:
            itemPrize = 100;
            itemDescription = `Larger chance to find items… Lets hope it doesn't attract thieves..`;
            break;
        case unique[1]:
            itemPrize = 60;
            itemDescription = `Use to fend off thieves. Has multiple uses. Has a chance to make thieves drop dabloons or items. Learn them a lesson!`;
            break;
        //Legendary
        case legendary[0]:
            itemPrize = 250;
            itemDescription = `Return any attack back to its sender. Only has one use. Where the hell did you even get this?`;
            break;
        case legendary[1]:
            itemPrize = 500;
            itemDescription = `Attract thieves and fend em away at the same time. Seriously? Did you really have to buy this just so you can flex with it? Bruh...`;
            break;
    }

    //Buy item
    if (dontPurchaseItem != true) {
        if (extraPrice == undefined) {
            extraPrice = 0;
        }

        currentItemInView[0] = chosenOption;
        currentItemInView[1] = itemPrize + extraPrice;

        const tempString = `${chosenOption}: ${itemDescription} | "Costs ${itemPrize + extraPrice} dabloons. | Do you want to purchase this item?"`;
        dialogPrioritizer(tempString, undefined, true);
        //Sell item
    } else if (sellItem != undefined) {
        if (worldNumber == 0) {
            itemPrize = Math.round(itemPrize / 4);
        } else if (worldNumber == 1) {
            itemPrize = Math.round(itemPrize / 4 * 2);
        } else if (worldNumber == 2) {
            itemPrize = Math.round(itemPrize / 4 * 3);
        }

        if (chosenOption == `none`) {
            dialogPrioritizer(`"Oh. That's unfortunate.. Well hopefully you'll have something next time!"`, `listOptions("continue");`);
            return;
        } else if (sellItem == `show`) {
            dialogPrioritizer(`"${chosenOption} sells for ${itemPrize} dabloons, do you want to sell this item?"`, undefined, `sellItem`);
            currentItemInView[0] = chosenOption;
            currentItemInView[1] = 9999;
        } else if (sellItem == true) {
            updateDabloonCounter(itemPrize);
            removeItemFromInventory(chosenOption);
            dialogPrioritizer(`You sold ${chosenOption}. | "Great doing business, traveler!"`, `listOptions("continue");`);
        }

        return;
        //Use item
    } else {
        if (chosenOption == `none`) {
            dialogPrioritizer(`You decided to not use an item.`, `listOptions("continue")`);
            return;
        } else if (itemUsed == true) {
            if (chosenOption == `teleportation potion`) {
                dialogPrioritizer(`You drank the potion with the strange liquid...`);
                dialogPrioritizer(`You teleported away and ended up in a random location.`, `listOptions("continue");`);

                const randomNumber = generateRandomNumber(10) - 6;
                RNGlimit = RNGlimit + randomNumber;
                editPlayerEffects();
                return;
            } else if (chosenOption == `map`) {
                useMap();
                return;
            }

            applyItemEffects(healAmount, regen[0], regen[1], itemLuck);
            dialogPrioritizer(`You used the ${chosenOption} and continued your journey.`, `listOptions("continue");`);
            editPlayerEffects(undefined, true)
            removeItemFromInventory(chosenOption);

            return;
        }

        dialogPrioritizer(`${chosenOption}: ${itemDescription}`);

        if (itemUsable == true) {
            //Confirmation will launch this function again, but only with itemUsed active.
            dialogPrioritizer(`Do you want to use this item?`, undefined, `useItem`);
            currentItemInView[0] = chosenOption;
            currentItemInView[1] = 9999;
        } else {
            dialogPrioritizer(`You cannot use this item right now..`);
            return;
        }
    }
}

//This function adds effects from items in viewItemInfo to the player.
function applyItemEffects(healAmount, regenAmount, duration, itemLuck) {
    if (healAmount > 0) {
        dialogPrioritizer(`You healed ${healAmount} health`);
        playerEffects[0] = playerEffects[0] + healAmount;
    }

    if (regenAmount > 0) {
        dialogPrioritizer(`You received ${regenAmount}% regeneration for ${duration} turns!`);
        playerEffects[1] = playerEffects[1] + regenAmount;
    }

    if (duration > 0) {
        playerEffects[2] = playerEffects[2] + duration;
    }

    if (itemLuck > 0) {
        dialogPrioritizer(`You received ${itemLuck} luck!`);
        playerEffects[6] = playerEffects[6] + itemLuck;
    }
}

// The function to generate the map options after its used
function useMap() {
    optionBox.innerHTML = ``;
    dialogPrioritizer(`You took a look at your map and looked at where you wanted to go.`);

    for (let i = 0; i < worldExplored; i++) {
        if (i != worldNumber) {
            addOptionButton(`WORLD ${i}`);
        }
    }
    addOptionButton(`Stay`);
    entireOptionList = document.querySelectorAll(`.option-box-option`);

    for (let i = 0; i < entireOptionList.length; i++) {
        entireOptionList[i].addEventListener(`click`, function () {
            if (entireOptionList[i].innerHTML == `Stay`) {
                dialogPrioritizer(`You decided to stay..`, `listOptions("continue");`);
            } else if (entireOptionList[i].innerHTML == `WORLD 0`) {
                worldNumber = 0;
                dialogPrioritizer(`You started to walk back into the direction of the forest..`);
                dialogPrioritizer(`After a little while you entered the forest again!`, `listOptions("continue");`);
            } else if (entireOptionList[i].innerHTML == `WORLD 1`) {
                worldNumber = 1;
                dialogPrioritizer(`You started to walk into the direction of the village..`);
                dialogPrioritizer(`You eventually walked back into the village!`, `listOptions("continue");`);
            } else if (entireOptionList[i].innerHTML == `WORLD 2`) {
                worldNumber = 2;
                dialogPrioritizer(`You started to walk into the direction of the dark forest..`);
                dialogPrioritizer(`As you reached the edge of the forest, you shivered as you see how dark the forest is again.`, `listOptions("continue");`);
            } else {
                dialogPrioritizer(`This world hasn't been added yet.`, `useMap();`)
            }
        });
    }
}

//This function gets executed after you confirm to buy an item and extracts the dabloons and checks for your inventory. It also checks if you have bought an upgrade.
function buyItem(freeItem) {
    const currentItem = currentItemInView[0];

    if (freeItem != true) {
        currentConfirmButton.remove();
    }

    if (currentItemInView[1] <= dabloonAmount) {

        //If the player bought any inventory upgrades, the player would get the upgrade here, instead of getting the item in the inventory.
        if (currentItem == `small pouch` || currentItem == `backpack` || currentItem == `camping pack` || currentItem == `thief repellent`) {
            if (currentItem == `small pouch` && inventoryMax[1] == false) {
                updateDabloonCounter(-currentItemInView[1]);
                dialogPrioritizer(`Increased inventory by 2! (Small pouch)`);
                inventoryMax[0] = inventoryMax[0] + 2;
                inventoryMax[1] = true;
            } else if (currentItem == `backpack` && inventoryMax[2] == false) {
                updateDabloonCounter(-currentItemInView[1]);
                dialogPrioritizer(`Increased inventory by 4! (Backpack)`);
                inventoryMax[0] = inventoryMax[0] + 4;
                inventoryMax[2] = true;
            } else if (currentItem == `camping pack` && inventoryMax[3] == false) {
                updateDabloonCounter(-currentItemInView[1]);
                dialogPrioritizer(`Increased inventory by 4! (Camping pack)`);
                inventoryMax[0] = inventoryMax[0] + 4;
                inventoryMax[2] = true;
            } else if (currentItem == `thief repellent`) {
                updateDabloonCounter(-currentItemInView[1]);
                dialogPrioritizer(`You used the repellent on yourself, and you immediately felt safer!`);
                repellentEffect = repellentEffect + 15;
            } else if (currentItem == `lantern`) {
                updateDabloonCounter(-currentItemInView[1]);
                dialogPrioritizer(`You decided to put the lantern away and use it when it is needed.`);
                playerHasLantern = true;
            } else {
                dialogPrioritizer(`You already have the ${currentItem}.`);
            }
            return;
        }

        updateDabloonCounter(-currentItemInView[1]);
        checkInventory(currentItemInView[0]);
    } else {
        dialogPrioritizer(`"Oh, I'm sorry.. You do not have enough dabloons to purchase this item.."`);
    }
}

// Function for when the player wants to use an item in the inventory, works like listOptions, but this only uses a promise to make code wait.
// NOTE: THIS FUNCTION HAS TO BE CALLED BY ANOTHER ASYNC FUNCTION SO IT WILL WAIT.
async function useItem(sellItem) {
    if (sellItem != true) {
        dialogPrioritizer(`Which item would you like to use?`);
    }

    optionBox.innerHTML = ``;

    for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i] != ``) {
            addOptionButton(inventoryList[i]);
        }
    }

    addOptionButton(`none`);
    entireOptionList = document.querySelectorAll(`.option-box-option`);

    // This promise will wait for you to press one of the many generated buttons, which would be items from your inventory.
    // Once one of these is pressed, it will make this function continue and return the clicked item.
    // Because the function is async, it is able to wait for other things to finish.
    let promise = new Promise((resolve) => {
        for (let i = 0; i < entireOptionList.length; i++) {
            entireOptionList[i].addEventListener(`click`, function () {
                if (dialogRunning == false) {
                    resolve(entireOptionList[i].innerHTML);
                }
            });
        }
    });

    let itemUsed = await promise;

    if (itemUsed == `none`) {
        itemUsed = [false, itemUsed];
    } else {
        itemUsed = [true, itemUsed];
    }

    return itemUsed;
}

//Event which triggers the player to use an item
function useItemEvent() {
    dialogPrioritizer(`Which item would you like to use?`);
    listOptions(`show-inventory`, undefined);
}

//Event where play can sell one of their items
function sellItemEvent() {
    listOptions(`show-inventory`, undefined, true);
}

// This function generates a shop with the given amount of items and the shop rarity.
function generateShop(itemAmount, shopRarity, extraPrice) {
    let entireOptionList;
    let optionList = generateShopItems(itemAmount, shopRarity);

    //This loop turns all items into buttons
    for (let i = 0; i < optionList.length; i++) {
        addOptionButton(optionList[i]);
    }

    addOptionButton(`leave`);
    entireOptionList = document.querySelectorAll(`.option-box-option`);

    for (let i = 0; i < entireOptionList.length; i++) {
        entireOptionList[i].addEventListener(`click`, function () {
            if (dialogRunning == false) {
                optionChosen(entireOptionList[i].innerHTML, `shop`, extraPrice);

                if (entireOptionList[i] == `none`) {
                    setTimeout(() => {
                        optionBox.innerHTML = ``;
                    }, 500);
                }
            }
        });
    }
}

// --------------------------- GAME EVENTS ---------------------------

// Function for when the player searches for an item.
function searchItem() {
    const randomNumber = generateRandomNumber(10);
    let itemMagnet = false;

    for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i] == `item magnet`) {
            itemMagnet = true;
            break;
        }
    }

    //Generate a random event to occur when searching for items.
    if (randomNumber == 0) {
        thiefAppearance();
        return;
    } else if (randomNumber >= 1 && randomNumber <= 4) {
        const randomDabloonAmount = generateRandomNumber(4) + 1;
        dialogPrioritizer(`You found ${randomDabloonAmount} dabloons!`, `updateDabloonCounter(${randomDabloonAmount})`);
    } else if (randomNumber <= 6 || itemMagnet == true) {
        const itemGroupRarity = generateRarity(65, 20, 8.75, 4.25, 2);
        const foundItem = generateShopItems(1, itemGroupRarity);
        currentItemInView = [foundItem, 0];
        dialogPrioritizer(`You found a ${foundItem}!`, `buyItem(true);`);
    } else {
        dialogPrioritizer(`You didn't find anything...`);
    }

    dialogPrioritizer(`You returned to the path..`, `listOptions("continue");`)
}

// Function to make a thief appear
async function thiefAppearance() {
    let randomNumber;

    dialogPrioritizer(`Oh no! A thief appeared in front of you!`);

    if (repellentEffect > 0) {
        dialogPrioritizer(`Luckily, The repellent scared the thief away!`, `listOptions("continue")`);
        return;
    }

    const itemUsed = await useItem();
    optionBox.innerHTML = ``;

    // After an item is used
    if (itemUsed[0] == true || repellentEffect > 0) {
        let thiefRuns = false;
        let itemBroke = false;
        let extraDabloons = 0;

        switch (itemUsed[1]) {
            case `twig`:
                randomNumber = generateRandomNumber(9);

                if (randomNumber <= 2) {
                    thiefRuns = true;
                    itemBroke = true;
                }
                break;
            case `plastic knife`:
                randomNumber = generateRandomNumber(9);

                if (randomNumber <= 3) {
                    thiefRuns = true;
                    randomNumber = generateRandomNumber(10);
                    if (randomNumber < 3) itemBroke = true;
                }
                break;
            case `dull knife`:
                randomNumber = generateRandomNumber(8);

                if (randomNumber <= 4) {
                    thiefRuns = true;
                    randomNumber = generateRandomNumber(12);
                    if (randomNumber < 3) itemBroke = true;
                }
                break;
            case `new knife`:
                randomNumber = generateRandomNumber(7);

                if (randomNumber <= 4) {
                    thiefRuns = true;
                    randomNumber = generateRandomNumber(14);
                    if (randomNumber < 2) itemBroke = true;
                }
                break;
            case `dagger`:
                randomNumber = generateRandomNumber(6);

                if (randomNumber <= 5) {
                    thiefRuns = true;
                    randomNumber = generateRandomNumber(18);
                    extraDabloons = generateRandomNumber(5);

                    if (randomNumber < 1) itemBroke = true;
                }
                break;
            case `Dabloon knife`:
                thiefRuns = true;
                extraDabloons = generateRandomNumber(16) + 4;
                break;
            case `reverse card`:
                thiefRuns = true;
                randomNumber = generateRandomNumber(300) + 50;

                dialogPrioritizer(`You equipped the reverse card.`);
                dialogPrioritizer(`Oh no! The thief striked back with a knife and dealt 100 damage!`);
                dialogPrioritizer(`But wait... Your reverse card reversed the damage! The thief got dealt 100 damage and died!`);
                dialogPrioritizer(`The thief dropped ${randomNumber} dabloons!`, `listOptions("continue")`);

                setTimeout(() => {
                    updateDabloonCounter(randomNumber);
                }, 10000);
                removeItemFromInventory(`reverse card`);
                return;
            case `teleportation potion`:
                dialogPrioritizer(`You drank up the potion with the strange liquid.. and you teleported away from the thief!`);
                dialogPrioritizer(`But where have you ended up....?`, `listOptions("continue")`);

                randomNumber = generateRandomNumber(10) - 5;
                RNGlimit = RNGlimit + randomNumber;
                editPlayerEffects();
                return;
        }

        //If the thief runs he will drop dabloons, special weapons will make him drop more.
        if (thiefRuns == true) {
            dialogPrioritizer(`The ${itemUsed[1]} scared the thief away!`, `listOptions("continue")`);
            const dabloonsReceived = generateRandomNumber(9) + 1 + extraDabloons;
            dialogPrioritizer(`The thief dropped ${dabloonsReceived} dabloons!`);

            if (dabloonsReceived < 0) {
                dabloonsReceived = 0;
            }

            updateDabloonCounter(dabloonsReceived);

            if (itemBroke == true) {
                dialogPrioritizer(`The ${itemUsed[0]} broke..!`);
                removeItemFromInventory(itemUsed[0]);
            }
            return;
            //If an item does not work, the thief will attack back
        } else {
            dialogPrioritizer(`The ${itemUsed[1]} had no effect on the thief...`);
            const returnDamage = generateRandomNumber(20) + 5;
            playerEffects[5] = playerEffects[5] + returnDamage;
            dialogPrioritizer(`Oh no! The thief striked back with a knife and dealt ${returnDamage} damage!`, `editPlayerEffects(true);`);
        }
    }

    dialogPrioritizer(`"Haha! Hello there traveler! I am here to steal dabloons from the rich and give them to the poor! Lets see how many dabloons you have.."`);

    if (dabloonAmount < 20) {
        randomNumber = generateRandomNumber(10) + 1;
        dialogPrioritizer(`"Oh... you don't have many? That changes the situation then! Here: have ${randomNumber} dabloons!"`
            , `updateDabloonCounter(${randomNumber})`);
        dialogPrioritizer(`"Goodbye traveler, I wish you luck with the journey ahead of you!"`);
    } else if (dabloonAmount <= 50) {
        dialogPrioritizer(`"I see... So you aren't too poor? Well it wouldn't bother then if you'd give some to the poor.. heheheh!"`
            , `updateDabloonCounter(-${dabloonAmount / 7})`);
        dialogPrioritizer(`"Goodbye traveler, and see you soon!" :)`);
    } else if (dabloonAmount > 50) {
        dialogPrioritizer(`"Well well well, so you're pretty rich, huh? That means you can sacrifice quite some dabloons for the poor.. 
            Give em here!"`, `updateDabloonCounter(-${dabloonAmount / 5})`);
        dialogPrioritizer(`"You better shouldn't get many dabloons soon, traveler. Otherwise I'll find you again!" :)`);
    }

    dialogPrioritizer(`The thief left...`, `listOptions("continue")`);
}

//Event where health will be reduced from the total
function damageEvent(damage) {
    playerEffects[5] = playerEffects[5] + damage;
    editPlayerEffects(true);
}

//List of all closed questions (yes/no) and the events after pressing yes
async function closedQuestionEvent(currentEvent) {
    let answer;

    if (currentEvent == `random-item`) {
        const randomItem = generateShopItems(1, "common");
        dialogPrioritizer(`A ${randomItem} would lay on the edge of the path. Do you want to pick it up?`);
        answer = await createQuestion([`yes`, `no`]);

        if (answer == `yes`) {
            currentItemInView[0] = randomItem;
            currentItemInView[1] = 9999;
            checkInventory(randomItem);
            listOptions(`continue`);
        } else {
            dialogPrioritizer(`You continued your journey.`, `newEvent(RNGlimit);`);
        }
    } else if (currentEvent == `bench`) {
        answer = await createQuestion([`yes`, `no`]);

        if (answer == `yes`) {
            useItemEvent();
        } else {
            dialogPrioritizer(`You continued your journey.`, `newEvent(RNGlimit);`);
        }
    } else if (currentEvent == `enter-forest`) {
        // Enter the forest
        answer = await createQuestion([`yes`, `no`]);

        if (answer == `yes`) {
            worldNumber = 0;
            maxRNG = 14;

            changeGameImage(`forest-path`);
            changeBackgroundColor(`default`);
            dialogPrioritizer(`You returned to the forest...`, `listOptions("continue");`);
        } else {
            dialogPrioritizer(`You decided to stay...`, `newEvent(RNGlimit);`);
        }
    } else if (currentEvent == `enter-village`) {
        // Enter the village
        answer = await createQuestion([`yes`, `no`]);

        if (answer == `yes`) {
            worldNumber = 1;
            maxRNG = 9;
            RNGlimit = maxRNG;

            changeGameImage(`village`);
            changeBackgroundColor(`default`);
            dialogPrioritizer(`You entered the village...`, `listOptions("continue");`);
        } else {
            dialogPrioritizer(`You decided to stay...`, `newEvent(RNGlimit);`);
        }
    } else if (currentEvent == `enter-dark-forest`) {
        // Enter the dark forest
        answer = await createQuestion([`yes`, `no`]);

        if (answer == `yes`) {
            worldNumber = 2;
            maxRNG = 5;

            if (worldExplored == 2) {
                RNGlimit = 4;
            } else {
                RNGlimit = maxRNG;
            }

            changeGameImage(`dark-forest`);
            changeBackgroundColor(`dark`);
            dialogPrioritizer(`You entered the dark forest.  .  .  .  .`, `listOptions("continue");`);
        } else {
            dialogPrioritizer(`You decided to stay...`, `newEvent(RNGlimit);`);
        }
    }
}

//generate a lottery building
async function lotteryEvent(winChance) {
    answer = await createQuestion([`yes`, `no`]);

    if (answer == `yes`) {
        dialogPrioritizer(`You entered the lottery building..`);
        dialogPrioritizer(`"Hello there dear traveler, would you like to try out your luck and use a lottery ticket?"`);

        for (let i = 0; i < inventoryList.length; i++) {
            if (inventoryList[i] == `lottery ticket`) {
                addOptionButton(`lottery ticket`);
            }
        }
        addOptionButton(`leave`);
        entireOptionList = document.querySelectorAll(`.option-box-option`);

        for (let i = 0; i < entireOptionList.length; i++) {
            entireOptionList[i].addEventListener(`click`, function () {
                if (dialogRunning != true) {
                    optionBox.innerHTML = ``;

                    if (entireOptionList[i].innerHTML == `lottery ticket`) {
                        const randomNumber = generateRandomNumber(winChance);

                        removeItemFromInventory(`lottery ticket`);
                        dialogPrioritizer(`*suspenseful moment...*`);

                        setTimeout(() => {
                            if (randomNumber >= winChance - luckAmount) {
                                const lotteryProfit = generateRandomNumber(winChance) + 10;

                                luckAmount = Math.ceil(luckAmount - winChance / 10);
                                updateDabloonCounter(lotteryProfit);

                                dialogPrioritizer(`"Oh my.. congratulations! You've won ${lotteryProfit} dabloons! Congratulations!"`, `listOptions("continue");`);
                            } else {
                                dialogPrioritizer(`"Uh oh... too bad.. You didn't win the lottery.. Better luck next time!"`, `listOptions("continue");`);
                            }
                        }, 3000);
                    } else {
                        dialogPrioritizer(`"Oh well, we'll see you again traveler! Goodbye!"`, `listOptions("continue");`);
                    }
                }
            });
        }
    } else {
        dialogPrioritizer(`You walked away from the lottery building..`, `newEvent(RNGlimit);`);
    }
}

dabloonCounter.innerHTML = `${dabloonAmount}`;