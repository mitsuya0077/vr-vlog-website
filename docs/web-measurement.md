# サイトの計測と集客導線

対象は `https://vrvlog.fun/` と `/exporter/`、`/guide/`、`/support/`。
アプリ本体・アプリのFirebaseプロジェクトとイベントは変更しない。
この文書は接続仕様と管理画面の確認記録。サイトへのタグ設置と実データ受信は未完了。

## 計測実装の準備（2026-10-24 JST）

`public/site-measurement.js` は対象ページの表示・導線・実再生を計測する共通スクリプト。
設定 `public/site-measurement-config.json` は `enabled: false` のままにする。
本番のGoogleタグ・公開ポリシー本文・操作UIは本準備だけでは変更・有効化しない。

訪問者全員に同意操作を求めないため、`measurement/region-worker.mjs` の専用エンドポイントが
Cloudflareの `request.cf.country` で日本と判定した場合だけGoogleタグを読み込む。
言語・タイムゾーン・利用者が指定したヘッダーを国の根拠にしない。
国外・不明・通信失敗、設定なし、GPC/DNT、停止設定、保存不能ではGoogleへ送信しない。
国外向けの同意画面は設けず、解析を対象外のままにする。地域判定はIPに基づく概算であり、
すべての居住地・適用法令を確定する証拠とは扱わない。

Workerは国コードやIP・要求ログを保存せず、サイトに `jp` / `off` だけを返す。
Cloudflareの通信処理自体はIPアドレス等を扱うため、第12項の説明対象に含める。
アプリと共有しないサイト用アカウント領域、無料プランと上限を確認してから、
手動での公開を具体的に承認する。アプリのWorker、DNS、KV/R2、課金、CIを変更しない。
無料条件を確認できなければ公開せず、解析OFFを維持する。

サイト内の任意の停止操作は、第12項内だけに置く案を
[改定案全文](site-privacy-section12-draft.md) と変更前/後モックで採用判断する。
公開前の法的説明・UIは実装済みと扱わない。本文・UI・地域判定の確認後に、設定の正確な
エンドポイントと有効化を対象PRの公開承認へ含める。

ローカルの対象検証は `node --test scripts/test-site-measurement.mjs`。
Googleの実タグ・Cookie・実送信の検証とは区別し、有効化後の実受信を別に確認する。
Googleが標準生成する `first_visit` / `session_start` / `user_engagement` は独自イベントと区別する。
独自パラメーターの分析に使うカスタム定義は、サイト用プロパティだけへ
イベントスコープの `page_group` / `destination` / `placement` / `video_id` / `percent` を準備する。
`percent` は固定数値を送り、定義後は到達区分として集計する。これらの定義も未作成。
同一文書内やバック/フォワードキャッシュ復帰では手動ページビューを再送しない。

## 現在の確認結果

2026-10-24 JST、既存ChromeのGoogleログインを使って確認した。
作成前の監査では、GA4に開発用 `vr-vlog-analytics-dev`（559358789）のみがあり、
Search Consoleアカウントには選択可能なプロパティがなかった。
公開HTMLには既知の外部計測タグが見つからないが、計測がないことの証明ではない。

本人の承認後、既存アカウント内に独立したGA4プロパティ `vrvlog-web`
（560563854）とWebストリーム（16191365632、測定ID `G-P5NNKTYS39`）を作成した。
拡張計測OFF、Googleシグナル未有効、データ未受信を管理画面で確認した。
開発用559358789を流用したり、アプリの本番Firebaseと連携したりしない。

## Google側の設定案

- GA4: タイムゾーン `Asia/Tokyo`、通貨JPY、Webストリームは
  `https://vrvlog.fun/` の1つ。Exporterは同一ホストのページとして分ける。
- 拡張計測はOFF。自動のクリック・検索語・フォーム・動画・履歴変更による
  送信と独自イベントの重複を防ぐ。Googleシグナル、広告パーソナライズ、
  User-ID、広告サービスとのリンク、BigQuery連携を追加しない。
- イベントデータ保持は既定の2か月、ユーザーデータ保持は既定の14か月、
  新しいユーザー活動による保持期間のリセットは既定のONを維持する。
  2か月への短縮は法的な必須条件ではなく、本人の指示により実施しない。
  アプリや他プロパティの設定は変えない。
- Search Console: `https://vrvlog.fun/` のURLプレフィックスを第一案とする。
  この範囲に `/exporter/` も含まれる。Googleが指定する確認HTMLを `public/` に
  原文のまま置き、公開後に確認する。DNSの変更は前提にしない。
- 自動観測: 専用の読取り認証で `analytics.readonly` と
  `webmasters.readonly` の必要なスコープだけを使用する。秘密値はこの
  公開リポジトリやIssueに保存しない。プロパティの数値ID・測定ID・サイトURLは
  接続後に記録する。ブラウザーのCookieや既存CLIのトークンをコピーしない。

タグ設置までの順序は、Google側の設定対象の確認・本人承認・作成・ID記録 →
情報の取扱いの説明と同意要否の確認 → 必要な範囲の操作とタグのレビュー →
公開承認 → 受信確認。
設定・UI・公開の確認待ちは、その工程に限定する。

## Webイベントの仕様

| イベント | 発生点 | 固定値で送る属性 | 分かること |
| --- | --- | --- | --- |
| `page_view` | 計測が可能な範囲で、対象ページの表示1回につき1件 | `page_group`: home / exporter / guide / support | 計測できたブラウザーのページ表示 |
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

同意が法令・適用されるサービス条件で必要な地域・処理だけに同意操作を設ける。
必要な範囲では、選択前・拒否時にGoogleタグを読み込まずイベントを送信せず、
撤回後の送信を止める。同意が不要と確認できた範囲には、一律の同意ボタンや
閲覧を妨げる確認操作を追加せず、実態に即した説明を公表する。
ポリシー全体への一括同意を、特定の処理への同意の代わりにしない。

適用範囲の判定方法はタグ設置前に確定する。設定未完了・要否を判定できない場合は
解析を停止したまま、閲覧・ストア移動・VPM導入を利用できるようにする。
必要な操作や説明のUI変更は、変更前と案を比較して採用判断後に実装する。
未実装の操作をポリシーへ先に記載したり、同意要否を未確認のままタグを有効化したりしない。

変更候補の公開文書は `https://vrvlog.fun/privacy/` の第12項「公式サイトの閲覧」。
現在の「運営者が設置するアクセス解析ツールはない」という説明を、実装・設定が
確定してから、サイト解析の取得情報・送信先・利用目的・保持期間・必要な選択や
停止方法に置き換える。アプリ分析の第8-2項や利用規約全体は今回の変更対象にしない。
サイトで新たな解析を始めるまでは、公開中のポリシー本文を変更しない。

## 改善の評価

サイト内で確認する指標は、対象ページの訪問数・計測できたブラウザー数・
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
- [Google Analytics利用条件・第7項](https://marketingplatform.google.com/about/analytics/terms/jp/)
- [GoogleのEUユーザーの同意ポリシー](https://www.google.com/about/company/user-consent-policy/)
