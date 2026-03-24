# Phase 3 — Retention Layer — Report

**Project:** M1SSION™ — Daily Mission Engine Enterprise  
**Date:** 2026-03-14  
**Phase:** 3 — Retention Layer  
**Environment:** iOS wrapped app (Capacitor WKWebView) only  

---

## 1. EXECUTIVE SUMMARY

- **Implementato:** Layer di retention server-first: (1) **Streak missioni** persistita in `daily_mission_streaks`, aggiornata da `claim-daily-phase` a ogni `complete_phase2` con successo; (2) **Weekly tracker** derivato da `daily_mission_runs` (7 booleani Mon–Sun) restituito in `daily-mission-today`; (3) **Agent status** ACTIVE/INACTIVE (ACTIVE se `streak >= 1`); (4) **Sunday Super Reward** con tabella `daily_sunday_reward_claims`, Edge `consume-sunday-reward` e modale full-screen 60s; (5) UI retention nella card v2 (streak, 7 giorni, agent, CTA Sunday).
- **Scelta tecnica:** Streak in tabella dedicata; weekly e agent derivati lato server; Sunday entitlement = domenica + daily completata + non ancora consumata; consumo all’apertura modale.
- **Reward escalation / Near miss:** **Non implementati** (documentati come fuori scope per sicurezza e semplicità).
- **Rischio:** Controllato. Nessun tocco a login, IAP, BUZZ, push; solo migration, due Edge, client daily v2 e i18n.
- **Build:** OK (exit code 0, ~5m 31s).
- **Cap sync:** OK.
- **Verdetto:** **GO FOR PHASE 4** (con deploy migration + Edge come da §9).

---

## 2. TECHNICAL DECISIONS

### Streak missioni
- **Dove:** Tabella `daily_mission_streaks` (user_id PK, last_completed_day_key, current_streak, updated_at). Una riga per utente.
- **Quando:** Aggiornata in `claim-daily-phase` dopo ogni `complete_phase2` con win e claim nuovo (stesso blocco in cui si creditano M1U e PE). Logica: se `last_completed_day_key` è il giorno prima di quello appena completato → `current_streak += 1`, altrimenti `current_streak = 1`; poi `last_completed_day_key` = giorno completato.
- **Lettura:** In `daily-mission-today` con client utente (RLS: SELECT dove user_id = auth.uid()). Il client riceve `retention.streak`.

### Weekly tracker
- **Dove:** Derivato in `daily-mission-today`. Settimana UTC ISO (lunedì–domenica); per ogni giorno della settimana si controlla se esiste un run con phase >= 3 e status = 'completed'. Array di 7 booleani `weekly_completion` (indice 0 = lunedì).
- **Nessuna tabella aggiuntiva:** Si usa solo `daily_mission_runs`.

### Agent status
- **Regola:** ACTIVE se e solo se `current_streak >= 1` (almeno un giorno consecutivo completato e streak non azzerato). INACTIVE altrimenti. Derivato in `daily-mission-today`, non persistito separatamente.

### Sunday Super Reward
- **Diritto:** La phase2 si completa il giorno successivo; quindi la daily di **domenica** (day_key = Sunday) risulta completata **lunedì**. Il diritto è: **lunedì (UTC)** l’utente ha completato il run per day_key = domenica **e** non esiste riga in `daily_sunday_reward_claims` per (user_id, sunday_day_key). Il server restituisce `sunday_reward_available: true` e `sunday_reward_day_key` (il day_key della domenica) così il client chiama `consume-sunday-reward(sunday_reward_day_key)`.
- **Dove vive lo stato:** Tabella `daily_sunday_reward_claims` (user_id, day_key PK, consumed_at). Inserimento solo da Edge `consume-sunday-reward`.
- **Consumo:** All’apertura del modale (chiamata a `consume-sunday-reward(sunday_reward_day_key)`; se ok, si mostra il modale). Una sola consumazione per (user_id, day_key). Reopen/background: lo stato è già consumato, quindi `sunday_reward_available` diventa false al refetch.
- **Modale:** Full-screen, 60 secondi di lettura, timer; chiusura manuale o automatica a 0s; nessun reward M1U/PE aggiuntivo in questa fase.

### Reward escalation
- **Decisione:** **Non inclusa.** Aggiungere bonus M1U/PE in base a streak o giorno richiederebbe estensione del contratto reward e più test. Documentata per fase successiva (es. Fase 4 o 2.5).

### Near miss
- **Decisione:** **Non incluso.** Una logica “quasi fatto” credibile richiederebbe regole per tipo di missione e più stato; rischio di scope e fragilità. Documentato per fase successiva.

---

## 3. SERVER SIDE CHANGES

### DB – Migration
- **File:** `supabase/migrations/20260313120000_daily_mission_streaks_sunday_claims.sql`
- **Tabelle:**  
  - `daily_mission_streaks`: user_id (PK, FK auth.users ON DELETE CASCADE), last_completed_day_key, current_streak, updated_at. RLS: SELECT per proprio user_id; INSERT/UPDATE solo da service role.  
  - `daily_sunday_reward_claims`: (user_id, day_key) PK, consumed_at. RLS: SELECT per proprio user_id; INSERT solo da service role.

### Edge – claim-daily-phase
- Aggiunte: `getDayKeyBefore(dayKey)`, `updateStreakAfterComplete(admin, userId, completedDayKey)`.
- In tutti e tre i rami `complete_phase2` (cipher, word_duel, signal_pattern), dopo aver inserito il claim e accreditato M1U/PE (condizione win e nessun existingClaim), viene chiamato `updateStreakAfterComplete(admin, userId, runDayKey)`.

### Edge – daily-mission-today
- Aggiunte: `getWeekMondayDayKey(dayKey)`, `getWeekDayKeys(dayKey)` (settimana ISO UTC).
- Dopo aver calcolato missione del giorno, query in parallelo: `daily_mission_streaks` (streak), `daily_mission_runs` (run nella settimana), `daily_sunday_reward_claims` (solo se oggi è domenica).
- Calcolo: `weekly_completion` (7 booleani), `agent_status` (streak >= 1 ? ACTIVE : INACTIVE), `sunday_reward_available` (domenica && daily completata && non consumata).
- Risposta estesa con `retention: { streak, week_start, weekly_completion, agent_status, sunday_reward_available }`.

### Edge – consume-sunday-reward (nuova)
- **File:** `supabase/functions/consume-sunday-reward/index.ts`
- Input: POST body `{ day_key }`. Controlli: day_key è domenica (getUTCDay === 0); utente ha completato la daily per quel day_key (run phase 3, status completed); non esiste già riga in `daily_sunday_reward_claims`. Inserimento con service role; risposta `{ ok, consumed }` o `{ ok, already_consumed }`.

### Contratti reward / claim / day_key
- Invariati: idempotenza claim, M1U e PE come in Phase 1/2; day_key UTC; nessuna modifica alla logica di “oggi” o validità.

---

## 4. CLIENT SIDE CHANGES

### Tipi e API
- **dailyMissionToday.ts:** Aggiunto `DailyMissionRetention` e campo `retention` in `DailyMissionTodayResponse`.
- **consumeSundayReward.ts (nuovo):** Invoca `consume-sunday-reward` con `day_key`; tipo `ConsumeSundayRewardResponse`.

### Hook useDailyEngineV2
- Stato `retention` (tipo `DailyEngineRetention`); popolato da `res.retention`; esposto nel return.

### UI
- **DailyEngineV2Card:** Mostra blocco retention sotto la missione: streak, 7 celle settimanali (M–S), agent status. Se `retention.sundayRewardAvailable` e `dayKey`, pulsante “Claim Sunday Reward” che chiama `consumeSundayReward(dayKey)` e poi apre il modale.
- **SundaySuperRewardModal (nuovo):** Full-screen, titolo/corpo i18n, countdown 60s, chiusura a 0s o con pulsante; nessuna logica di reward aggiuntiva.

### Flussi frozen
- Nessuna modifica a login, logout, delete account, IAP, BUZZ, BUZZ MAP, push, Home/Map/Next Action (eccetto la card daily v2 già esistente).

---

## 5. I18N

- **Prefisso:** `daily_engine.*`
- **Chiavi aggiunte (IT, EN, FR):**  
  streak_label, agent_active, agent_inactive, weekly_done, weekly_not_done, sunday_reward_title, sunday_reward_body, sunday_reward_cta, sunday_claiming, sunday_reading_time (con `{{count}}`), sunday_closing, sunday_close.
- Nessuna stringa retention/Sunday hardcoded in UI.

---

## 6. IMPACT ANALYSIS

- **Flussi frozen:** Non toccati (login, logout, delete, IAP, BUZZ, BUZZ MAP, push).
- **Home / Map / Next Action:** Solo la card daily v2 ha il blocco retention e il CTA Sunday; nessun altro layout modificato.
- **Rischi residui:** (1) Deploy migration obbligatorio prima delle Edge che scrivono su streak/sunday_claims. (2) Edge `daily-mission-today` e `consume-sunday-reward` devono essere deployate; `claim-daily-phase` deve essere deployata per l’aggiornamento streak.

---

## 7. BUILD VERIFICATION

- **Comando:** `npm run build`
- **Esito:** OK (exit code 0). Build completata in ~5m 31s.
- **Warning:** Nessuno rilevante per la Fase 3.

---

## 8. CAPACITOR SYNC IOS

- **Comando:** `npx cap sync ios`
- **Esito:** OK (copy web assets, copy ios, update plugins).
- **Note:** Nessuna modifica a plugin o config Capacitor.

---

## 9. DEPLOY NOTES FOR JOSEPH

### Cosa deployare (ordine)

1. **Migration Supabase**  
   Applicare la migration che crea `daily_mission_streaks` e `daily_sunday_reward_claims` (e relative RLS).  
   - Da progetto: `supabase db push` oppure applicare manualmente il file  
     `supabase/migrations/20260313120000_daily_mission_streaks_sunday_claims.sql`  
   - **Prima** di deployare le Edge che le usano.

2. **Edge Functions**  
   - `daily-mission-today` (restituisce `retention`)  
   - `consume-sunday-reward` (nuova)  
   - `claim-daily-phase` (aggiorna streak su complete_phase2)  
   Comandi tipici (dalla root):  
   `supabase functions deploy daily-mission-today`  
   `supabase functions deploy consume-sunday-reward`  
   `supabase functions deploy claim-daily-phase`

3. **Client**  
   - `npm run build`  
   - `npx cap sync ios`  
   - Build/run da Xcode su dispositivo/simulatore.

### Cosa non deployare
- Nessun altro servizio o DB oltre a migration + tre Edge sopra.

### Verifiche post-deploy (iPhone)
- Completare una daily (phase 2 con win): verificare che la streak aumenti (o diventi 1) e che in card si veda il numero e le 7 celle settimanali.
- Agent status: con streak >= 1 deve mostrare “Active”, altrimenti “Inactive”.
- Lunedì (UTC): dopo aver completato la daily di domenica (run day_key = domenica), verificare che compaia “Claim Sunday Reward”; toccare, verificare apertura modale 60s e che al successivo refetch il pulsante non sia più disponibile (consumato).
- Login, IAP, BUZZ, push: smoke test senza regressioni.

### Logout / login
- Non richiesti per il funzionamento del retention layer; il refetch alla visibilità aggiorna retention.

---

## 10. FINAL VERDICT

**GO FOR PHASE 4**

La Fase 3 è stata implementata in modo server-first, con streak reale, weekly tracker derivato, agent status chiaro e Sunday Super Reward con consumo unico e lifecycle controllato. Reward escalation e near miss sono esclusi e documentati per fasi successive. Nessun impatto su flussi frozen. Per andare in produzione servono: applicazione migration, deploy delle tre Edge indicate e rebuild/sync client come da §9.
