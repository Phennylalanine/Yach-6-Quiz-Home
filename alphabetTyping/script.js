// --- Game Variables ---
let currentChar = '';
let currentLevel = 1;
let revealTimer = null;

let currentQuestionIndex = 0;
let score = 0;
let combo = 0;
let level = 1;
let xp = 0;
let answered = false;

const maxComboForBonus = 5;

const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
const keyMap = {};
keys.forEach(k => keyMap[k] = 'key-' + k);

// DOM Elements
const letterDisplay = document.getElementById("letterDisplay");
const pointsEl = document.getElementById("points");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

let confettiParticles = [];

let selectedLevel = null;

const startBtn = document.getElementById("startBtn");

// Attach event listeners to level select buttons
document.querySelectorAll(".level-select").forEach(button => {
  button.addEventListener("click", () => {
    selectLevel(parseInt(button.textContent.replace("Level ", "")));
  });
});

// Start button listener
startBtn.addEventListener("click", () => {
  if (selectedLevel !== null) {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    startGame(selectedLevel);
  }
});

// Keyboard input listener
window.addEventListener("keydown", (e) => {
  if (!currentChar) return;
  if (e.key.toLowerCase() === currentChar.toLowerCase()) {
    clearTimeout(revealTimer);
    handleCorrectAnswer();
  }
});

// Functions

function selectLevel(level) {
  selectedLevel = level;

  // Highlight selected button
  const buttons = document.querySelectorAll(".level-select");
  buttons.forEach(btn => btn.classList.remove("selected"));

  const selectedButton = buttons[level - 1]; // Level 1 = index 0
  if (selectedButton) {
    selectedButton.classList.add("selected");
  }

  // Enable the start button
  startBtn.disabled = false;
}

function startGame(levelNumber) {
  currentLevel = levelNumber;
  currentChar = '';
  score = 0;
  combo = 0;
  xp = 0;
  level = 1;
  answered = false;
  updateStats();
  loadProgress();
  nextChar();
}

function nextChar() {
  removeHighlight();
  currentChar = keys[Math.floor(Math.random() * keys.length)];
  letterDisplay.textContent = currentLevel === 1 ? currentChar : '';
  speak(currentChar);
  if (currentLevel === 1) {
    highlightKey(currentChar);
  } else {
    revealTimer = setTimeout(() => highlightKey(currentChar), 5000);
  }
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

  let bonusInterval = 5;
  if (combo >= 60) {
    bonusInterval = 20;
  } else if (combo >= 45) {
    bonusInterval = 15;
  } else if (combo >= 30) {
    bonusInterval = 10;
  }

  let xpBonus = 1;

  if (combo % bonusInterval === 0) {
    if (combo >= 15) {
      const stepsPast15 = Math.floor((combo - 15) / 5);
      xpBonus = 3 + stepsPast15;
    }

    if (combo === 30 || combo === 45 || combo === 60) {
      xpBonus += 2;
    }
  }

  gainXP(xpBonus);
  if (xpBonus > 0) {
    showFloatingXP(`+${xpBonus} XP`);
  }

  updateStats();
  nextChar();
}

function gainXP(amount) {
  let levelBefore = level;
  xp += amount;
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level++;
  }
  if (level > levelBefore) {
    triggerConfetti();
  }
  saveProgress();
  updateStats();
}

function xpToNextLevel(currentLevel) {
  let xpRequired = 3;
  for (let i = 2; i <= currentLevel; i++) {
    xpRequired += i;
  }
  return xpRequired;
}

function updateStats() {
  pointsEl.textContent = score;
  comboEl.textContent = combo;
  levelEl.textContent = level;
  const needed = xpToNextLevel(level);
  const percent = (xp / needed) * 100;
  xpBar.style.width = `${Math.min(percent, 100)}%`;
  xpText.textContent = `${xp} / ${needed}`;
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  speechSynthesis.speak(utter);
}

// ✅ MODIFIED: Save XP/Level separately per game mode
function saveProgress() {
  localStorage.setItem(`TypingXP_Level${currentLevel}`, xp);
  localStorage.setItem(`TypingLevel_Level${currentLevel}`, level);
}

// ✅ MODIFIED: Load XP/Level separately per game mode
function loadProgress() {
  const savedXP = localStorage.getItem(`TypingXP_Level${currentLevel}`);
  const savedLevel = localStorage.getItem(`TypingLevel_Level${currentLevel}`);
  xp = savedXP !== null ? parseInt(savedXP) : 0;
  level = savedLevel !== null ? parseInt(savedLevel) : 1;
}

function showFloatingXP(text) {
  const xpElem = document.createElement("div");
  xpElem.textContent = text;
  xpElem.className = "floating-xp";
  xpElem.style.left = `${Math.random() * 80 + 10}%`;
  xpElem.style.top = "50%";
  document.body.appendChild(xpElem);
  setTimeout(() => xpElem.remove(), 1500);
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

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setInterval(drawConfetti, 30);
