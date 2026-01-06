#!/bin/bash
set -euo pipefail

echo "=========================================="
echo " E4L DEVOPS ENVIRONMENT CLEANUP"
echo "=========================================="
echo ""
echo "This will clean up everything created by:"
echo "  1. setup_gitlab.sh"
echo "  2. setup_envs.sh"
echo "  3. setup_projects.sh"
echo "  4. register_runner.sh"
echo ""

# Root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Confirm before proceeding
read -p "Continue with cleanup? (y/N): " confirm
if [[ ! ${confirm:-N} =~ ^[yY](es)?$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "=== Step 1: Unregister GitLab Runner ==="
if docker ps -a | grep -q gitlab-runner; then
    echo "Unregistering runner..."
    docker exec gitlab-runner gitlab-runner unregister --all-runners || true
    echo "Runner unregistered."
else
    echo "GitLab Runner container not found, skipping unregister."
fi

echo ""
echo "=== Step 2: Destroy Production VM ==="
if [ -d "$ROOT_DIR/ansible-prod" ]; then
    cd "$ROOT_DIR/ansible-prod"
    if [ -d ".vagrant" ]; then
        echo "Destroying production VM (e4l-prod)..."
        vagrant destroy -f
        rm -rf .vagrant
        echo "Production VM destroyed."
    else
        echo "No .vagrant directory found, VM may already be destroyed."
    fi
    # Clean up generated files
    rm -f devops_prod_key.pub
else
    echo "ansible-prod directory not found, skipping."
fi

echo ""
echo "=== Step 3: Destroy Staging VM ==="
if [ -d "$ROOT_DIR/ansible-stage" ]; then
    cd "$ROOT_DIR/ansible-stage"
    if [ -d ".vagrant" ]; then
        echo "Destroying staging VM (e4l-stage)..."
        vagrant destroy -f
        rm -rf .vagrant
        echo "Staging VM destroyed."
    else
        echo "No .vagrant directory found, VM may already be destroyed."
    fi
    # Clean up generated files
    rm -f devops_stage_key.pub
else
    echo "ansible-stage directory not found, skipping."
fi

echo ""
echo "=== Step 4: Stop GitLab and Runner Containers ==="
cd "$ROOT_DIR"
if [ -f "docker-compose.yml" ]; then
    echo "Stopping GitLab CE and Runner containers..."
    docker compose down -v
    echo "GitLab containers stopped and volumes removed."
else
    echo "docker-compose.yml not found, skipping."
fi

echo ""
echo "=== Step 5: Clean up Docker Resources ==="
echo "Removing GitLab-related Docker resources..."

# Remove containers if they still exist
docker rm -f gitlab gitlab-runner 2>/dev/null || true

# Remove network
docker network rm devops-net 2>/dev/null || true

echo "Docker resources cleaned up."

echo ""
echo "=== Step 6: Optional - Remove SSH Keys ==="
read -p "Remove generated SSH keys (~/.ssh/devops_stage and ~/.ssh/devops_prod)? (y/N): " rm_keys
if [[ ${rm_keys:-N} =~ ^[yY](es)?$ ]]; then
    rm -f ~/.ssh/devops_stage ~/.ssh/devops_stage.pub
    rm -f ~/.ssh/devops_prod ~/.ssh/devops_prod.pub
    echo "SSH keys removed."
else
    echo "SSH keys preserved."
fi

echo ""
echo "=== Step 7: Optional - Remove GitLab Data ==="
echo "WARNING: This will delete all GitLab projects, users, and configuration."
read -p "Remove all GitLab data? (y/N): " rm_gitlab_data
if [[ ${rm_gitlab_data:-N} =~ ^[yY](es)?$ ]]; then
    if [ -d "$HOME/gitlab" ]; then
        sudo rm -rf "$HOME/gitlab"
        echo "GitLab data removed from $HOME/gitlab"
    fi
    if docker volume ls | grep -q gitlab; then
        docker volume rm $(docker volume ls -q | grep gitlab) 2>/dev/null || true
        echo "GitLab Docker volumes removed."
    fi
else
    echo "GitLab data preserved."
fi

echo ""
echo "=== Step 8: Clean up Git Repositories ==="
read -p "Clean git repositories in repos/ folder (removes .git, keeps source code)? (y/N): " clean_repos
if [[ ${clean_repos:-N} =~ ^[yY](es)?$ ]]; then
    if [ -d "$ROOT_DIR/repos/backende4l/.git" ]; then
        rm -rf "$ROOT_DIR/repos/backende4l/.git"
        echo "Backend .git removed."
    fi
    if [ -d "$ROOT_DIR/repos/frontende4l/.git" ]; then
        rm -rf "$ROOT_DIR/repos/frontende4l/.git"
        echo "Frontend .git removed."
    fi
else
    echo "Git repositories preserved."
fi

echo ""
echo "=========================================="
echo " CLEANUP COMPLETE"
echo "=========================================="
echo ""
echo "Cleaned up:"
echo "  ✓ GitLab Runner (unregistered)"
echo "  ✓ VMs (staging and production destroyed)"
echo "  ✓ GitLab containers (stopped and removed)"
echo "  ✓ Docker networks and volumes"
if [[ ${rm_keys:-N} =~ ^[yY](es)?$ ]]; then
    echo "  ✓ SSH keys removed"
fi
if [[ ${rm_gitlab_data:-N} =~ ^[yY](es)?$ ]]; then
    echo "  ✓ GitLab data deleted"
fi
if [[ ${clean_repos:-N} =~ ^[yY](es)?$ ]]; then
    echo "  ✓ Git repositories cleaned"
fi
echo ""
echo "To start fresh, run the setup scripts in order:"
echo "  1. bash scripts/setup_gitlab.sh"
echo "  2. bash scripts/setup_envs.sh"
echo "  3. bash scripts/setup_projects.sh"
echo "  4. bash scripts/register_runner.sh"
