# Trilligence Harness v0.1 — Architecture & decisions

Date: 2026-10-20. Author: John Brajer (Trillsverse).

## Architectural constraints

The public harness must remain self-contained, free of paid compute, observational by default, and explicitly separate from the production Gate and the Helios resident runtime. It must preserve the existing Trilligence skill and public research mechanisms rather than rewriting them.

## Control flow

```
Perception/input -> Heart: journal pulse -> Soul: capability registry
          -> Perspective Expansion: map paths -> Brain: optional evaluator
          -> typed Intent -> OMIP: known tool / facts / authorization
          -> host-registered handler -> registered verifier
          -> Witness: durable receipt and evidence stage
          -> Gut: failure conditions and possible reactivation
```

## Runtime boundary

- Public v0.1: synchronous Python library, optional SQLite file, stdlib only.
- No external model APIs, filesystem actions, unrestricted shell, networking, or background daemon by default.
- Runtime adapters can supply separately trusted handlers, pluggable Brain proposals, exact-intent host approval callbacks, verifiers, and a scheduler. A synchronous `Agent` loop stops on failure, unknown paths, or maximum steps.
- Identity, model weights, and host environment are distinct. A `heartbeat` call is not a resident T0 process.

## Epistemic states

- `UNKNOWN`: no registered capability.
- `DECLARED`: known description but not connected to a live host implementation.
- `AVAILABLE`: host registered a handler and marked it usable; not empirically verified.
- `VERIFIED`: executed outcome passed a registered verifier at least once; check staleness in real integrations.

Execution receipts use `BLOCKED`, `DORMANT`, `FAILED`, `FAILED_VERIFICATION`, `EXECUTED_UNVERIFIED`, or `VERIFIED`.

## Publication boundary

A separate path-scoped GitHub Actions workflow prepares the Hugging Face static Space. It requires an explicit `HF_TOKEN` secret and `HF_SPACE_REPO_ID` repo variable; missing configuration means a no-op. It does not access private Trillsverse production surfaces.

## Boundaries and known shortcomings

Verification is defined by supplied verifiers; they are trusted host code but not a universal guarantee of real-world success. SQLite records are locally hash-chained but do not prevent whole-file replacement, and handlers are non-transactional. The registry is in-memory per process; receipts are persisted. Concurrency/process leasing, secrets, multi-tenant isolation, OAuth, remote acknowledgement, permission revocation, external truth observation, actual model routing, production OMIP/Gate adapters, and AirGapOS integration remain outside v0.1.

## Evidence acceptance tests

1. Unknown tools are blocked.
2. Capabilities exist at declared/available/verified stages without false promotion.
3. Mutations need a trusted approval parameter; payload approval is ignored.
4. Intent replay does not repeat execution.
5. Failure in one condition is reactivated only by changes in relevant watched conditions.
6. Paths include dormant hypothetical options while distinguishing them from executable paths.
7. Journal mutation invalidates its hash chain.
8. Reopening SQLite preserves the chain and receipt records.

The following iterations should use GitHub PR tests, explicit host adapters, and separate integration benchmarks, not assertions based on design documents.

## OpenAI model bridge (v0.1 extension)

`OpenAIResponsesBrain` is an optional outbound HTTP adapter implementing `Brain`. The default package and resident Heart remain model-free. The OpenAI API key is read at request time, never inserted into model input, and no HTTP request occurs until the host invokes `propose`. Requests use `store: false` and strict structured outputs with a JSON-string payload, followed by local structural validation; tool registration and side-effect authorization remain exclusively in trusted host code. The adapter intentionally sends only goal, fact names, capability metadata, and receipt status summaries; hosts must avoid registering confidential strings as facts or tool descriptions. Tests use a mocked transport and do **not** establish successful billing/authentication against a live OpenAI project.

Connection is directional: the harness can call the OpenAI Responses API, not control or inherit an existing ChatGPT session. A future ChatGPT-facing custom app/MCP server requires network hosting, authentication, installation, and consent; nothing here silently grants remote access or makes the assistant a persistent daemon.
