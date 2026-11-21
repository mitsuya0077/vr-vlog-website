import type { Metadata } from "next";
import { Subpage } from "../../components/SiteChrome";
import { VrchatLegalDocument } from "../../components/LegalDocument";
import vrchatLegal from "../../../data/vrchat-legal-documents.json";

const { title } = vrchatLegal.terms;

const description = "Windows向けアプリ「VR Vlog for VRChat」の利用規約。";
const url = "https://vrvlog.fun/vrchat/terms/";

export const metadata: Metadata = {
  title: `${title} | VR Vlog`,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "VR Vlog", locale: "ja_JP", type: "website" },
  twitter: { card: "summary", title, description },
};

export default function Page() {
  return <Subpage title={title} product="vrchat"><VrchatLegalDocument kind="terms" /></Subpage>;
}
