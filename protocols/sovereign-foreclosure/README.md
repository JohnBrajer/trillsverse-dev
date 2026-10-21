# The Sovereign Foreclosure Protocol (SFP-001)

**Trillsverse | October 21, 2026 | built as an evidence-first prototype.**

A sovereign-creator rights and machine-access forensic operation connecting accurate copyright notices, observed bot traffic, independently authenticated attribution, affirmative enterprise licensing, and optional nonbinding asset-acquisition discussions.

**The title is a campaign name.** It does not assert any actual debt, default, lien, takeover, or right to seize corporate property.

## Stages

1. Document rights by track and by asset. Separate master, composition, beat lease, sample and distributor rights. Do not license third-party assets without authority.
2. Publish a transparent rights notice and machine discovery instructions; free discovery and indexing remain separate from commercial training licenses and paid API access.
3. Collect access evidence with the read-only Caddy collector in this directory. Keep original logs private; export redacted public records with source SHA256.
4. Verify claimed crawler identities using published IP ranges, forward-confirmed reverse DNS or trusted signatures. User-Agent text alone is self-identified and spoofable.
5. Offer negotiated enterprise data/audio rights with a **USD 1,500,000 opening proposal**, conditional on scope and actual rights owned. A crawl is not acceptance, signature or an invoiceable event.
6. Separately explore consensual catalog, distribution or infrastructure acquisitions with the proposed commercial counterparty. Do not claim involuntary foreclosure without enforceable debt and security rights.
7. Publish only substantiated access and response chronology. Protect visitor privacy; no fabricated screenshots or logs.

## Run and verify

Run the bundled Python program against a **locally authorized** Caddy JSON access log (no outbound calls):

    python protocols/sovereign-foreclosure/sfp_evidence.py /secure/access.log --private-out /secure/sfp-private.json --public-out /secure/sfp-public.json
    python -m unittest discover -s protocols/sovereign-foreclosure/tests -v

Private outputs include IPs and should never be committed. The public file omits IPs and raw User-Agent headers. Raw-log hashing establishes integrity checks *after collection*, not provider identity or assent.

## Disclosure and deployment rules

The research repository is not the production Gate. No automatic server deployment, metadata mutation, web route change, outbound message, invoice or UCC action is implemented here. Implementing a live evidence portal needs independent deployment verification and rights review. Trillsverse's existing Bot Wall provides self-declared crawler-family statistics, not proof of model training or contract formation.

Relevant law: UCC § 9-203 (attachment of a security interest); 17 U.S.C. §1202 (copyright management information). Ask qualified counsel to review site notices, rights schedules and outreach before formal demands.
