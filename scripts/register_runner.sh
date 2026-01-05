#!/bin/bash
set -e

GITLAB_URL="http://localhost:8929"
GITLAB_INTERNAL_URL="http://gitlab:8929"
ROOT_TOKEN="glpat-AUTO_GENERATED_TOKEN"

# Define network name dynamically to avoid errors
# Assumes folder name 'devops-project' -> 'devops-project_devops-net'
NETWORK_NAME=$(docker network ls --filter name=devops-net --format "{{.Name}}")
if [ -z "$NETWORK_NAME" ]; then echo "Error: devops-net network not found"; exit 1; fi
echo "Using Docker Network: $NETWORK_NAME"

register_for_project() {
    PROJECT_PATH=$1
    RUNNER_NAME=$2
    
    echo "--- Registering Runner for '$PROJECT_PATH' ---"
    
    ENCODED_PATH=$(echo "$PROJECT_PATH" | sed 's/\//%2F/g')
    PROJECT_INFO=$(curl --silent --header "PRIVATE-TOKEN: $ROOT_TOKEN" "$GITLAB_URL/api/v4/projects/$ENCODED_PATH")
    REGISTRATION_TOKEN=$(echo "$PROJECT_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)['runners_token'])" 2>/dev/null || echo "")

    if [ -z "$REGISTRATION_TOKEN" ] || [ "$REGISTRATION_TOKEN" == "None" ]; then
        echo "Failed to get token for $PROJECT_PATH"
        return 1
    fi

    docker exec gitlab-runner gitlab-runner register \
      --non-interactive \
      --url "$GITLAB_INTERNAL_URL" \
      --clone-url "http://gitlab:8929" \
      --registration-token "$REGISTRATION_TOKEN" \
      --executor "docker" \
      --docker-image "alpine:latest" \
      --description "$RUNNER_NAME" \
      --docker-network-mode "$NETWORK_NAME" \
      --tag-list "docker" \
      --run-untagged="true" \
      --locked="false" \
      --access-level="not_protected" \
      --docker-privileged \
      --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" \
      --docker-volumes "/cache"
}

# Register for Backend
register_for_project "testdev/backend" "backend-runner"

# Register for Frontend
register_for_project "testdev/frontend" "frontend-runner"

echo "=== All Runners Registered ==="
