window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("overallLevel");
  const IMG_BASE = "./monster_image/";

  // IMAGE DISPLAY NAMES
  const IMAGE_DISPLAY_NAMES = {
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

    placeholder: "進化中（仮）"
  };

  function getDisplayName(imgFile) {
    const key = imgFile.replace(".png", "").replace(".webp", "");
    return IMAGE_DISPLAY_NAMES[key] || "名称未設定";
  }

  // QUIZ WEIGHTS
  const quizData = [
    { key: "buildingSlevelr", multiplier: 0.3 },
    { key: "eventSlevelr", multiplier: 0.3 },
    { key: "placeSlevelr", multiplier: 0.3 },
    { key: "oppositeSlevelr", multiplier: 0.3 },
    { key: "schoolEventSlevelr", multiplier: 0.3 },
    { key: "directionsLevelr", multiplier: 0.3 },
    { key: "buildingMlevelr", multiplier: 0.5 },
    { key: "eventMlevelr", multiplier: 0.5 },
    { key: "placesMlevelr", multiplier: 0.5 },
    { key: "oppositeMlevelr", multiplier: 0.5 },
    { key: "schoolEventMlevelr", multiplier: 0.5 },
  ];

  // CALCULATE OVERALL LEVEL
  const overallLevelRaw = quizData.reduce((sum, { key, multiplier }) => {
    const value = parseInt(localStorage.getItem(key)) || 0;
    return sum + value * multiplier;
  }, 0);

  const overallLevel = Math.floor(overallLevelRaw);

  // STORAGE HELPERS
  const getBranch = () => localStorage.getItem("branchChoice");
  const setBranch = (b) => localStorage.setItem("branchChoice", b);
  const getEvo2 = () => localStorage.getItem("evo2Choice");
  const setEvo2 = (c) => localStorage.setItem("evo2Choice", c);
  const getEvo3 = () => localStorage.getItem("evo3Choice");
  const setEvo3 = (v) => localStorage.setItem("evo3Choice", v);

  // NEW: selectedMonster helper
  // We store only the filename (e.g. "plantSlime_1.png") so other pages can normalize the path.
  const setSelectedMonster = (imgFile) => {
    try {
      if (!imgFile) return;
      localStorage.setItem("selectedMonster", imgFile);
    } catch (e) {
      console.error("Failed to save selectedMonster", e);
    }
  };
  const getSelectedMonster = () => localStorage.getItem("selectedMonster");

  // UI HELPERS
  function clearContainer() {
    container.innerHTML = "";
    container.style.textAlign = "center";
  }

  function img(src, alt = "") {
    const i = document.createElement("img");
    i.src = src;
    i.alt = alt;
    i.style.maxWidth = "200px";
    i.style.height = "auto";
    i.style.display = "block";
    i.style.margin = "0 auto 12px";
    return i;
  }

  function btn(label, onClick) {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.margin = "6px";
    b.style.padding = "8px 12px";
    b.style.borderRadius = "8px";
    b.style.cursor = "pointer";
    b.addEventListener("click", onClick);
    return b;
  }

  function label(text) {
    const p = document.createElement("div");
    p.textContent = text;
    p.style.margin = "8px 0";
    p.style.fontWeight = "600";
    return p;
  }

  // MAIN RENDER
  function render() {
    clearContainer();

    // Level < 5 → Egg form
    if (overallLevel < 5) {
      const imgFile = "shadowPlantEgg.png";
      container.appendChild(img(`${IMG_BASE}${imgFile}`, "Egg"));
      container.appendChild(label(getDisplayName(imgFile)));
      container.appendChild(label(`レベル：${overallLevel}`));
      // Store the currently shown monster (optional)
      setSelectedMonster(imgFile);
      return;
    }

    // Need branch selection
    const branch = getBranch();
    if (!branch) {
      container.appendChild(label("進化の分岐を選んでください："));

      const plantFile = "plantSlime_1.png";
      const shadowFile = "shadowSlime_1.png";

      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.gap = "24px";
      wrap.style.justifyContent = "center";

      const pw = document.createElement("div");
      pw.appendChild(img(`${IMG_BASE}${plantFile}`));
      pw.appendChild(label(getDisplayName(plantFile)));

      const sw = document.createElement("div");
      sw.appendChild(img(`${IMG_BASE}${shadowFile}`));
      sw.appendChild(label(getDisplayName(shadowFile)));

      wrap.appendChild(pw);
      wrap.appendChild(sw);

      container.appendChild(wrap);

      // When choosing branch, also save selectedMonster as the slime-stage filename
      container.appendChild(btn("植物（プラント）を選ぶ", () => {
        setBranch("plant");
        setSelectedMonster(plantFile);
        render();
      }));
      container.appendChild(btn("シャドウを選ぶ", () => {
        setBranch("shadow");
        setSelectedMonster(shadowFile);
        render();
      }));
      container.appendChild(label(`現在レベル：${overallLevel}`));
      return;
    }

    // Level < 10 → Slime form
    if (overallLevel < 10) {
      const slimeImg = branch === "plant" ? "plantSlime_1.png" : "shadowSlime_1.png";
      container.appendChild(img(`${IMG_BASE}${slimeImg}`));
      container.appendChild(label(getDisplayName(slimeImg)));
      container.appendChild(label(`分岐：${branch} ｜ レベル：${overallLevel}`));
      // Store current displayed monster (optional)
      setSelectedMonster(slimeImg);
      return;
    }

    // Need evo2 choice
    const evo2 = getEvo2();
    if (!evo2) {
      container.appendChild(label("第2進化を選んでください（1回のみ）："));

      const aFile = branch === "plant" ? "plantEvo_2A.png" : "shadowEvo_2A.png";
      const bFile = branch === "plant" ? "plantEvo_2B.png" : "shadowEvo_2B.png";

      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.gap = "24px";
      wrap.style.justifyContent = "center";

      const aw = document.createElement("div");
      aw.appendChild(img(`${IMG_BASE}${aFile}`));
      aw.appendChild(label(getDisplayName(aFile)));
      aw.appendChild(btn("進化A を決定", () => {
        setEvo2("A");
        setSelectedMonster(aFile);
        render();
      }));

      const bw = document.createElement("div");
      bw.appendChild(img(`${IMG_BASE}${bFile}`));
      bw.appendChild(label(getDisplayName(bFile)));
      bw.appendChild(btn("進化B を決定", () => {
        setEvo2("B");
        setSelectedMonster(bFile);
        render();
      }));

      wrap.appendChild(aw);
      wrap.appendChild(bw);
      container.appendChild(wrap);

      container.appendChild(label(`分岐：${branch} ｜ レベル：${overallLevel}`));
      return;
    }

    // ⭐⭐⭐ LEVEL 30 EVOLUTION — FIXED FULL VERSION ⭐⭐⭐
    if (overallLevel >= 20) {
      const evo3 = getEvo3();

      // Player must choose final evolution
      if (!evo3) {
        container.appendChild(label("第3進化を選んでください（1回のみ）："));

        // Evo2 A → choose A or B
        // Evo2 B → choose C or D
        const leftKey = branch === "plant"
          ? (evo2 === "A" ? "plantEvo3A" : "plantEvo3C")
          : (evo2 === "A" ? "shadowEvo3A" : "shadowEvo3C");

        const rightKey = branch === "plant"
          ? (evo2 === "A" ? "plantEvo3B" : "plantEvo3D")
          : (evo2 === "A" ? "shadowEvo3B" : "shadowEvo3D");

        const leftImgFile = `${leftKey}.png`;
        const rightImgFile = `${rightKey}.png`;

        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.gap = "24px";
        wrap.style.justifyContent = "center";

        const left = document.createElement("div");
        left.appendChild(img(`${IMG_BASE}${leftImgFile}`));
        left.appendChild(label(getDisplayName(leftImgFile)));
        left.appendChild(btn("この進化を選ぶ", () => {
          const choice = evo2 === "A" ? "A" : "C";
          setEvo3(choice);
          setSelectedMonster(leftImgFile);
          render();
        }));

        const right = document.createElement("div");
        right.appendChild(img(`${IMG_BASE}${rightImgFile}`));
        right.appendChild(label(getDisplayName(rightImgFile)));
        right.appendChild(btn("この進化を選ぶ", () => {
          const choice = evo2 === "A" ? "B" : "D";
          setEvo3(choice);
          setSelectedMonster(rightImgFile);
          render();
        }));

        wrap.appendChild(left);
        wrap.appendChild(right);
        container.appendChild(wrap);
        container.appendChild(label(`レベル：${overallLevel}`));
        return;
      }

      // 🎉 Final Evo — Show correct monster
      const finalKey = branch === "plant"
        ? `plantEvo3${evo3}`
        : `shadowEvo3${evo3}`;

      const finalEvoImg = `${finalKey}.png`;

      container.appendChild(img(`${IMG_BASE}${finalEvoImg}`, "最終進化形態"));
      container.appendChild(label(getDisplayName(finalEvoImg)));
      container.appendChild(label(`最終進化：${evo3}`));
      container.appendChild(label(`レベル：${overallLevel}`));

      // Ensure the final evo is saved as the selected monster
      setSelectedMonster(finalEvoImg);
      return;
    }

    // Level < 30 but evo2 exists → show evo2 form
    const finalEvo2File =
      branch === "plant"
        ? (evo2 === "A" ? "plantEvo_2A.png" : "plantEvo_2B.png")
        : (evo2 === "A" ? "shadowEvo_2A.png" : "shadowEvo_2B.png");

    container.appendChild(img(`${IMG_BASE}${finalEvo2File}`));
    container.appendChild(label(getDisplayName(finalEvo2File)));
    container.appendChild(label(`分岐：${branch} ｜ 進化：${evo2} ｜ レベル：${overallLevel}`));

    // Store currently displayed evo2 monster
    setSelectedMonster(finalEvo2File);
  }

  // UPDATE QUIZ CARD LEVELS
  function updateQuizCardLevels() {
    document.querySelectorAll(".levelValue").forEach(span => {
      const key = span.dataset.key;
      const storedValue = localStorage.getItem(key) || 0;
      span.textContent = `(Level: ${storedValue})`;
    });
  }

  // RUN
  render();
  updateQuizCardLevels();
});
