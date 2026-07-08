// evolutionNotifier.js
(function () {
  const LEVELS = { EGG: 6, SLIME: 15, EVO2: 30 };

  const QUIZ_KEYS = [
    "buildingSlevelr", "eventSlevelr", "placeSlevelr", "oppositeSlevelr",
    "schoolEventSlevelr", "directionsLevelr", "buildingMlevelr",
    "eventMlevelr", "placesMlevelr", "oppositeMlevelr", "schoolEventMlevelr",
  ].map((key) => ({ key, multiplier: key.includes("M") ? 1.25 : 1 }));

  function getOverallLevel() {
    return Math.floor(
      QUIZ_KEYS.reduce((sum, { key, multiplier }) => {
        const lvl = parseInt(localStorage.getItem(key)) || 0;
        return sum + lvl * multiplier;
      }, 0)
    );
  }

  function evolutionIsReady(overallLevel) {
    const branch = localStorage.getItem("branchChoice");
    const evo2 = localStorage.getItem("evo2Choice");
    const evo3 = localStorage.getItem("evo3Choice");

    if (overallLevel >= LEVELS.EGG && !branch) return true;
    if (overallLevel >= LEVELS.SLIME && branch && !evo2) return true;
    if (overallLevel >= LEVELS.EVO2 && evo2 && !evo3) return true;
    return false;
  }

 function showEvolutionToast() {
  if (document.getElementById("evolutionToast")) return; // no duplicates

  // Inject the pulse animation once
  if (!document.getElementById("evolutionToastStyle")) {
    const style = document.createElement("style");
    style.id = "evolutionToastStyle";
    style.textContent = `
      @keyframes evoPulse {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.03); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement("div");
  toast.id = "evolutionToast";
  toast.innerHTML = `
    <div style="font-size: 28px; line-height: 1;">✨🐣✨</div>
    <div style="margin-top: 6px;">モンスターが進化の準備ができました！</div>
    <div style="font-size: 14px; font-weight: 400; margin-top: 4px; opacity: 0.85;">
      タップしてホームに戻り、進化先を選びましょう →
    </div>
  `;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    maxWidth: "320px",
    background: "linear-gradient(135deg, #ffe066, #ffb347)",
    color: "#3a2600",
    padding: "20px 24px",
    borderRadius: "16px",
    border: "3px solid #ff9800",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    fontWeight: "700",
    fontSize: "18px",
    textAlign: "center",
    zIndex: 9999,
    cursor: "pointer",
    animation: "evoPulse 1.4s ease-in-out infinite",
  });

  toast.addEventListener("click", () => (window.location.href = "../index.html"));
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}

  window.checkEvolutionNotification = function () {
    const overallLevel = getOverallLevel();
    if (evolutionIsReady(overallLevel)) showEvolutionToast();
  };
})();
