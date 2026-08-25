﻿﻿/* ============================================================
 * マス目モード描画（06_grid.js）
 * state は getState() 統一参照。⑥の利き手は単一ID handCircle を使用
 * ============================================================ */
function renderGrid() {
  const st = getState();
  const text = st.text;
  const foldCount = st.grid.foldCount;
  const wMode = st.grid.wMode;
  const hand  = st.circle.hand;   /* ⑥は単一ID handCircle に統一済 */
  const canvas = st.canvas;
  const page = st.page;

  page.classList.remove('ippitsu','landscape-a4');
  page.classList.add(st.orientation === 'landscape' ? 'landscape-a4' : 'a4');

  canvas.innerHTML = '';
  const lines = parseLines(text);
  if (lines.length === 0) return;

  const isVert = (wMode === 'vertical');
  const linesData = lines.map(units => {
    if (isVert || foldCount <= 0) return [units];
    const chunks = [];
    for (let i = 0; i < units.length; i += foldCount) chunks.push(units.slice(i, i+foldCount));
    return chunks;
  });

  document.documentElement.style.setProperty('--canvas-dir', isVert ? 'column' : 'row');
  document.documentElement.style.setProperty('--canvas-justify','flex-start');
  document.documentElement.style.setProperty('--stage-dir', isVert ? 'row-reverse' : 'column');
  document.documentElement.style.setProperty('--section-dir', isVert ? 'row-reverse' : 'column');
  document.documentElement.style.setProperty('--line-flow-dir', isVert ? 'column' : 'row');
  st.pTitle.textContent = isVert ? '縦書き美文字練習帳（マス目）' : '横書き美文字練習帳（マス目）';

  let types = getTypes();
  if (isVert && hand === 'right') types = [...types].reverse();

  const desiredMax = Math.round((CELL_MIN + st.fontSizePct * 0.24) * 10) / 10;

  /* 二分探索でセルサイズ決定 */
  let low = CELL_MIN, high = Math.max(CELL_MIN, desiredMax), bestSize = CELL_MIN;
  const measureBox = document.createElement('div');
  measureBox.style.cssText = 'position:absolute; left:-9999px; top:0; visibility:hidden;';
  document.body.appendChild(measureBox);
  let safety = 60;
  while (low <= high && safety-- > 0) {
    const mid = Math.floor((low + high) / 2);
    document.documentElement.style.setProperty('--cell-size', mid + 'px');
    const testSection = createSection(linesData, types);
    measureBox.appendChild(testSection);
    const secW = testSection.offsetWidth, secH = testSection.offsetHeight;
    measureBox.innerHTML = '';
    if (secW <= canvas.clientWidth && secH <= canvas.clientHeight) { bestSize = mid; low = mid + 1; }
    else { high = mid - 1; }
  }
  document.documentElement.style.setProperty('--cell-size', bestSize + 'px');

  const finalSection = createSection(linesData, types);
  measureBox.appendChild(finalSection);
  const sectionW = finalSection.offsetWidth, sectionH = finalSection.offsetHeight;
  measureBox.innerHTML = '';
  document.body.removeChild(measureBox);

  const usableW = canvas.clientWidth, usableH = canvas.clientHeight;
  let repeatsMain, repeatsCross;
  if (isVert) {
    repeatsMain  = calcFitCount(usableH, sectionH, GAP);
    repeatsCross = calcFitCount(usableW, sectionW, GAP);
  } else {
    repeatsMain  = calcFitCount(usableW, sectionW, GAP);
    repeatsCross = calcFitCount(usableH, sectionH, GAP);
  }
  const maxRepeats = Math.max(1, repeatsMain * repeatsCross);

  canvas.style.flexDirection = isVert ? 'column' : 'row';
  canvas.style.flexWrap = 'wrap';
  canvas.style.gap = GAP + 'px';
  canvas.style.justifyContent = 'flex-start';
  canvas.style.alignContent = 'flex-start';

  for (let r = 0; r < maxRepeats; r++) canvas.appendChild(createSection(linesData, types));
}
