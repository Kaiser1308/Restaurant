#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DEPLOY_PATH:-}" ]; then
  echo "DEPLOY_PATH is required."
  exit 1
fi

if [ -z "${IMAGE_TAG:-}" ]; then
  echo "IMAGE_TAG is required."
  exit 1
fi

if [ -z "${GHCR_NAMESPACE:-}" ]; then
  echo "GHCR_NAMESPACE is required."
  exit 1
fi

mkdir -p "${DEPLOY_PATH}"
cd "${DEPLOY_PATH}"

if [ ! -f "docker-compose.deploy.yml" ]; then
  echo "docker-compose.deploy.yml not found in ${DEPLOY_PATH}."
  echo "Copy deploy/docker-compose.deploy.yml to ${DEPLOY_PATH} before running deploy."
  exit 1
fi

if [ ! -f ".env" ]; then
  echo ".env not found in ${DEPLOY_PATH}. Create it before running deploy."
  exit 1
fi

touch release_state.env
source release_state.env || true

PREVIOUS_IMAGE_TAG="${CURRENT_IMAGE_TAG:-}"
CURRENT_IMAGE_TAG="${IMAGE_TAG}"

if grep -q '^IMAGE_TAG=' .env; then
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=${IMAGE_TAG}/" .env
else
  echo "IMAGE_TAG=${IMAGE_TAG}" >> .env
fi

if grep -q '^GHCR_NAMESPACE=' .env; then
  sed -i "s/^GHCR_NAMESPACE=.*/GHCR_NAMESPACE=${GHCR_NAMESPACE}/" .env
else
  echo "GHCR_NAMESPACE=${GHCR_NAMESPACE}" >> .env
fi

docker compose -f docker-compose.deploy.yml --env-file .env pull
docker compose -f docker-compose.deploy.yml --env-file .env up -d

{
  echo "CURRENT_IMAGE_TAG=${CURRENT_IMAGE_TAG}"
  echo "PREVIOUS_IMAGE_TAG=${PREVIOUS_IMAGE_TAG}"
} > release_state.env

echo "Deploy completed with IMAGE_TAG=${IMAGE_TAG}"
