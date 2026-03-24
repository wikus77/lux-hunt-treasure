# M1SSION DAILY CONTROL LOOP™ — Audit strategico e blueprint AAA+ (read-only)

**Data:** 2026-03-19  
**Tipo:** 100% read-only — forensics, gap analysis, blueprint esecutivo. Nessuna modifica al codice.  
**Scope:** App nativa wrappata iOS (Capacitor WKWebView)  
**Obiettivo:** Verifica tecnica, UX e architetturale completa per trasformare il DCL in sistema enterprise/AAA+ (Royal Match–grade).

---

# 1. Executive summary

## Stato reale del DCL oggi

Il Daily Control Loop™ **esiste ed è funzionante** a livello di dati e logica: card in Home, stato 0/3–3/3 derivato da Commit, Streak e Daily Mission V2, CTA contestuali, bonus 3/3 (RPC + tabella claim), weekly X/7, messaggi dinamici, reminder serale (19:45), copy M1U/BUZZ, SectionErrorBoundary, fallback safe. **Però** è ancora percepito come **checklist evoluta**, non come “cuore di gioco”: aggiornamento non in tempo reale dopo le azioni, CTA che fanno solo scroll (non aprono modali), nessuna cerimonia di completamento, payoff ridotto a toast, nessun evento che ricolleghi la card al completamento di Commit/Streak/Mission.

## Cosa è già forte

- **Stato unificato** (useTodayDailyState): commit_done, streak_done, daily_mission_done, count, bonus_claimed, weeklyClaimCount; fonti server (RPC commit, profiles, daily_mission_runs) + fallback localStorage per bonus.
- **Backend solido**: migration con tabella `daily_control_loop_bonus_claims`, RPC `claim_daily_control_loop_bonus`, `get_daily_control_loop_bonus_claimed`, `get_daily_control_loop_weekly_progress`; validazione 3/3 lato server; reward 10 M1U.
- **Copy e gerarchia**: sottotitoli dinamici (0/3 → 3/3, bonus disponibile/riscattato), CTA contestuali (“Inizia con il Commit”, “Conferma la tua presenza”, “Chiudi la giornata con la missione”), messaggi M1U/BUZZ in base al saldo.
- **Resilienza**: try/catch su reminder e RPC, SectionErrorBoundary sulla card, ordine dichiarazioni hook corretto; card non dipende dalla migration per renderizzare (degradazione graceful).

## Cosa manca davvero

- **Realtime percepito**: la card non si aggiorna subito dopo Commit/Streak/Mission; aggiorna solo su mount, visibility/focus (e solo commit+streak), o dopo claim bonus. Manca ascolto di eventi tipo `commit-done`, `streak-updated`, `daily-mission-completed` per chiamare `refetch()`.
- **Profondità CTA**: le CTA fanno solo `scrollIntoView` verso le sezioni; non aprono CommitModal, StreakModal o NextAction overlay. L’utente deve scrollare e poi cliccare un secondo elemento.
- **Cerimonia e payoff**: nessuna animazione di progressione (0/3→1/3→2/3→3/3), nessun overlay “Giornata completata” o “+10 M1U” in stile StreakModal/ClaimRewardModal; solo toast e testo statico.
- **Game-feel**: nessuna micro-animazione sulla card (pulse sulla riga “next”, glow al 2/3, celebrazione al 3/3), nessun suono/haptic dedicato al completamento daily.
- **Weekly “vero”**: X/7 è solo conteggio e copy; nessuna reward 7/7, nessuna tensione settimanale (barra, countdown, chest domenicale legata al DCL).

## Giudizio sintetico

Il DCL è **architetturalmente pronto** (stato, backend, copy) ma **UX e percezione sono ancora da checklist**: non è “vivo”, non è celebrativo, non guida con un tap al flow giusto. Per portarlo a livello AAA+ servono: (1) aggiornamento event-driven + (2) CTA che aprono i flow (modali/overlay) + (3) animazioni e cerimonia di completamento + (4) payoff visivo forte (overlay/template riusati). **Sì, si può ottenere il risultato senza rifare l’app**: il gap è soprattutto orchestrazione frontend, eventi e riuso di pattern già presenti.

---

# 2. Inventario tecnico reale

## File coinvolti

| File | Ruolo |
|------|--------|
| `src/components/home/DailyControlLoopCard.tsx` | Card UI: titolo, sottotitolo, X/3, 3 righe (Commit/Streak/Mission), bonus claim, weekly, messaggio M1U/BUZZ. CTA → scroll. |
| `src/hooks/useTodayDailyState.ts` | Stato unificato: fetch commit (RPC), profile (streak), bonus claimed (RPC + fallback localStorage), weekly (RPC). refetch su mount, visibility/focus solo commit+streak. |
| `src/hooks/useDailyControlLoopReminder.ts` | persistDclReminderState(count), scheduleDclEveningReminder(count): localStorage + setTimeout + Web Notification 19:45. Fail-safe try/catch. |
| `src/pages/AppHome.tsx` | Monta `<SectionErrorBoundary section="DailyControlLoop"><DailyControlLoopCard /></SectionErrorBoundary>` tra Prize e Commit nodes. |
| `supabase/migrations/20260318120000_daily_control_loop_bonus_claim.sql` | Tabella `daily_control_loop_bonus_claims`, RPC claim/get_claimed/get_weekly_progress. |

## Hook e dipendenze

- **useTodayDailyState**: useUnifiedAuth, useDailyEngineV2 (run, refetchDailyMission), supabase (check_commit_ritual_status, profiles, get_daily_control_loop_bonus_claimed, get_daily_control_loop_weekly_progress).
- **DailyControlLoopCard**: useTodayDailyState, useUnifiedAuth, useM1UnitsRealtime(user?.id), useTranslation, persistDclReminderState, scheduleDclEveningReminder, supabase (claim_daily_control_loop_bonus).
- **Refresh**: mount (tutti i fetch); visibilitychange/focus (solo fetchCommitAndStreak); refetch manuale dopo claim bonus. **Nessun listener** per commit/streak/mission completed.

## RPC e backend

- **check_commit_ritual_status**: esistente; usato per commit_done.
- **profiles.last_check_in_date**: usato per streak_done (today).
- **daily_mission_runs** (day_key, phase=3, status=completed): usato per daily_mission_done (via useDailyEngineV2.run).
- **get_daily_control_loop_bonus_claimed**, **get_daily_control_loop_weekly_progress**, **claim_daily_control_loop_bonus**: in migration; claim valida 3/3 server-side e accredita 10 M1U.

## Reminder

- **DCL**: un reminder a 19:45 (locale), Web Notification, tag `dcl-reminder`; stato in localStorage; nessun push server.
- **Streak**: useStreakReminder (20:00); stesso pattern localStorage + setTimeout + Notification.
- Limitazione: in app wrapped iOS le Web Notification possono essere limitate (permessi, background); reminder “reali” e affidabili richiederebbero push nativi (fuori scope audit).

## Punti di refresh attuali

- Ingresso su Home (mount) → tutti i fetch.
- visibilitychange / focus → solo fetchCommitAndStreak (non bonus né weekly).
- Click “Riscatta bonus” → refetch completo dopo claim.
- **Mancanti**: dopo chiusura CommitModal (success), dopo check-in StreakModal, dopo completamento Daily Mission (nessun evento globale che la card ascolti).

## CTA e flow

- **Commit**: scroll a `#home-daily-commit`; apertura modal tramite click su CommitNodeTrigger (AION). Stato modal locale in CommitNodesContainer.
- **Streak**: scroll a `#home-daily-streak` (pills); apertura StreakModal tramite StreakPill (showModal). Stato in StreakPill.
- **Mission**: scroll a `#home-daily-mission`; apertura NextActionFlipOverlay tramite click su NextActionContainer. Stato in NextActionContainer.
- Nessun deep-link “apri direttamente Commit/Streak/Mission” dalla card; nessun context/event bus condiviso per “apri modal X”.

---

# 3. Gap analysis AAA+

## Cosa manca rispetto a un sistema premium

| Aspetto | Oggi | Target AAA+ |
|--------|------|-------------|
| **Aggiornamento** | Solo mount + focus + post-claim | Event-driven: dopo ogni azione (commit/streak/mission) la card si aggiorna senza cambiare pagina |
| **Profondità CTA** | Scroll alla sezione; utente clicca un secondo elemento | Un tap dalla card apre il modal/overlay corretto (Commit / Streak / Mission) |
| **Progressione visiva** | Testo X/3 e checkmark statici | Animazione 0/3→1/3→2/3 (barra, pulse, highlight riga “next”), stato attivo chiaro |
| **Completamento 3/3** | Toast + testo “Bonus riscattato” / pulsante claim | Cerimonia breve (overlay/template come StreakModal success), payoff “+10 M1U” visivo, messaggio “Hai completato il tuo ciclo operativo” |
| **Near-completion** | Copy “Manca solo 1 azione” | Messaggio + eventuale glow/pulse sulla riga mancante, tensione visiva |
| **Reward claim** | Pulsante + toast | Overlay success (come ClaimRewardModal SuccessAnimation o StreakModal success) con amount e CTA “Usa per BUZZ” |
| **Weekly** | Testo “Settimana X/7” | Barra o mini-progress, eventuale reward 7/7 e countdown/chest domenica |
| **Ritorno** | Reminder 19:45 (locale) | Stesso + eventuale copy “X ore alla mezzanotte” (opzionale), senza toccare push |

## Cosa manca rispetto a un’esperienza tipo Royal Match

- **Immediatezza**: in Royal Match ogni azione dà feedback immediato (animazione, suono, progress). Nel DCL il feedback è ritardato (bisogna tornare in Home o fare focus).
- **Gerarchia visiva**: la “prossima azione” non è evidenziata (bordo, pulse, icona “quest”); le tre righe sono uguali fino al check.
- **Payoff forte**: nessun fullscreen/overlay “Missione completata” / “Giornata completata” con animazione e reward in primo piano; solo toast e testo in card.
- **Ritmo di sessione**: nessun flusso “card → tap → modal → completa → chiudi → card già aggiornata”; l’utente deve navigare e interpretare.
- **Collegamento al core**: il copy M1U/BUZZ c’è ma non c’è CTA “Vai al BUZZ” o “Usa le M1U” che porti direttamente al flow BUZZ/BUZZ MAP.

## Problemi di profondità, reattività, gerarchia, payoff, retention

- **Profondità**: la card non “reagisce” alle azioni; sembra un riassunto statico.
- **Reattività**: refetch non è legato agli eventi di completamento; dipende da focus/remount.
- **Gerarchia**: nessuna evidenza visiva della “prossima azione da fare” (prima riga non completata in evidenza).
- **Payoff**: claim bonus è funzionale ma non celebrativo; manca un momento “premium” come negli altri modali di successo.
- **Retention**: weekly è solo numero; nessuna reward 7/7 né tensione settimanale (es. barra 7 giorni, chest domenica).

---

# 4. Cosa si può riusare

## Pattern UI

- **Glass / gradient**: card DCL già usa gradient + border cyan + boxShadow; stesso linguaggio di AppHome pills e altri blocchi.
- **SectionErrorBoundary**: già usato; si può riusare per altri blocchi o lasciare solo sulla card.
- **Readability**: textShadow + colori rgba(255,255,255,0.95), cyan; pattern già applicato in card e pills.

## Pattern motion

- **Framer Motion**: già in uso in AppHome (motion, AnimatePresence), StreakModal (success overlay), DailyMissionContent (completion toast), CipherDrillModal, MissionCompletionModal, OnboardingOverlay (CelebrationOverlay), ClaimRewardModal (SuccessAnimation), CelebrationToast, PortalBehaviorOverlay (RewardDisplay). Si può riusare: motion.div con initial/animate/exit, scale 0→1, opacity, y, spring.
- **Success overlay**: StreakModal (createPortal + motion fullscreen + scale 0→1 + reward text), ClaimRewardModal (SuccessAnimation fullscreen con icon + titolo), DailyMissionContent (motion toast “+X M1U”), MissionCompletionModal (scale, icon, rewardAmount). Template ideale per “Giornata completata” / “+10 M1U” DCL.
- **Commit ritual**: CommitModal ha già flusso result/reward e COMMIT BOOM audio; si può estendere o replicare il pattern “success” per il bonus 3/3.

## Pattern reward

- **Toast**: sonner per claim bonus (“+10 M1U”); si può affiancare overlay breve come in DailyMissionContent o StreakModal.
- **M1U in UI**: useM1UnitsRealtime, M1UPill; eventi `m1u-balance-updated` / `m1u-balance-update` (nota: CommitModal emette `m1u-balance-update`, useM1UnitsRealtime ascolta `m1u-balance-updated` — possibile mismatch da verificare in fase implementativa).

## Modali / overlay / launcher

- **CommitModal**: aperto da CommitNodeTrigger (useState isModalOpen). Per “CTA apre Commit”: servirebbe stato condiviso (context/event) o prop/callback da AppHome a CommitNodesContainer/CommitNodeTrigger.
- **StreakModal**: aperto da StreakPill (showModal); StreakPill è in pills in Home. Per “CTA apre Streak”: stesso discorso (context/event o callback da card a pills/StreakPill).
- **NextActionFlipOverlay**: aperto da NextActionContainer (isModalOpen). Per “CTA apre Mission”: callback/context da card a NextActionContainer.
- **MapPillFlipOverlay**: usato in StreakModal; pattern overlay fullscreen riutilizzabile.

## Event mechanisms già presenti

- **CustomEvent**: `m1u-balance-update`, `m1u-balance-updated`, `streak-updated`, `pe:awarded`, `m1u-balance-changed`, `m1u-credited`, `m1uPurchaseSucceeded`, `auth-success`. La card **non** ascolta nessuno di questi per refetch. StreakPill emette `streak-updated` dopo check-in; CommitModal non emette un evento “commit-completed” (solo m1u-balance-update); Daily Mission completion non emette un evento “daily-mission-completed” globale. **Opportunità**: introdurre (o riusare) eventi `dcl-commit-done`, `dcl-streak-done`, `dcl-mission-done` e far ascoltare alla card per chiamare refetch.

---

# 5. Blueprint esecutivo corretto

## Fasi consigliate (4 fasi)

### Fase A — Rendere il DCL vivo e credibile

- **Obiettivo**: aggiornamento percepito in tempo reale e CTA che aprono i flow (modali/overlay).
- **Contenuto**: (1) Eventi custom `dcl-commit-done` / `dcl-streak-done` / `dcl-mission-done` (o riuso di `streak-updated` + estensione Commit/Daily Mission) e listener in DailyControlLoopCard che chiama refetch. (2) Meccanismo “apri Commit/Streak/Mission” dalla card: context o callback da AppHome verso CommitNodeTrigger, StreakPill, NextActionContainer (es. ref o context “openCommitModal”, “openStreakModal”, “openMissionOverlay”) così che la card possa invocare l’apertura al tap su CTA invece dello scroll.
- **Dipendenze**: nessuna nuova RPC; solo frontend (eventi + stato/callback condivisi in AppHome).
- **Rischio**: basso; non si tocca logica Commit/Streak/Mission, solo “chi” apre i modali e “quando” la card refetcha.
- **Impatto**: alto su percezione “sistema vivo” e usabilità (un tap → flow giusto).
- **Frontend/backend**: 100% frontend.

### Fase B — Profondità AAA+ (animazioni, gerarchia, payoff)

- **Obiettivo**: game-feel e cerimonia (progressione visiva, stato attivo, completamento 3/3 celebrativo).
- **Contenuto**: (1) Animazioni sulla card: transizione count 0/3→1/3→2/3→3/3 (es. barra progress o numeri con motion), highlight/pulse sulla prima riga “da fare”, eventuale glow al 2/3. (2) Al 3/3 (e opzionalmente al claim): overlay/template success riusato (Stile StreakModal success o ClaimRewardModal): “Giornata completata” / “Hai completato il tuo ciclo operativo”, “+10 M1U”, CTA “Usa per BUZZ” o chiudi. (3) Haptic/suono al completamento daily (opzionale), riuso buttonClickFeedback o variante.
- **Dipendenze**: Fase A consigliata prima (così l’utente vede subito la card aggiornata dopo ogni azione).
- **Rischio**: basso; solo UI/motion e un overlay in più; logica claim invariata.
- **Impatto**: alto su percezione “premium” e soddisfazione.
- **Frontend/backend**: 100% frontend.

### Fase C — Spina dorsale (weekly, reminder, collegamento M1U/BUZZ)

- **Obiettivo**: weekly “vero”, reminder robusti, DCL come cuore percepito del ritorno giornaliero.
- **Contenuto**: (1) Weekly: barra o mini-progress 7/7; eventuale reward 7/7 (nuova RPC + migration o estensione retention); copy “X giorni su 7” e tensione visiva. (2) Reminder: mantenere DCL 19:45; valutare (senza obbligo) allineamento con push nativi per maggiore affidabilità su iOS. (3) Collegamento M1U/BUZZ: CTA esplicita “Usa le M1U per il BUZZ” (navigate a route BUZZ o BUZZ MAP) quando 3/3 e balance ≥ soglia; messaggio già presente, si aggiunge solo azione al tap.
- **Dipendenze**: reward 7/7 richiede backend (RPC + eventuale tabella); resto frontend.
- **Rischio**: medio per la parte 7/7 (nuova logica reward); basso per barra/copy e CTA BUZZ.
- **Impatto**: retention settimanale e chiarezza “DCL alimenta il gioco”.
- **Frontend/backend**: ibrido (weekly reward backend; resto frontend).

### Fase D — Ottimizzazione e polish (opzionale)

- **Obiettivo**: countdown fine giornata, DCL in header/command center, eventuali eventi/season.
- **Contenuto**: (1) Copy o piccolo widget “X ore alla mezzanotte” (Europe/Rome) quando 0/3 o 1/3. (2) Indicatore DCL (es. 2/3) in UnifiedHeader o Command Center (solo lettura, tap porta a Home/card). (3) Estensioni future: eventi a tempo, season pass, ecc.
- **Dipendenze**: Fase C; header/command center da toccare con cautela (vincolo “non toccare UnifiedHeader” può essere rilassato solo per indicatore minimo).
- **Rischio**: medio se si tocca header; basso per countdown copy.
- **Impatto**: ritorno e visibilità del daily.
- **Frontend/backend**: prevalentemente frontend.

## Cosa è frontend / backend / ibrido

- **Solo frontend**: eventi refetch, CTA che aprono modali, animazioni card, overlay success 3/3, CTA “Vai al BUZZ”, countdown copy, barra weekly (con dati già esistenti).
- **Solo backend**: reward 7/7 (nuova RPC + eventuale tabella/claim).
- **Ibrido**: weekly progress già in RPC; eventuale estensione per “7/7 claim” e chest domenicale DCL.

## Realtime / invalidation

- **Oggi**: mount, visibility/focus (parziale), post-claim.
- **Dopo Fase A**: + refetch su eventi commit/streak/mission completed (listener su CustomEvent o callback da modali).
- **Opzionale**: refetch periodico soft (es. ogni 60s quando tab visibile) per casi edge; non sostituisce eventi.

---

# 6. Versione minima vs versione AAA+

## Cosa basta per una versione seria (minima)

- **Fase A** completa: aggiornamento event-driven + CTA che aprono Commit/Streak/Mission con un tap. La card diventa “viva” e guida davvero.
- **Parte di Fase B**: almeno overlay (o toast potenziato) “Giornata completata” / “+10 M1U” al claim 3/3, riuso template success esistente; opzionale animazione count sulla card.
- **Nessuna nuova RPC** per la “minima”; reward 7/7 e weekly avanzato possono restare fase successiva.

## Cosa serve per una versione veramente top-tier (AAA+)

- **Fase A + B complete**: eventi, CTA deep, animazioni progressione, highlight “prossima azione”, overlay success 3/3 con payoff forte, eventuale haptic/suono.
- **Fase C**: weekly 7/7 con reward e/o chest domenica, CTA “Usa M1U per BUZZ” con navigazione, reminder DCL confermati (e se possibile allineati a push).
- **Fase D** (opzionale): countdown, indicatore DCL in header/command center, polish aggiuntivo.

---

# 7. Verdetto finale

- **Possiamo ottenere questo risultato senza rifare l’app?** **Sì.** Il DCL ha già stato, backend e copy; il gap è orchestrazione (eventi, chi apre i modali), animazioni e cerimonia (riuso pattern esistenti).
- **Quanto siamo lontani?** **Un passo e mezzo**: (1) eventi + CTA che aprono i flow e (2) overlay/animazioni di completamento. Il resto (weekly 7/7, countdown, header) è incrementale.
- **Strategia migliore**: implementare in ordine **A → B → (C → D)**; A e B sono a basso rischio e alto impatto; C introduce reward 7/7 (backend); D è opzionale e va valutata in base a priorità prodotto.
- **Livello di fiducia**: **alto** per A e B (solo frontend, pattern già presenti); **medio** per C (reward 7/7 e reminder su iOS); **medio-basso** per D se si tocca header (vincoli progetto).

---

# 8. Risposta diretta a Joseph

## 1. Oggi il Daily Control Loop™ è davvero un sistema forte oppure no?

**No, non ancora.** I dati e la logica ci sono (stato 0/3–3/3, bonus, weekly, copy), ma **manca reattività e profondità**: la card non si aggiorna subito dopo le azioni, le CTA fanno solo scroll, non c’è cerimonia né payoff visivo forte. È una checklist evoluta, non ancora la “spina dorsale” percepita.

## 2. Cosa gli manca per sembrare un sistema AAA+ / Royal Match–grade?

- **Aggiornamento immediato** dopo Commit/Streak/Mission (event-driven refetch).
- **Un tap dalla card** che apra il modal/overlay giusto (Commit, Streak, Mission), non solo lo scroll.
- **Animazioni e gerarchia**: progressione visiva 0/3→3/3, evidenza della “prossima azione”, glow near-completion.
- **Cerimonia e payoff**: overlay “Giornata completata” / “+10 M1U” (come StreakModal success o ClaimRewardModal), non solo toast.
- **Weekly “vero”**: reward 7/7 e/o chest domenica, tensione settimanale visiva.
- **Collegamento esplicito**: CTA “Usa le M1U per il BUZZ” che porti al flow BUZZ/BUZZ MAP.

## 3. Qual è la sequenza corretta di implementazione?

1. **Fase A** — Eventi (commit/streak/mission done) + refetch in card; CTA che aprono CommitModal, StreakModal, NextAction overlay (tramite context/callback da AppHome).
2. **Fase B** — Animazioni sulla card (count, highlight riga), overlay success 3/3 (template riusato), eventuale haptic/suono.
3. **Fase C** — Weekly 7/7 (reward + barra/tensione), CTA BUZZ, reminder confermati.
4. **Fase D** (opzionale) — Countdown, indicatore DCL in header/command center, polish.

## 4. Qual è la prima fase reale da fare subito senza rompere nulla?

**Fase A**: solo frontend, nessuna modifica a logica Commit/Streak/Mission/BUZZ. (1) Emettere (o riusare) eventi al completamento e far ascoltare la card per refetch. (2) Esporre da AppHome (ref o context) “apri Commit”, “apri Streak”, “apri Mission” e chiamarli dalle CTA della card invece di scroll. Rischio basso, rollbackabile, nessun tocco a login/IAP/BUZZ/push.

## 5. Quale sarà il vero salto qualitativo che farà dire “adesso sì”?

**Fase A + overlay success di Fase B**: quando l’utente (1) tap “Inizia con il Commit” → si apre il CommitModal, completa, chiude e (2) **vede la card già aggiornata a 1/3** senza cambiare pagina, e (3) al 3/3 e al claim vede un **overlay “Giornata completata / +10 M1U”** in stile StreakModal/ClaimRewardModal. A quel punto il DCL smette di essere “lista” e diventa **il ciclo operativo giornaliero** con feedback immediato e payoff chiaro.

---

© 2026 Joseph MULÉ – M1SSION™ — Audit read-only, nessuna modifica al codice.
