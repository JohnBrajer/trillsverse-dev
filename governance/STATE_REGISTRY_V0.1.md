# Trillsverse State Registry v0.1

Status: **FOUNDATIONAL SPECIFICATION**  
Effective: **2026-08-24**  
Owner: Trillsverse governance / operator layer

## Problem

Trillsverse has reached the point where source state, merged state, deployed state, verified state, and governing-record state can diverge.

The State Registry exists to answer, without guesswork:

> What exists? Where? In what version? According to whom? Since when? Is it live? What supersedes it? What depends on it? Can it be reconstructed?

The registry is not a marketing surface and does not convert repository existence into production truth.

## State law

The registry uses a monotonic evidence ladder:

`PROPOSED -> BUILT -> MERGED -> DEPLOYED -> VERIFIED -> RECORDED`

These are separate facts.

- **PROPOSED** — specification, issue, design, or branch intent exists.
- **BUILT** — an inspectable artifact exists in source control or another durable source.
- **MERGED** — the artifact is included in the canonical/default production source branch.
- **DEPLOYED** — evidence shows a named artifact/version was released to the named environment.
- **VERIFIED** — post-deploy observation confirms the intended behavior/state.
- **RECORDED** — the governing durable record has been updated with the evidence.

A later status never fills an earlier evidence gap by implication. If deployment evidence is absent, `MERGED` remains true and `DEPLOYED` remains `UNKNOWN`.

## Required rule: UNKNOWN != ABSENT

`UNKNOWN` means evidence has not yet been attached or inspected. It does not mean the thing does not exist.

The registry must never silently rewrite `UNKNOWN` as `NO`, `FAILED`, `NOT LIVE`, or `ABSENT`.

## Evidence classes

Each state transition should name its evidence class.

| Transition | Minimum evidence |
|---|---|
| PROPOSED -> BUILT | artifact path + immutable version/commit |
| BUILT -> MERGED | canonical branch inclusion / merged PR |
| MERGED -> DEPLOYED | deployment receipt, environment release record, or named live release evidence |
| DEPLOYED -> VERIFIED | health check, smoke test, observed response, schema check, or equivalent post-release proof |
| VERIFIED -> RECORDED | durable governing-record reference + timestamp |

## Registry object

Every material object gets a stable `stateId`.

Minimum fields:

```json
{
  "stateId": "tv:component:example",
  "name": "Example component",
  "class": "runtime-component",
  "ownerSurface": "trillsverse.com",
  "source": {
    "repository": "owner/repo",
    "branch": "main",
    "path": null,
    "version": "commit-sha"
  },
  "status": {
    "proposed": true,
    "built": true,
    "merged": true,
    "deployed": "unknown",
    "verified": "unknown",
    "recorded": false
  },
  "evidence": [],
  "dependencies": [],
  "supersedes": [],
  "supersededBy": [],
  "reconstruction": {
    "sourceAvailable": true,
    "buildDocumented": false,
    "dataExportDocumented": false,
    "restoreTested": false,
    "rollbackDocumented": false
  },
  "observedAt": "2026-08-24T00:00:00Z"
}
```

## Object classes

v0.1 recognizes:

- `domain`
- `repository`
- `runtime-component`
- `public-surface`
- `private-surface`
- `database-schema`
- `migration`
- `deployment`
- `telemetry-contract`
- `canon-document`
- `doctrine-document`
- `historical-record`
- `research-artifact`
- `agent-methodology`
- `identity-contract`
- `governance-contract`
- `external-authority-surface`

Additional classes may be added without weakening the evidence ladder.

## Precedence and supersession

The State Registry does not delete history merely because a new artifact exists.

When state changes:

1. preserve the prior object/version;
2. add `supersededBy` / `supersedes` links;
3. record the effective date;
4. keep historical evidence queryable;
5. ensure default retrieval prefers the strongest current non-superseded record for current-state questions.

## Dependency model

Dependencies are typed edges, not prose-only notes.

Recommended relationship types:

- `requires`
- `deploys-with`
- `reads-from`
- `writes-to`
- `derives-from`
- `governed-by`
- `publishes-to`
- `verified-by`
- `backed-up-by`
- `restored-by`
- `supersedes`

This allows the registry to answer impact questions before deployment or retirement.

## Reconstruction contract

For critical components, `reconstruction` should eventually make these independently answerable:

- Where is canonical source?
- How is a build reproduced?
- What secrets/config are required without storing secrets in the registry?
- What data must be exported?
- How is schema recreated/migrated?
- Where is the latest known-good backup?
- Has restore been tested?
- What is the rollback target?
- Which external services/owners are required?

A component is not considered permanence-complete merely because its code is in GitHub.

## Three-domain binding

### Trillsverse.com / Gate

Registry priority: runtime versions, citizen loop, schema/migrations, deployment receipts, continuity/intelligence primitives, public telemetry, rollback.

### Lultrills.com / Canon

Registry priority: canonical URLs, entity identity, versioned canon, releases, public evidence classes, crawl/index surfaces, supersession.

### MyMindMine.com

Registry priority: source/host, public/private boundaries, telemetry contract, local/server data behavior, identity bridges, export/deletion/retention, rollback.

## Agent contract

Agents may propose and append registry observations, but must not upgrade evidence status without the required evidence class.

- Architecture/code agents can normally prove `BUILT` and `MERGED`.
- Release/ops agents can prove `DEPLOYED` and produce deployment receipts.
- Smoke/evidence agents can prove `VERIFIED`.
- Notion/governance can prove `RECORDED` after attaching the evidence.

No agent can say "live" solely from a merged commit.

## Initial current-state consequence

The August 2026 reconciliation demonstrates the need for this registry:

- the governing Control Room remained on an August 10 snapshot;
- Gate source advanced through Runtime Dispatcher, Intelligence Injections, Semantic Gravity, Eon/continuity work, Trillaxis, deployment infrastructure, topology repair, and other changes;
- public authority/crawl surfaces also advanced;
- some exact production-SHA and post-deploy verification states require evidence rather than inference.

That divergence is the first formal State Registry use case.

## 2026-09-11 reconciliation consequence

The September recovery + behavior receipts demonstrate the second use case: **source can advance while a different immutable release remains the strongest observed production authority**.

Current evidence requires the registry to hold all of these facts simultaneously:

- Gate `main` has advanced beyond the currently proven production release;
- Gate production is explicitly observed at `57837b9d08c0c9c89ad386e8a7351d0d269b49af` until a later deployment receipt supersedes it;
- deploy run `34493006357` plus independent health observation proves that exact release was deployed and healthy;
- recovery run `34545231055` proves a real production PostgreSQL backup, protected off-host copy, isolated restore, exact-release reconstruction, rollback to `8717e1bdea356c9badefae1781705b5bc5da5dac`, and forward recovery without a live-only patch;
- Citizen Loop live smoke run `34544446358` proves current success-path behavior and idempotency;
- isolated failure-guard run `34546187796` proves failed persistence does not falsely advance Witness or First Transmission state;
- MyMindMine production health identifies exact live SHA `24491a51622b9dc65a9674c58768f06bc26391d4`, while production telemetry restore remains `UNKNOWN` because issue #3 has not produced that receipt;
- Lultrills root reachability is observed while `/api/health` remains 404, so its exact live SHA remains `UNKNOWN` even though canonical source has advanced.

The public-safe evidence projection is recorded in `governance/evidence/2026-09-11-gate-recovery-citizen-loop.json` and reflected in both current machine snapshots. Historical evidence remains referenced rather than overwritten.

## v0.1 implementation path

1. Keep the schema machine-readable in `governance/state-registry.schema.json`.
2. Maintain a current snapshot in `governance/state-registry.current.json`.
3. Never overwrite historical release receipts; reference them.
4. Later, automate ingestion from GitHub merge events, deployment receipts, live smoke results, and Notion governing records.
5. Expose a public-safe projection only after private paths, internal topology, credentials, and sensitive operational metadata are excluded.

## Non-goals

v0.1 does not:

- claim blockchain immutability;
- expose credentials or private infrastructure details;
- treat every commit as a new governance object;
- replace GitHub, deployment logs, Notion, or Canon;
- convert creative narrative into runtime telemetry;
- pretend incomplete evidence is certainty.

The registry is a **truth-routing layer across existing evidence systems**.
