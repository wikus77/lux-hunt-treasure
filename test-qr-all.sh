# === CONFIGURA VARIABILI ===
export PROJECT_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"
export SERVICE_ROLE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAzNDIyNiwiZXhwIjoyMDYwNjEwMjI2fQ.b1_rXqFAEGcXNmuCwuiGo3VbCFOi5s7NCmGQ9RbsUUY"
export QR_CODE="e0defe4c-ed07-4d81-ac6d-9a91f98a6327"

# Utente di test (nuovo ogni run)
export EMAIL="m1ssion.qa+$(date +%s)@example.com"
export PASSWORD="TestPassw0rd!"

echo "▶ PROJECT_URL : $PROJECT_URL"
echo "▶ QR_CODE     : $QR_CODE"
echo "▶ EMAIL       : $EMAIL"

# === 1) UPSERT QR (usa service_role, bypass RLS) ===
curl -s -X POST "$PROJECT_URL/rest/v1/qr_codes?on_conflict=code" \
  -H "apikey: $SERVICE_ROLE" \
  -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  -d '{
    "code":"'"$QR_CODE"'",
    "title":"QA Test QR",
    "reward_type":"buzz_credit",
    "reward_value":1,
    "lat":45.0,
    "lng":9.0,
    "is_active":true,
    "is_hidden":true
  }' | jq -r '.[0].id // "upsert-ok"'

# === 2) CREA/CONFERMA UTENTE (admin API) ===
curl -s -X POST "$PROJECT_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE" \
  -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$EMAIL"'","password":"'"$PASSWORD"'","email_confirm":true}' \
  | jq '{id,email}'

# (se già esiste, il passo sopra può rispondere con errore: è ok, prosegui)

# === 3) LOGIN PASSWORD GRANT (token utente) ===
LOGIN=$(curl -s -X POST "$PROJECT_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$EMAIL"'","password":"'"$PASSWORD"'"}')

echo "$LOGIN" | jq '{status:"login", has_token:(.access_token!=null), error:.error}'
export ACCESS_TOKEN=$(echo "$LOGIN" | jq -r '.access_token // empty')

# Fallback: se non abbiamo access_token, prova a leggere l’utente per forzare stato
if [ -z "$ACCESS_TOKEN" ]; then
  echo "⚠️  Nessun access_token dal login, tento user info (solo per debug)…"
  curl -i -s "$PROJECT_URL/auth/v1/user" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ACCESS_TOKEN"
fi

# === 4) REDEEM DEL QR (con token utente) ===
curl -s -X POST "$PROJECT_URL/rest/v1/rpc/qr_redeem" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"'"$QR_CODE"'"}' | jq '{status,reward_type,reward_value}'

# === 5) USER ID (dal token) ===
USER_JSON=$(curl -s "$PROJECT_URL/auth/v1/user" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$USER_JSON" | jq '{id,email}'
export USER_ID=$(echo "$USER_JSON" | jq -r '.id')

# === 6) VERIFICA CREDITI (query diretta a user_credits via service_role) ===
curl -s "$PROJECT_URL/rest/v1/user_credits?user_id=eq.$USER_ID&select=user_id,free_buzz_credit,free_buzz_map_credit,updated_at" \
  -H "apikey: $SERVICE_ROLE" \
  -H "Authorization: Bearer $SERVICE_ROLE" | jq .

# === 7) VERIFICA RLS: QR visibili all’utente (solo discovered) ===
curl -s "$PROJECT_URL/rest/v1/qr_codes?select=id,code,title,lat,lng,is_hidden" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
