# REPORT FORENSICS + FIX — `sheep_herd_v1` MOVIMENTO REALISTICO + SPINTA CANE

## 1. FORENSICS SUMMARY

- **Movimento “fluttuante”:** l’idle usava **accelerazione sinusoidale continua** (`cos/sin` di fase che avanza ogni frame) integrata con attrito alto → traiettorie **lisce e orbitali**, percepite come particelle che galleggiano, non come animali che **fermano / ripartono**.
- **Spinta cane poco intuitiva:** la forza era quasi solo **radiale** (via dal cane) con un **bias debole** verso il recinto. Mancava una **rotazione leggibile** intorno al pressore (effetto “pastore che curva il gregge”) e la componente verso il recinto **non** si intensificava quando la fuga era già allineata utile → sensazione di forza astratta più che di **condurre**.
- **Root primaria movimento:** idle = campo di forza morbido invece di **impulsi + pause**.
- **Root primaria guida:** repulsione radiale dominante **senza** steering tangenziale né rinforzo quando `flee · toPen` è positivo.
- **Secondarie:** `falloff²` troppo morbido a metà raggio; attrito leggermente alto per “mordere” subito la direzione.

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|----------------|
| `sheepHerdPhysics.ts` | Forze, idle, trap/lost | **Alto** (unico file logico da cambiare) |
| `sheepHerdTypes.ts` | `SheepAgent` | **Medio** (nuovi campi idle) |
| `SheepHerdGameCanvas.tsx` | Haptic, verde, HUD | **Lettura** — invariato |
| `sheepHerdDraw.ts` | Rendering | **Lettura** — invariato |

## 3. ROOT CAUSE / DECISIONI TECNICHE

- **Idle:** rimosso sinusoide su `ax/ay`. Aggiunti `idleTimer` + `idleHeading` + impulsi **discreti** su `vx/vy` con intervalli pseudo-casuali (`sham` deterministico da `wanderPhase`, posizione, salt). Ritmo **pausa → scatto** + occasionali **cambi di heading** bruschi (~32% full reroll) → lettura “nervosa / saltellante” senza RNG globale.
- **Cane:** mantenuta repulsione radiale; `falloff^1.35` per risposta più presente a media distanza; **bias verso pen** scalato con `align = max(0, flee · toPen)` così “da dietro” che spinge verso il recinto **rinforza** la spinta; **curl tangenziale** `side = sign(perp · toPen)` per curvare il flusso verso l’apertura logica del recinto. Leggermente più `FLEE_STRENGTH`, `BASE_SCARE_R`, meno `FRICTION` per meno sensazione “molle”.
- **Invariati:** condizioni trap/lost, timer, parametri server, canvas (haptic + `greenSafe01`).

## 4. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `sheepHerdTypes.ts` | `idleHeading`, `idleTimer` | Stato hop/pause | Basso |
| `sheepHerdPhysics.ts` | Idle burst, steering, costanti | Feeling + guida | Basso–medio (tuning) |

## 5. FIX APPLICATI

- **Pecore:** idle a **burst + timer**; niente più drift sinusoidale continuo.
- **Cane:** radial + **pen boost allineato** + **steering tangenziale** verso pen; tuning costanti.
- **Mantenuto:** haptic su `trapped`, recinto verde, HUD, modal, weekly/timer lato server.

## 6. TEST ESEGUITI

- `npm run build` — OK (exit 0).
- Playtest iPhone: idle, guida, pen, haptic/verde — **manuale**.

## 7. RISCHI RESIDUI

- Curl tangenziale può occasionalmente sembrare “vortice” se troppo forte; ridurre coefficiente `0.32` se in playtest distrae.

## 8. GO / NO GO

- **GO condizionato:** il modello risponde ai due problemi segnalati; la qualità finale dipende da **playtest su device**. Dopo smoke OK → **prossimo mini-game** ammissibile.

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
