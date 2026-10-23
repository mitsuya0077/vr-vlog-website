# サイトの計測と集客導線

対象は `https://vrvlog.fun/` と `/exporter/`、`/guide/`、`/support/`。
アプリ本体・アプリのFirebaseプロジェクトとイベントは変更しない。
この文書は接続仕様であり、タグ設置・Google側設定・実データ受信の完了記録ではない。

## 現在の確認結果

2026-10-24 JST、既存ChromeのGoogleログインを使って確認した。
GA4で見えるのは開発用 `vr-vlog-analytics-dev`（559358789）。
現在のSearch Consoleアカウントでは、選択可能なプロパティがない。
公開HTMLには既知の外部計測タグが見つからないが、計測がないことの証明ではない。

サイト用に、既存アカウント内の独立したGA4プロパティ `vrvlog-web` を使う。
作成直前に同名・同一サイトの既存プロパティを再確認し、あれば再利用する。
開発用559358789を流用したり、アプリの本番Firebaseと連携したりしない。

## Google側の設定案

- GA4: タイムゾーン `Asia/Tokyo`、通貨JPY、Webストリームは
  `https://vrvlog.fun/` の1つ。Exporterは同一ホストのページとして分ける。
- 拡張計測はOFF。自動のクリック・検索語・フォーム・動画・履歴変更による
  送信と独自イベントの重複を防ぐ。Googleシグナル、広告パーソナライズ、
  User-ID、広告サービスとのリンク、BigQuery連携を追加しない。
- イベントデータ保持は2か月から開始。アプリや他プロパティの設定は変えない。
- Search Console: `https://vrvlog.fun/` のURLプレフィックスを第一案とする。
  この範囲に `/exporter/` も含まれる。Googleが指定する確認HTMLを `public/` に
  原文のまま置き、公開後に確認する。DNSの変更は前提にしない。
- 自動観測: 専用の読取り認証で `analytics.readonly` と
  `webmasters.readonly` の必要なスコープだけを使用する。秘密値はこの
  公開リポジトリやIssueに保存しない。プロパティの数値ID・測定ID・サイトURLは
  接続後に記録する。ブラウザーのCookieや既存CLIのトークンをコピーしない。

実施順は、既存確認 → Google側の設定対象の確認 → 必要な本人承認 → 作成・ID記録 →
サイト側のタグと利用者の選択UI・説明をレビュー → 公開承認 → 受信確認。
設定・UI・公開の確認待ちは、その工程に限定する。

## Webイベントの仕様

| イベント | 発生点 | 固定値で送る属性 | 分かること |
| --- | --- | --- | --- |
| `page_view` | 同意後、対象ページの表示1回につき1件 | `page_group`: home / exporter / guide / support | 計測を許可したブラウザーのページ表示 |
| `acquisition_click` | 対象リンクの利用者操作 | `destination`: ios_store / android_group / android_test / exporter / guide / vpm_add、`placement`: nav / hero / body / footer / other | ストア・導入・ガイドへ進もうとした操作 |
| `guide_video_start` | ガイド動画の最初の実再生 | `video_id`: getting_started | 動画の再生開始 |
| `guide_video_progress` | 再生した位置が25 / 50 / 75 / 100%に初到達 | `video_id`: getting_started、`percent`: 固定数値 | 同一ページ表示内の再生進行 |

リンクの操作に待機・送信成功の条件を付けない。修飾キーや新しいタブでも元の遷移を保つ。
VPM追加のクリックはVCC/ALCOMの起動・導入成功ではない。Androidグループへの移動は
参加完了ではない。App Storeへのクリックはインストール・アプリ利用ではない。
動画のシークだけで再生進行を完了扱いにしない。

送信するページURLは正規のoriginと許可済みpathnameだけとし、クエリ・fragmentを除く。
生のリンクURL、参照元URL、リンク文言、入力値、メール、ファイル名、エラー本文、
独自の利用者IDは送らない。`page_referrer`は空、`page_title`は固定のページ識別子にする。
自動ページビューを止めてから手動送信し、同じページ表示やクリックを二重に送らない。
広告系の同意状態は拒否のままにする。

解析の選択前・拒否時・設定未完了ではGoogleタグを読み込まず、イベントも送信しない。
同意の撤回は以後の送信を止める。必要な選択UIと実装済みの動作説明は別の変更として
変更前と案を比較し、採用判断後に実装する。まだ収集しないタグを先に有効化しない。

## 改善の評価

サイト内で確認する指標は、対象ページの訪問数・計測を許可したブラウザー数・
各リンク操作数と率、ガイド再生開始/進行、Search Consoleの検索表示・クリック。
同意拒否やブロックによる欠測を残し、比率の分母と集計期間を記録する。
GA4ユーザー数を人数やアプリ利用者数へ読み替えない。
改善前後は同じ曜日を含む期間を比べるが、因果効果やインストール増加を断定しない。

自動観測と改善案生成は既存のmySI機能が担当する。
このサイトの検査はローカルで完結し、mySIのコード・状態DBへの依存を持たない。
サイトUIの提案は実画面の変更前画像と変更後案を提示する。
Web側だけで判断できる改善を進め、アプリの初回撮影・保存完了は今回の評価対象外にする。

## ローカル検査

既存の `npm run lint` と `npm run build:pages` の後に実行する。
Python 3.10以降の標準ライブラリだけを使い、HTTPやブラウザー操作は行わない。

```sh
python3 -m unittest discover -s scripts -p 'test_verify_acquisition.py'
python3 scripts/verify-acquisition.py out
```

検査は、実際の `out/index.html`、ガイド、サポート、同期済みExporterの正規URLと導線、
VPM JSON、sitemap、robotsを確認する。トップページはNext.jsの`app/layout.tsx`だけでなく、
ビルド後に `site/homepage.html` から上書きされることに注意する。
`public/exporter/`は検査の読取りだけに使う。変更はExporter正本の`Website/`で行う。
新規CI・workflow・jobは作らない。JSON出力の失敗件数は導線の状態であり、利用実績ではない。

HTML・URLのクエリ・認証情報・個人情報を結果に書かず、失敗した検査の固定識別子だけを出す。
計測タグを見つけても実際の送信成功は未確認と報告する。
静的HTMLの検査は、JSで変更される導線・画面表示・同意動作・外部サービスの到達性を証明しない。

## 設定仕様の参照元

- [Googleのページビュー設定](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Google Analyticsの設定項目](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
- [URLプレフィックスの範囲](https://support.google.com/webmasters/answer/10432366)
- [Search ConsoleのHTMLファイル確認](https://support.google.com/webmasters/answer/9008080)
