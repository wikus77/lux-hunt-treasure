# 🔍 INCIDENT REPORT — IAP iOS Sandbox: "Purchase OK" → "No transaction returned"

**Data**: 2026-02-11  
**Stato**: ROOT CAUSE IDENTIFICATA  
**Severità**: CRITICA

---

## 📋 SINTESI

L'utente completa l'acquisto con successo (Apple sheet conferma), ma l'app mostra "No transaction returned".

**ROOT CAUSE**: Mismatch tra il formato di ritorno del plugin `@capgo/native-purchases` e il codice wrapper JavaScript.

---

## 🔬 EVIDENZE

### 1. Plugin Swift (`NativePurchasesPlugin.swift` - lines 155-168)

```swift
case .verified(let transaction):
    let response = await TransactionHelpers.buildTransactionResponse(
        from: transaction, 
        jwsRepresentation: verificationResult.jwsRepresentation
    )
    
    if autoFinish {
        await transaction.finish()
    }
    
    call.resolve(response)  // ← Ritorna FLAT dictionary
```

### 2. TransactionHelpers (`TransactionHelpers.swift` - line 15)

```swift
static func buildTransactionResponse(...) async -> [String: Any] {
    var response: [String: Any] = ["transactionId": String(transaction.id)]
    // ... altri campi a livello root
    return response
}
```

**Il plugin ritorna:**
```json
{
  "transactionId": "2000001234567890",
  "productIdentifier": "com.m1ssion.m1u.pack.starter",
  "purchaseDate": "2026-02-11T10:30:00Z",
  "receipt": "MIIxyz...",
  "jwsRepresentation": "eyJhbGciOi..."
}
```

### 3. TypeScript Definitions (`definitions.d.ts` - line 752)

```typescript
purchaseProduct(options: {...}): Promise<Transaction>;
// ↑ Ritorna Transaction DIRETTAMENTE, non { transaction: Transaction }
```

### 4. BUG NEL WRAPPER (`iapService.ts` - lines 278-282)

```typescript
const result = await CapgoNativePurchases.purchaseProduct({ productIdentifier: productId });

if (!result?.transaction) {  // ← BUG! 'transaction' non esiste a questo livello
  throw new Error('No transaction returned');
}

const txn = result.transaction;  // ← undefined!
```

**Dovrebbe essere:**
```typescript
const result = await CapgoNativePurchases.purchaseProduct({ productIdentifier: productId });

if (!result?.transactionId) {
  throw new Error('No transaction returned');
}

// result È GIÀ la transaction
const txnId = result.transactionId;
```

---

## 📊 CALL GRAPH COMPLETO

| Step | File | Funzione | Input | Output Atteso | Output Reale |
|------|------|----------|-------|---------------|--------------|
| 1 | M1UPaymentContent.tsx | handlePurchase() | packCode | — | Chiama purchase() |
| 2 | iapService.ts:445 | purchase() | productCode | IAPPurchaseResult | Chiama plugin wrapper |
| 3 | iapService.ts:262 | wrapCapgoPlugin.purchase() | productId | {transactionId, receipt...} | Chiama CapgoNativePurchases |
| 4 | iapService.ts:278 | CapgoNativePurchases.purchaseProduct() | {productIdentifier} | **Transaction** (flat) | Transaction (flat) ✅ |
| 5 | iapService.ts:280 | **CHECK** | `result?.transaction` | true | **false** ❌ |
| 6 | iapService.ts:281 | **THROW** | — | — | "No transaction returned" |

---

## ⏱️ TIMELINE EVENTI

```
T0 [00:00.000] - Utente tap "Acquista"
T1 [00:00.050] - purchase() chiamata
T2 [00:00.100] - wrapCapgoPlugin.purchase() chiamata  
T3 [00:00.150] - CapgoNativePurchases.purchaseProduct() chiamata
T4 [00:01.000] - Apple sheet appare
T5 [00:05.000] - Utente conferma pagamento
T6 [00:06.000] - Apple processa (T&C cambiate → extra popup)
T7 [00:08.000] - StoreKit ritorna .success(.verified(transaction))
T8 [00:08.050] - Plugin Swift finisce transaction e chiama resolve(response)
T9 [00:08.100] - JS riceve result = { transactionId: "123", receipt: "...", ... }
T10 [00:08.150] - CHECK: if (!result?.transaction) → TRUE (transaction undefined!)
T11 [00:08.200] - THROW: "No transaction returned"
T12 [00:08.250] - UI mostra errore
```

---

## 🚨 ROOT CAUSES (RANKED)

### #1 — MAPPING MISMATCH (100% CONFERMATA)

**File**: `src/iap/iapService.ts`  
**Linee**: 280-286

Il codice cerca `result.transaction` ma il plugin ritorna i dati a livello root.

**Evidenza**: 
- TypeScript definitions dichiarano `purchaseProduct(): Promise<Transaction>` (non `Promise<{transaction: Transaction}>`)
- Swift code chiama `call.resolve(response)` dove response è un dictionary flat

### #2 — Auto-Acknowledge (SECONDARIA, non causa primaria)

Il plugin ha `autoAcknowledge = true` di default (line 104 Swift). Questo finisce la transaction prima che JS la legga, ma in realtà il problema è il mapping sopra.

---

## 🔧 PIANO FIX (STEP-BY-STEP)

### FIX MINIMALE (CONSIGLIATO)

Modificare `src/iap/iapService.ts` nel wrapper `wrapCapgoPlugin.purchase()`:

**DA (linee 278-296):**
```typescript
const result = await CapgoNativePurchases.purchaseProduct({ productIdentifier: productId });

if (!result?.transaction) {
  throw new Error('No transaction returned');
}

const txn = result.transaction;
const txnId = txn.transactionId || txn.transactionIdentifier;
```

**A:**
```typescript
const result = await CapgoNativePurchases.purchaseProduct({ productIdentifier: productId });

// Plugin returns Transaction directly, not nested under 'transaction'
if (!result?.transactionId) {
  throw new Error('No transaction returned');
}

// result IS the transaction
const txnId = result.transactionId;
```

**File completo aggiornato (linee 262-305):**
```typescript
purchase: async ({ productId }: any) => {
  console.log('[IAP_FIX_V4] wrapCapgoPlugin.purchase() received', { 
    productId, 
    type: typeof productId,
    isEmpty: !productId || productId.trim?.() === '',
  });
  
  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    console.error('[IAP_FIX_V4] ❌ CRITICAL: purchase() called with empty/invalid productId!', productId);
    throw new Error('productIdentifier is Empty - SKU mancante');
  }
  
  try {
    console.log('[IAP_FIX_V4] ✅ Calling CapgoNativePurchases.purchaseProduct with:', { productIdentifier: productId });
    const result = await CapgoNativePurchases.purchaseProduct({ productIdentifier: productId });
    
    // 🔧 FIX: Plugin returns Transaction directly at root level (not nested)
    console.log('[IAP_FIX_V5] purchaseProduct result:', {
      hasResult: !!result,
      hasTransactionId: !!result?.transactionId,
      transactionId: result?.transactionId,
      keys: result ? Object.keys(result) : [],
    });
    
    if (!result?.transactionId) {
      console.error('[IAP_FIX_V5] ❌ No transactionId in result:', result);
      throw new Error('No transaction returned');
    }
    
    // result IS the transaction (flat structure)
    const txnId = result.transactionId;
    
    // Store for later finishing
    pendingTransactions.set(txnId, result);
    
    console.log('[IAP Capgo] Purchase approved (NOT finished yet):', txnId);
    
    return {
      transactionId: txnId,
      productId: result.productIdentifier || productId,
      receipt: result.receipt,
      originalTransactionId: result.originalTransactionId,
      jwsRepresentation: result.jwsRepresentation,
    };
  } catch (error: any) {
    if (error?.code === 'USER_CANCELLED' || error?.message?.includes('cancel')) {
      throw new Error('Purchase cancelled by user');
    }
    throw error;
  }
},
```

---

## ⚠️ RISCHIO REGRESSIONE

| Rischio | Mitigazione |
|---------|-------------|
| Cambio struttura return | Fix è backwards-compatible: se result.transaction esistesse, result.transactionId esisterebbe comunque |
| Transaction non finita | Il plugin già fa auto-finish di default |
| Receipt mancante | Aggiungiamo log per verificare |

---

## ✅ TEST PLAN (SANDBOX)

### Pre-Requisiti
1. Device fisico iOS con Sandbox Tester
2. Xcode Console aperta
3. Build pulita (Clean Build Folder)

### Test Steps

1. **Test acquisto normale**
   - Aprire shop M1U
   - Selezionare pack Starter (€4.99)
   - Confermare pagamento
   - **Expected**: Acquisto completato, M1U accreditati
   - **Verificare log**: `[IAP_FIX_V5] purchaseProduct result: { hasTransactionId: true, transactionId: "200000..." }`

2. **Test cancellazione**
   - Iniziare acquisto
   - Annullare sulla sheet Apple
   - **Expected**: Toast "Acquisto annullato", nessun errore rosso

3. **Test doppio tap**
   - Tap rapidi multipli su Acquista
   - **Expected**: Solo una sheet Apple appare

4. **Test T&C changed**
   - Resettare Sandbox Tester account
   - Acquistare prodotto
   - **Expected**: Popup T&C → conferma → acquisto OK

---

## 📝 COMANDI ROLLBACK

```bash
# Tornare allo stato pre-fix
git checkout diag/iap-no-transaction
git reset --hard ROLLBACK_BEFORE_IAP_NOTRX_DIAG_*

# Oppure revert del singolo commit (dopo applicazione)
git revert HEAD
```

---

## 📎 ALLEGATI

- Plugin source: `node_modules/@capgo/native-purchases/ios/Sources/NativePurchasesPlugin/`
- TypeScript definitions: `node_modules/@capgo/native-purchases/dist/esm/definitions.d.ts`
- App wrapper: `src/iap/iapService.ts`

---

**REPORT COMPILATO DA**: AI Assistant  
**STATO**: In attesa approvazione per applicare fix
