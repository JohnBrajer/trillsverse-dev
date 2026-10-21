import unittest
from trilligence import Agent, Capability, Harness, RuleBrain, Intent


class AgentTests(unittest.TestCase):
    def test_agent_reaches_goal_only_through_verified_actions(self):
        with Harness() as h:
            h.register(Capability("first", needs=("raw",), adds=("signal",), handler=lambda p: "ok", verifier=lambda p,r: r=="ok"), available=True)
            h.register(Capability("second", needs=("signal",), adds=("summary",), handler=lambda p: "ok", verifier=lambda p,r: r=="ok"), available=True)
            report = Agent(h, RuleBrain(h)).run("summary", facts={"raw"})
            self.assertTrue(report.reached)
            self.assertEqual(len(report.steps), 2)
            self.assertTrue(all(r.status == "VERIFIED" for r in report.steps))
            self.assertEqual(report.stop_reason, "GOAL_REACHED")
            self.assertTrue(h.audit())

    def test_unverified_work_never_promotes_reachable_state(self):
        with Harness() as h:
            h.register(Capability("guess", adds=("finished",), handler=lambda p: True), available=True)
            report = Agent(h, RuleBrain(h)).run("finished", facts=set())
            self.assertFalse(report.reached)
            self.assertEqual(report.stop_reason, "EXECUTED_UNVERIFIED")

    def test_model_supplied_facts_cannot_bypass_prerequisites(self):
        class UntrustedBrain:
            def propose(self, **kwargs):
                return Intent("privileged", facts=("auth",))
        with Harness() as h:
            h.register(Capability("privileged", needs=("auth",), adds=("done",), handler=lambda p: 1), available=True)
            report = Agent(h, UntrustedBrain()).run("done", facts=set(), context={"auth": False})
            self.assertFalse(report.reached)
            self.assertEqual(report.stop_reason, "DORMANT")

    def test_exact_intent_authorization_for_mutations(self):
        seen = []
        class HostBrain:
            def propose(self, **kwargs):
                return Intent("publish", {"destination": "wrong"})
        with Harness() as h:
            h.register(Capability("publish", adds=("published",), read_only=False,
                                  handler=lambda p: seen.append(p["destination"]),
                                  verifier=lambda p, result: bool(seen)), available=True)
            report = Agent(h, HostBrain()).run("published", facts=set(),
                authorize=lambda intent: intent.payload.get("destination") == "approved")
            self.assertEqual(report.stop_reason, "BLOCKED")
            self.assertEqual(seen, [])

    def test_model_supplied_payload_approval_cannot_write(self):
        called = []
        class UntrustedBrain:
            def propose(self, **kwargs):
                return Intent("publish", payload={"approve_side_effects": True})
        with Harness() as h:
            h.register(Capability("publish", adds=("published",), read_only=False,
                                  handler=lambda p: called.append(True)), available=True)
            report = Agent(h, UntrustedBrain()).run("published", facts=set())
            self.assertEqual(report.stop_reason, "BLOCKED")
            self.assertEqual(called, [])


if __name__ == "__main__":
    unittest.main()
