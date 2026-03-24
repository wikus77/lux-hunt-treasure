# REPORT — M1SSION DAILY CONTROL LOOP™ FASI 3–8

**Data:** 2026-03-18  
**Ambiente:** Solo app nativa iOS (Capacitor WKWebView).  
**Scope:** Stato reale, reward protetto, messaggi dinamici, reminder serale, weekly 7/7, collegamento M1U/BUZZ.

---

## 1. FILE TOCATI

| File | Fase | Modifica |
|------|------|----------|
| `src/hooks/useTodayDailyState.ts` | 3,4,7 | Sottotitoli già ok; bonus da server (get_daily_control_loop_bonus_claimed, get_daily_control_loop_weekly_progress); weeklyClaimCount |
| `src/components/home/DailyControlLoopCard.tsx` | 3,4,5,6,7,8 | Sottotitoli dinamici; CTA contestuali; claim RPC; messaggi 3/3; reminder; weekly X/7; messaggio M1U/BUZZ |
| `src/locales/it/common.json` | 3,4,5,7,8 | Chiavi i18n per completed_one, bonus_claimed, completed_bonus_ready, completed_all_done, day_not_started, cta_commit/streak/mission, weekly, m1u_ready, m1u_build |
| `src/locales/en/common.json` | idem | Stesse chiavi (EN) |
| `src/locales/fr/common.json` | idem | Stesse chiavi (FR) |
| `supabase/migrations/20260318120000_daily_control_loop_bonus_claim.sql` | 4,7 | Tabella daily_control_loop_bonus_claims; RPC claim_daily_control_loop_bonus, get_daily_control_loop_bonus_claimed, get_daily_control_loop_weekly_progress |
| `src/hooks/useDailyControlLoopReminder.ts` | 6 | **Nuovo** — persistDclReminderState, scheduleDclEveningReminder (19:45, un reminder/giorno) |

**Non toccati:** login/logout, delete account, IAP, BUZZ, BUZZ MAP, push native, BottomNavigation, Commit/Streak/Daily Mission business logic, UnifiedHeader, routing fuori scope.

---

## 2. FASE 3 — STATO REALE 0/3 + CHECK REALI + CTA

- **Calcolo 0/3:** `daily_completion_count` = (commit_done ? 1 : 0) + (streak_done ? 1 : 0) + (daily_mission_done ? 1 : 0).  
  - **commit_done:** da `check_commit_ritual_status()` → `already_done_today === true`.  
  - **streak_done:** da `profiles.last_check_in_date === today` (Europe/Rome).  
  - **daily_mission_done:** da `useDailyEngineV2()` → `run?.phase === 3 && run?.status === 'completed'`.
- **Check reali:** Ogni riga mostra "Completato" + checkmark se done, altrimenti CTA contestuale.
- **Sottotitoli:** 0/3 → "La tua giornata operativa non è iniziata"; 1/3 → "Hai completato il primo passo"; 2/3 → "Manca solo 1 azione"; 3/3 → "Giornata completata. Bonus disponibile" o "Tutto sotto controllo" se bonus già riscattato.
- **CTA:** Commit → scroll a `#home-daily-commit`; Streak → `#home-daily-streak`; Missione → `#home-daily-mission`. Testo CTA: "Inizia con il Commit", "Conferma la tua presenza", "Chiudi la giornata con la missione".

---

## 3. FASE 4 — REWARD REALE 3/3 + CLAIM UNA VOLTA AL GIORNO

- **Backend:** Tabella `daily_control_loop_bonus_claims (user_id, claim_date, created_at)` UNIQUE(user_id, claim_date).  
  RPC **claim_daily_control_loop_bonus():** verifica 3/3 (commit, streak, mission) lato server, controlla se già claim oggi, inserisce riga, chiama `admin_credit_m1u(uid, 10, 'daily_control_loop_bonus')`, ritorna `{ ok, already_claimed, amount }`.  
  RPC **get_daily_control_loop_bonus_claimed():** ritorna `{ claimed }` per oggi.
- **Reward:** Solo M1U (+10). Nessun PE aggiunto.
- **Doppio claim:** Impedito da tabella (UNIQUE) + check in RPC prima di inserire e accreditare.
- **3/3 reale:** Deciso in RPC con le stesse sorgenti (check_commit_ritual_status, profiles.last_check_in_date, daily_mission_runs phase=3 status=completed per day_key oggi).
- **Client:** Card chiama `claim_daily_control_loop_bonus()`; hook legge `get_daily_control_loop_bonus_claimed()` per stato "bonus riscattato". Dopo claim: "Bonus riscattato".

---

## 4. FASE 5 — MESSAGGI DINAMICI INTELLIGENTI

- **Mappa messaggi:** Vedi §2 (sottotitoli). In più: 3/3 e bonus non claimato → "Giornata completata. Bonus disponibile"; 3/3 e bonus claimato → "Giornata completata. Tutto sotto controllo".
- **CTA implicite:** Per riga non completata: "Inizia con il Commit" / "Conferma la tua presenza" / "Chiudi la giornata con la missione".
- **i18n:** Tutte le stringhe passano da chiavi it/en/fr.

---

## 5. FASE 6 — REMINDER SERALI

- **Implementazione:** `useDailyControlLoopReminder`: `persistDclReminderState(count)` scrive in localStorage count e data quando count < 3; `scheduleDclEveningReminder(count)` programma un solo timeout alle 19:45 (stesso pattern di useStreakReminder, che è alle 20:00).
- **Priorità:** Un solo reminder DCL al giorno; tag `dcl-reminder` per non sovrapporre alla streak.
- **Orario:** 19:45 per evitare lo stesso minuto dello streak (20:00).
- **Spam/duplicati:** Un solo reminder/giorno; chiave `m1_dcl_reminder_scheduled`; nessun reminder se count >= 3.
- **Push chain:** Non modificata; solo Web Notification + setTimeout lato client.

---

## 6. FASE 7 — WEEKLY STREAK 7/7

- **Progresso settimanale:** RPC **get_daily_control_loop_weekly_progress()** conta le righe in `daily_control_loop_bonus_claims` nella settimana corrente (Europe/Rome, lunedì–oggi).
- **Differenza:** Streak classica = check-in giorni consecutivi (profiles). Weekly DCL = giorni in cui l’utente ha fatto 3/3 e riscattato il bonus (tabella claims).
- **UI:** Sotto il blocco daily: "Settimana X/7" (con refetch da hook).
- **Reward 7/7:** Non implementata in questa fase; solo visualizzazione del conteggio.

---

## 7. FASE 8 — COLLEGAMENTO M1U/BUZZ

- **Logica messaggi:** Se `daily_completion_count === 3`: se `m1uBalance >= 20` (MIN_M1U_FOR_BUZZ, primo tier BUZZ) → "Le risorse di oggi sono pronte. Usa le M1U per il BUZZ."; altrimenti → "Le risorse di oggi sono pronte. Continua a costruire le tue risorse."
- **Quando appare "Hai abbastanza per un BUZZ":** Mostrato come "Usa le M1U per il BUZZ" quando 3/3 e balance >= 20.
- **Quando appare "Continua a costruire":** Quando 3/3 e balance < 20.
- **Flusso BUZZ:** Non modificato; nessuna CTA che cambia logica BUZZ, solo copy in card.

---

## 8. RISCHI RESIDUI

- **Migration:** Va applicata (supabase migrate). Senza di essa le RPC claim/get_claimed/weekly_progress non esistono e il claim e il weekly falliranno.
- **Reminder:** Solo se l’app è aperta prima delle 19:45; alla chiusura il timeout si perde (come per lo streak).
- **Fuso Europe/Rome:** Commit, streak, claim e weekly usano Europe/Rome; coerenza con `check_commit_ritual_status` e `commit_ritual_daily`.

---

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```

**Importante:** Applicare le migration Supabase (es. `npx supabase db push` o deploy migration) prima di usare claim e weekly in produzione.

---

## 10. VERIFICHE BUILD/SYNC

- **Build:** Avviato in background; verificare completamento in locale.
- **Sync iOS:** Eseguire `npm run cap:ios:incremental` dopo il build.

---

*Fine report consolidato Fasi 3–8.*
