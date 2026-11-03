import legal from "../../public/legal-documents.json";
import { AnalyticsSettings } from "./AnalyticsSettings";

export function LegalDocument({ kind }: { kind: "terms" | "privacy" }) {
  const document = legal[kind];
  return <article className="legal-document" aria-label={document.title}>
    <p className="privacy-updated">{kind === "privacy" ? legal.privacy.revisionLabel : legal.revisionLabel}</p>
    {document.sections.map(section => <section className="document-section" key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs.map((paragraph, index) => <p key={index}>
        {paragraph.split(/(https:\/\/[^\s]+)/g).map((part, partIndex) =>
          part.startsWith("https://")
            ? <a className="text-link" key={partIndex} href={part}>{part}</a>
            : part)}
      </p>)}
      {kind === "privacy" && section.heading === "12. 公式サイトの閲覧"
        ? <AnalyticsSettings /> : null}
      {kind === "privacy" && section.heading === "14. 改定とお問い合わせ"
        ? <div id="account-deletion">
          <h3>VR Vlogのアカウント削除</h3>
          <p>アプリを使えない場合もメールで削除の依頼を受け付けます。対象の特定と本人確認の後、VR Vlogのアカウントと名前・アイコンを削除します。</p>
          <p>パスワードや認証コードを送る必要はありません。</p>
          <p><a className="text-link" href="mailto:mouri0077@gmail.com?subject=VR%20Vlog%E3%81%AE%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E5%89%8A%E9%99%A4%E4%BE%9D%E9%A0%BC">アカウント削除をメールで依頼</a></p>
        </div> : null}
    </section>)}
  </article>;
}
