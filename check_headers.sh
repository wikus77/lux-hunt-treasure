#!/usr/bin/env bash
set -euo pipefail
: "${GOOD_URL:?}"; : "${PROD_URL:?}"
for path in "/" "/service-worker.js" "/sw.js" "/manifest.json" "/robots.txt"; do
  echo "=== $path — GOOD ==="
  curl -sI "$GOOD_URL$path" | sed -n '1,20p'
  echo "=== $path — PROD ==="
  curl -sI "$PROD_URL$path" | sed -n '1,20p'
  echo
done
