# HOME i18n PHASE 3 — Forensic Report (Verification Only)

**Data:** 2026-02-13  
**Branch:** fix/i18n-global-ultra-safe  
**Rollback anchor:** `SNAPSHOT_PRE_HOME_I18N_PHASE3` (tag on current HEAD before patches)

---

## A) FILE → Stringhe trovate → Rischio

| File | Stringhe trovate | Rischio |
|------|------------------|--------|
| **StreakModal.tsx** | "Fiamma Nascente", "Fiamma Ardente", "Inferno", "Leggenda Streak", "Campione Missione", "Diamante", "Re della Streak"; "STREAK SYSTEM", "Accedi ogni giorno per bonus esclusivi"; "Giorni Streak", "Record"; "Prossimo badge:", "giorni"; "PE Bonus", "M1U Bonus"; "Badge Streak"; "Check-in Completato!"; "CHECK-IN GIORNALIERO", "COMPLETATO OGGI"; "Torna domani per continuare la streak!"; toasts: "Nuovo badge sbloccato", "Streak resettata! Ricomincia da 1", "Streak: X giorni! +2 M1U", "Errore durante il check-in" | **UI-only** |
| **ShopModal.tsx** | "M1SSION SHOP", "Saldo"; tab labels "RIVELA", "PROGRESSIONE", "PERCORSO"; "Acquista un biglietto e gratta per vincere INDIZI o fino a 100.000 M1U!"; "Progressione GRATUITA disponibile!", "Avanza nella tua progressione giornaliera", "GIRA ORA!"; "Hai già girato oggi", "Torna domani per un nuovo giro gratuito!"; "Servono X M1U", "Limite giornaliero raggiunto", "rimasti oggi", "Milestone: +X M1U", "BONUS"; toasts: "Devi essere autenticato", "Saldo insufficiente", "Errore" | **UI-only** (no IAP/purchase logic) |
| **ShopContent.tsx** | "Progressione GRATUITA disponibile!", "Avanza nella tua progressione giornaliera", "GIRA ORA!"; "Hai già girato oggi", "Torna domani per un nuovo giro gratuito!" | **UI-only** |
| **NextActionContainer.tsx** | "Nuova!", "P1", "P2 🔜", "P2!"; "NEXT ACTION", "GIOCA", "URGENTE"; "Tocca per vedere le opzioni", "Solo X giorni rimasti!" | **UI-only** |
| **ActiveMissionBox.tsx** | Timeline: "Missione Iniziata", "Primo Indizio", "Fase Intermedia", "Deadline Finale"; contrast: text-white/60, text-white/70, text-white/50 ancora presenti in alcuni punti | **UI-only** (solo t() + className) |
| **AgentDiary.tsx** / **AgentDiaryContent.tsx** | Già migrati in Phase 2; eventuali residui in LongPress o label secondarie | **UI-only** |
| **LotteryContent.tsx** (shop) | "Progressione attivata!" e altri testi UI tab Percorso | **UI-only** |
| **FortuneWheel.tsx** (usato da Home/Shop) | "Progressione giornaliera completata. Torna domani!", "Progressione completata! +10 punti", "Progressione completata!" | **UI-only** |
| **ScratchWinModal.tsx** (usato da Shop) | "Progressione completata!", "Rivelazione completata!", "Rivelazione completata" | **UI-only** |

---

## B) Lista file da toccare e conferma “nessuno vietato”

- `src/components/gamification/StreakModal.tsx` — **OK** (solo UI, supabase per dati/check-in non è “backend logic” da non toccare: il check-in resta identico, cambiano solo stringhe utente)
- `src/components/shop/ShopModal.tsx` — **OK** (solo label/toast/descrizioni; nessun cambio a handlePurchase, SKU, processSubscription)
- `src/components/shop/ShopContent.tsx` — **OK** (solo testi tab Progressione)
- `src/components/feedback/NextActionContainer.tsx` — **OK** (solo label/CTA)
- `src/components/command-center/home-sections/ActiveMissionBox.tsx` — **OK** (timeline t() + contrast classNames)
- `src/components/shop/LotteryContent.tsx` — **OK** (solo testi UI)
- `src/components/feedback/FortuneWheel.tsx` — **OK** (solo messaggi/toast UI)
- `src/components/scratch/ScratchWinModal.tsx` — **OK** (solo testi UI)
- `src/locales/it/common.json`, `src/locales/en/common.json`, `src/locales/fr/common.json` — **OK** (solo chiavi/valori)

**Nessuno dei file sopra è in elenco vietato** (auth, Buzz, backend, IAP logic, store, routing).

---

## C) Perché alcune parti sono rimaste in IT

1. **Streak modal:** Mai migrato a `t()`; tutte le stringhe sono hardcoded in italiano (milestone names, labels, CTA, toasts).
2. **Shop modal / ShopContent:** Tab e descrizioni sono stringhe fisse in IT; toasts e messaggi di errore/successo idem. Nessuna chiave i18n usata.
3. **Next Action container:** Il contenuto del modale (NextActionContent) è stato localizzato in Phase 2, ma il **container** (bottone verde in Home) non usa `useTranslation`: label "Nuova!", "Tocca per vedere le opzioni", "Solo X giorni rimasti!", "NEXT ACTION", "GIOCA", "URGENTE" sono ancora hardcoded.
4. **M1SSION AGENT:** Phase 2 ha migrato la maggior parte; eventuali residui (es. LongPress items in AgentDiaryContent o DailyMissionCard) sono stringhe costruite inline o chiavi mancanti.
5. **Container espandibili (Tempo rimasto / Stato missione / Indizi):** In Phase 2 sono state alzate alcune opacità (es. /40→/60, /50→/70); restano classi tipo text-white/60, text-white/70, text-white/50 in punti che l’utente segnala ancora poco leggibili — serve un ulteriore bump consistente (es. /60→/80, /70→/85, /50→/70).
6. **ActiveMissionBox timeline:** La funzione `getMissionTimeline()` restituisce `event` in italiano ("Missione Iniziata", "Primo Indizio", ecc.); non passa da `t()`.

---

## Rollback

```bash
git reset --hard SNAPSHOT_PRE_HOME_I18N_PHASE3
```

---

## FASE 2 — Patch applicate (completata)

- Locales: chiavi streak, shop, next_action, home_active_timeline, fortune, scratch (IT/EN/FR)
- StreakModal: titolo, sottotitolo, giorni/record, badge, CTA, toasts, milestone names
- NextActionContainer: NEXT ACTION, GIOCA, URGENTE, Tocca per vedere, giorni rimasti, Nuova!/P1/P2
- ShopModal: titolo, Saldo, tab RIVELA/PROGRESSIONE/PERCORSO, descrizioni, toasts, BONUS, rimasti oggi
- ShopContent: Progressione GRATUITA, GIRA ORA!, Hai già girato, Torna domani
- ActiveMissionBox: timeline (Missione Iniziata, Primo Indizio, Fase Intermedia, Deadline Finale) + contrast bump (/60→/80, /70→/85, /50→/70)
- FortuneWheel: toasts progressione, M1U aggiunti, premio accreditato, errore, getResultMessage
- ScratchWinModal: toasts MILESTONE/Progressione/Indizio/Rivelazione, completion text

---

## FASE 3 — Checklist validazione (post-patch)

- [x] Build: `npm run build` OK
- [x] Lint: nessun errore sui file modificati
- [ ] **Manuale (da fare su dispositivo):** iPhone in FR → Home + Streak + Shop + Next Action + M1SSION AGENT + container espandibili tutti in francese
- [ ] **Manuale:** iPhone in EN → stessi screen in inglese
- [ ] **Manuale:** iPhone in IT → invariato (italiano)
- [ ] **Manuale:** Shop e Streak funzionano identici (solo testo cambiato)
- [ ] **Manuale:** Container espandibili (Tempo rimasto / Stato missione / Indizi) leggibili (contrasto ok)

---

## Prossimo step

Se confermi che tutti i file sono in scope e UI-only: procedere con **FASE 2 — Patch mirate** (1 file = 1 commit). *(Fatto.)*
