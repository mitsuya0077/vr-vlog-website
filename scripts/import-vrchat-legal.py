#!/usr/bin/env python3
"""Regenerate data/vrchat-legal-documents.json from the published Google Docs.

The VR Vlog for VRChat terms and privacy policy are written in Google Docs and
shown on https://vrvlog.fun/vrchat/terms/ and /vrchat/privacy/. Run this after
updating either document, review the diff, and publish it with the site.

The script keeps the document structure (title, version line, preamble,
headings and paragraphs) and fails unless every non-space character of the
plain-text export appears in the generated data, in the same order.
"""
from __future__ import annotations

import html
import json
import re
import sys
import urllib.request
from pathlib import Path

DOCS = {
    "terms": "1hFW9Nx672naaIoh_htf0NKm5inTuu1pMdiPgPL3A4fc",
    "privacy": "1Qdp4FYr12-8fi8l90JSCn7UvzVLcegt5TNd66CNV504",
}
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "vrchat-legal-documents.json"


def fetch(doc_id: str, fmt: str) -> str:
    url = f"https://docs.google.com/document/d/{doc_id}/export?format={fmt}"
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read().decode("utf-8-sig")


def convert(doc_id: str, exported_html: str, plain_text: str) -> dict:
    body = exported_html[exported_html.find("<body"):]
    blocks: list[tuple[str, str]] = []
    for match in re.finditer(r"<(h[1-6]|p|li|table)\b[^>]*>(.*?)</\1>", body, re.S):
        tag = match.group(1)
        if tag not in ("h1", "h2", "p"):
            raise ValueError(f"unsupported block <{tag}>; update the importer and the page")
        inner = re.sub(r"<br\s*/?>", "\n", match.group(2))
        text = html.unescape(re.sub(r"<[^>]+>", "", inner)).replace("\xa0", " ").strip()
        if text:
            blocks.append((tag, text))
    if len(blocks) < 3 or blocks[0][0] != "h1" or blocks[1][0] != "p" or not blocks[1][1].startswith("文書版"):
        raise ValueError("expected a title, then the 文書版 line")
    document = {"title": blocks[0][1], "revisionLabel": blocks[1][1], "intro": [], "sections": []}
    for tag, text in blocks[2:]:
        if tag == "h2":
            document["sections"].append({"heading": text, "paragraphs": []})
        elif tag == "p":
            target = document["sections"][-1]["paragraphs"] if document["sections"] else document["intro"]
            target.append(text)
        else:
            raise ValueError(f"unexpected <{tag}> after the title")
    generated = "".join([
        document["title"], document["revisionLabel"], *document["intro"],
        *(part for section in document["sections"] for part in [section["heading"], *section["paragraphs"]]),
    ])
    squash = lambda value: re.sub(r"\s+", "", value)
    if squash(generated) != squash(plain_text):
        raise ValueError("generated text does not match the plain-text export")
    document["source"] = f"https://docs.google.com/document/d/{doc_id}/edit"
    return document


def main() -> int:
    result = {kind: convert(doc_id, fetch(doc_id, "html"), fetch(doc_id, "txt")) for kind, doc_id in DOCS.items()}
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for kind, document in result.items():
        print(f"{kind}: {document['title']} / {document['revisionLabel']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
