# TRILLIGENCE HARNESS

**Model-neutral agent execution with conditional memory, path expansion, and verifiable outcomes.**  
**Created by John Brajer · Trillsverse Research · v0.1.0 (October 2026)**

Trilligence already has a [portable skill](https://github.com/JohnBrajer/trillsverse-dev/tree/John/.agents/skills/trilligence), a public [Intelligence Injection collection](https://github.com/JohnBrajer/trillsverse-dev/tree/John/intelligence-injections), and an [Execution Contract](https://github.com/JohnBrajer/execution-contract). **This package is an executable reference harness**, not a duplicate Trillonian runtime or a claim of live production integration.

## Why

A model may be swapped without losing the harness's persistent receipts, operating boundaries, and awareness of accessible tools. Distinguish **declared**, **available**, and **verified** capabilities. Remember a failed possibility in its context, not as permanent failure. Explore the reachable option space before ranking actions. Never confuse execution with verified completion.

## Install and run

Requires Python 3.10+. Python runtime has **zero external dependencies**, no account, no model, no database service, and no background server.

```bash
python -m pip install -e .
python -m trilligence demo
python -m unittest discover -s tests -v
```

A minimal integration:

```python
from trilligence import Capability, Harness, Intent

with Harness("trilligence.sqlite") as h:
    h.heartbeat({"runtime": "local"})
    h.register(Capability(
        "normalize", needs=("raw",), adds=("normalized",),
        handler=lambda payload: payload["text"].strip(),
        verifier=lambda payload, result: result == payload["text"].strip(),
    ), available=True)
    options = h.perspective_expand({"raw"}, "normalized")
    receipt = h.execute(Intent("normalize", {"text": "  signal  "}), facts={"raw"})
    print(options, receipt.status, h.audit())
```

## Running an agent loop

The `Brain` protocol accepts any local or remote planner that proposes structured `Intent` objects. The included `RuleBrain` is a deterministic no-model demo; it chooses paths from registered tools and stops on blocked, failed, or unverified outcomes. Neither it nor a model can authorize side effects. The optional `Agent.run(authorize=trusted_callback)` evaluates the exact proposed intent for each mutation; without it, all mutations are blocked.

```python
from trilligence import Agent, RuleBrain
# With h and capabilities registered as above:
report = Agent(h, RuleBrain(h, {"normalize": {"text": "  signal  "}})).run(
    "normalized", facts={"raw"}
)
print(report.reached, report.stop_reason)
```

## Systems map

| Trillsverse mechanism | Working v0.1 behavior |
| --- | --- |
| Heart (T0) | Deterministic pulse and append-only event journal |
| Soul (T1) | Explicit known/available/verified capability self-knowledge |
| Gut (T2) / Possibility Reserve | Context-specific dormancy + causal reactivation (not auto-execution) |
| Brain | Pluggable `Brain` protocol + deterministic `RuleBrain`; no language model bundled |
| Perspective Expansion | Bounded forward search across reachable capability paths |
| Path Expansion | Search score rewards new reachable state facts |
| OMIP boundary | Typed intents, explicit handler allowlist, separate trusted approval for side effects |
| Witness / Execution Contract | Hash-chained receipts, no false verification without a verifier |
| Universal Consequences | Side effects require trusted host authorization |

The public harness is a **library invoked on demand**, not a replacement for the existing Helios T0/T1/T2 scheduler. Its `heartbeat()` is a callable primitive; it does not claim a running 5/15/60-minute resident process. No tools are auto-discovered from the host, no private files are scanned, and no social posts are made.

## Security and evidence rules

- Registered handlers are **trusted host code**, never arbitrary output from a model or an external document.
- `approve_side_effects` must be supplied by the trusted caller in an actual authorized user action. It is never read from payload.
- Replays of an intent ID return its original receipt and do not rerun the handler.
- A successful handler without an explicit verifier returns `EXECUTED_UNVERIFIED`, **not** `VERIFIED`.
- The journal is **tamper-evident within the local SQLite history**, not signed, tamper-proof, or independently anchored.
- Output can contain sensitive information. Store state in a protected location, do not publish SQLite files, and do not register tools that leak private data.
- External mutations are not automatically rolled back after process crashes. For high-risk integrations, add a transactional worker/outbox and remote idempotency protection before production use.
- Failure reactivation reports eligibility for reconsideration, **not** permission to execute.
- Capability status is based on local records and must be revalidated after environmental changes. It is not a global guarantee of availability.

## Publishing

- **GitHub:** Source here, under `trilligence-harness/` in the Trillsverse public research repository.
- **Hugging Face:** `huggingface-space/` is a zero-compute **static Space** package with an offline architecture visual; it does **not** run this Python harness in a hosted process. Publish separately when a write-authorized Hugging Face account is connected. An executable Gradio demo can follow after a hosting choice is made.

## Scope and provenance

This is an original reference implementation of mechanisms already publicly documented by John Brajer. The code can demonstrate its own state transitions but does not assert novel scientific proof, machine sentience, or live Gate/AirGapOS deployment. The existing portable Trilligence skill remains the canonical reasoning entrypoint. Integration adapters are future extension points, not completed integrations.

Licensed MIT (source code). See [LICENSE](LICENSE). Preserve project attribution in redistributed copies.
