# VR Vlog — Official Website

VR Vlogの公式案内サイトです。

- 撮影・ログ結合・動画編集・アバター選択の案内
- 公開初期の無料提供条件、サポート、プライバシーポリシー
- PC・タブレット・スマートフォンに対応
- [エクスポーター公式ページ](https://vrvlog.fun/exporter/)：VCC／ALCOMへの導入とVRM書き出しの案内
- [使い方の動画](https://vrvlog.fun/guide/)：エクスポーターの導入からアバターの読み込みまで

App Storeの[VR Vlog公式ページ](https://apps.apple.com/jp/app/vr-vlog/id6789953414)へ、トップページの公式バッジとナビゲーションから移動できます。

公開URL: <https://vrvlog.fun/>

アプリ本体のソースコードや認証情報は、この公開リポジトリには含まれません。

Repository: <https://github.com/mitsuya0077/vr-vlog-website>

This repository contains only the official website. It is separate from the
VR Vlog iOS application and the lilToon VRM exporter.

## Exporter publication

`public/exporter/` is the generated official Exporter site and VPM listing.
The Exporter repository’s reviewed `Build VPM Listing` publication synchronizes
this subtree after canonical publication using a credential restricted to this
repository and the legacy personal Pages repository. Normal website builds
include the tracked subtree. Do not edit release-derived files here independently;
update the Exporter website source. The synchronization preserves concurrent
changes outside this subtree and verifies all three public JSON endpoints.
