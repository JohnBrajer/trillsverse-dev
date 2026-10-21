"""Model-neutral orchestration loop. Brains propose; the host harness decides."""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Callable, Protocol
from .core import Harness, Intent, Receipt


class Brain(Protocol):
    def propose(self, *, goal: str, facts: frozenset[str],
                catalog: list[dict[str, Any]], history: tuple[Receipt, ...]) -> Intent | None:
        """Propose a typed intent; it cannot grant approval or register tools."""


@dataclass(frozen=True)
class RunReport:
    goal: str
    reached: bool
    steps: tuple[Receipt, ...]
    final_facts: tuple[str, ...]
    stop_reason: str


class RuleBrain:
    """Free, deterministic demonstrator; a remote/local model can implement Brain."""
    def __init__(self, harness: Harness, tool_inputs: dict[str, dict[str, Any]] | None = None):
        self.harness = harness
        self.tool_inputs = tool_inputs or {}

    def propose(self, *, goal: str, facts: frozenset[str],
                catalog: list[dict[str, Any]], history: tuple[Receipt, ...]) -> Intent | None:
        used = {r.capability for r in history}
        for plan in self.harness.perspective_expand(facts, goal):
            if not plan.executable:
                continue
            next_step = next((c for c in plan.steps if c not in used), None)
            if next_step:
                return Intent(capability=next_step, payload=self.tool_inputs.get(next_step, {}), facts=tuple(facts))
        return None


class Agent:
    """Synchronous bounded loop; no background execution or model-led consent."""
    def __init__(self, harness: Harness, brain: Brain, max_steps: int = 5):
        if not 1 <= max_steps <= 50:
            raise ValueError("max_steps must be 1..50")
        self.harness = harness
        self.brain = brain
        self.max_steps = max_steps

    def run(self, goal: str, *, facts: set[str],
            context: dict[str, Any] | None = None,
            authorize: Callable[[Intent], bool] | None = None) -> RunReport:
        known = set(facts)
        receipts: list[Receipt] = []
        reason = "STEP_LIMIT"
        for _ in range(self.max_steps):
            if goal in known:
                reason = "GOAL_REACHED"
                break
            proposal = self.brain.propose(goal=goal, facts=frozenset(known),
                catalog=self.harness.catalog(), history=tuple(receipts))
            if proposal is None:
                reason = "NO_EXECUTABLE_PATH"
                break
            # A model may propose; never trust its facts as authority.
            cap = self.harness._capabilities.get(proposal.capability)
            # Permission is scoped to the exact proposed intent, not a blanket
            # model-loop switch. Authorization callback is trusted host code.
            approved = bool(authorize(proposal)) if cap and not cap.read_only and authorize else False
            receipt = self.harness.execute(proposal, facts=known, context=context,
                                           approve_side_effects=approved)
            receipts.append(receipt)
            if receipt.status != "VERIFIED":
                reason = receipt.status
                break
            if cap:
                known.update(cap.adds)
        else:
            if goal in known:
                reason = "GOAL_REACHED"
        self.harness.witness("agent.run.finished", {"goal": goal, "reached": goal in known,
                                                    "steps": len(receipts), "stop_reason": reason})
        return RunReport(goal, goal in known, tuple(receipts), tuple(sorted(known)), reason)
