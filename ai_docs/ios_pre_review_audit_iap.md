# iOS Pre-Review Audit — Stile Apple Reviewer
**Date:** 2026-02-11
**App:** M1SSION iOS Native (Capacitor)
**Focus:** IAP (In-App Purchases) + Store Connection Error
**Tipo:** VERIFICA ONLY (nessuna modifica)

---

## 🔴 VERDETTO FINALE

# ❌ NON PASSA OGGI

**Motivo principale:** Prodotti IAP su App Store Connect sono in stato "In preparazione per l'invio" — questo stato **NON permette test in sandbox** e **NON permette submit with app**.

---

## 1. ✅ COSA PASSA SICURO IN REVIEW

| Item | Status | Evidenza |
|------|--------|----------|
| Bundle ID coerente | ✅ PASS | `eu.m1ssion.app` in Xcode + capacitor.config.json |
| StoreKit.framework linkato | ✅ PASS | Presente in project.pbxproj |
| Plugin IAP installato | ✅ PASS | `@capgo/native-purchases@7.16.2` in Podfile.lock |
| Product IDs definiti | ✅ PASS | 6 M1U packs + 4 subscriptions in `src/iap/products.ts` |
| Feature flag attivo | ✅ PASS | `NATIVE_IAP_ENABLED = true` |
| Login funzionante | ✅ PASS | Email/password OK, SSO nascosto |
| Stripe bloccato su native | ✅ PASS | `STRIPE_NATIVE_DISABLED = true` |

---

## 2. ❌ COSA NON PASSA (BLOCKERS)

### BLOCKER #1: Prodotti IAP Non Testabili in Sandbox

**Stato attuale (da screenshot):** "In preparazione per l'invio"

**Problema:** Questo stato significa:
- ❌ Prodotti NON visibili in sandbox
- ❌ `getProducts()` restituisce array vuoto
- ❌ Acquisto impossibile
- ❌ Non inviabili con l'app

**Cosa serve:**
Per testare in sandbox, i prodotti devono essere almeno in stato:
- "Pronto per l'invio" (Ready to Submit)
- OPPURE "In attesa di revisione" (se già inviati una volta)

**Mapping stato ASC → comportamento:**
| Stato ASC | Sandbox Test | Submit with App |
|-----------|--------------|-----------------|
| Bozza | ❌ | ❌ |
| In preparazione per l'invio | ❌ | ❌ |
| Pronto per l'invio | ✅ | ✅ |
| In attesa di revisione | ✅ | (già inviato) |
| Richiesto intervento sviluppatore | ❌ | ❌ |
| Approvato | ✅ | ✅ |

### BLOCKER #2: Messaggio Errore "Impossibile connettersi allo store"

**File sorgente:** `src/components/m1units/M1UPaymentContent.tsx:273`

```typescript
initIAP()
  .then(success => {
    if (!success) setLocalError('Impossibile connettersi allo store.');
  })
```

**Causa root:** `initIAP()` → `getProducts()` → restituisce 0 prodotti perché:
1. Prodotti ASC non in stato corretto
2. OPPURE Bundle ID mismatch
3. OPPURE Capability "In-App Purchase" non attiva in Xcode

### BLOCKER #3: Ambiente Test Sandbox

**Per testare IAP da Xcode run diretto:**

1. ✅ Devi avere un **Sandbox Tester** configurato in App Store Connect
2. ✅ Il device deve essere loggato con l'account sandbox in `Settings > App Store > Sandbox Account`
3. ❌ I prodotti devono essere in stato "Ready to Submit" (attualmente NO)

---

## 3. ⚠️ RISCHI DI RIGETTO (Non Bloccanti Ma Probabili)

| Rischio | Severità | Note |
|---------|----------|------|
| Entitlements Apple Sign-In | ⚠️ MEDIO | Presente ma SSO disabilitato - potrebbe richiedere spiegazione |
| AppRelease.entitlements: aps-environment=development | ⚠️ ALTO | Per production deve essere `production` |
| npm vulnerabilities (15 totali) | ⚪ BASSO | Apple non verifica npm |
| Subscriptions in stealth mode | ⚠️ MEDIO | `SUBSCRIPTIONS_STEALTH = true` nasconde abbonamenti - OK se intenzionale |

---

## 4. CHECKLIST APPLE — Stato per Item

### A) Identità App / Build / Metadati

| Check | Status | Valore Trovato |
|-------|--------|----------------|
| Bundle ID Xcode | ✅ | `eu.m1ssion.app` |
| Bundle ID capacitor.config | ✅ | `eu.m1ssion.app` |
| CFBundleVersion | ✅ | `20260127051624` |
| Entitlements presenti | ⚠️ | `aps-environment`, `applesignin`, `in-app-payments` (Apple Pay) |
| In-App Purchase capability | ❓ | Non esplicito in .entitlements - verificare in Xcode |

### B) IAP Tech (Codice + Config)

| Check | Status | Valore/Path |
|-------|--------|-------------|
| Product IDs definiti | ✅ | `src/iap/products.ts` |
| M1U Starter ID | ✅ | `com.m1ssion.m1u.pack.starter` |
| Plugin installato | ✅ | `@capgo/native-purchases@7.16.2` |
| Plugin in capacitor.config | ✅ | `NativePurchasesPlugin` in packageClassList |
| StoreKit framework | ✅ | Linkato in project.pbxproj |
| initIAP chiamato | ✅ | `src/iap/iapService.ts` |
| Error handling | ✅ | Messaggi user-friendly |

### C) App Store Connect — Prodotti

| Check | Status | Note |
|-------|--------|------|
| Prodotti creati | ✅ | Almeno M1U Starter Pack visibile |
| Stato "Ready to Submit" | ❌ | "In preparazione per l'invio" |
| Screenshot IAP | ❓ | Da verificare |
| Prezzo/Availability | ❓ | Da verificare |
| Localizzazione | ❓ | Da verificare |

### D) Ambiente Test

| Check | Status | Note |
|-------|--------|------|
| Xcode run direct | ⚠️ | Funziona ma IAP non testabili |
| Sandbox Tester | ❓ | Da verificare configurazione |
| TestFlight | ❓ | Non menzionato |

---

## 5. PRODUCT IDs TROVATI NEL CODICE

**File:** `src/iap/products.ts`

### M1U Packs (Consumables)
```
com.m1ssion.m1u.pack.starter   → 50 M1U  → €4.99
com.m1ssion.m1u.pack.agent     → 110 M1U → €9.99
com.m1ssion.m1u.pack.elite     → 250 M1U → €19.99
com.m1ssion.m1u.pack.commander → 550 M1U → €39.99
com.m1ssion.m1u.pack.director  → 1200 M1U → €79.99
com.m1ssion.m1u.pack.master    → 3000 M1U → €199.99
```

### Subscriptions
```
com.m1ssion.sub.silver   → Silver Plan  → €4.99/mese
com.m1ssion.sub.gold     → Gold Plan    → €9.99/mese
com.m1ssion.sub.black    → Black Plan   → €19.99/mese
com.m1ssion.sub.titanium → Titanium Plan → €49.99/mese
```

**NOTA:** Le subscription sono nascoste (`SUBSCRIPTIONS_STEALTH = true`)

---

## 6. CONFIGURAZIONE CAPACITOR iOS

**File:** `ios/App/App/capacitor.config.json`

```json
{
  "appId": "eu.m1ssion.app",
  "appName": "M1SSION",
  "packageClassList": [
    "AppPlugin",
    "HapticsPlugin",
    "PushNotificationsPlugin",
    "StatusBarPlugin",
    "NativePurchasesPlugin",  ← Plugin IAP presente
    "SafeAreaPlugin"
  ]
}
```

---

## 7. ENTITLEMENTS iOS

**File:** `ios/App/App/App.entitlements`

```xml
<key>aps-environment</key>
<string>development</string>  ⚠️ Deve essere "production" per release

<key>com.apple.developer.applesignin</key>
<array><string>Default</string></array>  ⚠️ Presente ma SSO disabilitato

<key>com.apple.developer.in-app-payments</key>
<array><string>merchant.eu.m1ssion.app</string></array>  ✅ Apple Pay merchant
```

**NOTA:** `com.apple.developer.in-app-payments` è per Apple Pay, NON per StoreKit IAP.
L'IAP capability si configura in Xcode sotto "Signing & Capabilities" e non appare esplicitamente negli entitlements.

---

## 8. LOG RUNTIME — Dove si Vede l'Errore

**Flusso errore:**
1. App avvia → `M1UPaymentContent.tsx` monta
2. `useEffect` chiama `initIAP()` (riga 270)
3. `initIAP()` in `iapService.ts` chiama `purchasesPlugin.getProducts()`
4. `getProducts()` restituisce `{ products: [] }` (nessun prodotto trovato)
5. `initIAP()` ritorna `false`
6. UI mostra: "Impossibile connettersi allo store."
7. Sotto: "Prodotti IAP in configurazione su App Store Connect."

**Log attesi (Safari Web Inspector / Xcode Console):**
```
[IAP] ✅ Loaded @capgo/native-purchases plugin
[IAP Capgo] Setting up with products: [...]
[IAP Capgo] getProducts error: (o nessun prodotto restituito)
[IAP] ❌ Initialization failed: ...
```

---

## 9. NEXT STEPS (Solo Suggerimenti, NO Patch)

### Per sbloccare IAP:

1. **App Store Connect:**
   - Completare tutti i metadata per ogni prodotto IAP
   - Aggiungere screenshot (obbligatorio per review)
   - Impostare prezzo e disponibilità
   - Cliccare "Save" per portare lo stato a "Ready to Submit"

2. **Xcode:**
   - Verificare che "In-App Purchase" capability sia attiva
   - Signing & Capabilities → + Capability → In-App Purchase

3. **Test Sandbox:**
   - Creare Sandbox Tester in ASC (Users and Access → Sandbox Testers)
   - Sul device: Settings → App Store → Sandbox Account → Login

4. **Entitlements:**
   - Per release: cambiare `aps-environment` da `development` a `production`

5. **Prima della review:**
   - Almeno un prodotto IAP deve essere "Ready to Submit"
   - L'app deve essere submitta WITH i prodotti IAP (checkbox in ASC)

---

## 10. ROLLBACK DISPONIBILE

**Commit corrente:** `e17e4c3d fix(deps): downgrade @capgo/native-purchases to 7.16.2 for Capacitor 7 compat`

**Tag disponibile:** `ROLLBACK_BEFORE_CAPGO_FIX`

**Comando rollback (se necessario):**
```bash
git reset --hard ROLLBACK_BEFORE_CAPGO_FIX
```

---

## RIEPILOGO FINALE

| Categoria | Verdetto |
|-----------|----------|
| Login/UI | ✅ PASS |
| IAP Codice | ✅ PASS |
| IAP Config Xcode | ⚠️ DA VERIFICARE |
| IAP Prodotti ASC | ❌ FAIL (non testabili) |
| IAP Funzionante | ❌ FAIL (errore connessione) |
| **OVERALL** | **❌ NON PASSA** |

---

**Motivo rigetto previsto da Apple:**

> "We found that your app offers In-App Purchases but we were unable to complete a purchase. Specifically, the In-App Purchase products returned an error or were unavailable."

---

*Report generato: 2026-02-11*
*Tipo: AUDIT ONLY — Nessun file modificato*
