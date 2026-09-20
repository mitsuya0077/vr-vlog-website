import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";
import { LegalDocument } from "../components/LegalDocument";

export const metadata: Metadata = {
  title: "利用規約 | VR Vlog",
  alternates: { canonical: "https://mitsuya0077.github.io/vr-vlog-website/terms/" },
};

export default function Page() {
  return <Subpage title="利用規約"><LegalDocument kind="terms" /></Subpage>;
}
