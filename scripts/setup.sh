#!/bin/bash
set -uo pipefail  # Continue on errors but fail on unset variables

echo "=========================================="
echo " E4L DEVOPS ENVIRONMENT SETUP"
echo "=========================================="
echo ""
echo "This script will execute all setup scripts in order:"
echo "  1. setup_gitlab.sh      - GitLab CE and Runner containers"
echo "  2. setup_envs.sh        - Staging and Production VMs"
echo "  3. setup_projects.sh    - GitLab projects and CI/CD variables"
echo "  4. register_runner.sh   - GitLab Runner registration"
echo ""
echo "Estimated time: 15-20 minutes"
echo ""

# Root directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Array to track failed steps
FAILED_STEPS=()
COMPLETED_STEPS=()

# Confirm before proceeding
read -p "Continue with full setup? (y/N): " confirm
if [[ ! ${confirm:-N} =~ ^[yY](es)?$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "=========================================="
echo " Starting E4L DevOps Setup..."
echo "=========================================="
echo ""

# Function to run a script and handle errors
run_script() {
    local script_name=$1
    local step_number=$2
    local description=$3
    
    echo ""
    echo "============================================"
    echo " Step $step_number: $description"
    echo "============================================"
    echo ""
    
    if [ ! -f "$SCRIPT_DIR/$script_name" ]; then
        echo "❌ ERROR: Script '$script_name' not found!"
        FAILED_STEPS+=("Step $step_number: $description - Script not found")
        return 1
    fi
    
    if bash "$SCRIPT_DIR/$script_name"; then
        echo ""
        echo "✓ Step $step_number completed successfully: $description"
        COMPLETED_STEPS+=("Step $step_number: $description")
        return 0
    else
        echo ""
        echo "❌ ERROR: Step $step_number failed: $description"
        FAILED_STEPS+=("Step $step_number: $description")
        
        # Ask user if they want to continue
        echo ""
        read -p "Continue with remaining steps? (y/N): " continue_setup
        if [[ ! ${continue_setup:-N} =~ ^[yY](es)?$ ]]; then
            echo "Setup aborted by user."
            return 1
        fi
        return 0
    fi
}

# Step 1: Setup GitLab
if ! run_script "setup_gitlab.sh" "1" "GitLab CE and Runner Setup"; then
    echo "Critical failure. Cannot continue without GitLab."
    exit 1
fi

# Wait a moment for GitLab to stabilize
echo ""
echo "Waiting 10 seconds for GitLab to stabilize..."
sleep 10

# Step 2: Setup Environments (VMs)
if ! run_script "setup_envs.sh" "2" "Staging and Production VMs"; then
    if [[ ${#FAILED_STEPS[@]} -gt 0 ]]; then
        echo ""
        echo "⚠️  WARNING: VM setup had issues. Check output above."
        echo "You may need to run 'bash scripts/setup_envs.sh' manually."
    fi
fi

# Step 3: Setup GitLab Projects
if ! run_script "setup_projects.sh" "3" "GitLab Projects and CI/CD Variables"; then
    if [[ ${#FAILED_STEPS[@]} -gt 0 ]]; then
        echo ""
        echo "⚠️  WARNING: Project setup had issues. Check output above."
        echo "You may need to run 'bash scripts/setup_projects.sh' manually."
    fi
fi

# Step 4: Register Runner
if ! run_script "register_runner.sh" "4" "GitLab Runner Registration"; then
    if [[ ${#FAILED_STEPS[@]} -gt 0 ]]; then
        echo ""
        echo "⚠️  WARNING: Runner registration had issues. Check output above."
        echo "You may need to run 'bash scripts/register_runner.sh' manually."
    fi
fi

echo ""
echo "=========================================="
echo " SETUP COMPLETE"
echo "=========================================="
echo ""

# Show completed steps
if [ ${#COMPLETED_STEPS[@]} -gt 0 ]; then
    echo "✓ Completed steps:"
    for step in "${COMPLETED_STEPS[@]}"; do
        echo "  ✓ $step"
    done
fi

# Show failed steps if any
if [ ${#FAILED_STEPS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: The following steps encountered errors:"
    for step in "${FAILED_STEPS[@]}"; do
        echo "  ✗ $step"
    done
    echo ""
    echo "Some setup steps may have failed. Review the output above."
    echo "You can re-run individual scripts to fix specific issues:"
    echo "  - bash scripts/setup_gitlab.sh"
    echo "  - bash scripts/setup_envs.sh"
    echo "  - bash scripts/setup_projects.sh"
    echo "  - bash scripts/register_runner.sh"
else
    echo ""
    echo "✓ All setup steps completed successfully!"
fi

echo ""
echo "=========================================="
echo " Next Steps"
echo "=========================================="
echo ""
echo "1. Verify GitLab is accessible:"
echo "   http://localhost:8929"
echo "   Login: testdev / vx6Yo1Mnmn4q7D4Q"
echo ""
echo "2. Check VMs are running:"
echo "   - Staging:    http://192.168.56.11:8082"
echo "   - Production: http://192.168.56.12:8082"
echo ""
echo "3. View GitLab projects:"
echo "   - Backend:  http://localhost:8929/testdev/backend"
echo "   - Frontend: http://localhost:8929/testdev/frontend"
echo ""
echo "4. Push your code to trigger pipelines:"
echo "   cd repos/backende4l && git push origin dev"
echo "   cd repos/frontende4l && git push origin dev"
echo ""
echo "To clean up everything, run:"
echo "   bash scripts/cleanup.sh"
echo ""
