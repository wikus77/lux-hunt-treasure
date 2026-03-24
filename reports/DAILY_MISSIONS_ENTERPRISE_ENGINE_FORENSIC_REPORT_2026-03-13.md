# DAILY MISSIONS — VERIFICA COMPLETA E FATTIBILITÀ ENTERPRISE “NEW DAILY MISSION ENGINE”

**Data:** 2026-03-13  
**Prodotto:** M1SSION™ (iOS Capacitor WKWebView)  
**Modalità:** READ-ONLY — nessuna modifica, nessuna patch, nessun refactor  
**Riferimenti:** DAILY_MISSIONS_AUDIT.md, forensics/DAILY_MISSIONS_AUDIT_REPORT.md, INCIDENT_DAILY_MISSION_2_READINESS.md

---

# 1. EXECUTIVE SUMMARY

- **Valutazione secca:** Il sistema Daily Missions attuale è **ibrido e incoerente**: una parte è solo client (localStorage, ~28 missioni legacy), un’altra è server-real per **solo 3 missioni** (cipher_drill, word_duel, signal_pattern) con tabelle `daily_mission_runs` / `daily_mission_claims` e Edge `claim-daily-phase`. La qualità complessiva **non** è enterprise; retention e percezione sono **sotto** lo standard Royal Match / top-tier mobile.
- **Conviene procedere con il nuovo engine?** **Sì**, a patto di farlo in modo **incrementale e non distruttivo**: il nuovo Daily Mission Engine va **affiancato** (o sostituito in blocco con feature flag), non “rattoppato” sul vecchio.
- **Conviene nascondere il sistema attuale?** **Sì, come fase 0**: nascondere le Daily (MISSIONS_ENABLED = false o hide UI) riduce rumore e rischio mentre si progetta e si rilascia il nuovo engine; lo stato localStorage e le 3 missioni server-real restano intatti per eventuale rollback.
- **Giudizio sul codice attuale:** **Medio-basso**. Punti solidi: Edge claim-daily-phase (idempotenza, CASCADE delete, M1U reale), schema runs/claims, StreakModal + profiles (streak/check-in già server-side). Punti deboli: doppio flusso (client vs server-real), 28 missioni solo client con reward in localStorage, nessun timer 00:00–23:59, nessuno streak missioni, nessun template settimanale (Lun=Intelligence, ecc.), PE DAILY_MISSION definito ma **mai chiamato** al completamento.
- **Fattibilità nuovo engine:** **Alta**, se si accetta un percorso a fasi (nascondere → progettare → MVP server-side → template 7 giorni → escalation/reward/sunday/intel/badge/agent status). Il rischio principale è **regressioni su login, delete account, IAP, BUZZ, BUZZ MAP, push**: vanno mantenuti paletti FROZEN e zero modifiche a quei flussi.

---

# 2. INVENTARIO STATO ATTUALE

## 2.1 File coinvolti (Daily Missions)

| Path | Ruolo |
|------|--------|
| `src/missions/missionsRegistry.ts` | MISSIONS_REGISTRY (~28+ missioni), getMissionOfTheDay(), calculatePhaseRewards(), validateInput(), MISSIONS_ENABLED, MISSIONS_REWARD_SAFE_MODE |
| `src/missions/missionState.ts` | getMissionState(), startMission(), completePhase1/2(), isPhase2Available(), getTodayKey(); localStorage `m1_daily_missions_*` |
| `src/missions/missionEngine.ts` | getEngineState(), handlePhase1Complete(), handlePhase2Complete(); usa creditM1USafe (client) |
| `src/missions/rewards/creditM1U.ts` | creditM1USafe(), getPendingCredits(); SAFE_MODE → solo localStorage |
| `src/missions/useMissionOfTheDay.ts` | Hook: fetchDailyMissionToday() + cache + fallback deterministico (epochDay % cycle) |
| `src/missions/serverReal/dailyMissionToday.ts` | Client per Edge `daily-mission-today` (day_key + mission_id) |
| `src/missions/serverReal/claimDailyPhase.ts` | Client per Edge `claim-daily-phase` (start_phase1, complete_phase1, start_phase2, complete_phase2) |
| `src/missions/DailyMissionsController.tsx` | Controller: Briefing / Phase2Resume / Actions / Completion (gated da micro-missions) |
| `src/missions/ui/MissionPill.tsx` | Pill su Map/Home; modale inline; stato da missionState + creditM1USafe |
| `src/missions/ui/MissionBriefingModal.tsx` | Modal briefing, Start / Dismiss |
| `src/missions/ui/MissionActionsModal.tsx` | Phase 1 (input/confirm/counter) |
| `src/missions/ui/Phase2ResumeModal.tsx` | Phase 2 + Remind later |
| `src/missions/ui/MissionCompletionModal.tsx` | Completamento + reward |
| `src/missions/ui/CipherDrillModal.tsx` | Server-real: usa claimDailyPhase (cipher_drill_anagram_v1) |
| `src/missions/ui/WordDuelMemoryModal.tsx` | Server-real: claimDailyPhase (word_duel_memory_v1) |
| `src/missions/ui/SignalPatternNumbersModal.tsx` | Server-real: claimDailyPhase (signal_pattern_numbers_v1) |
| `src/components/feedback/DailyMissionCard.tsx` | Card Home; useMissionOfTheDay; missionState + creditM1USafe (client) |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto modal daily (Next Action flow) |
| `src/components/feedback/DailyMissionFlipOverlay.tsx` | Overlay fullscreen |
| `src/components/feedback/NextActionContainer.tsx` | Container Next Action; decide se mostrare card Daily |
| `src/components/feedback/NextActionContent.tsx` | Card Daily Mission + handleDailyMissionClick |

## 2.2 Edge Functions e DB

| Elemento | Ruolo |
|----------|--------|
| `supabase/functions/daily-mission-today/index.ts` | Read-only: day_key UTC, mission_id (MISSION_CYCLE 18 ids), epochDay % length |
| `supabase/functions/claim-daily-phase/index.ts` | start_phase1, complete_phase1, start_phase2, complete_phase2; solo mission_id in {cipher_drill_anagram_v1, word_duel_memory_v1, signal_pattern_numbers_v1}; scrive daily_mission_runs + daily_mission_claims; admin_credit_m1u |
| `supabase/migrations/20260303110000_daily_mission_runs_claims.sql` | daily_mission_runs (user_id, day_key, mission_id, phase, progress_json, status…), daily_mission_claims (idempotency_key, amount_m1u); RLS: SELECT owner, INSERT/UPDATE/DELETE solo service_role; ON DELETE CASCADE auth.users |

## 2.3 Streak / Check-in (separato dalle Daily)

| Path | Ruolo |
|------|--------|
| `src/components/gamification/StreakModal.tsx` | Modal streak; profiles current_streak_days, longest_streak_days, last_check_in_date; awardPE('DAILY_LOGIN'); admin_credit_m1u / fallback update m1_units |
| `src/components/gamification/StreakPill.tsx` | Pill che apre StreakModal |
| `src/components/gamification/StreakWidget.tsx` | Widget alternativo streak/check-in |
| `supabase/functions/handle-daily-checkin/index.ts` | Edge check-in (se usata) |
| `profiles` | current_streak_days, longest_streak_days, last_check_in_date |
| Migrations | 20251004081340 (streak columns), 20251130_streak_badges_system.sql (trigger_check_streak_badges, award_streak_badge) |

## 2.4 PE / M1U

| Elemento | Note |
|----------|------|
| `useAwardPE.ts` | PEActionType 'DAILY_MISSION' (50 PE, limit 1/giorno); **non riscontrata alcuna chiamata awardPE('DAILY_MISSION')** al completamento daily nel codebase |
| `peCreditEvent.ts` | 'daily_mission' come tipo evento; overlay PE globale |
| M1U daily | creditM1USafe (client) per legacy; claim-daily-phase → admin_credit_m1u per le 3 missioni server-real |

## 2.5 Avatar / Home / Badge

| Path | Note |
|------|------|
| `MainLayout.tsx` | Avatar in header con classe `profile-custom-ring` (solo wrapper span); nessun “badge ring” missioni |
| `HomeHeader.tsx` | ProfileDropdown + ProfileAvatar; nessun ring badge |
| `ProfileInfo.tsx` | Ring colore subscription (getSubscriptionRingColor); nessun rank badge missioni |
| `ProfilePage.tsx` | Avatar con ring-2 ring-[#00D1FF]; nessun badge 10/30/60/100 missioni |

## 2.6 Logiche esistenti (sintesi)

- **Missione del giorno:** client: getMissionOfTheDay() (fallback da day_key locale o VITE_FORCE_DAILY_MISSION); server: daily-mission-today (UTC day_key, cycle 18).
- **Stato:** client: localStorage (phase 0–3, day_key, phase1_completed_at, credited_phase1/2); server: solo per le 3 missioni in daily_mission_runs.
- **Reset “giorno”:** client: getTodayKey() = ISO date locale; server: getDayKeyUtc() in Edge.
- **Reward:** client: creditM1USafe → localStorage (pending); server: claim-daily-phase → daily_mission_claims + admin_credit_m1u.
- **Streak:** già server (profiles); **nessuno** “streak missioni daily” (giorni consecutivi di completamento).

---

# 3. ANALISI TECNICA DELLE DAILY ATTUALI

## 3.1 Come funzionano oggi

1. **Assegnazione:** useMissionOfTheDay() chiama daily-mission-today → mission_id + day_key; fallback: getMissionOfTheDay() da missionsRegistry (epochDay % cycle). Per le **3 missioni server-real** (Cipher, Word Duel, Signal Pattern) l’UI usa i modal dedicati e claimDailyPhase(); per tutte le altre l’UI usa missionState (localStorage) + creditM1USafe.
2. **Fasi:** Phase 0 → Start → Phase 1 (oggi) → Complete P1 → Phase 2 (pending; “domani”) → giorno dopo Phase 2 ready → Complete P2 → Phase 3. Il “domani” è determinato da isNewDay() (confronto day_key in locale) o in Edge da yesterdayKey (UTC).
3. **Validazione:** client: validateInput() / counter in progressData; server: solo per le 3 missioni (risposta anagram, parole memorizzate, numero pattern).
4. **Reward:** Legacy: M1U in localStorage (SAFE_MODE). Server-real: M1U reali via admin_credit_m1u, idempotenza da daily_mission_claims.

## 3.2 Limiti reali

- **Doppio binario:** 3 missioni server-real vs ~28 solo client; stessa “missione del giorno” può essere una delle 3 (con stato e reward server) o una legacy (tutto in locale). Confusione e incoerenza.
- **Nessun timer 00:00–23:59:** nessuna scadenza visibile; Phase 2 si sblocca “il giorno dopo” ma senza countdown né perdita esplicita di streak missioni.
- **Nessuno streak “daily mission”:** lo streak esistente è solo check-in (StreakModal), non “hai completato N giorni di fila la daily”.
- **Reward escalation assente:** nessun aumento reward per streak o per giorno della settimana.
- **PE DAILY_MISSION non usato:** definito in useAwardPE (50 PE, 1/giorno) ma nessuna chiamata al complete della daily.
- **Template settimanali assenti:** nessun “Lunedì = Intelligence”, “Domenica = Speciale”; ciclo piatto (epochDay % N).
- **Intel fragments / Intel file / Rank badges / Agent status / Weekly tracker:** assenti.
- **Near miss / Sunday super reward / Finestra 60s indizio:** assenti.
- **Timezone:** server UTC; client locale; rischio incoerenza per utenti in fusi diversi (es. “domani” client vs “ieri” server).
- **Anti-cheat:** solo lato Edge per le 3 missioni (idempotenza claim); niente per le legacy (manipolazione localStorage / clock).

## 3.3 Punti riutilizzabili

- **Schema DB:** daily_mission_runs, daily_mission_claims già adatti a “una run per user/day/mission”, claim idempotenti; CASCADE su delete account.
- **Edge claim-daily-phase:** pattern idempotenza, day_key UTC, admin_credit_m1u; estendibile ad altre mission_id o a “template” (con nuovi campi o nuova tabella).
- **Edge daily-mission-today:** fornisce day_key + mission_id; può essere esteso a “template_id” o “mission_type” per i 7 giorni.
- **Streak check-in:** profiles + StreakModal; logica “giorni consecutivi” e milestone M1U già presenti; riutilizzabile come riferimento per “streak missioni”.
- **useMissionOfTheDay:** cache + server + fallback; utile per qualsiasi “missione del giorno” server-driven.
- **UI:** MissionPill, DailyMissionCard, modali (Briefing, Actions, Phase2Resume, Completion); riutilizzabili come layout; contenuto da adattare al nuovo modello (template + varianti).

## 3.4 Punti da scartare / da non estendere

- **creditM1USafe + MISSIONS_REWARD_SAFE_MODE** per reward “reali”: non portare avanti; tutti i reward devono passare da Edge + daily_mission_claims (o equivalente) e admin_credit_m1u.
- **Stato solo localStorage** per fase/completamento: per il nuovo engine tutto deve essere su server (runs) o almeno ibrido con server come source of truth.
- **getMissionOfTheDay() puro client** (senza server): mantenere solo come fallback di emergenza; source of truth deve essere server (daily-mission-today o nuovo endpoint).
- **28 missioni hardcoded** come unico catalogo: il target è 7 template con varianti; il registry attuale può restare per compatibilità ma non come base del nuovo design.

---

# 4. GAP ANALYSIS RISPETTO AL TARGET

| Requisito target | Stato attuale | Gap |
|------------------|---------------|-----|
| 7 template (Intelligence, Skill, Field, Orientation, Time, Strategic, Sunday special) | Ciclo piatto per mission_id; nessun mapping giorno → tipo | Nuovo modello dati (template_id / type) e logica server “giorno settimana → template”; varianti generate da template |
| Tempo limite per missione (00:00–23:59) | Nessun timer; solo “phase 2 domani” | day_key server come finestra; UI countdown; reset streak se non completato in giornata |
| Tentativi per missione | Solo Signal Pattern ha “win/fail”; altri no | Definire max_attempts per template; tracciare in runs |
| Feedback (es. near miss) | Assente | Logica “near miss” per template (es. soglia %) + i18n IT/EN/FR |
| Reward (+5 M1U, +8 PE, ecc.) | M1U via claim; PE DAILY_MISSION non chiamato | Chiamare awardPE('DAILY_MISSION') al claim; reward configurabili per template/giorno |
| Streak progressiva missioni | Assente | Nuovo campo o tabella (es. daily_mission_streak: user_id, current_streak, last_completed_day_key); calcolo server |
| Reward escalation | Assente | Regole per streak (es. +N M1U ogni 7 giorni) o per giorno settimana; in Edge o config |
| Rischio perdita (streak, super reward) | Solo concettuale | Implementare “completato entro 23:59 UTC” e perdita streak se saltato |
| Sunday Super Reward (indizio 60s, modale full-screen) | Assente | Nuova feature: modale full-screen, timer 60s, persistenza “already_shown” server, i18n |
| Daily Mission Timer (00:00 → 23:59) | day_key esiste ma non “scadenza” UI | Server: day_key come finestra; client: countdown a fine giornata (UTC o locale da definire) |
| Near miss (“Mission failed. You were very close…”) | Assente | Soglie per template; calcolo client o server; chiavi i18n |
| Intel fragments (3/10 → Intel file unlocked) | Assente | Schema: intel_fragments / intel_files; progressione per completamenti; UI hooks da creare |
| Rank badges (10/30/60/100 → bronze/silver/gold/elite) | Assente | Tabella o colonna badges; conteggio completamenti totali; UI “ring” attorno avatar in Home |
| Daily visual feedback (Mon–Sun ●○○) | Assente | Componente settimanale; stato da runs (completed per day_key); dove mettere: home o modulo daily |
| Agent status (ACTIVE se settimana piena, altrimenti INACTIVE) | Assente | Derivato da runs (tutti e 7 giorni completati) o campo cached; dove mostrare: home / profilo |

---

# 5. ARCHITETTURA CONSIGLIATA

## 5.1 Source of truth

- **Day/window:** Server (UTC) come unica source per “giorno” e per reset: `day_key = YYYY-MM-DD` da Edge/DB. Client può mostrare countdown a “fine giornata UTC” (o locale se si introduce timezone profilo).
- **Missione del giorno / template:** Server: endpoint (o estensione daily-mission-today) che restituisce `template_id` + eventuale `variant_id` in base a giorno della settimana (e opzionale epochDay per varianti). Client: usa questo + definizioni template (parametri, reward, tentativi).
- **Stato run (start, complete, fail):** Solo server: `daily_mission_runs` (e eventuale estensione campi). Niente stato “fase” critico solo in localStorage.
- **Streak missioni:** Server: nuovo campo `profiles.daily_mission_streak_days` + `last_daily_mission_day_key` oppure tabella `daily_mission_streaks`; aggiornato in Edge al completamento valido; reset se giorno saltato.
- **Claim reward:** Solo server: `daily_mission_claims` (idempotency_key) + admin_credit_m1u; idem per PE (award_pulse_energy / RPC esistente).

## 5.2 Client

- **Ruolo:** UI, countdown, invio azioni (start/complete) verso Edge; lettura stato da runs (e da nuovo endpoint “daily status” che aggrega streak, settimana, badge). Nessuna logica di “chi ha vinto” o reward: solo chiamate Edge e refresh stato.
- **Nascondere vecchie daily:** MISSIONS_ENABLED = false oppure feature flag “new_daily_engine” che nasconde card/pill legacy e mostra solo nuovo flusso.

## 5.3 Server (Supabase)

- **Tabelle:** Mantenere `daily_mission_runs` e `daily_mission_claims`; eventuale estensione runs con `template_id`, `attempts_used`, `result` (win/near_miss/fail). Nuove tabelle se necessario: `daily_mission_templates` (config), `intel_fragments` / `intel_files`, `user_mission_badges` (o colonna profiles).
- **RLS:** Invariato: SELECT per owner; INSERT/UPDATE runs e claims solo da Edge (service_role).

## 5.4 Edge Functions

- **daily-mission-today (esteso):** Restituire oltre a day_key e mission_id anche `template_id`, `day_of_week`, parametri variante (es. tentativi, reward M1U/PE). Opzione: nuova funzione `get-daily-mission-config`.
- **claim-daily-phase (o nuova claim-daily):** Validare finestra (day_key), tentativi, esito (win/near_miss/fail); aggiornare streak; scrivere claim idempotente; chiamare admin_credit_m1u e award_pulse_energy (DAILY_MISSION); eventuale “sunday super reward” (flag o tabella “sunday_clue_shown”).
- **Sunday clue:** Endpoint o logica in claim: se day_key è domenica e completamento OK, registrare “sunday_clue_available” con scadenza 60s da first_open; client mostra modale e dopo 60s segna “shown”.

## 5.5 Reset daily, streak, reward escalation

- **Reset:** Ogni mezzanotte UTC nuovo day_key; run della giornata precedente “chiusi” (già gestiti da phase/completed_at). Streak si resetta se l’utente non ha completato il giorno precedente (last_daily_mission_day_key != yesterday).
- **Reward escalation:** In Edge, in base a `daily_mission_streak_days` o a giorno settimana (es. domenica = 2x M1U); lettura da config o da costanti.

## 5.6 Intel fragments, badges, weekly tracker, agent status

- **Intel:** Tabella `intel_fragments` (user_id, fragment_index, unlocked_at); `intel_files` (file_id, required_fragments[]). Al completamento daily: sblocco fragment N; se N raggiunge soglia per un file → sblocco file (indizio/lore). UI: nuovo componente “Intel 3/10” e modale file.
- **Badges:** Colonna `profiles.daily_mission_rank_badge` (bronze/silver/gold/elite) oppure tabella `user_badges`; calcolo da conteggio totale completamenti (SELECT count da runs completed). UI: ring attorno avatar in Home (ProfileDropdown / ProfileAvatar): componente “BadgeRing” che legge badge e applica classe/stile.
- **Weekly tracker:** Query runs per user e day_key in settimana corrente (Mon–Sun UTC); componente “Mon Tue Wed …” con pallini pieni/vuoti; stato da API “weekly_status” o da runs.
- **Agent status:** Derivato: “ACTIVE” se tutti i 7 giorni della settimana hanno run completed; altrimenti “INACTIVE”. Calcolo in Edge o in client da weekly_status; mostrare in home o nel modulo daily.

---

# 6. RISCHI

## 6.1 Tecnici

- **Regressioni:** Qualsiasi modifica a flussi condivisi (auth, profilo, M1U, PE) può impattare login, delete account, IAP, BUZZ, BUZZ MAP, push. **Mitigazione:** nessuna modifica diretta a quei flussi; solo chiamate additive (admin_credit_m1u, award_pulse_energy con stesso contratto).
- **Doppio stato (client vs server):** Se si mantiene temporaneamente il vecchio sistema “nascosto”, evitare che due fonti (localStorage e runs) siano usate insieme per la stessa missione; feature flag netto (solo nuovo O solo vecchio).
- **Edge e cold start:** Aggiungere logica in Edge aumenta tempo di risposta; idempotenza e cache lato client (es. “already claimed today”) riducono chiamate ripetute.

## 6.2 UX

- **Clutter:** Badge ring + weekly tracker + agent status + modale domenica: rischio sovraccarico. **Mitigazione:** inserimento progressivo; A/B su posizione (es. badge solo in home, tracker nel modulo daily).
- **Frustrazione “near miss”:** Messaggio deve essere chiaro e non punitivo; i18n IT/EN/FR obbligatorio.

## 6.3 Sicurezza e anti-cheat

- **Timezone / clock spoof:** Server UTC come unica reference per day_key e per “oggi”; client non deve poter forzare day_key. Replay: idempotency_key già evita doppio claim.
- **Multi-device:** Stesso user da due device: una run per (user_id, day_key, mission_id); comportamento corretto. Claim già idempotente.
- **Duplicate claim:** Gestito da daily_mission_claims + idempotency_key.

## 6.4 Performance e i18n

- **Query aggiuntive:** weekly_status, streak, badge: possibili endpoint aggregati per limitare round-trip.
- **i18n:** Tutte le nuove stringhe (near miss, sunday clue, agent status, badge names) in IT/EN/FR; nessuna stringa hardcoded in UI.

---

# 7. FASI DI IMPLEMENTAZIONE

## Fase 0 — Nascondere e stabilizzare (1–2 giorni)

- Impostare `MISSIONS_ENABLED = false` oppure feature flag che nasconde solo la UI daily (card, pill, Next Action daily) senza toccare DB/Edge. Verificare che login, IAP, BUZZ, BUZZ MAP, push, delete account restino invariati. Documentare rollback (ripristino flag).

## Fase 1 — MVP nuovo engine (2–3 settimane)

- Estendere `daily-mission-today` (o nuovo endpoint) con `template_id` + giorno settimana; definire 1–2 template (es. “Intelligence”, “Skill”) con parametri (tentativi, reward M1U/PE).
- Estendere `claim-daily-phase` (o nuova Edge) per accettare template_id, validare finestra e tentativi, aggiornare runs/claims, chiamare admin_credit_m1u e awardPE('DAILY_MISSION').
- Client: un solo flusso UI (card + modale) che usa solo server (stato da runs, niente localStorage per fase). Timer visivo “scade alle 23:59 UTC” (o copy “Nuova missione a mezzanotte”).

## Fase 2 — Streak e reward escalation (1–2 settimane)

- Schema: streak missioni (profiles o tabella); calcolo in Edge al completamento; reset se giorno saltato.
- Reward escalation (es. +N M1U ogni 7 giorni consecutivi) in Edge. Integrare PE DAILY_MISSION nel claim.

## Fase 3 — Template 7 giorni + Sunday + Near miss (2–3 settimane)

- Mappatura Lun→Intelligence, Mar→Skill, …, Dom→Speciale. Sunday Super Reward: modale full-screen, 60s, persistenza “shown” server-side. Near miss: soglie per template + messaggio i18n.

## Fase 4 — Intel fragments, badges, weekly tracker, agent status (2–3 settimane)

- Tabelle e logica intel fragments/files; UI “3/10 fragments” e sblocco file. Badge (10/30/60/100) e ring attorno avatar in Home. Weekly tracker (Mon–Sun) e Agent status ACTIVE/INACTIVE.

---

# 8. TEMPI E PROBABILITÀ DI SUCCESSO

- **Stima tempi:** Fase 0: 1–2 gg. Fase 1: 2–3 settimane. Fase 2: 1–2 settimane. Fase 3: 2–3 settimane. Fase 4: 2–3 settimane. **Totale MVP (fino a Fase 2):** ~5–7 settimane. **Totale “enterprise” (fino a Fase 4):** ~10–13 settimane.
- **Complessità:** Fase 1 media; Fase 2 media; Fase 3 media-alta (sunday + near miss); Fase 4 alta (nuove tabelle, più UI).
- **Probabilità di riuscita:** **Alta** per Fasi 0–2 se si rispettano i paletti FROZEN e si evita di toccare login/delete/IAP/BUZZ/BUZZ MAP/push. **Media-alta** per Fasi 3–4 (maggiore superficie e rischio UX).
- **Cosa serve per massima resa:** Product/UX chiaro su copy e posizionamento (badge, tracker, agent status); i18n IT/EN/FR da subito; test su dispositivo iOS reale (Capacitor WKWebView) per modali e timer.

---

# 9. VERDETTO FINALE

## GO WITH CONDITIONS

- **Procedere** con il nuovo Daily Mission Engine è **consigliato**, a condizione di:
  1. **Fase 0 obbligatoria:** nascondere le Daily attuali (flag o MISSIONS_ENABLED) senza eliminare codice/DB, per evitare confusione e regressioni durante lo sviluppo.
  2. **Source of truth server:** giorno, stato run, claim, streak e reward devono dipendere solo da Supabase/Edge; niente logica critica solo in localStorage.
  3. **Zero modifiche ai flussi FROZEN:** login, logout, delete account, IAP, BUZZ, BUZZ MAP, push non devono essere toccati; solo integrazioni additive (crediti M1U/PE, lettura profilo).
  4. **Percorso a fasi:** MVP (template + timer + claim server + PE) → streak ed escalation → 7 giorni + Sunday + near miss → intel/badge/tracker/agent status. Non tentare tutto in un unico rilascio.
  5. **i18n e timezone:** Tutte le stringhe utente in IT/EN/FR; giorno/reset in UTC lato server; documentare scelta “fine giornata” (UTC vs locale) per utenti.

**Motivazione:** Il sistema attuale non è né enterprise né allineato al target (template 7 giorni, streak, reward escalation, sunday clue, intel, badge, agent status). Parte dell’infrastruttura (runs, claims, Edge, streak check-in) è riutilizzabile; il resto va progettato ex novo e rilasciato in modo incrementale per contenere il rischio e mantenere la qualità “Royal Match / enterprise mobile”.

---

*Report read-only; nessuna modifica applicata a codice, DB, Edge o configurazioni.*
