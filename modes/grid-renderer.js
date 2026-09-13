/*
 * マス目モード描画。入力文字数が増えても、ページ内に収まるよう
 * 折り返し数とセルサイズを描画領域から再計算する。
 */
function renderGrid() {
  const st = getState();
  const canvas = st.canvas;
  const page = st.page;
  const isVert = st.grid.wMode === 'vertical';
  const hand = st.circle.hand;

  page.classList.remove('ippitsu', 'landscape-a4');
  page.classList.add(st.orientation === 'landscape' ? 'landscape-a4' : 'a4');
  canvas.innerHTML = '';

  const lines = parseLines(st.text);
  if (lines.length === 0) return;

  const targetCell = Math.max(CELL_MIN, Math.min(34, CELL_MIN + st.fontSizePct * 0.24));
  /* flexレイアウト確定前にclientWidthが0になる場合はページ内寸を使用する。 */
  const pageInnerW = Math.max(1, page.clientWidth - 28);
  const pageInnerH = Math.max(1, page.clientHeight - 32);
  const availableW = Math.max(1, canvas.clientWidth || pageInnerW);
  const availableH = Math.max(1, canvas.clientHeight || pageInnerH);
  const maxCellsAcross = Math.max(1, Math.floor(availableW / targetCell));
  const maxCellsDown = Math.max(1, Math.floor(availableH / targetCell));
  const requestedFold = st.grid.foldCount;

  /* 横書きは指定値を尊重しつつ、1行がページ幅を超えないよう縮める。 */
  const horizontalFold = requestedFold > 0
    ? Math.max(1, Math.min(requestedFold, maxCellsAcross))
    : maxCellsAcross;
  /* 縦書きも指定値を尊重。0のときはページ高さに収まる最大数を使う。 */
  const verticalFold = requestedFold > 0
    ? Math.max(1, Math.min(requestedFold, maxCellsDown))
    : maxCellsDown;
  const fold = isVert ? verticalFold : horizontalFold;
  const linesData = lines.map(units => {
    const chunks = [];
    for (let i = 0; i < units.length; i += fold) chunks.push(units.slice(i, i + fold));
    return chunks.length ? chunks : [[]];
  });

  document.documentElement.style.setProperty('--stage-dir', isVert ? 'row-reverse' : 'column');
  document.documentElement.style.setProperty('--section-dir', isVert ? 'row-reverse' : 'column');
  document.documentElement.style.setProperty('--line-flow-dir', isVert ? 'column' : 'row');
  st.pTitle.textContent = isVert ? '縦書き美文字練習帳（マス目）' : '横書き美文字練習帳（マス目）';

  let types = getTypes();
  if (isVert && hand === 'right') types = [...types].reverse();

  const measureBox = document.createElement('div');
  measureBox.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(measureBox);

  let low = CELL_MIN;
  let high = Math.max(CELL_MIN, Math.floor(targetCell));
  let bestSize = CELL_MIN;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    document.documentElement.style.setProperty('--cell-size', mid + 'px');
    const testSection = createSection(linesData, types);
    measureBox.appendChild(testSection);
    const fits = testSection.offsetWidth <= availableW && testSection.offsetHeight <= availableH;
    measureBox.innerHTML = '';
    if (fits) { bestSize = mid; low = mid + 1; }
    else high = mid - 1;
  }
  document.documentElement.style.setProperty('--cell-size', bestSize + 'px');

  const finalSection = createSection(linesData, types);
  measureBox.appendChild(finalSection);
  const sectionW = finalSection.offsetWidth;
  const sectionH = finalSection.offsetHeight;
  measureBox.innerHTML = '';
  document.body.removeChild(measureBox);

  const gap = GAP;
  const repeatsMain = calcFitCount(isVert ? availableH : availableW, isVert ? sectionH : sectionW, gap);
  const repeatsCross = calcFitCount(isVert ? availableW : availableH, isVert ? sectionW : sectionH, gap);
  const repeatCount = Math.max(1, repeatsMain * repeatsCross);

  canvas.style.display = 'flex';
  canvas.style.flexDirection = isVert ? 'column' : 'row';
  canvas.style.flexWrap = 'wrap';
  canvas.style.gap = gap + 'px';
  /* 余白を片側へ寄せず、ページ中央に均等配置する。 */
  canvas.style.justifyContent = 'center';
  canvas.style.alignContent = 'center';
  canvas.style.alignItems = 'center';
  for (let i = 0; i < repeatCount; i++) canvas.appendChild(createSection(linesData, types));
}
