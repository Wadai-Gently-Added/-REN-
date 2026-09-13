/* ⓪ フォント選択。
 * エンドユーザーはプルダウンから選ぶだけ。
 * フォントファイルを追加したい場合は制作者がこのファイルと index.html の option を編集する。
 * 将来の有料オプション用に PREMIUM_FONTS_ENABLED フラグを用意してある。
 */
window.__practiceFontFamily = "'Yu Mincho', 'Hiragino Mincho ProN', 'MS Mincho', serif";

// 有料フォントを解放するときは true に変更（またはライセンスチェック後に true）
const PREMIUM_FONTS_ENABLED = false;

const FONT_PRESETS = {
  default: {
    family: "'Yu Mincho', 'Hiragino Mincho ProN', 'MS Mincho', serif",
    label: "標準（游明朝 / ヒラギノ明朝）"
  },
  serif: {
    family: "serif",
    label: "明朝体寄り（serif）"
  },
  sans: {
    family: "sans-serif",
    label: "ゴシック寄り（sans-serif）"
  },
  noto: {
    family: "'Noto Serif JP', 'Yu Mincho', serif",
    label: "Noto Serif JP（可能な環境）"
  }
  // 制作者が追加する例:
  // premium1: { family: "'MyPremiumFont', serif", label: "有料フォントA", premium: true }
};

function onFontSelectChange(value) {
  const preset = FONT_PRESETS[value] || FONT_PRESETS.default;
  if (preset.premium && !PREMIUM_FONTS_ENABLED) {
    const status = byId('fontStatus');
    if (status) status.textContent = 'このフォントは有料オプションです';
    return;
  }
  window.__practiceFontFamily = preset.family;
  document.documentElement.style.setProperty('--practice-font', window.__practiceFontFamily);
  const status = byId('fontStatus');
  if (status) status.textContent = preset.label + ' を使用中';
  if (typeof render === 'function') render();
}

// 後方互換のため残す（ファイル選択UIは削除済み）
async function handleFontFiles(files) {
  console.warn('Font file upload is disabled for end users. Use the dropdown instead.');
}
