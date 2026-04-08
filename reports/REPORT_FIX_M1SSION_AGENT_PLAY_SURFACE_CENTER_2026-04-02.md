# REPORT FIX — M1SSION AGENT CENTRALE NEL PLAY SURFACE

**Data:** 2026-04-02  
**Ambiente:** app nativa iOS (Capacitor WKWebView), Home play surface dopo tap **GIOCA**.

---

## 1. FORENSICS SUMMARY

- **Perché Agent non appariva:** Il pill centrale era avvolto in `{!hideAgentPill && (…)}`. Su `AppHome` viene passato `hideAgentPill={APP_HOME_HIDE_FLOATING_AGENT_PILL}` e in `src/config/appHomeUiHide.ts` **`APP_HOME_HIDE_FLOATING_AGENT_PILL` è `true`**. Quindi nel branch `usePlayCrossLayout` (play surface) l’intero blocco `FloatingAgentPillV3` **non veniva montato**: restavano solo Prossima azione, Tempo, COMMIT, M1SSION BATTLE (4 pill).
- **Perché il report precedente era incoerente con la UI:** `REPORT_HOME_PLAY_SURFACE_LAYOUT_2026-04-02.md` descriveva la griglia 3×3 e la cella (2,2) per l’Agent **senza menzionare** il gate `hideAgentPill` applicato anche al play cross. La struttura CSS era corretta “a livello di documento”, ma il **render condition** escludeva l’Agent quando il flag globale era attivo.
- **Root cause certa:** **Doppio intento non separato:** `hideAgentPill` serviva a nascondere l’Agent sui binari legacy Home, ma era stato riusato anche nel layout play surface, dove invece l’Agent è richiesto al centro. Con flag `true`, l’Agent non esiste nel DOM in quel branch.

---

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento reale |
|------|--------|----------------------|
| `FloatingPillLayerV3.tsx` | Layer pill floating + griglia play | Branch `usePlayCrossLayout`: Agent era dietro `!hideAgentPill`. |
| `AppHome.tsx` | Montaggio layer | Passa `hideAgentPill={APP_HOME_HIDE_FLOATING_AGENT_PILL}`. |
| `appHomeUiHide.ts` | Feature flag UI Home | `APP_HOME_HIDE_FLOATING_AGENT_PILL = true` → Agent escluso nel play cross prima del fix. |
| `HomePlaySurfaceContext.tsx` | `surfaceActive` / `playGateEnabled` | Corretto: abilita `usePlayCrossLayout`; non era la causa dell’Agent mancante. |
| `FloatingAgentPillV3.tsx` | UI pill Agent | Nessun bug di visibilità intrinseco; non montato per condizione padre. |

---

## 3. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|----------|--------|---------|
| `FloatingPillLayerV3.tsx` | Nel solo branch play cross (`usePlayCrossLayout`), rimosso il wrapper `!hideAgentPill` attorno al `motion.div` + `FloatingAgentPillV3` centrale; aggiunto commento breve. | Garantire 5 pill e Agent al centro quando il play surface è attivo, senza cambiare callback o contenuti. | Basso: il branch legacy continua a rispettare `hideAgentPill` per l’Agent. |

---

## 4. FIX APPLICATO

- **Cosa:** Nel layout a croce (play surface), l’Agent viene **sempre** renderizzato nella cella centrale (grid 2,2), indipendentemente da `hideAgentPill`.
- **Perché basta:** È l’unica condizione che impediva il mount dell’Agent con la configurazione attuale (`hideAgentPill === true`).
- **Perché è safe:** Nessun cambio a `handleAgent`, props del pill, o agli altri pill. `hideAgentPill` resta efficace nel branch **legacy** (due binari), dove l’Agent continua a essere opzionale.
- **Invariato:** Gating GIOCA, blur/dim, ordine e contenuti degli altri pill, routing, header, bottom nav, engine missioni, altri file.

---

## 5. TEST ESEGUITI

- **Build:** `npm run build` — completato con successo (`✓ built`, exit 0).
- **Verifica logica (codice):** Con `usePlayCrossLayout === true`, il sottoalbero Agent non dipende più da `hideAgentPill`.
- **Lint:** `FloatingPillLayerV3.tsx` senza errori dal language service.
- **Verifica device:** da fare su iPhone dopo `npm run cap:ios:incremental`: 5 pill, Agent centrato, overlap/clipping (checklist QA).

*(Test visivo reale su dispositivo: raccomandato come checklist QA post-sync iOS.)*

---

## 6. RISCHI RESIDUI

- Se in futuro si volesse **disabilitare l’Agent anche in play mode** per policy, servirà un flag dedicato (es. solo play surface), non riusare `hideAgentPill` senza eccezioni.

---

## 7. GO / NO GO

- **GO:** Con `hideAgentPill` true su Home, l’Agent **è montato e posizionato al centro** nel play surface; il layout a 5 pill **allinea documentazione e comportamento atteso**.
- **Layout:** Corrisponde alla richiesta: TL Prossima azione, TR Tempo, centro Agent, BL COMMIT, BR Battle.
- **Prossimi mini-game:** Sì, si può procedere; questo fix è circoscritto al solo rendering del pill Agent nel play cross.

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
