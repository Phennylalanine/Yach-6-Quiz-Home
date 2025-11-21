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

    // LEVEL 30 Placeholder Names
    plantEvo3A: "植物進化A（仮）",
    plantEvo3B: "植物進化B（仮）",
    plantEvo3C: "植物進化C（仮）",
    plantEvo3D: "植物進化D（仮）",

    shadowEvo3A: "シャドウ進化A（仮）",
    shadowEvo3B: "シャドウ進化B（仮）",
    shadowEvo3C: "シャドウ進化C（仮）",
    shadowEvo3D: "シャドウ進化D（仮）",

    // Placeholder fallback
    placeholder: "進化中（仮）"
  };

  function getDisplayName(imgFile) {
    const key = imgFile.replace(".png", "").replace(".webp", "");
    return IMAGE_DISPLAY_NAMES[key] || "名称未設定";
  }

  // QUIZ WEIGHTS (your categories)
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
  ];

  // Calculate level
  const overallLevelRaw = quizData.reduce((sum, { key, multiplier }) => {
    const value = parseInt(localStorage.getItem(key)) || 0;
    return sum + value * multiplier;
  }, 0);

  const overallLevel = Math.floor(overallLevelRaw);

  // Storage Helpers
  const getBranch = () => localStorage.getItem("branchChoice");
  const setBranch = (b) => localStorage.setItem("branchChoice", b);
  const getEvo2 = () => localStorage.getItem("evo2Choice");
  const setEvo2 = (c) => localStorage.setItem("evo2Choice", c);
  const getEvo3 = () => localStorage.getItem("evo3Choice");
  const setEvo3 = (v) => localStorage.setItem("evo3Choice", v);

  // UI Helpers
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

    // Level < 5 → still egg
    if (overallLevel < 5) {
      const imgFile = "shadowPlantEgg.png";
      container.appendChild(img(`${IMG_BASE}${imgFile}`, "Egg"));
      container.appendChild(label(getDisplayName(imgFile)));
      container.appendChild(label(`レベル：${overallLevel}`));
      return;
    }

    // Need branch (level ≥ 5)
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

      container.appendChild(btn("植物（プラント）を選ぶ", () => { setBranch("plant"); render(); }));
      container.appendChild(btn("シャドウを選ぶ", () => { setBranch("shadow"); render(); }));
      container.appendChild(label(`現在レベル：${overallLevel}`));
      return;
    }

    // Level < 10 → show slime form
    if (overallLevel < 10) {
      const slimeImg = branch === "plant" ? "plantSlime_1.png" : "shadowSlime_1.png";
      container.appendChild(img(`${IMG_BASE}${slimeImg}`));
      container.appendChild(label(getDisplayName(slimeImg)));
      container.appendChild(label(`分岐：${branch} ｜ レベル：${overallLevel}`));
      return;
    }

    // Need evo2 choice (level ≥ 10)
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
      aw.appendChild(btn("進化A を決定", () => { setEvo2("A"); render(); }));

      const bw = document.createElement("div");
      bw.appendChild(img(`${IMG_BASE}${bFile}`));
      bw.appendChild(label(getDisplayName(bFile)));
      bw.appendChild(btn("進化B を決定", () => { setEvo2("B"); render(); }));

      wrap.appendChild(aw);
      wrap.appendChild(bw);
      container.appendChild(wrap);

      container.appendChild(label(`分岐：${branch} ｜ レベル：${overallLevel}`));
      return;
    }

    // ⭐ LEVEL 30 EVOLUTION (NEW)
    if (overallLevel >= 30) {
      const evo3 = getEvo3();

      if (!evo3) {
        container.appendChild(label("第3進化を選んでください（1回のみ）："));

        // Always use placeholder.webp until images exist
        const leftImg = "placeholder.webp";
        const rightImg = "placeholder.webp";

        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.gap = "24px";
        wrap.style.justifyContent = "center";

        const left = document.createElement("div");
        const right = document.createElement("div");

        left.appendChild(img(`${IMG_BASE}${leftImg}`));
        right.appendChild(img(`${IMG_BASE}${rightImg}`));

        // evo2 → determines whether choices are A/B or C/D
        left.appendChild(btn("この進化を選ぶ", () => {
          setEvo3(evo2 === "A" ? "A" : "C");
          render();
        }));

        right.appendChild(btn("この進化を選ぶ", () => {
          setEvo3(evo2 === "A" ? "B" : "D");
          render();
        }));

        wrap.appendChild(left);
        wrap.appendChild(right);
        container.appendChild(wrap);

        container.appendChild(label(`レベル：${overallLevel}`));
        return;
      }

      // FINAL EVOLUTION (Level 30)
      const fileMapping = {
        A: `${branch}Evo3A.webp`,
        B: `${branch}Evo3B.webp`,
        C: `${branch}Evo3C.webp`,
        D: `${branch}Evo3D.webp`,
      };

      const finalEvoImg = "placeholder.webp"; // display placeholder
      container.appendChild(img(`${IMG_BASE}${finalEvoImg}`, "最終進化形態"));

      container.appendChild(label(`最終進化：${evo3}`));
      container.appendChild(label(`レベル：${overallLevel}`));
      return;
    }

    // If level < 30 but evo2 exists → show evo2
    const finalEvo2File =
      branch === "plant"
        ? (evo2 === "A" ? "plantEvo_2A.png" : "plantEvo_2B.png")
        : (evo2 === "A" ? "shadowEvo_2A.png" : "shadowEvo_2B.png");

    container.appendChild(img(`${IMG_BASE}${finalEvo2File}`));
    container.appendChild(label(getDisplayName(finalEvo2File)));
    container.appendChild(label(`分岐：${branch} ｜ 進化：${evo2} ｜ レベル：${overallLevel}`));
  }

  render();
});
