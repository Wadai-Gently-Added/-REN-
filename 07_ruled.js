﻿﻿/* ============================================================
 * 一筆箋（罫線）モード描画（07_ruled.js）
 * ============================================================ */
function renderRuled() {
  const st = getState();
  const dir = st.ruled.dir;
  const lineCount = st.ruled.lineCount;
  const gapType   = st.ruled.lineGap;
  const modelPos  = st.ruled.modelPos;
  const canvas = st.canvas;
  const page = st.page;

  page.classList.remove('a4','landscape-a4');
  page.classList.add('ippitsu');

  canvas.innerHTML = '';
  const lines = parseLines(st.text);
  let units = [];
  lines.forEach(u => units = units.concat(u));
  if (units.length === 0) units = [''];

  const isVert = (dir === 'vertical');
  st.pTitle.textContent = isVert ? '一筆箋（縦書き・縦罫）' : '一筆箋（横書き・横罫）';

  const paper = document.createElement('div');
  paper.className = 'ruled-paper';
  canvas.appendChild(paper);
  const padX = 4, padY = 3;

  const gapMap = { tight:.85, normal:1.0, wide:1.25, wider:1.55 };
  const gapFactor = gapMap[gapType] || 1.0;

  const usableW = 100 - padX*2, usableH = 100 - padY*2;
  const baseStep = isVert ? usableW / (lineCount + 0.5) : usableH / (lineCount + 0.5);
  const step = baseStep * gapFactor;
  const totalSpan = step * (lineCount - 1);
  const startOffset = isVert ? padX + (usableW - totalSpan)/2 : padY + (usableH - totalSpan)/2;

  const fontScaleDefault = isVert ? step * 0.72 : step * 0.68;
  const fontSize = fontScaleDefault * (0.5 + st.fontSizePct * 0.01);

  for (let i = 0; i < lineCount; i++) {
    const pos = startOffset + i * step;
    const line = document.createElement('div'); line.className = 'ruled-line';
    if (isVert) { line.style.left = pos+'%'; line.style.top = padY+'%'; line.style.width='1.2px'; line.style.height=usableH+'%'; }
    else        { line.style.top = pos+'%'; line.style.left = padX+'%'; line.style.height='1.2px'; line.style.width=usableW+'%'; }
    paper.appendChild(line);
    const center = document.createElement('div'); center.className = 'ruled-center';
    if (isVert) { center.style.left = (pos+0.15)+'%'; center.style.top = padY+'%'; center.style.width='0.6px'; center.style.height=usableH+'%'; center.style.opacity='0.5'; }
    else        { center.style.top = (pos+0.15)+'%'; center.style.left = padX+'%'; center.style.height='0.6px'; center.style.width=usableW+'%'; center.style.opacity='0.5'; }
    paper.appendChild(center);
  }

  const textStr = units.join('');
  if (modelPos === 'none' || !textStr) return;
  const availLen = isVert ? usableH : usableW;
  const charStep = Math.min(fontSize * 1.15, availLen / Math.max(units.length, 1) * 0.95);
  function placeTextOnLine(lineIndex, type) {
    const pos = startOffset + lineIndex * step;
    let offset = isVert ? padY + 2 : padX + 2;
    units.forEach((unit) => {
      const span = document.createElement('div');
      span.className = 'ruled-text ' + type;
      span.textContent = unit;
      span.style.fontSize = (unit.length >= 3 ? fontSize*0.7 : unit.length===2 ? fontSize*0.85 : fontSize) + 'px';
      if (isVert) {
        span.style.left = (pos - fontSize*0.35) + '%';
        span.style.top = offset + '%';
        span.style.writingMode = 'vertical-rl';
        span.style.textOrientation = 'upright';
      } else {
        span.style.top = (pos - fontSize*0.4) + '%';
        span.style.left = offset + '%';
      }
      paper.appendChild(span);
      offset += (charStep / (isVert ? usableH : usableW) * 100) * (unit.length > 1 ? unit.length * 0.7 : 1);
    });
  }
  if (modelPos === 'first') placeTextOnLine(0,'model');
  else if (modelPos === 'every') { for (let i = 0; i < lineCount; i++) placeTextOnLine(i, i===0 ? 'model' : 'trace'); }
}
