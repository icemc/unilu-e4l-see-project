#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo " E4L STAGING ENVIRONMENT SETUP"
echo "======================================"

# -------- helpers --------
fail() {
  echo "ERROR: $1"
  exit 1
}

ok() {
  echo "OK: $1"
}

# -------- checks --------
command -v vagrant >/dev/null 2>&1 || fail "Vagrant is not installed"
command -v git >/dev/null 2>&1 || fail "Git is not installed"

ok "Required tools found"

# -------- SSH key setup --------
echo
echo "Setting up SSH key for Ansible..."

SSH_KEY_PATH="$HOME/.ssh/devops_stage"

# Create .ssh directory if it doesn't exist
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

# Generate SSH key if it doesn't exist
if [ ! -f "$SSH_KEY_PATH" ]; then
  echo "Generating SSH key at $SSH_KEY_PATH..."
  ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "devops_stage_key"
  chmod 600 "$SSH_KEY_PATH"
  chmod 644 "${SSH_KEY_PATH}.pub"
  ok "SSH key generated"
else
  ok "SSH key already exists at $SSH_KEY_PATH"
fi

# -------- paths --------
STAGE_DIR="ansible-stage"

[ -d "$STAGE_DIR" ] || fail "Directory '$STAGE_DIR' not found"

cd "$STAGE_DIR"

[ -f Vagrantfile ] || fail "Vagrantfile missing"
[ -f playbook.yml ] || fail "playbook.yml file missing"

ok "ansible-stage directory structure looks correct"

# -------- clean up any existing VM --------
echo
echo "Checking for existing VM..."
if vagrant status 2>/dev/null | grep -q "running\|saved\|poweroff"; then
  echo "Found existing VM. Destroying to avoid user mismatch issues..."
  vagrant destroy -f
  ok "Existing VM destroyed"
elif [ -d ".vagrant" ]; then
  echo "Found .vagrant directory from previous setup. Cleaning up..."
  rm -rf .vagrant
  ok ".vagrant directory removed"
else
  ok "No existing VM found"
fi

# -------- start VM --------
echo
echo "Starting STAGING VM via Vagrant..."
echo "(Ansible provisioning will run automatically inside the VM)"
vagrant up

ok "VM started and provisioned"

# -------- verify inside VM --------
echo
echo "Verifying environment setup inside VM..."

vagrant ssh -c '
set -e

echo "--- Docker version ---"
docker version

echo
echo "--- Docker Compose version ---"
docker compose version

echo
echo "Environment setup completed successfully!"
'

ok "Docker and Docker Compose are installed and ready"

echo
echo "======================================"
echo " STAGING ENVIRONMENT READY"
echo "======================================"
echo
echo "The environment is now set up with:"
echo "  - Docker and Docker Compose installed"
echo "  - Required directories created"
echo "  - Ready to deploy applications"
echo
echo "Next steps:"
echo "  1) Deploy database using docker-compose.db.yml"
echo "  2) Deploy backend and frontend applications as needed"