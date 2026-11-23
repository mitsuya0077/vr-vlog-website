import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const pages = [
  ["site/homepage.html", "out/index.html"],
  ["site/mobile.html", "out/mobile/index.html"],
  ["site/vrchat.html", "out/vrchat/index.html"],
];

if (!existsSync("out/index.html")) {
  throw new Error("Expected static export at out/index.html");
}

for (const [source, destination] of pages) {
  const html = readFileSync(source, "utf8");
  if (!/^<!doctype html>\s*<html lang="ja">/i.test(html)) {
    throw new Error(`Invalid page source: ${source}`);
  }
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

// The exporter subtree is synchronized from its own release. Apply the main
// website's language catalog to the exported HTML on every website build.
const exporterPage = "out/exporter/index.html";
const exporterHtml = readFileSync(exporterPage, "utf8");
if (!exporterHtml.includes('src="/localize.js"')) {
  if (!exporterHtml.includes("</head>")) throw new Error("Invalid exporter page");
  writeFileSync(exporterPage, exporterHtml.replace("</head>", '<script defer src="/localize.js"></script></head>'));
}
