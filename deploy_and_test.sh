#!/bin/bash

# Deploy functions to production
echo "🚀 Deploying Stripe functions to production..."

supabase functions deploy stripe-mode
supabase functions deploy create-payment-intent  
supabase functions deploy handle-buzz-press

echo "✅ Functions deployed!"

# Set your environment variables
export SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"

# For service role tests (uncomment if you have the service role key)
# export SR_KEY="YOUR_SERVICE_ROLE_KEY_HERE"

echo ""
echo "🔍 Testing Stripe mode detection..."
curl -s "$SUPABASE_URL/functions/v1/stripe-mode" \
  -H "Authorization: Bearer $ANON_KEY" | jq .

echo ""
echo "💳 Testing payment intent creation (admin smoke test)..."
echo "Note: Replace SR_KEY with your actual service role key for this test"
# curl -s -X POST "$SUPABASE_URL/functions/v1/create-payment-intent" \
#   -H "Authorization: Bearer $SR_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{"amount":199,"currency":"eur","payment_type":"buzz","plan":"one_time","_adminSmoke":true}' | jq .

echo ""
echo "📝 For user JWT test, run:"
echo 'export USER_JWT="<PASTE_YOUR_USER_TOKEN>"'
echo 'curl -s -X POST "$SUPABASE_URL/functions/v1/create-payment-intent" \'
echo '  -H "Authorization: Bearer $USER_JWT" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"amount":499,"currency":"eur","payment_type":"buzz_map","plan":"one_time"}'"'"' | jq .'

echo ""
echo "🎯 Testing buzz area generation..."
echo "Note: This requires a valid user JWT token"
echo 'curl -s -X POST "$SUPABASE_URL/functions/v1/handle-buzz-press" \'
echo '  -H "Authorization: Bearer $USER_JWT" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"coordinates":{"lat":41.9028,"lng":12.4964}}'"'"' | jq .'

echo ""
echo "✅ Deploy and test script complete!"
echo "🔑 Make sure to set your USER_JWT token for full testing"