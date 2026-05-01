# CI/CD Setup Guide (GitHub + VPS)

This guide configures:
- PR CI checks
- CD workflows ready for VPS deploy (manual trigger in current dev phase)

## 1. GitHub Repository Settings

### Repository Variable

Add repository variable:
- `GHCR_NAMESPACE`: your GitHub org/user namespace used by GHCR.

Example:
- if image is `ghcr.io/acme/restaurant-api:v1.0.0`, then `GHCR_NAMESPACE=acme`.

### Environments

Create environments:
- `staging`
- `production`

For `production`, add required reviewers to enforce manual approval.

### Environment Secrets

Add these secrets to both `staging` and `production` with environment-specific values:
- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_KEY`
- `DEPLOY_PATH`
- `HEALTHCHECK_URL`

## 2. VPS Preparation

Install on VPS:
- Docker Engine
- Docker Compose plugin

Create directories:

```bash
sudo mkdir -p /opt/restaurant/staging
sudo mkdir -p /opt/restaurant/production
```

Copy deployment files from repo:
- `deploy/docker-compose.deploy.yml`
- `deploy/deploy.sh`

into each deploy path:
- `/opt/restaurant/staging`
- `/opt/restaurant/production`

Make script executable:

```bash
chmod +x /opt/restaurant/staging/deploy.sh
chmod +x /opt/restaurant/production/deploy.sh
```

Create `.env` in each deploy path.

Minimum `.env` keys:

```env
GHCR_NAMESPACE=replace-me
IMAGE_TAG=bootstrap

POSTGRES_DB=restaurant
POSTGRES_USER=restaurant
POSTGRES_PASSWORD=replace-strong-password

ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=restaurant;Username=restaurant;Password=replace-strong-password
JWT_SECRET=replace-production-secret
```

## 3. GHCR Permissions

Ensure repository Actions can push packages:
- Settings -> Actions -> General -> Workflow permissions
- Enable read and write permissions.

If package visibility or org policy blocks pull on VPS, configure deploy user with GHCR access and run `docker login ghcr.io` on VPS.

## 4. Workflow Behavior (Current Dev Phase)

- `ci-pr.yml`: runs on every PR to `main`.
- `cd-staging.yml`: runs by `workflow_dispatch` (manual run).
- `cd-production.yml`: runs by `workflow_dispatch` (manual run, still bound to `production` environment).

When VPS is ready for full automation:
- change `cd-staging.yml` trigger back to `push` on `main`.
- change `cd-production.yml` trigger back to tag push `v*`.

## 5. Release Process (Now)

1. Merge PR into `main` (CI checks only).
2. If needed, run `cd-staging` manually from GitHub Actions.
3. If needed, run `cd-production` manually and approve `production` environment.

## 6. Rollback

Each deploy stores:
- `CURRENT_IMAGE_TAG`
- `PREVIOUS_IMAGE_TAG`

in `release_state.env` under deploy path.

To rollback manually:
- set `.env` `IMAGE_TAG` to `PREVIOUS_IMAGE_TAG`
- run:

```bash
docker compose -f docker-compose.deploy.yml --env-file .env pull
docker compose -f docker-compose.deploy.yml --env-file .env up -d
```
