#!/usr/bin/env bash
# © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
set -euo pipefail
: "${SUPABASE_URL:?export SUPABASE_URL first}"
: "${SUPABASE_ANON_KEY:?export SUPABASE_ANON_KEY first}"
: "${USER_JWT:?export USER_JWT first}"
echo "== OPTIONS validate-qr =="
curl -sI -X OPTIONS "$SUPABASE_URL/functions/v1/validate-qr" | sed -n '1,/$/p'
echo "== VALIDATE M1-TEST =="
curl -sS "$SUPABASE_URL/functions/v1/validate-qr?c=M1-TEST" -H "apikey: $SUPABASE_ANON_KEY"
echo
echo "== REDEEM 1 =="
curl -sS "$SUPABASE_URL/functions/v1/redeem-qr" -X POST \
  -H "authorization: Bearer $USER_JWT" -H "apikey: $SUPABASE_ANON_KEY" \
  -H "content-type: application/json" \
  --data '{"code":"M1-TEST","user_id":"REPLACE-UID"}' ; echo
echo "== REDEEM 2 (should 409) =="
curl -sS "$SUPABASE_URL/functions/v1/redeem-qr" -X POST \
  -H "authorization: Bearer $USER_JWT" -H "apikey: $SUPABASE_ANON_KEY" \
  -H "content-type: application/json" \
  --data '{"code":"M1-TEST","user_id":"REPLACE-UID"}' ; echo
