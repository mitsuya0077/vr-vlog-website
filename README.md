# VR Vlog — Official Website

VR Vlogの公式案内サイトです。

- 撮影・ログ結合・動画編集・アバター選択の案内
- 公開初期の無料提供条件、サポート、プライバシーポリシー
- PC・タブレット・スマートフォンに対応
- [使い方の動画](https://vrvlog.fun/guide/)：エクスポーターの導入からアバターの読み込みまで

App Storeの[VR Vlog公式ページ](https://apps.apple.com/jp/app/vr-vlog/id6789953414)へ、トップページの公式バッジとナビゲーションから移動できます。

公開URL: <https://vrvlog.fun/>

アプリ本体のソースコードや認証情報は、この公開リポジトリには含まれません。

Repository: <https://github.com/mitsuya0077/vr-vlog-website>

This repository contains only the official website. It is separate from the
VR Vlog iOS application and the lilToon VRM exporter.

## 規約・プライバシーポリシー

両ページは `public/legal-documents.json` の同じ本文データを描画します。
本文の管理元は、このリポジトリの `public/legal-documents.json` です。
アプリは公式サイトの規約・プライバシーポリシーのHTTPSページを開くため、
本文の更新にアプリ本体の変更や再配布は必要ありません。
本文と改定日を同時に更新し、ビルド後に両ページの全文とJSONの一致を確認してください。
公開後はページの全文と `/legal-documents.json` が改定版へ更新されたことを確認します。
