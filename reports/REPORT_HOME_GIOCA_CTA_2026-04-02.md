# REPORT — Home CTA «GIOCA» + pill nascosti fino ad attivazione

**Data:** 2026-04-02  
**Scope:** Solo Home iOS / layout V3 floating pills. Nessuna modifica a BottomNavigation, UnifiedHeader, logica business dei pill.

---

## 1. Forensics summary

| Elemento | Dove vive |
|----------|-----------|
| **Prossima azione (float)** | `FloatingPillLayerV3` → `ActionRadialHubPill` (`ActionRadialHubPill.tsx`) |
| **Tempo rimasto / Battle** | `FloatingPillLayerV3` → `FloatingTimeRingPillV3`, `FloatingBattlePillV3` |
| **COMMIT (float)** | Stesso layer: `CommitRadialHubPill` o `FloatingCommitPillV3` |
| **Prossima azione (scroll)** | `AppHome` → `NextActionContainer` (`#home-daily-mission`) |
| **COMMIT (scroll)** | `AppHome` → `CommitNodesContainer` (`#home-daily-commit`) |

**Effetto “foto 2” (focus / blur):**  
- **Radial hub aperto:** in `ActionRadialHubPill` un `motion.button` full-screen con classi equivalenti a `fixed inset-0 bg-black/35 backdrop-blur-[2px]` chiude l’hub al tap (`aria-label` dismiss).  
- **Next Action a schermo intero:** `NextActionFlipOverlay` (modal dedicata, `z-index` molto alto) — *non* riusata per GIOCA per non duplicare lock scroll / animazione flip; per il play surface si è riusata **la stessa ricetta visiva del radial hub**.

**Stato minimo:** `HomePlaySurfaceContext`: `surfaceActive`, `openSurface`, `closeSurface`, `playGateEnabled` (disabilita tutto il gate in un solo flag).

---

## 2. Architettura del fix

- **CTA:** `HomeGiocaCta` — `createPortal` su `document.body`, `bottom: calc(88px + safe-area + 14px)` (allineato al padding inferiore del layer pill V3, sopra la bottom bar), `z-index` = `FLOATING_PILLS_V3_Z_INDEX + 80` (sopra il layer 9500, sotto BottomNav 10000). Animazione ingresso + loop scale/boxShadow (rispetta `useReducedMotion`).
- **Pill float:** `FloatingPillLayerV3` legge il context: se gate attivo e `!surfaceActive`, opacità 0 + `pointer-events-none` sui quattro pill; **Agent** resta sempre montato e visibile.
- **Backdrop play mode:** stesso token CSS esportato da `HomePlaySurfaceContext` (`HOME_PLAY_SURFACE_BACKDROP_CLASS`) del radial hub; `AnimatePresence` + tap → `closeSurface()`.
- **Scroll:** `HomePlayGatedVisibility` aggiunge `hidden` (mount invariato) su `#home-daily-commit` e `#home-daily-mission` quando il gate è idle — coerente con `APP_HOME_HIDE_SCROLL_SECTIONS_UI` (doppia `hidden` se entrambi attivi, innocuo).

---

## 3. File toccati

| File | Ruolo | Modifica | Rischio |
|------|--------|----------|---------|
| `src/contexts/HomePlaySurfaceContext.tsx` | Stato + classe backdrop condivisa | **Nuovo** | Basso |
| `src/components/home/HomeGiocaCta.tsx` | CTA GIOCA | **Nuovo** | Basso |
| `src/components/home/HomePlayGatedVisibility.tsx` | Hide scroll sections | **Nuovo** | Basso |
| `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` | Backdrop + show/hide 4 pill / Agent separato | **Edit** | Basso |
| `src/pages/AppHome.tsx` | Provider, gate flag, wrapper scroll, mount CTA | **Edit** | Basso |
| `src/config/appHomeUiHide.ts` | `APP_HOME_GIOCA_PLAY_GATE_ENABLED` | **Edit** | Basso (rollback 1 riga) |
| `src/locales/{en,it,fr}/common.json` | `home_gioca_cta`, `home_play_surface_dismiss` | **Edit** | Basso |

---

## 4. UX implementata

- **Stato iniziale (gate ON):** nascosti i quattro pill float + sezioni scroll Commit / Prossima azione; visibile CTA; Agent visibile.
- **Tap GIOCA:** `surfaceActive=true`, CTA scompare, pill compaiono con fade, backdrop full-screen (dim/blur come hub).
- **Uscita:** tap sul backdrop → `closeSurface()`, pill nascosti di nuovo, CTA torna.  
- **Tap su un pill:** comportamento invariato (stessi `onTap` / radial interno). Chiudendo solo il radial, il play surface resta attivo finché non si tappa il backdrop (scelta documentata: coerente con “focus area” persistente).

---

## 5. Riuso effetto esistente

- **Riusato:** stringa di classi Tailwind identica al dismiss overlay di `ActionRadialHubPill` (`bg-black/35 backdrop-blur-[2px]`, full screen, pointer-events sul backdrop).
- **Non duplicato:** logica di navigazione / slot radial / `NextActionFlipOverlay`.
- **Evitato:** secondo sistema di blur diverso dal hub.

---

## 6. Test eseguiti

- `npm run build` — OK.

Verifica manuale consigliata su iPhone: ingresso Home, tap GIOCA, interazione pill, tap fuori (backdrop), safe area, con `APP_HOME_GIOCA_PLAY_GATE_ENABLED` true/false.

---

## 7. Rischi residui

- Stato `surfaceActive` persiste mentre la route Home resta montata (es. alcuni pattern di navigazione): accettabile; uscita dalla Home smonta il provider e resetta.
- Con hub Prossima azione aperto + play surface, due layer di blur concettuali; tap sul backdrop del hub chiude prima l’hub (comportamento esistente).

---

## 8. GO / NO-GO

- **Stabile:** sì, gate disattivabile con `APP_HOME_GIOCA_PLAY_GATE_ENABLED = false`.
- **Effetto enterprise:** allineato al backdrop già usato dal radial hub; CTA premium separata.
- **Prossimi mini-game:** nessun blocco (nessuna modifica al daily engine).

---

## 9. Comandi finali

```bash
npm run build
npm run cap:ios:incremental
```
