// Quiz State Variables
let currentQuestionIndex = 0;
let score = 0;
let combo = 0;
let level = 1;
let xp = 0;
let questions = [];
let answered = false;

const maxComboForBonus = 5;

window.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
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

  // Confetti
  const confettiCanvas = document.getElementById("confettiCanvas");
  const ctx = confettiCanvas.getContext("2d");
  let confettiParticles = [];

  // Event Listeners
  document.getElementById("startBtn").addEventListener("click", startQuiz);

  nextBtn.addEventListener("click", () => {
    if (answered) {
      currentQuestionIndex++;
      loadNextQuestion();
    }
  });

  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      if (!answered) {
        checkAnswer();
      } else if (!nextBtn.disabled) {
        nextBtn.click();
      }
    }
  });

  tryAgainBtn.addEventListener("click", tryAgain);

  // Load saved XP/Level progress
  loadProgress();

  // Load questions
  fetch("questions.csv")
    .then((response) => response.text())
    .then((data) => {
      questions = parseCSV(data);
      shuffleArray(questions);
      // Don't load question yet; wait for start
    })
    .catch((err) => {
      console.error("Failed to load questions.csv:", err);
    });

  // Confetti canvas resize and draw loop
  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  setInterval(drawConfetti, 30);

  // --- Function declarations ---

  function startQuiz() {
    document.getElementById("quizScreen").classList.add("active");
    document.getElementById("startScreen").classList.remove("active");
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    combo = 0;
    answered = false;
    // Optionally reset XP/level here if you want a fresh run each time
    // xp = 0;
    // level = 1;
    updateStats();
    loadNextQuestion();
  }

  function parseCSV(data) {
    const lines = data.trim().split("\n");
    return lines.slice(1).map((line) => {
      const [jp, en] = line.split(",");
      return { jp: jp.trim(), en: en.trim() };
    });
  }

  function loadNextQuestion() {
    if (questions.length === 0) {
      jpText.textContent = "No questions loaded.";
      enText.textContent = "";
      answerInput.disabled = true;
      nextBtn.disabled = true;
      tryAgainBtn.style.display = "none";
      return;
    }
    if (currentQuestionIndex >= questions.length) {
      currentQuestionIndex = 0;
      shuffleArray(questions);
    }
    const question = questions[currentQuestionIndex];
    jpText.textContent = question.jp;
    // Hide English if you want a challenge, or show for easier mode
    enText.textContent = question.en; // Set to "" if you want to hide answer
    speak(question.en);

    if (choicesContainer) choicesContainer.innerHTML = "";

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.focus();

    feedback.textContent = "";
    feedback.style.color = "black";

    nextBtn.disabled = true;
    tryAgainBtn.style.display = "none";
    answered = false;
  }

  function checkAnswer() {
    if (answered) return;
    answered = true;

    const userAnswer = answerInput.value.trim();
    const correctAnswer = questions[currentQuestionIndex].en;

    if (userAnswer === correctAnswer) {
      feedback.innerHTML = "✔️ <strong>Correct!</strong>";
      feedback.style.color = "green";
      combo++;
      score += 1;

      const xpBonus = combo >= 15 && combo % 5 === 0 ? (combo / 5) - 1 : 1;
      gainXP(xpBonus);
      showFloatingXP(`+${xpBonus} XP`);

      updateStats();

      answerInput.disabled = true;
      nextBtn.disabled = false;
      tryAgainBtn.style.display = "none";
    } else {
      let comparison = "";
      const maxLength = Math.max(userAnswer.length, correctAnswer.length);

      for (let i = 0; i < maxLength; i++) {
        const userChar = userAnswer[i] || "";
        const correctChar = correctAnswer[i] || "";

        if (userChar === correctChar) {
          comparison += `<span style="color: green;">${correctChar}</span>`;
        } else if (userChar && correctChar) {
          comparison += `<span style="color: red;">${userChar}</span>`;
        } else if (!userChar) {
          comparison += `<span style="color: gray;">_</span>`;
        }
      }

      feedback.innerHTML =
        `✖️ <strong>Wrong!</strong><br>Your answer: <code>${comparison}</code><br>Correct answer: <span style="color: green;">${correctAnswer}</span>`;
      feedback.style.color = "red";
      combo = 0;

      updateStats();

      answerInput.disabled = true;
      nextBtn.disabled = true;
      tryAgainBtn.style.display = "inline-block";
    }
  }

  function tryAgain() {
    feedback.textContent = "";
    feedback.style.color = "black";
    answerInput.disabled = false;
    answerInput.value = "";
    answerInput.focus();

    tryAgainBtn.style.display = "none";
    nextBtn.disabled = true;
    answered = false;
  }

  function gainXP(amount) {
    let levelBefore = level;
    xp += amount;

    while (xp >= xpToNextLevel(level)) {
      xp -= xpToNextLevel(level);
      level++;
      feedback.innerHTML += `<br>🎉 Level Up! You are now level ${level}`;
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

  function saveProgress() {
    localStorage.setItem("EventSxp", xp);
    localStorage.setItem("EventSlevel", level);
  }

  function loadProgress() {
    const savedXP = localStorage.getItem("EventSxp");
    const savedLevel = localStorage.getItem("EventSlevel");

    if (savedXP !== null) xp = parseInt(savedXP, 10);
    if (savedLevel !== null) level = parseInt(savedLevel, 10);

    updateStats();
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function speak(text) {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-UK";
    speechSynthesis.speak(utterance);
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
        d: Math.random() * 5 + 1,
        color: "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 70%)",
        tilt: Math.random() * 10 - 10,
      });
    }
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
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
});
