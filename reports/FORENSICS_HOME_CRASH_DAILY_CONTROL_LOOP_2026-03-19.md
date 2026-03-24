# FORENSICS REPORT — HOME CRASH iOS / DAILY CONTROL LOOP™

**Data:** 2026-03-19  
**Progetto:** M1SSION™ — App nativa wrappata iOS (Capacitor WKWebView)  
**Sintomo:** Home crasha → ErrorBoundary "Oops! Qualcosa è andato storto" + codice tipo ERR-MMVSXJ37  
**Perimetro:** Daily Control Loop™ (Fasi 3–8), file toccati e punti di mount.

---

## 1. IDENTIFICAZIONE PERIMETRO CRASH

### 1.1 File toccati (Fasi 3–8)

| File | Ruolo |
|------|--------|
| `src/hooks/useTodayDailyState.ts` | Hook stato daily (commit, streak, mission, bonus, weekly) |
| `src/components/home/DailyControlLoopCard.tsx` | Card UI + reminder effect + M1U/BUZZ copy |
| `src/hooks/useDailyControlLoopReminder.ts` | persist + schedule reminder serale (localStorage, Notification, setTimeout) |
| `src/locales/{it,en,fr}/common.json` | Chiavi `home_daily_control_loop_*` |
| `supabase/migrations/20260318120000_daily_control_loop_bonus_claim.sql` | RPC + tabella claim bonus + weekly progress |

### 1.2 Punti di mount

- **AppHome.tsx (357):** `<DailyControlLoopCard />` montato **senza** SectionErrorBoundary, tra Prize e Commit nodes.
- **ErrorBoundary:** quello che mostra "Oops! Qualcosa è andato storto" e `errorId` (es. ERR-MMVSXJ37) è `src/components/error/ErrorBoundary.tsx`; l’ID è generato da `generateErrorId()` = `ERR-` + `Date.now().toString(36).toUpperCase()`.
- La card è sotto il router; un’eccezione non catturata in essa (o nei suoi hook) risale fino all’ErrorBoundary di route/app → crash intera Home.

---

## 2. CAUSE PROBABILI (FAMIGLIE VERIFICATE)

### A. Errori runtime React / dati

- **Destructuring / null:** In `DailyControlLoopCard` e `useTodayDailyState` si usa optional chaining (`run?.phase`, `unitsData?.balance`, `data?.claimed`) → nessun accesso diretto a proprietà su null/undefined in render.
- **Shape dati:** RPC restituiscono JSONB; parsing con `(data as { claimed?: boolean })?.claimed` e `(data as { count?: number })?.count ?? 0` è difensivo. `weeklyClaimCount` è inizializzato a `0` e usato con `>= 0` in render → nessun undefined in JSX.

### B. Hook / fetch

- **useTodayDailyState:** `fetchBonusClaimed` e `fetchWeeklyProgress` sono in `try/catch`; in catch si fa fallback (localStorage o 0). Le RPC non esistenti (migration non applicata) danno `error` nella response, non throw; quindi nessun throw non gestito da questi fetch.
- **useDailyEngineV2:** `refetch` è in try/catch; nessun throw in render.
- **useM1UnitsRealtime:** Inizializzazione stato con `getCachedBalance()` è dentro try/catch; ritorna 0 in catch. Nessun throw in render dal hook stesso.

### C. i18n

- Tutte le chiavi usate dalla card (`home_daily_control_loop_title`, `_count`, `_weekly`, `_m1u_ready`, ecc.) sono presenti in it/en/fr. Con react-i18next, chiave mancante normalmente restituisce la chiave, non throw. Nessuna evidenza di crash da i18n.

### D. Supabase / RPC

- RPC inesistenti: `supabase.rpc(...)` restituisce `{ data, error }`, non lancia. I callback sono in try/catch. **Conclusione:** migration mancante non è causa diretta di throw; al massimo concausa di stato “vuoto” o error in console, non del crash della Home.

### E. Reminder (localStorage / Notification / useEffect)

- **Punto critico:** In `DailyControlLoopCard` un `useEffect` chiama:
  - `persistDclReminderState(daily_completion_count)` (ha try/catch interno),
  - `scheduleDclEveningReminder(daily_completion_count)` (nessun try/catch attorno alla funzione).
- In `scheduleDclEveningReminder`:
  - Accesso a `window` (`'Notification' in window`),
  - `localStorage.getItem/setItem` più volte,
  - `new Date()`, `setTimeout`, ecc.
- Su iOS (WKWebView) in contesti restrittivi (storage disabilitato, modalità privata, policy restrittive) `localStorage` può lanciare (es. SecurityError). Anche l’accesso a `Notification` in alcuni ambienti può essere problematico.
- **Se una di queste operazioni lancia, l’useEffect non ha try/catch:** React segnala l’errore e l’ErrorBoundary lo cattura → crash intera Home.

**Evidenza:** Il flusso che porta al messaggio "Oops! Qualcosa è andato storto" è un’eccezione non gestita nel tree che include la card; l’unico blocco di codice aggiunto di recente che esegue in effect e che non è protetto da try/catch attorno a chiamate a localStorage/window è proprio l’effect del reminder nella card e il corpo di `scheduleDclEveningReminder`.

### F. Auth context (useUnifiedAuth / useAuthContext)

- `useUnifiedAuth` e `useAuthContext` fanno: `if (context === undefined) throw new Error(...)`.
- `DailyControlLoopCard` usa `useUnifiedAuth()` e `useM1UnitsRealtime(user?.id)`; quest’ultimo usa `useAuthContext()`.
- Se in un frame la Home viene renderizzata prima che `AuthProvider` abbia iniettato il valore (es. cold start, reidratazione ritardata su iOS), `context === undefined` → throw durante il render della card.
- **Evidenza:** Un solo frame con context undefined è sufficiente per far crashare l’intero sotto-albero; senza SectionErrorBoundary attorno alla card, l’errore risale fino all’ErrorBoundary globale → stesso sintomo (Oops + ERR-xxx).

### G. Integrazione Home

- Nessun prop obbligatorio alla card; scroll target (`home-daily-commit`, ecc.) usati con `document.getElementById(...)?.scrollIntoView(...)` → safe.
- Callback (handleClaimBonus, handleGoCommit, ecc.) passate come funzioni, non invocate in render → nessun loop di render da lì.

---

## 3. ROOT CAUSE RANKING

| # | Causa | Gravità | Probabilità | Evidenza | File |
|---|--------|---------|-------------|----------|------|
| 1 | **useEffect reminder:** `scheduleDclEveningReminder` (e/o `persistDclReminderState`) lancia su iOS (localStorage/Notification/window) e l’effect non ha try/catch | Alta | Alta | Effect senza try/catch; reminder usa localStorage/window/Notification; iOS noto per restrizioni storage/API | DailyControlLoopCard.tsx, useDailyControlLoopReminder.ts |
| 2 | **Auth context undefined:** al primo paint (o reidratazione) context è undefined → useUnifiedAuth/useAuthContext throw → ErrorBoundary globale | Alta | Media | Codice esplicito `if (context === undefined) throw`; card non protetta da boundary di sezione | useAuthContext.ts, useUnifiedAuth.ts, AppHome.tsx |
| 3 | RPC/migration mancante | Bassa | Bassa | RPC ritornano error, non throw; tutti i path in try/catch | useTodayDailyState.ts |

---

## 4. PERCHÉ LA HOME CRASHA

- Un’eccezione (da effect reminder o da auth context) viene lanciata durante il render o durante l’esecuzione di un effect del sotto-albero che include `DailyControlLoopCard`.
- `DailyControlLoopCard` **non** è avvolta in un `SectionErrorBoundary`, quindi l’errore risale fino all’`ErrorBoundary` di route/app.
- L’ErrorBoundary mostra il fallback con "Oops! Qualcosa è andato storto" e un `errorId` generato al momento del catch (es. ERR-MMVSXJ37).

---

## 5. PERCHÉ IL CRASH APPARE ORA

- Con le Fasi 3–8 sono stati introdotti:
  - L’useEffect che chiama `persistDclReminderState` e `scheduleDclEveningReminder` (Fase 6),
  - L’uso di `useM1UnitsRealtime(user?.id)` nella card (Fase 8), che a sua volta usa `useAuthContext()`.
- Prima non c’era né l’effect reminder (con possibili throw su iOS) né l’uso del secondo hook auth nella card; inoltre la card non era ancora nel path critico per il primo paint della Home. Ora lo è.

---

## 6. FIX MINIMI CONSIGLIATI

1. **Reminder fail-safe**
   - In `useDailyControlLoopReminder.ts`: avvolgere l’intero corpo di `scheduleDclEveningReminder` in try/catch; in caso di errore ritornare `undefined` (nessun cleanup).
   - In `DailyControlLoopCard.tsx`: avvolgere il corpo dell’useEffect del reminder in try/catch; in catch non fare nulla (nessun throw).

2. **Isolare il fallimento della card**
   - In `AppHome.tsx`: avvolgere `<DailyControlLoopCard />` in `<SectionErrorBoundary section="DailyControlLoop" fallbackHeight="120px">`. Così qualsiasi throw (reminder, auth context, altro) viene contenuto e la Home non crasha; al massimo la sezione Daily mostra il placeholder.

3. **Nessuna modifica a:** login/logout, IAP, BUZZ, push, routing, altri componenti Home non coinvolti. Nessun refactor estetico.

---

## 7. MIGRATION MANCANTE

- **Non è la causa diretta del crash:** le RPC mancanti non lanciano; il client gestisce error e fallback.
- È eventuale **concausa** solo se si volesse mostrare bonus/weekly: senza migration lo stato resterebbe “non claimato” / 0. Il fix del crash non dipende dall’applicare la migration; l’applicazione della migration è comunque necessaria per la funzionalità bonus/weekly.

---

## 8. GO / NO GO AL FIX

**GO.** Cause individuate con evidenze (effect reminder non protetto, auth context throw, assenza di SectionErrorBoundary sulla card). I fix proposti sono minimi, chirurgici e rollbackabili.

---

© 2026 Joseph MULÉ – M1SSION™
