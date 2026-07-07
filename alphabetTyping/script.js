// --- Game Variables ---
let currentChar = '';
let currentLevel = 1; // Only Level 1 remains
let revealTimer = null;

let currentQuestionIndex = 0;
let score = 0;
let combo = 0;
let answered = false;

const maxPoints = 35;  // <--- NEW: End game at 100 points

const maxComboForBonus = 5;

const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
const keyMap = {};
keys.forEach(k => keyMap[k] = 'key-' + k);

// DOM Elements
const letterDisplay = document.getElementById("letterDisplay");
const pointsEl = document.getElementById("points");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

let confettiParticles = [];

const startBtn = document.getElementById("startBtn");

// Message element for congratulations (add this if not present in HTML)
let congratsMessage = document.getElementById("congratsMessage");
if (!congratsMessage) {
  congratsMessage = document.createElement("div");
  congratsMessage.id = "congratsMessage";
  congratsMessage.style.fontSize = "2rem";
  congratsMessage.style.color = "#FF4081";
  congratsMessage.style.textAlign = "center";
  congratsMessage.style.marginTop = "50px";
  congratsMessage.style.display = "none";
  congratsMessage.textContent = "おめでとうございます！やりました！ぜひ他のクイズにも挑戦してください。";
  document.getElementById("gameScreen").appendChild(congratsMessage);
}

// Remove Level Select Buttons except Level 1
document.querySelectorAll(".level-select").forEach(button => {
  if (button.textContent.trim() === "Level 1") {
    button.addEventListener("click", () => {
      selectLevel(1);
    });
    button.style.display = "inline-block";
  } else {
    button.style.display = "none";
  }
});

// Start button listener
startBtn.addEventListener("click", () => {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  startGame(1);
});

// Disable input after completing game
let gameCompleted = false;

// Keyboard input listener (score system and penalty, no XP/level)
window.addEventListener("keydown", (e) => {
  if (gameCompleted) return;
  if (!currentChar) return;
  const pressedKey = e.key.toLowerCase();
  const targetKey = currentChar.toLowerCase();
  if (pressedKey === targetKey) {
    clearTimeout(revealTimer);
    handleCorrectAnswer();
  } else if (keys.includes(pressedKey)) {
    // Wrong key pressed
    combo = 0;
    score = Math.max(0, score - 1); // Prevent negative score
    updateStats();
    flashWrongKey();
  }
});

// Functions

function flashWrongKey() {
  letterDisplay.classList.add("flash-wrong");
  setTimeout(() => {
    letterDisplay.classList.remove("flash-wrong");
  }, 200);
}

function selectLevel(level) {
  currentLevel = 1;
  startBtn.disabled = false;
  // Highlight selected button
  const buttons = document.querySelectorAll(".level-select");
  buttons.forEach(btn => btn.classList.remove("selected"));
  const selectedButton = buttons[0]; // Only Level 1
  if (selectedButton) {
    selectedButton.classList.add("selected");
  }
}

function startGame(levelNumber) {
  currentLevel = 1; // Only Level 1
  currentChar = '';
  score = 0;
  combo = 0;
  answered = false;
  gameCompleted = false;  // <--- Reset
  congratsMessage.style.display = "none"; // <--- Hide on start
  letterDisplay.style.display = "block";
  updateStats();
  nextChar();
}

function nextChar() {
  removeHighlight();
  currentChar = keys[Math.floor(Math.random() * keys.length)];
  letterDisplay.textContent = currentChar;
  speak(currentChar);
  highlightKey(currentChar);
}

function highlightKey(char) {
  removeHighlight();
  const id = keyMap[char.toLowerCase()];
  const el = document.getElementById(id);
  if (el) el.classList.add('highlight');
}

function removeHighlight() {
  document.querySelectorAll('.key').forEach(el => el.classList.remove('highlight'));
}

function handleCorrectAnswer() {
  combo++;
  score++;
  updateStats();
  if (score >= maxPoints) {
    endGame();
  } else {
    nextChar();
  }
}

function updateStats() {
  pointsEl.textContent = score;
  comboEl.textContent = combo;
  levelEl.textContent = currentLevel;   // Level stays at 1
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  speechSynthesis.speak(utter);
}

function showFloatingXP(text) {
  // Function kept for compatibility, but not used since XP is removed
}

function triggerConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -20,
      r: Math.random() * 6 + 2,
      d: Math.random() * 12.5 + 1,
      color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`,
      tilt: Math.random() * 10 - 10,
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  updateConfetti();
}

function updateConfetti() {
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    p.y += p.d;
    p.x += Math.sin(p.tilt) * 2;
    if (p.y > confettiCanvas.height) {
      confettiParticles.splice(i, 1);
      i--;
    }
  }
}

function endGame() {
  gameCompleted = true;
  currentChar = '';
  letterDisplay.style.display = "none";
  congratsMessage.style.display = "block";
  triggerConfetti();
}

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setInterval(drawConfetti, 30);
