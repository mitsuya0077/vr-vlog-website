import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";
import { siteHref } from "../site";
export const metadata: Metadata = { title: "対応環境・サポート | VR Vlog", alternates: { canonical: "https://vrvlog.fun/support/" } };
export default function Support() {
  return <Subpage title="対応環境・サポート">
    <section className="document-section" id="requirements"><h2>対応環境</h2><p><strong>iPhone版：</strong>iOS 17以降の対応iPhoneで利用できます。対応機種の詳細は、<a className="text-link" href="https://apps.apple.com/jp/app/vr-vlog/id6789953414">App Storeページ</a>でご確認ください。</p><p><strong>Android版：</strong>クローズドベータの参加者を募集中です。Googleグループに参加したあと、Google Playで「テスターになる」を選んでインストールしてください。詳しくは<a className="text-link" href={siteHref("/#android-beta")}>Androidベータの参加手順</a>をご確認ください。</p><p>Googleグループには、<strong>Android端末のGoogle Playで使っているメールアドレス（Googleアカウント）</strong>で参加してください。テスター登録も同じアカウントで進めてください。</p></section>
    <section className="document-section" id="faq"><h2>よくある質問</h2><div className="faq-list">
      <details><summary>「動画」と「ログ」の違いは？</summary><p>「ログ」は1回2秒の短い動画です。撮ったログを選ぶと、最大30ログ・60秒のVlogにまとめられます。撮影した動画は、トリムや文字入れ、フィルタで編集できます。</p></details>
      <details><summary>どんなアバターを使えますか？</summary><p>端末に保存したVRM 0.x / 1.0のファイル、またはVRoid Hubに自分が登録したモデルを読み込めます。lilToonのモデルは、エクスポーターでVRMに書き出してから読み込みます。導入方法は、<a className="text-link" href={siteHref("/exporter/")}>エクスポーター導入ページ</a>をご確認ください。</p></details>
      <details><summary>無料で使えますか？</summary><p>公開初期は、撮影・編集・保存を含む提供中の全機能を、広告なし・無料で利用できます。今後、提供条件を変更する場合があります。<a className="text-link" href={siteHref("/terms/")}>公開初期の無料提供について</a>をご確認ください。</p></details>
    </div></section>
    <section className="document-section" id="contact"><h2>お問い合わせ</h2><p>アプリについてのお問い合わせは、開発者のX（@uribou_vrc）へご連絡ください。アプリを起動できない場合もご利用いただけます。</p><a className="text-link" href="https://x.com/uribou_vrc">開発者のX（@uribou_vrc）へ →</a><p>不具合の報告や機能のご要望は、アプリの「設定」→「フィードバック」からも送信できます。返信が必要な場合は返信先を記入してください。</p><p>公開の投稿に個人情報や診断ログを記載せず、パスワードや決済情報は送信しないでください。Xの利用にはX側のログイン等が必要な場合があります。</p></section>
  </Subpage>;
}
