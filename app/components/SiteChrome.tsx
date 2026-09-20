import type { ReactNode } from "react";
import { siteHref } from "../site";

export function Brand() {
  return <a className="brand" href={siteHref("/#top")} aria-label="VR Vlog トップ"><span>VR</span><b>VLOG</b></a>;
}
export function SiteHeader() {
  return <header className="site-header"><Brand /><nav className="nav-links" aria-label="メインナビゲーション">
    <a href={siteHref("/#capture")}>撮影</a><a href={siteHref("/#log")}>ログ</a><a href={siteHref("/#avatar")}>アバター</a><a href={siteHref("/#free-access")}>無料提供について</a>
  </nav></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-main"><Brand /><span>© 2026 VR Vlog</span>
    <nav aria-label="フッターナビゲーション"><a href={siteHref("/privacy/")}>プライバシーポリシー</a><a href={siteHref("/terms/")}>利用規約</a></nav></div>
    <p className="footer-trademark">Apple、Appleのロゴ、iPhoneは、米国およびその他の国で登録されたApple Inc.の商標です。App StoreはApple Inc.のサービスマークです。</p>
  </footer>;
}
export function Subpage({ title, children }: { title: string; children: ReactNode }) {
  return <div className="site" id="top"><a className="skip-link" href="#main-content">本文へ移動</a><SiteHeader />
    <main className="subpage" id="main-content"><a className="back-link" href={siteHref("/")}>← トップに戻る</a><h1>{title}</h1>{children}</main><SiteFooter />
  </div>;
}
