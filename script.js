<script>
window.addEventListener("DOMContentLoaded", () => {
  const overallLevelEl = document.getElementById("overallLevel");

  // Array of quiz levels with their specific multipliers
  const quizData = [
    { key: "BuildingSlevel", multiplier: 0.7 },
    { key: "EventSlevel", multiplier: 0.7 },
    { key: "BuildingMlevel", multiplier: 1.2 },
     { key: "EventMlevel", multiplier: 1.2 },
    // Add more quiz levels and multipliers as needed
  ];

  // Calculate the weighted overall level
  const overallLevel = quizData.reduce((sum, { key, multiplier }) => {
    const value = parseInt(localStorage.getItem(key)) || 0;
    return sum + value * multiplier;
  }, 0);

  // Display the overall level (rounded to the nearest whole number)
  overallLevelEl.textContent = `Overall Level: ${overallLevel.toFixed(0)}`;
});
</script>
