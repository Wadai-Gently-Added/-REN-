/*
 * 罫線ノート v3.5.27
 * - 組数をしっかり確保して複数練習セットが表示されるように修正
 * - 色付き基準線を「下からN本目」に正確に配置
 * - 半端な線は出さない
 */
function notePracticeFont() {
  return window.__practiceFontFamily || "'Yu Mincho', 'Hiragino Mincho ProN', 'MS Mincho', serif";
}

function noteTextLines() {
  const lines = (typeof parseLines === 'function') ? parseLines(valueOf('txtIn', '')) : [];
  return lines.filter(L => L && L.length);
}

function renderRuledNote() {
  const st = getState();
  const paper = st.page;
  const canvas = st.canvas;

  paper.classList.remove('a4', 'landscape-a4', 'ippitsu', 'note-ruled');
  paper.classList.add(st.orientation === 'landscape' ? 'landscape-a4' : 'a4', 'note-ruled');
  canvas.innerHTML = '';

  const n = (st.note && st.note.lineCount) || 5;
  if (st.pTitle) {
    if (n === 2) {
      const style = (typeof valueOf === 'function') ? valueOf('noteRuleStyle', 'A') : 'A';
      st.pTitle.textContent = '罫線ノート（横書き・' + (style === 'B' ? 'B罫' : 'A罫') + '）';
    } else {
      st.pTitle.textContent = '罫線ノート（横書き・' + n + '本組）';
    }
    st.pTitle.style.cssText = 'background:transparent;border:none;box-shadow:none;padding:0;';
  }

  const area = document.createElement('div');
  area.className = 'note-paper';
  area.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;background:#fff;';
  canvas.appendChild(area);

  let w = paper ? (paper.clientWidth || 0) : 0;
  let h = paper ? (paper.clientHeight || 0) : 0;
  if (w < 10) w = area.clientWidth || 520;
  if (h < 10) h = area.clientHeight || 720;

  const isLandscape = (st.orientation === 'landscape');
  const padX = Math.max(6, w * 0.015);
  const padY = Math.max(8, h * 0.02);
  const titleH = 16;
  const usableW = Math.max(80, w - padX * 2);
  const contentTop = padY + titleH;
  const contentBottom = h - padY;
  const usableH = Math.max(60, contentBottom - contentTop);

  const linesPerGroup = Math.max(2, Math.min(5, n));
  const isSimpleTwo = (linesPerGroup === 2);
  const fontPx = Math.max(12, Math.min(34, st.fontSizePx || 24));
  const LINE_W = 0.9;
  const colorLine = (st.note && st.note.colorLine) || 'var(--note-accent, #c45c6a)';

  const textLines = noteTextLines();
  let types = (typeof getTypes === 'function') ? getTypes().slice() : ['blackSample', 'grayFull', 'blank'];
  if (!types.length) types = ['blackSample', 'grayFull', 'blank'];

  // 練習セット × 入力行 = 表示する練習行のリスト
  const practiceRows = [];
  if (textLines.length) {
    types.forEach(t => {
      textLines.forEach(units => {
        practiceRows.push({ type: t, units: units.slice() });
      });
    });
  }

  function drawSolid(y, isAccent) {
    if (y < contentTop - 0.5 || y > contentBottom - 3) return;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:' + LINE_W + 'px;' +
      'background:' + (isAccent ? colorLine : 'var(--line-main, rgba(184,148,148,0.62))') + ';' +
      'pointer-events:none;';
    area.appendChild(el);
  }

  function drawDash(y) {
    if (y < contentTop - 0.5 || y > contentBottom - 3) return;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:0;' +
      'border-top:1px dashed rgba(184,148,148,0.3);pointer-events:none;';
    area.appendChild(el);
  }

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  function measureUnitWidth(unit, fs) {
    if (unit === ' ') return Math.max(fs * 0.35, 4);
    measureCtx.font = 'bold ' + fs + 'px ' + notePracticeFont();
    return Math.ceil(measureCtx.measureText(unit).width + 1.2);
  }

  function drawTextOnBaseline(lineY, maxAscent, type, units) {
    if (!units || !units.length || type === 'blank') return [];
    const isModel = (type === 'blackSample');
    const color = isModel ? '#333' : 'rgba(170,170,170,0.92)';
    const fs = Math.min(fontPx, Math.max(11, maxAscent * 0.85));
    let x = padX + 2;
    const rightLimit = padX + usableW - 6;
    let i = 0;
    for (; i < units.length; i++) {
      const unit = units[i];
      const pitch = measureUnitWidth(unit, fs);
      if (x + pitch > rightLimit) break;
      if (unit !== ' ') {
        const ascent = fs * 0.78;
        const span = document.createElement('div');
        span.textContent = unit;
        span.style.cssText =
          'position:absolute;left:' + Math.round(x) + 'px;top:' + Math.round(lineY - ascent) + 'px;' +
          'height:' + Math.round(fs * 1.1) + 'px;' +
          'display:flex;align-items:flex-start;justify-content:center;' +
          'font-family:' + notePracticeFont() + ';font-weight:bold;font-size:' + fs + 'px;' +
          'color:' + color + ';line-height:1;pointer-events:none;white-space:nowrap;overflow:hidden;';
        area.appendChild(span);
      }
      x += pitch;
    }
    return units.slice(i);
  }

  // ========== 2本: A/B罫 ==========
  if (isSimpleTwo) {
    const style = (typeof valueOf === 'function') ? valueOf('noteRuleStyle', 'A') : 'A';
    const gapMin = style === 'B' ? (isLandscape ? 11 : 12) : (isLandscape ? 14 : 15);
    let gap = Math.max(gapMin, Math.min(style === 'B' ? 13 : 18, usableH * 0.03));

    let lineCount = Math.max(2, Math.floor(usableH / gap) + 1);
    while (lineCount > 2 && (lineCount - 1) * gap > usableH * 0.98) lineCount--;
    if (lineCount > 1) gap = (usableH * 0.97) / (lineCount - 1);

    const mains = [];
    for (let i = 0; i < lineCount; i++) {
      const y = contentTop + i * gap;
      if (y > contentBottom - 4) break;
      mains.push(y);
    }
    mains.forEach(y => drawSolid(y, false));
    for (let i = 0; i < mains.length - 1; i++) {
      drawDash((mains[i] + mains[i + 1]) / 2);
    }

    if (practiceRows.length && mains.length >= 2) {
      let bi = 1;
      for (let r = 0; r < practiceRows.length && bi < mains.length; r++) {
        let units = practiceRows[r].units.slice();
        const type = practiceRows[r].type;
        if (type === 'blank') { bi++; continue; }
        while (units.length && bi < mains.length) {
          units = drawTextOnBaseline(mains[bi], gap * 0.9, type, units);
          bi++;
        }
      }
    }
    return;
  }

  // ========== 3〜5本組 ==========
  // 組の高さをコンパクトにして、複数組が確実に入るようにする
  let innerGap = Math.max(5, Math.min(7.5, fontPx * 0.26));
  let groupHeight = innerGap * (linesPerGroup - 1);

  // 組間（縦向きの方が少し狭くして組数を稼ぐ）
  const betweenMin = Math.max(groupHeight * 0.55, fontPx * 0.7, isLandscape ? 12 : 10);

  // 最大で入る組数を計算（割り切れ分だけ）
  let groupCount = Math.floor((usableH + betweenMin) / (groupHeight + betweenMin));
  if (groupCount < 1) groupCount = 1;
  // 上限（ページが極端に長い場合の保険）
  if (groupCount > 20) groupCount = 20;

  // 実際に収まるか確認して調整
  while (groupCount > 1) {
    const total = groupCount * groupHeight + (groupCount - 1) * betweenMin;
    if (total <= usableH) break;
    groupCount--;
  }

  // 余白を組間に分配
  let between = betweenMin;
  if (groupCount > 1) {
    const leftover = usableH - groupCount * groupHeight;
    between = Math.max(betweenMin, leftover / (groupCount - 1));
    // 広げすぎない
    if (between > betweenMin * 2.2) between = betweenMin * 2.2;
  }

  // 最終線がはみ出ない最終チェック
  while (groupCount >= 1) {
    const lastY = contentTop + (groupCount - 1) * (groupHeight + between) + (linesPerGroup - 1) * innerGap;
    if (lastY <= contentBottom - 5) break;
    groupCount--;
    if (groupCount > 1) {
      const leftover = usableH - groupCount * groupHeight;
      between = Math.max(betweenMin, leftover / (groupCount - 1));
    }
  }
  if (groupCount < 1) groupCount = 1;

  const colorFromBottom = Math.max(0, Math.min(linesPerGroup, (st.note && st.note.colorLineNo) || 0));
  const groupTops = [];

  for (let g = 0; g < groupCount; g++) {
    const groupTop = contentTop + g * (groupHeight + between);
    const groupLast = groupTop + (linesPerGroup - 1) * innerGap;
    if (groupLast > contentBottom - 5) break;

    groupTops.push(groupTop);
    for (let i = 0; i < linesPerGroup; i++) {
      const y = groupTop + i * innerGap;
      // fromBottom: 一番下が1、その上が2 …
      const fromBottom = linesPerGroup - i;
      const isAccent = (colorFromBottom > 0 && fromBottom === colorFromBottom);
      drawSolid(y, isAccent);
    }
  }

  // 文字配置：練習セットを順番に組に割り当てる
  // blank も1組消費する（空の練習枠として線だけ残る）
  let gi = 0;
  const actualGroups = groupTops.length;
  for (let r = 0; r < practiceRows.length && gi < actualGroups; r++) {
    const type = practiceRows[r].type;
    let units = practiceRows[r].units.slice();

    if (type === 'blank') {
      gi++; // 空枠として組を1つ消費
      continue;
    }

    // この練習行を現在の組に置く。入りきらなければ次の組へ
    while (units.length && gi < actualGroups) {
      const groupTop = groupTops[gi];
      let lineY, maxAscent;
      if (colorFromBottom > 0) {
        // 下から colorFromBottom 本目の線に文字を乗せる
        const idxFromTop = linesPerGroup - colorFromBottom;
        lineY = groupTop + idxFromTop * innerGap;
        maxAscent = Math.max(innerGap * Math.max(1, colorFromBottom - 0.15), fontPx);
      } else {
        // 色線なしのときは組のやや下寄り
        lineY = groupTop + groupHeight * 0.65;
        maxAscent = Math.max(groupHeight * 0.55, fontPx);
      }
      units = drawTextOnBaseline(lineY, maxAscent, type, units);
      gi++;
    }
  }
}
