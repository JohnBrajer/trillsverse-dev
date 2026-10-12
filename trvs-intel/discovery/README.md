# TRVS.INTEL owned-site discovery pulse v0.1

**Purpose:** detect new/updated public pages across the four Trillsverse-owned domains and notify IndexNow only after live checks. This complements the local TRVS.INTEL capsule relay; it does not deploy that relay or change production sites.

## Automatic operation
- GitHub Actions runs every 3 hours, on changes to the discovery engine after merging to `John`, or by manual dispatch. No Helios or DigitalOcean connection required.
- Only `https://trillsverse.com`, `https://lultrills.com`, `https://mymindmine.com`, and `https://reallythatmagazine.com` (and their www hostnames) are allowed.
- Fetches site sitemaps and safe same-domain nested sitemaps. The first successful scan records a baseline **without announcing all old pages**.
- Later scans compare URL + sitemap `lastmod`, preserve pending changes, and verify an HTML 200 with no detected noindex or conflicting canonical before IndexNow submission. Each site processes up to 40 pending changes per run.
- Submissions require a publicly verifiable root key file on the exact target host. A matching per-site Actions secret takes precedence; the previously published shared key is an automatic fallback for the four allowlisted sites only. HTTP 200/202 is a notification receipt, not indexing.
- Failed scans, missing credentials, refused pages, transient 429/5xx responses, and pending retry status are recorded independently. A complete failure marks the workflow failed **after** preserving receipts.
- Durable state and a rolling view of the last 5,000 events are committed to the `discovery-state` branch. Earlier events remain recoverable through Git history.

## Public ownership-key fallback
As of 2026-10-12, the owned properties have previously published the same root IndexNow key file. Its identifier is public by design, so the scanner can use it as a fallback without creating private GitHub secrets. A key configured in the corresponding GitHub Actions secret takes precedence: `TRVS_INDEXNOW_TRILLSVERSE_KEY`, `TRVS_INDEXNOW_LULTRILLS_KEY`, `TRVS_INDEXNOW_MYMINDMINE_KEY`, `TRVS_INDEXNOW_REALLYTHAT_KEY`.

**No blind submission:** before *each* notification, the runner retrieves `https://<page-host>/<key>.txt` and checks that the file contents exactly equal the selected key. A host whose key file is unavailable, blocked, or mismatched records `key_unverified` and keeps changed URLs pending for later retry. Each www hostname requires its own matching key file. This does not cause the initial 687-URL baseline to be submitted, and does not prove any site was indexed.

Public ownership keys are not private publishing credentials. Do not put relay administration tokens or SSH keys in source. If the shared key rotates, update the allowlisted fallback or configure per-site secrets.

## Validation and boundaries
Run `node --test trvs-intel/tests/discovery.test.mjs`. CI passing proves code acceptance only. Real discovery and notification require successful scheduled/push Actions jobs, site-level receipt records and an IndexNow acceptance response. IndexNow cannot prove Google inclusion, higher rankings, AI ingestion, or human exposure.

Only URL additions and changed sitemap `lastmod` values are detectable; silent HTML edits with unchanged sitemaps may be missed. GitHub schedule delivery can be delayed. This is a no-new-server design, subject to GitHub Actions quotas.

Do not claim the separate TRVS.INTEL relay is public until its DigitalOcean bootstrap, safe publication durability, traffic controls, backup/restore and Observatory verification have been completed.
