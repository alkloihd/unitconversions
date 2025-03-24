/********************************************************
 *  GLOBAL STATE
 ********************************************************/
let questionBank = [];
let currentLevel = 1;
let currentQuestionIndex = 0;
let correctCountInLevel = 0;
let totalCorrectCount = 0;
let totalAnswered = 0;
const requiredCorrectToAdvance = 10;
const maxLevel = 10;
let currentQuestions = [];

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const questionScreen = document.getElementById('question-screen');
const finalScreen = document.getElementById('final-screen');
const levelLabel = document.getElementById('level-label');
const questionText = document.getElementById('question-text');
const hintBox = document.getElementById('hint-box');
const choicesContainer = document.getElementById('choices-container');
const scoreboard = document.getElementById('scoreboard');
const startButton = document.getElementById('start-button');
const hintButton = document.getElementById('hint-button');
const checkButton = document.getElementById('check-button');
const restartButton = document.getElementById('restart-button');
const finalMessage = document.getElementById('final-message');
const gameContainer = document.getElementById('game-container');

/********************************************************
 *  EVENT LISTENERS
 ********************************************************/
startButton.addEventListener('click', startGame);
hintButton.addEventListener('click', showHint);
checkButton.addEventListener('click', checkAnswer);
restartButton.addEventListener('click', restartGame);

/********************************************************
 *  FETCH QUESTIONS FROM questions.json
 ********************************************************/
fetch('questions.json')
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    questionBank = data;
  })
  .catch(error => {
    console.error('Error fetching questions:', error);
  });

/********************************************************
 *  MAIN GAME FUNCTIONS
 ********************************************************/
function startGame() {
  // Hide title screen, show question screen
  titleScreen.classList.remove('active');
  questionScreen.classList.add('active');

  // Initialize level 1
  currentLevel = 1;
  loadLevel(currentLevel);
  showQuestion();
}

function loadLevel(level) {
  // Filter question bank by level
  currentQuestions = shuffleArray(questionBank.filter(q => q.level === level));
  currentQuestionIndex = 0;
  correctCountInLevel = 0;
  levelLabel.textContent = level;
}

function showQuestion() {
  // If we've run out of questions for this level, check if we can advance
  if (currentQuestionIndex >= currentQuestions.length) {
    checkLevelAdvance();
    return;
  }

  // Clear UI
  hintBox.textContent = '';
  choicesContainer.innerHTML = '';

  const q = currentQuestions[currentQuestionIndex];
  questionText.textContent = q.question;
  updateScoreboard();

  // Display either multiple choice or type-in
  if (q.questionType === 'multipleChoice') {
    q.choices.forEach(choice => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.margin = '5px 0';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'mc';
      radio.value = choice;

      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + choice));
      choicesContainer.appendChild(label);
    });
  } else if (q.questionType === 'typeIn') {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    choicesContainer.appendChild(input);
  }
}

function showHint() {
  const q = currentQuestions[currentQuestionIndex];
  hintBox.textContent = q.hint || "No hint available.";
}

function checkAnswer() {
  const q = currentQuestions[currentQuestionIndex];
  let userAnswer = '';

  if (q.questionType === 'multipleChoice') {
    const selected = document.querySelector('input[name="mc"]:checked');
    if (!selected) {
      shakeScreen();
      return;
    }
    userAnswer = selected.value;
  } else {
    const input = document.getElementById('answer-input');
    if (!input) {
      shakeScreen();
      return;
    }
    userAnswer = input.value.trim();
  }

  // Compare userAnswer with correctAnswer
  if (userAnswer === q.correctAnswer) {
    // Correct
    totalCorrectCount++;
    correctCountInLevel++;
    totalAnswered++;
    showConfetti();
    setTimeout(() => {
      currentQuestionIndex++;
      checkLevelAdvance();
    }, 800);
  } else {
    // Incorrect
    totalAnswered++;
    shakeScreen();
  }
  updateScoreboard();
}

function checkLevelAdvance() {
  // If user has enough correct answers in this level
  if (correctCountInLevel >= requiredCorrectToAdvance) {
    currentLevel++;
    if (currentLevel > maxLevel) {
      // Completed all levels
      showFinalScreen();
    } else {
      loadLevel(currentLevel);
      showQuestion();
    }
  } else {
    // Not enough correct yet, but if we're out of questions
    if (currentQuestionIndex >= currentQuestions.length) {
      // Move on to next level or end
      if (currentLevel >= maxLevel) {
        showFinalScreen();
      } else {
        currentLevel++;
        if (currentLevel > maxLevel) {
          showFinalScreen();
        } else {
          loadLevel(currentLevel);
          showQuestion();
        }
      }
    } else {
      // Still have questions left in the level
      showQuestion();
    }
  }
}

function showFinalScreen() {
  questionScreen.classList.remove('active');
  finalScreen.classList.add('active');
  finalMessage.textContent = `You scored ${totalCorrectCount} correct answers out of ${totalAnswered} total attempts.`;
}

function restartGame() {
  // Reset everything
  currentLevel = 1;
  totalCorrectCount = 0;
  totalAnswered = 0;
  currentQuestionIndex = 0;
  correctCountInLevel = 0;

  // Hide final screen, show title screen
  finalScreen.classList.remove('active');
  titleScreen.classList.add('active');
}

/********************************************************
 *  UI / EFFECTS
 ********************************************************/
function updateScoreboard() {
  scoreboard.textContent = `Correct: ${totalCorrectCount} / Attempts: ${totalAnswered}`;
}

function shakeScreen() {
  questionScreen.classList.add('shake');
  setTimeout(() => {
    questionScreen.classList.remove('shake');
  }, 500);
}

function showConfetti() {
  const confettiCount = 25;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = (Math.random() * 780) + "px";
    confetti.style.top = "100px";
    confetti.style.backgroundColor = getRandomColor();
    gameContainer.appendChild(confetti);

    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 1200);
  }
}

function getRandomColor() {
  const colors = ["#ff0", "#0ff", "#f0f", "#f00", "#0f0", "#00f", "#ffa500", "#ff1493"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/********************************************************
 *  HELPER
 ********************************************************/
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
