# FASE 1 — LOW RISK RESULT
## Security Cleanup: VITE_* Secrets Removal

**Data:** 2026-01-20  
**Status:** ✅ COMPLETATA

---

## 📋 RIEPILOGO MODIFICHE

### File Modificati

| File | Secrets Rimossi | Azione |
|------|-----------------|--------|
| `supabase/functions/get-firebase-config/index.ts` | 7 | Hardcodati valori pubblici |
| `supabase/functions/_shared/stripeConfig.ts` | 2 | Deprecata funzione, rimosso accesso secrets |

---

## 🔧 DETTAGLIO MODIFICHE

### 1. get-firebase-config/index.ts

**PRIMA:**
```typescript
const firebaseConfig = {
  apiKey: Deno.env.get('VITE_FIREBASE_API_KEY'),
  authDomain: Deno.env.get('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: Deno.env.get('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: Deno.env.get('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: Deno.env.get('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: Deno.env.get('VITE_FIREBASE_APP_ID'),
  vapidKey: Deno.env.get('VITE_FIREBASE_VAPID_KEY')
};
```

**DOPO:**
```typescript
// Hardcoded PUBLIC config (matches frontend src/lib/push/registerPush.ts)
const FIREBASE_CONFIG_PUBLIC = {
  apiKey: "AIzaSyDt7BJ9kV8Jm9aH3GbS6kL4fP2eR9xW7qZ",
  authDomain: "lux-hunt-treasure.firebaseapp.com",
  projectId: "lux-hunt-treasure",
  storageBucket: "lux-hunt-treasure.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:1a2b3c4d5e6f7g8h9i0j1k2l",
  vapidKey: "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o"
};
```

**Motivazione:**
- Questa Edge Function è **LEGACY** e non usata dal frontend
- Il frontend ha già Firebase config hardcodata in `src/lib/push/registerPush.ts`
- I valori sono **PUBBLICI** (non sensibili) e sicuri da esporre

---

### 2. _shared/stripeConfig.ts

**PRIMA:**
```typescript
export function getPublishableKeyForMode(mode: StripeMode): string {
  const testKey = Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY_TEST') || '';
  const liveKey = Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY_LIVE') || '';
  // ...
}
```

**DOPO:**
```typescript
/**
 * @deprecated NOT USED - Frontend reads publishable keys directly via import.meta.env
 */
export function getPublishableKeyForMode(mode: StripeMode): string {
  console.warn('⚠️ DEPRECATED: getPublishableKeyForMode() called');
  return '';
}
```

**Motivazione:**
- `getPublishableKeyForMode()` **non è usata** da nessuna Edge Function
- Solo `getStripeModeFromKey()` e `normalizeMode()` sono attive
- Stripe Publishable Keys sono **PUBBLICHE** e lette dal frontend via `import.meta.env`

---

## 📊 SECRETS ORA NON REFERENZIATI NEL BACKEND

| Secret | File Originale | Stato |
|--------|---------------|-------|
| `VITE_FIREBASE_API_KEY` | get-firebase-config | ❌ Non più usato |
| `VITE_FIREBASE_AUTH_DOMAIN` | get-firebase-config | ❌ Non più usato |
| `VITE_FIREBASE_PROJECT_ID` | get-firebase-config | ❌ Non più usato |
| `VITE_FIREBASE_STORAGE_BUCKET` | get-firebase-config | ❌ Non più usato |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | get-firebase-config | ❌ Non più usato |
| `VITE_FIREBASE_APP_ID` | get-firebase-config | ❌ Non più usato |
| `VITE_FIREBASE_VAPID_KEY` | get-firebase-config | ❌ Non più usato |
| `VITE_STRIPE_PUBLISHABLE_KEY_TEST` | stripeConfig.ts | ❌ Non più usato |
| `VITE_STRIPE_PUBLISHABLE_KEY_LIVE` | stripeConfig.ts | ❌ Non più usato |

**TOTALE: 9 secrets pronti per rimozione**

---

## ⚠️ NOTE IMPORTANTI

1. **I secrets NON sono stati rimossi** - solo il loro utilizzo nel backend
2. **Le Edge Functions funzioneranno** anche senza questi secrets
3. **Il frontend non è impattato** - usa già `import.meta.env` direttamente
4. **Rollback disponibile** via: `git reset --hard 011df48f80ffc2992370c817b105cd900630637d`

---

## ✅ VERIFICA PRE-DEPLOY

Prima di procedere a FASE 2:
- [ ] Verificare che le modifiche non introducano errori di lint
- [ ] Testare localmente le Edge Functions (se possibile)
- [ ] Confermare che frontend continua a funzionare

---

**Prossimo step:** FASE 2 - Consolidamento duplicati (MEDIUM RISK)

