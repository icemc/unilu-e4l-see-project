## Reproducible Setup Guide (Local GitLab + Local Registry + Front/Back CI/CD)

This guide reproduces the full local stack using the modified source repos under `source_repos/`. It relies on Docker socket mounting and a shared bridge network (no Docker-in-Docker).

### 1) Prerequisites
- OS: Linux (tested)
- Tools: Docker (20+), Docker Compose v2, Git
- Ports unused: `8929` (GitLab), `5050` (Registry), `8881/8882` (Frontend), `8084/8085` (Backend)

### 2) Enable insecure local registry
GitLab’s registry runs at `http://localhost:5050`. Configure Docker to trust it:

```bash
sudo sh -c 'cat > /etc/docker/daemon.json <<EOF
{
  "insecure-registries": ["localhost:5050"]
}
EOF'
sudo systemctl restart docker
```

### 3) Start GitLab + Runner
Use the provided compose and runner config (socket-mounted):

```bash
export GITLAB_HOME=$HOME/gitlab-data
docker compose -f docker-compose.gitlab.yml up -d
```
- UI: `http://localhost:8929`
- Registry: `http://localhost:5050`
- Login: `testdev` / `vx6Yo1Mnmn4q7D4Q`

Make scripts executable (one-time):
```bash
chmod +x scripts/*.sh
```

Run helper scripts in order:

```bash
./scripts/setup_integration_server.sh         # waits until healthy
./scripts/setup_users_and_projects.sh         # creates testdev + projects
./scripts/register_runner.sh                  # registers docker runner
```

### 4) Seed pipelines
Push the modified source repos to GitLab to trigger pipelines:

```bash
./scripts/seed_repos.sh
```

This pushes `source_repos/lu.uni.e4l.platform.api.dev` → `testdev/backend` and `source_repos/lu.uni.e4l.platform.frontend.dev` → `testdev/frontend`.

Verify pipelines:
- Backend: `http://localhost:8929/testdev/backend/-/pipelines`
- Frontend: `http://localhost:8929/testdev/frontend/-/pipelines`
- Login: `testdev` / `vx6Yo1Mnmn4q7D4Q`

### 5) Use local modified source repos
Do NOT re-clone external repos. Use:
- Backend: `source_repos/lu.uni.e4l.platform.api.dev`
- Frontend: `source_repos/lu.uni.e4l.platform.frontend.dev`

Both repos already include tuned `.gitlab-ci.yml` files:
- Pipeline stages: build → unit/integration → docker build/push → deploy staging → acceptance tests → manual prod
- Networking via shared bridge `e4l-db-net` using container names (no localhost inside CI)

### 6) Staging environment (local containers)
Create shared network + DB from backend repo:

```bash
cd source_repos/lu.uni.e4l.platform.api.dev/docker
docker compose -f docker-compose.db.yml up -d
```

Deploy backend (staging):
```bash
docker compose -f docker-compose.backend.staging.yml up -d
# Container: e4l-backend-staging, Host port: 8084 -> 8080
```

Deploy frontend (staging):
```bash
cd ../../../lu.uni.e4l.platform.frontend.dev/e4l.frontend.docker
docker compose -f docker-compose.frontend.staging.yml up -d
# Container: e4l-frontend-staging, Host port: 8881 -> 80
```

Verify:
```bash
curl -f http://localhost:8084/e4lapi/questionnaire
curl -f http://localhost:8881
```

### 7) CI/CD overview
- Runner uses Docker socket (not DinD).
- Images are built and pushed to `localhost:5050/testdev/{backend|frontend}:{latest|release}`.
- Deploy jobs use compose files referencing the pushed image via `CI_REGISTRY_IMAGE`.
- Acceptance tests run a container in `e4l-db-net`, hitting `http://e4l-frontend-staging:80`.
- Production deploy is manual and promotes `latest` → `release` tag.

### 8) Local development
Frontend dev server:
```bash
cd source_repos/lu.uni.e4l.platform.frontend.dev
npm ci
npm start   # serves on http://localhost:8080
```

Run tests:
```bash
npm run test:unit:ci
npm run test:integration:ci
npm run test:e2e:ci    # E2E_BASE_URL defaults to http://localhost:8080
```

### 9) Cleanup
Use the updated cleanup script which tears down GitLab, Backend, Frontend, networks, and optionally local images/data:
```bash
./scripts/cleanup.sh
```

### 10) Troubleshooting
- If acceptance tests can’t resolve `e4l-frontend-staging`, ensure `e4l-db-net` exists and the job uses `docker:29.0.1` image.
- If Puppeteer fails to launch, ensure the container installs Chromium + required system libs (already handled in CI).
- If compose pulls fail, confirm Docker daemon has `insecure-registries: ["localhost:5050"]` and Docker was restarted.

With these steps, you can reproduce the full local CI/CD with the modified repos, local registry, and container-name networking.