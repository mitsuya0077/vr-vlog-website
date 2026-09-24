import { copyFileSync, existsSync, readFileSync } from "node:fs";

const source = "site/homepage.html";
const destination = "out/index.html";

if (!existsSync(destination)) {
  throw new Error(`Expected static export at ${destination}`);
}

const html = readFileSync(source, "utf8");
if (!html.startsWith("<!DOCTYPE html>") || !html.includes('<html lang="ja">')) {
  throw new Error(`Invalid homepage source: ${source}`);
}

copyFileSync(source, destination);
