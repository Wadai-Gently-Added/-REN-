# 美文字練習帳 統合版 v3.4.1

## フォルダ構成

```
├── index.html
├── styles.css
├── shared/                 … 全モード共通
│   ├── parser.js
│   ├── practice-blocks.js
│   ├── font-loader.js
│   └── app.js
└── modes/                  … モード描画（互いに非依存）
    ├── grid-renderer.js    … 通常マス目
    ├── letter-renderer.js  … 一筆箋（縦書き専用・便せん）
    ├── note-renderer.js    … 罫線ノート（縦罫/横罫）
    └── circle-renderer.js  … 丸形美文字
```

## 一筆箋の仕様

- **縦書き専用**（横書きは罫線ノートへ）
- 縦線と縦線の**間**に書く
- 縦線の太さはすべて同一（1.25px）
- マス内の**上下中央の横補助線**のみ（全幅の横線は引かない）
- 列中央の薄い縦補助線あり
- 1列目＝見本、2列目＝なぞり、以降＝空欄

## 罫線ノート

- 一筆箋とは別ファイル（`note-renderer.js`）
- 単純な縦罫 / 横罫
- 色付き基準線を任意位置に設定可能
- 文字は置かない

## フォント（有料）

- `shared/font-loader.js` の `PREMIUM_FONTS_ENABLED` と `premium: true`
