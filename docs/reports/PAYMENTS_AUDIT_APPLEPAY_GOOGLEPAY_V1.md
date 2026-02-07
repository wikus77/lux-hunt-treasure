# PAYMENTS AUDIT — Apple Pay & Google Pay

**Data**: 2026-02-07  
**Versione**: V1  
**Autore**: Cursor Agent  
**Progetto**: M1SSION™

---

## 1. ARCHITETTURA ATTUALE PAGAMENTI

### Provider Attivo
- **Stripe** — API version `2023-10-16`
- Publishable Key: `VITE_STRIPE_PUBLISHABLE_KEY` (pk_live_*)
- Secret Key: `STRIPE_SECRET_KEY` (sk_live_*) — server-side only

### Flusso Pagamento (Web)

```
┌──────────────┐     ┌──────────────────────┐     ┌────────────┐
│   Client     │     │   Edge Function      │     │   Stripe   │
│  (React)     │────▶│ create-payment-intent│────▶│   API      │
└──────────────┘     └──────────────────────┘     └────────────┘
       │                       │                        │
       │◀──── client_secret ───┘                        │
       │                                                │
       │     ┌──────────────────────┐                   │
       │────▶│ CardElement confirm  │──────────────────▶│
       │     └──────────────────────┘                   │
       │                                                │
       │     ┌──────────────────────┐                   │
       │◀────│ Webhook: succeeded   │◀──────────────────│
             └──────────────────────┘
```

### Flusso Pagamento (iOS Native)
```
┌──────────────┐     ┌──────────────────────┐     ┌────────────────┐
│   Capacitor  │     │   Edge Function      │     │   Apple IAP    │
│   App        │────▶│  verify-iap-purchase │────▶│   StoreKit     │
└──────────────┘     └──────────────────────┘     └────────────────┘
```

### Tabelle DB Coinvolte
| Tabella | Scopo |
|---------|-------|
| `payment_intents` | Log dei Payment Intent Stripe |
| `profiles.subscription_tier` | Tier utente attuale |
| `m1u_transactions` | Log transazioni M1U |

### Edge Functions Pagamenti
| Function | Scopo |
|----------|-------|
| `create-payment-intent` | Crea PaymentIntent Stripe |
| `create-checkout` | Crea sessione Checkout Stripe |
| `stripe-webhook` | Gestisce eventi Stripe |
| `stripe-webhook-secure` | Webhook con firma avanzata |
| `credit-m1u-purchase` | Accredita M1U dopo acquisto |
| `handle-payment-success` | Handler post-pagamento |
| `verify-iap-purchase` | Verifica acquisti IAP native |
| `validate-iap` | Validazione ricevute IAP |

---

## 2. APPLE PAY — STATO

### Valutazione: ⚠️ **INCOMPLETO**

| Requisito | Status | Note |
|-----------|--------|------|
| UI Component | ✅ Presente | `ApplePayBox.tsx` |
| Capability Detection | ✅ Presente | `ApplePaySession.canMakePayments()` |
| Domain Verification File | ❌ **MANCANTE** | `/.well-known/apple-developer-merchantid-domain-association` |
| Merchant ID Config | ❌ **NON TROVATO** | Nessun `merchantIdentifier` nel codice |
| Stripe Payment Request | ⚠️ Parziale | Usa `CardElement`, non `PaymentRequestButtonElement` |
| Safari iOS Support | ⚠️ Teorico | Dipende da domain verification |
| iOS WebView Support | ❓ Da testare | Capacitor WKWebView |
| Fallback UI | ✅ Presente | Mostra "non disponibile" se non supportato |

### File Rilevanti
```
src/components/payments/ApplePayBox.tsx   — UI stub (solo click handler)
src/hooks/useStripePayment.ts             — detectPaymentMethodAvailability()
src/vite-env-extensions.d.ts              — Type definitions ApplePaySession
```

### Gap Tecnici Apple Pay
1. **Domain Verification mancante**: Serve file `/.well-known/apple-developer-merchantid-domain-association` su m1ssion.eu
2. **Merchant ID non configurato**: Nessun `merchantIdentifier` per Apple Pay
3. **Stripe Payment Request Button non usato**: Il codice usa solo `CardElement`, non il unified `PaymentRequestButtonElement` che supporta Apple Pay out-of-the-box
4. **onApplePay() vuoto**: Il callback nel componente non ha implementazione reale

---

## 3. GOOGLE PAY — STATO

### Valutazione: ⚠️ **INCOMPLETO**

| Requisito | Status | Note |
|-----------|--------|------|
| UI Component | ✅ Presente | `GooglePayBox.tsx` |
| Google Pay SDK Load | ✅ Presente | Carica `pay.google.com/gp/p/js/pay.js` |
| isReadyToPay Check | ⚠️ Parziale | Solo check presenza `window.google.payments` |
| Merchant ID | ❌ **NON TROVATO** | Nessun `merchantId` configurato |
| Gateway Config | ❌ **NON TROVATO** | Nessun `tokenizationSpecification` |
| Stripe Integration | ⚠️ Parziale | Usa PaymentRequest detection ma non Google Pay API |
| Chrome Android | ⚠️ Teorico | Dipende da config |
| Fallback UI | ✅ Presente | Mostra "non disponibile" |

### File Rilevanti
```
src/components/payments/GooglePayBox.tsx  — UI stub (solo click handler)
src/hooks/useStripePayment.ts             — 'PaymentRequest' in window check
src/vite-env-extensions.d.ts              — Type definitions
```

### Gap Tecnici Google Pay
1. **merchantId mancante**: Serve configurazione Google Pay Console
2. **Gateway tokenization mancante**: Nessun `tokenizationSpecification` per Stripe
3. **isReadyToPay() non implementato**: Il check attuale è solo per presenza SDK, non per capability reale
4. **onGooglePay() vuoto**: Callback senza implementazione
5. **Stripe PaymentRequestButton non usato**: Potrebbe gestire Google Pay automaticamente

---

## 4. GAP LIST PRIORITARIA

| # | Missing Item | Dove Implementare | Bloccante | Rischio |
|---|--------------|-------------------|-----------|---------|
| 1 | Apple domain verification file | `public/.well-known/` + deploy | ✅ Sì | Basso |
| 2 | Apple Merchant ID config | Stripe Dashboard + env | ✅ Sì | Basso |
| 3 | Google merchantId | Google Pay Console + env | ✅ Sì | Basso |
| 4 | PaymentRequestButtonElement | `M1UPaymentContent.tsx`, `StripeInAppCheckout.tsx` | ❌ No | Medio |
| 5 | Apple Pay real handler | `ApplePayBox.tsx` o sostituire con PRB | ❌ No | Basso |
| 6 | Google Pay real handler | `GooglePayBox.tsx` o sostituire con PRB | ❌ No | Basso |
| 7 | Test matrix iOS Safari | QA | ❌ No | Basso |
| 8 | Test matrix Android Chrome | QA | ❌ No | Basso |

---

## 5. PIANO DI IMPLEMENTAZIONE

### OPZIONE A: Stripe Payment Request Button (CONSIGLIATO)

> Stripe `PaymentRequestButtonElement` gestisce **automaticamente** Apple Pay e Google Pay quando configurato correttamente. Non serve scrivere codice separato per i due provider.

#### Step 1: Prerequisites (Config)
1. **Apple Pay**:
   - Registrare domain su Stripe Dashboard → Settings → Payment Methods → Apple Pay
   - Scaricare `apple-developer-merchantid-domain-association`
   - Salvare in `public/.well-known/apple-developer-merchantid-domain-association`
   - Deploy su m1ssion.eu

2. **Google Pay**:
   - Già supportato da Stripe automaticamente
   - No config extra richiesta (Stripe fa da gateway)

#### Step 2: UI Integration
1. Modificare `M1UPaymentContent.tsx`:
   - Aggiungere `PaymentRequestButtonElement` sopra il `CardElement`
   - Usare `stripe.paymentRequest()` per creare request
   - Se device supporta Apple Pay → mostra button
   - Se device supporta Google Pay → mostra button
   - Altrimenti → solo CardElement (già presente)

2. Rimuovere componenti stub:
   - `ApplePayBox.tsx` → non più necessario
   - `GooglePayBox.tsx` → non più necessario

#### Step 3: Server/Edge
- **Nessuna modifica richiesta** — `create-payment-intent` già supporta `automatic_payment_methods: { enabled: true }`

#### Step 4: QA Matrix
| Device | Browser | Apple Pay | Google Pay | Card |
|--------|---------|-----------|------------|------|
| iPhone | Safari | ✅ Test | ❌ N/A | ✅ Test |
| iPhone | iOS WKWebView | ⚠️ Test | ❌ N/A | ✅ Test |
| Android | Chrome | ❌ N/A | ✅ Test | ✅ Test |
| Mac | Safari | ✅ Test | ❌ N/A | ✅ Test |
| Mac | Chrome | ❌ N/A | ⚠️ Test | ✅ Test |
| Windows | Chrome | ❌ N/A | ⚠️ Test | ✅ Test |

#### Step 5: Rollout
1. Deploy domain verification file
2. Merge code changes
3. Test in staging
4. Enable in production

### OPZIONE B: Implementazione Manuale (NON CONSIGLIATA)

Se vuoi usare `ApplePaySession` e `google.payments.api` direttamente:
- Molto più codice
- Gestione errori complessa
- Manutenzione separata per 2 provider
- Già tutto disponibile via Stripe PRB

---

## 6. QA / TEST MATRIX

### Success Path
```
1. User opens M1U shop
2. Selects pack
3. Payment modal opens
4. If Apple Pay available → shows Apple Pay button
5. User taps Apple Pay
6. Native sheet appears (Face ID / Touch ID)
7. Payment confirmed → M1U credited
```

### Failure Paths
| Scenario | Expected Behavior |
|----------|-------------------|
| Apple Pay not available | Show CardElement only |
| Google Pay not available | Show CardElement only |
| Payment cancelled by user | Return to modal, no charge |
| Network error during payment | Show error, allow retry |
| Webhook fails | Payment still succeeds (async), manual reconciliation |
| Domain verification expired | Apple Pay disabled, CardElement works |

### Test Checklist
- [ ] Apple Pay on iPhone Safari
- [ ] Apple Pay on iPhone wrapped app (WKWebView)
- [ ] Apple Pay on Mac Safari (with Touch Bar)
- [ ] Google Pay on Android Chrome
- [ ] Google Pay on desktop Chrome (if wallet configured)
- [ ] Fallback to CardElement when no wallet
- [ ] Cancel flow
- [ ] Error handling (declined card, network)
- [ ] Webhook delivery confirmation

---

## 7. FILE GIÀ ESISTENTI (da modificare/rimuovere)

### Da Modificare
| File | Azione |
|------|--------|
| `src/components/m1units/M1UPaymentContent.tsx` | Aggiungere PaymentRequestButtonElement |
| `src/components/subscription/StripeInAppCheckout.tsx` | Aggiungere PaymentRequestButtonElement |

### Da Rimuovere (opzionale dopo PRB)
| File | Motivo |
|------|--------|
| `src/components/payments/ApplePayBox.tsx` | Sostituito da PRB |
| `src/components/payments/GooglePayBox.tsx` | Sostituito da PRB |

### Da Creare
| File | Contenuto |
|------|-----------|
| `public/.well-known/apple-developer-merchantid-domain-association` | File verifica Apple |

---

## 8. CONCLUSIONE

### Stato Attuale
- **Stripe**: ✅ Funzionante per Card payments
- **Apple Pay**: ⚠️ UI presente, backend manca domain verification
- **Google Pay**: ⚠️ UI presente, nessuna implementazione reale
- **IAP Native**: ✅ Implementato separatamente per iOS/Android

### Raccomandazione
**Usare Stripe `PaymentRequestButtonElement`** che gestisce automaticamente:
- Apple Pay (Safari iOS/Mac)
- Google Pay (Chrome Android/Desktop)
- Microsoft Pay, Samsung Pay, etc.

Con una sola integrazione ottieni tutti i wallet supportati.

### Effort Stimato
- **Config Apple domain**: 30 min
- **Codice PRB**: 2-3 ore
- **Test**: 2-3 ore
- **Totale**: ~1 giorno

---

**ROLLBACK**: `git reset --hard ROLLBACK_AUDIT_PAYMENTS_V1`

---

© 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
