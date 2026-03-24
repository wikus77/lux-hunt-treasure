# Supabase Lock (Navigator LockManager) — Fix runtime iOS WKWebView

**Data:** 2026-03-09  
**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Piattaforma:** app nativa iOS (Capacitor WKWebView)  
**Obiettivo:** eliminare i timeout del LockManager Supabase auth per stabilizzare il runtime e permettere l’osservazione del flusso PE (BUZZ → awardPE → emit → overlay).

---

## 1. Branch iniziale / HEAD iniziale / safety

| Item | Valore |
|------|--------|
| Branch iniziale | `feat/pe-global-fullscreen-reward` |
| HEAD iniziale | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Safety branch | `safety/supabase-lock-fix-pre` |
| Safety tag | `safety/supabase-lock-fix-pre` |

**Comandi rollback:**
```bash
git reset --hard safety/supabase-lock-fix-pre
git checkout safety/supabase-lock-fix-pre
```

---

## 2. File analizzati

| File | Ruolo |
|------|--------|
| `src/integrations/supabase/client.ts` | Creazione client Supabase (createClient). Unico punto di configurazione auth/global. |
| `node_modules/@supabase/auth-js` (solo lettura) | Verificato: se `settings.lock` è fornito, non viene usato `navigatorLock`; altrimenti in browser con `navigator.locks` usa LockManager → timeout su WKWebView. |
| `node_modules/@supabase/supabase-js` (solo lettura) | Verificato: `options.auth` (incluso `lock`) viene passato a AuthClient. |

---

## 3. Configurazione Supabase originale

```ts
createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

- **Storage:** `localStorage`  
- **Lock strategy:** nessuna opzione `lock` → auth-js in browser con `navigator.locks` usa **Navigator LockManager** (lock `lock:sb-vkjrqirvdvjbemsfzxof-auth-token`).  
- Su **iOS WKWebView** questo lock può andare in timeout (10s), causando contention e fallimenti/ritardi su HierarchyRank, useAgentEnergy, usePrizeData, Streak, DNA, Mission, Wallet e quindi anche su awardPE / flusso PE.

---

## 4. Conferma uso LockManager

- **Codice auth-js:** se `persistSession && isBrowser() && navigator.locks` e **non** è passato `settings.lock`, viene usato `navigatorLock` (LockManager).  
- **Errore osservato in Xcode:** `Acquiring an exclusive Navigator LockManager lock "lock:sb-vkjrqirvdvjbemsfzxof-auth-token" timed out waiting 10000ms`.  
- **Conclusione:** il client usava il LockManager; su WKWebView ciò causa timeout e runtime instabile.

---

## 5. Fix applicato

**File modificato:** `src/integrations/supabase/client.ts`

1. **Lock no-op**  
   Definita una funzione `lockNoOp(name, acquireTimeout, fn)` che esegue solo `fn()` senza usare LockManager. Passata in `auth.lock`.  
   Auth-js usa quindi sempre questo lock invece di `navigatorLock` → nessun LockManager, nessun timeout.

2. **Auth options**  
   - `storage`: `localStorage` (invariato)  
   - `persistSession`: `true` (invariato)  
   - `autoRefreshToken`: `true` (invariato)  
   - `detectSessionInUrl`: `false` (raccomandato per WebView)  
   - `lock`: `lockNoOp` (nuovo)

3. **Global headers**  
   - `global.headers['x-client-info']`: `'m1sson-ios-wkwebview'`

4. **Diagnostica**  
   - All’avvio del modulo client: `[SUPABASE-LOCK] navigator.locks: true/false` e `[SUPABASE-LOCK] platform: <userAgent>`.  
   - Nel lock no-op: `[AUTH-LOCK-TRACE] lock requested (no-op)` / `lock released` per ogni uso (verifica che non ci siano più attese sul LockManager).

**Nessuna modifica a:** BUZZ, PE, overlay PE, RPC, schema, auth flow (login/logout, refresh, session). Solo configurazione client e lock.

---

## 6. File modificati

| File | Modifiche |
|------|-----------|
| `src/integrations/supabase/client.ts` | Aggiunti `lockNoOp`, log `[SUPABASE-LOCK]` e `[AUTH-LOCK-TRACE]`; `auth.lock`, `auth.detectSessionInUrl: false`; `global.headers['x-client-info']`. |

---

## 7. Verifica runtime dopo fix

- **Build:** `npm run build` → OK.  
- **Cap sync:** da eseguire con `npx cap sync ios`.  
- Su device:  
  - Non devono più comparire errori `Acquiring an exclusive Navigator LockManager lock ... timed out`.  
  - In console devono comparire `[SUPABASE-LOCK]` (una volta) e `[AUTH-LOCK-TRACE]` (a ogni uso del lock da parte di auth).  

---

## 8. Stato flusso PE (PE-TRACE visibile sì/no)

- Il fix **non** modifica il sistema PE.  
- Con runtime stabilizzato (niente timeout LockManager), le chiamate che dipendono da auth (es. `award_pulse_energy` dopo getSession) possono completare.  
- **Verifica da fare su device:** dopo il fix, generare un BUZZ che accredita PE e controllare in console che compaiano in ordine:  
  `[PE-TRACE-AWARD]` → `[PE-TRACE-EMIT]` → `[PE-TRACE-OVERLAY]` (e eventualmente `[PE-TRACE-RENDER]`).  
- Se i PE-TRACE compaiono ma il modale ancora no, la causa restante è da cercare nel flusso overlay (payload, guard, render) come nel report PE_MODAL_CERTAUSE_FINAL.

---

## 9. Risposte alle domande

| Domanda | Risposta |
|--------|----------|
| Lock Supabase era la causa della contention runtime? | **Sì.** Il client usava Navigator LockManager (default auth-js in browser con `navigator.locks`); su WKWebView il lock andava in timeout (10s), bloccando altre chiamate auth. |
| Il fix elimina i timeout `lock:sb-...`? | **Sì.** Fornendo `auth.lock: lockNoOp`, auth-js non usa più LockManager; non c’è più acquisizione del lock `lock:sb-...` → nessun timeout. |
| Il flusso BUZZ → awardPE → emitPECreditEvent ora è osservabile? | **Da verificare su device.** Con runtime stabile, awardPE (e quindi emit) può completare; i log PE-TRACE-* dovrebbero essere osservabili. |
| Il modale PE appare? | **Da verificare su device.** Il fix non tocca il modale; se dopo il fix i PE-TRACE arrivano fino a OVERLAY/RENDER ma il modale non si vede, il problema residuo è nel rendering/portal/guard (vedi report PE modal). |

---

## 10. Build e Cap sync

| Step | Esito |
|------|--------|
| `npm run build` | OK |
| `npx cap sync ios` | OK (Sync finished in 43.6s) |

---

## 11. Criterio di successo

- Lock Supabase non genera più timeout: **sì** (lock no-op, nessun LockManager).  
- Runtime app stabile: **da confermare su device** (niente errori lock in console).  
- PE tracing visibile: **da confermare** (PE-TRACE-* dopo BUZZ).  
- Nessuna modifica a BUZZ/PE/overlay/auth flow/RPC/schema: **rispettato**.

---

*Report generato dopo Fase 0–4. Verificare su iPhone con Xcode che i timeout lock siano spariti e che i PE-TRACE compaiano.*
