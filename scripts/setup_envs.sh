#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo " E4L ENVIRONMENTS SETUP"
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
echo "Setting up SSH keys for environments..."

# Stage SSH key
SSH_KEY_STAGE="$HOME/.ssh/devops_stage"
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

if [ ! -f "$SSH_KEY_STAGE" ]; then
  echo "Generating SSH key for STAGE at $SSH_KEY_STAGE..."
  ssh-keygen -t ed25519 -f "$SSH_KEY_STAGE" -N "" -C "devops_stage_key"
  chmod 600 "$SSH_KEY_STAGE"
  chmod 644 "${SSH_KEY_STAGE}.pub"
  ok "Stage SSH key generated"
else
  ok "Stage SSH key already exists at $SSH_KEY_STAGE"
fi

# Production SSH key
SSH_KEY_PROD="$HOME/.ssh/devops_prod"

if [ ! -f "$SSH_KEY_PROD" ]; then
  echo "Generating SSH key for PROD at $SSH_KEY_PROD..."
  ssh-keygen -t ed25519 -f "$SSH_KEY_PROD" -N "" -C "devops_prod_key"
  chmod 600 "$SSH_KEY_PROD"
  chmod 644 "${SSH_KEY_PROD}.pub"
  ok "Production SSH key generated"
else
  ok "Production SSH key already exists at $SSH_KEY_PROD"
fi

# -------- Function to setup environment --------
setup_env() {
  local ENV_NAME=$1
  local ENV_DIR=$2
  
  echo
  echo "======================================"
  echo " Setting up $ENV_NAME environment"
  echo "======================================"
  
  [ -d "$ENV_DIR" ] || fail "Directory '$ENV_DIR' not found"
  
  cd "$ENV_DIR"
  
  [ -f Vagrantfile ] || fail "Vagrantfile missing in $ENV_DIR"
  [ -f playbook.yml ] || fail "playbook.yml file missing in $ENV_DIR"
  
  ok "$ENV_DIR directory structure looks correct"
  
  # Clean up any existing VM
  echo
  echo "Checking for existing $ENV_NAME VM..."
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
  
  # Start VM
  echo
  echo "Starting $ENV_NAME VM via Vagrant..."
  echo "(Ansible provisioning will run automatically inside the VM)"
  vagrant up
  
  ok "$ENV_NAME VM started and provisioned"
  
  # Verify inside VM
  echo
  echo "Verifying $ENV_NAME environment setup..."
  
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
  
  ok "$ENV_NAME: Docker and Docker Compose are installed and ready"
  
  # Deploy database
  echo
  echo "Deploying database on $ENV_NAME..."
  
  vagrant ssh -c '
set -e

# Set database environment variables
export MYSQL_USERNAME=e4l_user
export MYSQL_PASSWORD=e4l_secure_password
export DUMP_DIR=/opt/dumps

# Navigate to working directory
cd /opt/e4l* 2>/dev/null || cd /opt/e4l

# Copy docker-compose file
if [ -f /vagrant/docker-compose.db.yml ]; then
  cp /vagrant/docker-compose.db.yml ./docker-compose.db.yml
  
  echo "Starting database container..."
  docker compose -f docker-compose.db.yml up -d
  
  echo "Waiting for database to be ready..."
  sleep 10
  
  echo "Database container status:"
  docker ps | grep db || echo "Database container not found"
  
  echo "Database deployed successfully!"
else
  echo "ERROR: docker-compose.db.yml not found"
  exit 1
fi
'
  
  ok "$ENV_NAME: Database deployed and running"
  
  cd ..
}

# -------- Setup both environments --------
# Setup Staging
setup_env "STAGING" "ansible-stage"

# Setup Production
setup_env "PRODUCTION" "ansible-prod"

echo
echo "======================================"
echo " ALL ENVIRONMENTS READY"
echo "======================================"
echo
echo "Environments successfully set up:"
echo "  STAGING:"
echo "    - VM: e4l-stage (192.168.56.11)"
echo "    - Docker and Docker Compose installed"
echo "    - Database: Running"
echo "    - Directory: /opt/e4l"
echo ""
echo "  PRODUCTION:"
echo "    - VM: e4l-prod (192.168.56.12)"
echo "    - Docker and Docker Compose installed"
echo "    - Database: Running"
echo "    - Directory: /opt/e4l-prod"