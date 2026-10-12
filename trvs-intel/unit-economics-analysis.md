# TRVS.INTEL public relay economics — 2026-10-12

Status: deployment proposal and measurement model, not deployed or monetized.

## Verified starting state

PR #16 merged into `John` at `2a0a87e2f67667a209ed8c5261641504fe27d14b`; its seven acceptance tests passed in GitHub Actions run 38207881709. The relay uses Node built-ins and does not invoke paid model APIs. DigitalOcean account inventory returned one active `trillsverse-prod` droplet: 2 vCPU, 4 GB RAM, 80 GB disk, $24/month base compute price. This is not the total account bill; snapshots, other charges and operator time are separate. Host headroom has not been measured. Desktop Commander reports the production device offline.

Firecrawl fetched the live `/api/intelligence-injections/observatory` endpoint with HTTP 200. Its five observed requests in the current window describe existing Gate surfaces, not TRVS.INTEL capsule retrievals. No relay encounter denominator or paying-customer cohort is available.

## Units and formulas

- Infrastructure unit: a new accepted capsule publication, with duplicates reported separately. Also count retrieval requests, response bytes, journal bytes, RSS, CPU, storage growth and backup bytes.
- Outcome unit: an attributable observed capsule request. A request is not a unique recipient, understanding, retention or influence. Exclude known self-tests from the external metric; unknown clients remain unclassified.
- Incremental cost per 1,000 outcome units = 1,000 × incremental relay operating cost / attributable external requests. With no verified denominator, this metric is **unknown**, not zero.
- Fully allocated cost includes the chosen share of the existing host, incremental transfer/storage, review/support labor and acquisition spending. Incremental cash and allocated economic cost must be reported separately.
- Contribution per paid placement, if that future product is authorized = collected revenue minus refunds, processor fees, publisher payouts, variable review/serving costs and any earmarked reinvestment. A 2% reserve must explicitly state its base; gross receipts and net retained revenue produce different amounts. The relay currently implements neither payments nor reserve transfers.
- CAC, LTV, contribution margin, retention and payback are unknown: there are no supplied revenue, customer-acquisition or paid cohort observations. Do not fill these with assumed success or fabricated forecasts.

## Hosting choices

| Choice | Added cash | Constraint |
|---|---:|---|
| Isolated relay service on existing DigitalOcean host | Target $0/month | Requires measured headroom, bounded RAM/disk/requests, existing transfer allowance and no host upgrade |
| Separate DigitalOcean host | Additional recurring bill; not priced here | Better host isolation but adds cost; unnecessary before capacity evidence |
| Continue local testing | $0 paid hosting required | No always-available public endpoint or external propagation proof |

Recommendation: reuse the existing host after a capacity check, with one loopback-bound process, an existing-domain HTTPS route, reviewed authenticated publishing, bounded requests/storage, synced journal commits and tested recovery. Public reads should emit capsule-linked aggregate evidence that Observatory can reconcile without IPs, cookies or person IDs. Keep self-test traffic distinct. Do not add a resident model: this relay is deterministic storage and transport.

For scale intuition only, allocating the entire $24 host to the relay gives $2.40 per 1,000 requests at 10,000 monthly requests, $0.24 at 100,000, and $0.024 at 1,000,000. These are arithmetic scenarios, not measured cost forecasts; they omit labor, storage and transfer charges and do not establish capacity.

## Next release acceptance

The bounded v0.4 repair covers hostname aliases, strict parent validation and recoverable final fragments. Public deployment and Observatory integration are a separate architectural release requiring a reviewed design and implementation plan. Its proof should include pinned deployment SHA, host headroom, protected write endpoint, resource limits, backup/restore, health checks, and a independently attributable retrieval recorded against a capsule ID. Existing Observatory traffic must not be relabeled as relay reach.

Sources: [merged implementation](https://github.com/JohnBrajer/trillsverse-dev/pull/16), [CI](https://github.com/JohnBrajer/trillsverse-dev/actions/runs/38207881709), [live Observatory](https://trillsverse.com/api/intelligence-injections/observatory), and authenticated DigitalOcean/Remote Desktop Commander inventory read on 2026-10-12.
