import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
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
