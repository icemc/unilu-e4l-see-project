#!/bin/bash
set -uo pipefail  # Removed -e to continue on errors

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

# Array to track failed steps
FAILED_STEPS=()

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
    if docker exec gitlab-runner gitlab-runner unregister --all-runners 2>/dev/null; then
        echo "Runner unregistered."
    else
        echo "⚠️  WARNING: Failed to unregister runner. Continuing..."
        FAILED_STEPS+=("Step 1: Unregister GitLab Runner")
    fi
else
    echo "GitLab Runner container not found, skipping unregister."
fi

echo ""
echo "=== Step 2: Destroy Production VM ==="
if [ -d "$ROOT_DIR/ansible-prod" ]; then
    cd "$ROOT_DIR/ansible-prod"
    if [ -d ".vagrant" ]; then
        echo "Destroying production VM (e4l-prod)..."
        if vagrant destroy -f 2>/dev/null; then
            rm -rf .vagrant
            echo "Production VM destroyed."
        else
            echo "⚠️  Vagrant destroy failed. Attempting VirtualBox cleanup..."
            # Try to force destroy using VBoxManage directly
            if command -v VBoxManage &> /dev/null; then
                VM_NAME="e4l-prod"
                if VBoxManage list vms | grep -q "$VM_NAME"; then
                    echo "Found VM '$VM_NAME', attempting to power off and remove..."
                    VBoxManage controlvm "$VM_NAME" poweroff 2>/dev/null || true
                    sleep 2
                    VBoxManage unregistervm "$VM_NAME" --delete 2>/dev/null || true
                    rm -rf .vagrant 2>/dev/null || true
                    echo "VirtualBox cleanup completed for production VM."
                else
                    echo "VM not found in VirtualBox, cleaning up .vagrant directory..."
                    rm -rf .vagrant 2>/dev/null || true
                fi
            else
                echo "⚠️  WARNING: VBoxManage not found. Manual cleanup may be required."
                FAILED_STEPS+=("Step 2: Destroy Production VM - Try: VBoxManage unregistervm e4l-prod --delete")
            fi
        fi
    else
        echo "No .vagrant directory found, VM may already be destroyed."
    fi
    # Clean up generated files
    rm -f devops_prod_key.pub 2>/dev/null || true
else
    echo "ansible-prod directory not found, skipping."
fi

echo ""
echo "=== Step 3: Destroy Staging VM ==="
if [ -d "$ROOT_DIR/ansible-stage" ]; then
    cd "$ROOT_DIR/ansible-stage"
    if [ -d ".vagrant" ]; then
        echo "Destroying staging VM (e4l-stage)..."
        if vagrant destroy -f 2>/dev/null; then
            rm -rf .vagrant
            echo "Staging VM destroyed."
        else
            echo "⚠️  Vagrant destroy failed. Attempting VirtualBox cleanup..."
            # Try to force destroy using VBoxManage directly
            if command -v VBoxManage &> /dev/null; then
                VM_NAME="e4l-stage"
                if VBoxManage list vms | grep -q "$VM_NAME"; then
                    echo "Found VM '$VM_NAME', attempting to power off and remove..."
                    VBoxManage controlvm "$VM_NAME" poweroff 2>/dev/null || true
                    sleep 2
                    VBoxManage unregistervm "$VM_NAME" --delete 2>/dev/null || true
                    rm -rf .vagrant 2>/dev/null || true
                    echo "VirtualBox cleanup completed for staging VM."
                else
                    echo "VM not found in VirtualBox, cleaning up .vagrant directory..."
                    rm -rf .vagrant 2>/dev/null || true
                fi
            else
                echo "⚠️  WARNING: VBoxManage not found. Manual cleanup may be required."
                FAILED_STEPS+=("Step 3: Destroy Staging VM - Try: VBoxManage unregistervm e4l-stage --delete")
            fi
        fi
    else
        echo "No .vagrant directory found, VM may already be destroyed."
    fi
    # Clean up generated files
    rm -f devops_stage_key.pub 2>/dev/null || true
else
    echo "ansible-stage directory not found, skipping."
fi

echo ""
echo "=== Step 4: Stop GitLab and Runner Containers ==="
cd "$ROOT_DIR"
if [ -f "docker-compose.yml" ]; then
    echo "Stopping GitLab CE and Runner containers..."
    if docker compose down -v 2>/dev/null; then
        echo "GitLab containers stopped and volumes removed."
    else
        echo "⚠️  WARNING: Failed to stop GitLab containers. Continuing..."
        FAILED_STEPS+=("Step 4: Stop GitLab Containers")
    fi
else
    echo "docker-compose.yml not found, skipping."
fi

echo ""
echo "=== Step 5: Clean up Docker Resources ==="
echo "Removing GitLab-related Docker resources..."

# Remove containers if they still exist
if ! docker rm -f gitlab gitlab-runner 2>/dev/null; then
    echo "⚠️  WARNING: Some containers could not be removed (may not exist). Continuing..."
fi

# Remove network
if ! docker network rm e4l-db-net 2>/dev/null; then
    echo "⚠️  WARNING: Network e4l-db-net could not be removed (may not exist). Continuing..."
fi

echo "Docker resources cleanup attempted."

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
    GITLAB_DATA_REMOVED=false
    if [ -d "$HOME/gitlab" ]; then
        if sudo rm -rf "$HOME/gitlab" 2>/dev/null; then
            echo "GitLab data removed from $HOME/gitlab"
            GITLAB_DATA_REMOVED=true
        else
            echo "⚠️  WARNING: Failed to remove GitLab data directory. Continuing..."
            FAILED_STEPS+=("Step 7: Remove GitLab Data Directory")
        fi
    fi
    if docker volume ls | grep -q gitlab; then
        if docker volume rm $(docker volume ls -q | grep gitlab) 2>/dev/null; then
            echo "GitLab Docker volumes removed."
            GITLAB_DATA_REMOVED=true
        else
            echo "⚠️  WARNING: Failed to remove some GitLab volumes. Continuing..."
            FAILED_STEPS+=("Step 7: Remove GitLab Volumes")
        fi
    fi
    if [ "$GITLAB_DATA_REMOVED" = false ]; then
        echo "No GitLab data found to remove."
    fi
else
    echo "GitLab data preserved."
fi

echo ""
echo "=== Step 8: Clean up Git Repositories ==="
read -p "Clean git repositories in repos/ folder (removes .git, keeps source code)? (y/N): " clean_repos
if [[ ${clean_repos:-N} =~ ^[yY](es)?$ ]]; then
    REPOS_CLEANED=false
    if [ -d "$ROOT_DIR/repos/backende4l/.git" ]; then
        if rm -rf "$ROOT_DIR/repos/backende4l/.git" 2>/dev/null; then
            echo "Backend .git removed."
            REPOS_CLEANED=true
        else
            echo "⚠️  WARNING: Failed to remove backend .git directory. Continuing..."
            FAILED_STEPS+=("Step 8: Clean Backend Repository")
        fi
    fi
    if [ -d "$ROOT_DIR/repos/frontende4l/.git" ]; then
        if rm -rf "$ROOT_DIR/repos/frontende4l/.git" 2>/dev/null; then
            echo "Frontend .git removed."
            REPOS_CLEANED=true
        else
            echo "⚠️  WARNING: Failed to remove frontend .git directory. Continuing..."
            FAILED_STEPS+=("Step 8: Clean Frontend Repository")
        fi
    fi
    if [ "$REPOS_CLEANED" = false ]; then
        echo "No git repositories found to clean."
    fi
else
    echo "Git repositories preserved."
fi

echo ""
echo "=========================================="
echo " CLEANUP COMPLETE"
echo "=========================================="
echo ""

# Show what was cleaned
echo "Cleaned up:"
echo "  ✓ GitLab Runner (unregister attempted)"
echo "  ✓ VMs (staging and production destroy attempted)"
echo "  ✓ GitLab containers (stop attempted)"
echo "  ✓ Docker networks and volumes (removal attempted)"
if [[ ${rm_keys:-N} =~ ^[yY](es)?$ ]]; then
    echo "  ✓ SSH keys removed"
fi
if [[ ${rm_gitlab_data:-N} =~ ^[yY](es)?$ ]]; then
    echo "  ✓ GitLab data deletion attempted"
fi
if [[ ${clean_repos:-N} =~ ^[yY](es)?$ ]]; then
    echo "  ✓ Git repositories cleanup attempted"
fi

# Show failed steps if any
if [ ${#FAILED_STEPS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: The following steps encountered errors:"
    for step in "${FAILED_STEPS[@]}"; do
        echo "  ✗ $step"
    done
    echo ""
    echo "Some resources may still exist. You may need to clean them up manually."
    echo "Check the output above for specific error messages."
else
    echo ""
    echo "✓ All cleanup steps completed successfully!"
fi

echo ""
echo "To start fresh, run the setup scripts in order:"
echo "  1. bash scripts/setup_gitlab.sh"
echo "  2. bash scripts/setup_envs.sh"
echo "  3. bash scripts/setup_projects.sh"
echo "  4. bash scripts/register_runner.sh"
