# CI/CD Design - GitHub Actions + VPS Docker Compose

Date: 2026-05-01
Owner: THIEN
Status: Implemented (dev-phase CD is manual dispatch)

## Goals

- Enforce CI quality gates on every PR to `main`.
- Auto-deploy to staging after merges to `main`.
- Deploy to production only after manual approval.
- Keep artifacts immutable and rollback-friendly.

## Scope

In scope:
- GitHub Actions workflows for CI and CD.
- GHCR image build/push strategy.
- VPS deployment scripts and compose template.
- Environment-based secret separation (`staging`, `production`).

Out of scope:
- Full observability platform setup.
- Infrastructure provisioning automation (Terraform/Ansible).
- Kubernetes migration.

## Pipeline Architecture

### 1. PR CI (`ci-pr.yml`)

Trigger: `pull_request` targeting `main`.

Jobs:
- `api-build-test`: restore/build/test for `apps/api/Restaurant.Api`.
- `print-agent-build-test`: restore/build/test for `apps/print-agent/Restaurant.PrintAgent`.
- `web-lint-build`: `npm ci`, `npm run lint`, `npm run build` for `apps/web`.

Policy:
- All three checks are required before merge.

### 2. Staging CD (`cd-staging.yml`)

Current trigger: `workflow_dispatch` (dev phase, no VPS yet).
Target trigger when VPS is ready: `push` on `main`.

Flow:
1. Build and push container images to GHCR:
   - `ghcr.io/<org_or_user>/restaurant-api:main-<short_sha>`
   - `ghcr.io/<org_or_user>/restaurant-web:main-<short_sha>`
   - `ghcr.io/<org_or_user>/restaurant-print-agent:main-<short_sha>`
2. SSH deploy to staging VPS:
   - update `.env` with `IMAGE_TAG=main-<short_sha>`
   - `docker compose pull`
   - `docker compose up -d`
3. Post-deploy health check:
   - `GET /health` on API.

### 3. Production CD (`cd-production.yml`)

Current trigger: `workflow_dispatch` (dev phase, no VPS yet).
Target trigger when VPS is ready: `push` tag `v*` (example `v1.0.0`).

Flow:
1. Build and push immutable release images:
   - same image names with tag `vX.Y.Z`.
2. Deploy job bound to GitHub `production` environment.
3. Manual approval gate via environment protection rule.
4. SSH deploy to production VPS using approved tag.
5. Health check + rollback hint.

## Release and Tag Strategy

- `main` deploys to staging with `main-<short_sha>`.
- Production deploys only from semantic tags (`vX.Y.Z`).
- Tags are immutable release pointers for deterministic rollback.

## Secrets and Environments

GitHub Environments:
- `staging`
- `production`

Required secrets per environment:
- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_KEY` (private key, PEM/OpenSSH format)
- `DEPLOY_PATH` (e.g., `/opt/restaurant/staging` or `/opt/restaurant/production`)
- `HEALTHCHECK_URL` (e.g., `http://localhost:5141/health` or LB URL)

Repository-level variable:
- `GHCR_NAMESPACE` (org or username for image path).

## VPS Layout

Each environment directory contains:
- `docker-compose.deploy.yml`
- `.env` (runtime configuration, not committed)
- `deploy.sh`
- optional `release_state.env` for current/previous tags

Suggested paths:
- `/opt/restaurant/staging`
- `/opt/restaurant/production`

## Rollback Model

Minimal rollback strategy:
- Persist last known good tag in `release_state.env`.
- On failed health check, operator can re-run deploy with previous tag.
- Add `workflow_dispatch` rollback workflow in next phase for one-click restore.

## Security Model

- No secrets in git.
- SSH key scoped per environment.
- Production deploy requires manual approver(s) in GitHub environment rules.
- Use least-privilege deploy user on VPS.

## Testing Strategy

- CI verifies compile/lint/build on every PR.
- Staging CD validates runtime health after every merge.
- Production release requires passing CI + manual approval.

## Implementation Plan (This Change Set)

1. Add three workflows in `.github/workflows/`.
2. Add deploy templates in `deploy/`.
3. Add setup documentation in `docs/cicd-vps-setup.md`.
