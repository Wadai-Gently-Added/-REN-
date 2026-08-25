﻿﻿// 文字 / 行を unit に分解する共通パーサ（円形・マス目・一筆箋 全部使う）
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
    const units = parseUnits(raw.trim());
    if (units.length > 0) out.push(units);
  }
  return out;
}
