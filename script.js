window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("overallLevel");
  const IMG_BASE = "./monster_image/";

  // IMAGE NAME MAPPING – merged in from the other script
  const IMAGE_DISPLAY_NAMES = {
    shadowPlantEgg: "ヤミタマ",
    plantSlime_1: "ハナゴロ",
    shadowSlime_1: "カゲモチ",
    plantEvo_2A: "ネッコン",
    plantEvo_2B: "モリフワ",
    shadowEvo_2A: "スミボウ",
    shadowEvo_2B: "ヨルビト",
  };

  function getDisplayName(imgFile) {
    const key = imgFile.replace(".png", "");
    return IMAGE_DISPLAY_NAMES[key] || "名称未設定";
  }

  // 1) Calculate weighted overall level (same as before)
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

  const overallLevelRaw = quizData.reduce((sum, { key, multiplier }) => {
    const value = parseInt(localStorage.getItem(key)) || 0;
    return sum + value * multiplier;
  }, 0);

  // We’ll use the floored value for threshold checks.
  const overallLevel = Math.floor(overallLevelRaw);

  // 2) Helpers
  const getBranch = () => localStorage.getItem("branchChoice"); // "plant" | "shadow" | null
  const setBranch = (b) => localStorage.setItem("branchChoice", b);
  const getEvo2 = () => localStorage.getItem("evo2Choice"); // "A" | "B" | null
  const setEvo2 = (c) => localStorage.setItem("evo2Choice", c);

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
    i.style.imageRendering = "auto";
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

  function render() {
    clearContainer();

    // Safety: If level is below 5, we ignore any stored choice (we still keep it in storage).
    if (overallLevel < 5) {
      const imgFile = "shadowPlantEgg.png";
      container.appendChild(img(`${IMG_BASE}${imgFile}`, "Egg"));
      container.appendChild(label(getDisplayName(imgFile)));
      container.appendChild(label(`レベル：${overallLevel}`));
      return;
    }

    // Level ≥ 5: need/select branch
    const branch = getBranch();
    if (!branch) {
      // Present one-time branch choice (Japanese)
      container.appendChild(label("進化の分岐を選んでください："));
      // Show both thumbnails to make the choice clearer
      const thumbs = document.createElement("div");
      thumbs.style.display = "flex";
      thumbs.style.justifyContent = "center";
      thumbs.style.gap = "24px";
      thumbs.style.marginBottom = "8px";

      const plantFile = "plantSlime_1.png";
      const shadowFile = "shadowSlime_1.png";

      const plantWrap = document.createElement("div");
      plantWrap.appendChild(img(`${IMG_BASE}${plantFile}`, "植物スライム"));
      plantWrap.appendChild(label(getDisplayName(plantFile)));

      const shadowWrap = document.createElement("div");
      shadowWrap.appendChild(img(`${IMG_BASE}${shadowFile}`, "シャドウスライム"));
      shadowWrap.appendChild(label(getDisplayName(shadowFile)));

      thumbs.appendChild(plantWrap);
      thumbs.appendChild(shadowWrap);
      container.appendChild(thumbs);

      const choosePlant = btn("植物（プラント）を選ぶ", () => {
        setBranch("plant");
        render();
      });
      const chooseShadow = btn("シャドウを選ぶ", () => {
        setBranch("shadow");
        render();
      });
      container.appendChild(choosePlant);
      container.appendChild(chooseShadow);
      container.appendChild(label(`現在レベル：${overallLevel}`));
      return;
    }

    // We have a branch chosen. Before Level 10, just show the branch slime.
    if (overallLevel < 10) {
      const slimeImg =
        branch === "plant"
          ? "plantSlime_1.png"
          : "shadowSlime_1.png";
      container.appendChild(img(`${IMG_BASE}${slimeImg}`, `${branch} slime`));
      container.appendChild(label(getDisplayName(slimeImg)));
      container.appendChild(label(`分岐：${branch === "plant" ? "植物（プラント）" : "シャドウ"}　｜　レベル：${overallLevel}`));
      return;
    }

    // Level ≥ 10 → evo choice A/B within the selected branch
    const evo2 = getEvo2();
    if (!evo2) {
      container.appendChild(
        label("第2進化を選んでください（1回のみ）：")
      );

      const pickWrap = document.createElement("div");
      pickWrap.style.display = "flex";
      pickWrap.style.justifyContent = "center";
      pickWrap.style.gap = "24px";
      pickWrap.style.flexWrap = "wrap";
      pickWrap.style.marginBottom = "8px";

      const aFile =
        branch === "plant"
          ? "plantEvo_2A.png"
          : "shadowEvo_2A.png";
      const bFile =
        branch === "plant"
          ? "plantEvo_2B.png"
          : "shadowEvo_2B.png";

      const aWrap = document.createElement("div");
      aWrap.appendChild(img(`${IMG_BASE}${aFile}`, "進化A"));
      aWrap.appendChild(label(getDisplayName(aFile)));
      const aBtn = btn("進化A を決定", () => {
        setEvo2("A");
        render();
      });
      aWrap.appendChild(aBtn);

      const bWrap = document.createElement("div");
      bWrap.appendChild(img(`${IMG_BASE}${bFile}`, "進化B"));
      bWrap.appendChild(label(getDisplayName(bFile)));
      const bBtn = btn("進化B を決定", () => {
        setEvo2("B");
        render();
      });
      bWrap.appendChild(bBtn);

      pickWrap.appendChild(aWrap);
      pickWrap.appendChild(bWrap);
      container.appendChild(pickWrap);
      container.appendChild(
        label(`分岐：${branch === "plant" ? "植物（プラント）" : "シャドウ"}　｜　レベル：${overallLevel}`)
      );
      return;
    }

    // evo2 chosen → show the selected evolution image and lock it in
    const finalFile =
      branch === "plant"
        ? (evo2 === "A" ? "plantEvo_2A.png" : "plantEvo_2B.png")
        : (evo2 === "A" ? "shadowEvo_2A.png" : "shadowEvo_2B.png");

    container.appendChild(img(`${IMG_BASE}${finalFile}`, "進化結果"));
    container.appendChild(label(getDisplayName(finalFile)));
    container.appendChild(
      label(
        `分岐：${branch === "plant" ? "植物（プラント）" : "シャドウ"}　｜　進化：${evo2}　｜　レベル：${overallLevel}`
      )
    );
  }

  render();

  // 3) Keep your level-by-span updater
  document.querySelectorAll(".levelValue").forEach((span) => {
    const key = span.getAttribute("data-key");
    const levelValue = parseInt(localStorage.getItem(key)) || 0;
    span.textContent = `(Level: ${levelValue})`;
  });
});
