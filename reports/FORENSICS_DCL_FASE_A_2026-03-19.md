# FORENSICS FASE A — DCL Realtime + CTA (read-only)

**Data:** 2026-03-19

## 1. ROOT CAUSE NON-REATTIVITÀ

- **Perché la card non si aggiorna subito:** useTodayDailyState refetcha solo su mount (tutti i fetch), su visibilitychange/focus (solo fetchCommitAndStreak) e dopo claim bonus (refetch completo). Non esiste alcun listener per "Commit completato", "Streak completata", "Missione completata".
- **Eventi mancanti:** CommitModal non emette eventi al success; StreakPill emette già `streak-updated` su onCheckInComplete; nessun evento "daily mission completed" da nessuna parte.
- **Refresh mancanti:** Dopo chiusura Commit modal (success), dopo check-in Streak, dopo completamento missione nel flow NextAction/DailyMissionContent non viene mai chiamato refetch della card.

## 2. ROOT CAUSE CTA "VUOTE"

- **Perché fanno solo scroll:** DailyControlLoopCard chiama scrollToCommit(), scrollToStreak(), scrollToMission() (document.getElementById + scrollIntoView). Non esiste alcun meccanismo per "apri il modal X".
- **Dove vive l'open state:** Commit: `CommitNodeTrigger` (useState isModalOpen). Streak: `StreakPill` (useState showModal). Mission: `NextActionContainer` (useState isModalOpen, handleOpenModal). Tutti e tre sono sotto AppHome ma in componenti diversi, senza API esposta per aprire da fuori.

## 3. STRATEGIA ULTRA SAFE

- **Realtime:** Riusare `streak-updated`; introdurre `dcl-commit-done` (emit da CommitModal su success) e `dcl-mission-done` (emit da DailyMissionContent su setShowCompletion). Nella card: un solo useEffect che aggiunge listener per i tre eventi e chiama refetch(); cleanup removeEventListener. Zero polling, zero hack.
- **CTA:** Context locale **DclLauncherContext** con tre ref (openCommitRef, openStreakRef, openMissionRef) e funzioni openCommit/openStreak/openMission che invocano ref.current?.(). I tre componenti (CommitNodeTrigger, StreakPill, NextActionContainer) al mount registrano la propria funzione di apertura; la card usa il context e chiama open* al tap. Fallback: se open ritorna false (ref non ancora impostato), scroll come oggi.

## 4. FILE MINIMI DA TOCCARE

| File | Modifica |
|------|----------|
| **Nuovo:** `src/contexts/DclLauncherContext.tsx` | Context + Provider con 3 ref e open* |
| `src/pages/AppHome.tsx` | Wrap contenuto Home in DclLauncherProvider |
| `src/components/home/DailyControlLoopCard.tsx` | useDclLauncher; CTA chiamano open* + fallback scroll; useEffect listener eventi → refetch |
| `src/components/commit/CommitNodeTrigger.tsx` | useDclLauncher; registra openCommit in useEffect |
| `src/components/gamification/StreakPill.tsx` | useDclLauncher; registra openStreak in useEffect |
| `src/components/feedback/NextActionContainer.tsx` | useDclLauncher; registra openMission in useEffect |
| `src/components/commit/CommitModal.tsx` | dispatch `dcl-commit-done` su success (dopo setState('reward')) |
| `src/components/feedback/DailyMissionContent.tsx` | dispatch `dcl-mission-done` dove si chiama setShowCompletion(true) |

## 5. RISCHI

- **Regressioni:** Nessuna modifica a logica Commit/Streak/Mission; solo emissione eventi e registrazione open. Se il context non è disponibile (card fuori provider), open* sono no-op; card già in AppHome sotto lo stesso albero del provider.
- **Conflitti:** streak-updated già usato da StreakPill per loadStreakData; aggiungere un listener in più non lo rompe.
- **Punti delicati:** NextActionContainer.handleOpenModal usa originRect da event; per apertura programmatica si imposta originRect a null (overlay può gestire null).
