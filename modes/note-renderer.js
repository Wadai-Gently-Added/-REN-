/*
 * 罫線ノート（横書き固定）
 * - 改行→別行 / スペース→個数分
 * - 長い行は折り返し
 * - まとまりは完結した組だけ（下端の孤立1本を出さない）
 * - A/B罫は主線＋行間の中線（補助線）。横でも詰めすぎない
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

  const padX = Math.max(4, w * 0.012);
  const padY = Math.max(6, h * 0.02);
  const titleReserve = 18;
  const usableW = Math.max(100, w - padX * 2);
  const contentTop = padY + titleReserve * 0.35;
  const contentBottom = h - padY;
  const usableH = Math.max(80, contentBottom - contentTop);

  const linesPerGroup = Math.max(2, Math.min(5, n));
  const isSimpleTwo = (linesPerGroup === 2);
  const fontPx = Math.max(12, Math.min(36, st.fontSizePx || 24));
  const LINE_W = 0.9;
  const colorLine = (st.note && st.note.colorLine) || 'var(--note-accent, #c45c6a)';
  const isLandscape = (st.orientation === 'landscape');

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

  // 下端に線が残らない・半端に出ないための安全マージン
  const BOTTOM_SAFE = 5;

  function drawSolid(y, isAccent) {
    if (y < contentTop - 0.5 || y > contentBottom - BOTTOM_SAFE) return;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:' + LINE_W + 'px;' +
      'background:' + (isAccent ? colorLine : 'var(--line-main, rgba(184,148,148,0.62))') + ';' +
      'pointer-events:none;';
    area.appendChild(el);
  }

  function drawDash(y) {
    if (y < contentTop - 0.5 || y > contentBottom - BOTTOM_SAFE) return;
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + Math.round(padX) + 'px;top:' + Math.round(y) + 'px;' +
      'width:' + Math.round(usableW) + 'px;height:0;' +
      'border-top:1px dashed rgba(184,148,148,0.3);pointer-events:none;';
    area.appendChild(el);
  }

  function isCjk(ch) {
    if (!ch || ch.length === 0) return false;
    const code = ch.codePointAt(0);
    // CJK Unified + common fullwidth / kana
    return (code >= 0x3000 && code <= 0x9FFF) ||
           (code >= 0xF900 && code <= 0xFAFF) ||
           (code >= 0xFF00 && code <= 0xFFEF);
  }

  function unitWidth(unit, fs) {
    if (unit === ' ') return { localFs: fs, pitch: Math.max(fs * 0.4, 4), isSpace: true };
    let localFs = fs;
    if (unit.length >= 3) localFs = fs * 0.55;
    else if (unit.length === 2) localFs = fs * 0.72;

    // 文字種でピッチを変える（はみ出し防止の要）
    let pitch;
    if (unit.length === 1) {
      if (isCjk(unit)) {
        pitch = localFs * 1.05;          // 全角はほぼ正方形
      } else {
        // 半角英数・記号は狭め。少し余裕を持たせる
        pitch = Math.max(localFs * 0.62, localFs * 0.55 + 1);
      }
    } else {
      // 複数文字の塊（""で囲んだもの）
      let total = 0;
      for (const ch of unit) {
        total += isCjk(ch) ? localFs * 1.0 : localFs * 0.58;
      }
      pitch = total * 1.02;
    }
    return { localFs, pitch, isSpace: false };
  }

  function drawTextOnBaseline(lineY, maxAscent, type, units) {
    if (!units || !units.length) return [];
    if (type === 'blank') return [];
    const isModel = (type === 'blackSample');
    const color = isModel ? '#333' : 'rgba(170,170,170,0.92)';
    const fs = Math.min(fontPx, Math.max(11, maxAscent * 0.85));
    let x = padX + 2;
    const rightLimit = padX + usableW - 4; // 右端に少し余裕
    let i = 0;
    for (; i < units.length; i++) {
      const unit = units[i];
      const { localFs, pitch, isSpace } = unitWidth(unit, fs);
      // 1文字目でもはみ出すなら置かない（長い塊対策）
      if (x + pitch > rightLimit) break;
      if (!isSpace) {
        const ascent = localFs * 0.78;
        const desc = localFs * 0.32;
        const span = document.createElement('div');
        span.textContent = unit;
        span.style.cssText =
          'position:absolute;left:' + Math.round(x) + 'px;top:' + Math.round(lineY - ascent) + 'px;' +
          'height:' + Math.round(ascent + desc) + 'px;' +
          'display:flex;align-items:flex-start;justify-content:center;' +
          'font-family:' + notePracticeFont() + ';font-weight:bold;font-size:' + localFs + 'px;' +
          'color:' + color + ';line-height:1;pointer-events:none;white-space:nowrap;overflow:hidden;';
        area.appendChild(span);
      }
      x += pitch;
    }
    return units.slice(i);
  }

  // ========== 2本: A/B罫（主線＋中線）==========
  // ★ 最終線は必ず主線。下端に破線・半端線を絶対に残さない。
  if (isSimpleTwo) {
    const style = (typeof valueOf === 'function') ? valueOf('noteRuleStyle', 'A') : 'A';
    let gapMin = style === 'B' ? (isLandscape ? 14 : 11) : (isLandscape ? 18 : 14);
    let gap = Math.max(gapMin, Math.min(style === 'B' ? 16 : 22, h * (style === 'B' ? 0.022 : 0.03)));

    // 下端に十分な余白を残す（破線が最終になって見えないように）
    const BOTTOM_SAFE_2 = Math.max(BOTTOM_SAFE, 6);
    const safeH = Math.max(40, usableH - BOTTOM_SAFE_2);
    let lineCount = Math.max(2, Math.floor(safeH / gap) + 1);
    while (lineCount > 2 && (lineCount - 1) * gap > safeH) lineCount--;
    if (lineCount > 1) gap = safeH / (lineCount - 1);
    if (gap < gapMin) {
      gap = gapMin;
      lineCount = Math.max(2, Math.floor(safeH / gap) + 1);
      while (lineCount > 2 && (lineCount - 1) * gap > safeH) lineCount--;
    }

    const totalH = (lineCount - 1) * gap;
    let y0 = contentTop + Math.max(0, (safeH - totalH) * 0.03);
    if (y0 + (lineCount - 1) * gap > contentBottom - BOTTOM_SAFE_2) {
      y0 = Math.max(contentTop, contentBottom - BOTTOM_SAFE_2 - (lineCount - 1) * gap);
    }

    // まず主線の位置だけ確定させる（破線は後で主線の間にだけ）
    const baselines = [];
    for (let i = 0; i < lineCount; i++) {
      const y = y0 + i * gap;
      if (y > contentBottom - BOTTOM_SAFE_2) break;
      baselines.push(y);
    }
    // 主線を描画
    baselines.forEach(y => drawSolid(y, false));
    // 破線は「隣り合う主線の間」にだけ。最終主線の後ろには絶対に引かない
    for (let i = 0; i < baselines.length - 1; i++) {
      const mid = (baselines[i] + baselines[i + 1]) / 2;
      if (mid < contentBottom - BOTTOM_SAFE_2 - 1) drawDash(mid);
    }

    if (practiceRows.length && baselines.length >= 2) {
      // 文字は上側の主線付近（インデックス1から）に置くのが自然
      let bi = 1;
      for (let r = 0; r < practiceRows.length && bi < baselines.length; r++) {
        let units = practiceRows[r].units.slice();
        const type = practiceRows[r].type;
        if (type === 'blank') { bi++; continue; }
        while (units.length && bi < baselines.length) {
          units = drawTextOnBaseline(baselines[bi], gap * 0.9, type, units);
          bi++;
        }
      }
    }
    return;
  }

  // ========== 3〜5本: まとまり方式 ==========
  // ★ 完結した組だけ。下端に半端な線・孤立線を絶対に出さない。
  let innerGap = Math.max(5, Math.min(9, fontPx * 0.3));
  const betweenMin = Math.max(innerGap * 2.2, fontPx * 1.0, isLandscape ? 18 : 16);
  let groupHeight = innerGap * (linesPerGroup - 1);

  const minGroupSpan = Math.max(groupHeight, fontPx * 1.05);
  if (minGroupSpan > groupHeight) {
    innerGap = Math.max(innerGap, minGroupSpan / Math.max(1, linesPerGroup - 1));
    groupHeight = innerGap * (linesPerGroup - 1);
  }

  // 5本組は特に下端余白を多めに取る
  const BOTTOM_SAFE_G = Math.max(BOTTOM_SAFE, 8);
  const safeH = Math.max(40, usableH - BOTTOM_SAFE_G);

  // 完結した組だけ（groupHeight 分が収まる数）
  let groupCount = 0;
  let between = betweenMin;
  {
    let used = 0;
    while (true) {
      const need = (groupCount === 0) ? groupHeight : (betweenMin + groupHeight);
      if (used + need > safeH + 0.01) break;
      used += need;
      groupCount++;
      if (groupCount > 40) break;
    }
    groupCount = Math.max(1, groupCount);
  }

  if (groupCount > 1) {
    between = (safeH - groupCount * groupHeight) / (groupCount - 1);
    while (groupCount > 1) {
      between = (safeH - groupCount * groupHeight) / (groupCount - 1);
      const th = groupCount * groupHeight + (groupCount - 1) * between;
      if (between >= betweenMin * 0.85 && th <= safeH + 0.5) break;
      groupCount--;
    }
    between = groupCount > 1
      ? (safeH - groupCount * groupHeight) / (groupCount - 1)
      : betweenMin;
  }

  const totalH2 = groupCount * groupHeight + Math.max(0, groupCount - 1) * between;
  let yBase = contentTop + Math.max(0, (safeH - totalH2) * 0.04);

  // 最終組の最終線がセーフゾーンを超えないことを保証
  while (groupCount >= 1) {
    const lastLine = yBase + (groupCount - 1) * (groupHeight + between) + (linesPerGroup - 1) * innerGap;
    if (lastLine <= contentBottom - BOTTOM_SAFE_G) break;
    if (groupCount === 1) {
      yBase = Math.max(contentTop, contentBottom - BOTTOM_SAFE_G - (linesPerGroup - 1) * innerGap);
      break;
    }
    groupCount--;
    between = groupCount > 1
      ? (safeH - groupCount * groupHeight) / (groupCount - 1)
      : betweenMin;
    const th = groupCount * groupHeight + Math.max(0, groupCount - 1) * between;
    yBase = contentTop + Math.max(0, (safeH - th) * 0.04);
  }

  let colorFromBottom = Math.max(0, Math.min(linesPerGroup, (st.note && st.note.colorLineNo) || 0));
  const groupTops = [];
  for (let g = 0; g < groupCount; g++) {
    let groupTop = yBase + g * (groupHeight + between);
    // この組の全線がセーフゾーン内に収まるか最終確認
    const groupLast = groupTop + (linesPerGroup - 1) * innerGap;
    if (groupLast > contentBottom - BOTTOM_SAFE_G) {
      // この組は描かない（前の組で終了）
      break;
    }
    groupTops.push(groupTop);
    for (let i = 0; i < linesPerGroup; i++) {
      const y = groupTop + i * innerGap;
      if (y > contentBottom - BOTTOM_SAFE_G) break;
      const fromBottom = linesPerGroup - i;
      const isAccent = colorFromBottom > 0 && fromBottom === colorFromBottom;
      drawSolid(y, isAccent);
    }
  }

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
