# 🔴 REPORT FORENSE IAP iOS — TestFlight/Sandbox FALLISCONO

**Data:** 2026-02-11  
**Branch:** `fix/ios-sso-temp-hide-20260211_042524`  
**Build TestFlight (utente):** `1.0 (20260127051625)`  
**Bundle ID:** `eu.m1ssion.app`

---

## 1. SINTOMI OSSERVATI

| Sintomo | Contesto |
|---------|----------|
| "Impossibile connettersi allo store" | App M1SSION su iPhone via TestFlight |
| "Prodotti IAP in configurazione su App Store Connect" | Messaggio fisso nell'UI shop |
| "L'ID prodotto o l'ID pacchetto fornito non è valido" | StoreKit Test UI (iOS Settings) |
| Prodotti sempre vuoti dopo `initIAP()` | `getProducts()` ritorna `[]` |

---

## 2. IPOTESI PRINCIPALI (Ranked)

| # | Ipotesi | Probabilità | Stato |
|---|---------|-------------|-------|
| **1** | 🚨 **BUG PARAMETRO JS→Swift** (`productIds` vs `productIdentifiers`) | **95%** | ✅ CONFERMATO |
| 2 | Prodotti IAP non "Ready to Submit" in ASC | Media | Possibile aggravante |
| 3 | Capability "In-App Purchase" mancante in Xcode | Bassa | Da verificare |
| 4 | Build version mismatch | Bassa | Info.plist mostra `20260127051624`, non `...1625` |

---

## 3. EVIDENZE RACCOLTE

### A) BUG PARAMETRO: ROOT CAUSE CONFERMATO

**File:** `src/iap/iapService.ts` (linea 131-133)

```typescript
// CODICE ATTUALE (ERRATO)
const storeProducts = await purchasesPlugin.getProducts({
  productIds: getAllProductIds(platform),  // ← 🚨 NOME SBAGLIATO
});
```

**Plugin API (@capgo/native-purchases):**
```typescript
// DEFINIZIONE CORRETTA (node_modules/@capgo/native-purchases/dist/esm/definitions.d.ts)
getProducts(options: {
    productIdentifiers: string[];  // ← ⚠️ IL PLUGIN ASPETTA "productIdentifiers"
    productType?: PURCHASE_TYPE;
}): Promise<{ products: Product[] }>;
```

**Codice Swift (Plugin):**
```swift
// NativePurchasesPlugin.swift:208
let productIdentifiers = call.getArray("productIdentifiers", String.self) ?? []
// ↑ Se "productIdentifiers" non esiste nel dict, ritorna []
```

**CONSEGUENZA:** StoreKit viene chiamato con array VUOTO → nessun prodotto trovato → `initIAP()` fallisce → UI mostra errore.

### B) Product IDs nel Codice (CORRETTI)

```
com.m1ssion.m1u.pack.starter
com.m1ssion.m1u.pack.agent
com.m1ssion.m1u.pack.elite
com.m1ssion.m1u.pack.commander
com.m1ssion.m1u.pack.director
com.m1ssion.m1u.pack.master
com.m1ssion.sub.silver
com.m1ssion.sub.gold
com.m1ssion.sub.black
com.m1ssion.sub.titanium
```

Questi ID sono nel formato corretto e corrispondono a quanto dichiarato dall'utente in App Store Connect.

### C) Entitlements iOS

**File:** `ios/App/App/App.entitlements`

```xml
<key>com.apple.developer.in-app-payments</key>  <!-- Apple Pay -->
<key>aps-environment</key>
<string>development</string>
```

**NOTE:**
- `com.apple.developer.in-app-payments` è per Apple Pay, NON per StoreKit IAP
- L'entitlement "In-App Purchase" non richiede entry nel file `.entitlements` — è una **capability Xcode**
- `aps-environment` è `development` (corretto per sandbox)

### D) StoreKit Framework

**Stato:** ✅ LINKED

```
StoreKit.framework in Frameworks
```

### E) Plugin Version

```
@capgo/native-purchases: 7.16.2 (compatibile Capacitor 7)
```

### F) Build Version Discrepancy

| Sorgente | Valore |
|----------|--------|
| Info.plist (CFBundleVersion) | `20260127051624` |
| TestFlight (screenshot utente) | `20260127051625` |

⚠️ Differenza di 1 cifra — potrebbe indicare rebuild/upload successivo non riflesso nel codice locale.

---

## 4. ROOT CAUSE PIÙ PROBABILE

### 🔴 BUG CRITICO: PARAMETER NAME MISMATCH

**Localizzazione:** `src/iap/iapService.ts` (righe 131-133 e 222-223)

**Causa:** Il wrapper JavaScript invia `productIds` ma il plugin nativo `@capgo/native-purchases` aspetta `productIdentifiers`.

**Flusso errore:**
1. `initIAP()` chiama `purchasesPlugin.getProducts({ productIds: [...] })`
2. Il wrapper chiama `NativePurchases.getProducts({ productIds: [...] })`
3. Swift plugin legge `call.getArray("productIdentifiers", ...)` → **null** → `[]`
4. StoreKit riceve `Product.products(for: [])` → ritorna array vuoto
5. `initIAP()` completa ma `products = []`
6. UI mostra "Impossibile connettersi allo store"

**Prova:** Il plugin TypeScript definitions chiaramente documentano `productIdentifiers` come parametro atteso.

---

## 5. FIX PLAN MINIMALE

### STEP 1: Creare Branch/Tag di Rollback
```bash
git tag ROLLBACK_BEFORE_IAP_FIX
```

### STEP 2: Fix Parameter Name (2 occorrenze)

**File:** `src/iap/iapService.ts`

**Riga 131-133 (initIAP):**
```diff
- const storeProducts = await purchasesPlugin.getProducts({
-   productIds: getAllProductIds(platform),
- });
+ const storeProducts = await purchasesPlugin.getProducts({
+   productIdentifiers: getAllProductIds(platform),
+ });
```

**Riga 222-223 (wrapCapgoPlugin.getProducts):**
```diff
- getProducts: async ({ productIds }: any) => {
-   const result = await NativePurchases.getProducts({ productIds });
+ getProducts: async ({ productIdentifiers }: any) => {
+   const result = await NativePurchases.getProducts({ productIdentifiers });
```

**Anche aggiornare la chiamata interna (riga 131-133):**
Dopo il fix del wrapper, assicurarsi che la chiamata a `purchasesPlugin.getProducts` usi il parametro corretto.

### STEP 3: Rebuild & Test Locale
```bash
npm run build
npx cap sync ios
```

### STEP 4: Test Xcode (Sandbox)
1. Aprire `ios/App/App.xcworkspace` in Xcode
2. Run su device fisico con Sandbox Tester configurato
3. Console: cercare `productIdentifiers [...]` (deve mostrare gli ID)
4. Console: cercare `products [...]` (deve mostrare i prodotti dallo store)

### STEP 5: Upload TestFlight (se test OK)
1. Archive → Upload to App Store Connect
2. Attendere processing TestFlight
3. Test su device via TestFlight

---

## 6. ROLLBACK PLAN

### Tag/Branch Disponibili
```
ROLLBACK_BEFORE_IAP_FIX  (da creare pre-fix)
```

### Rollback Command
```bash
git checkout -b rollback-iap-fix ROLLBACK_BEFORE_IAP_FIX
# oppure
git revert HEAD
```

### Cosa Torna Indietro
- Solo il cambio di nome parametro in `iapService.ts`
- Nessun impatto su altre funzionalità

---

## 7. CHECKLIST VALIDAZIONE FINALE

### Pre-Fix
- [ ] Tag `ROLLBACK_BEFORE_IAP_FIX` creato
- [ ] Branch backup confermato

### Post-Fix (Locale)
- [ ] `npm run build` passa senza errori
- [ ] `npx cap sync ios` completa
- [ ] Xcode build OK (no errors/warnings critici)

### Test Sandbox (Device)
- [ ] Xcode console mostra `productIdentifiers ["com.m1ssion.m1u.pack.starter", ...]`
- [ ] Xcode console mostra `products [Product(...), ...]` (array NON vuoto)
- [ ] App UI mostra prodotti con prezzi corretti
- [ ] Tap "Acquista" → Apple Pay/Sheet compare
- [ ] Acquisto sandbox completa senza errori
- [ ] M1U accreditati (verificare balance)

### TestFlight (Post-Upload)
- [ ] Build appare in TestFlight
- [ ] Install su device via TestFlight
- [ ] Ripetere test sandbox (prodotti visibili, acquisto funziona)

---

## 8. NOTE AGGIUNTIVE

### Verifica Capacità Xcode (Consigliata)
Dopo il fix, in Xcode:
1. Selezionare target "App"
2. Tab "Signing & Capabilities"
3. Verificare che "In-App Purchase" capability sia presente
4. Se mancante, cliccare "+" e aggiungere

### Stato Prodotti ASC
Anche se il root cause è il bug parametro, verificare che i prodotti in App Store Connect siano:
- Stato: "Pronta per l'invio" o "Approvato"
- "Cleared for Sale" attivo
- Metadati completi (descrizione, screenshot review)

Se i prodotti sono in "In preparazione per l'invio", potrebbero comunque essere visibili in sandbox dopo il fix, ma è buona pratica completarli.

---

## 9. LOG COLLECTION (Istruzioni per Debug Futuro)

### Xcode Console Filter
```
[IAP]|productIdentifiers|products|StoreKit|NativePurchases
```

### Comandi Console JS (Safari Web Inspector)
```javascript
// Verificare prodotti caricati
console.log('IAP Products:', window.__iapState?.products);

// Verificare platform detection
console.log('Platform:', Capacitor.getPlatform());
```

### StoreKit Configuration File (Opzionale)
Per test locali senza sandbox reale, creare un `StoreKit.storekit` config file in Xcode con i product IDs.

---

**Autore:** Claude AI  
**Ultimo Update:** 2026-02-11  
**Stato:** ROOT CAUSE CONFERMATO — PATCH NON APPLICATA (attende approvazione)
