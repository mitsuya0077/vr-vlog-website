# VR Vlog — Official Website

VR Vlogの公式案内サイトです。

- 撮影・ログ結合・動画編集・アバター選択の案内
- 公開初期の無料提供条件、サポート、プライバシーポリシー
- PC・タブレット・スマートフォンに対応

アプリは公開前です。App Storeバッジは表示のみで、リンクやクリック処理を付けていません。
公開時に正式なApp Store URLが決まり次第、バッジにリンクを設定してください。

公開URL: <https://mitsuya0077.github.io/vr-vlog-website/>

アプリ本体のソースコードや認証情報は、この公開リポジトリには含まれません。

Repository: <https://github.com/mitsuya0077/vr-vlog-website>

This repository contains only the official website. It is separate from the
VR Vlog iOS application and the lilToon VRM exporter.

## Development and deployment

Node.js 22以降を使用します。

```sh
npm ci
npm run dev
npm run lint
npm run build
```

`main`へのpushでGitHub Actionsが静的サイトを書き出し、GitHub Pagesへ公開します。
CIの`GITHUB_ACTIONS=true`で`/vr-vlog-website`のbasePathが設定されます。
ローカルで公開用ビルドを確認する場合もこの環境変数を設定してから`npm run build:pages`を実行してください。

画像の出典と取り扱いは[docs/assets.md](docs/assets.md)を参照してください。

## Legacy URL compatibility

Already-distributed apps may still open `https://mitsuya0077.github.io/vr-vlog/#privacy`.
The owner-approved [compatibility-only user-site repository](https://github.com/mitsuya0077/mitsuya0077.github.io)
provides `vr-vlog/index.html`, retaining the old path and forwarding to this
website with the requested fragment/query. Its HTML refresh and visible link
also support clients without JavaScript.

Deploy that compatibility page before renaming this repository. GitHub Pages
project URLs are not covered by GitHub repository-name redirects. Once the
old project is renamed, the user-site directory serves the old path. Keep it
available while shipped apps reference the old URL, and verify old/new routes
after the rename and Pages deployment.

The homepage also preserves `#privacy` and `#contact`, forwarding to the corresponding
document page while retaining query parameters. Without JavaScript, the homepage's
`#privacy` anchor offers a direct policy link. The former `#features` and `#vroid-hub`
anchors still point to their matching homepage sections.
