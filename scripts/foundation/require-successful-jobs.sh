#!/usr/bin/env bash

set -euo pipefail

if [[ "$#" -eq 0 ]]; then
  echo "at least one named job result is required" >&2
  exit 2
fi

blocked=0
for entry in "$@"; do
  name="${entry%%=*}"
  result="${entry#*=}"
  if [[ -z "$name" || "$name" == "$entry" ]]; then
    echo "invalid job result: $entry" >&2
    exit 2
  fi
  echo "$name=$result"
  if [[ "$result" != "success" ]]; then
    blocked=1
  fi
done

if [[ "$blocked" -ne 0 ]]; then
  echo "one or more required jobs did not succeed" >&2
  exit 1
fi

echo "all required jobs succeeded"
