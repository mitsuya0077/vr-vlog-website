#!/usr/bin/env python3
"""Read a local static export; report website acquisition contracts without HTTP."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import parse_qs, unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ORIGIN = "https://vrvlog.fun"
PAGES = {"home": "/", "exporter": "/exporter/", "guide": "/guide/",
         "support": "/support/"}
STORE_ID = "id6789953414"
ANDROID_GROUP = "https://groups.google.com/g/vrvlog-android-test"
ANDROID_TEST = "https://play.google.com/apps/testing/com.mitsuya0077.facemaskvtuber"
VPM_INDEX = ORIGIN + "/exporter/index.json"
SITEMAP_NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class Facts(HTMLParser):
    def __init__(self, html, url):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.canonicals = [], set(), []
        self.external_analytics_tag = False
        self.url = url
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "base":
            # Export contracts assume canonical-root resolution, never a base override.
            raise ValueError("base_override")
        if tag == "a" and a.get("href"):
            self.links.append(urljoin(self.url, a["href"]))
        if tag == "link" and "canonical" in a.get("rel", "").lower().split():
            href = a.get("href", "").strip()
            self.canonicals.append(urljoin(self.url, href) if href else None)
        if tag == "script" and a.get("src"):
            self.external_analytics_tag |= urlsplit(urljoin(self.url, a["src"])).hostname in {
                "www.googletagmanager.com", "www.google-analytics.com",
                "static.cloudflareinsights.com", "plausible.io", "www.clarity.ms"}


def read_export(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError("missing_or_external_file")
    if path.stat().st_size > 2 * 1024 * 1024:
        raise ValueError("oversized_file")
    return path.read_text(encoding="utf-8")


def is_store(url):
    u = urlsplit(url)
    return (u.scheme == "https" and u.netloc == "apps.apple.com"
            and u.path.rstrip("/").split("/")[-1] == STORE_ID)


def is_vpm(url):
    u = urlsplit(url)
    return (u.scheme == "vcc" and u.netloc == "vpm" and u.path == "/addRepo"
            and parse_qs(u.query).get("url") == [VPM_INDEX])


def audit(root):
    root = Path(root).resolve()
    checks, pages = [], {}

    def check(name, ok):
        checks.append({"check": name, "status": "pass" if ok else "fail"})

    for name, route in PAGES.items():
        try:
            facts = Facts(read_export(root, route.lstrip("/") + "index.html"), ORIGIN + route)
            pages[name] = facts
            check(name + ":canonical", facts.canonicals == [ORIGIN + route])
        except (OSError, UnicodeError, ValueError):
            check(name + ":readable_html", False)

    home, exporter, guide = (pages.get(n) for n in ("home", "exporter", "guide"))
    if home:
        check("home:ios_store", any(map(is_store, home.links)))
        check("home:ios_store_targets", all(is_store(link) for link in home.links
                                             if urlsplit(link).hostname == "apps.apple.com"))
        check("home:android_group", ANDROID_GROUP in home.links)
        check("home:android_test", ANDROID_TEST in home.links)
        check("home:android_steps_anchor", "android-beta" in home.ids)
        check("home:exporter_route", ORIGIN + PAGES["exporter"] in home.links)
        check("home:guide_route", ORIGIN + PAGES["guide"] in home.links)
    if guide:
        check("guide:exporter_route", ORIGIN + PAGES["exporter"] in guide.links)
    if exporter:
        vpm_links = [link for link in exporter.links if urlsplit(link).scheme == "vcc"]
        check("exporter:vpm_add", bool(vpm_links) and all(map(is_vpm, vpm_links)))
        check("exporter:home_route", ORIGIN + "/" in exporter.links)

    # Confirm every same-origin link between these four pages has a real fragment.
    # No arbitrary URL, file, or query text enters the report.
    for name, facts in pages.items():
        for target_name, route in PAGES.items():
            targets = [urlsplit(link) for link in facts.links
                       if urlsplit(link)._replace(query="", fragment="").geturl() == ORIGIN + route]
            target = pages.get(target_name)
            check(name + ":fragments_to_" + target_name,
                  all(not u.fragment or (target and unquote(u.fragment) in target.ids) for u in targets))

    try:
        xml = ET.fromstring(read_export(root, "sitemap.xml"))
        check("sitemap:urlset", xml.tag == "{" + SITEMAP_NS["s"] + "}urlset")
        locations = {e.text for e in xml.findall("s:url/s:loc", SITEMAP_NS)}
        for name, route in PAGES.items():
            check("sitemap:" + name, ORIGIN + route in locations)
    except (OSError, UnicodeError, ValueError, ET.ParseError):
        check("sitemap:readable_xml", False)
    try:
        robots = read_export(root, "robots.txt")
        check("robots:sitemap", any(line.strip() == "Sitemap: " + ORIGIN + "/sitemap.xml"
                                     for line in robots.splitlines()))
        robot_rules = RobotFileParser()
        robot_rules.parse(robots.splitlines())
        check("robots:acquisition_pages_allowed", all(
            robot_rules.can_fetch("Googlebot", ORIGIN + route) for route in PAGES.values()))
    except (OSError, UnicodeError, ValueError):
        check("robots:readable", False)
    try:
        listing = json.loads(read_export(root, "exporter/index.json"))
        check("exporter:listing_url", listing.get("url") == VPM_INDEX)
        check("exporter:listing_packages", isinstance(listing.get("packages"), dict)
              and bool(listing["packages"]))
    except (OSError, UnicodeError, ValueError, AttributeError):
        check("exporter:readable_listing", False)

    failed = sum(c["status"] == "fail" for c in checks)
    return {"schema": "vrvlog-web-acquisition-audit/v1", "scope": "website_only",
            "status": "pass" if failed == 0 else "fail", "failed_checks": failed,
            "checks": checks,
            "measurement": {name: {"known_external_analytics_tag": f.external_analytics_tag,
                                    "runtime_collection": "unverified"} for name, f in pages.items()},
            "limits": ["local_static_html_only", "no_network_or_browser_execution",
                       "tag_absence_does_not_prove_no_collection",
                       "links_are_not_clicks_installs_or_app_usage"]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export_dir", type=Path, help="existing static export, normally out/")
    args = parser.parse_args()
    result = audit(args.export_dir)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
