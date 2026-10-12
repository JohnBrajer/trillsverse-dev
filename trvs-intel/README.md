# TRVS.INTEL relay prototype v0.4

**Status:** independent, opt-in developer implementation. Does not modify Gate, publish third-party content, broadcast to users, or prove external reach. Node.js 20+; no npm dependencies. A small installable WebExtension is included in `/extension` for user-operated capture/export. It emits the compatible v0.3 capsule schema.

## End-to-end, local development

1. In Chromium, open `chrome://extensions`, enable Developer Mode, select **Load unpacked**, and choose `trvs-intel/extension` (the folder containing `manifest.json`). Open a public HTTPS article, click the extension icon, correct the two concept axes, then click **Copy capsule JSON**. Save the copied JSON to `capsule.json` on your device. Review the source title and URL before continuing.
2. Start the relay server:

   ```bash
   export TRVS_RELAY_ADMIN_TOKEN="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))')"
   export TRVS_RELAY_DATA="$PWD/data/trvs-intel-relay.jsonl"
   node relay/server.mjs
   ```

3. From a second terminal with the **same** token:

   ```bash
   export TRVS_RELAY_URL="http://127.0.0.1:8787"
   node relay/publish.mjs capsule.json
   ```

4. Read the returned `sha256:` identifier, then request `GET http://127.0.0.1:8787/v1/capsules/<id>` or `/children` on that ID. Running `node --test tests/relay.test.mjs` performs automated acceptance tests without a browser.

The server defaults to **127.0.0.1** and does not offer CORS or browser publishing. To serve public GET URLs, deploy behind your own authenticated, HTTPS, rate-limited reverse proxy with durable backups and review the privacy policy first. `TRVS_RELAY_ADMIN_TOKEN` must stay off the extension and out of source control. Never bind publicly with the default command. This release is for owner-reviewed records only.

## API contract

- `GET /health` -> readiness and count (no identities)
- `POST /v1/capsules` -> HTTP 201 relay publication receipt or 200 idempotent receipt; `Authorization: Bearer <token>` and `Content-Type: application/json` required.
- `GET /v1/capsules/sha256:<64-hex>` -> stored relay record or 404.
- `GET /v1/capsules/sha256:<64-hex>/children` -> child IDs of a known parent record.

The POST accepts the existing **v0.3** capsule schema, validates the canonical origin and the two concept axes, bounds input, removes unsupported fields, requires a reviewed HTTPS source URL with **no query or fragment**, and computes a cryptographic record identifier (SHA-256). It refuses unverifiable parent references. The append-only JSONL journal survives restart and can be backed up using ordinary file tools.

### Journal recovery

Startup verifies all newline-terminated records and their hashes. If the final unterminated fragment is malformed JSON, the relay preserves its exact bytes in `<journal>.torn-tail`, syncs that evidence and its containing directory entry on POSIX hosts before truncating only the fragment, and replays the committed records. Windows local testing omits directory-entry sync, so crash-safe preservation of a newly created quarantine filename is not claimed there. A valid unterminated record is verified and given a newline before new writes. Complete malformed lines and hash mismatches fail closed without changing the journal.

An identical existing quarantine can be reused after an interrupted recovery. A different existing quarantine requires operator intervention; archive it securely before retrying, and never silently overwrite recovery evidence. Run only one relay process per journal. This recovery behavior does not make ordinary `appendFile` publication acknowledgments a power-loss durability guarantee; synced commits, storage quotas, and backup/restore validation remain public-release work.

## Evidence boundary

The relay receipt attests solely to **publication into this specific local relay store**. It does **not** demonstrate that a human or agent encountered a transmission, understood it, retained it, changed behavior, or indexed it. Parent existence is verified **within the relay store**; identity or original source ownership is **not** cryptographically verified. Unknown external publication and downstream events remain unknown. No unique-person IDs, IP persistence, cookies, or background surveillance.

The formal/natural and concrete/abstract values are user-reviewed metadata, not proven ontological facts. Distribute the source URL and question only, never the excerpt without deliberate review. No advertising in the extension. For a future public rollout, include moderation, content rights verification, independent source validation, audit/restore, rate limits, and Observatory event reconciliation before promotion to production.

## Versioning

- v0.3: earlier local user-controlled browser concept capture and copying.
- v0.4 browser client: minimal Chromium popup exporter producing v0.3-compatible capsules without networking.
- v0.4: local durable relay graph + publisher CLI + HTTP receipt verification. Public deployment unverified and intentionally disabled by default.

`node --test tests/relay.test.mjs`
