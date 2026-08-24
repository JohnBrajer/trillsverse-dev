# Codex Surface Operator Mission

## Objective
Expand Trillsverse public surface area across research, AI, developer, publishing, professional, and product graphs using the existing Surface Expansion Engine.

## Read first
- `authority/SURFACE_EXPANSION_EXECUTION.md`
- `authority/surface-expansion-queue.json`
- `authority/surface-expansion-payloads.json`
- `authority/platform-payloads.json`

## Operating rule
Do not stop at planning. Use Playwright MCP to execute browser work wherever possible. Prefer creating legitimate, durable public surfaces over vanity metrics.

## Human handoff boundaries
Pause only when a step requires one of the following:
- CAPTCHA
- 2FA / email or phone verification
- legal attestation
- identity verification
- payment or purchase
- password creation/change
- irreversible account deletion

For those steps, leave the page positioned exactly where the founder can complete the action, then continue immediately afterward.

## First execution wave
Work through these in order unless a hard blocker changes the path:

1. Product Hunt
   - establish maker account/profile if missing
   - fill available profile fields using canonical payloads
   - do not launch a product yet unless a launch-ready product is explicitly designated

2. ORCID
   - establish researcher identity profile
   - use the prepared biography/keywords
   - link public Trillsverse/GitHub surfaces where supported
   - pause for identity/email verification only if required

3. Zenodo
   - connect using GitHub where available
   - enable `JohnBrajer/trillsverse-dev`
   - prepare for archiving a stable public release
   - do not fabricate scholarly claims

4. Hugging Face
   - establish founder/org surface if missing
   - create a Trillsverse organization if permitted
   - populate description and canonical links
   - create no paid compute resources without approval

5. DEV Community
   - establish profile
   - populate canonical bio and links
   - prepare syndication workflow with canonical URLs back to owned originals

6. Medium
   - establish profile
   - populate canonical bio and links
   - prepare import/syndication path for one substantive owned article

7. Bluesky
   - establish profile
   - prefer domain-based handle only when DNS ownership flow is available and safe
   - populate canonical links

8. LinkedIn / Crunchbase / F6S / Wellfound
   - fill only defensible fields
   - leave unknown or verification-required claims blank rather than guessing

## Evidence discipline
Keep these classes distinct:
- owned surface
- platform profile
- syndicated press
- third-party editorial/profile coverage
- independent citation/review

Never present owned or paid/syndicated material as independent third-party validation.

## Completion logging
After every successful surface action, update `authority/surfaces.json` with:
- platform
- URL
- surface type
- ownership class
- status
- canonical links
- evidence class when applicable

Also update `authority/surface-expansion-queue.json` status from `queued` to `live`, `blocked`, or `needs-founder`.

## Success criterion
The mission is successful when the same underlying Trillsverse work can be discovered from multiple distinct graph neighborhoods without duplicate-spam behavior, while keeping canonical ownership and source integrity clear.
