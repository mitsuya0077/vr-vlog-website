import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://mitsuya0077.github.io/vr-vlog-website/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "VR Vlog | アバターと撮る、もうひとつのVlog",
  description:
    "VR Vlogは、iPhoneのカメラ映像にVRMアバターを重ね、表情や頭の動きを反映して動画を撮影できる開発中のiOSアプリです。",
  applicationName: "VR Vlog",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "VR Vlog",
    description: "あなたの表情で、アバターと撮る。",
    url: siteUrl,
    siteName: "VR Vlog",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "VR Vlog",
    description: "あなたの表情で、アバターと撮る。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090a12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
