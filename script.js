window.addEventListener("DOMContentLoaded", () => {
  const overallLevelEl = document.getElementById("overallLevel");

  // Add all your quiz keys here
  const quizKeys = [
    "day_quiz_level",
    "weather_quiz_level",
    // Replace with your actual key names
  ];

  // Sum all levels and apply the multiplier
  const overallLevel = quizKeys.reduce((sum, key) => {
    return sum + (parseInt(localStorage.getItem(key)) || 0);
  }, 0) * 0.7;

  // Display the overall level (rounded to the nearest whole number)
  overallLevelEl.textContent = `Overall Level: ${overallLevel.toFixed(0)}`;
});
