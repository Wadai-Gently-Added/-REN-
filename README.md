# 美文字練習帳 統合版 v3.5.23

## 変更履歴
### v3.5.23 (2026-09-14)
- 罫線ノートを根本から書き直し
- 下端セーフゾーンを厳格化。SAFE_BOTTOM より下には一切線を引かない
- 2本罫：主線を先に確定 → 間にだけ破線。最終が破線にならない
- 3〜5本組：不完全な組は描画しない
- 文字幅を canvas.measureText で実測し、右はみ出しを防止

### 過去
- v3.5.22 以前の下端線・はみ出し対策を積み重ね

## フォルダ構成
```
├── index.html
├── styles.css
├── shared/
│   ├── parser.js
│   ├── practice-blocks.js
│   ├── font-loader.js
│   └── app.js
└── modes/
    ├── grid-renderer.js
    ├── letter-renderer.js
    ├── note-renderer.js
    └── circle-renderer.js
```
