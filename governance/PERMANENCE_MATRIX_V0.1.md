# Three-Domain Permanence Matrix v0.1

Status: **CURRENT EVIDENCE MATRIX**  
Reconciled: **2026-08-24**  
Scope: Trillsverse.com, Lultrills.com, MyMindMine.com

## Rule

Permanence is not “the site is online.” It is the ability to identify canonical source, reproduce the build, identify the released version, preserve/export state, restore after loss, observe health, and roll back without inventing undocumented production state.

`KNOWN` means durable evidence exists. `UNKNOWN` means the required evidence has not been attached or verified. `N/A` is used only when the capability genuinely does not apply.

## Matrix

| Capability | Trillsverse.com / Gate | Lultrills.com | MyMindMine.com |
|---|---|---|---|
| Canonical source | **KNOWN** — GitHub canonical repo, `main` | **KNOWN** — `JohnBrajer/lultrills.com`, branch `John` | **KNOWN** — canonical private GitHub repo, `main` |
| Reproducible build | **KNOWN** — Node/npm build documented and exercised by CI | **KNOWN** — Next.js `next build` in package scripts | **KNOWN** — Next.js build in package scripts |
| Deployment target | **KNOWN** — DigitalOcean production path | **UNKNOWN current canonical target** — repository README describes Vercel or Railway readiness; exact current production operator/host needs evidence | **KNOWN by repo docs** — DigitalOcean + Docker + Caddy, port 3100 |
| Exact-SHA deployment | **KNOWN mechanism** — PR #50 / deploy bridge resets to triggering SHA | **UNKNOWN** | **UNKNOWN** |
| Current live SHA | **UNKNOWN** pending current release receipt | **UNKNOWN** | **UNKNOWN after latest source changes** |
| Public health verification | **KNOWN mechanism** — deploy bridge requires `HEALTH_URL` before receipt | **UNKNOWN formal health contract** | **UNKNOWN formal health contract** |
| Release receipt | **KNOWN mechanism** — SHA-256 receipt artifact after health success | **UNKNOWN** | **UNKNOWN** |
| Rollback procedure | **PARTIAL** — historical rollback evidence + deployment infrastructure exist; current standardized rollback proof remains to close | **UNKNOWN** | **UNKNOWN** |
| Schema / migrations | **KNOWN** — PostgreSQL/Drizzle migrations exist | **N/A / no durable app database evidenced by current package** | **No shared Gate/Canon Postgres evidenced**; telemetry persistence exists separately |
| Backup procedure | **KNOWN mechanism** — database backup script and production backup evidence exist | **N/A unless a data-bearing service is added** | **UNKNOWN for telemetry volume** |
| Off-host backup | **UNKNOWN current proof** | **N/A unless data-bearing service exists** | **UNKNOWN** |
| Restore procedure | **UNKNOWN current documented drill** | **N/A unless data-bearing service exists** | **UNKNOWN** |
| Restore tested | **UNKNOWN** | **N/A unless data-bearing service exists** | **UNKNOWN** |
| Public/private identity boundary | **PARTIAL / explicit core rules exist** — profile/citizenship/TV-PP security and owner checks exist; cross-domain identity must remain evidence-driven | **Public artist/canon surface**; no private shared identity evidenced | **KNOWN v0.1** — Constitutional Boundary v0.1 merged; no silent Gate/Canon identity join |
| Private-data export/delete contract | **PARTIAL / requires data-service-by-service closure** | **N/A for current public content surface unless private data is introduced** | **BOUNDARY DEFINED; implementation coverage UNKNOWN for future server-side memory** |
| Telemetry provenance/freshness | **IMPLEMENTED in source by public-state integrity v1; current live regression pending** | **Machine/authority surfaces public; formal telemetry contract not established as a core data product** | **PARTIAL** — allowlisted event receipts + observed summaries documented; retention/delete/backup closure remains |
| Canon / metadata / sitemap | **KNOWN in source** — canonical sitemap pipeline + entity graph | **KNOWN in source/public surface** — structured authority/evidence/crawler surfaces | **KNOWN in repo structure** — identity.json, llms.txt, robots, sitemap listed |
| Ownership/dependency inventory | **PARTIAL** | **PARTIAL** | **PARTIAL** |

## Domain notes

### Trillsverse.com / Gate

The production deployment contract is the strongest of the three domains. The repository documents:

`merge to main -> verify -> SSH deploy exact commit -> public health check -> SHA-256 receipt`

The deploy process explicitly says a successful merge is not equivalent to a successful deployment. That is now also the State Registry law.

Remaining closure is operational evidence, not invention:

- exact current DigitalOcean SHA / release receipt;
- current database/index proof;
- full Citizen Loop regression after later runtime changes;
- off-host backup and tested restore evidence;
- standardized rollback evidence attached to the current known-good release.

These are P0 issue #72 and permanence issue #73.

### Lultrills.com

The canonical source and build are clear, and the public authority/crawl layer is actively maintained. The remaining permanence weakness is **deployment reproducibility evidence**: the repository describes Vercel/Railway readiness, but the current canonical production target, exact live SHA, health contract, and rollback path are not yet proven in the governance record.

No database client or durable private application database is evidenced by the current package manifest. Do not invent a backup requirement for data that does not exist; if a data-bearing service is added later, it inherits the full backup/export/delete/restore contract.

### MyMindMine.com

The repository now provides both technical structure and constitutional data boundaries.

Current evidence establishes:

- DigitalOcean / Docker / Caddy / port 3100 deployment design;
- orientation notes remain browser-local;
- note contents do not reach telemetry;
- `/api/events` stores allowlisted interaction receipts in a persistent Docker volume;
- shared Postgres with Gate/Canon is not evidenced;
- Constitutional Boundary v0.1 is binding on `main`.

The next permanence step is therefore concrete: document and test export/backup/restore/deletion semantics for the telemetry volume **before** server-side personal memory expands.

## Closure order

1. **Gate P0:** exact live SHA + Citizen Loop current smoke + DB/index/release evidence.
2. **MyMindMine:** telemetry-volume export/delete/backup/restore contract and test.
3. **Lultrills:** name the canonical production host/deployment path, add exact-version and health evidence, document rollback.
4. **All three:** dependency/ownership inventory and restore evidence where state exists.
5. Feed every closed proof back into State Registry status and reconstruction fields.

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