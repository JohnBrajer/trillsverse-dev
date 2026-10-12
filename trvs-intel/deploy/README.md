# TRVS.INTEL automatic deployment (existing DigitalOcean Droplet)

**State:** deployment automation is implemented in GitHub. It does not imply that production credentials, host access, or HTTPS routing have been bootstrapped. This repository is a developer reference; merging code is not public deployment.

## After one-time bootstrap: no local PC or Desktop Commander needed

Merging a change under `trvs-intel/relay/**` or `trvs-intel/deploy/**` into `John` automatically starts [TRVS.INTEL automatic deploy](../../.github/workflows/trvs-intel-deploy.yml). GitHub runs tests, uses its own hosted runner to reach the existing DigitalOcean Droplet over SSH, copies the relay files, atomically switches the running revision, checks `http://127.0.0.1:8787/health`, and rolls back on failure. This uses the existing $24/month Droplet; no additional resident runner, model or host is required.

By default the deploy job is **disabled** until `TRVS_INTEL_AUTODEPLOY=true` is set. This prevents publishing an unconfigured or unreviewed service.

## One-time secure connection (cannot be skipped)

1. Open DigitalOcean's **Droplet Console** for the existing `trillsverse-prod` (currently `157.230.58.14`). This console does not require Desktop Commander. On that host, fetch the reviewed repository and run:
   ```bash
   git clone --depth 1 --branch John https://github.com/JohnBrajer/trillsverse-dev.git /tmp/trvs-intel-bootstrap
   sudo bash /tmp/trvs-intel-bootstrap/trvs-intel/deploy/bootstrap.sh
   ```
   This assumes Ubuntu with Node.js 20+ and systemd. Bootstrap exits without installing Node if unavailable. It does not modify Nginx or the existing website process.

2. In GitHub repository **Settings → Secrets and variables → Actions**, set:
   - Repository variable `TRVS_INTEL_DEPLOY_HOST` = `157.230.58.14` (or verified host DNS).
   - Secret `TRVS_INTEL_DEPLOY_KEY` = the contents of `/root/trvs-intel-github-actions` on the host (private key, never commit or paste into discussions).
   - Secret `TRVS_INTEL_KNOWN_HOSTS` = a single pinned line formed from the exact SSH host public key **on the host**, not a blind `ssh-keyscan`. For the current IP, run this on the host and securely copy its output to the GitHub secret:
     ```bash
     awk '{ print "157.230.58.14", $1, $2 }' /etc/ssh/ssh_host_ed25519_key.pub
     ```
   - Last, set repository variable `TRVS_INTEL_AUTODEPLOY` = `true`.

3. In GitHub Actions, manually run `TRVS.INTEL automatic deploy` once (branch `John`) or merge the next reviewed relay change. All subsequent matching merges deploy automatically.

The deploy identity (`trvsdeploy`) can upload only to relay release directories and invoke the restricted activation helper through sudo. The relay itself runs as `trvsintel`, bound to loopback with a publisher token held only on the host. A systemd memory/CPU budget limits interference with existing sites.

## Making it visible at trillsverse.com

After reviewing the *existing* HTTPS reverse proxy, add [nginx-location.conf](nginx-location.conf) inside the site's existing secure Nginx server block if that server uses Nginx. Validate `nginx -t` before reloading. The intended routes are:

- `GET https://trillsverse.com/api/trvs-intel/health`
- `GET https://trillsverse.com/api/trvs-intel/v1/capsules/sha256:<id>`
- `GET https://trillsverse.com/api/trvs-intel/v1/capsules/sha256:<id>/children`

Public POST is denied by the proxy. Owner-reviewed publisher operations remain private. **Do not blindly replace the existing reverse proxy or run the Nginx snippet as a standalone config.** If the production site does not use Nginx, integrate the equivalent GET-only path in its actual ingress stack.

## Production acceptance boundaries

Automatic deploy of the current code is not equivalent to a complete public release. Before live traffic: implement an fsync-backed publication acknowledgment (currently ordinary append lacks guaranteed power-loss persistence), storage/traffic limits, independently validated backup + restore, host capacity measurements, and aggregate capsule-ID retrieval events reconciled with Observatory. User identification and purported human understanding cannot be inferred from GET traffic.

Observable states to keep separate: **CI PASSED**, **DEPLOYED LOOPBACK**, **PUBLIC GET REACHABLE**, **RELAY REQUEST OBSERVED**, and **RECIPIENT UNDERSTANDING UNKNOWN**.
