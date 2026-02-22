# iOS App Review Compliance — Patch Report 2026-02-21

**Branch:** `fix/ios-appreview-compliance-20260221`  
**Rollback tag:** `safety/ios-appreview-compliance-before-20260221`

---

## 1. Summary

Patch applicata per:
1. **i18n completo** — Tutti i pulsanti/toast IAP/pagamento usano chiavi i18n (IT/EN/FR).
2. **Toast** — Un solo sistema (sonner) con tema BUZZ già globale; nessun cambio necessario.
3. **Geolocation single stack (iOS)** — Su iOS Capacitor si usa solo Capacitor Geolocation; nessun `navigator.geolocation` → nessun prompt "localhost".
4. **Hide Stripe/cards su iOS** — Sezione "Your Cards" / Add card nascosta su iOS; visibile solo IAP/digital wallets.
5. **Apple Pay mislabel** — Microcopy "Pagamento gestito tramite Apple In-App Purchase"; bottone IAP testuale "Acquista €X" senza logo Apple.

---

## 2. File modificati (elenco)

| File | Modifica |
|------|----------|
| **Locales** | |
| `src/locales/it/common.json` | Nuove chiavi `iap_*`, `iap_footer_secure`, `iap_m1u_never_expire`, ecc. |
| `src/locales/en/common.json` | Idem (EN) |
| `src/locales/fr/common.json` | Idem (FR) |
| **IAP / Payment UI** | |
| `src/components/m1units/M1UPaymentContent.tsx` | i18n, bottone senza mela ("Acquista €X"), footer `iap_footer_secure` |
| `src/components/m1units/M1UShopContent.tsx` | Footer `t('iap_footer_secure')` + `t('iap_m1u_never_expire')` |
| `src/pages/PaymentSilver.tsx` | useTranslation, toast/label da t() |
| `src/pages/PaymentGold.tsx` | useTranslation, toast da t() |
| `src/pages/PaymentBlack.tsx` | useTranslation, toast da t() |
| `src/pages/PaymentMethods.tsx` | useTranslation, toast da t() |
| **Settings / Cards** | |
| `src/components/settings/sections/PaymentMethodsSectionContent.tsx` | hideCardsOnIOS: nasconde Cards + Security Note su iOS; toast iap_default_card_set |
| `src/pages/settings/PaymentMethodsPage.tsx` | Nasconde sezione Credit/Debit Cards su iOS |
| **Geolocation** | |
| `src/utils/geolocationSafe.ts` | **NUOVO** — getCurrentPositionSafe, watchPositionSafe, clearWatchSafe (Capacitor su iOS) |
| `src/hooks/useGeolocation.ts` | Usa watchPositionSafe / clearWatchSafe; skip Permissions API su iOS native |
| `src/hooks/useGeoWatcher.ts` | useCapacitorGeo: usa getCurrentPositionSafe + watchPositionSafe; clear con clearWatchSafe |
| **Build / Deps** | |
| `package.json` | Aggiunto `@capacitor/geolocation`: `^7.1.8` |
| `vite.config.ts` | `external: ['@capacitor/geolocation']` |
| **Audit** | |
| `forensics/IOS_APPREVIEW_TOAST_BUZZ_AUDIT_2026-02-21.md` | Audit toast BUZZ (source of truth) |

---

## 3. Nuove chiavi i18n (IT / EN / FR)

- `iap_buy`, `iap_buy_price`, `iap_connect_store`, `iap_cancel`
- `iap_success_added`, `iap_payment_processed`, `iap_error_generic`, `iap_init_inapp`, `iap_init_description`, `iap_error_description`
- `iap_store_not_available`, `iap_connecting_stripe`, `iap_redirect_stripe`
- `iap_footer_secure`, `iap_m1u_never_expire`, `iap_purchase_cancelled`, `iap_purchase_received_verifying`
- `iap_m1u_added`, `iap_subscription_silver/gold/black` + `_desc`
- `iap_payment_fast`, `iap_payment_alt`, `iap_default_card_set`, `iap_processing`
- `iap_error_m1u_credit`, `iap_use_inapp_platform`, `iap_payment_system_not_ready`, `iap_card_element_not_found`
- `iap_payment_failed`, `iap_payment_received_credit_error`
- `iap_store_connection_timeout`, `iap_store_connection_failed`, `iap_store_connection_error`
- `iap_error_purchase`, `iap_connection_error`, `iap_retry`
- `iap_payment_method_deprecated_use_m1u`, `iap_payment_processed_desc`

---

## 4. Geolocation single stack (iOS)

- **Wrapper:** `src/utils/geolocationSafe.ts`
  - `getCurrentPositionSafe(options)` — su iOS native usa `@capacitor/geolocation`, altrimenti `navigator.geolocation.getCurrentPosition`.
  - `watchPositionSafe(onSuccess, onError?, options)` — su iOS native usa Capacitor `watchPosition`; ritorna handle (string | number).
  - `clearWatchSafe(handle)` — su iOS native usa Capacitor `clearWatch({ id })`, altrimenti `navigator.geolocation.clearWatch`.
- **useGeolocation:** usa `watchPositionSafe` e `clearWatchSafe`; su iOS native non usa Permissions API (evita doppio prompt).
- **useGeoWatcher:** se `useCapacitorGeo` usa `getCurrentPositionSafe` + `watchPositionSafe`; altrimenti flusso esistente.
- **Nota:** `@capacitor/geolocation` è in `package.json` e in `vite.config.ts` come `external`. Dopo `npm install` e `npx cap sync ios` il plugin è disponibile nel wrapper iOS.

---

## 5. Hide Stripe/cards (iOS only)

- **PaymentMethodsSectionContent:** `hideCardsOnIOS = isCapacitorNative() && isCapacitorIOS()`. Se true: non renderizza il GlassCard "Your Cards" (lista + Add) e non renderizza il GlassCard "Security Note" (secure_payments_desc).
- **PaymentMethodsPage:** Se `isCapacitorNative() && isCapacitorIOS()` non renderizza la Card "Credit/Debit Cards" (Carte Salvate / Aggiungi).
- Su web nessun cambiamento.

---

## 6. Apple Pay mislabel

- Footer M1U: "Pagamento gestito tramite Apple In-App Purchase" / "Payment processed via Apple In-App Purchase" / "Paiement via Achats intégrés Apple" (`iap_footer_secure`).
- Bottone IAP in M1UPaymentContent: solo testo `t('iap_buy_price', { price: displayPrice })` (es. "Acquista €4,99"); rimosso logo Apple e "Pay".
- Nessuna label "Apple Pay" in UI.

---

## 7. Verifiche

- **Build:** `npm run build` — OK.
- **Grep "Apple Pay":** 0 occorrenze in stringhe UI/locales (solo commenti codice).
- **Lint:** Nessun errore sui file toccati.

---

## 8. Checklist regressioni

- [x] Toast BUZZ invariati (stesso Toaster globale).
- [x] IAP: nessun cambio a processSubscription / purchase / StoreKit; solo testi e UI.
- [x] Mappa/BUZZ: useGeolocation e useGeoWatcher usano lo stesso flusso su web; su iOS native usano Capacitor.
- [x] Web: carte/Stripe visibili come prima; hide solo su iOS.
- [x] Android: non richiesto; modifiche iOS-only dove indicato.

---

## 9. Passi post-patch (locale)

1. `npm install` (se non già fatto, per installare `@capacitor/geolocation`).
2. `npx cap sync ios` (per copiare web assets e aggiornare plugin iOS).
3. Su device iPhone: verificare lingua EN → testi IAP in inglese; verificare assenza prompt "localhost would like to use your current location"; verificare assenza sezione carte in Settings → Payment Methods.

**Rollback:** `git reset --hard safety/ios-appreview-compliance-before-20260221`
