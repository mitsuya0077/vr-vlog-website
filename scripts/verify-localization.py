"""Check Japanese site copy against each browser locale in the static export."""

import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

OUT = Path("out")
JAPANESE = re.compile(r"[ぁ-ヿ一-龯]")
ATTRIBUTES = {"alt", "aria-label", "content", "data-title", "label", "placeholder", "title"}
VOID = set("area base br col embed hr img input link meta param source track wbr".split())


class PageCopy(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.strings = set()

    def include(self, value):
        if value and JAPANESE.search(value):
            self.strings.add(value.strip())

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        classes = attr.get("class", "").split()
        skip = self.elements[-1][1] if self.elements else False
        if "analytics-settings" in classes or attr.get("id") == "account-deletion":
            skip = False
        if tag in {"script", "style", "pre", "code", "noscript"} or attr.get("translate") == "no" or "legal-document" in classes:
            skip = True
        if not skip:
            for name in ATTRIBUTES:
                self.include(attr.get(name))
        if tag not in VOID:
            self.elements.append((tag, skip))

    def handle_endtag(self, tag):
        for index in range(len(self.elements) - 1, -1, -1):
            if self.elements[index][0] == tag:
                del self.elements[index:]
                break

    def handle_data(self, value):
        if self.elements and not self.elements[-1][1]:
            self.include(value)


def browser_catalogs():
    # Use the actual script, including additions made after locale selection.
    script = """
      const fs = require('node:fs'), vm = require('node:vm');
      const source = fs.readFileSync('out/localize.js', 'utf8');
      const catalogs = {};
      for (const locale of ['en', 'zh-Hans', 'zh-Hant', 'ko']) {
        const document = { documentElement: {}, readyState: 'loading', addEventListener() {} };
        catalogs[locale] = vm.runInNewContext(source + '\\nVRVLOG_TRANSLATIONS', {
          document, navigator: { languages: ['fr', locale] }
        })[locale];
        if (document.documentElement.lang !== locale) throw Error(locale);
      }
      process.stdout.write(JSON.stringify(catalogs));
    """
    return json.loads(subprocess.check_output(["node", "-e", script]))


def main():
    catalogs = browser_catalogs()
    errors = []
    for path in sorted(OUT.rglob("index.html")):
        html = path.read_text(encoding="utf-8")
        if '<meta http-equiv="refresh"' in html:
            continue
        if "/localize.js" not in html:
            errors.append(f"{path}: locale script missing")
        parser = PageCopy()
        parser.feed(html)
        if path == OUT / "mobile/index.html":
            for table in re.findall(r'(?:const titles=|id="media-data" type="application/json">)({[^\n]+?})(?:;|</script>)', html):
                for item in json.loads(table).values():
                    for field in ("title", "mode"):
                        parser.include(item.get(field))
        for locale, catalog in catalogs.items():
            for item in sorted(parser.strings - catalog.keys()):
                if " ".join(item.split()) not in catalog:
                    errors.append(f"{path} [{locale}] {item}")
    if errors:
        raise SystemExit("\n".join(errors))
    print("All published page strings have entries in all four translation catalogs.")


if __name__ == "__main__":
    main()
