#!/usr/bin/env bash
# One-time production host setup. Must run locally on the existing Ubuntu Droplet as root.
set -Eeuo pipefail
if [[ "$EUID" -ne 0 ]]; then echo "Run as root on the production Droplet" >&2; exit 1; fi
if ! command -v node >/dev/null || ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"; then
  echo "Node.js 20+ is required. No packages were changed." >&2; exit 1
fi
for command_name in ssh-keygen curl systemctl openssl visudo; do
  command -v "$command_name" >/dev/null || { echo "Missing $command_name" >&2; exit 1; }
done
script_dir="$(cd "$(dirname "$0")" && pwd -P)"
[[ -f "$script_dir/activate.sh" ]] || { echo "Run from a checkout containing activate.sh" >&2; exit 1; }

if ! getent group trvsdeploy >/dev/null; then groupadd trvsdeploy; fi
if ! getent group trvsintel >/dev/null; then groupadd --system trvsintel; fi
if ! id -u trvsdeploy >/dev/null 2>&1; then useradd --create-home --gid trvsdeploy --shell /bin/bash trvsdeploy; fi
if ! id -u trvsintel >/dev/null 2>&1; then useradd --system --gid trvsintel --no-create-home --shell /usr/sbin/nologin trvsintel; fi

install -d -o root -g root -m 0755 /opt/trvs-intel
install -d -o trvsdeploy -g trvsdeploy -m 0755 /opt/trvs-intel/incoming /opt/trvs-intel/releases
install -d -o trvsintel -g trvsintel -m 0750 /var/lib/trvs-intel
install -d -o root -g trvsintel -m 0750 /etc/trvs-intel

if [[ ! -f /etc/trvs-intel/relay.env ]]; then
  umask 077
  printf 'TRVS_RELAY_ADMIN_TOKEN=%s\nTRVS_RELAY_DATA=/var/lib/trvs-intel/journal.jsonl\nHOST=127.0.0.1\nPORT=8787\n' "$(openssl rand -hex 32)" > /etc/trvs-intel/relay.env
fi
chown root:trvsintel /etc/trvs-intel/relay.env
chmod 0640 /etc/trvs-intel/relay.env

install -d -o trvsdeploy -g trvsdeploy -m 0700 /home/trvsdeploy/.ssh
key_path=/root/trvs-intel-github-actions
if [[ ! -f "$key_path" ]]; then
  ssh-keygen -q -t ed25519 -N '' -C 'trvs-intel-github-deploy' -f "$key_path"
fi
touch /home/trvsdeploy/.ssh/authorized_keys
key="$(cat "$key_path.pub")"
if ! grep -Fqx "$key" /home/trvsdeploy/.ssh/authorized_keys; then
  printf '%s\n' "$key" >> /home/trvsdeploy/.ssh/authorized_keys
fi
chown trvsdeploy:trvsdeploy /home/trvsdeploy/.ssh/authorized_keys
chmod 0600 /home/trvsdeploy/.ssh/authorized_keys

install -o root -g root -m 0755 "$script_dir/activate.sh" /usr/local/sbin/trvs-intel-activate
cat > /etc/sudoers.d/trvs-intel-deploy <<'SUDOERS'
trvsdeploy ALL=(root) NOPASSWD: /usr/local/sbin/trvs-intel-activate *
SUDOERS
chmod 0440 /etc/sudoers.d/trvs-intel-deploy
visudo -cf /etc/sudoers.d/trvs-intel-deploy >/dev/null

cat > /etc/systemd/system/trvs-intel-relay.service <<'UNIT'
[Unit]
Description=TRVS.INTEL reviewed capsule relay
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=trvsintel
Group=trvsintel
WorkingDirectory=/opt/trvs-intel/current
EnvironmentFile=/etc/trvs-intel/relay.env
ExecStart=/usr/bin/env node /opt/trvs-intel/current/relay/server.mjs
Restart=on-failure
RestartSec=3
NoNewPrivileges=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectSystem=strict
ProtectHome=yes
ProtectKernelTunables=yes
ProtectControlGroups=yes
ReadWritePaths=/var/lib/trvs-intel
RestrictSUIDSGID=yes
MemoryMax=256M
CPUQuota=30%

[Install]
WantedBy=multi-user.target
UNIT
chmod 0644 /etc/systemd/system/trvs-intel-relay.service
systemctl daemon-reload

echo "Bootstrap complete. Production service intentionally stays stopped until GitHub activates a tested revision."
echo "GitHub Actions private SSH key (SECRET): $key_path"
echo "Pinned server SSH host public key: /etc/ssh/ssh_host_ed25519_key.pub"
echo "Set GitHub vars TRVS_INTEL_DEPLOY_HOST and TRVS_INTEL_AUTODEPLOY=true."
echo "Set GitHub secrets TRVS_INTEL_DEPLOY_KEY and TRVS_INTEL_KNOWN_HOSTS."
echo "Do not add the private key or publisher token to the repository."
