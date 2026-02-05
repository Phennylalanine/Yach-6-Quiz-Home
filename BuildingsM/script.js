/**
 * Lesson 7-1 Quiz Logic (Typing + Viewable Multiple Choice)
 */

let currentQuestion = null;
let score = 0;
let combo = 0;
let level = 1;
let xp = 0;
let questions = [];
let answered = false;

// =========================
// Settings
// =========================

const maxComboForBonus = 5;

// =========================
// Main
// =========================

window.addEventListener("DOMContentLoaded", () => {

  // =========================
  // DOM Elements
  // =========================

  const jpText = document.getElementById("jpText");
  const enText = document.getElementById("enText");
  const answerInput = document.getElementById("answerInput");
  const feedback = document.getElementById("feedback");
  const nextBtn = document.getElementById("nextBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const choicesContainer = document.getElementById("choicesText");

  const pointsEl = document.getElementById("points");
  const comboEl = document.getElementById("combo");
  const levelEl = document.getElementById("level");
  const xpBar = document.getElementById("xpBar");
  const xpText = document.getElementById("xpText");

  const startBtn = document.getElementById("startBtn");

  // =========================
  // Confetti
  // =========================

  const confettiCanvas = document.getElementById("confettiCanvas");
  const ctx = confettiCanvas.getContext("2d");

  let confettiParticles = [];

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // =========================
  // Event Listeners
  // =========================

  startBtn.addEventListener("click", startQuiz);

  nextBtn.addEventListener("click", () => {
    if (answered) {
      loadNextQuestion();
    }
  });

  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (!answered) {
        checkAnswer();
      } else if (!nextBtn.disabled) {
        nextBtn.click();
      }
    }
  });

  tryAgainBtn.addEventListener("click", tryAgain);

  // =========================
  // Init
  // =========================

  loadProgress();

  fetch("questions.json")
    .then(res => res.json())
    .then(data => {

      const list = Array.isArray(data) ? data : data.questions;

      questions = normalizeQuestions(list);
      shuffleArray(questions);

    })
    .catch(err => {
      console.error("Failed to load questions:", err);
    });


  // =========================
  // Quiz Flow
  // =========================

  function startQuiz() {

    if (!questions.length) {
      alert("Questions still loading.");
      return;
    }

    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.remove("hidden");

    score = 0;
    combo = 0;
    answered = false;

    choicesContainer.innerHTML = "";

    updateStats();
    loadNextQuestion();
  }


  function normalizeQuestions(arr) {

    return arr.map((q, i) => ({
      id: q.id ?? i + 1,
      jp: q.jp,
      en: q.en
    }));

  }


  function loadNextQuestion() {

    currentQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    jpText.textContent = currentQuestion.jp;
    enText.textContent = currentQuestion.en;

    speak(currentQuestion.en);

    buildChoices(currentQuestion.en);

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.focus();

    feedback.textContent = "";
    feedback.style.color = "black";

    nextBtn.disabled = true;
    tryAgainBtn.style.display = "none";

    answered = false;
  }


  // =========================
  // Multiple Choice (View Only)
  // =========================

  function buildChoices(correct) {

    const wrong = questions
      .filter(q => q.en !== correct)
      .map(q => q.en);

    shuffleArray(wrong);

    const options = [correct, ...wrong.slice(0, 3)];
    shuffleArray(options);

    choicesContainer.innerHTML = "";

    options.forEach(opt => {

      const span = document.createElement("span");

      span.textContent = opt;

      span.className = "choice-option";

      span.style.display = "inline-block";
      span.style.padding = "6px 10px";
      span.style.margin = "4px";
      span.style.border = "1px solid #ccc";
      span.style.borderRadius = "5px";
      span.style.background = "#f5f5f5";
      span.style.userSelect = "none";

      choicesContainer.appendChild(span);

    });

  }


  // =========================
  // Answer Logic
  // =========================

  function checkAnswer() {

    if (answered) return;

    answered = true;

    const user =
      answerInput.value.trim().toLowerCase();

    const correct =
      currentQuestion.en.toLowerCase();


    if (user === correct) {

      feedback.innerHTML = "✔️ Correct!";
      feedback.style.color = "green";

      score++;
      combo++;

      gainXP(1);

      nextBtn.disabled = false;

    } else {

      feedback.innerHTML =
        `✖️ Wrong<br>Correct: <strong>${currentQuestion.en}</strong>`;

      feedback.style.color = "red";

      combo = 0;

      tryAgainBtn.style.display = "inline-block";
    }

    answerInput.disabled = true;

    updateStats();
  }


  function tryAgain() {

    feedback.textContent = "";

    answerInput.disabled = false;
    answerInput.value = "";
    answerInput.focus();

    tryAgainBtn.style.display = "none";
    nextBtn.disabled = true;

    answered = false;
  }


  // =========================
  // XP / Level System
  // =========================

  function gainXP(amount) {

    xp += amount;

    if (xp >= xpToNextLevel(level)) {

      xp = 0;
      level++;

      triggerConfetti();
    }

    saveProgress();
    updateStats();
  }


  function xpToNextLevel(lv) {
    return 3 + lv * 2;
  }


  function updateStats() {

    pointsEl.textContent = score;
    comboEl.textContent = combo;
    levelEl.textContent = level;

    const needed = xpToNextLevel(level);

    const percent = (xp / needed) * 100;

    xpBar.style.width = `${percent}%`;

    if (xpText) {
      xpText.textContent = `${xp} / ${needed}`;
    }
  }


  function saveProgress() {

    localStorage.setItem("lesson7_xp", xp);
    localStorage.setItem("lesson7_level", level);

  }


  function loadProgress() {

    xp = Number(localStorage.getItem("lesson7_xp")) || 0;
    level = Number(localStorage.getItem("lesson7_level")) || 1;

    updateStats();
  }


  // =========================
  // Utilities
  // =========================

  function shuffleArray(arr) {

    for (let i = arr.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];

    }
  }


  function speak(text) {

    if (!text) return;

    const u = new SpeechSynthesisUtterance(text);

    u.lang = "en-UK";

    speechSynthesis.speak(u);
  }


  // =========================
  // Confetti
  // =========================

  function triggerConfetti() {

    confettiParticles = [];

    for (let i = 0; i < 80; i++) {

      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * -20,
        r: Math.random() * 5 + 2,
        d: Math.random() * 4 + 1,
        color: `hsl(${Math.random() * 360},100%,70%)`
      });

    }

    setTimeout(() => {
      confettiParticles = [];
    }, 1200);
  }


  function drawConfetti() {

    ctx.clearRect(0, 0,
      confettiCanvas.width,
      confettiCanvas.height
    );

    confettiParticles.forEach(p => {

      ctx.beginPath();

      ctx.fillStyle = p.color;

      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      ctx.fill();

      p.y += p.d;

    });
  }


  function resizeCanvas() {

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }


  setInterval(drawConfetti, 30);

});
