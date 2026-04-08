# REPORT FORENSICS + FIX — `sheep_herd_v1` LEGGIBILITÀ + TOUCH + HERDING

## 1. FORENSICS SUMMARY

- **Perché non sembravano pecore e cane:** il canvas disegnava solo **cerchi pieni piccoli** (~2.2% / ~2.8% di `min(w,h)`), senza silhouette o differenza semantica tra “gregge” e “driver”. Su schermo iPhone risultavano **pallini astratti**.
- **Perché touch/herding non era chiaro:** (1) il **dog** seguiva il target con **lerp ~0.26** → sensazione di ritardo rispetto al dito; (2) **raggio di spavento** base piccolo (`BASE_SCARE_R` ~0.068 × `scare_radius_mul`) e **fuga debole** con **attrito alto** e **rimbalzi molto smorzati** → le pecore sembravano quasi ferme o poco “spinte”; (3) nessuna **componente verso il recinto** quando il driver era vicino → difficile percepire di **guidarle dentro** anziché solo allontanarle.
- **Root cause primaria:** combinazione **identità visiva assente** (dots) + **feedback dinamico debole** (influenza e moto poco leggibili).
- **Root cause secondarie:** HUD solo numerico; nessun **micro-feedback** su ingresso recinto / perdita; possibile **re-render React ogni frame** se `setHud` veniva chiamato incondizionatamente (performance / jank su WKWebView).

---

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|----------------|
| `SheepHerdGameCanvas.tsx` | Loop RAF, input pointer, HUD sopra canvas, orchestrazione disegno | **Alto** — rendering, touch, stato HUD |
| `sheepHerdPhysics.ts` | `stepFlock`, raggi pen/scare, integrazione velocità/posizione, trap/lost | **Alto** — feeling herding |
| `sheepHerdDraw.ts` | Funzioni canvas vettoriali (pecora, driver, recinto) | **Nuovo / integrato** — identità visiva |
| `SheepHerdModal.tsx` | Shell modale, testi istruzioni, claim flow | **Medio** — hint testuale |
| `sheepHerdUtils.ts` | RNG, `len`, clamp | **Basso** — utility |
| `sheepHerdTypes.ts` / `sheepHerdProgression.ts` | Tipi e parsing params server | **Lettura** — nessuna modifica necessaria |
| `src/locales/en|it|fr/common.json` | Stringhe `daily_sheep.*` | **Medio** — hint breve |

---

## 3. ROOT CAUSE

| Area | Tecnico |
|------|---------|
| **Rendering** | Solo `arc`+`fill` per pecore e cane → nessuna testa/corpo/direzione; recinto = doppio cerchio senza enfasi “target”. |
| **Fisica** | Spavento lineare debole, raggio ridotto, attrito 0.88, bounce pareti 0.35, nessun bias verso `PEN_CX/PEN_CY` quando il driver è nel raggio → percezione “non le spingo nel recinto”. |
| **Feedback UX** | Obiettivo spiegato ma non **ancorato** a ruoli visivi; nessun pulse su trap/lost a livello canvas. |

Classificazione: **tutte e tre** (visivo + fisica + UX), con **primato visivo + dinamica**.

---

## 4. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `sheepHerdDraw.ts` | (esistente) `drawSheep`, `drawDog`, `drawPenTarget` | Silhouette leggibili, recinto come target | Basso — isolato canvas |
| `SheepHerdGameCanvas.tsx` | Usa draw helpers; lerp dog; pulse pen/lost; `activePointerIdRef`; `setHud` solo se cambiano valori | Leggibilità, touch, performance HUD | Basso |
| `sheepHerdPhysics.ts` | Costanti client: scare, flee, friction, bounce, bias verso pen, `CLIENT_MOTION_MUL` | Herding più leggibile | Basso-medio: feeling più “facile” in app (tier server invariati) |
| `SheepHerdModal.tsx` | Riga `daily_sheep.hint_touch` | Chiarezza ruoli | Basso |
| `src/locales/en|it|fr/common.json` | Chiave `daily_sheep.hint_touch` | i18n | Basso |

**Non toccati:** Edge, DB, `time_limit_sec`, progressione weekly server, altri mini-game, daily engine.

---

## 5. FIX APPLICATI

1. **Identità visiva:** pecora = ellisse lana + testa scura + orecchie + glint; driver = anello esterno + capsula direzionale + muso; recinto = alone + tick “gate” + pulse quando aumenta `trapped`.
2. **Fisica più leggibile:** `BASE_SCARE_R` aumentato, `FLEE_STRENGTH` e scala moto client aumentate, `FRICTION` più alto per movimento più fluido ma con spinta più evidente, bounce pareti meno “morto”, **bias verso il centro recinto** quando il driver è vicino (solo client, moltiplicatori server `scare_radius_mul` / `sheep_speed_mul` restano applicati come prima).
3. **Touch:** lerp dog **0.52**; tracking **`pointerId`** per coerenza multi-touch / WKWebView.
4. **Feedback:** vignetta rossa breve quando aumenta `lost`; pulse cerchio recinto su nuovo `trapped`; hint una riga nel modale.
5. **Performance HUD:** `setHud` aggiornato solo se cambiano secondi / trapped / lost.

---

## 6. TEST ESEGUITI

| Caso | Esito |
|------|--------|
| **A — identità visiva** | Verifica statica codice + build: silhouette e driver non sono più dot anonimi. |
| **B — touch** | Codice: `pointerId` + lerp più alto; **verifica dispositivo iPhone consigliata**. |
| **C — herd into pen** | Codice: bias + scare più forte; **playtest reale consigliato**. |
| **D — recinto** | Pulse su incremento `trapped` + contatori HUD invariati semanticamente. |
| **E — perdite** | Vignetta su incremento `lost` + stato `lost` invariato. |
| **F — no regressioni** | `npm run build` OK; solo file modulo sheep + stringhe i18n; nessun edit a pin/TTT/engine. |

---

## 7. RISCHI RESIDUI

- Difficoltà percepita del round può **scendere leggermente** su tier con moltiplicatori generosi (solo tuning client). Se in playtest fosse troppo facile, si possono ridurre marginalmente `FLEE_STRENGTH` o il coefficiente del bias **nel solo** `sheepHerdPhysics.ts`.

---

## 8. GO / NO GO

- **GO:** il mini-game è **comprensibile** a livello UI/fisica rispetto alla versione “pallini”; è **testabile subito su iPhone** (Capacitor sync eseguito).
- Si può **passare al mini-game successivo** dopo smoke test sul device (1 round completo, trap + lost + timer).

---

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```

(Eseguiti in questa sessione: entrambi con exit code 0.)
