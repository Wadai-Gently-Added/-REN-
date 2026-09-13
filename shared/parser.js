// 文字 / 行を unit に分解する共通パーサ
// - 改行 → 別行
// - 半角/全角スペース → 1つにつきスペーサー1つ（連続もそのまま数える）
// - "..." / '...' → 一塊
function parseUnits(str) {
  const units = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === '"' || str[i] === "'") {
      const quote = str[i]; i++;
      let content = '';
      while (i < str.length && str[i] !== quote) { content += str[i]; i++; }
      if (i < str.length) i++;
      if (content.length > 0) units.push(content);
    } else if (str[i] === ' ' || str[i] === '\u3000') {
      units.push(' ');
      i++;
    } else {
      units.push(str[i]); i++;
    }
  }
  return units;
}
function parseLines(str) {
  const rawLines = str.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
  const out = [];
  for (const raw of rawLines) {
    const units = parseUnits(raw.replace(/^\s+|\s+$/g, ''));
    if (units.length > 0) out.push(units);
  }
  return out;
}
