﻿﻿/* ============================================================
 * 05_blocks.js — 練習セット構成（⑧-②カスタム5種、3モード共通）
 * getTypes() を一本化：マス目・一筆箋・丸形 全部この関数を使う
 * ============================================================ */
const TYPE_CLASSES = {
  blackSample: 'model',
  grayFull:    'trace',
  grayVert:    'trace trace-vert',
  grayNone:    'trace trace-none',
  blank:       'blank',
};

function getTypes() {
  const type = byId('setType').value;
  let black, grayFull, grayVert, grayNone, empty;
  if (type === 'standard') { black=1; grayFull=1; grayVert=0; grayNone=0; empty=1; }
  else if (type === 'many'){ black=1; grayFull=2; grayVert=0; grayNone=0; empty=5; }
  else {
    black    = Math.max(0, parseInt(byId('cntBlack').value,    10) || 0);
    grayFull = Math.max(0, parseInt(byId('cntGrayFull').value, 10) || 0);
    grayVert = Math.max(0, parseInt(byId('cntGrayVert').value, 10) || 0);
    grayNone = Math.max(0, parseInt(byId('cntGrayNone').value, 10) || 0);
    empty    = Math.max(0, parseInt(byId('cntEmpty').value,    10) || 0);
  }
  if (black+grayFull+grayVert+grayNone+empty === 0) empty = 1;
  const types = [];
  for (let i=0;i<black;i++)    types.push('blackSample');
  for (let i=0;i<grayFull;i++) types.push('grayFull');
  for (let i=0;i<grayVert;i++) types.push('grayVert');
  for (let i=0;i<grayNone;i++) types.push('grayNone');
  for (let i=0;i<empty;i++)    types.push('blank');
  return types;
}

function createSection(linesData, types) {
  const section = document.createElement('div');
  section.className = 'letter-section';
  types.forEach(type => {
    const packageBox = document.createElement('div');
    packageBox.className = 'handwriting-package';
    linesData.forEach(chunks => {
      chunks.forEach(chunk => {
        const line = document.createElement('div');
        line.className = 'text-line';
        chunk.forEach(unit => {
          const cell = document.createElement('div');
          cell.className = 'cell ' + (TYPE_CLASSES[type] || 'blank');
          if (unit.length >= 3) cell.classList.add('multi3');
          else if (unit.length === 2) cell.classList.add('multi2');
          if (type !== 'blank') cell.innerHTML = `<span>${unit}</span>`;
          line.appendChild(cell);
        });
        packageBox.appendChild(line);
      });
    });
    section.appendChild(packageBox);
  });
  return section;
}

function calcFitCount(available, itemSize, gap) {
  if (itemSize <= 0 || available < itemSize) return 0;
  return Math.floor((available + gap) / (itemSize + gap));
}
