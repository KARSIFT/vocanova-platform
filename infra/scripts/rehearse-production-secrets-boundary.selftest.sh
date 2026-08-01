#!/usr/bin/env bash
set -euo pipefail

# VOC-037-T06 / VOC-037-EV-01 — disposable rehearsal harness for
# rehearse-production-secrets-boundary.sh.
#
# VOC-037-TEST-01's preconditions call for the INS-9..INS-11
# negative-access rehearsal to be run against "a disposable/
# staging-equivalent rehearsal of the production shape" rather than
# waiting for the real production host. This harness builds exactly
# that shape - two OS accounts, two sibling secret trees, the real
# production compose file - runs the boundary script against it, and
# then deliberately breaks each isolation control to confirm the
# script fails when it should.
#
# A rehearsal that only ever runs against a correctly configured tree
# proves nothing about the checker, so the negative cases below are
# the substantive half of this harness.
#
# Requires root (creates users) and the docker CLI (INS-10 renders the
# compose file). Everything it creates is removed on exit.
#
# Usage: sudo infra/scripts/rehearse-production-secrets-boundary.selftest.sh

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
boundary_script="$repo_root/infra/scripts/rehearse-production-secrets-boundary.sh"
production_compose="$repo_root/infra/docker-compose.production.yml"

rehearsal_root="/srv/vocanova-boundary-rehearsal"
staging_root="$rehearsal_root/infra"
production_root="$rehearsal_root/production"
staging_user="vocstgrehearsal"
production_user="vocprodrehearsal"

if [ "$(id -u)" -ne 0 ]; then
  echo "this harness must run as root (it creates disposable OS accounts)" >&2
  exit 1
fi

cleanup() {
  rm -rf "$rehearsal_root"
  userdel "$staging_user" 2>/dev/null || true
  userdel "$production_user" 2>/dev/null || true
}
trap cleanup EXIT

provision_rehearsal_shape() {
  cleanup
  useradd --system --no-create-home --shell /usr/sbin/nologin "$staging_user"
  useradd --system --no-create-home --shell /usr/sbin/nologin "$production_user"

  mkdir -p "$staging_root/secrets" "$rehearsal_root/apps/api/scripts"
  printf 'DATABASE_URL=postgres://staging-placeholder@postgres:5432/vocanova\n' \
    > "$staging_root/secrets/api.env"
  chown -R "$staging_user:$staging_user" "$staging_root" "$rehearsal_root/apps"
  chmod 750 "$staging_root"
  chmod 700 "$staging_root/secrets"
  chmod 600 "$staging_root/secrets/api.env"

  mkdir -p "$production_root/secrets/nginx"
  cp "$production_compose" "$production_root/docker-compose.production.yml"
  printf 'DATABASE_URL=postgres://production-placeholder@postgres:5432/vocanova\n' \
    > "$production_root/secrets/api.env"
  printf 'POSTGRES_PASSWORD=production-placeholder\n' \
    > "$production_root/secrets/postgres.env"
  printf 'placeholder-not-a-real-certificate\n' > "$production_root/secrets/nginx/cert.pem"
  printf 'placeholder-not-a-real-key\n' > "$production_root/secrets/nginx/key.pem"

  chown -R "$production_user:$production_user" "$production_root"
  chmod 750 "$production_root"
  chmod 700 "$production_root/secrets"
  chmod 700 "$production_root/secrets/nginx"
  chmod 600 "$production_root/secrets"/*.env
  chmod 600 "$production_root/secrets/nginx"/*.pem
}

run_boundary_script() {
  VOCANOVA_PRODUCTION_ROOT="$production_root" \
  VOCANOVA_STAGING_ROOT="$staging_root" \
    "$boundary_script" "$staging_user" "$production_user"
}

expect_pass() {
  echo "=== case: $1 (expect PASS) ==="
  if run_boundary_script; then
    echo "--- as expected: boundary script passed"
  else
    echo "--- UNEXPECTED: boundary script failed on a correctly configured tree" >&2
    exit 1
  fi
  echo
}

expect_fail() {
  echo "=== case: $1 (expect FAIL) ==="
  if run_boundary_script; then
    echo "--- UNEXPECTED: boundary script passed despite a broken control" >&2
    exit 1
  else
    echo "--- as expected: boundary script failed"
  fi
  echo
}

provision_rehearsal_shape
expect_pass "correctly isolated production tree"

provision_rehearsal_shape
chmod 755 "$production_root"
expect_fail "production root world-traversable (0755)"

provision_rehearsal_shape
chmod 644 "$production_root/secrets/api.env"
expect_fail "production api.env world-readable (0644)"

provision_rehearsal_shape
chown -R "$staging_user:$staging_user" "$production_root"
chmod 750 "$production_root"
expect_fail "staging deploy user owns the production tree"

provision_rehearsal_shape
rm -f "$production_root/secrets"/*.env
expect_fail "production secrets absent"

provision_rehearsal_shape
sed -i "s#\${VOCANOVA_PRODUCTION_ROOT:-/opt/vocanova/production}/secrets/api.env#/opt/vocanova/infra/secrets/api.env#" \
  "$production_root/docker-compose.production.yml"
expect_fail "production compose points at the staging secrets tree"

# The two cases below are the co-location regression VOC-037-T06's
# review found: staging's own deploy step used to run
# `chown -R <staging user> /opt/vocanova`, which silently handed the
# sibling production tree to the staging deploy user on the next
# staging deploy. They mirror the ownership command in
# .github/workflows/deploy-staging.yml before and after this task
# narrowed it, and must stay in lockstep with that workflow.
provision_rehearsal_shape
chown -R "$staging_user:$staging_user" "$staging_root" "$rehearsal_root/apps"
expect_pass "staging deploy re-owns only its own subtrees (current workflow)"

provision_rehearsal_shape
chown -R "$staging_user:$staging_user" "$rehearsal_root"
expect_fail "staging deploy re-owns the whole shared root (pre-fix workflow)"

echo "SELFTEST PASS: boundary script accepts the isolated shape and rejects every broken control above"
