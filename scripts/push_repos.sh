#!/bin/bash
set -e

BASE_DIR="source_repos"

# --- Configuration ---
# PATHS TO YOUR LOCAL SOURCE CODE (Update these to match your actual paths!)
BACKEND_SOURCE_DIR="$BASE_DIR/lu.uni.e4l.platform.api.dev"
FRONTEND_SOURCE_DIR="$BASE_DIR/lu.uni.e4l.platform.frontend.dev"

GITLAB_HOST="localhost:8929"
USER="testdev"
PASS="vx6Yo1Mnmn4q7D4Q" # Must match what you set in Phase 2
# ---------------------

echo "=== Phase 4: Seeding Repositories ==="

seed_repo() {
  (
    NAME=$1
    DIR=$2
    REMOTE_URL="http://$USER:$PASS@$GITLAB_HOST/$USER/$NAME.git"

    echo "--- Seeding $NAME from $DIR ---"
    
    if [ ! -d "$DIR" ]; then
        echo "Error: Directory $DIR does not exist. Please check the path."
        exit 1
    fi

    cd "$DIR"

    # Initialize git if needed
    if [ ! -d ".git" ]; then
        git init
        git checkout -b master
    fi

    # Configure user for this commit
    git config user.email "testdev@uni.lu"
    git config user.name "TestDev"

    # Add remote (remove old one if exists to be safe)
    if git remote | grep -q "origin-local"; then
        git remote remove origin-local
    fi
    git remote add origin-local "$REMOTE_URL"

    # Add, Commit, Push
    git add .
    git commit -m "Initial seed commit for $NAME" || echo "Nothing to commit"
    
    echo "Pushing to $REMOTE_URL..."
    git push -u origin-local master --force

    echo "$NAME seeded successfully."
  )
}

# Run for Backend
seed_repo "backend" "$BACKEND_SOURCE_DIR"

# Run for Frontend
seed_repo "frontend" "$FRONTEND_SOURCE_DIR"

echo "=== Seeding Complete ==="
echo "Check pipelines at:"
echo "Backend: http://$GITLAB_HOST/$USER/backend/-/pipelines"
echo "Frontend: http://$GITLAB_HOST/$USER/frontend/-/pipelines"
