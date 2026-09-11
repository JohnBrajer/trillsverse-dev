# Three-Domain Permanence Matrix v0.1

Status: **CURRENT EVIDENCE MATRIX**  
Reconciled: **2026-09-11**  
Scope: Trillsverse.com, Lultrills.com, MyMindMine.com

## Rule

Permanence is not “the site is online.” It is the ability to identify canonical source, reproduce the build, identify the released version, preserve/export state, restore after loss, observe health, and roll back without inventing undocumented production state.

`KNOWN` means durable evidence exists. `UNKNOWN` means the required evidence has not been attached or verified. `N/A` is used only when the capability genuinely does not apply. Source state, deployed state, observed live state, and recovery state remain separate even when they temporarily point to the same SHA.

## Matrix

| Capability | Trillsverse.com / Gate | Lultrills.com | MyMindMine.com |
|---|---|---|---|
| Canonical source | **KNOWN** — `JohnBrajer/Trillsverse-Gate-FINAL`, `main`; source has advanced beyond the proven production release | **KNOWN** — `JohnBrajer/lultrills.com`, branch `John`; current source candidate `9958bfc6…` | **KNOWN** — `JohnBrajer/mymindmine.com`, `main`, currently `24491a51…` |
| Reproducible build | **KNOWN** — build exercised in CI and again during isolated recovery | **KNOWN** — Next.js `next build` | **KNOWN** — Next.js build |
| Deployment target | **KNOWN** — DigitalOcean | **KNOWN** — self-managed DigitalOcean | **KNOWN** — DigitalOcean + Docker + Caddy, port 3100 |
| Exact-SHA deployment | **KNOWN / OBSERVED** — `57837b9d08c0c9c89ad386e8a7351d0d269b49af`, deploy run `34493006357` | **UNKNOWN** | **KNOWN / OBSERVED** — health identifies `24491a51622b9dc65a9674c58768f06bc26391d4` |
| Current live SHA | **KNOWN / OBSERVED** — `57837b9d…`, deployedAt `2026-09-10T15:09:07Z` | **UNKNOWN** — root 200, `/api/health` 404 | **KNOWN / OBSERVED** — `24491a51…` @ `2026-09-10T12:50:16Z` |
| Public health verification | **KNOWN / OBSERVED** — CI + independent `/api/health` matched exact SHA | **PARTIAL** — root reachability observed; no release-identity health surface | **KNOWN / OBSERVED** — exact SHA reported by production health |
| Release receipt | **KNOWN / OBSERVED** — `production-deployment-34493006357`, SHA-256 recorded | **UNKNOWN** | **UNKNOWN** |
| Citizen Loop behavioral contract | **PASS** — live smoke + isolated persistence-failure guard both passed | N/A | N/A |
| Rollback procedure | **TESTED** — historical `8717e1bdea…` booted successfully against isolated restored data; forward recovery to `57837b9d…` also passed | **UNKNOWN** | **UNKNOWN** |
| Schema / migrations | **KNOWN** — PostgreSQL/Drizzle migration state reconstructed and checked | **N/A / no durable private app database evidenced** | **No shared Gate/Canon Postgres evidenced**; telemetry persistence exists separately |
| Backup procedure | **TESTED ON PRODUCTION DATA** — PostgreSQL custom dump created, readable, hashed | **N/A unless a data-bearing service is added** | **KNOWN mechanism only** — production execution still open |
| Off-host backup | **KNOWN / OBSERVED** — protected Actions artifact produced; 14-day retention recorded | **N/A unless data-bearing service exists** | **UNKNOWN production proof** |
| Restore procedure | **KNOWN / TESTED** — isolated restore completed from production backup | **N/A unless data-bearing service exists** | **KNOWN mechanism; production drill UNKNOWN** |
| Restore tested | **PASS** — isolated restore, invariants, exact-current reconstruction, rollback, forward recovery | **N/A unless data-bearing service exists** | **UNKNOWN production proof** |
| Public/private identity boundary | **PARTIAL / explicit core rules exist** | **Public artist/canon surface** | **KNOWN v0.1** — Constitutional Boundary v0.1 |
| Private-data export/delete contract | **PARTIAL / data-service-by-service closure still applies** | **N/A for current public content surface unless private data is introduced** | **BOUNDARY + mechanics defined; production lifecycle proof remains open** |
| Telemetry provenance/freshness | **IMPLEMENTED; observer-path method preservation now merged in source** | **Machine/authority surfaces public; formal telemetry contract not established as a core data product** | **PARTIAL** — allowlisted receipts + observed summaries documented |
| Canon / metadata / sitemap | **KNOWN in source** | **KNOWN in source/public surface** | **KNOWN in repo structure** |
| Ownership/dependency inventory | **PARTIAL** | **PARTIAL** | **PARTIAL** |

## 2026-09-11 evidence projection

### Trillsverse.com / Gate

The permanence state materially changed.

**Current proven production authority:** `57837b9d08c0c9c89ad386e8a7351d0d269b49af`.

Deployment evidence:

- deploy run `34493006357` succeeded;
- production health and an independent observer matched the exact SHA;
- deployment receipt artifact `production-deployment-34493006357` has SHA-256 `02bf54c06f7c84ea04e50e64ccbc053d4195bf25b9aa47a612b1cf37fbba5034`.

Recovery evidence from `JohnBrajer/Trillsverse-Gate-FINAL#80`:

- run `34545231055` produced a readable PostgreSQL custom-format production dump;
- dump SHA-256: `b310e31f6c684d45a5b7370a0d49ed74e1250806fa5aef6bccec39cba12ac58d`;
- protected off-host artifact created;
- production data restored into an isolated PostgreSQL target;
- schema/data invariants passed;
- exact current Gate + OMIP were rebuilt from `57837b9d…` against the restored database without a live-only patch;
- known-good `8717e1bdea356c9badefae1781705b5bc5da5dac` was built and booted as the rollback target;
- forward recovery to `57837b9d…` passed again;
- sanitized recovery receipt SHA-256: `10b61da31245b747552ea79fac15535e36cd030af61c2f447e05847fa044aeaf`.

Citizen Loop evidence from `JohnBrajer/Trillsverse-Gate-FINAL#72`:

- live smoke run `34544446358`, receipt `6968f764-d44a-4884-bfea-d7c9ae9a2d89`, passed Claim → stable identity → Passport → Guide → Frequencies → persisted First Transmission/Witness → reconnect → second-send idempotency;
- isolated failure-path run `34546187796` proved a forced persistence failure does not advance Frequency/Witness counts or the `first_transmission` rite;
- #72 is therefore behaviorally complete on the tested release.

The important remaining distinction is **source vs deployed state**. `main` has advanced after `57837b9d…`; newer source must remain non-live until a later exact deployment receipt and observation supersede the current production authority.

### Lultrills.com

Canonical source and current source head are known. Public root reachability is observed, but `/api/health` returned 404 in the September 10 cross-domain check. Therefore the exact live SHA remains **UNKNOWN**. Do not equate the branch head with production.

Issue `JohnBrajer/lultrills.com#11` remains the active permanence slice: establish a release-identity/health surface, name a known-good release, prove rollback, and then project that evidence here.

No durable private application database is currently evidenced. Backup/restore remains N/A unless a data-bearing service or production-only content state is introduced.

### MyMindMine.com

The production identity gap narrowed: production health reports exact SHA `24491a51622b9dc65a9674c58768f06bc26391d4` at `2026-09-10T12:50:16Z`, matching current `main`.

That **does not** close recovery. Issue `JohnBrajer/mymindmine.com#3` remains open and no production off-host telemetry backup + isolated production restore receipt has been attached. Existing PR #2 proves the lifecycle mechanism and isolated self-test only.

Accordingly:

- exact live SHA: **KNOWN**;
- health: **KNOWN**;
- production off-host telemetry backup: **UNKNOWN**;
- production restore tested: **UNKNOWN**;
- retention/erasure freeze: **UNKNOWN**;
- production rollback proof: **UNKNOWN**.

## Closure order from this state

1. **Public-state propagation:** keep State Registry and this matrix synchronized whenever a new deployment/recovery/behavior receipt lands.
2. **Gate:** only re-open recovery or Citizen Loop uncertainty if later evidence invalidates an invariant; otherwise treat `57837b9d…` as the proven baseline until superseded.
3. **MyMindMine #3:** execute production telemetry backup → protected off-host copy → isolated restore → retention/erasure freeze → rollback proof.
4. **Lultrills #11:** add exact release identity + health evidence and prove rollback/reconstruction.
5. **All three:** finish dependency/ownership inventories without leaking secrets or private host metadata.

## Permanence completion test

A critical domain is permanence-ready when another authorized operator can answer and execute, from durable records alone:

- Where is canonical source?
- What exact version is live?
- How do I reproduce the build?
- What state/data exists?
- How do I export/back it up?
- How do I restore it?
- Has restore actually been tested?
- How do I detect unhealthy deployment?
- What is the known-good rollback target?
- Which identity/private-data boundaries must survive reconstruction?

If any answer depends on one person remembering an undocumented step, that capability remains `UNKNOWN` or `PARTIAL`.
