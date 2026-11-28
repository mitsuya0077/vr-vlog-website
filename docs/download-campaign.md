# 告知のリンクの印

告知のリンクは今までどおり `https://vrvlog.fun/download/` を使い、後ろに `?c=<印>` を付ける。
ダウンロードのページは、スマホで開かれるとその印をストアのリンクへ引き継ぐ（`public/app-download.mjs`）。
アプリのダウンロードの流入元は、iOS は App Store Connect のレポートのキャンペーン、Android は GA4 の `utm_campaign` で、告知ごとに数える。
サイト自身の計測（`docs/web-measurement.md`）は変えない。サイトから Google へ印を送ることもしない。

## 印の決め方

`<場所>-<日付>-<内容>` の形にする。小文字の英字・数字・`-`・`_` だけで、30文字まで（App Store の上限）。
形が違う印は無視され、印の無いリンクとして動く。名前・アカウント名など人が分かる情報は入れない。

| どこに貼るか | 印 | リンクの例 |
| --- | --- | --- |
| X の告知の投稿 | `x-<日付>-<内容>` | `https://vrvlog.fun/download/?c=x-20261128-group` |
| X のプロフィール・固定の投稿 | `x-profile` | `https://vrvlog.fun/download/?c=x-profile` |
| Discord のお知らせ | `discord-<日付>-<内容>` | `https://vrvlog.fun/download/?c=discord-20261128-group` |
| Discord のサーバーの案内（固定） | `discord-guide` | `https://vrvlog.fun/download/?c=discord-guide` |
| YouTube の説明欄 | `youtube-<日付>-<内容>` | `https://vrvlog.fun/download/?c=youtube-20261128-howto` |
| TikTok のプロフィール | `tiktok-profile` | `https://vrvlog.fun/download/?c=tiktok-profile` |
| チラシ・イベントの QR | `qr-<日付>-<場所>` | `https://vrvlog.fun/download/?c=qr-20261201-event` |
| サイトの中のボタン（トップ・メニュー） | `site`（自動で付く。告知に書かない） | — |
| 印の無いリンク（今までに配ったもの、サイトの QR） | なし | `https://vrvlog.fun/download/` |

- 日付は告知を出した日（日本時間）の `YYYYMMDD`。内容は短い英単語（`group`・`emote`・`update126` など）
- 同じ告知を X と Discord の両方に出すときは、場所だけ変えて内容をそろえる（`x-20261128-group` と `discord-20261128-group`）。合計は内容で、場所ごとの差は場所で見る
- Android では印の最初の `-` までが `utm_source`、`utm_medium` は `vrvlog_download`、印の全体が `utm_campaign` になる

## 数え方の限り

- iOS は、Apple の決まりで、初回ダウンロードが5人以上になったキャンペーンだけが出る。小さな告知は「表に出ない分」にまとまる
- iOS の印は、プロバイダトークン（`pt`）と組で数えられる。`pt` は App Store Connect でキャンペーンのリンクを1回作ると分かる値で、秘密ではない。分かったら `public/app-download.mjs` の `appleProviderToken` に書く。それまで iOS の印は数えられない見込み（Apple の資料は両方を入れる前提で書かれている）
- Android は解析に同意した端末だけ。印の無いリンクから Play へ来た人と、Play の中で検索した人は区別できない
- PC で開いた人は QR を読んで印の無い `/download/` へ移るので、印が途切れる
