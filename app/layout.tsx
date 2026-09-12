import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://mitsuya0077.github.io/vr-vlog-website/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "VR Vlog | アバターでVlogを撮る",
  description:
    "顔をアバターに置き換えて撮影するiPhoneアプリ。2秒ずつ撮ったログをつないでVlogを作り、動画のカットや文字入れもできます。",
  applicationName: "VR Vlog",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "VR Vlog",
    description: "アバターでVlogを撮る。短い動画を撮るだけで、かんたんに1本のVlogに。",
    url: siteUrl,
    siteName: "VR Vlog",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "VR Vlog",
    description: "アバターでVlogを撮る。短い動画を撮るだけで、かんたんに1本のVlogに。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13191c",
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
