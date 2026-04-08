# REPORT FIX MIRATO — `sheep_herd_v1` STILE REFERENCE (PECORE + CANE + BHEEEEE)

## 1. FORENSICS SUMMARY

- **Reference:** nel messaggio non era allegato il sorgente CodePen; come **comportamento chiave** (tipico demo herding) si è assunta: gregge **sempre in movimento** (wander + micro-variazioni), **repulsione netta** quando il pastore entra nel raggio, **sensazione di lavoro** del cane sulle pecore.
- **Pecore non abbastanza vive:** oltre ai hop grandi, mancava **shuffle frequente** a bassa energia e **deriva lenta di heading**; il plant-feet tra i hop lasciava troppo “silenzio” se i soli hop erano distanziati.
- **Cane poco “da lavoro”:** serviva **boost di prossimità** (più reazione quando il cane è vicino) e **spinta/steering** leggermente più forti, senza magnetismo verso il recinto.
- **Root primaria gregge:** solo hop episodici senza **strato continuo di micro-moto** controllato. **Root primaria cane:** `falloff` troppo morbido in profondità senza **curva di urgenza** vicino al driver.

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|----------------|
| `sheepHerdPhysics.ts` | Fisica gregge/cane | Alto |
| `sheepHerdTypes.ts` | Stato agente | Medio |
| `sheepHerdDraw.ts` | Pecora + fumetto | Medio |
| `SheepHerdGameCanvas.tsx` | RAF, baa gate, haptic/verde | Alto |
| `locales en/it/fr` | `daily_sheep.baa` | Basso |

## 3. ROOT CAUSE / DECISIONI TECNICHE

- **Pecore:** `idleMicroTimer` → micro-impulsi ravvicinati + `idleHeading` che **deriva lentamente** (`sham`); hop principali leggermente più forti e timer leggermente più corti; `hopAccent` anche su micro shuffle forte. Combinazione **fisica** + **bob** già esistente su `hopAccent`.
- **Cane:** `proximityBoost` su distanza normalizzata dentro `scareR`; `BASE_SCARE_R`, `FLEE_STRENGTH`, `FRICTION` ritoccati; herd + curl scalati con lo stesso boost. Touch **invariato** (stesso target/lerp canvas).
- **“Bheeeee”:** stato `baaDisplayFrames` / `baaCooldownFrames` per pecora; **gate globale** a intervalli (~68–208 frame) con `sham` deterministico; max **2** fumetti contemporanei; disegno **canvas** (`drawSheepSpeechBubble`) con `arcTo` (no `roundRect` legacy WK). Testo: `daily_sheep.baa` (EN `baa`, IT `bheeeee`, FR `bêêê`).

## 4. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `sheepHerdTypes.ts` | micro timer, baa frames | Stato | Basso |
| `sheepHerdPhysics.ts` | micro wander, dog boost, export `sham` | Feel + gate RNG | Basso |
| `sheepHerdDraw.ts` | `drawSheepSpeechBubble` | UI baa | Basso |
| `SheepHerdGameCanvas.tsx` | Gate baa, draw, import `sham` | Orchestrazione | Basso |
| `en/it/fr common.json` | `daily_sheep.baa` | i18n | Basso |

## 5. FIX APPLICATI

- Movimento pecore più **random / nervoso** (micro + heading drift + hop).
- Cane più **presente** vicino alle pecore (boost + tuning forze).
- Fumetto **occasionale**, cooldown per pecora, cap globale 2.
- Invariati: trap/lost, timer, weekly lato server, haptic trapped, recinto verde, altri daily.

## 6. TEST ESEGUITI

- `npm run build` — OK.
- iPhone: movimento, cane, baa, trap/haptic/verde — **manuale**.

## 7. RISCHI RESIDUI

- Con molte pecore e micro-shuffle, difficoltà leggermente più alta; ridurre `idleMicroTimer` frequency se serve.

## 8. GO / NO GO

- **GO condizionato al device:** allineamento al pattern herding richiesto + baa; **conferma su iPhone**. Poi ok prossimo mini-game.

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
