#!/bin/bash
set -euo pipefail

# Paths
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DOCKER_DIR="$ROOT_DIR/source_repos/lu.uni.e4l.platform.api.dev/docker"
FRONTEND_DOCKER_DIR="$ROOT_DIR/source_repos/lu.uni.e4l.platform.frontend.dev/e4l.frontend.docker"
GITLAB_COMPOSE="$ROOT_DIR/docker-compose.gitlab.yml"

# GitLab data path (matches setup script)
export GITLAB_HOME=${GITLAB_HOME:-$HOME/gitlab-data}

echo "=== Cleaning up local DevOps stack (GitLab, Backend, Frontend) ==="

command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

# 1) Bring down GitLab & Runner
echo "[1/6] Stopping GitLab & Runner..."
if [[ -f "$GITLAB_COMPOSE" ]]; then
    docker compose -f "$GITLAB_COMPOSE" down -v || true
else
    echo "Skipped: $GITLAB_COMPOSE not found"
fi

# 2) Bring down Frontend (staging/prod)
echo "[2/6] Stopping Frontend services..."
if [[ -d "$FRONTEND_DOCKER_DIR" ]]; then
    pushd "$FRONTEND_DOCKER_DIR" >/dev/null
        docker compose -f docker-compose.frontend.staging.yml down --remove-orphans || true
        docker compose -f docker-compose.frontend.prod.yml down --remove-orphans || true
    popd >/dev/null
else
    echo "Skipped: $FRONTEND_DOCKER_DIR not found"
fi

# 3) Bring down Backend (db, staging, prod)
echo "[3/6] Stopping Backend services..."
if [[ -d "$BACKEND_DOCKER_DIR" ]]; then
    pushd "$BACKEND_DOCKER_DIR" >/dev/null
        docker compose -f docker-compose.backend.staging.yml down --remove-orphans || true
        docker compose -f docker-compose.backend.prod.yml down --remove-orphans || true
        docker compose -f docker-compose.db.yml down --remove-orphans || true
    popd >/dev/null
else
    echo "Skipped: $BACKEND_DOCKER_DIR not found"
fi

# 4) Remove named containers (if any remain)
echo "[4/6] Removing residual containers..."
docker rm -f e4l-frontend-staging e4l-frontend-prod e4l-backend-staging e4l-backend-prod 2>/dev/null || true

# 5) Remove the shared bridge network (if empty)
echo "[5/6] Removing network e4l-db-net (if not in use)..."
docker network rm e4l-db-net 2>/dev/null || true

# 6) Optional image cleanup
echo "[6/6] Optional: remove local images from localhost:5050"
read -p "Remove local frontend/backend images (y/N)? " purge_imgs
if [[ ${purge_imgs:-N} =~ ^[yY](es)?$ ]]; then
    docker rmi localhost:5050/testdev/frontend:latest 2>/dev/null || true
    docker rmi localhost:5050/testdev/frontend:release 2>/dev/null || true
    docker rmi localhost:5050/testdev/backend:latest 2>/dev/null || true
    docker rmi localhost:5050/testdev/backend:rc 2>/dev/null || true
fi

echo ""
echo "=== Optional destructive cleanup ==="
echo "WARNING: The following will delete Runner config and all GitLab data (projects, users, logs)."
read -p "Remove runner-config folder (y/N)? " rm_runner
if [[ ${rm_runner:-N} =~ ^[yY](es)?$ ]]; then
    sudo rm -rf "$ROOT_DIR/runner-config"
    echo "runner-config removed."
else
    echo "Skipped runner-config removal."
fi

read -p "Remove GitLab data at $GITLAB_HOME (y/N)? " rm_data
if [[ ${rm_data:-N} =~ ^[yY](es)?$ ]]; then
    sudo rm -rf "$GITLAB_HOME"
    echo "GitLab data deleted."
else
    echo "Skipped GitLab data deletion."
fi

echo "=== Cleanup Complete ==="
