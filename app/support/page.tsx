import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";
import { siteHref } from "../site";
export const metadata: Metadata = { title: "対応環境・サポート | VR Vlog", alternates: { canonical: "https://mitsuya0077.github.io/vr-vlog-website/support/" } };
export default function Support() {
  return <Subpage title="対応環境・サポート">
    <section className="document-section" id="requirements"><h2>対応環境</h2><p>iOS 17以降の対応iPhone向けアプリです。対応機種の詳細は、アプリ公開時のApp Storeページでご確認ください。</p></section>
    <section className="document-section" id="faq"><h2>よくある質問</h2><div className="faq-list">
      <details><summary>「動画」と「ログ」の違いは？</summary><p>「ログ」は1回2秒の短い動画です。撮ったログを選ぶと、最大30ログ・60秒のVlogにまとめられます。撮影した動画は、トリムや文字入れ、フィルタで編集できます。</p></details>
      <details><summary>どんなアバターを使えますか？</summary><p>iPhoneに保存したVRM 0.x / 1.0のファイル、またはVRoid Hubに自分が登録したモデルを読み込めます。lilToonのモデルは、<a className="text-link" href="https://mitsuya0077.github.io/VR-Vlog-lilToon-Exporter/">専用の変換ツール</a>でVRMに書き出してから読み込みます。</p></details>
      <details><summary>無料で使えますか？</summary><p>公開初期は、撮影・編集・保存を含む提供中の全機能を、広告なし・無料で利用できます。今後、提供条件を変更する場合があります。<a className="text-link" href={siteHref("/terms/")}>公開初期の無料提供について</a>をご確認ください。</p></details>
    </div></section>
    <section className="document-section" id="contact"><h2>お問い合わせ</h2><p>開発者のGitHubプロフィールからご確認ください。</p><a className="text-link" href="https://github.com/mitsuya0077">開発者のGitHubを見る →</a></section>
  </Subpage>;
}
