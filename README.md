# VR Vlog — Official Website

VR Vlogの公式案内サイトです。

- iOSアプリ（開発中）
- VRM 0.x / VRM 1.0対応
- VRoid Hub連携を開発予定

公開URL: <https://mitsuya0077.github.io/vr-vlog-website/>

アプリ本体のソースコードや認証情報は、この公開リポジトリには含まれません。

Repository: <https://github.com/mitsuya0077/vr-vlog-website>

This repository contains only the official website. It is separate from the
VR Vlog iOS application and the lilToon VRM exporter.

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
