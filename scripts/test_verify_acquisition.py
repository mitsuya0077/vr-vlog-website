import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("acquisition", Path(__file__).with_name("verify-acquisition.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AcquisitionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for route in ("", "guide/", "support/", "exporter/"):
            self.write(route + "index.html", '<link rel="canonical" href="https://vrvlog.fun/' + route + '">')
        self.append("index.html", '''<a href="https://apps.apple.com/jp/app/vr-vlog/id6789953414">iOS</a>
<a href="https://groups.google.com/g/vrvlog-android-test">Group</a>
<a href="https://play.google.com/apps/testing/com.mitsuya0077.facemaskvtuber">Test</a>
<section id="android-beta"></section><a href="exporter/">Exporter</a><a href="guide/">Guide</a>''')
        self.append("guide/index.html", '<a href="../exporter/">Exporter</a>')
        self.append("exporter/index.html", '<a href="../">Home</a><a href="vcc://vpm/addRepo?url=https%3A%2F%2Fvrvlog.fun%2Fexporter%2Findex.json">VPM</a>')
        self.write("exporter/index.json", json.dumps({"url": "https://vrvlog.fun/exporter/index.json", "packages": {"example": {}}}))
        self.write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://vrvlog.fun/sitemap.xml\n")
        self.write("sitemap.xml", '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(
            '<url><loc>https://vrvlog.fun/' + route + '</loc></url>' for route in ("", "guide/", "support/", "exporter/")) + '</urlset>')

    def write(self, name, text):
        p = self.root / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)

    def append(self, name, text):
        p = self.root / name
        p.write_text(p.read_text() + text)

    def replace(self, name, before, after):
        p = self.root / name
        p.write_text(p.read_text().replace(before, after))

    def fails(self, name):
        result = module.audit(self.root)
        self.assertEqual(result["status"], "fail")
        self.assertIn({"check": name, "status": "fail"}, result["checks"])
        return result

    def test_valid_export_and_no_tracking_claim(self):
        result = module.audit(self.root)
        self.assertEqual(result["status"], "pass")
        self.assertEqual(result["measurement"]["home"]["runtime_collection"], "unverified")

    def test_missing_export_is_not_success(self):
        self.assertEqual(module.audit(self.root / "absent")["status"], "fail")

    def test_wrong_app_id_fails(self):
        self.replace("index.html", "id6789953414", "id1234567890")
        self.fails("home:ios_store")

    def test_one_valid_store_link_does_not_hide_wrong_badge_destination(self):
        self.append("index.html", '<a href="https://apps.apple.com/jp/app/other/id1234567890">download</a>')
        self.fails("home:ios_store_targets")

    def test_store_host_spoof_fails(self):
        self.replace("index.html", "apps.apple.com/", "apps.apple.com.evil.example/")
        self.fails("home:ios_store")

    def test_missing_android_step_fails(self):
        self.replace("index.html", "https://groups.google.com/g/vrvlog-android-test", "#removed")
        self.fails("home:android_group")

    def test_broken_fragment_fails_without_logging_query(self):
        self.append("index.html", '<a href="support/?private=sentinel#missing">help</a>')
        result = self.fails("home:fragments_to_support")
        self.assertNotIn("sentinel", json.dumps(result))

    def test_wrong_vpm_target_fails(self):
        self.replace("exporter/index.html", "vrvlog.fun%2Fexporter", "evil.example%2Fexporter")
        self.fails("exporter:vpm_add")

    def test_one_valid_vpm_link_does_not_hide_another_repository(self):
        self.append("exporter/index.html", '<a href="vcc://vpm/addRepo?url=https%3A%2F%2Fother.example%2Findex.json">other</a>')
        self.fails("exporter:vpm_add")

    def test_sitemap_omission_fails(self):
        self.replace("sitemap.xml", "<url><loc>https://vrvlog.fun/exporter/</loc></url>", "")
        self.fails("sitemap:exporter")

    def test_robots_blocking_search_fails(self):
        self.replace("robots.txt", "Allow: /", "Disallow: /")
        self.fails("robots:acquisition_pages_allowed")

    def test_duplicate_or_wrong_canonical_fails(self):
        self.append("guide/index.html", '<link rel="canonical" href="https://elsewhere.example/">')
        self.fails("guide:canonical")

    def test_empty_canonical_is_not_current_url(self):
        self.replace("guide/index.html", 'href="https://vrvlog.fun/guide/"', 'href=""')
        self.fails("guide:canonical")

    def test_base_override_fails(self):
        self.append("index.html", '<base href="https://elsewhere.example/">')
        self.fails("home:readable_html")

    def test_symlink_outside_export_is_rejected(self):
        with tempfile.TemporaryDirectory() as other:
            path = Path(other) / "private.html"
            path.write_text("do-not-read-sentinel")
            (self.root / "index.html").unlink()
            (self.root / "index.html").symlink_to(path)
            result = self.fails("home:readable_html")
            self.assertNotIn("do-not-read-sentinel", json.dumps(result))

    def test_invalid_listing_fails(self):
        self.write("exporter/index.json", "[]")
        self.fails("exporter:readable_listing")


if __name__ == "__main__":
    unittest.main()
