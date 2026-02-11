# 🔍 REPORT FORENSE: IAP iOS — NESSUN LOG StoreKit/NativePurchases

**Data:** 2026-02-11  
**Problema:** initIAP() / getProducts() NON invocati — nessun log IAP in Xcode Console  
**Build:** Post-fix `productIds` → `productIdentifiers`

---

## SINTOMO CRITICO

In Xcode Console **NON appaiono** log relativi a:
- `[IAP]`
- `NativePurchases`
- `StoreKit`
- `productIdentifiers`

**Implicazione:** Il flusso NON raggiunge mai `initIAP()`, oppure il componente non viene montato.

---

## CALL GRAPH — Pipeline IAP

| Step | File | Funzione/Componente | Trigger | Guard/Condizione |
|------|------|---------------------|---------|------------------|
| 1 | `M1UShopContent.tsx` | `handlePurchase(pack)` | Click "Acquista" | — |
| 2 | `M1UShopContent.tsx` | `setShowPaymentModal(true)` | ↑ | — |
| 3 | `M1UPaymentModal.tsx` | Render `<M1UPaymentContent>` | Modal open | `isOpen={true}` |
| 4 | `M1UPaymentContent.tsx:438` | `const isNative = isCapacitorNative()` | Component mount | — |
| 5 | `M1UPaymentContent.tsx:439` | `const stripeAvailable = isStripeAvailable()` | Component mount | — |
| 6 | `M1UPaymentContent.tsx:536` | Branching: Native vs Stripe | Render | `isNative \|\| !stripeAvailable` |
| **7** | `M1UPaymentContent.tsx:537` | **`<NativeIAPCheckoutContent>`** | ↑ condition true | — |
| 8 | `M1UPaymentContent.tsx:247` | `const { initIAP, isNativeIAPAvailable } = useIAP()` | Component mount | — |
| 9 | `M1UPaymentContent.tsx:253-255` | Product mapping check | Mount | `getProductByCode(packCode)` |
| **10** | `M1UPaymentContent.tsx:257-281` | **useEffect → initIAP()** | Mount + deps | 🚨 **GUARD LINE 258** |
| 11 | `iapService.ts:100-166` | `initIAP()` | ↑ | `isNativeIAPAvailable()` |
| 12 | `iapService.ts:180-208` | `loadPurchasesPlugin()` | ↑ | try/catch import |
| 13 | `iapService.ts:221-238` | `getProducts({ productIdentifiers })` | ↑ | — |
| 14 | Native Plugin | `NativePurchases.getProducts()` | ↑ | StoreKit 2 |

---

## BLOCKERS IDENTIFICATI

### BLOCKER 1: Guard in useEffect (LINE 258)

```typescript
// M1UPaymentContent.tsx:257-258
useEffect(() => {
  if (initAttempted || !isNativeIAPAvailable() || productMappingError) return;  // 🚨 GUARD
```

**Condizioni che causano early return:**
1. `initAttempted === true` (già tentato)
2. `isNativeIAPAvailable() === false` ← **PROBABILE CAUSA**
3. `productMappingError !== null` (pack code non mappato)

### BLOCKER 2: isNativeIAPAvailable() (iapService.ts:87-94)

```typescript
export function isNativeIAPAvailable(): boolean {
  if (!isCapacitorNative()) {  // 🚨 Se false, ritorna false
    return false;
  }
  const platform = getCapacitorPlatform();
  return platform === 'ios' || platform === 'android';
}
```

**Se `isCapacitorNative()` ritorna `false`, tutto il flusso IAP è bypassato.**

### BLOCKER 3: isCapacitorNative() Detection (capacitor.ts:8-64)

La funzione usa 6 metodi di detection:
1. `window.__CAPACITOR_NATIVE__` marker
2. `document.documentElement.dataset.capacitor`
3. `Capacitor.isNativePlatform()`
4. `Capacitor.getPlatform()`
5. `Capacitor.Plugins` check
6. Protocol + User Agent

**Se TUTTI falliscono, ritorna `false` → IAP mai invocato.**

### BLOCKER 4: Branch Selection (M1UPaymentContent.tsx:536)

```typescript
{isNative || !stripeAvailable ? (
  <NativeIAPCheckoutContent ... />  // IAP
) : (
  <StripeCheckoutContent ... />     // Stripe
)}
```

**Se `isNative === false` E `stripeAvailable === true`, viene mostrato Stripe invece di IAP.**

---

## VERIFICA PLUGIN iOS

| Elemento | Stato | Path/Evidenza |
|----------|-------|---------------|
| package.json | ✅ | `"@capgo/native-purchases": "7.16.2"` |
| node_modules | ✅ | `node_modules/@capgo/native-purchases/package.json` |
| Podfile | ✅ | `pod 'CapgoNativePurchases'` |
| Podfile.lock | ✅ | `CapgoNativePurchases (7.16.2)` |
| capacitor.config.json | ✅ | `"NativePurchasesPlugin"` |
| `npx cap ls ios` | ✅ | `@capgo/native-purchases@7.16.2` |
| Pod Target Support | ✅ | `ios/App/Pods/Target Support Files/CapgoNativePurchases/` |

**Conclusione:** Plugin correttamente installato e configurato.

---

## ROOT CAUSE RANKED

| # | Causa Probabile | Probabilità | Prova |
|---|-----------------|-------------|-------|
| **1** | `isCapacitorNative()` ritorna `false` su iOS | **70%** | Nessun log `[IAP]` = flusso mai raggiunto |
| **2** | Build/Cache mismatch: app sul device ha codice vecchio | **20%** | Comune dopo multiple builds |
| **3** | `productMappingError` nel useEffect guard | **5%** | Pack codes dovrebbero matchare |
| **4** | `initAttempted` già `true` da render precedente | **3%** | State leak improbabile |
| **5** | Errore silenzioso prima del useEffect | **2%** | React dovrebbe mostrare errore |

---

## EVIDENZE MANCANTI (Da Raccogliere)

1. **Qual è il valore di `isCapacitorNative()` su iOS?**
2. **Qual è il valore di `getCapacitorPlatform()`?**
3. **Qual è il valore di `isNativeIAPAvailable()`?**
4. **Il componente `NativeIAPCheckoutContent` viene montato?**
5. **Il useEffect viene eseguito?**

---

## FIX PLAN: LOGGING FORENSE TEMPORANEO

### Patch 1: UI Layer — M1UPaymentContent.tsx

Aggiungere logging al mount per capire quale branch viene scelto:

```typescript
// Linea ~438, dopo const isNative = ...
console.log('🔍 [IAP DIAG] M1UPaymentContent mounted', {
  isNative,
  stripeAvailable,
  platform: getCapacitorPlatform(),
  BUILD_STAMP: '20260211_DIAG_V1'
});
```

### Patch 2: NativeIAPCheckoutContent — Guard diagnostic

```typescript
// Linea ~257, all'inizio del useEffect
console.log('🔍 [IAP DIAG] NativeIAPCheckoutContent useEffect', {
  initAttempted,
  isNativeIAPAvailable: isNativeIAPAvailable(),
  productMappingError,
  packCode,
});
```

### Patch 3: initIAP() — Entry point

```typescript
// Linea ~100, all'inizio di initIAP
console.log('🔍 [IAP DIAG] initIAP() CALLED', {
  isNativeIAPAvailable: isNativeIAPAvailable(),
  platform: getCapacitorPlatform(),
  isCapacitorNative: isCapacitorNative(),
});
```

### Patch 4: loadPurchasesPlugin — Import diagnostic

```typescript
// Linea ~181, dentro loadPurchasesPlugin
console.log('🔍 [IAP DIAG] loadPurchasesPlugin() attempting import...');
```

---

## ROLLBACK PLAN

Tutti i log diagnostici sono commenti/console.log che possono essere rimossi con:

```bash
grep -r "IAP DIAG" src/ --include="*.ts" --include="*.tsx"
# Poi rimuovere manualmente le righe
```

Oppure revert del commit con le modifiche diagnostiche.

---

## COMANDI TEST

### 1. Rebuild completo
```bash
cd /Users/josephmule/lux-hunt-treasure
npm run build
npx cap sync ios
```

### 2. Clean Xcode build
```
In Xcode:
- Product → Clean Build Folder (Cmd+Shift+K)
- Product → Build (Cmd+B)
- Product → Run (Cmd+R)
```

### 3. Console Filter
```
Nel filtro Xcode Console: [IAP DIAG]
```

### 4. Debug da Safari Web Inspector
```javascript
// Eseguire nella console JS dell'app (Safari → Develop → Device → M1SSION)
window.__M1_CAPACITOR_DEBUG?.()
```

---

## CHECKLIST ANTI-MISMATCH

- [ ] Xcode mostra target "App" selezionato
- [ ] Device collegato (non simulatore se test sandbox reale)
- [ ] Build configuration: Debug
- [ ] Clean Build Folder eseguito
- [ ] Build succeeded senza errori
- [ ] App lanciata da Xcode (icona freccia)
- [ ] Console Xcode mostra `BUILD_STAMP: '20260211_DIAG_V1'`
- [ ] Non stai testando build TestFlight vecchia

---

**Stato:** DIAGNOSI IN CORSO — Attendere logging temporaneo
