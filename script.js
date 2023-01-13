// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const answerButns = document.querySelectorAll('.choose-answer');
const playAgainBtn = document.querySelector('#play-again-button');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuess = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0s';

// Stored Answers
let playerGuessArray = [];

// Scroll
let valueY = 0;

// refresh splash page best scores
const bestScoresToDOM = () => {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}`;
  });
}

// check local storage for best scores, set bestScoreArray
const getSavedBestScores = () => {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.getItem('bestScores'));
  } else {
    bestScoreArray = [
      { question: 10, bestScore: finalTimeDisplay, },
      { question: 25, bestScore: finalTimeDisplay, },
      { question: 50, bestScore: finalTimeDisplay, },
      { question: 99, bestScore: finalTimeDisplay, },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  // Update Splash Page
  bestScoresToDOM();
}

// Update Best Score Array
const updateBestScore = () => {
  bestScoreArray.forEach((score, index) => {
    //Select correct bestScore to Update
    if (questionAmount === score.question) {
      // Return Best Score as a number with 1 Decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore.split('s')[0]);
      // Update if the new Final Score is less or replacing 0
      if (savedBestScore === 0 || finalTime < savedBestScore) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save To Local Storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

const showScorePage = () => {
  // show Play Again button after 1 second
  setTimeout(() => playAgainBtn.style.display = 'initial', 1000);

  gamePage.hidden = true;
  scorePage.hidden = false;
}

// reset a game
const playAgain = () => {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

//  Formats & displays time in DOM
const scoresToDOM = () => {
  finalTimeDisplay = finalTime.toFixed(1);
  timePlayed = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${timePlayed}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();

  // scroll to top of game page
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
}

// stop timer and process results
const checkTime = () => {
  if (playerGuessArray.length === questionAmount) {
    clearInterval(timer);
    // check for wrong guesses, add penalty time
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
        //Correct guess, no penalty
      } else {
        // Incorrect guess, add penalty time
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

// Add  a tenth of a second to time played
const addTime = () => {
  timePlayed += 0.1;
  checkTime();
}

// when game starts
const startTimer = () => {
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
}

// Scroll, Store user selection in player guess array
const select = (guessedTrue) => {
  //scroll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  (guessedTrue === 'Right') ? playerGuessArray.push('true') : playerGuessArray.push('false');
}

// Displays showGamePage
const showGamePage = () => {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Get random Number To a Max Number
const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// add equations to DOM
const equationsToDOM = () => {
  equationsArray.forEach((equation) => {
    //Item
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Displays 3, 2, 1, GO!!!!!!
const countdownStart = () => {
  countdown.textContent = '3';
  setTimeout(() => countdown.textContent = '2', 1000);
  setTimeout(() => countdown.textContent = '1', 2000);
  setTimeout(() => countdown.textContent = 'GO!', 3000);
}

// Navigate from Splash to countdown page
const showCountdown = () => {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
  setTimeout(() => showGamePage(), 4000);
}

// Get Value from selected radio Button
const getRadioValue = () => {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

const selectQuestionAmount = (e) => {
  e.preventDefault();
  questionAmount = parseInt(getRadioValue());
  (questionAmount) ? showCountdown() : null;
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected label Styling
    if (radioEl.classList.contains('selected-label'))
      radioEl.classList.remove('selected-label');
    // Add back if radio input is checked
    if (radioEl.children[0].children[0].checked)
      radioEl.classList.add('selected-label');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Event Listeners
  startForm.addEventListener('submit', (e) => selectQuestionAmount(e));
  answerButns.forEach((answerOptionEl) => {
    answerOptionEl.addEventListener('click', (e) => select(e.target.textContent));
  });
  gamePage.addEventListener('click', startTimer);
  playAgainBtn.addEventListener('click', playAgain);

  getSavedBestScores();
});

