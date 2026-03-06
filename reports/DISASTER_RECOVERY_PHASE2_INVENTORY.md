# Disaster Recovery — FASE 2: Inventario file untracked / modificati importanti — Report

**Data/ora:** 2026-03-06  
**Branch attuale:** `fix/m1u-slotloop-anim`  
**Commit HEAD:** `aca569c00`  
**Scope:** SOLO lettura; nessun commit, push, modifica.

---

## 1. Sintesi stato Git

| Voce | Valore |
|------|--------|
| **Righe `git status --short`** | ~504 (M = modificati, D = eliminati, ?? = untracked) |
| **File modificati (tracked, non committati)** | **412** (`git diff --name-only`) |
| **File in staging** | **0** (`git diff --cached --name-only` vuoto) |
| **File untracked** | **93** (`git ls-files --others --exclude-standard`) |

**Distinzione:**
- **Modificati non committati:** 412 file (soprattutto eliminazioni di `.glb` in android/ e public/, più ~50 file in `src/`, 1 in `supabase/functions/delete-account`).
- **Staged:** nessuno.
- **Untracked:** 93 file (report, docs, script, sorgente M1U/missions, Supabase functions e migrazioni).

---

## 2. Inventario untracked (classificazione)

### 2.1 CRITICI APP CORE — Priorità P0

| Path | Perché è importante | Necessario per ricostruire app attuale |
|------|----------------------|----------------------------------------|
| `src/features/m1u/GlobalM1UCreditOverlay.tsx` | Motore eventi M1U (Strategia B, headless); senza non c’è propagazione credito. | **Sì** |
| `src/features/m1u/m1uCreditEvent.ts` | Evento standard `m1u-credit-event` e `emitM1UCreditEvent`; usato da shop, wheel, missions. | **Sì** |
| `src/missions/serverReal/claimDailyPhase.ts` | Client per claim daily mission (server-real). | **Sì** |
| `src/missions/serverReal/dailyMissionToday.ts` | Client per “missione del giorno” (server-real). | **Sì** |
| `src/missions/ui/CipherDrillModal.tsx` | Modal daily mission (Cipher Drill). | **Sì** |
| `src/missions/ui/SignalPatternNumbersModal.tsx` | Modal daily mission (Signal Pattern). | **Sì** |
| `src/missions/ui/WordDuelMemoryModal.tsx` | Modal daily mission (Word Duel / Memory). | **Sì** |
| `src/missions/useMissionOfTheDay.ts` | Hook missione del giorno. | **Sì** |
| `src/integrations/supabase/authSingleFlight.ts` | Integrazione auth (single flight); può influire su login/session. | **Sì** (se usato) |

### 2.2 CRITICI BACKEND / SUPABASE — Priorità P0

| Path | Perché è importante | Necessario per ricostruire backend |
|------|----------------------|-------------------------------------|
| `supabase/functions/claim-daily-phase/` | Edge function per claim daily mission. | **Sì** |
| `supabase/functions/daily-mission-today/` | Edge function per missione del giorno. | **Sì** |
| `supabase/functions/delete-account-v2/` | Flusso delete account v2. | **Sì** |
| `supabase/functions/spin-wheel/` | Edge function per ruota della fortuna (server-real). | **Sì** |
| `supabase/migrations/20260227120000_admin_logs_fk_on_delete_set_null.sql` | FK admin_logs. | **Sì** |
| `supabase/migrations/20260227120001_admin_logs_admin_id_fk_set_null.sql` | FK admin_logs. | **Sì** |
| `supabase/migrations/20260227130000_storage_objects_owner_cascade_if_exists.sql` | Storage. | **Sì** |
| `supabase/migrations/20260302122000_fix_auth_users_fk_blocking_delete.sql` | Auth/users delete. | **Sì** |
| `supabase/migrations/20260302130000_forensic_fk_and_triggers_auth_users.sql` | Forensic FK. | **Sì** |
| `supabase/migrations/20260302140000_wheel_spins_fk_set_null_for_delete_user.sql` | Wheel + delete user. | **Sì** |
| `supabase/migrations/20260302140100_wheel_spins_trigger_allow_set_null.sql` | Trigger wheel. | **Sì** |
| `supabase/migrations/20260302140200_user_buzz_counter_fk_cascade.sql` | Buzz counter. | **Sì** |
| `supabase/migrations/20260303100000_fix_handle_buzz_map_pe_no_meta.sql` | Buzz map. | **Sì** |
| `supabase/migrations/20260303100001_mission_enrollments_add_id_if_missing.sql` | Mission enrollments. | **Sì** |
| `supabase/migrations/20260303110000_daily_mission_runs_claims.sql` | Daily mission runs/claims. | **Sì** |
| `supabase/migrations/20260304000000_wheel_server_real.sql` | Wheel server-real. | **Sì** |

### 2.3 CRITICI CONFIG / ENV / IOS

- **Untracked:** nessun file config/env/ios untracked rilevato in lista (`.env`/`.env.local` sono nel backup FASE 1; `capacitor.config.ts` è tracked).
- **Priorità:** N/A per untracked.

### 2.4 ASSET / MEDIA IMPORTANTI

- **Untracked:** nessun asset nuovo in lista untracked (le modifiche sono soprattutto **eliminazioni** di `.glb` in android/ e public/, quindi tracked modificati con D).
- **Priorità:** per recovery, le eliminazioni di `.glb` sono P2/P3 (asset 3D; l’app può funzionare senza o con subset).

### 2.5 REPORT / DOCUMENTAZIONE — Priorità P2

Tutti i file in `reports/*.md`, `docs/*.md`, root `*_AUDIT.md`, `*_FORENSICS.md`, `*_PLAN.md`: documentazione utile per contesto e incident, **non** necessari al runtime. Inclusi DISASTER_RECOVERY_*, M1U_*, DELETE_ACCOUNT_*, IOS_*, WHEEL_*, ecc.

### 2.6 RUMORE / BASSA PRIORITÀ — Priorità P3

| Path | Motivo |
|------|--------|
| `scripts/check-cap-assets.js`, `scripts/glb-audit.cjs`, `scripts/glb-audit.js` | Script di utilità/audit; non critici per build o runtime. |

---

## 3. Inventario tracked modificati (per cluster)

### Cluster 1 — UI / Home / Header / Pill / M1U / Slot

| File | Impatto sull’app | Priorità recovery | Salvare subito? |
|------|-------------------|-------------------|------------------|
| `src/App.tsx` | Root: GlobalM1UCreditOverlay in AuthProvider, layout. | **P0** | **Sì** |
| `src/pages/AppHome.tsx` | Home, pill M1U fixed, wallet visibility. | **P0** | **Sì** |
| `src/features/m1u/M1UPill.tsx` | Pill M1U, animazione slot, lock, pending credit. | **P0** | **Sì** |
| `src/components/m1units/M1UShopContent.tsx` | Shop M1U, emitM1UCreditEvent, post-IAP. | **P0** | **Sì** |

### Cluster 2 — Fortune Wheel

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `src/components/feedback/FortuneWheel.tsx` | Ruota, credito M1U, emitM1UCreditEvent. | **P0** | **Sì** |

### Cluster 3 — Daily Missions

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `src/components/feedback/DailyMissionCard.tsx` | Card missioni giornaliere. | **P0** | **Sì** |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto modale daily missions. | **P0** | **Sì** |
| `src/components/feedback/NextActionContainer.tsx` | Next action / CTA. | **P1** | Sì |
| `src/components/feedback/NextActionContent.tsx` | Contenuto next action. | **P1** | Sì |
| `src/components/first-session/MicroMissionsCard.tsx` | Micro-missions, emitM1UCreditEvent. | **P0** | **Sì** |
| `src/missions/missionsRegistry.ts` | Registry missioni. | **P0** | **Sì** |
| `src/missions/ui/MissionActionsModal.tsx` | Modal azioni missione. | **P1** | Sì |
| `src/missions/ui/MissionBriefingModal.tsx` | Briefing. | **P1** | Sì |
| `src/missions/ui/MissionCompletionModal.tsx` | Completamento. | **P1** | Sì |
| `src/missions/ui/MissionPill.tsx` | Pill missioni. | **P1** | Sì |
| `src/missions/ui/Phase2ResumeModal.tsx` | Resume fase 2. | **P1** | Sì |

### Cluster 4 — Shop / M1U purchase UI

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `src/components/shop/LotteryContent.tsx` | Lottery, credito M1U. | **P1** | Sì |
| `src/components/scratch/ScratchWinModal.tsx` | Scratch, credito M1U. | **P1** | Sì |
| `src/components/milestones/ClueMilestoneModal.tsx` | Clue milestone, emitM1UCreditEvent. | **P1** | Sì |
| `src/components/milestones/ClueMilestoneWatcher.tsx` | Watcher milestone. | **P1** | Sì |

### Cluster 5 — App / Providers / Routing / Auth

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `src/main.tsx` | Bootstrap app. | **P0** | **Sì** |
| `src/contexts/auth/AuthProvider.tsx` | Auth context. | **P0** | **Sì** |
| `src/contexts/auth/types.ts` | Tipi auth. | **P1** | Sì |
| `src/iap/iapService.ts` | Servizio IAP. | **P0** | **Sì** (no modifica logica IAP, solo salvataggio stato) |

### Cluster 6 — Hooks / gamification / altri crediti M1U

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `src/hooks/useM1UnitsRealtime.ts` | Realtime M1U. | **P0** | **Sì** |
| `src/hooks/useWelcomeBonus.ts` | Welcome bonus, emitM1UCreditEvent. | **P0** | **Sì** |
| `src/hooks/useActiveMissionEnrollment.ts` | Mission enrollment. | **P1** | Sì |
| `src/components/gamification/StreakModal.tsx` | Streak, M1U. | **P1** | Sì |
| `src/components/gamification/StreakWidget.tsx` | Widget streak. | **P1** | Sì |
| `src/components/gamification/ReferralCard.tsx` | Referral, M1U. | **P1** | Sì |
| `src/components/gamification/WeeklyChallenges.tsx` | Weekly challenges, M1U. | **P1** | Sì |
| `src/components/home/CashbackVaultPill.tsx` | Cashback, M1U. | **P1** | Sì |
| `src/components/layout/header/ReferralCodeDisplay.tsx` | Header referral. | **P2** | Può aspettare |
| Altri hooks (useBuzzGrants, useProfileRealtime, usePWAStabilizer, useHierarchyRank, useAgentEnergy, useAwardPE, use-auth-session-manager, useBuzzMapPricingNew) | Vari comportamenti. | **P1** | Sì |

### Cluster 7 — Supabase / functions (modificati)

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `supabase/functions/delete-account/index.ts` | Delete account (vecchio o integrazione). | **P1** | Sì |

### Cluster 8 — iOS native / Android

- **Modificati:** `android/app/src/main/assets/public/*` (bundle-analysis, index.html, molte eliminazioni `.glb`). Nessun file `ios/` in diff.
- **Impatto:** Android asset/build; per **iOS-only** recovery è P2/P3. Eliminazioni `.glb` riducono peso repo; per “app identica” potrebbero servire se Android è usato.

### Cluster 9 — Assets / public

- **Modificati:** molte eliminazioni in `public/models/agent/**/*.glb` (stesso set di android). Asset 3D; recovery iOS core non dipende da questi; priorità **P2/P3**.

### Cluster 10 — Docs / report / agent / UI minori

| File | Impatto | Priorità | Salvare subito? |
|------|---------|----------|------------------|
| `src/components/agent/AgentLabModal.tsx`, `AgentUnlockModal.tsx` | Modal agent. | **P1** | Sì |
| `src/components/command-center/home-sections/AgentDiaryContent.tsx`, `PrizeVision.tsx` | Home sections. | **P1** | Sì |
| `src/components/ui/sonner.tsx` | Toaster. | **P1** | Sì |
| `src/features/pulse/hooks/useAgentEnergy.ts`, `useAwardPE.ts` | Pulse. | **P1** | Sì |
| `src/locales/en/common.json`, `fr/common.json`, `it/common.json` | i18n. | **P0** | **Sì** |
| `src/pages/test/LotteryTest.tsx` | Test; P2. | **P2** | Può aspettare |

---

## 4. Tabella priorità P0 / P1 / P2 / P3

| Priorità | Criterio | Esempi (untracked + modificati) |
|----------|----------|----------------------------------|
| **P0** | Indispensabile: senza non hai l’app attuale (core M1U, auth, home, shop, wheel, daily missions, i18n, IAP integration). | GlobalM1UCreditOverlay, m1uCreditEvent, serverReal daily mission, modals daily mission, useMissionOfTheDay, authSingleFlight; App.tsx, AppHome, M1UPill, M1UShopContent, FortuneWheel, DailyMissionCard/Content, MicroMissionsCard, missionsRegistry, AuthProvider, main.tsx, useM1UnitsRealtime, useWelcomeBonus, iapService, locales; Supabase functions (claim-daily-phase, daily-mission-today, delete-account-v2, spin-wheel) e tutte le migrazioni untracked. |
| **P1** | Molto importante: feature visibili o backend; recovery completo. | Resto di src/ modificato (hooks, gamification, milestones, mission UI, agent, command-center, sonner, delete-account index); script e report utili. |
| **P2** | Utile ma non blocca: asset, Android-only, test, doc. | Eliminazioni .glb (android/public); LotteryTest; report/docs. |
| **P3** | Rumore / secondario. | Script glb-audit, check-cap-assets; report puramente storici. |

---

## 5. MUST SAVE FIRST

### A) TOP 20 file / gruppi da mettere in sicurezza subito

1. **`src/features/m1u/GlobalM1UCreditOverlay.tsx`** (untracked)  
2. **`src/features/m1u/m1uCreditEvent.ts`** (untracked)  
3. **`src/App.tsx`** (modificato)  
4. **`src/features/m1u/M1UPill.tsx`** (modificato)  
5. **`src/components/m1units/M1UShopContent.tsx`** (modificato)  
6. **`src/pages/AppHome.tsx`** (modificato)  
7. **`src/components/feedback/FortuneWheel.tsx`** (modificato)  
8. **`src/components/feedback/DailyMissionCard.tsx`**, **DailyMissionContent.tsx** (modificati)  
9. **`src/missions/serverReal/`** (claimDailyPhase, dailyMissionToday) (untracked)  
10. **`src/missions/ui/CipherDrillModal.tsx`**, **SignalPatternNumbersModal.tsx****, WordDuelMemoryModal.tsx** (untracked)  
11. **`src/missions/useMissionOfTheDay.ts`** (untracked)  
12. **`supabase/functions/claim-daily-phase/`**, **daily-mission-today/`**, **spin-wheel/`**, **delete-account-v2/`** (untracked)  
13. **Tutte le `supabase/migrations/20260*.sql`** untracked (14 file)  
14. **`src/main.tsx`**, **`src/contexts/auth/AuthProvider.tsx`** (modificati)  
15. **`src/iap/iapService.ts`** (modificato)  
16. **`src/hooks/useM1UnitsRealtime.ts`**, **useWelcomeBonus.ts** (modificati)  
17. **`src/missions/missionsRegistry.ts`** (modificato)  
18. **`src/components/first-session/MicroMissionsCard.tsx`** (modificato)  
19. **`src/locales/en/common.json`**, **fr/common.json****, it/common.json** (modificati)  
20. **`src/integrations/supabase/authSingleFlight.ts`** (untracked)

### B) TOP 20 file / gruppi che possono aspettare (salvare dopo il blocco P0)

1. Resto componenti gamification (StreakModal, StreakWidget, ReferralCard, WeeklyChallenges, CashbackVaultPill).  
2. Mission UI (MissionActionsModal, Briefing, Completion, Pill, Phase2Resume).  
3. Milestones (ClueMilestoneModal, ClueMilestoneWatcher).  
4. LotteryContent, ScratchWinModal.  
5. Hooks (useActiveMissionEnrollment, useProfileRealtime, useBuzzGrants, usePWAStabilizer, useHierarchyRank, useAgentEnergy, useAwardPE, use-auth-session-manager, useBuzzMapPricingNew).  
6. Agent (AgentLabModal, AgentUnlockModal), command-center (AgentDiaryContent, PrizeVision).  
7. NextActionContainer, NextActionContent.  
8. ReferralCodeDisplay, sonner.  
9. auth/types.ts.  
10. supabase/functions/delete-account/index.ts (modificato).  
11. Report e documentazione (reports/*.md, docs/*.md, audit root).  
12. Eliminazioni .glb in android/ e public/ (decidere se committare delete o ripristinare).  
13. android/app/src/main/assets/public (bundle-analysis, index.html).  
14. LotteryTest.tsx.  
15–20. Script (check-cap-assets, glb-audit); altri file minori.

### C) File probabilmente ignorabili o ricostruibili

- Script one-off `glb-audit.cjs`, `glb-audit.js` (audit asset).  
- Report puramente storici se già copiati in backup FASE 1.  
- Eliminazioni massive `.glb`: se l’app iOS non dipende da quei modelli, si può trattare come cleanup (P2/P3).

---

## 6. Risposta operativa (FASE 4)

### 6.1 Se oggi facessi commit di salvataggio, quali aree salveresti per prime?

1. **Blocco M1U / slot engine:** GlobalM1UCreditOverlay, m1uCreditEvent, M1UPill, M1UShopContent, App.tsx (overlay in AuthProvider), AppHome.  
2. **Blocco daily missions (server-real):** serverReal (claimDailyPhase, dailyMissionToday), useMissionOfTheDay, modals (CipherDrill, SignalPattern, WordDuel), DailyMissionCard, DailyMissionContent, MicroMissionsCard, missionsRegistry e mission UI.  
3. **Blocco Supabase:** tutte le function untracked (claim-daily-phase, daily-mission-today, spin-wheel, delete-account-v2) e le 14 migrazioni untracked.  
4. **Blocco core app:** main.tsx, AuthProvider, auth/types, iapService, useM1UnitsRealtime, useWelcomeBonus, FortuneWheel, authSingleFlight.  
5. **i18n:** locales en/fr/it common.json.

### 6.2 Quali file untracked sono pericolosi perché potrebbero andare persi?

Tutti gli **untracked** in §2.1 e §2.2: GlobalM1UCreditOverlay, m1uCreditEvent, serverReal daily mission, modals daily mission, useMissionOfTheDay, authSingleFlight, le 4 Supabase functions (claim-daily-phase, daily-mission-today, delete-account-v2, spin-wheel) e le **14 migrazioni**. Senza questi, da GitHub non si ricostruisce né il comportamento M1U/slot attuale né il backend daily missions/wheel/delete-account.

### 6.3 Quali file modificati tracked sono il cuore dell’app che vedi adesso?

App.tsx, AppHome.tsx, M1UPill.tsx, M1UShopContent.tsx, FortuneWheel.tsx, DailyMissionCard.tsx, DailyMissionContent.tsx, MicroMissionsCard.tsx, missionsRegistry.ts, AuthProvider.tsx, main.tsx, iapService.ts, useM1UnitsRealtime.ts, useWelcomeBonus.ts, e i tre common.json (locales). Poi il resto di feedback/gamification/missions/hooks che usa emitM1UCreditEvent o missioni del giorno.

### 6.4 Quali aree NON toccheresti ancora (solo fotografare)?

- **Eliminazioni massive `.glb`** in android/ e public/: non committare in fretta; decidere se sono cleanup voluti o da ripristinare.  
- **Report/docs**: già in backup FASE 1; si possono aggiungere in commit successivi.  
- **Android** (bundle-analysis, index.html): priorità bassa se il focus è iOS.  
- **Script** glb-audit / check-cap-assets: non critici per build.

---

## 7. Raccomandazione fase successiva

**FASE 3: Piano commit puliti e ordine di salvataggio**

- Definire l’ordine esatto dei commit (es. 1: M1U overlay + eventi, 2: daily missions app + serverReal + modals, 3: Supabase functions + migrazioni, 4: resto src + i18n, 5: report/docs, 6: android/public/asset se necessario).  
- Decidere se fare un unico commit “salvataggio” o commit separati per area.  
- **NON** eseguire ancora commit/push in questa FASE 2; solo inventario e piano.

---

**Fine report FASE 2. Nessun commit, push o modifica eseguiti.**
