# Audit — Header AGT-xxxxx + Mission popups i18n

**Data:** 2026-02-20  
**Branch:** fix/ios-header-agt-compact-i18n-mission-modals  
**Tag rollback:** rollback/ios-agt-i18n-mission-popups-20260220-1700  

---

## FASE 1 — Dove si renderizza "AGT-"

| Aspetto | Dettaglio |
|--------|-----------|
| **File** | `src/components/layout/header/ReferralCodeDisplay.tsx` |
| **Componente** | `ReferralCodeDisplay` (default export) |
| **Props** | Nessuna; usa hook `useAgentCode()` per `agentCode` e `isLoading` |
| **Struttura** | Il valore `agentCode` (es. "AGT-33826") è in uno `<span>` con `className="text-[15px] font-orbitron font-bold agent-code-badge tracking-wider"` e stili inline per colore/textShadow (cyan o red per MCP). |
| **Parent** | `UnifiedHeader.tsx` (linee 391–402): sopra c’è label "CODE" in `<span style={{ fontSize: '9px', ... }}>`, poi `<ReferralCodeDisplay />`. Il blocco è dentro un `motion.div` con flex. |
| **Font-size** | **15px** (Tailwind `text-[15px]`) — motivo per cui risulta troppo grande. |
| **CSS** | Tailwind + inline style; nessun max-width o truncate, quindi il codice può espandersi e sovrapporsi a "ON M1SSION" o altri elementi in header. |

**Piano header:** Ridurre a ~70–80% (es. 11px), aggiungere `max-w-[72px]` (o simile) e `truncate` / `overflow-hidden text-ellipsis` per evitare overlap. Safe-area non toccata (gestita dal parent UnifiedHeader).

---

## FASE 1 — Popup/Modal Mission (mappa)

| File | Componente | Stringhe hardcoded |
|------|------------|--------------------|
| `src/missions/ui/MissionPill.tsx` | Modal inline nel pill | `mission.title`, `mission.description`, `mission.phase1.instruction`, `mission.phase2.instruction` (da registry). Già usa `t('mapPills.mission.*')` per CTA/phase labels e close. |
| `src/missions/ui/MissionBriefingModal.tsx` | Briefing modal | "DAILY MISSION", `mission.title`, `mission.description`, "📍 PHASE 1 (TODAY)", "🔄 PHASE 2 (TOMORROW)", `mission.phase1.instruction`, `mission.phase2.instruction`, "+{phase1} M1U", "+{phase2} M1U", "TOTAL REWARD", "START MISSION", "Maybe later" |
| `src/missions/ui/MissionActionsModal.tsx` | Azioni missione | "MISSIONE IN CORSO", `mission.title`, `mission.phase1.instruction`, placeholder "Inserisci la risposta...", "Progresso", "Completa per +{phase1Reward} M1U", "Torna domani per completare...", "Premi + dopo ogni vittoria in Pulse Breaker" |
| `src/missions/ui/MissionCompletionModal.tsx` | Completion | "PHASE 2 UNLOCKS TOMORROW", pulsante close |
| `src/missions/ui/Phase2ResumeModal.tsx` | Phase 2 resume | Istruzioni phase2, placeholder, label, hint |
| `src/missions/missionsRegistry.ts` | Dati | Titoli/descrizioni per mission (es. "URBAN RIDDLE", "Non devi muoverti fisicamente...") — usati dai componenti sopra. |

**Strategia i18n:** Usare `t('mission.popup.<id>.title')` con fallback a `mission.title` (e idem per description/phase instructions) così non si modifica la struttura del registry. Aggiungere chiavi in `common.json` per le label comuni (dailyMission, phase1TodayLabel, phase2TomorrowLabel, startMission, close, maybeLater, totalReward, inProgress, placeholder, completeFor, returnTomorrow, ecc.) e per le missioni prioritarie (es. urban_riddle).

---

## FASE 1 — Setup i18n esistente

| Aspetto | Dettaglio |
|--------|-----------|
| **Init** | `src/i18n/i18n.ts` — init i18next + initReactI18next, risorse da `../locales/{en,it,fr}/common.json` |
| **Namespace** | Default `common` (file common.json) |
| **Uso** | `useTranslation()` da `react-i18next`; `t('key')` o `t('key', { reward: n })` |
| **Chiavi mission** | Già presenti: `mapPills.mission.startMission`, `mapPills.mission.close`, `mapPills.mission.phase1Today`, `phase2Tomorrow`, ecc. in en/it/fr |

---

## FASE 2 — Piano patch (sintesi)

1. **Header:** In `ReferralCodeDisplay.tsx` ridurre font (es. `text-[11px]`), aggiungere `max-w-[72px] truncate` (o `overflow-hidden text-ellipsis`) sullo span del codice; mantenere leggibilità e safe-area.
2. **Mission popups:** In `MissionPill`, `MissionBriefingModal`, `MissionActionsModal`, `MissionCompletionModal`, `Phase2ResumeModal`: importare `useTranslation`, sostituire tutte le stringhe fisse con `t('mission.popup.*')`; per title/description usare `t(\`mission.popup.${mission.id}.title\`)` con fallback a `mission.title` se la chiave non esiste. Aggiungere in en/it/fr le chiavi sotto `mission.popup` (dailyMission, phase1TodayLabel, phase2TomorrowLabel, startMission, close, maybeLater, totalReward, inProgress, placeholder, completeFor, returnTomorrow, phase2UnlocksTomorrow, ecc.) e per urban_riddle (e opzionalmente altre missioni) title/description.

— Fine audit —
