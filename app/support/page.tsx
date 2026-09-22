import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";
import { siteHref } from "../site";
export const metadata: Metadata = { title: "対応環境・サポート | VR Vlog", alternates: { canonical: "https://vrvlog.fun/support/" } };
export default function Support() {
  return <Subpage title="対応環境・サポート">
    <section className="document-section" id="requirements"><h2>対応環境</h2><p>iOS 17以降の対応iPhone向けアプリです。対応機種の詳細は、アプリ公開時のApp Storeページでご確認ください。</p></section>
    <section className="document-section" id="faq"><h2>よくある質問</h2><div className="faq-list">
      <details><summary>「動画」と「ログ」の違いは？</summary><p>「ログ」は1回2秒の短い動画です。撮ったログを選ぶと、最大30ログ・60秒のVlogにまとめられます。撮影した動画は、トリムや文字入れ、フィルタで編集できます。</p></details>
      <details><summary>どんなアバターを使えますか？</summary><p>iPhoneに保存したVRM 0.x / 1.0のファイル、またはVRoid Hubに自分が登録したモデルを読み込めます。lilToonのモデルは、<a className="text-link" href="https://mitsuya0077.github.io/VR-Vlog-lilToon-Exporter/">専用の変換ツール</a>でVRMに書き出してから読み込みます。</p></details>
      <details><summary>無料で使えますか？</summary><p>公開初期は、撮影・編集・保存を含む提供中の全機能を、広告なし・無料で利用できます。今後、提供条件を変更する場合があります。<a className="text-link" href={siteHref("/terms/")}>公開初期の無料提供について</a>をご確認ください。</p></details>
    </div></section>
    <section className="document-section" id="contact"><h2>お問い合わせ</h2><p>アプリについてのお問い合わせは、開発者のX（@uribou_vrc）へご連絡ください。アプリを起動できない場合もご利用いただけます。</p><a className="text-link" href="https://x.com/uribou_vrc">開発者のX（@uribou_vrc）へ →</a><p>不具合の報告や機能のご要望は、アプリの「設定」→「フィードバック」からも送信できます。返信が必要な場合は返信先を記入してください。</p><p>公開の投稿に個人情報や診断ログを記載せず、パスワードや決済情報は送信しないでください。Xの利用にはX側のログイン等が必要な場合があります。</p></section>
  </Subpage>;
}
