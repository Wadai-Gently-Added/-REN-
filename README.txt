美文字練習帳 統合版 v3.1.0 (2026-08-24 build)

■ 変更履歴 (CHANGELOG)
  v3.1.0  2026-08-24
    - ①〜⑧-② を全モード同一位置で常時全表示。不要時は .disabled でグレー化
    - 同一ID化: hand → handCircle に統一、⑨setTypeラジオ → セレクト化
    - ④-① ⇔ ④-② 双方向連動を 100↔36 で対称化
    - getState() 単一の真実のソースで全描画モジュールから参照
    - DOM の display:none 切替を廃止（入力反映バグの根絶）
    - 画面右上・フッターにバージョン表示 (v3.1.0 build 2026-08-24)

  v3.0.x
    - 円形美文字 (v2.0) 統合、⑧-② カスタム5種復元

■ ファイル (BOM付きUTF-8 / ASCIIファイル名)
  01_index.html  : 画面・設定項目（①〜⑧-②常時全表示, version baged）
  02_style.css   : .disabled グレーアウト＋全スタイル
  04_parser.js   : parseUnits / parseLines（""で一塊、改行で複数行）
  05_blocks.js   : getTypes()（⑧-①/⑧-②を3モード共有）+ createSection + calcFitCount
  06_grid.js     : マス目描画（二分探索で自動最大フィット）
  07_ruled.js    : 一筆箋（罫線）描画
  08_circle.js   : 円形美文字（SVG、⑧ は getTypes() を共用）
  09_main.js     : 司令塔（モード切替・setAvailability・④-①⇔④-②連動）

■ 設計原則
  - ①〜⑧-② 全項目常時表示、DOM除去禁止
  - モードで使えない項目は .disabled（opacity 0.45 + grayscale + disabled属性）
  - oninput/onchange ハンドラは常に生き、入力→render() に必ず反映
  - 利き手は handCircle 単一ID（縦マス目＋丸形で共用）
  - ⑧-② はマス目・一筆箋・丸形 3モード共通の setType/custom 経由

■ 起動
  01_index.html をブラウザで開くだけ
  画面右上・フッターに "v3.1.0 build 2026-08-24" が出ていれば本ビルド
