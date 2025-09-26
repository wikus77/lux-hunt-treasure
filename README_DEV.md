# M1SSION™ Development Guide

## Deploy Edge Functions
```bash
supabase functions deploy stripe-mode
supabase functions deploy create-payment-intent
supabase functions deploy handle-buzz-press
```

## Quick Checks
```bash
# 1) Stripe mode
curl -X POST "$SUPABASE_URL/functions/v1/stripe-mode"

# 2) Payment intent
curl -s -X POST "$SUPABASE_URL/functions/v1/create-payment-intent" \
 -H "Content-Type: application/json" \
 -d '{"amount":199,"currency":"eur","payment_type":"buzz"}'

# 3) Buzz Map — controlla 5 inserimenti (quota giornaliera)
# verificaleultime aree:
select id, radius_km, created_at from public.user_map_areas
 where user_id = '<UUID>' and source='buzz_map'
 order by created_at desc limit 5;
```

## M1SSION PRIZE Assets

Immagini hero generate per il sistema di rotazione:
- `/public/assets/m1ssion-prize/hero-forest-watch.png`
- `/public/assets/m1ssion-prize/hero-forest-lambo.png`
- `/public/assets/m1ssion-prize/hero-forest-lambo-porsche.png`
- `/public/assets/m1ssion-prize/treasure-forest-car.png`

Rotazione automatica ogni 8 secondi nell'hero section.