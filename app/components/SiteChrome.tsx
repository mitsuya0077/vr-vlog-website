import type { ReactNode } from "react";
import { siteHref } from "../site";

type Product = "mobile" | "vrchat";

const legalLinks: Record<Product, { privacy: string; terms: string }> = {
  mobile: { privacy: "/privacy/", terms: "/terms/" },
  vrchat: { privacy: "/vrchat/privacy/", terms: "/vrchat/terms/" },
};

export function Brand() {
  return <a className="brand" href={siteHref("/#top")} aria-label="VR Vlog トップ"><span>VR</span><b>VLOG</b></a>;
}
export function SiteHeader({ product = "mobile" }: { product?: Product }) {
  return <header className="site-header"><Brand /><nav className="nav-links" aria-label="メインナビゲーション">
    {product === "vrchat"
      ? <><a href={siteHref("/mobile/")}>現実で撮る</a><a href={siteHref("/vrchat/")}>VRChatで撮る</a></>
      : <><a className="app-download-nav" data-app-download href={siteHref("/download/")}>ダウンロード</a><a href={siteHref("/exporter/")}>エクスポーター</a></>}
  </nav></header>;
}
export function SiteFooter({ product = "mobile" }: { product?: Product }) {
  const legal = legalLinks[product];
  return <footer className="site-footer"><div className="footer-main"><Brand /><span>© 2026 VR Vlog</span>
    <nav aria-label="フッターナビゲーション"><a className="discord-link" href="https://discord.gg/QnURQA72Hq" target="_blank" rel="noopener noreferrer" aria-label="公式Discordに参加（新しいタブで開きます）">Discord ↗</a><a href={siteHref(legal.privacy)}>プライバシーポリシー</a><a href={siteHref(legal.terms)}>利用規約</a><a href={siteHref("/licenses/")}>ライセンス・クレジット</a></nav></div>
    {product === "mobile"
      ? <p className="footer-trademark">Apple、Appleのロゴ、iPhoneは、米国およびその他の国で登録されたApple Inc.の商標です。App StoreはApple Inc.のサービスマークです。</p>
      : null}
  </footer>;
}
export function Subpage({ title, children, product = "mobile" }: { title: string; children: ReactNode; product?: Product }) {
  const back = product === "vrchat"
    ? { href: "/vrchat/", label: "← VR Vlog for VRChatに戻る" }
    : { href: "/", label: "← トップに戻る" };
  return <div className="site" id="top"><a className="skip-link" href="#main-content">本文へ移動</a><SiteHeader product={product} />
    <main className="subpage" id="main-content"><a className="back-link" href={siteHref(back.href)}>{back.label}</a><h1>{title}</h1>{children}</main><SiteFooter product={product} />
  </div>;
}
