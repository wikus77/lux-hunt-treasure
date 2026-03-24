# REPORT — M1SSION DAILY CONTROL LOOP™ FASE 1 (VERSIONE MINIMA)

**Data:** 2026-03-18  
**Branch:** `feat/daily-control-loop-phase1`  
**Tag rollback:** `safety/daily-control-loop-phase1-before`  
**Ambiente:** Solo app nativa iOS (Capacitor WKWebView)

---

## 1. EXECUTIVE SUMMARY

Implementata la **versione minima** del M1SSION DAILY CONTROL LOOP™: stato giornaliero unificato (Commit, Streak, Missione del giorno), checklist 0/3 → 3/3 sulla Home, bonus M1U al completamento 3/3 (claim client-side con persistenza in `localStorage`), e gerarchia/CTA coerenti. Nessuna modifica a login, IAP, BUZZ, push, Supabase fuori scope, routing, Xcode o script. Build production completata con successo; sync iOS avviato (verificare completamento in locale).

**Verdetto: GO** (con verifica manuale di `npm run cap:ios:incremental` se non già completato).

---

## 2. FILE TOCCATI

| File | Tipo modifica |
|------|----------------|
| `src/hooks/useTodayDailyState.ts` | **Nuovo** — hook stato daily unificato |
| `src/components/home/DailyControlLoopCard.tsx` | **Nuovo** — card checklist + claim bonus |
| `src/pages/AppHome.tsx` | Import + inserimento blocco Daily + id scroll |
| `src/locales/it/common.json` | Aggiunte chiavi i18n daily control loop |
| `src/locales/en/common.json` | Aggiunte chiavi i18n daily control loop |
| `src/locales/fr/common.json` | Aggiunte chiavi i18n daily control loop |

**Nessun file modificato:** Commit, Streak, Daily Mission V2, BUZZ, notifiche, IAP, auth, Supabase RPC esistenti (eccetto uso di `check_commit_ritual_status` e `admin_credit_m1u` dal client, già usati altrove).

---

## 3. STATO UNIFICATO IMPLEMENTATO

- **commit_done:** da `supabase.rpc('check_commit_ritual_status')` → `data?.already_done_today === true`
- **streak_done:** da `profiles.last_check_in_date === today` (ISO date)
- **daily_mission_done:** da `useDailyEngineV2()` → `run?.phase === 3 && run?.status === 'completed'` (solo se `DAILY_ENGINE_V2_ENABLED`)
- **daily_completion_count:** somma (0–3) dei tre stati sopra
- **daily_bonus_claimed:** letto da `localStorage` chiave `m1_dcl_bonus_claimed_${userId}_${yyyy-mm-dd}`
- **can_claim_daily_bonus:** `daily_completion_count === 3 && !daily_bonus_claimed`

Refetch: al mount, su focus/visibility della finestra, e dopo claim bonus.

---

## 4. DAILY CHECKLIST IMPLEMENTATA

- **Posizione:** subito sotto la sezione Prize (con pill Streak/Shop/Cashback), sopra i Commit Nodes.
- **Contenuto:** titolo “Le 3 azioni di oggi”, sottotitolo contestuale (es. “Ti manca 1 azione”, “Giornata completata”), badge **current/3**, tre righe:
  - Commit (done / “Vai”)
  - Streak (done / “Vai”)
  - Missione del giorno (done / “Vai”)
- **Stile:** black glass + bordo neon coerente con il blocco Next Action, compatibile iOS.
- **CTA:** “Vai” esegue scroll smooth verso `#home-daily-commit`, `#home-daily-streak`, `#home-daily-mission` (id applicati in `AppHome.tsx`).

---

## 5. BONUS 3/3 IMPLEMENTATO

- **Condizione:** le tre azioni completate (commit, streak, missione) e bonus non ancora riscattato oggi.
- **Comportamento:** bottone “Riscatta bonus” (+10 M1U) chiama `supabase.rpc('admin_credit_m1u', { p_user_id, p_amount: 10, p_source: 'daily_control_loop_bonus' })`, poi imposta `localStorage` e aggiorna lo stato (no doppio claim nella stessa giornata lato client).
- **Persistenza “claimed”:** solo client (`localStorage`); nessuna nuova tabella o RPC backend per il claim. Idempotenza lato UI: un solo claim visibile per giorno; eventuale estensione server-side (es. tabella claim + RPC dedicata) può essere aggiunta in una fase successiva.

---

## 6. COME VIENE CALCOLATO COMMIT / STREAK / MISSION DONE

- **Commit:** RPC `check_commit_ritual_status` (stesso usato da `CommitModal`); `already_done_today === true` → done.
- **Streak:** lettura da `profiles` (`last_check_in_date`); uguale a `today` (ISO) → done.
- **Missione:** da `useDailyEngineV2()` → tabella `daily_mission_runs` per il giorno/missione corrente; `phase === 3` e `status === 'completed'` → done.

---

## 7. EVENTUALI MODIFICHE BACKEND MINIME

**Nessuna.** Nessuna nuova migration, nessuna nuova RPC, nessuna modifica a tabelle o funzioni Supabase. Utilizzati solo:

- `check_commit_ritual_status` (già esistente)
- `admin_credit_m1u` (già usato da Streak/altri flussi)
- lettura da `profiles` e da `daily_mission_runs` (già usate da altri componenti).

---

## 8. RISCHI / REGRESSIONI

- **Bonus 3/3:** la persistenza “già riscattato oggi” è solo in `localStorage`; in caso di cancellazione dati del browser/app l’utente potrebbe vedere di nuovo il bottone. Il backend (`admin_credit_m1u`) non impedisce una seconda chiamata; per evitare doppi accrediti in futuro si può introdurre una RPC/tabella dedicata (fase successiva).
- **Commit/Streak/Mission:** nessuna modifica alla logica esistente; solo lettura e aggregazione in un nuovo hook e in una nuova card.
- **Home:** inserimento di un solo blocco e tre `id` per lo scroll; layout e sezioni esistenti (PrizeVision, BUZZ, Shop, Cashback, Command Center) non toccati.

---

## 9. ESITO BUILD

- **Comando:** `npm run build`
- **Esito:** **OK** (✓ built in 2m 52s — da log terminale 809046). Nessun errore TypeScript/lint sui file modificati.

---

## 10. ESITO SYNC IOS

- **Comando:** `npm run cap:ios:incremental` (esegue `npm run build` + `npm run ios:sync:incremental` + `npx cap update ios`).
- **Esito:** script avviato; esecuzione inviata in background. **Verificare in locale** che il comando termini senza errori prima di aprire Xcode.

---

## 11. COMANDI DA USARE D’ORA IN POI

Per build e sync iOS (workflow locale):

```bash
npm run build
npm run cap:ios:incremental
```

**Non usare:** `npx cap sync ios` / `npm run cap:sync:ios` (come da specifica).

---

## 12. GO / NO GO

**GO.** Fase 1 versione minima implementata senza regressioni intenzionali, con stato unificato, checklist, bonus 3/3 (M1U + localStorage), gerarchia e CTA coerenti. Consigliata verifica manuale su dispositivo/simulatore iOS dopo `cap:ios:incremental` e un rapido smoke su Commit, Streak e Missione del giorno.

---

*Fine report.*
