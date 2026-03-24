# FASE 0 — DAILY LEGACY HIDE / PREPARATION — REPORT

**Data:** 2026-03-13  
**Scope:** M1SSION™ iOS wrapped app only — hide tutta la UI daily legacy, nessuna implementazione v2  
**Riferimento:** Architecture Lock Fase -1; Build Assets Forensic Fix

---

# 1. EXECUTIVE SUMMARY

| Elemento | Esito |
|----------|--------|
| **Cosa è stato nascosto** | Tutta la UI daily legacy: controller globale, pill su Home/Map, card e modal daily in Next Action, modali Briefing/Actions/Phase2Resume/Completion. Nessun entrypoint daily legacy è più montato o visibile. |
| **Approccio usato** | **Un solo punto di controllo:** `MISSIONS_ENABLED = false` in `missionsRegistry.ts`. Tutti i componenti legacy già rispettavano questo flag; nessuna rimozione di codice, nessun refactor. |
| **Rischio complessivo** | **Basso.** Modifica minima (1 costante); rollback immediato ripristinando `MISSIONS_ENABLED = true`. Nessun tocco a DB, Edge, business logic, i18n, routing. |
| **Esito build** | **SUCCESS** (exit code 0, ~6m 18s). |
| **Esito cap sync ios** | **SUCCESS** (web assets copiati, capacitor.config.json e plugin iOS aggiornati). |
| **GO / NO GO Fase 1** | **GO FOR PHASE 1** — Fase 0 completata; nessuna regressione; terreno pronto per Core Engine MVP. |

---

# 2. INVENTARIO ENTRYPOINT LEGACY DAILY

## Componenti / entrypoint individuati

| Entrypoint | Dove è montato | Controllo hide | Nascosto da MISSIONS_ENABLED=false |
|------------|----------------|-----------------|-------------------------------------|
| **DailyMissionsController** | `App.tsx` (globale) | `if (!MISSIONS_ENABLED \|\| !isAuthenticated) return null` | Sì — non renderizza modali |
| **MissionPill** | `Home.tsx`, `MapTiler3D.tsx` | `if (!MISSIONS_ENABLED) return null` | Sì — non renderizza pill |
| **DailyMissionCard** | Solo esportato da `feedback/index.ts`; non montato in nessuna route attiva | `if (!MISSIONS_ENABLED) return null` | Sì (se mai usato) |
| **DailyMissionContent** | Dentro `DailyMissionFlipOverlay` in `NextActionContent.tsx` | Renderizzato solo se `mission` truthy; `mission` è `null` quando MISSIONS_ENABLED false (da NextActionContainer) | Sì — overlay non montato (mission && …) |
| **MissionBriefingModal** | Dentro `DailyMissionsController` | Controller return null → modali non montate | Sì |
| **MissionActionsModal** | Idem | Idem | Sì |
| **Phase2ResumeModal** | Idem | Idem | Sì |
| **MissionCompletionModal** | Idem | Idem | Sì |
| **Card daily in NextActionContent** | Blocco "Daily Mission" (GlassCard + loading/unavailable) in `NextActionContent` | Condizioni `MISSIONS_ENABLED && isMissionReady && …` | Sì — sezione optional mostra solo VERA BOMB se attiva |
| **Badge daily in NextActionContainer** | Badge "Daily Mission" in header Next Action | `MISSIONS_ENABLED && isMissionReady && !isMissionCompleted && mission` | Sì — mission = null |

## Cosa era realmente attivo

- **DailyMissionsController:** montato in App, gestiva modali Briefing / Phase2Resume / Actions / Completion.
- **MissionPill:** su Home e su Map (MapTiler3D), entry per aprire il flusso daily.
- **Next Action:** card daily inline + `DailyMissionFlipOverlay` con `DailyMissionContent`; badge daily in `NextActionContainer`. Tutto alimentato da `mission` (server mission) e da `MISSIONS_ENABLED`.

## Cosa è stato nascosto

- Con **MISSIONS_ENABLED = false**: controller non renderizza nulla, pill non appaiono, mission = null quindi nessuna card/badge daily e nessun overlay daily in Next Action. Tutti gli entrypoint sopra risultano nascosti.

---

# 3. MODIFICHE APPLICATE

## File toccati

- **`src/missions/missionsRegistry.ts`** (unico file modificato)

## Modifiche esatte

- **Prima:** `export const MISSIONS_ENABLED = true;`
- **Dopo:**  
  - Aggiunto commento che documenta Phase 0 (Daily Legacy Hide) e rollback.  
  - `export const MISSIONS_ENABLED = false;`

## Perché è il fix minimo e più sicuro

- Il codice legacy era già progettato per essere disattivato da `MISSIONS_ENABLED`: controller, pill, card, Next Action e modali rispettano tutti questo flag.
- Un solo punto di cambio evita incoerenze e riduce il rischio di dimenticare un entrypoint.
- Nessuna rimozione di codice: tutto resta nel repo e può essere riattivato con `MISSIONS_ENABLED = true`.
- Nessun tocco a DB, Edge, i18n, routing, logica server, VERA BOMB, micro-missions o flussi FROZEN.

## Cosa NON è stato toccato

- App.tsx, Home.tsx, MapTiler3D.tsx (nessun cambio di mount)
- NextActionContainer, NextActionContent (nessuna modifica)
- Componenti UI daily (MissionPill, DailyMissionCard, DailyMissionContent, modali)
- missionState, missionEngine, missionsRegistry (eccetto il valore della costante)
- claim-daily-phase, daily-mission-today, daily_mission_runs/claims
- i18n, routing, login/logout, IAP, BUZZ, BUZZ MAP, push

---

# 4. IMPACT ANALYSIS

## Flussi FROZEN

- **Login/logout, delete account, IAP, BUZZ, BUZZ MAP, push:** non toccati; nessuna modifica in auth, payment, buzz, map, notifiche.
- **Home / Map / Next Action:** solo la parte “daily mission” è nascosta; resto di Home, Map e Next Action (azioni principali, VERA BOMB se abilitata) invariato.
- **Header, bottom nav, safe area:** nessuna modifica.

## Next Action non-daily

- La sezione “Optional actions” resta visibile se `isVeraBombEnabled()` è true; con MISSIONS_ENABLED false viene mostrata solo la card VERA BOMB, non la daily. Comportamento coerente con l’obiettivo della Fase 0.

## Rischio residuo

- **Basso.** L’unico effetto desiderato è l’assenza di UI daily legacy. Rollback: impostare di nuovo `MISSIONS_ENABLED = true` in `missionsRegistry.ts`.

---

# 5. BUILD VERIFICATION

- **Comando:** `npm run build`
- **Esito:** **SUCCESS** (exit code 0)
- **Durata:** ~6m 18s
- **Warning:** solo i warning Rollup/Vite già presenti (dynamic vs static import); nessuno nuovo legato alla Fase 0.
- **Compilazione:** OK; `dist/` generato correttamente.

---

# 6. CAPACITOR SYNC IOS

- **Comando:** `npx cap sync ios`
- **Esito:** **SUCCESS**
- **Dettaglio:** web assets copiati da `dist` a `ios/App/App/public`; `capacitor.config.json` creato in `ios/App/App`; plugin iOS aggiornati.
- **Note:** nessun errore riportato.

---

# 7. FINAL VERDICT

## GO FOR PHASE 1

**Motivazione:**

1. **Fase 0 completata:** tutta la UI daily legacy è nascosta tramite `MISSIONS_ENABLED = false`; nessun entrypoint daily legacy è più visibile o apribile.
2. **Fix minimo e rollbackabile:** una sola costante modificata; nessuna rimozione di codice; rollback immediato con `MISSIONS_ENABLED = true`.
3. **Nessuna regressione:** flussi FROZEN, Home, Map, Next Action (non-daily), header e layout non sono stati alterati.
4. **Build e sync OK:** `npm run build` e `npx cap sync ios` entrambi andati a buon fine.
5. **Nessun tocco fuori scope:** DB, Edge, business logic server, i18n, routing invariati; nessuna implementazione v2.

Si può procedere con **Fase 1 — Core Engine MVP** (server-driven mission, run/claim, M1U+PE, nuova card, timer/refetch, i18n) nel rispetto dell’Architecture Lock e delle condizioni già definite.

---

*Report Fase 0 — Daily Legacy Hide / Preparation — M1SSION™ iOS only.*
