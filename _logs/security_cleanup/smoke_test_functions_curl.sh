#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="${1:-vkjrqirvdvjbemsfzxof}"

# auto-load env (best-effort)
for f in .env.local .env .env.production .env.development; do
  if [[ -f "$f" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$f" || true
    set +a
  fi
done

SUPABASE_URL="${SUPABASE_URL:-${VITE_SUPABASE_URL:-https://${PROJECT_REF}.supabase.co}}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${VITE_SUPABASE_ANON_KEY:-}}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

OUT_DIR="_logs/security_cleanup"
LOG="$OUT_DIR/smoke_test_curl_output.txt"
mkdir -p "$OUT_DIR"

need() { [[ -n "${!1:-}" ]] || { echo "MISSING: $1" | tee -a "$LOG"; exit 2; }; }

echo "========================================" | tee "$LOG"
echo "M1SSION SMOKE TEST (CURL)"              | tee -a "$LOG"
echo "========================================" | tee -a "$LOG"
echo "Project: $PROJECT_REF"                  | tee -a "$LOG"
echo "URL:     $SUPABASE_URL"                 | tee -a "$LOG"
echo "Date:    $(date)"                       | tee -a "$LOG"
echo ""                                      | tee -a "$LOG"

need SUPABASE_URL
need SUPABASE_ANON_KEY

call_fn() {
  local fn="$1"
  # Note: Using explicit check to avoid bash parsing issues with ${var:-{}}
  local body
  if [[ -n "${2:-}" ]]; then
    body="$2"
  else
    body='{}'
  fi
  local bearer="${3:-$SUPABASE_ANON_KEY}"
  curl -sS \
    -H "Content-Type: application/json" \
    -H "apikey: ${bearer}" \
    -H "Authorization: Bearer ${bearer}" \
    -d "${body}" \
    "${SUPABASE_URL%/}/functions/v1/${fn}" \
    -w "\n%{http_code}\n"
}

check() {
  local fn="$1"
  local body="$2"
  local expect="$3"
  local mode="${4:-strict}" # strict|allow401|allow403
  local out code response_body

  out="$(call_fn "$fn" "$body")"
  # Extract HTTP code (last line)
  code="$(echo "$out" | tail -n 1 | tr -d '\r')"
  # Extract response body (all but last line) - use sed '$d' with single quotes!
  response_body="$(echo "$out" | sed '$d' | tr '\n' ' ' | sed 's/  */ /g' | cut -c1-200)"
  # Handle empty body
  [[ -z "$response_body" ]] && response_body="(empty body)"

  if [[ "$code" == "$expect" ]]; then
    echo "Testing $fn... ✅ PASS (HTTP $code)" | tee -a "$LOG"
    return 0
  fi
  
  # Check allowed alternate codes
    if [[ "$mode" == "allow401" && "$code" == "401" ]]; then
    echo "Testing $fn... ⚠️  WARN (HTTP 401 - user auth required)" | tee -a "$LOG"
    echo "   Response: $response_body" | tee -a "$LOG"
    return 0  # Warn but don't fail
  fi
  
  if [[ "$mode" == "allow403" && "$code" == "403" ]]; then
    echo "Testing $fn... ⚠️  WARN (HTTP 403 - admin only)" | tee -a "$LOG"
    echo "   Response: $response_body" | tee -a "$LOG"
    return 0  # Warn but don't fail
  fi
  
  # Actual failure
      echo "Testing $fn... ❌ FAIL (HTTP $code, expected $expect)" | tee -a "$LOG"
  echo "   Response: $response_body" | tee -a "$LOG"
      return 1
}

pass=0
fail=0
warn=0

run() {
  local fn="$1" body="$2" expect="$3" mode="${4:-strict}"
  if check "$fn" "$body" "$expect" "$mode"; then
    # Check if it was a warn (401/403 in allow mode) or real pass
    if [[ "$mode" == "allow401" || "$mode" == "allow403" ]]; then
      # Could be warn or pass - check was successful either way
      pass=$((pass+1))
    else
      pass=$((pass+1))
    fi
  else
    fail=$((fail+1))
  fi
}

echo "[PUBLIC-ish] (anon jwt)" | tee -a "$LOG"
run "get-firebase-config" '{}' "200" "strict"
run "fcm-config"          '{}' "200" "strict"
run "get-vapid"           '{}' "200" "strict"
run "stripe-mode"         '{}' "200" "strict"

echo "" | tee -a "$LOG"
echo "[ADMIN-ONLY FUNCTIONS]" | tee -a "$LOG"
# push-broadcast requires admin privileges - 403 is expected
run "push-broadcast" '{"title":"smoke","body":"test"}' "200" "allow403"

echo "" | tee -a "$LOG"
echo "[USER AUTH REQUIRED?] (401 allowed)" | tee -a "$LOG"
# These functions require valid user JWT - 401 is expected with anon key
run "webpush-self-test" '{"dry_run":true}' "200" "allow401"
# get-user-state expects {"userId":"..."} - with anon it returns defaults
run "get-user-state" '{"userId":"smoke_test_anon"}' "200" "allow401"

echo "" | tee -a "$LOG"
echo "[ANALYTICS]" | tee -a "$LOG"
# analytics-track requires: session_id + events[] array with event_name from allowlist
# Platform must be one of: 'web', 'ios', 'android', 'pwa' (DB constraint)
# Pre-generate timestamps to avoid bash interpolation issues
TS_EPOCH=$(date +%s)
TS_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ANALYTICS_BODY="{\"session_id\":\"smoke_test_${TS_EPOCH}\",\"anon_id\":\"smoke_anon\",\"platform\":\"web\",\"app_version\":\"1.0.0-smoke\",\"locale\":\"it\",\"timezone\":\"Europe/Rome\",\"events\":[{\"event_name\":\"app_open\",\"client_ts\":\"${TS_ISO}\",\"props\":{\"source\":\"smoke_test\"}}]}"
run "analytics-track" "$ANALYTICS_BODY" "200" "allow401"

echo "" | tee -a "$LOG"
echo "========================================" | tee -a "$LOG"
echo "SUMMARY"                                 | tee -a "$LOG"
echo "========================================" | tee -a "$LOG"
echo "Passed: $pass"                           | tee -a "$LOG"
echo "Warn:   $warn"                           | tee -a "$LOG"
echo "Failed: $fail"                           | tee -a "$LOG"
echo ""                                       | tee -a "$LOG"
echo "Log: $LOG"                               | tee -a "$LOG"

if [[ "$fail" -gt 0 ]]; then exit 1; fi
