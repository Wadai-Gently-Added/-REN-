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
  let ratio = 210 / 297;
  if ((mode === 'a4-grid' || mode === 'ippitsu-letter' || mode === 'ruled-note') && valueOf('paperOrientation', 'portrait') === 'landscape') ratio = 297 / 210;
  // 丸形はA4縦のSVGページ

  let w = previewW, h = w / ratio;
  if (h > previewH) { h = previewH; w = h * ratio; }
  w = Math.max(160, w);
  h = Math.max(160, h);

  if (mode === 'circle') {
    const host = byId('circlePagesHost');
    if (host) { host.style.width = '100%'; host.style.height = '100%'; }
    const c = byId('circlePage');
    if (c) { c.style.width = w + 'px'; c.style.height = h + 'px'; }
    // 追加ページも同じサイズに
    if (host) {
      host.querySelectorAll('.page-container').forEach(el => {
        el.style.width = w + 'px';
        el.style.height = h + 'px';
      });
    }
  } else {
    const host = byId('pagesHost');
    if (host) { host.style.width = '100%'; host.style.height = '100%'; }
    const pg = byId('pageContainer');
    if (pg) { pg.style.width = w + 'px'; pg.style.height = h + 'px'; }
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
  'ippitsu-letter': () => `
    <div class="label"><span>書字方向</span>
      <select id="ruledDir" onchange="render()" disabled>
        <option value="vertical" selected>縦書き専用（便せん）</option>
      </select>
    </div>
    <div class="shape-note">一筆箋は縦書き専用です。縦線と縦線の間に書きます。<br>列幅は固定（文字サイズでは変わりません）。<br><b>推奨文字サイズ: 22〜28</b>（最大48でも列内に収まるよう自動調整）。横書きの罫線は「罫線ノート」を使ってください。</div>`,
  'ruled-note': () => `
    <div class="label"><span>ノート方向</span>
      <select id="noteDir" disabled>
        <option value="horizontal" selected>横書き固定</option>
      </select>
    </div>
    <div class="label"><span>1まとまりの線の本数</span>
      <select id="noteLineCount" onchange="onNoteLineCountChange()">
        <option value="2">2本（普通ノート・A/B罫）</option>
        <option value="3">3本</option>
        <option value="4">4本</option>
        <option value="5" selected>5本（英語ノート・五線寄り）</option>
      </select>
    </div>
    <div class="label" id="noteRuleStyleWrap" style="display:none"><span>罫の間隔（普通ノート）</span>
      <select id="noteRuleStyle" onchange="render()">
        <option value="A" selected>A罫（広め）</option>
        <option value="B">B罫（狭め）</option>
      </select>
    </div>
    <div class="label" id="colorLineNoWrap"><span>色付き線（下から何本目）</span>
      <select id="colorLineNo" onchange="render()"></select>
    </div>
    <div class="label" id="colorLineWrap"><span>色付き線の色</span>
      <select id="colorLine" onchange="render()">
        <option value="#c45c6a" selected>ローズ</option>
        <option value="#d4a017">ゴールド</option>
        <option value="#4a7c59">グリーン</option>
        <option value="#3d6b9a">ブルー</option>
        <option value="#6b5b8c">パープル</option>
        <option value="#333333">ダーク</option>
      </select>
    </div>
    <div class="shape-note">横書き固定。「本数」はページ全体ではなく <b>1まとまりの線の本数</b>。<br>
<b>2本</b>＝普通ノート（A罫広め／B罫狭め・色線なし）。一筆箋の横版イメージ。<br>
<b>3〜5本</b>＝まとまり練習。色付き線は「その本数の範囲内」だけ選べます。</div>`,
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


function rebuildColorLineOptions(n) {
  const sel = byId('colorLineNo');
  if (!sel) return;
  const prev = sel.value;
  // 元の並び: 下からn本目 → … → 1本目 → なし（降順）
  const opts = [];
  for (let i = n; i >= 1; i--) {
    const label = (i === 2) ? ('下から' + i + '本目（英語ノート風）') : ('下から' + i + '本目');
    opts.push('<option value="' + i + '">' + label + '</option>');
  }
  opts.push('<option value="0">なし</option>');
  sel.innerHTML = opts.join('');
  const prevN = parseInt(prev, 10);
  if (prevN > 0 && prevN <= n) sel.value = String(prevN);
  else if (n >= 2) sel.value = '2';
  else sel.value = '0';
}

function onNoteLineCountChange() {
  updateNoteColorUI();
  render();
}

function updateNoteColorUI() {
  const mode = byId('paperMode') ? byId('paperMode').value : '';
  const nEl = byId('noteLineCount');
  const n = nEl ? (parseInt(nEl.value, 10) || 5) : 5;
  const isNote = (mode === 'ruled-note');
  const isSimpleTwo = isNote && n === 2;

  const ruleWrap = byId('noteRuleStyleWrap');
  if (ruleWrap) ruleWrap.style.display = isSimpleTwo ? '' : 'none';

  ['colorLineNoWrap', 'colorLineWrap'].forEach(id => {
    const el = byId(id);
    if (!el) return;
    el.style.display = (isNote && !isSimpleTwo) ? '' : 'none';
  });

  if (isNote && !isSimpleTwo) {
    rebuildColorLineOptions(n);
  } else {
    const c = byId('colorLineNo');
    if (c) c.value = '0';
  }
}

function setAvailability() {
  const mode = byId('paperMode').value;
  const wMode = byId('wMode') ? byId('wMode').value : 'horizontal';

  const enabledMap = {
    'txtIn':             true,
    'paperOrientation':  (mode !== 'circle'),
    'paperMode':         true,
    'modeShapeBox':      true,
    'commonFontSize':    true,
    'commonFontSizeNum': true,
    'diameterRange':     (mode === 'circle'),
    'diameterNum':       (mode === 'circle'),
    'rotationModeSelect':(mode === 'circle'),
    'handCircle':        (mode === 'circle') || (mode === 'ippitsu-letter') || (mode === 'a4-grid' && wMode === 'vertical'),
    'packDir':           (mode === 'circle'),
  };

  Object.keys(enabledMap).forEach(id => {
    const el = byId(id);
    if (!el) return;
    const wrap = el.closest('.config-row,.set-options') || el;
    wrap.classList.toggle('disabled', !enabledMap[id]);
    el.disabled = !enabledMap[id];
  });

  const pagesHost = byId('pagesHost');
  const circleHost = byId('circlePagesHost');
  if (pagesHost) pagesHost.style.display = (mode === 'circle') ? 'none' : '';
  if (circleHost) circleHost.style.display = (mode === 'circle') ? '' : 'none';
  // 旧ID互換
  const pc = byId('pageContainer');
  const cp = byId('circlePage');
  if (pc) pc.style.display = (mode === 'circle') ? 'none' : '';
  if (cp) cp.style.display = (mode === 'circle') ? '' : 'none';

  const hint = byId('fontSizeHint');
  if (hint) {
    if (mode === 'ippitsu-letter') {
      hint.style.display = '';
      hint.innerHTML = '一筆箋の推奨: <b>22〜28</b>（列幅固定・文字は列の中央。大きくしても列からはみ出しにくい）';
    } else if (mode === 'ruled-note') {
      hint.style.display = '';
      hint.textContent = '罫線ノート: 線間隔に合わせて 18〜28 が扱いやすいです';
    } else if (mode === 'a4-grid') {
      hint.style.display = '';
      hint.textContent = 'マス目: セルサイズに連動。24前後が無難です';
    } else {
      hint.style.display = '';
      hint.textContent = '丸形: 円直径と連動します。見やすさ優先で調整を';
    }
  }
  updateNoteColorUI();
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
  const parsed = parseFloat(value);
  const val = Number.isFinite(parsed) ? Math.max(10, Math.min(48, parsed)) : 24;
  byId('commonFontSize').value = val;
  byId('commonFontSizeNum').value = val;
  /* 丸形も同じ実寸関係を維持する。 */
  const diameter = Math.max(30, Math.min(120, Math.round(val / BOX_RATIO)));
  byId('diameterRange').value = diameter;
  byId('diameterNum').value = diameter;
  render();
}
function onDiameterChange(value) {
  const parsed = parseFloat(value);
  const d = Number.isFinite(parsed) ? Math.max(30, Math.min(120, parsed)) : 60;
  byId('diameterRange').value = d;
  byId('diameterNum').value = d;
  const val = Math.max(10, Math.min(48, Math.round(d * BOX_RATIO)));
  byId('commonFontSize').value = val;
  byId('commonFontSizeNum').value = val;
  render();
}

/* renderは rAF 経由で layout確定後に走らせる */
function render() {
  const mode = byId('paperMode').value;
  requestAnimationFrame(() => {
    fitPageToViewport();
    if (mode === 'a4-grid') renderGrid();
    else if (mode === 'ippitsu-letter') renderRuled();
    else if (mode === 'ruled-note') renderRuledNote();
    else renderCircle();
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
