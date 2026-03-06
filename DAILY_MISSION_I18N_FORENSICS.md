# Daily Mission Modals — i18n Gap Forensics

**Target:** iOS Capacitor WKWebView · Solo testi/i18n, zero regressioni  
**Data:** 2026-03-03

---

## A) File scope (path esatti)

| File | Ruolo |
|------|--------|
| `src/components/feedback/DailyMissionFlipOverlay.tsx` | Wrapper overlay (portal); nessun testo user-facing hardcoded. |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto modale Daily Mission (header, fasi, CTA, toast completamento). **Molte stringhe hardcoded.** |
| `src/components/feedback/DailyMissionCard.tsx` | Card Home + modale inline + toast + LongPress info. **Molte stringhe hardcoded.** |
| `src/missions/ui/Phase2ResumeModal.tsx` | Modale “Phase 2” (conferma, input, counter, hint). Usa già `t('mission.popup.*')` per molti testi; **instruction/placeholder** da `mission` (registry) sono in italiano. |
| `src/missions/missionsRegistry.ts` | Definizioni missioni (title, description, phase1/2.instruction, inputPlaceholder). Testi in IT/EN nel codice; per i18n si usano chiavi `mission.popup.<id>.*` con fallback al valore da registry. |

Componenti condivisi: nessuno con copy specifico Daily Mission.  
BombMissionModal / VERA non rientrano nel “Daily Mission flow” come da richiesta.

---

## B) Stringhe hardcoded per file

### DailyMissionContent.tsx

| Stringa | Severità | Note |
|---------|----------|------|
| `DAILY MISSION` (header) | P0 | Sostituire con `t('mission.popup.dailyMission')` o `t('home_daily_title')` (già presente). |
| `TOTAL REWARD: <span>… M1U</span>` | P0 | Sostituire con chiave tipo `mission.popup.totalReward` + interpolazione `{{amount}}` (es. `t('mission.popup.totalRewardLabel', { amount: mission.totalRewardM1U })`). |
| `✅ PHASE 1 COMPLETE!` (toast) | P0 | Esiste `mapPills.mission.phase1Complete`; usare quella o `mission.popup.phase1Complete`. |
| `🎉 MISSION ACCOMPLISHED!` (toast) | P0 | Esiste `mapPills.mission.missionAccomplished`; usare quella. |
| `Torna domani per Phase 2!` (toast) | P0 | Esiste `mapPills.mission.returnTomorrowPhase2`; usare quella. |
| Close button (X) | P1 | Aggiungere `aria-label` con `t('mission.popup.close')`. |

### DailyMissionCard.tsx

| Stringa | Severità | Note |
|---------|----------|------|
| `NEW` / `P1` / `P2!` (badge) | P0 | Sostituire con chiavi i18n (es. `daily_mission.badge_new`, `daily_mission.badge_p1`, `daily_mission.badge_p2`) o riuso `next_action_*` se coerente. |
| `TOTAL REWARD: … M1U` | P0 | Come in DailyMissionContent. |
| `✅ PHASE 1 COMPLETE!` / `🎉 MISSION ACCOMPLISHED!` | P0 | Come in DailyMissionContent. |
| `Torna domani per Phase 2!` | P0 | Come in DailyMissionContent. |
| `Missione` (LongPress modal) | P0 | Chiave tipo `daily_mission.label_mission`. |
| `Fase attuale` | P0 | Chiave tipo `daily_mission.label_phase`. |
| `Non iniziata` / `Phase 1` / `Phase 2` / `Completata` | P0 | Chiavi per stato fase. |
| `Reward P1` / `Reward P2` / `Reward Totale` | P0 | Chiavi label. |
| `Status` | P0 | Chiave label. |
| `Phase 2 Pronta!` / `Nuova` / `In corso` | P0 | Chiavi per valore status. |
| `Tocca la card per vedere i dettagli completi` | P0 | Chiave footer LongPress. |
| Close button (X) | P1 | aria-label. |

### Phase2ResumeModal.tsx

| Stringa | Severità | Note |
|---------|----------|------|
| Titolo missione | P0 | Già risolto con `t(titleKey) !== titleKey ? t(titleKey) : mission.title`. |
| `mission.phase2.instruction` | P0 | Mostrato in italiano da registry. Usare `t(\`mission.popup.${mission.id}.phase2_instruction\`)` con fallback a `mission.phase2.instruction`. |
| `mission.phase2.inputPlaceholder` | P0 | Stesso pattern con chiave `mission.popup.<id>.phase2_placeholder`. |
| Altri testi (phase2Available, completePhase2Button, remindMeLater, rewardWaiting, placeholder, showHint, hint, invalidAnswer, mustReachTarget, progress) | — | Già usano `t('mission.popup.*')`. |

### missionsRegistry.ts

| Contenuto | Severità | Note |
|-----------|----------|------|
| title, description, phase1/2.instruction, inputPlaceholder per ogni missione | P0 (per display) | Sono “dati” nel codice. Per i18n senza toccare logica: aggiungere chiavi in locales (es. `mission.popup.signal_trace.title`, `.phase2_instruction`, `.phase2_placeholder`) e nei componenti usare `t(key, { defaultValue: mission.phase2.instruction })` o equivalente. In questo report si coprono le stringhe **nei componenti** e le chiavi per Signal Trace (esempio utente). |

---

## C) Namespace i18n usato

- **Setup:** react-i18next; init in `src/i18n/i18n.ts`.
- **File locale:** un solo namespace “common” in `src/locales/{en,it,fr}/common.json`.
- **Chiavi esistenti:** `mission.popup.*`, `mapPills.mission.*`, `home_daily_*` già presenti (phase2Available, completePhase2Button, remindMeLater, phase1Today, phase2Tomorrow, completePhase1, completePhase2, returnToClaim, phase2Ready, phase2UnlocksTomorrow, returnTomorrowPhase2, phase1Complete, missionAccomplished, totalReward, placeholder, rewardWaiting, showHint, hint, invalidAnswer, mustReachTarget, pointsDefault, progress, dailyMission, close).
- **Scelta:** Inserire tutte le nuove chiavi in **common.json** con prefisso coerente: `mission.popup.*` per modali mission, `daily_mission.*` per label/badge/footer specifici Daily Mission (o riuso di `mapPills.mission.*` / `home_daily_*` dove già esistono).

---

## D) Chiavi minime da aggiungere / riusare

- Header: `mission.popup.dailyMission` / `home_daily_title` (già esistono).
- Total reward: `mission.popup.totalRewardLabel` → "TOTAL REWARD: {{amount}} M1U" (o riuso `mission.popup.totalReward` + interpolazione).
- Toast: `mapPills.mission.phase1Complete`, `mapPills.mission.missionAccomplished`, `mapPills.mission.returnTomorrowPhase2` (già presenti).
- Badge: `daily_mission.badge_new`, `daily_mission.badge_p1`, `daily_mission.badge_p2` (o riuso next_action_*).
- LongPress (DailyMissionCard): `daily_mission.label_mission`, `daily_mission.label_phase`, `daily_mission.phase_not_started`, `daily_mission.phase_1`, `daily_mission.phase_2`, `daily_mission.phase_completed`, `daily_mission.reward_p1`, `daily_mission.reward_p2`, `daily_mission.reward_total`, `daily_mission.status`, `daily_mission.status_p2_ready`, `daily_mission.status_new`, `daily_mission.status_in_progress`, `daily_mission.longpress_footer`.
- Signal Trace (Phase2): `mission.popup.signal_trace.phase2_instruction`, `mission.popup.signal_trace.phase2_placeholder` (EN/IT/FR).

---

## E) Verifica e rollback

- **Branch:** `fix/daily-mission-i18n`
- **Tag:** `safety/daily-mission-i18n-prechange`
- **Rollback immediato (se serve):**
  ```bash
  git checkout fix/daily-mission-i18n
  git reset --hard safety/daily-mission-i18n-prechange
  ```
  Oppure tornare al branch precedente: `git checkout fix/next-action-quality` e `git branch -D fix/daily-mission-i18n`.
- **Test:** Flows FROZEN invariati; cambio lingua EN/IT/FR; tutti i testi nei modali Daily Mission / Phase 2 tradotti; nessun crash.

---

## F) Patch applicate (FASE 1)

- **Locale (en/it/fr):** Aggiunte chiavi `mission.popup.totalRewardLabel`, `mission.popup.signal_trace.title`, `mission.popup.signal_trace.phase2_instruction`, `mission.popup.signal_trace.phase2_placeholder`, e blocco `daily_mission.*` (badge_new, badge_p1, badge_p2, label_mission, label_phase, phase_*, reward_*, status_*, longpress_footer).
- **DailyMissionContent.tsx:** Header "DAILY MISSION" → `t('mission.popup.dailyMission')`; total reward → `t('mission.popup.totalRewardLabel', { amount })`; toast phase1/phase2/returnTomorrow → `t('mapPills.mission.phase1Complete')` / `missionAccomplished` / `returnTomorrowPhase2`; close button `type="button"` + `aria-label={t('mission.popup.close')}`.
- **DailyMissionCard.tsx:** Badge NEW/P1/P2! → `t('daily_mission.badge_*')`; total reward → `t('mission.popup.totalRewardLabel')`; toast come sopra; close button aria-label; LongPress modal: tutte le label e il footer → `t('daily_mission.*')`.
- **Phase2ResumeModal.tsx:** Istruzione Phase 2 e placeholder input → `t('mission.popup.${mission.id}.phase2_instruction')` / `phase2_placeholder` con fallback al valore da registry; close button `type="button"` + `aria-label`.

---

## G) Checklist test (FASE 2 – manuale su iPhone)

- [ ] Login / Logout: OK  
- [ ] Delete account: OK  
- [ ] IAP: init + restore: OK  
- [ ] BUZZ: invariato: OK  
- [ ] BUZZ MAP: invariato: OK  
- [ ] Push native: invariato: OK  
- [ ] Next Action → Daily Mission: tutti i testi tradotti (IT/EN/FR); placeholder e CTA corretti; nessun crash.

---

*Fine report. Patch i18n solo testi UI, zero regressioni su flussi core.*
