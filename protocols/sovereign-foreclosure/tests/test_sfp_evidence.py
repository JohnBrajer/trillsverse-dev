import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1] / "sfp_evidence.py"
spec = importlib.util.spec_from_file_location("sfp_evidence", MODULE)
sfp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sfp)


def entry(uri, agent="GPTBot", ip="192.0.2.1", status=200):
    return json.dumps({"ts": 1792500000.0, "request": {"uri": uri, "method": "GET", "remote_ip": ip,
                      "headers": {"User-Agent": [agent]}}, "status": status, "size": 321})


class EvidenceTests(unittest.TestCase):
    def test_matches_public_album_path(self):
        e = sfp.parse_entry(entry("/system-breach?ref=bot"))
        self.assertEqual(e["path"], "/system-breach")

    def test_identity_is_never_verified_from_user_agent(self):
        e = sfp.parse_entry(entry("/corpus.json", "ClaudeBot"))
        self.assertEqual(e["identity_verification"], "UNVERIFIED")
        self.assertEqual(e["contract_assent"], "NOT_ESTABLISHED")

    def test_sensitive_path_never_exported(self):
        self.assertIsNone(sfp.parse_entry(entry("/.env"), ("/",)))

    def test_no_data_for_unlisted_path(self):
        self.assertIsNone(sfp.parse_entry(entry("/private/music.mp3")))

    def test_http_failure_still_is_only_attempt(self):
        e = sfp.parse_entry(entry("/llms-full.txt", status=403))
        self.assertEqual(e["status"], 403)
        self.assertEqual(e["training_use"], "NOT_ESTABLISHED")

    def test_unknown_agent_not_vendor_attributed(self):
        self.assertIsNone(sfp.parse_entry(entry("/system-breach", "python-requests/2")))

    def test_public_report_redacts_ip_and_ua(self):
        private = {"events": [sfp.parse_entry(entry("/system-breach"))], "protocol": "SFP-001"}
        public = sfp.public_version(private)
        self.assertNotIn("source_ip", public["events"][0])
        self.assertNotIn("claimed_user_agent", public["events"][0])
        self.assertIn("source_ip", private["events"][0])

    def test_digest_and_matching_requests(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t) / "caddy.log"
            p.write_text(entry("/system-breach") + "\n" + entry("/corpus.json", "ClaudeBot") + "\n")
            r = sfp.report(p)
            self.assertEqual(r["matching_requests"], 2)
            self.assertEqual(len(r["source_sha256"]), 64)


if __name__ == "__main__":
    unittest.main()
