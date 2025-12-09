//------------------------------------------------------
// MONSTER SYSTEM
//------------------------------------------------------
const monsterImg = document.createElement("img");
const bubble = document.getElementById("monsterBubble");
const monImgElem = document.getElementById("monsterImg");

// Seasonal monster
const month = new Date().getMonth() + 1;
if (month === 12) {
  monImgElem.src = "monster/monster_snow.png";
} else {
  monImgElem.src = "monster/monster_default.png";
}

// Bubble messages
const bubbleMessages = {
  correct: ["Good job!", "Nice!", "Well done!", "Great work!"],
  levelUp: ["You got stronger!", "LEVEL UP!", "Amazing progress!"],
  combo: ["Combo Power!", "Keep it going!", "Hot streak!"],
  idle: ["Keep trying!", "You can do it!", "I am cheering for you!"]
};

function showBubble(text) {
  bubble.textContent = text;
  bubble.style.display = "block";

  setTimeout(() => {
    bubble.style.display = "none";
  }, 1800);
}

// Random idle messages every 35–45 seconds
setInterval(() => {
  showBubble(randomChoice(bubbleMessages.idle));
}, 35000 + Math.random() * 8000);

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//------------------------------------------------------
// INTEGRATION WITH YOUR EXISTING QUIZ LOGIC
//------------------------------------------------------

// Wrap original checkAnswer but keep all your logic unchanged
const originalCheckAnswer = checkAnswer;
checkAnswer = function() {
  const beforeCombo = combo;
  const beforeLevel = level;

  originalCheckAnswer(); // call your original

  // After-correct bubble
  if (feedback.textContent.includes("Correct")) {
    showBubble(randomChoice(bubbleMessages.correct));
  }

  // Combo reward
  if (combo === 5 || combo === 10 || combo === 15) {
    showBubble(randomChoice(bubbleMessages.combo));
  }

  // Level-up detection
  if (level > beforeLevel) {
    showBubble(randomChoice(bubbleMessages.levelUp));
  }
};
