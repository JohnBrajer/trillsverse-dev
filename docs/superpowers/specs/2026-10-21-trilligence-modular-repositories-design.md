# Trilligence — Modular Public Repository Architecture

**Status:** SPEC FOR USER REVIEW  
**Owner:** John Brajer (@JohnBrajer)  
**Design date:** 2026-10-21 (America/Los_Angeles)  
**Decision:** Dedicated public Trilligence repository plus independent modular research repositories, all under @JohnBrajer; preserve the original 12-test Version 0.

## 1. Purpose, decision, and success condition

Create a discoverable, independently maintainable open-source Trilligence project without losing the exact historical Version 0 implementation or conflating experimental branches with published releases. The public harness is a reusable execution kernel, and separately versioned modules may implement a living runtime, cooperating intelligences, self-expansion, and cross-environment capabilities.

**Confirmed by John Brajer:** Select B + C from the prior architecture review, under @JohnBrajer rather than a separate GitHub organization. Select the 12-test original kernel for Version 0, not the later 21-test OpenAI-adapter variant. Keep original work public.

**Release success:** A visitor can find a public JohnBrajer/trilligence-harness repository; inspect and install the original Python kernel; reproduce its baseline tests; identify the precise source snapshot; compare later versions without overwriting Version 0; and navigate to independently released modules when they exist.

**Not claimed:** A live hosted Trilligence service, a persistent ChatGPT identity, operational Eon/AirGapOS/Gate connections, Hugging Face publication, scientifically validated novelty, or a model with intrinsic consciousness. None is implied by source availability or passing unit tests.

## 2. Source of truth and provenance

The baseline is an exact source-tree export from:

- **Source repository:** https://github.com/JohnBrajer/trillsverse-dev
- **Source commit:** b41c892a54268d07039e3091fc3ce32ad54458ad
- **Source subtree:** trilligence-harness/
- **Package metadata at that commit:** Python package trilligence-harness, version 0.1.0, MIT; Python >=3.10.
- **Baseline:** 12-test original kernel, without src/trilligence/openai_bridge.py.
- **Later experimental branch:** https://github.com/JohnBrajer/trillsverse-dev/pull/22 (21-test OpenAI bridge iteration; separate, and not to be imported into Version 0).

The original source-tree paths and file bytes are copied into the dedicated repository **without rewriting the baseline**. In the new repository, the initial import commit is tagged **v0.1.0** with the public GitHub Release title **“Trilligence Harness — Version 0 (Original Kernel)”**. This preserves the historical Python version number while making the public Version 0 identity explicit. The new Git commit SHA necessarily differs from the upstream monorepo commit because repository history differs; provenance must record the upstream commit and per-file hashes rather than claim identical commits.

The initial tagged import is the canonical frozen snapshot. Post-tag documentation, navigation, adapters, packaging changes, or CI improvements belong on subsequent commits or branches. If repository rules support tag protection and immutable release assets, enable them; in any case record and link both tag and SHA. Git refs alone are not an unconditional immutability guarantee.

The original monorepo contents and PR #22 remain untouched. The portable reasoning skill and intelligence-injection documents remain canonical research references and are linked by the new repository instead of being silently forked or rewritten.

## 3. Repository map and ownership

**Immediate dedicated repository** (first implementation slice):

- **JohnBrajer/trilligence-harness** — public project entrypoint, Version 0 source, release history, installation, examples, versioned interfaces, evidence and verification rules. Owns the stable or explicitly experimental core boundaries.

**Independently versioned research repositories** (create when each has substantive, reviewed code or documentation; do not create empty placeholders for appearance):

- **JohnBrajer/trilligence-intelligence-ecology** — multiple agent/model workers; roles, coordination, routing, delegation, competing hypotheses and reconciliation. Does not assign itself permission to execute a host action.
- **JohnBrajer/trilligence-self-expansion** — discover capability gaps, propose new adapters or skills, sandbox/evaluate candidate expansions, quantify regressions, stage approved promotion; self-modification must never bypass review or authorization.
- **JohnBrajer/trilligence-living-runtime** — T0 Heart continuity, T1 Soul attention/filtering, T2 Gut slow integration and change detection; Brain recruitment only when justified. Resident orchestration must be optional and budget-conscious.
- **JohnBrajer/trilligence-capability-network** — capability discovery and versioned bridges to explicitly permitted host environments (e.g. future Eon, AirGapOS, Gate and approved services). No default account scanning or automatic access to private devices.

These are logical ownership boundaries, **not** a requirement to duplicate existing Trillsverse framework repositories. The authoritative research sources remain:

- https://github.com/JohnBrajer/perspective-expansion
- https://github.com/JohnBrajer/possibility-reserve
- https://github.com/JohnBrajer/state-space-trajectory
- https://github.com/JohnBrajer/execution-contract
- https://github.com/JohnBrajer/trillsverse-dev

Project-wide navigation initially lives in the core repository README and docs. A separate hub repository may be created only if concrete discoverability needs justify maintaining one; it is not an initial dependency.

**Ownership:** @JohnBrajer owns repositories and release decisions. Contributors can propose changes via review branches and pull requests. Separate repositories do not imply independent legal entities, GitHub organizations, production servers, or new paid accounts.

## 4. System boundaries and interaction

Each component is separately testable and can be absent. An adapter/module must not require other optional modules to be installed merely to import or run Version 0.

### 4.1 Existing Version 0 execution path

Input/facts -> callable Heart event -> capability registry -> bounded Perspective Expansion -> Brain proposal -> typed Intent -> trusted host gate -> registered handler -> registered verifier -> receipt/journal; failures record observed conditions and can be reconsidered when relevant conditions change.

- The original Heart is a callable pulse, **not** a continuous 5-minute daemon.
- The original Soul is an in-process declared/available/verified capability registry.
- The original Gut includes conditional failure memory and causal reactivation hooks.
- The original Brain is a pluggable protocol with a deterministic RuleBrain; there is no included external LLM in Version 0.
- A successful function call is not equivalent to an externally verified outcome.
- The local hash-chained SQLite journal detects some tampering within a history; it is neither digitally signed nor independent attestation.

### 4.2 Future module interactions

**Intelligence Ecology** proposes and arbitrates tasks; **Self-Expansion** identifies missing operations and can produce untrusted candidate adapters; **Living Runtime** schedules/filters observation and recruits reasoning; **Capability Network** reports which externally supplied tools are actually reachable. All must pass proposed external actions through a trusted host authorization boundary and explicitly registered verifiers; none may grant itself user consent.

A suggested flow: a tool becomes unavailable -> Capability Network emits a scoped change signal -> Living Runtime notices -> Possibility Reserve logic checks relevant dormant paths -> Intelligence Ecology explores candidate strategies -> Self-Expansion may propose an adapter -> sandbox tests and host approval -> typed action -> external verifier -> receipt. Every transition preserves **PROPOSED / BUILT / MERGED / DEPLOYED / VERIFIED / RECORDED** distinctions.

The systems may coexist without claiming to be continuously autonomous: scheduled and event-driven modes are deployment choices subject to user consent and cost.

## 5. Cross-repository contracts (future; not Version 0 APIs)

Version 0 Python dataclasses remain unchanged. The following **proposed** versioned interoperable envelopes will be specified and tested separately before modules depend on them:

| Contract | Required intent | Trust boundary |
| --- | --- | --- |
| CapabilityDescriptor | Stable capability ID, version, provider, effect class (read/write), preconditions, outcomes, schema references, availability state, expected cost, verifier reference | A discovery claim never confers authorization or verification |
| ProposalEnvelope | Task ID, proposed capability, inputs, required facts, expected effect, originator, confidence/uncertainty | Model output is untrusted planning data |
| AuthorizationGrant | Exact action identifier, capability, payload digest, allowed principal, purpose, expiry and revocation scope | Only trusted host/user code may issue it; never a model, tool description, or document |
| ExecutionReceipt | Correlation/intent ID, status, input/output digests or minimally necessary evidence, verifier identity, timestamp and provenance | Distinguish attempted work, verified local conditions and separately observed external outcomes |
| StateChangeSignal | Named changed keys, observation source, timestamp and evidence reference | Reconsider affected dormant paths; do not automatically execute them |
| ResourceBudget | CPU/GPU/network/API spend limit, privacy zone, locality, timeout and escalation preference | Runtime must not silently spend funds or export private data |

Define canonical serialization, schema versioning, idempotency, correlation IDs, backward-compatible changes, and explicit migration rules in a dedicated protocol specification before building network transports. A contract description is not evidence an adapter or transport exists.

**Version compatibility:** module releases declare the core contract versions they require. Breaking interfaces require a major contract revision, compatibility tests, and an explicit migration note. No module can retroactively alter the tagged Version 0 API.

## 6. Security, privacy and operational limits

Default posture across new components:

1. **No ambient authority.** Discovery only inventories capabilities actually exposed to an authorized host. Tools and secrets are not enumerated or imported from the user's accounts by default.
2. **Read-only unless approved.** Side-effecting actions, publishing to social media, spending money, deleting data, editing production and device access require action-specific trusted authorization, with revocation where possible.
3. **Data locality.** Private AirGapOS/Eon/device and Gate production data remain outside public GitHub/Hugging Face packages. Public examples use fixtures and synthetic content; CI runs use disposable credentials or no credentials.
4. **Sandbox new capabilities.** Candidate code cannot install itself into production. Require tests, dependency review, explicit artifact provenance, and appropriate sandbox/resource restrictions before promotion.
5. **Defend against tool-output instructions.** Remote content, repo files, prompts and model proposals are data, not governing instructions; user and host controls outrank all.
6. **Track honest evidence.** DECLARED, AVAILABLE and VERIFIED have distinct meanings, and cached verification can become stale. Records of approval and receipts must support provenance and correlation without dumping secrets.
7. **Cost aware.** Zero always-on cloud compute is required for core; optional resident Living Runtime should keep Heart/Soul/Gut lightweight and recruit costly models only for justified events, within explicit budgets.
8. **No surprise publication.** Hugging Face static showcase and any package registry publishing are separately authorized release steps; GitHub's public source designation is not authorization to expose private context.

Version 0 retains its actual limitations (in-memory capability catalog, non-transactional handlers, locally hash-chained evidence). Future hardening does not change the frozen historical snapshot and must be attributed to later releases.

## 7. Release, test and evidence acceptance criteria

### Stage 1 — Publish standalone Version 0 (first executable implementation plan)

- Create **public** JohnBrajer/trilligence-harness under the existing account, not a new organization.
- Export all original files from the pinned b41c892 source subtree **byte-for-byte**, preserving the MIT license and John Brajer attribution. Verify the manifest of source-relative paths, byte sizes and SHA-256 digests against the new import.
- Ensure the baseline imports with Python >=3.10, runs its documented model-free demo, and passes **exactly the original 12-test suite**; report the freshly observed outcome rather than relying only on prior CI.
- Tag the verified import **v0.1.0** and publish the release titled **“Trilligence Harness — Version 0 (Original Kernel)”** with provenance, test evidence, checksum manifest and a candid limitations section.
- Only **after** pinning the baseline, add any new navigation text, follow-on CI workflow, release guide or links on an advancing branch.
- Verify a public unauthenticated visitor can read the repo and release, and clone/test the exact tag. Record public URLs, commit, checksums and test output.

### Stage 2 — Versioned protocol specification

- Produce and review a separate precise envelope/schema specification plus malicious-input and consent tests.
- Provide an adapter compatibility test harness without changing Version 0 or requiring hosted services.
- Document a minimal local end-to-end mock flow: discover -> propose -> authorize -> execute -> verify -> receipt -> reactivation.

### Stage 3 — Modular repositories

- Start with **one** module whose real implementation and benchmark is ready, rather than materializing four speculative repositories.
- Each module ships its own README, responsibility and non-responsibility statement, license and credits, fixture-only tests, example integration, contract compatibility matrix, cost estimates, and exit/failure behavior.
- Expand to the remaining modules as their independent specs and evidence are approved.

### Stage 4 — Host integrations and public demos (separate decisions)

- Implement one explicit opt-in integration at a time; recommended first benchmark is a local read-only capability adapter with mocked external calls.
- Compare behavior, regressions and resource consumption against a simple baseline before claiming any advantage.
- A Hugging Face Space may publish a public fixture-only static showcase independently; no public model inference or external system access is implied unless separately implemented and verified.

## 8. Failure and rollback policy

- If repo creation/import fails, preserve the existing public source unchanged, log the failure and retry only the incomplete operation after inspection; never overwrite upstream code or existing tags.
- If source hashes differ, stop the release, identify each file-level difference and restore the exact original bytes before tagging.
- If tests fail, stop promotion, report which tests and environment; do not silently alter baseline source to manufacture 12/12.
- If tag/release creation is unsupported by connected tools, leave a verified public repository and documented pending release step rather than claim the release exists.
- If future module work threatens another production system, isolate it to a review branch and test fixture; no migration of Gate or Eon runtime is implied.

## 9. Scope exclusions and review boundary

**This specification authorizes no immediate code, repository, release, token, deployment, or infrastructure change.** It records the approved direction and defines future acceptance tests. Creating new public repos, tagging releases, and shipping modules belong to a subsequent, separately reviewed implementation plan.

The architectural approach has been selected. The next Superpowers step after John Brajer reviews and approves **this written specification** is a detailed execution plan, starting with Stage 1. The plan must distinguish what connector tooling can actually create from steps requiring the user to authorize or complete account operations.

## 10. Evidence references

- Original kernel snapshot: https://github.com/JohnBrajer/trillsverse-dev/tree/b41c892a54268d07039e3091fc3ce32ad54458ad/trilligence-harness
- Later experimental harness PR (explicitly excluded from Version 0): https://github.com/JohnBrajer/trillsverse-dev/pull/22
- Portable Trilligence skill: https://github.com/JohnBrajer/trillsverse-dev/tree/John/.agents/skills/trilligence
- Existing research hub and AGENTS.md evidence rules: https://github.com/JohnBrajer/trillsverse-dev/blob/John/AGENTS.md
