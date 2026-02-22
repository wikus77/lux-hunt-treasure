# App Review Rejection — 1.1.6 Apple Pay Mislabel + 2.1 Questions + PassKit — Verification Report (NO PATCH)

**Data:** 2026-02-21  
**App:** M1SSION — iOS 1.0 (Capacitor WKWebView)  
**Scope:** SOLO lettura/verifica. Nessun file modificato.

---

## A) Tabella "Apple Pay references"

| File | Riga | Snippet breve | Contesto UI (dove appare) | Severità |
|------|------|----------------|----------------------------|----------|
| `src/pages/settings/PaymentMethodsPage.tsx` | 256 | `<p className="text-white font-medium">Apple Pay</p>` | Pagina Impostazioni → Metodi di pagamento: card con label "Apple Pay" | **BLOCKER** |
| `src/pages/settings/PaymentMethodsPage.tsx` | 104-105 | toast title "🍎 Apple Pay", description "La configurazione di Apple Pay sarà disponibile a breve" | Toast quando si clicca su Apple Pay in Payment methods | **BLOCKER** |
| `src/components/settings/sections/PaymentMethodsSectionContent.tsx` | 144, 60 | label="Apple Pay", toast "🍎 Apple Pay" | Settings section (flip overlay): pulsante/label Apple Pay + toast | **BLOCKER** |
| `src/pages/PaymentSilver.tsx` | 189 | `<span className="text-sm">Apple Pay</span>` | Pagina acquisto Silver: tab/pulsante "Apple Pay" (Stripe flow; su iOS native il bottone è disabilitato ma la label è visibile) | **BLOCKER** |
| `src/pages/PaymentGold.tsx` | (stesso pattern) | Apple Pay tab/button | Pagina acquisto Gold | **BLOCKER** |
| `src/pages/PaymentBlack.tsx` | (stesso pattern) | Apple Pay tab/button | Pagina acquisto Black | **BLOCKER** |
| `src/pages/PaymentMethods.tsx` | 173 | `<ApplePayBox ... />` | Pagina Metodi di pagamento: componente con label "Apple Pay" | **BLOCKER** |
| `src/components/payments/ApplePayBox.tsx` | 55, 60, 73, 78 | "Apple Pay non è disponibile", "Paga con Apple Pay" | Componente usato in pagine pagamento: messaggi e pulsante "Paga con Apple Pay" (su web/PWA; su iOS native il box ritorna "non disponibile" ma il nome componente/label può essere associato a IAP) | **BLOCKER** |
| `src/components/m1units/M1UShopContent.tsx` | 342 | "Pagamento sicuro tramite Apple Pay • M1U non scadono mai" | Footer M1U Shop (acquisto M1U): testo che indica pagamento con Apple Pay; su iOS gli acquisti M1U sono via IAP (StoreKit), non Apple Pay | **BLOCKER** |
| `src/components/m1units/M1UPaymentContent.tsx` | 468, 504-510, 543 | Commenti "Apple Pay style PRIMARY Button", pulsante nero con logo Apple + "Pay" | Modal pagamento M1U (IAP): pulsante stilizzato come Apple Pay (logo Apple + "Pay"); utente può interpretarlo come Apple Pay invece che come IAP | **BLOCKER** |
| `src/locales/it/common.json` | 116, 279, 300 | "Carte, Apple Pay, Google Pay", "apple_pay_setup" | Stringhe per Settings e Payment methods (descrizioni e toast) | **BLOCKER** (se mostrate in UI su iOS) |
| `src/locales/en/common.json` | 116, 279, 300 | "Cards, Apple Pay, Google Pay", "apple_pay_setup" | Idem EN | **BLOCKER** |
| `src/locales/fr/common.json` | 111, 274, 295 | Idem FR | Idem FR | **BLOCKER** |
| `src/pages/settings/SettingsPage.tsx` | 103 | description: 'Carte, Apple Pay, Google Pay' | Voce menu Settings che porta a Payment methods | UNUSED STRING (se non mostrata) / BLOCKER se mostrata |
| `src/lib/stripe/guard.ts` | 43 | 'Usa Apple Pay tramite l\'app.' | Messaggio quando Stripe non è disponibile su iOS (riferimento a pagamento in app) | UNUSED STRING (messaggio utente; può confondere con Apple Pay) |
| `src/routes/WouterRoutes.tsx` | 67 | Comment: "PaymentMethodsPage is for managing payment methods (Apple Pay, Google Pay, Cards)" | Solo commento | UNUSED STRING |
| `src/hooks/useStripePayment.ts` | 137, 148, 154-157 | applePayAvailable, ApplePaySession | Logica rilevamento Apple Pay (web); non label UI | UNUSED STRING (codice) |
| `src/vite-env-extensions.d.ts` | 22-23 | ApplePaySession type | Definizioni tipo | UNUSED STRING |
| `ai_docs/*.md`, `docs/reports/*.md` | varie | Apple Pay, PassKit, merchant | Documentazione / audit | NON UI |

**Riepilogo:** Più occorrenze **BLOCKER** in UI: Payment methods (Settings + pagina dedicata), pagine subscription Silver/Gold/Black, ApplePayBox, M1U Shop footer, M1U Payment modal (pulsante “Pay” + logo Apple). Le stringhe localizzate e i toast con "Apple Pay" vanno considerate se esposte su iOS.

---

## B) Tabella "PassKit inclusion"

| Dove appare | Motivo probabile | Evidenza (comando/output) | Azione suggerita (solo suggerimento) |
|-------------|------------------|---------------------------|--------------------------------------|
| **project.pbxproj** | Non presente | `grep -r "PassKit\|passkit" ios/` → no match. In `project.pbxproj` risultano solo `StoreKit.framework` e `Pods_App.framework` in Frameworks. | — |
| **Podfile / Podfile.lock** | Non presente | `Podfile` e `Podfile.lock` non contengono PassKit. Pods: Capacitor, CapacitorApp, CapacitorCordova, CapacitorHaptics, CapacitorPluginSafeArea, CapacitorPushNotifications, CapacitorStatusBar, CapgoNativePurchases. | — |
| **CapgoNativePurchases (node_modules)** | Solo StoreKit | `grep -r "PassKit\|StoreKit" node_modules/@capgo/native-purchases/ios/` → solo `import StoreKit` in Swift. Nessun import PassKit. | — |
| **Pods-App-frameworks.sh** | Solo framework Capacitor + CapgoNativePurchases | Script installa solo: Capacitor, CapacitorApp, CapacitorCordova, CapacitorHaptics, CapacitorPluginSafeArea, CapacitorPushNotifications, CapacitorStatusBar, CapgoNativePurchases. Nessun PassKit. | — |
| **App.entitlements / AppRelease.entitlements** | Nessun Apple Pay | Contengono solo `aps-environment` e `com.apple.developer.applesignin`. **Nessun** `com.apple.developer.in-app-payments` (Apple Pay). | — |
| **Binario (ipotesi Apple)** | Possibile link transitivo / sistema | In repo **non** risulta PassKit linkato esplicitamente. Se Apple vede PassKit nel binario: (1) dipendenza transitiva di un framework di sistema (es. StoreKit o altro SDK che referenzia PassKit), (2) build/submission precedente con capability o pod diversi, (3) Xcode/SDK che include PassKit in modo implicito. **Verifica suggerita:** su build Release, eseguire `otool -L path/to/App.app/App` e cercare `PassKit`. | In Review Notes: chiarire che l’app usa **solo** Apple In-App Purchase (StoreKit) per contenuti digitali; non è implementato Apple Pay (PassKit); se PassKit risulta nel binario, è incluso da framework di sistema o toolchain e non è usato dall’app. |

**Comandi evidence (read-only) eseguiti:**

```bash
grep -rn "PassKit\|passkit\|PKPayment\|Apple Pay\|ApplePay" ios/
# → No matches in ios/

grep -rn "PassKit\|StoreKit" ios/App/App.xcodeproj/project.pbxproj
# → StoreKit.framework present; PassKit not present

grep -rn "PassKit\|passkit" node_modules/@capgo/native-purchases/
# → No PassKit; only StoreKit in Swift sources

cat ios/App/App/App.entitlements
# → aps-environment, com.apple.developer.applesignin only
```

**Verifica binario (da eseguire localmente dopo build Release):**

```bash
# Dopo build iOS Release:
otool -L ios/App/build/Build/Products/Release-iphoneos/App.app/App 2>/dev/null | grep -i passkit
# oppure
strings ios/App/build/Build/Products/Release-iphoneos/App.app/App 2>/dev/null | grep -i "PassKit\|Apple Pay"
```

---

## C) Draft "Review Notes" (NON inviare — solo bozza)

### Variante 1 — Se l’app NON usa Apple Pay (caso attuale dal codice)

**Inglese (suggerito):**

> **Guideline 1.1.6 – Apple Pay / In-App Purchase:**  
> The app does not use Apple Pay. All in-app purchases for digital content (subscriptions, M1U packs) are processed exclusively through **Apple In-App Purchase (StoreKit)**. Any references to "Apple Pay" in the UI or copy were unintended and will be removed or reworded so that payment methods are clearly labeled as "In-App Purchase" or "Purchase" on iOS. We do not offer physical goods; only digital content is sold in-app.
>
> **Guideline 2.1 – PassKit in binary:**  
> The app does not integrate Apple Pay (PassKit). If PassKit appears in the binary, it is included by the iOS SDK or toolchain (e.g. transitive dependency) and is not used by our app. We use only **StoreKit** for in-app purchases.

**Italiano (per riferimento):**

> L’app non utilizza Apple Pay. Tutti gli acquisti in-app per contenuti digitali sono gestiti esclusivamente tramite **Apple In-App Purchase (StoreKit)**. Eventuali riferimenti ad "Apple Pay" nell’interfaccia saranno rimossi o riformulati. Il framework PassKit, se presente nel binario, non è utilizzato dall’app (inclusione da SDK/sistema).

### Variante 2 — Se in futuro Apple Pay fosse usato per beni fisici

> Apple Pay is used only for [e.g. physical goods / specific screen X]. In-app digital content is sold only via Apple In-App Purchase (StoreKit).

*(Non applicabile allo stato attuale del codice.)*

---

## D) Risposta tecnica alla domanda "Do missions require an entry fee?"

**Basata sul codice (verifica effettuata):**

- **Start mission:** `StartMissionButton` e `MissionPill` chiamano `enroll-mission-of-the-month` (Edge Function) e `startMission(missionId)` (stato locale). **Nessun pagamento, nessun credito M1U, nessuna entry fee** per avviare la missione del giorno.
- **Buzz Map:** Consuma M1U (prezzo da server); è un’azione opzionale a pagamento (valuta virtuale).
- **M1U / abbonamenti:** Acquisti opzionali (pack M1U, subscription) tramite IAP (StoreKit su iOS).

**Risposta proposta (2–3 righe, inequivocabile):**

> **No. Missions do not require an entry fee.** Users can start and play the daily mission for free. Optional in-app purchases (e.g. M1U virtual currency packs, subscriptions) are available for additional features or content; some features (such as Buzz Map) use in-app currency (M1U). All such purchases are digital content only and are processed via Apple In-App Purchase.

---

## E) Elenco file con "Apple Pay" (per correzioni future)

- `src/pages/settings/PaymentMethodsPage.tsx`
- `src/components/settings/sections/PaymentMethodsSectionContent.tsx`
- `src/pages/PaymentSilver.tsx`, `PaymentGold.tsx`, `PaymentBlack.tsx`, `PaymentMethods.tsx`
- `src/components/payments/ApplePayBox.tsx`
- `src/components/m1units/M1UShopContent.tsx` (footer "Pagamento sicuro tramite Apple Pay")
- `src/components/m1units/M1UPaymentContent.tsx` (stile pulsante + commenti "Apple Pay style")
- `src/locales/it/common.json`, `src/locales/en/common.json`, `src/locales/fr/common.json`
- `src/pages/settings/SettingsPage.tsx`
- `src/lib/stripe/guard.ts`

---

## F) Plugin Capacitor installati (da Podfile.lock)

- Capacitor, CapacitorApp, CapacitorCordova, CapacitorHaptics, CapacitorPluginSafeArea, CapacitorPushNotifications, CapacitorStatusBar, **CapgoNativePurchases** (IAP — StoreKit only, no PassKit in sorgenti).

---

**Fine report. Nessuna modifica applicata; solo diagnosi e evidenze per Review Notes e correzioni successive.**
