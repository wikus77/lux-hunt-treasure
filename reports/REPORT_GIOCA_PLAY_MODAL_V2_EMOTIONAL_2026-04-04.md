# REPORT — GIOCA modal V2 (emotional / wow layer, zero logic change)

**Date:** 2026-04-04  
**Scope:** Visual and motion only for `PlayModalEnterpriseShell` + play-surface backdrop timing when enterprise shell is active.

---

## A. Cosa è stato migliorato visivamente

- **Backdrop** più profondo e blur più forte quando il modale enterprise è attivo (`bg-black/70`, `backdrop-blur-[12px]`), con entrata leggermente più lunga e micro **scale 1.02 → 1** per sensazione “zoom in” controllato.
- **Scrim** fullscreen più denso (`bg-black/72`) + **doppio strato di radial gradient** animato (lieve pulse) per energia ambientale.
- **Glow ellittico** dietro la card (blur, pulse opacity) per sensazione “sistema vivo”.
- **Card**: bordo cyan più presente, **inner highlight** (inset), barra superiore più spessa con glow, **gradient frame** esterno leggero e **linea tech** orizzontale.
- **Hero** più piccolo e più smorzato (titolo ~`text-xl`, tagline/status più soft) così non compete con la CTA.
- **Secondarie**: icone con **drop-shadow colorato**, contenitori **gradient**, bordo/active con **glow cyan** al press; testo `text-white/72`; **dot** opzionale su Agent (MCP) e Battle (live) usando solo flag già calcolati nel layer.

---

## B. Come è stata resa dominante la CTA

- **Più spazio** sopra (`mt-9` / `mt-10`) rispetto allo status.
- **Entrata ritardata ~170 ms** dopo la card (focus temporale sulla transizione “missione”).
- **Altezza e padding** aumentati (`py-[1.2rem]` / `sm:py-[1.35rem]`), `font-extrabold`.
- **Gradiente** più contrastato e luminoso al centro; **highlight interno** (overlay + blob blur superiore).
- **Halo esterno** blur attorno al bottone.
- **Breathing** `box-shadow` in loop + **wrapper scale** 1 → 1.02 → 1 (solo se motion non ridotto).
- **Tap**: `whileTap` scale **0.96** + **burst** glow 120 ms su `pointerdown` (solo visivo).

---

## C. Animazioni aggiunte / aggiornate

| Area | Comportamento |
|------|----------------|
| Backdrop (shell on) | opacity + scale leggero, ~0.44s, easing premium |
| Wrapper shell (FPLV3) | fade ~0.36s |
| Card | spring (stiffness/damping) da **scale 0.88**, **y 18 → 0** |
| Radial full-view | keyframe opacity loop lento |
| Blob dietro card | opacity keyframe + scale iniziale |
| CTA container | delay **0.17s**, y/opacity |
| CTA | scale loop + shadow breathing + burst tap |
| Secondarie | fade/slide-y, stagger **~60 ms** tra righe + delay base **0.22s** |

Con **`prefers-reduced-motion`**: gradient animati disattivati dove indicato; spring/card sostituiti da durate minime; niente scale loop CTA; niente burst handler (early return).

---

## D. Percezione “gioco” vs pannello

- Più **dramaturgia** all’apertura (backdrop + card spring + energia di fondo).
- Un solo **focal point** chiaro (CTA grande, luminosa, quasi “chiamata”).
- **Control room** M1SSION: accenti cyan/violet, linee sottili, glow misurato — senza tornare alla HUD a pill.

---

## E. Conferma zero modifiche logiche

- **Invariati:** `HomePlaySurfaceContext`, `openSurface` / `closeSurface`, tutti gli handler, `wrapPlaySurfaceTap`, griglia pill nascosta, routing, BUZZ/MAP/IAP/PUSH/PE/M1U/Victory, header, bottom nav.
- **Solo aggiunte al layer:** props opzionali **`mcpActive`** e **`battleLive`** passate da valori **già presenti** in `FloatingPillLayerV3` → **solo UI** (pallino su riga).

---

## F. Test eseguiti

- `npm run build` — **pass**
- Lint su file modificati — **clean**
- QA dispositivo iOS (fluidità, tap CTA, dismiss) — **raccomandato**

---

## G. Valutazione finale

- **UX:** netto salto da “pannello ordinato” a **momento di gioco** con CTA magnetica e gerarchia rispettata.
- **Rischio:** animazioni multiple — da validare su **iPhone fisico** (WKWebView); rollback possibile con `APP_HOME_PLAY_MODAL_SHELL_ENABLED` o `prefers-reduced-motion` lato sistema.

**Verdetto:** **Go** tecnico post-build; **Go prodotto** dopo smoke test su device.
