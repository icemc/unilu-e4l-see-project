================================================================================
                     E4L DevOps Platform - Setup Guide
================================================================================


ASSET COMPOSITION
-----------------
This project contains:

  scripts/                      Automation scripts for full setup
    ├── setup_envs.sh           Provision staging and production VMs
    ├── setup_projects.sh       Create GitLab projects and CI/CD variables
    ├── register_runner.sh      Register CI/CD runners for projects
    ├── setup_gitlab.sh         Setup GitLab runner container
    ├── push_repos.sh           Push source code to GitLab
    └── cleanup.sh              Tear down VMs and environments

  repos/                        Application source code
    ├── backende4l/             Backend (Java/Spring Boot + Gradle)
    └── frontende4l/            Frontend (React/Webpack + Node.js)

  ansible-stage/                Ansible configuration for staging VM
    ├── Vagrantfile             Vagrant VM config (192.168.56.11)
    ├── playbook.yml            Ansible provisioning playbook
    ├── hosts.ini               SSH configuration
    └── docker-compose.*.yml    Docker compose files

  ansible-prod/                 Ansible configuration for production VM
    ├── Vagrantfile             Vagrant VM config (192.168.56.12)
    ├── playbook.yml            Ansible provisioning playbook
    ├── hosts.ini               SSH configuration
    └── docker-compose.*.yml    Docker compose files

  docker-compose.yml            GitLab Runner configuration
  architecture_diagram.txt      Detailed architecture diagrams
  readme.txt                    This file
  scenarios.txt                 Test scenarios (pass/fail demos)


PREREQUISITES
-------------
Hardware:
  - Minimum 16 GB RAM (32 GB recommended)
  - 100 GB available disk space (for VMs)
  - Multi-core processor (4+ cores)

Software:
  - Windows 10/11 or Linux
  - VirtualBox 6.1+
  - Vagrant 2.2+
  - Docker Desktop (for GitLab Runner)
  - Git v2.25+
  - SSH client (OpenSSH)
  - GitLab CE (pre-installed at localhost:8929)

GitLab Setup (REQUIRED):
  GitLab CE must be running at http://localhost:8929
  Default credentials: testdev / vx6Yo1Mnmn4q7D4Q

Docker Hub Account:
  You need a Docker Hub account for pushing images.
  Default registry: docker.io/minfranco
  Update CI/CD variables if using a different account.

PORT CONFIGURATION:
  Frontend (both envs):   8082 (host) → 80 (container)
  Backend (both envs):    8084 (host) → 8080 (container)
  MariaDB (internal):     3306 (container only - not exposed)
  
  Note: Ports are unified across staging and production since each
        environment runs on a separate VM (no conflicts).

DATABASE CREDENTIALS:
  Database Name:          e4l
  Username:               e4l  
  Password:               e4lpassword
  Root Password:          rootpassword
  Driver:                 org.mariadb.jdbc.Driver

CONTAINER NAMING:
  Database (both envs):   e4l-db
  Backend (both envs):    e4l-backend
  Frontend Staging:       e4l-frontend-staging
  Frontend Production:    e4l-frontend-prod
  
  Note: Same names used in both environments since they run on
        separate VMs. This simplifies configuration and deployment.


ARCHITECTURE - THREE ENVIRONMENTS
──────────────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                           HOST MACHINE                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  DEV ENVIRONMENT (Developer Workstation)                           │ │
│  │                                                                    │ │
│  │    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │ │
│  │    │   IDE        │   │  Backend     │   │  Frontend    │          │ │
│  │    │   Git CLI    │   │  :8080       │   │  :3000       │          │ │
│  │    └──────────────┘   └──────────────┘   └──────────────┘          │ │
│  │                              │                                     │ │
│  └──────────────────────────────┼─────────────────────────────────────┘ │
│                                 ▼ git push (dev or main branch)         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  INTEGRATION (GitLab :8929 + Docker Hub)                           │ │
│  │                                                                    │ │
│  │  ┌────────────────────────────────────────────────────────────┐    │ │
│  │  │  PIPELINE FLOW (Branch-Based Deployment)                   │    │ │
│  │  │  • dev branch  → Deploy to STAGING                         │    │ │
│  │  │  • main branch → Deploy to PRODUCTION                      │    │ │
│  │  └────────────────────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐     │
│  │ STAGING VM (e4l-stage)       │  │ PRODUCTION VM (e4l-prod)     │     │
│  │ IP: 192.168.56.11            │  │ IP: 192.168.56.12            │     │
│  │ SSH Port: 22                 │  │ SSH Port: 22                 │     │
│  │ Working Dir: /opt/e4l        │  │ Working Dir: /opt/e4l-prod   │     │
│  │                              │  │                              │     │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │     │
│  │  │ Frontend (Nginx) :8082 │  │  │  │ Frontend (Nginx) :8082 │  │     │
│  │  └───────────┬────────────┘  │  │  └───────────┬────────────┘  │     │
│  │              ▼               │  │              ▼               │     │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │     │
│  │  │ Backend (Spring) :8084 │  │  │  │ Backend (Spring) :8084 │  │     │
│  │  └───────────┬────────────┘  │  │  └───────────┬────────────┘  │     │
│  │              ▼               │  │              ▼               │     │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │     │
│  │  │ MariaDB :3306          │  │  │  │ MariaDB :3306          │  │     │
│  │  │ DB: e4l                │  │  │  │ DB: e4l                │  │     │
│  │  │ Container: e4l-db      │  │  │  │ Container: e4l-db      │  │     │
│  │  └────────────────────────┘  │  │  └────────────────────────┘  │     │
│  │                              │  │                              │     │
│  │  Deployed from: dev branch   │  │  Deployed from: main branch  │     │
│  └──────────────────────────────┘  └──────────────────────────────┘     │
Backend Pipeline (6 Stages):
    ┌─────────┐    ┌─────────┐    ┌──────┐    ┌────────────┐    ┌──────────┐
    │PRE-BUILD│───►│  BUILD  │───►│ TEST │───►│DOCKER BUILD│───►│  DEPLOY  │
    └─────────┘    └─────────┘    └──────┘    └─────┬──────┘    └────┬─────┘
         │              │             │              │                │
    Set vars      ./gradlew      JUnit tests    Push image      SSH to VM
                   build                        to Docker Hub  docker-compose

                                    Branch determines deployment:
                                    • dev  → STAGING (192.168.56.11)
                                    • main → PRODUCTION (192.168.56.12)

Frontend Pipeline (7 Stages with Quality Gates):
    ┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
    │  BUILD  │───►│UNIT TEST │───►│INTEGRATION  │───►│DOCKER BUILD │───►│  DEPLOY  │
    │         │    │          │    │    TEST     │    │  (STAGING)  │    │ STAGING  │
    └─────────┘    └──────────┘    └─────────────┘    └─────────────┘    └────┬─────┘
         │              │                 │                  │                  │
    npm ci +       Jest tests        React Testing     Build staging      SSH to VM
    npm build      (reducers/        Library tests     image & push       docker-compose
                   actions)          (components)      to Docker Hub

                                    Only on main branch:
                                    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
                                    │ E2E ACCEPT  │───►│DOCKER BUILD │───►│  DEPLOY  │
                                    │    TESTS    │    │ (PRODUCTION)│    │   PROD   │
                                    └─────────────┘    └─────────────┘    └──────────┘
                                          │                   │                  │
                                    Puppeteer tests      Build prod         SSH to VM
                                    on staging env       image ONLY if      docker-compose
                                    (192.168.56.11       E2E pass
                                     :8082)

                                    CRITICAL: Production deployment blocked if E2E tests fail

All deployments use SSH to connect to VMs and run docker-compose commands.
                   ┌────┴────┐                                        ▼
                   │         │                                  ┌──────────┐
              U
----------------------------
Prerequisites:
  - GitLab CE running at http://localhost:8929
  - User 'testdev' created with password 'vx6Yo1Mnmn4q7D4Q'
  - Docker Desktop running
  - VirtualBox and Vagrant installed

Run these commands in sequence from the project root (PowerShell/Bash):

  1. scripts/setup_envs.sh
     What it does:
     - Generates SSH keys (~/.ssh/devops_stage and ~/.ssh/devops_prod)
     - Provisions staging VM (192.168.56.11) using Vagrant + Ansible
     - Provisions production VM (192.168.56.12) using Vagrant + Ansible
     - Installs Docker CE + docker-compose-plugin on both VMs
     - Deploys MariaDB databases on both VMs
     - Verifies Docker installation
     
     Time: ~10-15 minutes (depends on download speeds)

  2. scripts/setup_gitlab.sh
     What it does:
     - Starts GitLab Runner Docker container
     - Configures runner to connect to GitLab at localhost:8929
     
     Time: ~1 minute

  3. scripts/setup_projects.sh
     What it does:
     - Creates 'backend' and 'frontend' GitLab projects
     - Creates main and dev branches
     - Adds CI/CD variables for staging and production:
       * SSH keys, hosts, ports, registry images, paths
     
     Time: ~1 minute

  4. scripts/register_runner.sh
     What it does:
     - Registers GitLab runner for backend project
     - Registers GitLab runner for frontend project
     - Assigns runners with tags: e4l-server, juno
     - Enables privileged mode for Docker operations
     
     Time: ~30 seconds

  5. scripts/push_repos.sh
                      http://localhost:3307  (MariaDB staging)

  Production App:     http://localhost:8882  (frontend)
                      http://localhost:8085  (backend API)
                      http://localhost:3308  (MariaDB production)

  Docker Hub:         https://hub.docker.com/u/minfranco
                      (Registry for Docker images)

SSH Access to VMs:
  Staging VM:         ssh -i ~/.ssh/devops_stage vagrant@192.168.56.11 -p 2222
  Production VM:      ssh -i ~/.ssh/devops_prod vagrant@192.168.56.12 -p 2223

Vagrant Commands:
  Check VM status:    cd ansible-stage && vagrant status
                  & BRANCHING STRATEGY
---------------------------------------
The CI/CD pipeline runs automatically based on branch:

  dev branch commits:
    - Automatically build, test, and deploy to STAGING environment
    - Frontend: Build → Unit Tests → Integration Tests → Docker Build → Deploy Staging
    - Images pushed to: minfranco/e4l-backend-stage:latest
                       minfranco/e4l-frontend-stage:latest
    - Deployed to: 192.168.56.11 (e4l-stage VM)
    - Used for continuous integration and testing

  main branch commits (with CODE FREEZE and E2E gating):
    - Automatically build, test, run E2E tests, then deploy to PRODUCTION
    - Frontend: Build → Unit Tests → Integration Tests → Docker Build (Staging) 
                → Deploy Staging → E2E Tests (on staging) → Docker Build (Prod) 
                → Deploy Production
    - E2E Acceptance Tests: Run Puppeteer tests against staging (http://192.168.56.11:8082)
    - Production deployment BLOCKED if E2E tests fail
    - Images pushed to: minfranco/e4l-backend-prod:latest (or :release)
                       minfranco/e4l-frontend-prod:release
    - Deployed to: 192.168.56.12 (e4l-prod VM)
    
  CODE FREEZE STRATEGY:
    1. Develop and push to dev branch (deploys to staging)
    2. Test and validate on staging environment
    3. CODE FREEZE: Stop dev branch commits when ready for production
    4. Create merge request: dev → main
    5. Merge triggers E2E tests on staging
    6. If E2E tests pass → Production image built and deployed
    7. If E2E tests fail → Production deployment blocked, fix issues, repeat
VMs and environments:

  Stop and destroy both VMs:
    cd ansible-stage && vagrant destroy -f
    cd ansible-prod && vagrant destroy -f

  Stop GitLab Runner:
    docker-compose down

  Clean up SSH keys (optional):
    rm ~/.ssh/devops_stage ~/.ssh/devops_stage.pub
    rm ~/.ssh/devops_prod ~/.ssh/devops_prod.pub

  Remove GitLab projects (via GitLab Web UI):
    http://localhost:8929/testdev/backend/-/settings/general
    http://localhost:8929/testdev/frontend/-/settings/general

Full cleanup script:
  scripts/cleanup.sh (if it exists)pipeline:
  1. Go to repository (e.g., http://localhost:8929/testdev/backend)
  2. Navigate to: Build > Pipelines
  3. Click "Run Pipeline"
  4. Select branch (dev or main)
  5. Click "Run Pipeline"

Workflow:
  1. Develop locally on any branch
  2. Push to dev branch → Auto-deploy to staging
  3. Test on staging environment
  4. CODE FREEZE: Stop committing to dev when satisfied with staging
  5. Create merge request: dev → main
  6. Merge to main → E2E tests run on staging
  7. If E2E pass → Auto-deploy to production
  8. If E2E fail → Production blocked, fix and retry
  4. Create merge request: dev → main
  5. Merge to main → Auto-deploy to productioneline run

Alternatively, these commands can be chained:

./scripts/setup_integration_server.sh && \
./scripts/setup_users_and_projects.sh && \
./scripts/register_runner.sh && \
./scripts/seed_repos.sh


VERIFY SETUP - URLs TO VISIT
----------------------------
After setup completes, visit these URLs:

  GitLab Login:       http://localhost:8929
                      (Login: testdev / vx6Yo1Mnmn4q7D4Q)

  Backend Repo:       http://localhost:8929/testdev/backend
  Frontend Repo:      http://localhost:8929/testdev/frontend

  Backend Pipeline:   http://localhost:8929/testdev/backend/-/pipelines
  Frontend Pipeline:  http://localhost:8929/testdev/frontend/-/pipelines

  Staging App:        http://localhost:8881  (frontend)
                      http://localhost:8084  (backend API)

  Production App:     http://localhost:8882  (frontend)
                      http://localhost:8085  (backend API)

  Docker Registry:    http://localhost:5050


PIPELINE TRIGGERS
-----------------
The CI/CD pipeline runs automatically when:
  - Code is pushed to the repository
  - Files are edited via GitLab Web IDE
  - A merge request is created

To manually trigger a pipeline:
  1. Go to repository (e.g., http://localhost:8929/testdev/backend)
  2. Navigate to: Build > Pipelines
  3. Click "Run Pipeline"


CLEANUP
-------
To tear down everything:
  ./scripts/cleanup.sh

================================================================================
