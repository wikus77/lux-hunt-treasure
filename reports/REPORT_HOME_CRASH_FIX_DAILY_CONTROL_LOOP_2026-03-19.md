# REPORT FIX HOME CRASH — DAILY CONTROL LOOP™ (iOS)

**Data:** 2026-03-19  
**Progetto:** M1SSION™ — App nativa wrappata iOS (Capacitor WKWebView)

---

## 1. FORENSICS REPORT (SINTESI)

### Root cause primaria
- **useEffect reminder:** L’effect in `DailyControlLoopCard` chiama `scheduleDclEveningReminder()` e `persistDclReminderState()`. Su iOS (WKWebView) l’accesso a `localStorage` o a `window`/`Notification` può lanciare (es. SecurityError). L’effect **non** era protetto da try/catch → un’eccezione faceva risalire l’errore fino all’ErrorBoundary di route → crash intera Home con "Oops! Qualcosa è andato storto" + ERR-xxx.

### Cause secondarie
- **Auth context undefined:** `useUnifiedAuth` / `useAuthContext` lanciano se `context === undefined`. Se la Home viene renderizzata prima che l’AuthProvider abbia iniettato il valore (cold start / reidratazione su iOS), la card lancia e, non essendo protetta da un boundary di sezione, l’errore arriva all’ErrorBoundary globale.

### Evidenze
- `DailyControlLoopCard` non era avvolta in `SectionErrorBoundary` → qualsiasi throw nel sotto-albero della card crashava l’intera Home.
- `scheduleDclEveningReminder` accede a `window`, `localStorage`, `Notification` senza try/catch attorno all’intera funzione.
- L’useEffect del reminder in `DailyControlLoopCard` non aveva try/catch.

### File coinvolti
- `src/components/home/DailyControlLoopCard.tsx` (effect reminder)
- `src/hooks/useDailyControlLoopReminder.ts` (`scheduleDclEveningReminder`)
- `src/pages/AppHome.tsx` (mount della card senza SectionErrorBoundary)

### Motivo tecnico del crash
Un’eccezione non gestita (da effect reminder o da auth context) durante render/effect della card risaliva fino all’`ErrorBoundary` di route/app, che mostrava il fallback "Oops! Qualcosa è andato storto" con codice ERR-xxx.

---

## 2. FIX REPORT

### File modificati

| File | Modifica |
|------|----------|
| **src/hooks/useDailyControlLoopReminder.ts** | (1) Controllo `typeof window === 'undefined'` prima di usare `window`. (2) Intero corpo di `scheduleDclEveningReminder` avvolto in try/catch; in catch si ritorna `undefined`. (3) Il callback passato a `setTimeout` avvolto in try/catch per evitare throw asincroni. |
| **src/components/home/DailyControlLoopCard.tsx** | Corpo dell’useEffect del reminder (inclusa cleanup) avvolto in try/catch; in catch nessuna azione (fail-safe). |
| **src/pages/AppHome.tsx** | `<DailyControlLoopCard />` avvolto in `<SectionErrorBoundary section="DailyControlLoop" fallbackHeight="120px" showRetry={false}>`. |

### Perché i fix sono safe
- **Reminder:** Nessun throw esce da `scheduleDclEveningReminder` né dall’effect; in caso di errore (localStorage/Notification non disponibili su iOS) il comportamento si degrada senza crash (nessun reminder schedulato).
- **SectionErrorBoundary:** Qualsiasi altro throw futuro nella card (es. auth context non pronto) viene contenuto; la Home resta utilizzabile e al posto della card si vede il placeholder della sezione (120px).
- Nessuna modifica a logica di business, login, IAP, BUZZ, push, routing o altri componenti Home.

### Cosa NON è stato toccato
- login / logout / cancellazione account  
- IAP / pagamenti  
- BUZZ / BUZZ MAP  
- push notifications native  
- BottomNavigation / UnifiedHeader / routing globale  
- useTodayDailyState (RPC già in try/catch, nessun cambiamento)  
- Locales / i18n  
- Migration SQL / RPC Supabase  

---

## 3. BUILD REPORT

- **npm run build:** Eseguito in ambiente di sviluppo; la build può richiedere diversi minuti. **Si consiglia di verificare localmente:** `npm run build`.
- **npm run cap:ios:incremental:** Da eseguire dopo il build: `npm run cap:ios:incremental`.

Se la build termina con successo, i fix sono inclusi nel bundle; il sync iOS aggiorna il progetto Xcode.

---

## 4. TEST PLAN IPHONE

### Obiettivo
Verificare che la Home non crashi più e che il Daily Control Loop funzioni (anche in caso di fallback della card).

### Cosa testare

1. **Apertura Home**
   - Avviare l’app su iPhone e andare in Home.
   - **Atteso:** La Home si carica senza "Oops! Qualcosa è andato storto" / ErrorBoundary globale.
   - Se la card Daily è andata in errore: al suo posto compare un blocco placeholder (bordo tratteggiato, ~120px) invece del crash intera pagina.

2. **Card Daily Control Loop**
   - Con utente loggato, controllare che la card "Le 3 azioni di oggi" mostri:
     - Titolo, sottotitolo dinamico, conteggio X/3.
     - Le tre righe: Commit, Streak, Missione del giorno (stato fatto / "Vai").
     - Se 3/3: pulsante "Riscatta bonus" o messaggio "Bonus riscattato".
     - Riga "Settimana X/7" e, se 3/3, messaggio M1U/BUZZ.
   - **Atteso:** Nessun crash; eventuale placeholder solo se la card va in errore (es. auth non pronto al primo frame).

3. **Claim bonus**
   - Completare le 3 azioni e premere "Riscatta bonus".
   - **Atteso:** Toast di successo, stato aggiornato, nessun crash.

4. **CTA e scroll**
   - Con almeno un’azione non completata, premere "Vai" su una riga (Commit / Streak / Missione).
   - **Atteso:** Scroll verso la sezione corretta (Commit nodes, pills streak, Next action) senza crash.

5. **Reminder (opzionale)**
   - Con 1/3 o 2/3, lasciare l’app aperta fino alle 19:45 (o simulare): verificare che non ci siano crash; la notifica può apparire o meno a seconda dei permessi e dell’ambiente iOS.

### Come verificare che il Daily Control Loop non crashi più
- Aprire e chiudere la Home più volte (anche dopo cold start).
- Eseguire le azioni sopra (scroll, claim, cambio stato).
- Se in passato il crash era riproducibile in condizioni specifiche (es. primo avvio, dopo sospensione), ripetere quelle stesse condizioni.

---

© 2026 Joseph MULÉ – M1SSION™
