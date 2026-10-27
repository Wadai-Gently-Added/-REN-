/*
 * 罫線ノート v3.5.29
 * 方針変更：高さ計算に頼らず、ページを均等分割して複数組を必ず描く
 * - 色付き線「なし」→ 組の中央に文字
 * - 色付き線あり → 下からN本目に文字
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

  // 寸法取得（複数経路）
  let w = 0, h = 0;
  if (paper) {
    w = parseFloat(paper.style.width) || paper.clientWidth || paper.offsetWidth || 0;
    h = parseFloat(paper.style.height) || paper.clientHeight || paper.offsetHeight || 0;
  }
  if (w < 50) w = area.clientWidth || 400;
  if (h < 50) h = area.clientHeight || 560;

  const isLandscape = (st.orientation === 'landscape');
  const padX = Math.max(8, Math.round(w * 0.02));
  const padTop = Math.max(10, Math.round(h * 0.025));
  const padBot = Math.max(12, Math.round(h * 0.03));
  const titleH = 16;
  const usableW = Math.max(100, w - padX * 2);
  const contentTop = padTop + titleH;
  const contentBottom = h - padBot;
  const usableH = Math.max(120, contentBottom - contentTop);

  const linesPerGroup = Math.max(2, Math.min(5, n));
  const isSimpleTwo = (linesPerGroup === 2);
  const fontPx = Math.max(12, Math.min(34, st.fontSizePx || 24));
  const LINE_W = 0.9;
  const colorLine = (st.note && st.note.colorLine) || '#c45c6a';

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
    if (y < contentTop - 1 || y > contentBottom - 1) return;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:' + LINE_W + 'px;' +
      'background:' + (isAccent ? colorLine : 'rgba(184,148,148,0.62)') + ';' +
      'pointer-events:none;';
    area.appendChild(el);
  }

  function drawDash(y) {
    if (y < contentTop - 1 || y > contentBottom - 1) return;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:0;' +
      'border-top:1px dashed rgba(184,148,148,0.32);pointer-events:none;';
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
    const fs = Math.min(fontPx, Math.max(11, maxAscent * 0.82));
    let x = padX + 3;
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
    const gapMin = style === 'B' ? 11 : 14;
    // 均等分割で行数を決める
    let lineCount = Math.max(4, Math.floor(usableH / (gapMin + 2)));
    if (lineCount > 30) lineCount = 30;
    const gap = usableH / Math.max(1, lineCount - 1);

    const mains = [];
    for (let i = 0; i < lineCount; i++) {
      const y = contentTop + i * gap;
      if (y > contentBottom - 2) break;
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
          units = drawTextOnBaseline(mains[bi], gap * 0.88, type, units);
          bi++;
        }
      }
    }
    return;
  }

  // ========== 3〜5本組 ==========
  // 組内の線間隔
  const innerGap = Math.max(5, Math.min(7.5, fontPx * 0.26));
  const groupHeight = innerGap * (linesPerGroup - 1);

  // ★ 方針：練習セット数を最低限確保しつつ、ページを埋める組数を決める
  const minGroups = Math.max(practiceRows.length, isLandscape ? 5 : 8);
  let groupCount = minGroups;

  // 組間を均等に分配
  // 総高さ = groupCount * groupHeight + (groupCount-1) * between
  // usableH に収まる between を計算
  let between = 14;
  if (groupCount > 1) {
    between = (usableH - groupCount * groupHeight) / (groupCount - 1);
  }

  // between が狭すぎたら組数を減らす
  const betweenFloor = Math.max(8, groupHeight * 0.4);
  while (groupCount > 1 && between < betweenFloor) {
    groupCount--;
    between = groupCount > 1 ? (usableH - groupCount * groupHeight) / (groupCount - 1) : betweenFloor;
  }

  // between が広すぎたら組数を増やせるだけ増やす
  const betweenCeil = Math.max(betweenFloor * 2.5, 28);
  while (between > betweenCeil) {
    const next = groupCount + 1;
    const nextBetween = (usableH - next * groupHeight) / Math.max(1, next - 1);
    if (nextBetween < betweenFloor) break;
    groupCount = next;
    between = nextBetween;
    if (groupCount > 16) break;
  }

  // 最終確認：最終線がはみ出ない
  while (groupCount >= 1) {
    const lastY = contentTop + (groupCount - 1) * (groupHeight + between) + groupHeight;
    if (lastY <= contentBottom - 3) break;
    groupCount--;
    if (groupCount > 1) {
      between = (usableH - groupCount * groupHeight) / (groupCount - 1);
    }
  }
  if (groupCount < 1) groupCount = 1;

  const colorFromBottom = Math.max(0, Math.min(linesPerGroup, (st.note && st.note.colorLineNo) || 0));
  const groupTops = [];

  for (let g = 0; g < groupCount; g++) {
    const groupTop = contentTop + g * (groupHeight + between);
    const groupLast = groupTop + groupHeight;
    if (groupLast > contentBottom - 2) break;

    groupTops.push(groupTop);
    for (let i = 0; i < linesPerGroup; i++) {
      const y = groupTop + i * innerGap;
      const fromBottom = linesPerGroup - i;
      const isAccent = (colorFromBottom > 0 && fromBottom === colorFromBottom);
      drawSolid(y, isAccent);
    }
  }

  // 文字配置
  let gi = 0;
  const actualGroups = groupTops.length;
  for (let r = 0; r < practiceRows.length && gi < actualGroups; r++) {
    const type = practiceRows[r].type;
    let units = practiceRows[r].units.slice();

    if (type === 'blank') {
      gi++;
      continue;
    }

    while (units.length && gi < actualGroups) {
      const groupTop = groupTops[gi];
      let lineY, maxAscent;

      if (colorFromBottom > 0) {
        // 下から N 本目
        const idxFromTop = linesPerGroup - colorFromBottom;
        lineY = groupTop + idxFromTop * innerGap;
        maxAscent = Math.max(innerGap * 1.2, fontPx);
      } else {
        // 「なし」→ 組の中央
        lineY = groupTop + groupHeight * 0.5;
        maxAscent = Math.max(groupHeight * 0.55, fontPx);
      }
      units = drawTextOnBaseline(lineY, maxAscent, type, units);
      gi++;
    }
  }
}
