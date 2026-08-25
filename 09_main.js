/* ============================================================
 * 美文字練習帳 統合版 v3.2.0 (2026-08-24) — 司令塔
 * 修正点: fitPageToViewport() を導入し、レンダリング前に
 * ページ幅・円形SVG幅を必ず確定させる (空0px問題を一掃)
 * ============================================================ */
function toggleMenu() {
  const side = byId('side'), tBtn = byId('tBtn');
  side.classList.toggle('is-hidden');
  tBtn.textContent = side.classList.contains('is-hidden') ? 'メニューを開く' : 'メニューを閉じる';
  setTimeout(render, 380);
}

/* ① プレビュー領域の表示状態にあわせ、ページ寸法を確定する */
function fitPageToViewport() {
  const preview = byId('previewArea');
  if (!preview) return;
  const previewW = preview.clientWidth  - 32;   // padding 16*2
  const previewH = preview.clientHeight - 32;
  if (previewW <= 0) return;

  const mode = byId('paperMode').value;
  let ratio = 210/297;
  if (mode === 'ippitsu-ruled') ratio = 84/177;
  // 円形は .page-container (a4)で同じ 210/297

  let w = previewW, h = w / ratio;
  if (h > previewH) { h = previewH; w = h * ratio; }
  w = Math.max(160, w);
  h = Math.max(160, h);

  if (mode === 'circle') {
    const c = byId('circlePage');
    if (c) { c.style.width = w + 'px'; c.style.height = h + 'px'; }
  } else {
    const p = byId('pageContainer');
    if (p) { p.style.width = w + 'px'; p.style.height = h + 'px'; }
  }
}

const SHAPE_HTML = {
  'a4-grid': () => `
    <div class="label"><span>折り返し文字数</span>
      <select id="colsPerRow" onchange="render()">
        ${[0,1,2,3,4,5,6,7,8,10].map(n=>`<option value="${n}" ${n===6?'selected':''}>${n===0?'折り返しなし':n+'文字'}</option>`).join('')}
      </select>
    </div>
    <div class="label"><span>書字方向</span>
      <select id="wMode" onchange="setAvailability();render()">
        <option value="vertical">縦書き</option>
        <option value="horizontal" selected>横書き</option>
      </select>
    </div>`,
  'ippitsu-ruled': () => `
    <div class="label"><span>書字方向</span>
      <select id="ruledDir" onchange="render()">
        <option value="vertical" selected>縦書き（縦罫）</option>
        <option value="horizontal">横書き（横罫）</option>
      </select>
    </div>
    <div class="label"><span>罫線の本数</span>
      <select id="lineCount" onchange="render()">
        ${[3,4,5,6,7,8,10].map(n=>`<option value="${n}" ${n===5?'selected':''}>${n}本</option>`).join('')}
      </select>
    </div>
    <div class="label"><span>行間</span>
      <select id="lineGap" onchange="render()">
        <option value="tight">詰める</option><option value="normal" selected>普通</option>
        <option value="wide">少し開ける</option><option value="wider">広めに開ける</option>
      </select>
    </div>
    <div class="label"><span>見本の置き方</span>
      <select id="modelPos" onchange="render()">
        <option value="first" selected>最初の1本に見本</option>
        <option value="none">見本なし</option>
        <option value="every">すべての罫線に薄く見本</option>
      </select>
    </div>`,
  'circle': () => `
    <div class="label"><span>形状</span>
      <select id="shapeSelect" onchange="render()">
        <option value="circle">円形（360度）</option>
        <option value="clock" selected>時計（12時位置）</option>
        <option value="semi">半円</option>
        <option value="arch">アーチ</option>
        <option value="diag-down">右下がり45°</option>
        <option value="diag-up">右上がり45°</option>
      </select>
    </div>`,
};

function onModeChange() {
  const mode = byId('paperMode').value;
  byId('modeShapeBox').innerHTML = (SHAPE_HTML[mode] || SHAPE_HTML['a4-grid'])();
  setAvailability();
  render();
}

function setAvailability() {
  const mode = byId('paperMode').value;
  const wMode = byId('wMode') ? byId('wMode').value : 'horizontal';

  const enabledMap = {
    'txtIn':             true,
    'paperOrientation':  (mode === 'a4-grid'),
    'paperMode':         true,
    'modeShapeBox':      true,
    'commonFontSize':    true,
    'commonFontSizeNum': true,
    'diameterRange':     (mode === 'circle'),
    'diameterNum':       (mode === 'circle'),
    'rotationModeSelect':(mode === 'circle'),
    'handCircle':        (mode === 'circle') || (mode === 'a4-grid' && wMode === 'vertical'),
    'packDir':           (mode === 'circle'),
  };

  Object.keys(enabledMap).forEach(id => {
    const el = byId(id);
    if (!el) return;
    const wrap = el.closest('.config-row,.set-options') || el;
    wrap.classList.toggle('disabled', !enabledMap[id]);
    el.disabled = !enabledMap[id];
  });

  byId('pageContainer').style.display = (mode === 'circle') ? 'none' : '';
  byId('circlePage').style.display    = (mode === 'circle') ? '' : 'none';
}

function onSetTypeChange() {
  const v = byId('setType').value;
  const grid = byId('repeatGrid');
  const cardIds = ['cntBlack','cntGrayFull','cntGrayVert','cntGrayNone','cntEmpty'];
  if (v === 'custom') {
    grid.classList.add('show');
    cardIds.forEach(id => { const el = byId(id); if (el) el.disabled = false; });
    byId('repeatRow').classList.remove('disabled');
  } else {
    grid.classList.remove('show');
    cardIds.forEach(id => { const el = byId(id); if (el) el.disabled = true; });
    byId('repeatRow').classList.add('disabled');
    if (v === 'standard') { cardIds.forEach((id,i) => { const el = byId(id); if (el) el.value = [1,1,0,0,1][i]; }); }
    else if (v === 'many'){ cardIds.forEach((id,i) => { const el = byId(id); if (el) el.value = [1,2,0,0,5][i]; }); }
  }
  render();
}

function onCommonFontSize(value) {
  const val = Math.max(0, Math.min(100, parseFloat(value) || 100));
  byId('commonFontSize').value = val;
  byId('commonFontSizeNum').value = val;
  const diameter = Math.round(36 + (val / 100) * 46);
  byId('diameterRange').value = diameter;
  byId('diameterNum').value   = diameter;
  render();
}
function onDiameterChange(value) {
  const d = Math.max(30, Math.min(100, parseFloat(value) || 60));
  byId('diameterRange').value = d;
  byId('diameterNum').value   = d;
  const box = d * BOX_RATIO;
  const val = Math.max(0, Math.min(100, Math.round((box - 8) * 10)));
  byId('commonFontSize').value    = val;
  byId('commonFontSizeNum').value = val;
  render();
}

/* renderは rAF 経由で layout確定後に走らせる */
function render() {
  const mode = byId('paperMode').value;
  requestAnimationFrame(() => {
    fitPageToViewport();
    if (mode === 'a4-grid')            renderGrid();
    else if (mode === 'ippitsu-ruled') renderRuled();
    else                               renderCircle();
  });
}

window.onload = () => {
  byId('setType').value = 'many';
  onModeChange();
  onSetTypeChange();
};
window.addEventListener('resize', () => {
  /* リサイズ時は寸法再計算→render */
  clearTimeout(window.__rT);
  window.__rT = setTimeout(render, 80);
});
