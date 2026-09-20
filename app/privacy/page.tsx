import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";
import { LegalDocument } from "../components/LegalDocument";

export const metadata: Metadata = {
  title: "プライバシーポリシー | VR Vlog",
  alternates: { canonical: "https://mitsuya0077.github.io/vr-vlog-website/privacy/" },
};

export default function Page() {
  return <Subpage title="プライバシーポリシー"><LegalDocument kind="privacy" /></Subpage>;
}
