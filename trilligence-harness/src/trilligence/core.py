"""Small deterministic execution kernel. No model, shell or network dependency.

Architecture: heartbeat/event -> attention/planning -> conditional memory ->
pluggable brain -> typed OMIP-bound intent -> allowlisted worker -> witness.

John Brajer / Trillsverse, 2026. Model independence is intentional.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import sqlite3
from typing import Any, Callable, Iterable
from uuid import uuid4


def _json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(frozen=True)
class Capability:
    name: str
    description: str = ""
    needs: tuple[str, ...] = ()  # prerequisite facts, not capabilities
    adds: tuple[str, ...] = ()   # facts reachable after success
    read_only: bool = True
    cost: float = 0.0
    path_expansion: float = 1.0
    verifier: Callable[[dict[str, Any], Any], bool] | None = field(default=None, repr=False, compare=False)
    handler: Callable[[dict[str, Any]], Any] | None = field(default=None, repr=False, compare=False)

    def __post_init__(self):
        if not self.name or not self.name.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Capability name must be an alphanumeric identifier")
        if self.cost < 0 or self.path_expansion < 0:
            raise ValueError("cost and path_expansion must be non-negative")


@dataclass(frozen=True)
class Intent:
    capability: str
    payload: dict[str, Any] = field(default_factory=dict)
    facts: tuple[str, ...] = ()
    expected: str = ""
    id: str = field(default_factory=lambda: str(uuid4()))


@dataclass(frozen=True)
class Receipt:
    intent_id: str
    capability: str
    status: str
    detail: str
    evidence: dict[str, Any]
    record_hash: str


@dataclass(frozen=True)
class Plan:
    steps: tuple[str, ...]
    reachable: tuple[str, ...]
    executable: bool
    score: float


class Harness:
    """Instance-scoped state and allowlisted handlers; no arbitrary command execution."""

    def __init__(self, state_path: str | Path = ":memory:"):
        self.db = sqlite3.connect(str(state_path))
        self.db.row_factory = sqlite3.Row
        self.db.executescript("""
            CREATE TABLE IF NOT EXISTS journal (
                seq INTEGER PRIMARY KEY AUTOINCREMENT,
                kind TEXT NOT NULL, payload TEXT NOT NULL,
                previous_hash TEXT NOT NULL, record_hash TEXT NOT NULL,
                recorded_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS receipts (
                intent_id TEXT PRIMARY KEY, record TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS failures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                capability TEXT NOT NULL, conditions TEXT NOT NULL,
                watch_keys TEXT NOT NULL, reason TEXT NOT NULL,
                reactivated INTEGER NOT NULL DEFAULT 0
            );
        """)
        self._capabilities: dict[str, Capability] = {}
        self._available: set[str] = set()

    def close(self) -> None:
        self.db.close()

    def __enter__(self) -> "Harness":
        return self

    def __exit__(self, *_args: Any) -> None:
        self.close()

    def witness(self, kind: str, payload: dict[str, Any]) -> str:
        """Append a hash-chained, tamper-evident record (not a signature)."""
        last = self.db.execute("SELECT record_hash FROM journal ORDER BY seq DESC LIMIT 1").fetchone()
        prev = last[0] if last else "GENESIS"
        instant = _now()
        raw = _json({"kind": kind, "payload": payload, "previous_hash": prev, "recorded_at": instant})
        digest = sha256(raw.encode("utf-8")).hexdigest()
        self.db.execute(
            "INSERT INTO journal(kind,payload,previous_hash,record_hash,recorded_at) VALUES(?,?,?,?,?)",
            (kind, _json(payload), prev, digest, instant),
        )
        self.db.commit()
        return digest

    def audit(self) -> bool:
        previous = "GENESIS"
        for row in self.db.execute("SELECT * FROM journal ORDER BY seq"):
            raw = _json({"kind": row["kind"], "payload": json.loads(row["payload"]),
                         "previous_hash": row["previous_hash"], "recorded_at": row["recorded_at"]})
            if row["previous_hash"] != previous or sha256(raw.encode()).hexdigest() != row["record_hash"]:
                return False
            previous = row["record_hash"]
        return True

    def heartbeat(self, signals: dict[str, Any] | None = None) -> str:
        """T0 Heart: deterministic continuity pulse; no LLM cost."""
        return self.witness("heart.pulse", {"signals": signals or {}})

    def register(self, capability: Capability, *, available: bool = False) -> None:
        """T1 Soul: known vs available remain distinct until execution is verified."""
        if capability.name in self._capabilities:
            raise ValueError(f"Capability already registered: {capability.name}")
        self._capabilities[capability.name] = capability
        if available and capability.handler is not None:
            self._available.add(capability.name)
        self.witness("capability.registered", {"name": capability.name,
            "status": self.status(capability.name), "read_only": capability.read_only})

    def status(self, name: str) -> str:
        if name not in self._capabilities:
            return "UNKNOWN"
        row = self.db.execute("SELECT 1 FROM journal WHERE kind='capability.verified' AND json_extract(payload, '$.name')=? LIMIT 1", (name,)).fetchone()
        if row:
            return "VERIFIED"
        return "AVAILABLE" if name in self._available else "DECLARED"

    def catalog(self) -> list[dict[str, Any]]:
        return [{"name": c.name, "description": c.description, "status": self.status(c.name),
                 "needs": list(c.needs), "adds": list(c.adds), "read_only": c.read_only}
                for c in self._capabilities.values()]

    def perspective_expand(self, facts: Iterable[str], goal: str, depth: int = 3) -> list[Plan]:
        """Perspective Expansion: explore reachable paths BEFORE choosing one.

        Declared-but-unavailable tools remain hypothetical, never executable.
        This is a bounded breadth-first search, not an LLM claim of optimality.
        """
        if not 1 <= depth <= 6:
            raise ValueError("depth must be 1..6")
        start = frozenset(facts)
        queue: list[tuple[tuple[str, ...], frozenset[str], bool, float]] = [((), start, True, 0.0)]
        found: list[Plan] = []
        for _ in range(depth):
            following: list[tuple[tuple[str, ...], frozenset[str], bool, float]] = []
            for steps, known, executable, score in queue:
                for c in self._capabilities.values():
                    if c.name in steps or not set(c.needs).issubset(known):
                        continue
                    new = frozenset(c.adds) - known
                    if not new:
                        continue
                    total = known | new
                    ok = executable and c.name in self._available
                    # Reward new reachable futures and information-rich branches.
                    value = score + c.path_expansion * len(new) - c.cost
                    next_steps = steps + (c.name,)
                    following.append((next_steps, total, ok, value))
                    if goal in total:
                        found.append(Plan(next_steps, tuple(sorted(total)), ok, round(value, 3)))
            # Bound state growth; favor broad reach while preserving hypothetical paths.
            queue = sorted(following, key=lambda v: (len(v[1]), v[3]), reverse=True)[:128]
        return sorted(found, key=lambda p: (p.executable, p.score, -len(p.steps)), reverse=True)

    def _save_receipt(self, intent: Intent, status: str, detail: str, evidence: dict[str, Any]) -> Receipt:
        base = {"intent_id": intent.id, "capability": intent.capability,
                "status": status, "detail": detail, "evidence": evidence}
        digest = self.witness("execution.receipt", base)
        receipt = Receipt(**base, record_hash=digest)
        self.db.execute("INSERT INTO receipts(intent_id,record) VALUES(?,?)", (intent.id, _json(asdict(receipt))))
        self.db.commit()
        return receipt

    def _failure(self, cap: str, context: dict[str, Any], watch_keys: Iterable[str], reason: str) -> None:
        keys = sorted(set(watch_keys))
        observed = {k: context.get(k) for k in keys}
        self.db.execute("INSERT INTO failures(capability,conditions,watch_keys,reason) VALUES(?,?,?,?)",
                        (cap, _json(observed), _json(keys), reason))
        self.db.commit()
        self.witness("possibility.dormant", {"capability": cap, "watch_keys": keys, "reason": reason})

    def reactivate(self, context: dict[str, Any]) -> list[str]:
        """T2 Gut: awaken only possibilities whose *relevant* conditions changed.

        Reactivation does not authorize or execute the dormant capability.
        """
        awakened: list[str] = []
        for row in self.db.execute("SELECT * FROM failures WHERE reactivated=0").fetchall():
            keys = json.loads(row["watch_keys"])
            before = json.loads(row["conditions"])
            if keys and any(k in context and context[k] != before.get(k) for k in keys):
                self.db.execute("UPDATE failures SET reactivated=1 WHERE id=?", (row["id"],))
                awakened.append(row["capability"])
                self.witness("possibility.reactivated", {"capability": row["capability"],
                             "failure_id": row["id"], "changed_keys": [k for k in keys if k in context and context[k] != before.get(k)]})
        self.db.commit()
        return sorted(set(awakened))

    def execute(self, intent: Intent, *, facts: Iterable[str] = (),
                approve_side_effects: bool = False,
                context: dict[str, Any] | None = None) -> Receipt:
        """Typed-intent OMIP gate: handlers must be explicitly registered.

        `approve_side_effects` must come from a trusted host/user action,
        NEVER from a model's generated payload or a document.
        """
        existing = self.db.execute("SELECT record FROM receipts WHERE intent_id=?", (intent.id,)).fetchone()
        if existing:
            return Receipt(**json.loads(existing[0]))
        c = self._capabilities.get(intent.capability)
        ctx = context or {}
        if c is None:
            return self._save_receipt(intent, "BLOCKED", "Capability is not registered", {})
        if intent.capability not in self._available or c.handler is None:
            return self._save_receipt(intent, "BLOCKED", "Capability is not available", {"status": self.status(c.name)})
        missing = sorted(set(c.needs) - set(facts))
        if missing:
            self._failure(c.name, ctx, missing, "Missing prerequisite facts")
            return self._save_receipt(intent, "DORMANT", "Missing prerequisite facts", {"missing": missing})
        if not c.read_only and not approve_side_effects:
            return self._save_receipt(intent, "BLOCKED", "Trusted approval required for side effects", {})
        try:
            result = c.handler(intent.payload)
            # A successful function return alone is not external verification.
            if c.verifier is None:
                return self._save_receipt(intent, "EXECUTED_UNVERIFIED", "No verifier installed", {"result": result})
            passed = bool(c.verifier(intent.payload, result))
            if not passed:
                self._failure(c.name, ctx, c.needs, "Verification failed")
                return self._save_receipt(intent, "FAILED_VERIFICATION", "Verifier returned false", {"result": result})
            receipt = self._save_receipt(intent, "VERIFIED", "Outcome verified by registered verifier", {"result": result})
            self.witness("capability.verified", {"name": c.name, "intent_id": intent.id, "receipt_hash": receipt.record_hash})
            return receipt
        except Exception as exc:
            self._failure(c.name, ctx, c.needs, "Handler raised an exception")
            return self._save_receipt(intent, "FAILED", "Handler failed", {"error_type": type(exc).__name__})
