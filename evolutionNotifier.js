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
    const toast = document.createElement("div");
    toast.id = "evolutionToast";
    toast.textContent = "✨ Your monster is ready to evolve! Head back to the home page.";
    Object.assign(toast.style, {
      position: "fixed", bottom: "20px", right: "20px",
      background: "#ffdf6b", color: "#333", padding: "12px 18px",
      borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      fontWeight: "600", zIndex: 9999, cursor: "pointer",
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
