#!/bin/bash
set -e

GITLAB_URL="http://localhost:8929"
GITLAB_INTERNAL_URL="http://gitlab:8929"
ROOT_TOKEN="glpat-AUTO_GENERATED_TOKEN"

# Define network name dynamically to avoid errors
NETWORK_NAME=$(docker network ls --filter name=devops-net --format "{{.Name}}")
if [ -z "$NETWORK_NAME" ]; then echo "Error: devops-net network not found"; exit 1; fi
echo "Using Docker Network: $NETWORK_NAME"

# Ensure the runner config directory exists and has proper permissions
echo "Setting up runner config directory..."
mkdir -p ./runner-config
chmod 755 ./runner-config

# Restart gitlab-runner to ensure clean state
echo "Restarting gitlab-runner container..."
docker restart gitlab-runner
sleep 5

# Clean up existing runners
echo "Cleaning up existing runners..."
docker exec gitlab-runner gitlab-runner unregister --all-runners || true

# Ensure config file exists in container
docker exec gitlab-runner touch /etc/gitlab-runner/config.toml

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
      --tag-list "e4l-server,juno" \
      --run-untagged="true" \
      --locked="false" \
      --access-level="not_protected" \
      --docker-privileged=true \
      --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" \
      --docker-volumes "/cache"
    
    # Get the runner ID from the response
    sleep 2
    RUNNER_ID=$(curl --silent --header "PRIVATE-TOKEN: $ROOT_TOKEN" "$GITLAB_URL/api/v4/runners/all" | \
                python3 -c "import sys, json; runners = json.load(sys.stdin); print(next((str(r['id']) for r in runners if r['description'] == '$RUNNER_NAME'), ''))")
    
    if [ -n "$RUNNER_ID" ]; then
        # Enable the runner for the specific project
        PROJECT_ID=$(echo "$PROJECT_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
        curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
             "$GITLAB_URL/api/v4/projects/$PROJECT_ID/runners" \
             --data "runner_id=$RUNNER_ID" > /dev/null
        echo "✓ Runner '$RUNNER_NAME' (ID: $RUNNER_ID) registered and assigned to project"
    else
        echo "✓ Runner '$RUNNER_NAME' registered"
    fi
}

# Register for Backend
register_for_project "testdev/backend" "backend-runner"

# Register for Frontend
register_for_project "testdev/frontend" "frontend-runner"

# Restart runner to apply configuration
echo ""
echo "Restarting gitlab-runner to apply configuration..."
docker restart gitlab-runner

echo "=== All Runners Registered ==="
