#!/bin/bash
set -e

# Configuration
export GITLAB_HOME=$HOME/gitlab-data
GITLAB_URL="http://localhost:8929"
MAX_RETRIES=60
SLEEP_TIME=10

echo "=== Phase 1: Setting up Infrastructure ==="

# 1. Prepare directories
mkdir -p $GITLAB_HOME/{config,logs,data}
mkdir -p ./runner-config

# 2. Start services
docker compose -f docker-compose.yml up -d

# 3. Wait for GitLab
echo "Waiting for GitLab at $GITLAB_URL..."
attempt=1
while [ $attempt -le $MAX_RETRIES ]; do
    if curl --output /dev/null --silent --head --fail "$GITLAB_URL/users/sign_in"; then
        echo "GitLab is UP!"
        break
    fi
    sleep $SLEEP_TIME
    attempt=$((attempt + 1))
done

if [ $attempt -gt $MAX_RETRIES ]; then
    echo "GitLab failed to start."
    exit 1
fi

# 4. Create Root Access Token (Crucial for Automation)
echo "Generating Root Access Token..."
docker exec -it gitlab gitlab-rails runner "token = User.find_by_username('root').personal_access_tokens.create(scopes: [:api], name: 'Automation Token', expires_at: 365.days.from_now); token.set_token('glpat-AUTO_GENERATED_TOKEN'); token.save!"

echo "Infrastructure Ready. Root Token: glpat-AUTO_GENERATED_TOKEN"
