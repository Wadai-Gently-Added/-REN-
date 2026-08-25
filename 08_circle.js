﻿﻿/* ============================================================
 * 円形美文字（08_circle.js）— ⑥利き手は単一ID handCircle、⑧は getTypes() を共用
 * ============================================================ */
function getShapeBounds(shape, radius, boxSize) {
  const half = boxSize/2, extra = 5, extent = half*1.45;
  let angles = [];
  if (shape === 'circle' || shape === 'clock') for (let a=0;a<360;a+=30) angles.push(a);
  else if (shape === 'semi')      for (let a=180;a<=360;a+=20) angles.push(a);
  else if (shape === 'arch')      for (let a=-150;a<=-30;a+=20) angles.push(a);
  else if (shape === 'diag-down') for (let a=-45;a<=45;a+=10) angles.push(a);
  else if (shape === 'diag-up')   for (let a=135;a<=225;a+=10) angles.push(a);

  let minX=0,maxX=0,minY=0,maxY=0;
  angles.forEach(deg => {
    const rad = deg*Math.PI/180;
    const cx = radius*Math.cos(rad), cy = radius*Math.sin(rad);
    minX=Math.min(minX,cx-extent); maxX=Math.max(maxX,cx+extent);
    minY=Math.min(minY,cy-extent); maxY=Math.max(maxY,cy+extent);
    const ox=(radius+half+extra)*Math.cos(rad), oy=(radius+half+extra)*Math.sin(rad);
    minX=Math.min(minX,ox); maxX=Math.max(maxX,ox);
    minY=Math.min(minY,oy); maxY=Math.max(maxY,oy);
  });
  minX=Math.min(minX,-3); maxX=Math.max(maxX,3);
  minY=Math.min(minY,-3); maxY=Math.max(maxY,3);
  return {minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY,centerX:(minX+maxX)/2,centerY:(minY+maxY)/2};
}

function createCircleBlock(units, type, shape, rotationMode, cx, cy, radius, boxSize, shiftX, shiftY) {
  const totalUnits = units.length;
  const r_out = radius + (boxSize/2), r_in = radius - (boxSize/2);
  let startDeg=0, endDeg=0, isClock = (shape === 'clock');
  if (shape === 'circle' || shape === 'clock') { startDeg=-90; endDeg=270; }
  else if (shape === 'semi')      { startDeg=180; endDeg=360; }
  else if (shape === 'arch')      { startDeg=-150; endDeg=-30; }
  else if (shape === 'diag-down') { startDeg=-45;  endDeg=45;  }
  else if (shape === 'diag-up')   { startDeg=135;  endDeg=225; }
  const divisor = isClock ? 12 : ((shape === 'circle') ? Math.max(totalUnits,1) : (totalUnits>1 ? totalUnits-1 : 1));
  const degRange = endDeg - startDeg;
  const lineMain='rgba(184,148,148,0.65)', lineSub='rgba(226,183,183,0.55)';
  const txtColor = type==='sample' ? '#333' : (type==='trace' ? 'rgba(180,180,180,0.85)' : 'transparent');
  let h = `<g transform="translate(${cx - shiftX},${cy - shiftY})">`;
  if (shape === 'circle' || shape === 'clock') {
    h += `<circle cx="0" cy="0" r="${r_out}" fill="none" stroke="${lineMain}" stroke-width="0.35"/>`;
    h += `<circle cx="0" cy="0" r="${r_in}"  fill="none" stroke="${lineMain}" stroke-width="0.35"/>`;
    h += `<circle cx="0" cy="0" r="${radius}" fill="none" stroke="${lineSub}" stroke-width="0.3" stroke-dasharray="1,1"/>`;
  } else {
    const largeArc = Math.abs(degRange)>180?1:0, sweep = degRange>=0?1:0;
    const p=(r,deg)=>{ const rad=deg*Math.PI/180; return {x:r*Math.cos(rad),y:r*Math.sin(rad)}; };
    const p1o=p(r_out,startDeg), p2o=p(r_out,endDeg);
    const p1i=p(r_in,startDeg),  p2i=p(r_in,endDeg);
    h += `<path d="M ${p1o.x} ${p1o.y} A ${r_out} ${r_out} 0 ${largeArc} ${sweep} ${p2o.x} ${p2o.y}" fill="none" stroke="${lineMain}" stroke-width="0.35"/>`;
    h += `<path d="M ${p1i.x} ${p1i.y} A ${r_in} ${r_in} 0 ${largeArc} ${sweep} ${p2i.x} ${p2i.y}" fill="none" stroke="${lineMain}" stroke-width="0.35"/>`;
    h += `<path d="M ${(radius*Math.cos(startDeg*Math.PI/180))} ${(radius*Math.sin(startDeg*Math.PI/180))} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${(radius*Math.cos(endDeg*Math.PI/180))} ${(radius*Math.sin(endDeg*Math.PI/180))}" fill="none" stroke="${lineSub}" stroke-width="0.3" stroke-dasharray="1,1"/>`;
  }
  const placeCount = isClock ? 12 : totalUnits;
  for (let index=0; index<placeCount; index++) {
    const useIndex = (shape === 'diag-up') ? (totalUnits-1-index) : index;
    const currentDeg = startDeg + (degRange/divisor) * (isClock ? index : useIndex);
    const rad = currentDeg*Math.PI/180;
    const x = radius*Math.cos(rad), y = radius*Math.sin(rad);
    h += `<line x1="0" y1="0" x2="${(r_out+3.5)*Math.cos(rad)}" y2="${(r_out+3.5)*Math.sin(rad)}" stroke="${lineSub}" stroke-width="0.2" stroke-dasharray="0.5,1"/>`;
    const unit = units[index] || '';
    const isSpace = (unit === ' ' || unit === '\u3000' || unit === '');
    const relativeDeg = currentDeg + 90;
    let finalRotation = 0;
    if (rotationMode === 'center-in')  finalRotation = relativeDeg + 180;
    else if (rotationMode === 'center-out') finalRotation = relativeDeg;
    const fontSize = unit.length >= 3 ? boxSize*0.42 : (unit.length === 2 ? boxSize*0.48 : boxSize*0.55);
    h += `<g transform="translate(${x},${y}) rotate(${finalRotation})">`;
    h += `<rect x="${-boxSize/2}" y="${-boxSize/2}" width="${boxSize}" height="${boxSize}" fill="rgba(255,255,255,0.55)" stroke="none"/>`;
    h += `<line x1="${-boxSize/2}" y1="${-boxSize/2}" x2="${boxSize/2}" y2="${-boxSize/2}" stroke="${lineMain}" stroke-width="0.3"/>`;
    h += `<line x1="${-boxSize/2}" y1="${boxSize/2}"  x2="${boxSize/2}" y2="${boxSize/2}"  stroke="${lineMain}" stroke-width="0.3"/>`;
    h += `<line x1="${-boxSize/2}" y1="0" x2="${boxSize/2}" y2="0" stroke="${lineSub}" stroke-width="0.3" stroke-dasharray="1,1"/>`;
    if (type !== 'practice' && !isSpace) {
      h += `<text x="0" y="0" dy="0.1em" font-size="${fontSize}" font-family="'Hiragino Mincho ProN', 'Yu Mincho', serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${txtColor}">${unit}</text>`;
    }
    h += `</g>`;
  }
  h += `</g>`;
  return h;
}

/* renderCircle は getTypes()（05_blocks.js）をそのまま使う → ⑧-②カスタムが反映される */
function renderCircle() {
  const st = getState();
  const svg = byId('mainSvg');
  const shape = st.circle.shape;
  const rotationMode = st.circle.rotationMode;
  const hand = st.circle.hand;
  const packDir = st.circle.packDir;
  const diameter = parseFloat(byId('diameterRange').value) || 60;
  const boxSize = Math.max(8, Math.min(18, Math.round((diameter * BOX_RATIO) * 10)/10));

  svg.innerHTML = '';
  const text = st.text;
  const units = parseUnits(text);
  if (units.length === 0 && shape !== 'clock') return;

  const radius = diameter/2;
  const bounds = getShapeBounds(shape, radius, boxSize);

  const pad = Math.max(2.2, Math.min(4.5, diameter * 0.055));
  const minGap = Math.max(2.0, Math.min(4.0, diameter * 0.05));
  const blockW = bounds.width + pad, blockH = bounds.height + pad;
  const shiftX = bounds.centerX, shiftY = bounds.centerY;

  const pageW = 210, pageH = 297;
  const baseMargin = diameter >= 80 ? 11 : (diameter >= 65 ? 9.5 : 8);
  const margin = baseMargin;
  const titleH = 15;
  const usableW = pageW - margin*2;
  const usableH = pageH - margin*2 - titleH;

  let cols = Math.max(1, Math.floor((usableW + minGap) / (blockW + minGap)));
  let rows = Math.max(1, Math.floor((usableH + minGap) / (blockH + minGap)));
  if (blockW > usableW * 0.92) cols = 1;
  if (blockH > usableH * 0.92) rows = 1;

  const types = getTypes();
  const useCount = types.length;

  const isVerticalPack = (packDir === 'vertical');
  let actualCols, actualRows;
  if (isVerticalPack) {
    actualRows = Math.min(rows, useCount);
    actualCols = Math.min(cols, Math.ceil(useCount / actualRows));
  } else {
    actualCols = Math.min(cols, useCount);
    actualRows = Math.min(rows, Math.ceil(useCount / actualCols));
  }

  const totalBlockW = actualCols * blockW;
  const remainW = usableW - totalBlockW;
  const gapX = actualCols > 1 ? Math.max(minGap, remainW / (actualCols + 1)) : 0;
  const sideMarginX = actualCols > 1 ? gapX : Math.max(0, (usableW - blockW) / 2);

  const totalBlockH = actualRows * blockH;
  const remainH = usableH - totalBlockH;
  const gapY = actualRows > 1 ? Math.max(minGap, remainH / (actualRows + 1)) : 0;
  const sideMarginY = actualRows > 1 ? gapY : Math.max(0, (usableH - blockH) / 2);

  const offsetX = margin + sideMarginX;
  const offsetY = margin + titleH + sideMarginY;

  let h = `<defs><radialGradient id="sakuraGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff5f7"/><stop offset="100%" stop-color="#ffe8ec"/></radialGradient></defs>`;
  h += `<rect width="210" height="297" fill="url(#sakuraGrad)"/>`;
  const shapeNames = { circle:'円形', clock:'時計', semi:'半円', arch:'アーチ', 'diag-down':'右下がり45°', 'diag-up':'右上がり45°' };
  h += `<text x="105" y="11" font-size="5.1" font-family="'Hiragino Mincho ProN', serif" font-weight="bold" text-anchor="middle" fill="#555">${shapeNames[shape]}美文字練習帳（直径${diameter}）</text>`;
  h += `<line x1="20" y1="14" x2="190" y2="14" stroke="rgba(184,148,148,0.5)" stroke-width="0.35"/>`;

  for (let i=0; i<useCount; i++) {
    let row, col;
    if (isVerticalPack) {
      col = Math.floor(i / actualRows);
      row = i % actualRows;
      if (hand === 'right') col = (actualCols - 1) - col;
    } else {
      row = Math.floor(i / actualCols);
      col = i % actualCols;
      if (hand === 'right') col = (actualCols - 1) - col;
    }
    if (col < 0 || col >= actualCols || row < 0 || row >= actualRows) continue;
    const cx = offsetX + col * (blockW + gapX) + blockW / 2;
    const cy = offsetY + row * (blockH + gapY) + blockH / 2;
    h += createCircleBlock(units, types[i], shape, rotationMode, cx, cy, radius, boxSize, shiftX, shiftY);
  }
  svg.innerHTML = h;
}
