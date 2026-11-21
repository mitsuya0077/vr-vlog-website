import type { Metadata } from "next";
import { Subpage } from "../../components/SiteChrome";
import { VrchatLegalDocument } from "../../components/LegalDocument";
import vrchatLegal from "../../../data/vrchat-legal-documents.json";

const { title } = vrchatLegal.terms;

export const metadata: Metadata = {
  title: `${title} | VR Vlog`,
  alternates: { canonical: "https://vrvlog.fun/vrchat/terms/" },
};

export default function Page() {
  return <Subpage title={title} product="vrchat"><VrchatLegalDocument kind="terms" /></Subpage>;
}
