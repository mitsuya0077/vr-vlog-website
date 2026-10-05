import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Subpage } from "../components/SiteChrome";
import notices from "../../data/licenses.json";

type LicenseEntry = { name: string; version: string; license: string; source: string; notice: string; note?: string };
type LicenseGroup = { id: string; title: string; description: string; entries: LicenseEntry[] };
const groups: LicenseGroup[] = notices;

export const metadata: Metadata = {
  title: "ライセンス・クレジット | VR Vlog",
  description: "VR Vlog、エクスポーター、公式サイトで使用するソフトウェアと素材のライセンス・著作権表示。",
  alternates: { canonical: "https://vrvlog.fun/licenses/" },
};

export default function LicensesPage() {
  return <Subpage title="ライセンス・クレジット">
    <p>VR Vlog、VR Vlogエクスポーター、公式サイトで使用するソフトウェアと素材の著作権表示・ライセンスを掲載しています。ライセンス本文は原文で掲載しています。</p>
    <p className="license-updated">確認日：<time dateTime="2026-10-05">2026年10月5日</time></p>
    <nav className="license-index" aria-label="ライセンスの目次">
      {groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}</a>)}
      <a href="#credits">素材・音声のクレジット</a>
    </nav>
    {groups.map(group => <section className="document-section" id={group.id} key={group.id}>
      <h2>{group.title}</h2>
      <p>{group.description}</p>
      {group.entries.map(entry => <article className="license-entry" key={entry.notice}>
        <h3>{entry.name}{entry.version ? ` ${entry.version}` : ""}</h3>
        <p>{entry.license}</p>
        {entry.note && <p>{entry.note}</p>}
        <div className="license-links"><a className="text-link" href={entry.source}>公式の配布元・ライセンス</a><a className="text-link" href={`/${entry.notice}`}>ライセンス原文（テキスト）</a></div>
        <details><summary>著作権表示・ライセンス本文を読む</summary>
          <pre className="license-original" translate="no"><code>{readFileSync(join(process.cwd(), "public", entry.notice), "utf8")}</code></pre>
        </details>
      </article>)}
    </section>)}
    <section className="document-section" id="credits">
      <h2>素材・音声のクレジット</h2>
      <h3>アバター：キプフェル</h3><p>©もち山金魚</p>
      <p>公式サイトの画像・動画に登場するアバターです。アバターの利用には作者が定める利用規約が適用されます。</p>
      <div className="license-links"><a className="text-link" href="https://mochiyama.com/license_jp">もち山金魚の利用規約</a><a className="text-link" href="https://mochiyama.com/guideline_jp">もち山金魚のガイドライン</a></div>
      <h3>使い方動画の音声</h3><p>VOICEVOX:ずんだもん</p>
      <div className="license-links"><a className="text-link" href="https://voicevox.hiroshiba.jp/term/">VOICEVOX ソフトウェア利用規約</a><a className="text-link" href="https://zunko.jp/con_ongen_kiyaku.html">ずんだもん音声の利用規約</a></div>
      <h3>商標・サービス</h3>
      <p>Apple、Appleのロゴ、iPhoneは、米国およびその他の国で登録されたApple Inc.の商標です。App StoreはApple Inc.のサービスマークです。</p>
      <p>Unity、VRoid Hub、VRChatなどの製品・サービス名は各権利者に帰属します。各サービスの利用には、それぞれの利用規約が適用されます。</p>
    </section>
  </Subpage>;
}
