# Three-Domain Permanence Matrix v0.1

Status: **CURRENT EVIDENCE MATRIX**  
Reconciled: **2026-09-14**  
Scope: Trillsverse.com, Lultrills.com, MyMindMine.com

## Rule

Permanence is not “the site is online.” It is the ability to identify canonical source, reproduce the build, identify the released version, preserve/export state, restore after loss, observe health, and roll back without inventing undocumented production state.

`KNOWN` means durable evidence exists. `UNKNOWN` means the required evidence has not been attached or verified. `N/A` is used only when the capability genuinely does not apply. Source state, deployed state, observed live state, and recovery state remain separate even when they temporarily point to the same SHA.

## Matrix

| Capability | Trillsverse.com / Gate | Lultrills.com | MyMindMine.com |
|---|---|---|---|
| Canonical source | **KNOWN** — `JohnBrajer/Trillsverse-Gate-FINAL`, `main`; source has advanced beyond the proven production release | **KNOWN** — `JohnBrajer/lultrills.com`, branch `John`; production authority verified at `3381895e…` | **KNOWN** — `JohnBrajer/mymindmine.com`, `main`, currently `24491a51…` |
| Reproducible build | **KNOWN** — build exercised in CI and again during isolated recovery | **KNOWN / TESTED** — production Next.js build | **KNOWN** — Next.js build |
| Deployment target | **KNOWN** — DigitalOcean | **KNOWN** — self-managed DigitalOcean | **KNOWN** — DigitalOcean + Docker + Caddy, port 3100 |
| Exact-SHA deployment | **KNOWN / OBSERVED** — `57837b9d08c0c9c89ad386e8a7351d0d269b49af`, deploy run `34493006357` | **KNOWN / OBSERVED** — `3381895eab608d57e53685c3107e0e0c9af26b38`; re-verified by run `34798401752` | **KNOWN / OBSERVED** — health identifies `24491a51622b9dc65a9674c58768f06bc26391d4` |
| Current live SHA | **KNOWN / OBSERVED** — `57837b9d…`, deployedAt `2026-09-10T15:09:07Z` | **KNOWN / OBSERVED** — `3381895e…` after forward recovery | **KNOWN / OBSERVED** — `24491a51…` @ `2026-09-10T12:50:16Z` |
| Public health verification | **KNOWN / OBSERVED** — CI + independent `/api/health` matched exact SHA | **KNOWN / OBSERVED** — root, `/api/health`, robots, llms, corpus verified on current release; rollback and forward-recovery public contracts passed | **KNOWN / OBSERVED** — exact SHA reported by production health |
| Release receipt | **KNOWN / OBSERVED** — `production-deployment-34493006357`, SHA-256 recorded | **KNOWN / OBSERVED** — `lultrills-permanence-11-34798401752`, SHA-256 `02403abb5e04768133100789758bbcbd1b9496bb67caaf907e07a3f8b6903de8` | **UNKNOWN** |
| Citizen Loop behavioral contract | **PASS** — live smoke + isolated persistence-failure guard both passed | N/A | N/A |
| Rollback procedure | **TESTED** — historical `8717e1bdea…` booted successfully against isolated restored data; forward recovery to `57837b9d…` also passed | **TESTED** — rollback to `305c526d51bb142defa8ab3ccc0d70ecaef5efb7`, public verification, then forward recovery to `3381895e…` all passed | **UNKNOWN** |
| Schema / migrations | **KNOWN** — PostgreSQL/Drizzle migration state reconstructed and checked | **N/A / no durable private app database evidenced** | **No shared Gate/Canon Postgres evidenced**; telemetry persistence exists separately |
| Backup procedure | **TESTED ON PRODUCTION DATA** — PostgreSQL custom dump created, readable, hashed | **TESTED ON PRODUCTION STATE** — private inquiry volume backed up during run `34798401752` | **KNOWN mechanism only** — production execution still open |
| Off-host backup | **KNOWN / OBSERVED** — protected Actions artifact produced; 14-day retention recorded | **KNOWN / OBSERVED** — protected `lultrills-inquiries-backup-34798401752`, 7-day retention, SHA-256 recorded | **UNKNOWN production proof** |
| Restore procedure | **KNOWN / TESTED** — isolated restore completed from production backup | **KNOWN / TESTED** — off-host inquiry backup restored into isolated path and integrity verified | **KNOWN mechanism; production drill UNKNOWN** |
| Restore tested | **PASS** — isolated restore, invariants, exact-current reconstruction, rollback, forward recovery | **PASS** — isolated restore/integrity proof in run `34798401752` | **UNKNOWN production proof** |
| Public/private identity boundary | **PARTIAL / explicit core rules exist** | **Public canon/artist surface + private inquiry state boundary now explicit** | **KNOWN v0.1** — Constitutional Boundary v0.1 |
| Private-data export/delete contract | **PARTIAL / data-service-by-service closure still applies** | **PARTIAL** — inquiry backup/recovery proven; broader retention/deletion semantics remain a separate policy surface | **BOUNDARY + mechanics defined; production lifecycle proof remains open** |
| Telemetry provenance/freshness | **IMPLEMENTED; observer-path method preservation now merged in source** | **Machine/authority surfaces public; formal telemetry contract not established as a core data product** | **PARTIAL** — allowlisted receipts + observed summaries documented |
| Canon / metadata / sitemap | **KNOWN in source** | **KNOWN in source/public surface** | **KNOWN in repo structure** |
| Ownership/dependency inventory | **PARTIAL** | **KNOWN for #11 recovery path / broader inventory can still evolve** | **PARTIAL** |

## 2026-09-14 Lultrills permanence projection

`JohnBrajer/lultrills.com#11` reached its actual recovery acceptance boundary.

**Current proven production authority:** `3381895eab608d57e53685c3107e0e0c9af26b38`.

Terminal recovery evidence from `Lultrills permanence drill` run `34798401752`:

- starting public release identity was verified before mutation;
- the production inquiry state was copied off-host without publishing inquiry payloads;
- protected backup artifact `lultrills-inquiries-backup-34798401752` was created with 7-day retention, artifact ID `10330663531`, SHA-256 `a8dc48efc2f61270cae372d712901a75c49adffd1336b30f402fc3cd42eb951a`;
- that off-host backup was restored into an isolated path and integrity verification passed;
- production was rolled back to previously public-verified `305c526d51bb142defa8ab3ccc0d70ecaef5efb7`;
- the rollback public acceptance contract passed;
- production was forward-recovered to exact `3381895eab608d57e53685c3107e0e0c9af26b38`;
- the forward-recovery public acceptance contract passed;
- sanitized 90-day evidence artifact `lultrills-permanence-11-34798401752` was preserved, artifact ID `10330766772`, SHA-256 `02403abb5e04768133100789758bbcbd1b9496bb67caaf907e07a3f8b6903de8`.

This supersedes the September 11 Lultrills permanence state below. The old `UNKNOWN` release identity and `N/A` backup/restore assumptions are historical and must not be used as current authority. Lultrills does have production-only mutable private inquiry state; its protected backup and isolated restore are now observed, and rollback/forward recovery are tested.

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

### Lultrills.com — historical September 11 state

At the September 11 projection, canonical source was known but exact production identity and recovery were still unverified. That state has now been superseded by the September 14 terminal recovery evidence above. Preserve this paragraph as historical provenance only.

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
3. **Lultrills #11:** terminal permanence evidence is complete; preserve/supersede it only from later exact observations.
4. **MyMindMine #3:** execute production telemetry backup → protected off-host copy → isolated restore → retention/erasure freeze → rollback proof.
5. **All three:** finish any remaining dependency/ownership inventories without leaking secrets or private host metadata.

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
