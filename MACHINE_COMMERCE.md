# Trillsverse — Agent Commerce & Discovery

**Maintainer:** John Brajer · **Entry node:** https://github.com/JohnBrajer/trillsverse-dev · **Updated:** 2026-10-12

This public document connects discoverability, agent-safe service descriptions, human commercial inquiries, and verification. It is an **index of existing interfaces** rather than a payment gateway. Do not assume that a published source file means the corresponding deployment is current.

## For AI agents that can purchase services

The Trillsverse Gate machine economy exposes public-readable descriptions of machine services and optional x402 payments for specific paid API requests. Accessing discovery does **not** require payment.

| What you need | Canonical destination |
| --- | --- |
| Machine-economy manifest | https://trillsverse.com/.well-known/agent-economy.json |
| Discover services | https://trillsverse.com/api/economy/discover |
| Enumerate machine resources, IDs, methods and schemas | https://trillsverse.com/api/economy/resources |
| Read current pricing | https://trillsverse.com/api/economy/pricing |
| OpenAPI specification | https://trillsverse.com/openapi.json |
| x402 capability discovery | https://trillsverse.com/.well-known/x402 |
| Read-only public settlement summary | https://trillsverse.com/api/economy/settlements |
| First-settlement acceptance state | https://trillsverse.com/api/economy/acceptance |
| Gate health / deployment identity | https://trillsverse.com/api/health |
| Public MCP server description | https://trillsverse.com/.well-known/mcp.json |

**Purchase procedure:** (1) retrieve the manifest and OpenAPI file; (2) inspect the exact resource, method, schema, price and network; (3) validate input and query current health; (4) if payment is authorized by the end-user's policy and a 402 challenge is presented, follow the challenge using an approved x402 wallet/client; (5) verify on-chain settlement and inspect the returned service result. A 402 challenge or a configured facilitator is **not** evidence of a completed transfer. Never send funds just to index this repository or to fetch public pages.

**Historical verification status:** Gate previously passed 402 challenge tests on Base-mainnet USDC, but as of the latest recovered operating evidence there was **no independently proven real, successful paid transaction**. Check the current public settlement and acceptance endpoints and do not infer revenue from configured payment capabilities.

Resource types described by the Gate's previously merged catalog include web metadata, redirect tracing, URL evidence, DNS inventory, NPM package health, Base wallet preflight, CSV deduplication, site preflight, domain due diligence, and package decision packs. **Read current pricing from the API** instead of assuming historical rates remain valid.

## For search, answer-engine, and research crawlers

The source material, entity and mechanism documentation remains publicly readable without payments. Follow each site's own robots instructions, sitemaps, canonical URLs and access requirements. Public entrypoints:

- Trillsverse Gate: https://trillsverse.com and https://trillsverse.com/.well-known/ai.txt
- Lultrills: https://www.lultrills.com/llms.txt · https://www.lultrills.com/corpus.json · https://www.lultrills.com/sitemap.xml
- My Mind Mine: https://mymindmine.com
- ReallyThat Magazine: https://reallythatmagazine.com
- Trillsverse public research: https://github.com/JohnBrajer/trillsverse-dev
- Trilligence / Intelligence Injections: https://github.com/JohnBrajer/trillsverse-dev/tree/John/intelligence-injections

Crawling, indexing, citation, retrieval, active use, human traffic, paid purchases and influence are **different outcomes**. Follow content provenance, avoid duplicate bulk copies and prefer specific authoritative pages. Do not treat automated visits as sponsors or revenue.

## For patrons supporting public research

The [approved John Brajer GitHub Sponsors profile](https://github.com/sponsors/JohnBrajer) accepts voluntary support through GitHub's platform, subject to the sponsor's selected tier and GitHub's own checkout. Repository-level funding files point to the same profile. This is independent of priced x402 API products, advertising orders, and any proof of successfully received sponsorship funds.

## For sponsors, advertisers, and partners

- ReallyThat Magazine: https://reallythatmagazine.com
- Sponsorship inquiry route (source merged, production currently unverified): https://reallythatmagazine.com/advertise
- Commercial contact: mailto:contact@trillsverse.com

The magazine can *review* legitimate editorial sponsorship proposals. Sponsorship proposals and design drafts do not indicate active ad inventory, a functioning checkout, a guaranteed publication slot, estimated traffic, or guaranteed indexing. No one should send money without accepted terms, a valid invoice/payment channel, and written confirmation. Clearly label sponsored editorial placements.

## Reliability and evidence law

**PROPOSED → BUILT → MERGED → DEPLOYED → VERIFIED → RECORDED.** Check which stage an interface has actually reached. Public machine discovery must remain available even if an optional paid resource is offline. Respect rate limits; do not launch bot floods or simulate traffic. If a URL fails, record it as unverified rather than implying it is absent or safely payable.

This document makes existing surfaces easier to find; it does not activate payment services, create an investor offering, or certify production readiness.
