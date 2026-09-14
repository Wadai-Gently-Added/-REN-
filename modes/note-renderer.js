/*
 * 罫線ノート（横書き固定） v3.5.24
 * - 下端に余分な線を絶対に出さない（SAFE_BOTTOM 厳守）
 * - 縦向きの方が行数が多くなるよう高さ計算を明確化
 * - 文字幅は canvas.measureText で実測
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

  // ページ実寸を取得（fitPageToViewport 後の値を使う）
  let w = paper ? (paper.clientWidth || 0) : 0;
  let h = paper ? (paper.clientHeight || 0) : 0;
  if (w < 10) w = area.clientWidth || 520;
  if (h < 10) h = area.clientHeight || 720;

  const isLandscape = (st.orientation === 'landscape');
  const padX = Math.max(6, w * 0.015);
  const padY = Math.max(10, h * 0.025);          // 上下余白を少し多めに
  const titleReserve = 18;
  const usableW = Math.max(100, w - padX * 2);
  const contentTop = padY + titleReserve * 0.5;
  const contentBottom = h - padY;

  // ★ 下端セーフゾーン：ここより下には線を1本も引かない
  const SAFE_BOTTOM = contentBottom - 18;        // 18px の余白を強制
  const usableH = Math.max(60, SAFE_BOTTOM - contentTop);

  const linesPerGroup = Math.max(2, Math.min(5, n));
  const isSimpleTwo = (linesPerGroup === 2);
  const fontPx = Math.max(12, Math.min(36, st.fontSizePx || 24));
  const LINE_W = 0.9;
  const colorLine = (st.note && st.note.colorLine) || 'var(--note-accent, #c45c6a)';

  const textLines = noteTextLines();
  let types = (typeof getTypes === 'function') ? getTypes().slice() : ['blackSample', 'grayFull', 'blank'];
  if (!types.length) types = ['blackSample', 'grayFull', 'blank'];

  const practiceRows = [];
  if (textLines.length) {
    types.forEach(t => {
      textLines.forEach(units => {
        practiceRows.push({ type: t, units: units.slice() });
      });
    });
  }

  function drawSolid(y, isAccent) {
    if (y < contentTop - 0.5 || y > SAFE_BOTTOM) return false;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:' + LINE_W + 'px;' +
      'background:' + (isAccent ? colorLine : 'var(--line-main, rgba(184,148,148,0.62))') + ';' +
      'pointer-events:none;';
    area.appendChild(el);
    return true;
  }

  function drawDash(y) {
    if (y < contentTop - 0.5 || y > SAFE_BOTTOM) return false;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:0;' +
      'border-top:1px dashed rgba(184,148,148,0.3);pointer-events:none;';
    area.appendChild(el);
    return true;
  }

  // 実測文字幅
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  function measureUnitWidth(unit, fs) {
    if (unit === ' ') return Math.max(fs * 0.35, 4);
    measureCtx.font = 'bold ' + fs + 'px ' + notePracticeFont();
    return Math.ceil(measureCtx.measureText(unit).width + 1.5);
  }

  function drawTextOnBaseline(lineY, maxAscent, type, units) {
    if (!units || !units.length || type === 'blank') return [];
    const isModel = (type === 'blackSample');
    const color = isModel ? '#333' : 'rgba(170,170,170,0.92)';
    const fs = Math.min(fontPx, Math.max(11, maxAscent * 0.85));
    let x = padX + 3;
    const rightLimit = padX + usableW - 8;
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
    // 縦向きの方が間隔を少し広めに取れるように
    let gapMin = style === 'B' ? (isLandscape ? 12 : 13) : (isLandscape ? 15 : 16);
    let gap = Math.max(gapMin, Math.min(style === 'B' ? 14 : 19, usableH * (style === 'B' ? 0.028 : 0.035)));

    let lineCount = Math.max(2, Math.floor(usableH / gap) + 1);
    while (lineCount > 2 && (lineCount - 1) * gap > usableH) lineCount--;
    if (lineCount > 1) gap = usableH / (lineCount - 1);
    if (gap < gapMin) {
      gap = gapMin;
      lineCount = Math.max(2, Math.floor(usableH / gap) + 1);
      while (lineCount > 2 && (lineCount - 1) * gap > usableH) lineCount--;
    }

    // 主線の y を確定（SAFE_BOTTOM を超えないものだけ）
    const mains = [];
    for (let i = 0; i < lineCount; i++) {
      const y = contentTop + i * gap;
      if (y > SAFE_BOTTOM) break;
      mains.push(y);
    }

    mains.forEach(y => drawSolid(y, false));

    // 破線は主線の間だけ
    for (let i = 0; i < mains.length - 1; i++) {
      const mid = (mains[i] + mains[i + 1]) / 2;
      if (mid <= SAFE_BOTTOM) drawDash(mid);
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

  // ========== 3〜5本: まとまり方式 ==========
  // 縦向きの方が組数が多くなるよう、間隔を向きで調整
  let innerGap = Math.max(5, Math.min(8, fontPx * 0.27));
  const betweenMin = Math.max(innerGap * 1.9, fontPx * 0.9, isLandscape ? 15 : 13);
  let groupHeight = innerGap * (linesPerGroup - 1);

  if (groupHeight < fontPx * 0.95) {
    innerGap = Math.max(innerGap, (fontPx * 0.95) / Math.max(1, linesPerGroup - 1));
    groupHeight = innerGap * (linesPerGroup - 1);
  }

  // 完結した組だけ数える（usableH の中に収まる数）
  let groupCount = 0;
  {
    let used = 0;
    while (true) {
      const need = (groupCount === 0) ? groupHeight : (betweenMin + groupHeight);
      if (used + need > usableH) break;
      used += need;
      groupCount++;
      if (groupCount > 25) break;
    }
  }
  groupCount = Math.max(1, groupCount);

  let between = betweenMin;
  if (groupCount > 1) {
    between = (usableH - groupCount * groupHeight) / (groupCount - 1);
    // 間隔が狭くなりすぎたら組を減らす
    while (groupCount > 1 && between < betweenMin * 0.92) {
      groupCount--;
      between = groupCount > 1 ? (usableH - groupCount * groupHeight) / (groupCount - 1) : betweenMin;
    }
  }

  // 最終確認：最終組の最終線が SAFE_BOTTOM を超えない
  while (groupCount >= 1) {
    const lastY = contentTop + (groupCount - 1) * (groupHeight + between) + (linesPerGroup - 1) * innerGap;
    if (lastY <= SAFE_BOTTOM) break;
    groupCount--;
    if (groupCount > 1) {
      between = (usableH - groupCount * groupHeight) / (groupCount - 1);
    }
  }
  groupCount = Math.max(1, groupCount);

  const colorFromBottom = Math.max(0, Math.min(linesPerGroup, (st.note && st.note.colorLineNo) || 0));
  const groupTops = [];

  for (let g = 0; g < groupCount; g++) {
    const groupTop = contentTop + g * (groupHeight + between);
    const groupLast = groupTop + (linesPerGroup - 1) * innerGap;
    if (groupLast > SAFE_BOTTOM) break;   // この組は描かない

    groupTops.push(groupTop);
    for (let i = 0; i < linesPerGroup; i++) {
      const y = groupTop + i * innerGap;
      if (y > SAFE_BOTTOM) break;
      const fromBottom = linesPerGroup - i;
      const isAccent = colorFromBottom > 0 && fromBottom === colorFromBottom;
      drawSolid(y, isAccent);
    }
  }

  // 文字配置
  let gi = 0;
  const actualGroups = groupTops.length;
  for (let r = 0; r < practiceRows.length && gi < actualGroups; r++) {
    let units = practiceRows[r].units.slice();
    const type = practiceRows[r].type;
    if (type === 'blank') { gi++; continue; }
    while (units.length && gi < actualGroups) {
      const groupTop = groupTops[gi];
      let lineY, maxAscent;
      if (colorFromBottom > 0) {
        const idxFromTop = linesPerGroup - colorFromBottom;
        lineY = groupTop + idxFromTop * innerGap;
        maxAscent = Math.max(innerGap * Math.max(1, colorFromBottom - 0.2), fontPx);
      } else {
        lineY = groupTop + groupHeight * 0.62;
        maxAscent = Math.max(groupHeight * 0.55, fontPx);
      }
      units = drawTextOnBaseline(lineY, maxAscent, type, units);
      gi++;
    }
  }
}
