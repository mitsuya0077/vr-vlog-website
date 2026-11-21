import type { Metadata } from "next";
import { Subpage } from "../../components/SiteChrome";
import { VrchatLegalDocument } from "../../components/LegalDocument";
import vrchatLegal from "../../../data/vrchat-legal-documents.json";

const { title } = vrchatLegal.privacy;

export const metadata: Metadata = {
  title: `${title} | VR Vlog`,
  alternates: { canonical: "https://vrvlog.fun/vrchat/privacy/" },
};

export default function Page() {
  return <Subpage title={title} product="vrchat"><VrchatLegalDocument kind="privacy" /></Subpage>;
}
