#!/bin/bash
set -e

# --- Configuration ---
GITLAB_URL="http://localhost:8929"
ROOT_TOKEN="glpat-AUTO_GENERATED_TOKEN"

# User Details (Change these if needed)
USER_USERNAME="testdev"
USER_PASSWORD="vx6Yo1Mnmn4q7D4Q"
USER_EMAIL="testdev@example.com"
USER_NAME="TestDev_User"
# ---------------------

echo "=== Phase 2: Provisioning Users & Projects ==="

# 1. Create User
echo "Creating user '$USER_USERNAME'..."
CREATE_USER_RESPONSE=$(curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --data "email=$USER_EMAIL&password=$USER_PASSWORD&username=$USER_USERNAME&name=$USER_NAME&skip_confirmation=true" \
     "$GITLAB_URL/api/v4/users")

# Check for failure
if [[ $CREATE_USER_RESPONSE != *"id"* && $CREATE_USER_RESPONSE != *"already_taken"* ]]; then
    echo "Error creating user. Response from GitLab:"
    echo "$CREATE_USER_RESPONSE"
fi

# 2. Get User ID (Python parser)
echo "Fetching ID for user '$USER_USERNAME'..."
USER_INFO=$(curl --silent --header "PRIVATE-TOKEN: $ROOT_TOKEN" "$GITLAB_URL/api/v4/users?username=$USER_USERNAME")
USER_ID=$(echo "$USER_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")

if [ -z "$USER_ID" ]; then
    echo "FAILED: Could not get User ID for '$USER_USERNAME'."
    echo "Raw User Info: $USER_INFO"
    exit 1
fi

echo "User '$USER_USERNAME' exists with ID: $USER_ID"

# 3. Create Projects (empty repos)
echo "Creating 'backend' repository..."
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --data "name=backend&user_id=$USER_ID&visibility=public&default_branch=main" \
     "$GITLAB_URL/api/v4/projects/user/$USER_ID" > /dev/null

echo "Creating 'frontend' repository..."
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --data "name=frontend&user_id=$USER_ID&visibility=public&default_branch=main" \
     "$GITLAB_URL/api/v4/projects/user/$USER_ID" > /dev/null

sleep 2

# 4. Add CI/CD variables
echo "Adding CI/CD variables to backend..."

# Read the SSH private keys
SSH_PRIVATE_KEY_STAGE=$(cat ~/.ssh/devops_stage)
SSH_PRIVATE_KEY_PROD=$(cat ~/.ssh/devops_prod)

# Backend variables (shared)
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=CI_REGISTRY" --form "value=docker.io" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=CI_REGISTRY_PASSWORD" --form "value=dckr_pat_6JW_HoxEZ7uCR1goZfLYZeoT8CY" --form "masked=true" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=CI_REGISTRY_USER" --form "value=minfranco" > /dev/null

# Backend STAGING variables
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=STAGE_CI_REGISTRY_IMAGE" --form "value=minfranco/e4l-backend-stage" > /dev/null

echo "Adding backend STAGE_SSH_PRIVATE_KEY..."
curl --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --header "Content-Type: application/json" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --data @- <<EOF
{
  "key": "STAGE_SSH_PRIVATE_KEY",
  "value": $(cat ~/.ssh/devops_stage | jq -Rs .),
  "variable_type": "env_var",
  "protected": false,
  "masked": false,
  "raw": false
}
EOF

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=STAGE_HOST" --form "value=192.168.56.11" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=STAGE_PATH" --form "value=/opt/e4l" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=STAGE_SSH_PORT" --form "value=22" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=STAGE_USER" --form "value=vagrant" > /dev/null

# Backend PRODUCTION variables
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=PROD_CI_REGISTRY_IMAGE" --form "value=minfranco/e4l-backend-prod" > /dev/null

echo "Adding backend PROD_SSH_PRIVATE_KEY..."
curl --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --header "Content-Type: application/json" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --data @- <<EOF
{
  "key": "PROD_SSH_PRIVATE_KEY",
  "value": $(cat ~/.ssh/devops_prod | jq -Rs .),
  "variable_type": "env_var",
  "protected": false,
  "masked": false,
  "raw": false
}
EOF

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=PROD_HOST" --form "value=192.168.56.12" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=PROD_PATH" --form "value=/opt/e4l-prod" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=PROD_SSH_PORT" --form "value=22" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Fbackend/variables" \
     --form "key=PROD_USER" --form "value=vagrant" > /dev/null

echo "Adding CI/CD variables to frontend..."

# Frontend variables (shared)
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=CI_REGISTRY" --form "value=docker.io" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=CI_REGISTRY_PASSWORD" --form "value=dckr_pat_6JW_HoxEZ7uCR1goZfLYZeoT8CY" --form "masked=true" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=CI_REGISTRY_USER" --form "value=minfranco" > /dev/null

# Frontend STAGING variables
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=STAGE_CI_REGISTRY_IMAGE" --form "value=minfranco/e4l-frontend-stage" > /dev/null

echo "Adding frontend STAGE_SSH_PRIVATE_KEY..."
curl --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --header "Content-Type: application/json" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --data @- <<EOF
{
  "key": "STAGE_SSH_PRIVATE_KEY",
  "value": $(cat ~/.ssh/devops_stage | jq -Rs .),
  "variable_type": "env_var",
  "protected": false,
  "masked": false,
  "raw": false
}
EOF

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=STAGE_HOST" --form "value=192.168.56.11" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=STAGE_PATH" --form "value=/opt/e4l" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=STAGE_SSH_PORT" --form "value=22" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=STAGE_USER" --form "value=vagrant" > /dev/null

# Frontend PRODUCTION variables
curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=PROD_CI_REGISTRY_IMAGE" --form "value=minfranco/e4l-frontend-prod" > /dev/null

echo "Adding frontend PROD_SSH_PRIVATE_KEY..."
curl --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     --header "Content-Type: application/json" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --data @- <<EOF
{
  "key": "PROD_SSH_PRIVATE_KEY",
  "value": $(cat ~/.ssh/devops_prod | jq -Rs .),
  "variable_type": "env_var",
  "protected": false,
  "masked": false,
  "raw": false
}
EOF

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=PROD_HOST" --form "value=192.168.56.12" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=PROD_PATH" --form "value=/opt/e4l-prod" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=PROD_SSH_PORT" --form "value=22" > /dev/null

curl --silent --request POST --header "PRIVATE-TOKEN: $ROOT_TOKEN" \
     "$GITLAB_URL/api/v4/projects/$USER_USERNAME%2Ffrontend/variables" \
     --form "key=PROD_USER" --form "value=vagrant" > /dev/null

# 5. Push backend code to both branches
echo "Pushing backend code..."
cd repos/backende4l
git init
git checkout -b main
git add .
git commit -m "Initial backend commit"
git remote add origin "$GITLAB_URL/$USER_USERNAME/backend.git"
git push -f origin main

# Create dev branch from main
git checkout -b dev
git push -f origin dev

cd ../..

# 5. Push frontend code to both branches
echo "Pushing frontend code..."
cd repos/frontende4l
git init
git checkout -b main
git add .
git commit -m "Initial frontend commit"
git remote add origin "$GITLAB_URL/$USER_USERNAME/frontend.git"
git push -f origin main

# Create dev branch from main
git checkout -b dev
git push -f origin dev

cd ../..

echo "=== Provisioning Complete ==="
echo "Credentials: $USER_USERNAME / $USER_PASSWORD"
echo "Backend Repo: $GITLAB_URL/$USER_USERNAME/backend.git"
echo "  - Branches: main, dev"
echo "Frontend Repo: $GITLAB_URL/$USER_USERNAME/frontend.git"
echo "  - Branches: main, dev"
