let lastEvent = 1;
let worldNumber = 0;
let worldExplored = 0;

function eventList(number) {
    dialogBox.innerHTML = ``;

    if (number == lastEvent) {
        newEvent(RNGlimit, true);
        return;
    } else if (playerIsDead == true) {
        return;
    }

    lastEvent = number;

    // ---------------- FOREST ----------------
    if (worldNumber == 0) {
        switch (number) {
            case 0:
                dialogPrioritizer(`You finally progressed a little on the path.. Hopefully you'll find something new soon.`, `listOptions("continue")`);
                RNGlimit++;
                break;
            case 1:
                dialogPrioritizer(`"Hello there traveler! We meet again! What a coincidence.. | Here's another gift: 2 dabloons."`, `updateDabloonCounter(2);`);
                dialogPrioritizer(`"Safe travels, traveler!"`, `listOptions("continue");`);
                break;
            case 2:
                dialogPrioritizer(`The plants around the path around you started to become less dense, and revealed an open area in the forest.`);
                dialogPrioritizer(`Do you wish to search for an item or continue with your journey?`, `listOptions("search-item");`);
                break;
            case 3:
                thiefAppearance();
                break;
            case 4:
                dialogPrioritizer(`"Welcome traveler..! Welcome to my humble traveling shop! If you would like to buy something, then here are the items I currently have in stock:"`,
                    `generateShop(2, "common");`);
                break;
            case 5:
                dialogPrioritizer(`You decided to take a little break to restore energy.`, `useItemEvent();`);
                break;
            case 6:
                dialogPrioritizer(`Not too far in the distance, the path seemed to lead to a civilized area! Perhaps it was a village.. This encouraged you to continue walking!`
                    , `listOptions("continue")`);
                RNGlimit++;
                break;
            case 7:
                const randomNumber = generateRandomNumber(10) + 5;
                damageEvent(randomNumber);
                dialogPrioritizer(`While you were walking on the path, you tripped over a rock that appeared out of nowhere. You took ${randomNumber} damage`, `listOptions("continue")`);
                break;
            case 8:
                dialogPrioritizer(`"Greetings traveler! I am willing to buy an item from you for a low price.. Which one do you wish to sell?"`, `sellItemEvent();`);
                break;
            case 9:
                dialogPrioritizer(`You came across someone standing on the side of the path. The person approached you.`);
                dialogPrioritizer(`"Hello traveler! Do you have interest.. in buying one of my items? If so, here's the item I am willing to sell"`, `generateShop(1, "uncommon", 2)`);
                break;
            case 10:
                closedQuestionEvent(`random-item`);
                break;
            case 11:
                dialogPrioritizer(`You approached a bench.. Do you want sit down for a while and use an item?`);
                closedQuestionEvent(`bench`);
                break;
            default:
                dialogPrioritizer(`You approached the border of the village (WORLD 1), do you wish to enter the village?`);

                if (worldExplored == 0) {
                    dialogPrioritizer(`New area unlocked: Village!`);
                    worldExplored = 1;
                }

                closedQuestionEvent(`enter-village`);
                break;
        }
    } else if (worldNumber == 1) {
        let randomNumber;
        // ---------------- VILLAGE ----------------
        switch (number) {
            case 0:
                dialogPrioritizer(`You approached the path leading back to the forest (WORLD 0), do you wish to go here?`);
                closedQuestionEvent(`enter-forest`);
                break;
            case 1:
                dialogPrioritizer(`You came across a luxurious building with large letters labelled: "LOTTERY" on top of it. Do you wish to enter this building?`);
                lotteryEvent(20);
                break;
            case 2:
                dialogPrioritizer(`You entered a fancy shop.. | Welcome traveler! Which item would you like to buy?`, `generateShop(2, "uncommon");`);
                break;
            case 3:
                dialogPrioritizer(`You entered a shop where you can sell your items.. | "Hello there traveler! Do you have any items you're willing to sell?"`
                , `sellItemEvent();`);
                break;
            case 4:
                randomNumber = generateRandomNumber(2) + 1;
                updateDabloonCounter(randomNumber);
                dialogPrioritizer(`While walking through the village, you found ${randomNumber} dabloons on the ground!`, `listOptions("continue");`);
                break;
            case 5:
                dialogPrioritizer(`You approached a bench.. Do you want sit down for a while and use an item?`);
                closedQuestionEvent(`bench`);
                break;
            case 6:
                dialogPrioritizer(`A random thought appeared in your mind:`);
                randomNumber = generateRandomNumber(4);
                if (randomNumber == 0) {
                    dialogPrioritizer(`This town has a pretty nice scenery.. heh.`, `listOptions("continue");`);
                } else if (randomNumber == 1) {
                    dialogPrioritizer(`Its nice I've found this town on my journey..`, `listOptions("continue");`);
                } else if (randomNumber == 2) {
                    dialogPrioritizer(`I wonder how the weather will be for the rest of the day..`, `listOptions("continue");`);
                } else if (randomNumber == 3) {
                    dialogPrioritizer(`Would there be a larger force out there? Someone that would be controlling this entire world.. Huh.. Who knows?`, `listOptions("continue");`);
                } else if (randomNumber == 4) {
                    dialogPrioritizer(`I can't wait what I'll find on the rest of my journey.`, `listOptions("continue");`);
                }
                break;
                case 7:
                    dialogPrioritizer(`You noticed someone near an alley, you approached him`);
                    dialogPrioritizer(`"Interested in buying.. an item?"`, `generateShop(1, "rare", 5)`);
                    break;
            default:
                dialogPrioritizer(`You approached the border of the dark forest (WORLD 2), do you wish to enter the dark forest?`);

                if (worldExplored == 1) {
                    dialogPrioritizer(`New area unlocked: Dark forest!`);
                    worldExplored = 2;
                }

                closedQuestionEvent(`enter-dark-forest`);
                break;
        }
    } else if (worldNumber == 2) {
        // ---------------- DARK FOREST ----------------
        if (playerHasLantern == false && number > 3) {
            RNGlimit = 3;
            dialogPrioritizer(`The forest is too dark to continue.. Perhaps you should find yourself a lantern.`, `listOptions("continue")`);
            return;
        } else if (playerHasLantern == true) {
            dialogPrioritizer(`The lantern showed you the path through the darkness of the forest.`);
        }

        switch (number) {
            case 0:
                dialogPrioritizer(`You approached the edge of the dark forest leading back to the village (WORLD 1), do you wish to go here?`);
                closedQuestionEvent(`enter-village`);
                break;
            case 1:
                thiefAppearance();
                break;
            case 2:
                dialogPrioritizer(`You progressed on the path while walking on the path... The darkness was giving you the creeps.`, `listOptions("continue")`);
                RNGlimit++;
                break;
            case 3:
                dialogPrioritizer(`You approached a bench that has seen better times.. Do you want sit down and use an item?`);
                closedQuestionEvent(`bench`);
                break;
            case 4:
                dialogPrioritizer(`A shady person approached you... | "Greetings traveler... do you have interest in one of my items?"`, `generateShop(1, "unique");`);
                break;
            case 5:
                thiefAppearance();
                break;
            default:
                newEvent(RNGlimit);
        }
    }
}


//Transition for the black screen fade
const overlayDiv = document.querySelector(`.overlay`).style;
overlayDiv.zIndex = `10`;
overlayDiv.transition = `0s`;
overlayDiv.opacity = `1`;
setTimeout(() => {
    overlayDiv.transition = `3.5s`;
    overlayDiv.opacity = `0`;
    editPlayerEffects();
}, 1);
setTimeout(() => {
    overlayDiv.zIndex = `-10`;
}, 3501);

// First event
setTimeout(() => {
    dialogPrioritizer(`"Greetings traveler! Welcome to this new world! |
    I do not know where you came from. Although I will give you a gift for your upcoming travels! |
    Here are:"`);
    dialogPrioritizer(`"5 dabloons!"`, `updateDabloonCounter(5);`);
    dialogPrioritizer(`"I wish you much luck on your journey. Perhaps we'll meet up again! Goodbye for now!"`, `listOptions("search-item")`);
}, 4000);

if (luckEnabled == false) {
    dialogPrioritizer(`Luck is not enabled.`);
}