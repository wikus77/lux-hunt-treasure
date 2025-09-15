# © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
# TEST MANUALI AUTOMATIZZATI - Piano FREE

## TEST CASE 1: Nuovo utente → Piano FREE
```
PASSI:
1. Nuovo utente si registra
2. Login completato
3. Viene reindirizzato a /choose-plan (prima volta)
4. Click su "Inizia Gratis" [data-testid="cta-free"]
5. ATTESO: Redirect immediato a /home (nessun blocco "Accesso non disponibile")

VERIFICA DB:
- Riga in `public.subscriptions` con `user_id`, `status='active'`, `tier='free'`
- Campo `public.profiles.choose_plan_seen = true`
```

## TEST CASE 2: Stesso utente → Nessun redirect a /choose-plan
```
PASSI:
1. Stesso utente (già FREE) fa logout
2. Login nuovamente
3. ATTESO: NESSUN redirect a /choose-plan
4. Accesso normale a /home

VERIFICA:
- `choose_plan_seen = true` → non mostra più /choose-plan
```

## TEST CASE 3: Admin → Mai redirect
```
PASSI:
1. Utente con `profiles.role` contenente 'admin' o 'owner'
2. Login
3. ATTESO: NESSUN redirect a /choose-plan (anche se choose_plan_seen=false)

VERIFICA:
- Logica: `!isAdmin && !choosePlanSeen && !hasActiveSub` → per admin sempre false
```

## TEST CASE 4: Bottone "Torna alla homepage"
```
PASSI:
1. Se si finisce in AccessBlockedView per qualche motivo
2. Click su "← Torna alla homepage"
3. ATTESO: Navigazione a /home

VERIFICA:
- Bottone type="button", no preventDefault(), navigate('/home')
```

## DIAGNOSTICA
Console logs per verifica:
- `[FREE] Starting free plan creation...`
- `[FREE] { data, error }`
- `🔄 Redirecting new user to choose-plan`

## FALLBACK VERIFICATI
- AccessBlockedView NON mostra più fallback "Titanium"
- Piano mostrato deriva da `getActiveSubscription()` → "Free" se null
- Helper `getActiveSubscription` ritorna `{hasActive: false, plan: null}` se nessun abbonamento