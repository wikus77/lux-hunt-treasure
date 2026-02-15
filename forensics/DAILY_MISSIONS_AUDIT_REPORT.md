# DAILY MISSIONS — AUDIT READ-ONLY

**Data:** 2025-02-14  
**Prodotto:** M1SSION (iOS wrapped, Capacitor/WKWebView)  
**Scope:** Discovery + analisi struttura attuale + proposte miglioramento + 10 alternative

---

## 1) INVENTORY FILES

### Discovery (grep / ripgrep)

**Keyword cercate:** `daily`, `mission`, `missions`, `quest`, `task`, `challenge`, `objective`, `check-in`, `streak`, `reward`, `claim`, `cooldown`, `reset`, `midnight`

**Risultato:** Le daily missions vivono principalmente in `src/missions/` e `src/components/feedback/`. Il sistema "daily check-in" / streak è separato in `src/components/gamification/`. Micro-missions in `src/config/firstSessionConfig.ts` e `src/components/first-session/`. Nessuna keyword `quest`/`midnight` rilevante. Reset usa `getTodayKey()` (YYYY-MM-DD), non "midnight" esplicito.

### A) Daily Missions (30 missioni logico/deduzione, 2 giorni)

| Path | Ruolo | Espone |
|------|-------|--------|
| `src/missions/missionsRegistry.ts` | Catalogo 30 missioni, `getMissionOfTheDay()`, validazione input | MISSIONS_REGISTRY, getMissionOfTheDay, calculatePhaseRewards, validateInput |
| `src/missions/missionState.ts` | State machine (phase 0–3), localStorage | getMissionState, startMission, completePhase1/2, isPhase2Available |
| `src/missions/missionEngine.ts` | Business logic completamento fasi | getEngineState, handlePhase1Complete, handlePhase2Complete |
| `src/missions/rewards/creditM1U.ts` | Credito M1U (SAFE_MODE = localStorage only) | creditM1USafe, getPendingCredits |
| `src/missions/ui/MissionPill.tsx` | Pill UI sulla MAP | MissionPill |
| `src/missions/ui/MissionBriefingModal.tsx` | Modal briefing iniziale | — |
| `src/missions/ui/MissionCompletionModal.tsx` | Modal completamento | — |
| `src/missions/DailyMissionsController.tsx` | Controller per missioni | — |
| `src/components/feedback/DailyMissionCard.tsx` | Card Home per daily mission | DailyMissionCard |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto modal mission | — |
| `src/components/feedback/DailyMissionFlipOverlay.tsx` | Overlay fullscreen mission | — |
| `src/components/feedback/NextActionContainer.tsx` | Container "prossima azione" | NextActionContainer |
| `src/components/feedback/NextActionContent.tsx` | Contenuto azioni (map, buzz, aion) + daily mission | — |

**Chiamanti principali:** Home.tsx (MissionPill), MapTiler3D.tsx (MissionPill), AppHome.tsx (NextActionContainer), CommandCenterHome (DailyMissionCard se presente)

---

### B) Micro-Missions (onboarding first-session, ~11 step)

| Path | Ruolo | Espone |
|------|-------|--------|
| `src/config/firstSessionConfig.ts` | Config micro-missioni, trigger, timing | MICRO_MISSIONS, getCurrentMission, advanceMission, areMissionsCompleted |
| `src/components/first-session/MicroMissionsCard.tsx` | Card floating per micro-missioni | MicroMissionsCard |
| `src/App.tsx` | Mount MicroMissionsCard globale | — |

**Chiamanti:** App.tsx (globale)

---

### C) Daily Check-in / Streak

| Path | Ruolo | Espone |
|------|-------|--------|
| `src/components/gamification/StreakModal.tsx` | Modal streak + check-in giornaliero | StreakModal |
| `src/components/gamification/StreakPill.tsx` | Pill streak, apre StreakModal | StreakPill |
| `supabase/migrations/*` | profiles.last_check_in_date, award_xp | — |
| `supabase/functions/handle-daily-checkin/` | Edge function (se usata) | — |

---

### D) Data Source

| Tipo | Sorgente |
|------|----------|
| Catalogo missioni | Hardcoded in `MISSIONS_REGISTRY` |
| State missione | localStorage (`m1_daily_missions_*`) |
| Reset giornaliero | `getTodayKey()` = YYYY-MM-DD, `dayOfYear % 30` per missione |
| Check-in / streak | Supabase `profiles` (last_check_in_date, current_streak_days) |
| Micro-missions | localStorage + RPC `check_micro_missions_completed`, `complete_micro_missions_and_reward` |
| Reward M1U (daily missions) | `creditM1USafe` → localStorage (MISSIONS_REWARD_SAFE_MODE=true) |

---

## 2) CURRENT BEHAVIOR SPEC

### A) Catalogo missioni

- **30 missioni** in `MISSIONS_REGISTRY`
- **Tipologie:** input (exact/regex/any), confirm, counter (Pulse Breaker wins)
- **Rotazione:** `dayOfYear % 30` → missione fissa per giorno
- **Nessuna randomizzazione**, nessuna difficoltà progressiva
- **Phase 1 + Phase 2:** reward 50/50 split (es. 20 M1U → 10+10)

### B) Assegnazione giornaliera

- **Reset:** `getTodayKey()` = `new Date().toISOString().split('T')[0]` (timezone browser)
- **Timezone:** locale utente (no UTC esplicito)
- **Se salta un giorno:** phase 2 resta “domani”; nessun soft-reset
- **Persistency:** localStorage; nessun sync server per daily missions
- **Anti-cheat:** nessuno per daily missions (SAFE_MODE = solo localStorage)

### C) Progress & completion

- **Progress:** input validato (`validateInput`), counter da `progressData` (es. pulse_breaker_wins)
- **Counter:** `progressData` in localStorage; `pulse_breaker_wins` deve essere aggiornato da Pulse Breaker (integrazione da verificare)
- **Offline:** funziona (tutto client)
- **Errori:** toast, nessun retry automatico

### D) Rewards & economy

- **Reward:** M1U (10–100 per missione, split phase1/phase2)
- **creditM1USafe:** SAFE_MODE → solo localStorage, no DB
- **Rischio exploit:** alto (refresh, multi-claim, manipolazione localStorage)

### E) UX

- **Dove appaiono:** MissionPill (Home, Map), DailyMissionCard (se usata), NextActionContainer (AppHome)
- **Visibilità:** pill discreta, non sempre evidente
- **Onboarding:** nessun tooltip specifico per daily missions
- **Feedback:** animazione completion, toast, haptics

---

### Flusso testuale (daily missions)

```
[Utente apre app]
  → getMissionOfTheDay() = MISSIONS_REGISTRY[dayOfYear % 30]
  → getMissionState() da localStorage
  → phase 0: mostra briefing → startMission(id)
  → phase 1: utente completa azione (input/confirm/counter)
    → completePhase1() → creditM1USafe(phase1Reward)
  → phase 2: "ritorna domani" (isNewDay() required)
  → phase 2 ready: utente completa → completePhase2() → creditM1USafe(phase2Reward)
  → phase 3: missione completata, card nascosta
```

---

## 3) PAIN POINTS (prioritizzati)

1. **Nessun loop giornaliero forte:** missione unica/giorno, phase 2 solo “domani” → pochi touch point
2. **Troppo semplice:** molte missioni sono input/confirm banali; pochi usano mappa, buzz, esplorazione
3. **Visibilità bassa:** MissionPill e DailyMissionCard poco evidenti; nessun reminder
4. **Nessun legame con streak:** daily check-in e daily missions sono disconnessi
5. **Reward solo localStorage:** SAFE_MODE = nessun persist reale, alto rischio exploit
6. **Nessuna variabilità percepita:** rotazione deterministica, stesse missioni ogni ~30 giorni
7. **Micro-missions una tantum:** onboarding only, non contribuiscono al loop giornaliero
8. **Nessun onboarding per daily:** utente non sa bene dove trovare/cosa fare

---

## 4) IMPROVEMENT PLAN

### Livello 1 — Quick wins (solo UX/logic, no backend)

- **Obiettivo:** Engagement, discovery
- **Azioni:** (a) Card daily mission più visibile su Home; (b) toast/reminder “Nuova missione disponibile” al primo accesso giornaliero; (c) badge/pill con “!” se missione non iniziata; (d) copy più chiara su cosa fare
- **Metriche:** CTR daily mission card, completion rate phase 1

### Livello 2 — Medium (nuova logica dati, senza stravolgere)

- **Obiettivo:** Retention, variabilità
- **Azioni:** (a) 2–3 “mini-missioni” giornaliere oltre a quella principale; (b) collegare daily check-in a bonus su daily mission; (c) reward server-side (RPC) invece di solo localStorage; (d) breve “streak missioni” (es. 3 giorni consecutivi = bonus)
- **Metriche:** D3/D7 retention, session length, completion rate

### Livello 3 — Advanced (daily loop profondo)

- **Obiettivo:** Retention, monetizzazione, progressione
- **Azioni:** (a) missioni dinamiche basate su contesto (mappa, buzz, Aion); (b) difficulty scaling; (c) “season pass” / track settimanale; (d) notifiche push per reminder missione
- **Metriche:** D30 retention, ARPU, completamento track

---

## 5) 10 ALTERNATIVE “VERA DAILY MISSION”

### 1) Esploratore del giorno

| Campo | Valore |
|-------|--------|
| Nome (IT) | Esploratore del giorno |
| Descrizione | Esplora 3 aree diverse sulla mappa (pan/zoom in zone distinte) |
| Trigger | Eventi map: pan, zoom, bounds cambiati |
| Progress | Contatore zone uniche (grid/cell visitate) |
| Reward | 15 M1U + 5 PE |
| Anti-cheat | Cooldown per stessa cella, max 1 claim/giorno |
| UX | Card su Home, progress bar “2/3 aree” |
| Difficoltà impl. | 3 |
| Rischio | 2 |
| Dipendenze | MapTiler3D, bounds/cell logic (non presente) |
| iOS | Ok (gesture map standard) |

---

### 2) Buzz della verità

| Campo | Valore |
|-------|--------|
| Nome (IT) | Buzz della verità |
| Descrizione | Usa Buzz almeno 1 volta oggi e visita 1 indizio scoperto |
| Trigger | Buzz used + clue viewed/claimed |
| Progress | 2 step (buzz → clue) |
| Reward | 20 M1U |
| Anti-cheat | RPC server-side, 1 claim/giorno |
| UX | Card Home, CTA “Usa Buzz” |
| Difficoltà impl. | 2 |
| Rischio | 1 |
| Dipendenze | useBuzzApi, marker_claims (presenti) |
| iOS | Ok |

---

### 3) Aion daily question

| Campo | Valore |
|-------|--------|
| Nome (IT) | Domanda del giorno |
| Descrizione | Fai 1 domanda ad AION oggi |
| Trigger | IntelChatPanel submit |
| Progress | 1 query inviata |
| Reward | 10 M1U |
| Anti-cheat | RPC su intel_usage o simile |
| UX | Card su Home/Intel, CTA “Apri AION” |
| Difficoltà impl. | 2 |
| Rischio | 1 |
| Dipendenze | IntelChatPanel, eventuale tabella usage (parzialmente presente) |
| iOS | Ok |

---

### 4) Streak & mission combo

| Campo | Valore |
|-------|--------|
| Nome (IT) | Combo Streak |
| Descrizione | Fai il check-in streak E completa 1 daily mission oggi |
| Trigger | Streak check-in + mission phase 1 complete |
| Progress | 2 step |
| Reward | 25 M1U (bonus combo) |
| Anti-cheat | DB last_check_in + mission state |
| UX | Card unica che unisce streak + mission |
| Difficoltà impl. | 3 |
| Rischio | 2 |
| Dipendenze | StreakModal, missionState (presenti) |
| iOS | Ok |

---

### 5) Indizio vicino

| Campo | Valore |
|-------|--------|
| Nome (IT) | Indizio vicino |
| Descrizione | Riscatta 1 marker reward nelle vicinanze oggi |
| Trigger | marker_claims insert |
| Progress | 1 claim |
| Reward | 15 M1U |
| Anti-cheat | RPC, 1 claim/giorno per missione |
| UX | Card Home, CTA “Vai alla mappa” |
| Difficoltà impl. | 2 |
| Rischio | 1 |
| Dipendenze | marker_claims, Buzz (presenti) |
| iOS | Ok |

---

### 6) Commit daily

| Campo | Valore |
|-------|--------|
| Nome (IT) | Commit quotidiano |
| Descrizione | Completa il rituale Commit oggi |
| Trigger | CommitRitual onComplete |
| Progress | 1 completion |
| Reward | 20 M1U |
| Anti-cheat | RPC, 1 completion/giorno |
| UX | Card Home, CTA “Fai il Commit” |
| Difficoltà impl. | 2 |
| Rischio | 1 |
| Dipendenze | CommitRitual, RPC (presenti) |
| iOS | Ok (haptics già gestiti) |

---

### 7) Social proof

| Campo | Valore |
|-------|--------|
| Nome (IT) | Scala la classifica |
| Descrizione | Migliora la tua posizione in leaderboard oggi (o mantieni il podio) |
| Trigger | rank change vs ieri |
| Progress | 1 step (miglioramento o mantenimento top 10) |
| Reward | 15 M1U |
| Anti-cheat | Confronto rank da DB |
| UX | Card Home, link a Leaderboard |
| Difficoltà impl. | 4 |
| Rischio | 3 |
| Dipendenze | useRealtimeLeaderboard, storage rank storico (non presente) |
| iOS | Ok |

---

### 8) Pulse Breaker daily

| Campo | Valore |
|-------|--------|
| Nome (IT) | Pulse Breaker daily |
| Descrizione | Ottieni 3 vittorie in Pulse Breaker oggi |
| Trigger | Eventi Pulse Breaker win |
| Progress | Counter vittorie (già in missions) |
| Reward | 15 M1U |
| Anti-cheat | progressData + RPC |
| UX | Card Home, CTA “Gioca” |
| Difficoltà impl. | 2 |
| Rischio | 1 |
| Dipendenze | Pulse Breaker, missionState progressData (presenti) |
| iOS | Ok |

---

### 9) Notifiche attive

| Campo | Valore |
|-------|--------|
| Nome (IT) | Resta informato |
| Descrizione | Attiva le notifiche push oggi |
| Trigger | Notification permission granted |
| Progress | 1 step |
| Reward | 10 M1U |
| Anti-cheat | RPC che verifica permission via token |
| UX | Card settings/Home, CTA “Attiva” |
| Difficoltà impl. | 3 |
| Rischio | 2 |
| Dipendenze | useNativePush, profili (presenti) |
| iOS | Ok (consent flow nativo) |

---

### 10) Mappa investigativa

| Campo | Valore |
|-------|--------|
| Nome (IT) | Mappa investigativa |
| Descrizione | Zoom su 5 marker diversi sulla mappa oggi |
| Trigger | Tap/click su marker, zoom in |
| Progress | Contatore marker “visti” (tap) |
| Reward | 25 M1U |
| Anti-cheat | Cooldown per stesso marker, max 1 claim/giorno |
| UX | Card Home, progress “3/5 marker” |
| Difficoltà impl. | 4 |
| Rischio | 2 |
| Dipendenze | MapTiler3D, marker events (parzialmente presente) |
| iOS | Ok |

---

## 6) RACCOMANDAZIONE FINALE

### Top 3 missioni consigliate

1. **Buzz della verità (n. 2)** — Usa meccaniche core (Buzz + indizi), basso rischio, alta coerenza con il prodotto.
2. **Commit daily (n. 6)** — Sfrutta rituale esistente, coinvolgente, pochi cambi architetturali.
3. **Streak & mission combo (n. 4)** — Crea legame tra streak e daily, aumenta retention.

### Roadmap proposta

1. **Fase 1 (Quick):** Buzz della verità + Commit daily (2 missioni aggiuntive giornaliere, RPC server-side).
2. **Fase 2 (Medium):** Streak & mission combo + Indizio vicino.
3. **Fase 3 (Advanced):** Esploratore del giorno, Mappa investigativa (richiedono logica bounds/cell).

### Rischi principali

- **Exploit:** passare da localStorage a RPC per tutti i reward.
- **Timezone:** definire chiaramente midnight (locale vs UTC) per reset.
- **Regressioni:** missioni esistenti (phase 1/2) non devono rompersi.

### Cosa non fare (anti-pattern)

- Non aggiungere missioni tipo “apri l’app”.
- Non moltiplicare reward senza bilanciamento economia.
- Non introdurre reset manuale user-side.
- Non usare solo client/localStorage per reward critici.
