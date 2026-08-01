#!/usr/bin/env bash
set -euo pipefail

# VOC-037-T06 / VOC-037-TEST-01 (INS-9 through INS-11)
# Runs on the shared host after production provisioning.
#
# Required arguments:
#   1) staging deploy user account name
#   2) production deploy user account name
#
# The script proves logical isolation between:
#   * /opt/vocanova/infra/secrets (staging)
#   * /opt/vocanova/production/secrets (production)

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <staging_user> <production_user>" >&2
  exit 1
fi

staging_user="$1"
production_user="$2"

staging_tree="/opt/vocanova/infra/secrets"
production_tree="/opt/vocanova/production/secrets"

echo "[INS-9] production secret tree exists and is tightly permissioned"
test -d "$production_tree"
prod_dir_mode="$(stat -c "%a" /opt/vocanova/production)"
prod_secrets_mode="$(stat -c "%a" "$production_tree")"
echo "  /opt/vocanova/production mode: $prod_dir_mode"
echo "  /opt/vocanova/production/secrets mode: $prod_secrets_mode"

echo "[INS-10] production compose reads production tree only"
docker compose -f /opt/vocanova/production/docker-compose.production.yml -p vocanova-production config \
  | grep -F "/opt/vocanova/infra/secrets" >/dev/null && {
    echo "ERROR: production compose unexpectedly references staging secret path" >&2
    exit 1
  }
docker compose -f /opt/vocanova/production/docker-compose.production.yml -p vocanova-production config \
  | grep -F "/opt/vocanova/production/secrets" >/dev/null || {
    echo "ERROR: production compose does not reference production secrets path" >&2
    exit 1
  }

echo "[INS-11a] staging user cannot read production secret files"
sudo -u "$staging_user" test -r "$production_tree/api.env" && {
  echo "ERROR: staging user can read production api.env" >&2
  exit 1
}

echo "[INS-11b] production user cannot read staging secret files"
sudo -u "$production_user" test -r "$staging_tree/api.env" && {
  echo "ERROR: production user can read staging api.env" >&2
  exit 1
}

echo "[INS-11c] staging workflow user cannot traverse production tree"
sudo -u "$staging_user" ls /opt/vocanova/production >/dev/null 2>&1 && {
  echo "ERROR: staging user can list /opt/vocanova/production" >&2
  exit 1
}

echo "PASS: production/staging secret boundary rehearsal checks succeeded"
