import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from trilligence import Capability, Harness, Intent


class HarnessTests(unittest.TestCase):
    def test_identity_continuity_audit_and_reload(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "continuity.sqlite"
            with Harness(path) as h:
                h.heartbeat({"signal": "awake"})
                assert h.audit()
            with Harness(path) as h:
                assert h.audit()
                row = h.db.execute("SELECT COUNT(*) FROM journal").fetchone()[0]
                self.assertGreaterEqual(row, 1)
                h.db.execute("UPDATE journal SET payload=? WHERE seq=1", (json.dumps({"tampered": True}),))
                h.db.commit()
                self.assertFalse(h.audit())

    def test_three_truth_states_and_verification(self):
        with Harness() as h:
            h.register(Capability("works", needs=("ready",), adds=("done",),
                handler=lambda p: {"ok": True}, verifier=lambda p,r: r.get("ok") is True), available=True)
            h.register(Capability("future", adds=("novel",)))
            self.assertEqual(h.status("works"), "AVAILABLE")
            self.assertEqual(h.status("future"), "DECLARED")
            r = h.execute(Intent("works"), facts={"ready"})
            self.assertEqual(r.status, "VERIFIED")
            self.assertEqual(h.status("works"), "VERIFIED")
            self.assertTrue(h.audit())

    def test_approval_cannot_be_smuggled_in_payload(self):
        hit = []
        with Harness() as h:
            h.register(Capability("post", read_only=False, handler=lambda p: hit.append(p)), available=True)
            i = Intent("post", {"approve_side_effects": True})
            self.assertEqual(h.execute(i).status, "BLOCKED")
            self.assertEqual(hit, [])
            # The same id remains blocked on replay (idempotency).
            self.assertEqual(h.execute(i, approve_side_effects=True).status, "BLOCKED")
            self.assertEqual(h.execute(Intent("post"), approve_side_effects=True).status, "EXECUTED_UNVERIFIED")
            self.assertEqual(len(hit), 1)

    def test_failure_memory_reactivates_only_on_relevant_change(self):
        with Harness() as h:
            h.register(Capability("build", needs=("gpu",), adds=("artifact",), handler=lambda p: "ok"), available=True)
            self.assertEqual(h.execute(Intent("build"), facts=set(), context={"gpu": False}).status, "DORMANT")
            self.assertEqual(h.reactivate({"weather": "sunny"}), [])
            self.assertEqual(h.reactivate({"gpu": False}), [])
            self.assertEqual(h.reactivate({"gpu": True}), ["build"])
            self.assertEqual(h.reactivate({"gpu": True}), [])

    def test_expands_visible_action_space_before_ranking(self):
        with Harness() as h:
            h.register(Capability("learn", needs=("text",), adds=("signal",), handler=lambda p: 1), available=True)
            h.register(Capability("summarize", needs=("signal",), adds=("summary",), handler=lambda p: 1), available=True)
            h.register(Capability("future_tool", needs=("text",), adds=("summary",)))
            paths = h.perspective_expand({"text"}, "summary")
            self.assertTrue(any(p.steps == ("learn", "summarize") and p.executable for p in paths))
            self.assertTrue(any(p.steps == ("future_tool",) and not p.executable for p in paths))

    def test_untrusted_capability_never_executes(self):
        with Harness() as h:
            self.assertEqual(h.execute(Intent("shell", {"command": "rm -rf /"})).status, "BLOCKED")

    def test_idempotence_even_across_restarts(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "state.db"
            intent = Intent("count")
            hit = []
            cap = Capability("count", handler=lambda p: hit.append(1))
            with Harness(path) as h:
                h.register(cap, available=True)
                r = h.execute(intent)
            with Harness(path) as h:
                h.register(cap, available=True)
                replay = h.execute(intent)
                self.assertEqual(r, replay)
                self.assertEqual(len(hit), 1)
                self.assertTrue(h.audit())

if __name__ == "__main__":
    unittest.main()
