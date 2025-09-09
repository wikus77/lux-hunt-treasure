# 🔇 M1SSION™ Silent Auto-Update System

## 📋 OVERVIEW
Sistema di aggiornamento silenzioso che elimina tutti i banner di aggiornamento e esegue **esattamente 1 solo refresh** per BUILD_ID in modo automatico e ottimizzato per iOS PWA.

## 🔧 COMPONENTI

### 1. **Silent Auto-Update Core** (`src/utils/silentAutoUpdate.ts`)
Sistema principale che gestisce l'aggiornamento automatico senza UI.

### 2. **Session Storage Keys**
- `sw:reloaded:<BUILD_ID>` → `'1'` = già ricaricato per questo BUILD_ID
- `sw:updateReady:<BUILD_ID>` → `'1'` = nuova versione pronta per refresh

### 3. **BUILD_ID System**
- Usa `import.meta.env.VITE_BUILD_ID` per identificazione univoca versione
- Generato a build time in `vite.config.ts`
- Garantisce refresh una sola volta per deploy

## 🔄 FLUSSO OPERATIVO

### **1. Rilevamento Update**
```javascript
registration.addEventListener('updatefound', () => {
  // Set updateReady flag
  sessionStorage.setItem(`sw:updateReady:${BUILD_ID}`, '1');
  
  // Auto-send skip waiting (no user prompt)
  newWorker.postMessage({ type: 'SW_SKIP_WAITING' });
});
```

### **2. Controller Change**
```javascript
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // Check if refresh needed and not already done
  if (hasUpdateReady && !hasReloaded) {
    performSilentRefresh();
  }
});
```

### **3. Refresh Strategy**

#### **iOS PWA (Standalone)**
- Usa `location.replace(location.href)` per evitare BFCache issues
- Se app nascosta → aspetta `visibilitychange` per refresh ottimale
- Timing con `requestIdleCallback` o `setTimeout(300ms)`

#### **Desktop/Mobile Browser**
- Usa `location.reload()` standard
- Refresh immediato con timing ottimizzato

## 🛡️ ANTI-LOOP PROTECTION

### **Hard Lock System**
1. **Prima del refresh**: Set `sw:reloaded:<BUILD_ID>=1`
2. **Check multiplo**: Verifica flag prima di ogni operazione
3. **Cleanup automatico**: Rimuove flag di BUILD_ID precedenti
4. **State isolation**: Ogni BUILD_ID ha il proprio stato

### **iOS PWA Specific Guards**
- Controllo `document.visibilityState` prima del refresh
- Listener `visibilitychange` per timing ottimale
- Safety timeout (30s) per evitare blocchi

## 🔧 DEBUGGING

### **Global Diagnostics**
```javascript
// Stato corrente
window.__M1_SILENT_UPDATE__.get()

// Trigger manuale update
window.__M1_SILENT_UPDATE__.trigger()

// Reset flags per test
window.__M1_SILENT_UPDATE__.reset()
```

### **Debug Logging**
Attivare con: `VITE_SW_UPDATE_DEBUG=1`

## 📱 COMPATIBILITÀ

| **Environment** | **Refresh Method** | **Timing** | **Status** |
|-----------------|-------------------|------------|------------|
| **iOS PWA** | `location.replace()` | Visibility-aware | ✅ Optimized |
| **Safari Tab** | `location.reload()` | Immediate | ✅ Standard |
| **Desktop** | `location.reload()` | Immediate | ✅ Standard |
| **Android PWA** | `location.reload()` | Immediate | ✅ Standard |

## 🚀 DEPLOYMENT FLOW

### **1. New Deploy** (BUILD_ID cambia)
1. User naviga nell'app
2. SW rileva nuovo worker → set `updateReady`
3. Auto-send `SW_SKIP_WAITING` → nessun prompt
4. `controllerchange` → check flags → **1 refresh**
5. Post-refresh → flag `reloaded` attivo → **nessun altro refresh**

### **2. Subsequent Sessions** (stesso BUILD_ID)
- Flag `reloaded` presente → **nessuna azione**
- App avvia normalmente senza interruzioni

## ⚠️ VINCOLI RISPETTATI
- ✅ **Push chain blindata**: ZERO modifiche a notifiche push
- ✅ **No UI banners**: Completamente silenzioso
- ✅ **One refresh only**: Hard lock per BUILD_ID
- ✅ **iOS PWA optimized**: Timing e metodi specifici

## 🔍 TROUBLESHOOTING

### **Update non funziona**
```javascript
// Check diagnostics
const diag = window.__M1_SILENT_UPDATE__.get();
console.log('Diagnostics:', diag);

// Manual trigger
window.__M1_SILENT_UPDATE__.trigger();
```

### **Loop di refresh**
```javascript
// Reset flags
window.__M1_SILENT_UPDATE__.reset();
// Poi ricarica manualmente
```

### **Black screen iOS**
Il sistema mantiene `iosPwaSafeBoot.ts` per prevenire black screen indipendentemente dagli aggiornamenti.

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**