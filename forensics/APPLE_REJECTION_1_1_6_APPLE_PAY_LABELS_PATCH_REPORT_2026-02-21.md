# Patch Report — App Review 1.1.6 “Apple Pay” mislabel (UI/copy only)

**Date:** 2026-02-21  
**Branch:** `fix/appreview-remove-applepay-labels`  
**Rollback tag:** `safety/appreview-before-remove-applepay-20260221`

---

## 1. Summary

Patch **solo testi/UI** applicata per rimuovere ogni riferimento visibile “Apple Pay” da UI, copy e locales. Nessuna modifica a logiche IAP/StoreKit, routing, auth, Buzz, Map; nessuna modifica in `ios/**`.

---

## 2. File toccati (elenco)

| File | Tipo modifica |
|------|----------------|
| `src/locales/it/common.json` | Valori `section_payment_methods_desc`, `payments_subtitle`, `apple_pay_setup`, nuova key `payment_method_inapp_label` |
| `src/locales/en/common.json` | Idem (EN) |
| `src/locales/fr/common.json` | Idem (FR) |
| `src/pages/settings/PaymentMethodsPage.tsx` | Toast title/description, label card “Apple Pay” → “Acquisto in-app” |
| `src/components/settings/sections/PaymentMethodsSectionContent.tsx` | Toast e label Wallet → `t('payment_method_inapp_label')` / `t('apple_pay_setup')` |
| `src/components/payments/ApplePayBox.tsx` | Tutte le stringhe utente “Apple Pay” → “acquisto in-app” / “Metodo non disponibile su iOS” |
| `src/pages/PaymentSilver.tsx` | Toast init/error, tab label “Apple Pay” → “Acquisto in-app” |
| `src/components/m1units/M1UShopContent.tsx` | Footer “Apple Pay” → “acquisto in-app Apple (StoreKit)” |
| `src/components/m1units/M1UPaymentContent.tsx` | Bottone “Pay” → “Acquista” |
| `src/pages/settings/SettingsPage.tsx` | Descrizione voce “Carte, Apple Pay, Google Pay” → “Carte e acquisti in-app” |
| `src/lib/stripe/guard.ts` | Messaggio utente “Usa Apple Pay tramite l’app.” → “Su iOS i pagamenti sono gestiti tramite acquisti in-app Apple (StoreKit).” |

**PaymentGold.tsx, PaymentBlack.tsx, PaymentMethods.tsx:** nessuna stringa “Apple Pay” presente (tab già “Pagamento Rapido” / “Altro metodo”); non modificati.

---

## 3. Diff summary per file (solo testi)

- **Locales (it/en/fr):** Sostituite frasi con “Apple Pay”/“Google Pay” con “Carte e acquisti in-app”; `apple_pay_setup` → testo “Configurazione pagamenti in-app” / “Digital content via Apple In-App Purchase”; aggiunta `payment_method_inapp_label` “Acquisto in-app” / “In-App Purchase” / “Achat intégré”.
- **PaymentMethodsPage:** Toast “🍎 Apple Pay” → “🍎 Acquisto in-app”; description senza “Apple Pay”; card label “Apple Pay” → “Acquisto in-app”.
- **PaymentMethodsSectionContent:** Toast e label da i18n `payment_method_inapp_label` e `apple_pay_setup`.
- **ApplePayBox:** “Paga con Apple Pay” → “Completa acquisto in-app”; “Apple Pay non è disponibile” → “Metodo non disponibile su iOS”; altre stringhe allineate.
- **PaymentSilver:** Toast “Inizializzazione Apple Pay...” → “Inizializzazione acquisto in-app...”; description/error senza “Apple Pay”; tab “Apple Pay” → “Acquisto in-app”.
- **M1UShopContent:** Footer “Pagamento sicuro tramite Apple Pay” → “Pagamento sicuro tramite acquisto in-app Apple (StoreKit)”.
- **M1UPaymentContent:** Testo bottone “Pay” → “Acquista”.
- **SettingsPage:** Description “Carte, Apple Pay, Google Pay” → “Carte e acquisti in-app”.
- **guard.ts:** Messaggio StoreComplianceError “Usa Apple Pay tramite l’app.” → “Su iOS i pagamenti sono gestiti tramite acquisti in-app Apple (StoreKit).”.

---

## 4. Verifica grep “Apple Pay” (con spazio)

**Risultato:** **0 occorrenze** in stringhe UI/copy/locales visibili.

Rimangono solo riferimenti in **commenti di codice** (non visibili in UI):

- `src/lib/stripe/guard.ts`: JSDoc “Should show Apple Pay / Google Pay buttons?”
- `src/components/m1units/M1UPaymentContent.tsx`: commenti “Apple Pay style”
- `src/pages/PaymentSilver.tsx`: commenti “Apple Pay” / “Google Pay”
- `src/components/payments/ApplePayBox.tsx`: commenti
- `src/routes/WouterRoutes.tsx`: commento
- `src/hooks/useStripePayment.ts`: commento
- `src/vite-env-extensions.d.ts`: commento tipi

Nessuna di queste stringhe viene renderizzata in UI o inclusa nei file di locale.

---

## 5. Build

- `npm run build`: **OK** (exit 0).
- `npx cap sync ios`: da eseguire localmente prima del run su device.

---

## 6. Deliverable — Testi per App Store Connect

### A) REVIEW NOTES (EN) — PassKit + Apple Pay clarification

```
This app does not use Apple Pay. All digital content purchases on iOS are processed exclusively via Apple In-App Purchase (StoreKit). If PassKit appears in the binary, it is included by the SDK/toolchain or as a transitive dependency and is not used by the app. No Apple Pay UI or branding is shown to users.
```

### B) ANSWER (EN) — “Do missions require an entry fee?”

```
No. Daily missions are free. There is no entry fee to play missions. Optional in-app purchases are available for digital content (e.g. subscriptions and M1U currency). The Buzz Map uses in-app currency (M1U), not a mandatory entry fee.
```

---

**Rollback:** `git reset --hard safety/appreview-before-remove-applepay-20260221`
