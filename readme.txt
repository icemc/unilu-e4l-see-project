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
│  │ SSH Port: 2222               │  │ SSH Port: 2223               │     │
│  │ Working Dir: /opt/e4l        │  │ Working Dir: /opt/e4l-prod   │     │
│  │                              │  │                              │     │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │     │
│  │  │ Frontend (Nginx) :8881 │  │  │  │ Frontend (Nginx) :8882 │  │     │
│  │  └───────────┬────────────┘  │  │  └───────────┬────────────┘  │     │
│  │              ▼               │  │              ▼               │     │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │     │
│  │  │ Backend (Spring) :8084 │  │  │  │ Backend (Spring) :8085 │  │     │
│  │  └───────────┬────────────┘  │  │  └───────────┬────────────┘  │     │
│  │              ▼               │  │              ▼               │     │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │     │
│  │  │ MariaDB :3307          │  │  │  │ MariaDB :3308          │  │     │
│  │  │ DB: e4l_stage          │  │  │  │ DB: e4l_prod           │  │     │
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

Frontend Pipeline (3 Stages):
    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
    │DOCKER BUILD│───►│DEPLOY STAGING│    │DEPLOY PROD   │
    └─────┬──────┘    └──────────────┘    └──────────────┘
          │                 ▲                     ▲
    Build & push            │                     │
    to Docker Hub      dev branch?          main branch?

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
    - Automatically build and deploy to STAGING environment
    - Images pushed to: minfranco/e4l-backend-stage:latest
                       minfranco/e4l-frontend-stage:latest
    - Deployed to: 192.168.56.11 (e4l-stage VM)

  main branch commits:
    - Automatically build and deploy to PRODUCTION environment
    - Images pushed to: minfranco/e4l-backend-prod:latest
                       minfranco/e4l-frontend-prod:latest
    - Deployed to: 192.168.56.12 (e4l-prod VM)
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
