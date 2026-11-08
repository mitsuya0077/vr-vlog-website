import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "ダウンロード | VR Vlog",
  alternates: { canonical: "https://vrvlog.fun/download/" },
};

export default function Download() {
  return <Subpage title="スマホでダウンロード">
    <section className="app-download-page" data-app-download-page>
      <p>スマートフォンで使うストアを選んでください。</p>
      <div className="app-download-stores">
        <a href="https://apps.apple.com/jp/app/vr-vlog/id6789953414">App Store ↗</a>
        <a href="https://play.google.com/store/apps/details?id=com.mitsuya0077.facemaskvtuber">Google Play ↗</a>
      </div>
      <img className="app-download-qr" src="/images/app-download-qr.svg" width={168} height={168}
        alt="VR Vlogのダウンロード案内を開くQRコード" />
      <p>PCでご覧の場合は、スマホのカメラでQRコードを読み取ってください。</p>
      <p><a className="text-link" href="/support/#requirements">対応環境を確認する →</a></p>
    </section>
  </Subpage>;
}
