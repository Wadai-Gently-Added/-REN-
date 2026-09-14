/*
 * 一筆箋（縦書き専用）
 * - 列幅は基本固定（文字サイズで伸び縮みしない）
 * - 縦の主線は用紙のほぼ全高（文字の長さで縮まない）
 * - 文字は列の中央。サイズ大でも列幅内に収める
 * - 両端余白固定。入りきらなければ空列から削る
 * - 上はほぼ隙間なし
 */
function practiceFont() {
  return window.__practiceFontFamily || "'Yu Mincho', 'Hiragino Mincho ProN', 'MS Mincho', serif";
}

function getTextUnits() {
  const lines = (typeof parseLines === 'function') ? parseLines(valueOf('txtIn', '')) : [];
  const units = lines.flat();
  return units.length ? units : [''];
}

function renderRuled() { renderLetter(); }

function renderLetter() {
  const st = getState();
  const paper = st.page;
  const canvas = st.canvas;
  const hand = (st.circle && st.circle.hand) || valueOf('handCircle', 'right');

  paper.classList.remove('a4', 'landscape-a4', 'ippitsu');
  paper.classList.add(st.orientation === 'landscape' ? 'landscape-a4' : 'a4', 'ippitsu');
  canvas.innerHTML = '';

  if (st.pTitle) {
    st.pTitle.textContent = '一筆箋（縦書き・便せん）';
    st.pTitle.style.cssText = 'background:transparent;border:none;box-shadow:none;padding:0;margin:0 0 2px 0;';
  }

  const area = document.createElement('div');
  area.className = 'letter-paper';
  area.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;background:#fff;';
  canvas.appendChild(area);

  const page = paper;
  let width = area.clientWidth || (page ? page.clientWidth : 0) || 520;
  let height = area.clientHeight || (page ? page.clientHeight : 0) || 720;

  const units = getTextUnits();
  const nChars = Math.max(1, units.length);
  const fontPxRaw = Math.max(10, Math.min(48, st.fontSizePx || 24));

  // 両端余白は固定
  const padX = Math.max(8, Math.min(20, width * 0.02));
  const padY = Math.max(4, height * 0.01);
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  let types = (typeof getTypes === 'function') ? getTypes().slice() : ['blackSample', 'grayFull', 'blank'];
  if (!types.length) types = ['blackSample', 'grayFull', 'blank'];

  // ============================================================
  // 列幅 = 基本固定（文字サイズ非依存）だが、練習列が多いときは少し詰めて最大限入れる
  // ============================================================
  const BASE_REF_W = 520;
  const BASE_COL_W = 34;
  let colW = BASE_COL_W * (width / BASE_REF_W);
  colW = Math.max(24, Math.min(44, colW)); // 下限を少し下げて列数を稼ぎやすく

  // 希望列数が入らない場合は、列幅を下げてできるだけ収める（極端に小さくはしない）
  let desiredCols = types.length;
  let maxFit = Math.max(1, Math.floor(usableW / colW));
  if (desiredCols > maxFit && desiredCols > 0) {
    const tighter = usableW / desiredCols;
    if (tighter >= 22) { // 22px未満は読みにくくなるので下限
      colW = Math.max(22, Math.min(colW, tighter));
      maxFit = Math.max(1, Math.floor(usableW / colW));
    }
  }

  // 列幅に収まる実効フォント（はみ出し防止）
  const FIT_MAX = colW * 0.78;
  const fontPx = Math.min(fontPxRaw, FIT_MAX);

  let practiceCols = types.length;
  if (practiceCols > maxFit) {
    // 入りきらない分は今は切り捨て（将来：次ページへ送る）
    const nonBlank = types.filter(t => t !== 'blank');
    const blanks = types.filter(t => t === 'blank');
    if (nonBlank.length >= maxFit) {
      types = nonBlank.slice(0, maxFit);
    } else {
      types = nonBlank.concat(blanks.slice(0, Math.max(0, maxFit - nonBlank.length)));
    }
    practiceCols = types.length;
  }

  const colsWidth = colW * practiceCols;
  const offsetX = padX + Math.max(0, (usableW - colsWidth) / 2);
  const gap = colW;

  // 右利き → 見本を左寄り（右手で書く列が右に来る／端でつぶれない）
  // 左利き → 見本を右寄り
  if (hand === 'left') types = types.slice().reverse();

  // 縦ピッチ: 実効フォント基準。行が用紙をはみ出したら圧縮
  let charPitch = Math.max(fontPx * 1.12, 14);
  if (nChars * charPitch > usableH * 0.98) {
    charPitch = Math.max(12, (usableH * 0.98) / nChars);
  }
  const totalLen = nChars * charPitch;

  // 上はほぼ隙間なし
  const contentTop = padY;
  const startY = contentTop;

  // ★ 縦線は用紙のほぼ全高（文字の長さで縮めない＝一筆箋が縮んで見えない）
  const lineH = usableH;
  const LINE_W = 0.65;

  for (let i = 0; i <= practiceCols; i++) {
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:' + (offsetX + i * gap - LINE_W / 2) + 'px;top:' + contentTop + 'px;' +
      'width:' + LINE_W + 'px;height:' + lineH + 'px;' +
      'background:var(--line-main, rgba(184,148,148,0.5));pointer-events:none;';
    area.appendChild(el);
  }

  function drawColGuides(col, kind) {
    if (kind === 'none') return;
    const colLeft = offsetX + col * gap;
    const cx = colLeft + gap / 2;
    const inset = Math.max(2, gap * 0.14);
    // 補助線も全高寄り（文字区間＋余白）
    const guideH = lineH;

    if (kind === 'full' || kind === 'vert') {
      const vmid = document.createElement('div');
      vmid.style.cssText =
        'position:absolute;left:' + (cx - 0.25) + 'px;top:' + startY + 'px;' +
        'width:0.5px;height:' + guideH + 'px;' +
        'background:var(--line-sub, rgba(226,183,183,0.38));pointer-events:none;';
      area.appendChild(vmid);
    }
    if (kind === 'full') {
      // 横補助は文字がある区間だけ（ノートのマス目感）
      for (let r = 0; r < nChars; r++) {
        const yMid = startY + r * charPitch + charPitch / 2;
        const hline = document.createElement('div');
        hline.style.cssText =
          'position:absolute;left:' + (colLeft + inset) + 'px;top:' + (yMid - 0.25) + 'px;' +
          'width:' + (gap - inset * 2) + 'px;height:0.5px;' +
          'background:var(--line-sub, rgba(226,183,183,0.32));pointer-events:none;';
        area.appendChild(hline);
      }
    }
  }

  for (let col = 0; col < practiceCols; col++) {
    const t = types[col];
    if (t === 'blackSample' || t === 'grayFull') drawColGuides(col, 'full');
    else if (t === 'grayVert') drawColGuides(col, 'vert');
  }

  // 文字は列の水平中央。実効サイズは列幅内
  for (let col = 0; col < practiceCols; col++) {
    const t = types[col];
    if (t === 'blank') continue;
    const isModel = (t === 'blackSample');
    const color = isModel ? '#333' : 'rgba(175,175,175,0.9)';
    const cx = offsetX + (col + 0.5) * gap;

    units.forEach((unit, idx) => {
      const span = document.createElement('div');
      span.textContent = unit;
      let fs = fontPx * 0.92;
      if (unit.length >= 3) fs = fontPx * 0.55;
      else if (unit.length === 2) fs = fontPx * 0.68;
      // ボックスは列幅内に収める
      const box = Math.min(colW * 0.92, Math.max(fs * 1.05, charPitch * 0.9));
      span.style.cssText =
        'position:absolute;left:' + (cx - box / 2) + 'px;top:' + (startY + idx * charPitch) + 'px;' +
        'width:' + box + 'px;height:' + charPitch + 'px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'font-family:' + practiceFont() + ';font-weight:bold;font-size:' + fs + 'px;color:' + color + ';' +
        'writing-mode:vertical-rl;text-orientation:upright;pointer-events:none;';
      area.appendChild(span);
    });
  }
}
