#!/usr/bin/env bash
# Privileged activation entrypoint. Only the validated commit SHA is accepted.
set -Eeuo pipefail
if [[ "$EUID" -ne 0 || "$#" -ne 1 || ! "$1" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Usage: sudo trvs-intel-activate <40-character Git commit SHA>" >&2
  exit 2
fi
sha="$1"
release="/opt/trvs-intel/releases/$sha"
current=/opt/trvs-intel/current
if [[ ! -d "$release" || -L "$release" || ! -f "$release/relay/server.mjs" || -L "$release/relay/server.mjs" ]]; then
  echo "Missing or unsafe release: $release" >&2
  exit 3
fi
if [[ "$(stat -c '%U' "$release")" != "trvsdeploy" || "$(realpath "$release")" != "$release" ]]; then
  echo "Invalid release owner or path" >&2
  exit 3
fi

/usr/bin/env node --check "$release/relay/server.mjs"
previous=""
if [[ -L "$current" ]]; then previous="$(readlink "$current")"; fi
candidate="/opt/trvs-intel/.current-$sha"
ln -sfn "$release" "$candidate"
mv -Tf "$candidate" "$current"
systemctl enable trvs-intel-relay.service >/dev/null

healthy=0
if systemctl restart trvs-intel-relay.service; then
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl --silent --show-error --fail --max-time 2 http://127.0.0.1:8787/health 2>/dev/null | grep -q '"status":"ready"'; then
      healthy=1
      break
    fi
    sleep 1
  done
fi

if [[ "$healthy" == 1 ]]; then
  echo "DEPLOYED TRVS.INTEL commit $sha; loopback health OK"
  exit 0
fi

echo "Health check failed. Rolling back to previous release." >&2
if [[ -n "$previous" && -d "$previous" ]]; then
  fallback="/opt/trvs-intel/.rollback-$sha"
  ln -sfn "$previous" "$fallback"
  mv -Tf "$fallback" "$current"
  systemctl restart trvs-intel-relay.service || true
else
  rm -f "$current"
  systemctl stop trvs-intel-relay.service || true
fi
exit 1
