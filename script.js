window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("overallLevel");
  const IMG_BASE = "./monster_image/";

  // === CONFIGURATION ===
  const LEVELS = { EGG: 5, SLIME: 10, EVO2: 20 }; // thresholds
  const IMAGE_NAMES = {
    shadowPlantEgg: "ヤミタマ",
    plantSlime_1: "ハナゴロ",
    shadowSlime_1: "カゲモチ",
    plantEvo_2A: "ネッコン",
    plantEvo_2B: "モリフワ",
    shadowEvo_2A: "スミボウ",
    shadowEvo_2B: "ヨルビト",
    shadowEvo3A: "シャドウロウ",
    shadowEvo3B: "グルムドン",
    shadowEvo3C: "ウィスパップ",
    shadowEvo3D: "シャドピク",
    plantEvo3A: "ハナリコ",
    plantEvo3B: "ツルケン",
    plantEvo3C: "カメキノ",
    plantEvo3D: "キカブン",
    placeholder: "進化中（仮）",
  };

  const QUIZ_DATA = [
    "buildingSlevelr",
    "eventSlevelr",
    "placeSlevelr",
    "oppositeSlevelr",
    "schoolEventSlevelr",
    "directionsLevelr",
    "buildingMlevelr",
    "eventMlevelr",
    "placesMlevelr",
    "oppositeMlevelr",
    "schoolEventMlevelr",
  ].map((key) => ({ key, multiplier: key.includes("M") ? 0.85 : 0.5 }));

  // === LOCAL STORAGE HELPERS ===
  const LS = {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    clear: () => localStorage.clear(),
  };

  // === CALCULATE OVERALL LEVEL ===
  const storedLevels = Object.fromEntries(
    QUIZ_DATA.map(({ key }) => [key, parseInt(LS.get(key)) || 0])
  );
  const overallLevel = Math.floor(
    QUIZ_DATA.reduce((sum, { key, multiplier }) => sum + storedLevels[key] * multiplier, 0)
  );

  // === UI HELPERS ===
  const clearContainer = () => (container.innerHTML = "");
  const makeImg = (src, alt = "") => {
    const i = document.createElement("img");
    Object.assign(i.style, {
      maxWidth: "200px",
      height: "auto",
      display: "block",
      margin: "0 auto 12px",
    });
    i.src = src;
    i.alt = alt;
    return i;
  };
  const makeBtn = (label, onClick) => {
    const b = document.createElement("button");
    Object.assign(b.style, {
      margin: "6px",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
    });
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  };
  const makeLabel = (text) => {
    const d = document.createElement("div");
    Object.assign(d.style, { margin: "8px 0", fontWeight: "600" });
    d.textContent = text;
    return d;
  };

  const getDisplayName = (f) => IMAGE_NAMES[f.replace(/\.(png|webp)$/, "")] || "名称未設定";
  const saveMonster = (file) => file && LS.set("selectedMonster", file);

  // === RENDER HELPERS ===
  const showEvolutionOptions = (options, labelText, onSelect) => {
    container.appendChild(makeLabel(labelText));
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      display: "flex",
      gap: "24px",
      justifyContent: "center",
    });

    options.forEach(({ file, choice }) => {
      const d = document.createElement("div");
      d.append(makeImg(`${IMG_BASE}${file}`), makeLabel(getDisplayName(file)));
      d.append(makeBtn("この進化を選ぶ", () => onSelect(choice, file)));
      wrap.appendChild(d);
    });

    container.appendChild(wrap);
  };

  // === RENDER LOGIC ===
  function render() {
    clearContainer();

    const branch = LS.get("branchChoice");
    const evo2 = LS.get("evo2Choice");
    const evo3 = LS.get("evo3Choice");

    // 🥚 Egg stage
    if (overallLevel < LEVELS.EGG) {
      const file = "shadowPlantEgg.png";
      container.append(makeImg(`${IMG_BASE}${file}`), makeLabel(getDisplayName(file)));
      container.append(makeLabel(`レベル：${overallLevel}`));
      saveMonster(file);
      return;
    }

    // 🌱 Choose branch
    if (!branch) {
      showEvolutionOptions(
        [
          { file: "plantSlime_1.png", choice: "plant" },
          { file: "shadowSlime_1.png", choice: "shadow" },
        ],
        "進化の分岐を選んでください：",
        (choice, file) => {
          LS.set("branchChoice", choice);
          saveMonster(file);
          render();
        }
      );
      container.append(makeLabel(`現在レベル：${overallLevel}`));
      return;
    }

    // 🧫 Slime stage
    if (overallLevel < LEVELS.SLIME) {
      const file = `${branch}Slime_1.png`;
      container.append(makeImg(`${IMG_BASE}${file}`), makeLabel(getDisplayName(file)));
      container.append(makeLabel(`分岐：${branch} ｜ レベル：${overallLevel}`));
      saveMonster(file);
      return;
    }

    // 🌿 Second evolution choice
    if (!evo2) {
      showEvolutionOptions(
        [
          { file: `${branch}Evo_2A.png`, choice: "A" },
          { file: `${branch}Evo_2B.png`, choice: "B" },
        ],
        "第2進化を選んでください（1回のみ）：",
        (choice, file) => {
          LS.set("evo2Choice", choice);
          saveMonster(file);
          render();
        }
      );
      container.append(makeLabel(`分岐：${branch} ｜ レベル：${overallLevel}`));
      return;
    }

    // 🌸 Third evolution choice
    if (overallLevel >= LEVELS.EVO2) {
      if (!evo3) {
        const options =
          evo2 === "A"
            ? [
                { file: `${branch}Evo3A.png`, choice: "A" },
                { file: `${branch}Evo3B.png`, choice: "B" },
              ]
            : [
                { file: `${branch}Evo3C.png`, choice: "C" },
                { file: `${branch}Evo3D.png`, choice: "D" },
              ];

        showEvolutionOptions(options, "第3進化を選んでください（1回のみ）：", (choice, file) => {
          LS.set("evo3Choice", choice);
          saveMonster(file);
          render();
        });
        container.append(makeLabel(`レベル：${overallLevel}`));
        return;
      }

      // 🌟 Final form
      const finalFile = `${branch}Evo3${evo3}.png`;
      container.append(
        makeImg(`${IMG_BASE}${finalFile}`, "最終進化形態"),
        makeLabel(getDisplayName(finalFile)),
        makeLabel(`最終進化：${evo3}`),
        makeLabel(`レベル：${overallLevel}`)
      );
      saveMonster(finalFile);
      return;
    }

    // 🌾 Evo2 form (intermediate)
    const evo2File = `${branch}Evo_2${evo2}.png`;
    container.append(
      makeImg(`${IMG_BASE}${evo2File}`),
      makeLabel(getDisplayName(evo2File)),
      makeLabel(`分岐：${branch} ｜ 進化：${evo2} ｜ レベル：${overallLevel}`)
    );
    saveMonster(evo2File);
  }

  // === QUIZ CARD LEVEL DISPLAY ===
  function updateQuizCardLevels() {
    document.querySelectorAll(".levelValue").forEach((span) => {
      const key = span.dataset.key;
      span.textContent = `(Level: ${LS.get(key) || 0})`;
    });
  }

  // === RENDER + INITIALIZE ===
  render();
  updateQuizCardLevels();
});
