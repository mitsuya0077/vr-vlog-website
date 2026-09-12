import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";
import { freeAccessParagraphs, siteHref } from "../site";
export const metadata: Metadata = { title: "ご利用条件 | VR Vlog", alternates: { canonical: "https://mitsuya0077.github.io/vr-vlog-website/terms/" } };
export default function Terms() {
  return <Subpage title="ご利用条件"><section className="document-section"><h2>公開初期の無料提供について</h2>{freeAccessParagraphs.map(text => <p key={text}>{text}</p>)}</section><p><a className="text-link" href={siteHref("/privacy/")}>プライバシーポリシー</a></p></Subpage>;
}
