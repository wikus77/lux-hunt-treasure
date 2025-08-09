#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
PROJECT_URL="${PROJECT_URL:-https://vkjrqirvdvjbemsfzxof.supabase.co}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk}"
QR_CODE="${QR_CODE:-e0defe4c-ed07-4d81-ac6d-9a91f98a6327}"

STAMP=$(date +%s)
EMAIL="${EMAIL:-m1ssion.qa+${STAMP}@example.com}"
PASSWORD="${PASSWORD:-TestPassw0rd!}"

# Opzionale: per upsert QR serve service role (bypassa RLS)
SERVICE_ROLE="${SERVICE_ROLE:-}"

# === check deps ===
for dep in curl jq; do
  command -v "$dep" >/dev/null || { echo "❌ manca $dep"; exit 1; }
done

echo "▶ PROJECT_URL : $PROJECT_URL"
echo "▶ QR_CODE     : $QR_CODE"
echo "▶ EMAIL       : $EMAIL"

# === (OPZ) Upsert QR con service role ===
if [[ -n "$SERVICE_ROLE" ]]; then
  echo "→ Upsert QR in public.qr_codes (service role)…"
  curl -s -X POST "$PROJECT_URL/rest/v1/qr_codes" \
    -H "apikey: $SERVICE_ROLE" \
    -H "Authorization: Bearer $SERVICE_ROLE" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d "$(jq -n --arg code "$QR_CODE" '{
          code:$code, title:"Test Buzz Credit",
          reward_type:"buzz_credit", reward_value:1,
          is_active:true, is_hidden:true
        }')" | jq -r .
else
  echo "ℹ️  SERVICE_ROLE non impostato: salto l’upsert del QR."
fi

# === SIGNUP idempotente ===
echo "→ Signup utente…"
SIGNUP=$(curl -s -X POST "$PROJECT_URL/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg e "$EMAIL" --arg p "$PASSWORD" '{email:$e,password:$p}')" )

if echo "$SIGNUP" | jq -e '.error' >/dev/null 2>&1; then
  MSG=$(echo "$SIGNUP" | jq -r '.error.message')
  echo "⚠️  Signup: $MSG (continuo con login)"
else
  echo "✅ Signup OK"
fi

# === LOGIN (access token utente) ===
echo "→ Login utente…"
ACCESS_TOKEN=$(curl -s -X POST "$PROJECT_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg e "$EMAIL" --arg p "$PASSWORD" '{email:$e,password:$p}')" | jq -r '.access_token')

if [[ -z "${ACCESS_TOKEN}" || "${ACCESS_TOKEN}" == "null" ]]; then
  echo "❌ Login fallito: niente access_token"; exit 1;
fi
echo "✅ Login OK (token: ${ACCESS_TOKEN:0:20}...)"

# === REDEEM ===
echo "→ Redeem QR…"
REDEEM=$(curl -s -X POST "$PROJECT_URL/rest/v1/rpc/qr_redeem" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg code "$QR_CODE" '{code:$code}')" )
echo "$REDEEM" | jq .

STATUS=$(echo "$REDEEM" | jq -r '.status // empty')
if [[ "$STATUS" == "ok" ]]; then
  echo "✅ Redeem riuscito"
elif [[ "$STATUS" == "already_claimed" ]]; then
  echo "ℹ️  QR già riscattato da questo utente"
else
  echo "⚠️  Risposta redeem inattesa"
fi

# === XP STATUS ===
echo "→ get_user_xp_status…"
XP=$(curl -s -X POST "$PROJECT_URL/rest/v1/rpc/get_user_xp_status" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' )
echo "$XP" | jq .

# === QR visibili all’utente (RLS) ===
echo "→ qr_codes visibili (RLS)…"
QRS=$(curl -s "$PROJECT_URL/rest/v1/qr_codes?select=id,code,title,lat,lng,is_hidden" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$QRS" | jq .

# === REPORT ===
BUZZ=$(echo "$XP" | jq -r '.free_buzz_credit // .free_buzz_credits // empty')
MAPC=$(echo "$XP" | jq -r '.free_buzz_map_credit // empty')
echo
echo "===== REPORT ====="
echo "User        : $EMAIL"
echo "Redeem      : ${STATUS:-?}"
echo "Buzz credit : ${BUZZ:-?}"
echo "Map credit  : ${MAPC:-?}"
echo "Discovered  : $(echo "$QRS" | jq 'length') QR"
echo "==============="
