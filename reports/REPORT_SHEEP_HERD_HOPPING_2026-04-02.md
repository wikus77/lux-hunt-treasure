# REPORT FIX MIRATO — `sheep_herd_v1` PECORE SALTELLANTI

## 1. FORENSICS SUMMARY

- **Perché sembrava ancora floating:** gli impulsi idle erano **discreti**, ma dopo ogni impulso `vx/vy` continuavano a essere integrate **ogni frame** con `FRICTION` → residuo di velocità e spostamento **continuo** tra un hop e il successivo (60 fps = scivolamento liscio). Su schermo piccolo questo legge come **particella / drone**, non come **fermo → scatto**.
- **Perché il fix burst+pause non bastava:** mancava una fase esplicita **“piante i piedi”** fuori dall’influenza del cane; inoltre **spawn** con `vx/vy` iniziali ≠ 0 aggiungeva deriva da frame 1; impulsi ancora **moderati** rispetto al drag visivo.
- **Root cause:** **fisica** (glide continuo tra hop), non solo “tipo di random”; **secondaria:** assenza di **accento verticale** sul canvas (tutto planare).

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|----------------|
| `sheepHerdPhysics.ts` | Idle hop, integrazione | Alto |
| `sheepHerdTypes.ts` | Stato agente | Medio |
| `sheepHerdDraw.ts` | Silhouette pecora | Medio (bob) |
| `SheepHerdGameCanvas.tsx` | Passaggio `hopAccent` | Minimo |

## 3. ROOT CAUSE / DECISIONE TECNICA

- **Combinazione:** (1) **Hop fisico più netto** (`hopMag` aumentato, pause leggermente più lunghe). (2) **`idleCoastFrames`**: dopo l’impulso, poche frame di coast; poi, se `d >= scareR` (cane fuori raggio), **`vx/vy *= IDLE_PLANT_FEET_MUL`** ogni frame → velocità idle si azzera in fretta = **stop-go** reale. (3) **Spawn** `vx=vy=0`. (4) **`hopAccent`** decrescente + **micro translate/scaleY** in `drawSheep` solo per `free` → lettura saltello **senza** cartoon.
- **Cane invariato:** il plant-feet si applica solo quando `d >= scareR`, quindi **non** smorza la fuga sotto il driver.

## 4. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `sheepHerdTypes.ts` | `idleCoastFrames`, `hopAccent` | Stop-go + visivo | Basso |
| `sheepHerdPhysics.ts` | Coast, plant-feet, hop, spawn | Eliminare glide | Basso |
| `sheepHerdDraw.ts` | Param `hopAccent01`, bob | Leggibilità salto | Basso |
| `SheepHerdGameCanvas.tsx` | Passa `s.hopAccent` | Wire visivo | Basso |

## 5. FIX APPLICATO

- Idle: **impulso più forte** + **coast breve** + **smorzamento aggressivo** tra hop quando il cane non è in `scareR`.
- Visivo: **bob/squash** leggerissimo legato a `hopAccent`.
- Invariati: blocco cane (`d < scareR`), trap/lost, timer, haptic, recinto verde, HUD.

## 6. TEST ESEGUITI

- `npm run build` — OK.
- Device: idle saltellante, guida cane, trap/haptic/verde — **manuale iPhone**.

## 7. RISCHI RESIDUI

- Se il plant-feet fosse percepito troppo “secco” quando il cane esce dal raggio con il gregge ancora veloce, restringere la condizione (solo se `|v|` sotto soglia) — da valutare in playtest.

## 8. GO / NO GO

- **GO condizionato al device:** il problema “glide tra hop” è affrontato in fisica + micro bob; **conferma finale su iPhone**. Poi si può passare al prossimo mini-game.

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
