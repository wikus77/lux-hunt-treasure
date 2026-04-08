# PE reward audio/visual sync — forensic + definitive fix (2026-04-01, rev 2)

## A. Executive truth

Two independent issues made PE SFX feel **late** on iPhone, even after moving the JS trigger toward the +N pop:

1. **`playPESound()` race:** If `duration` was not finite when `play()` ran, a **220 ms timeout always called `runOnce()`**. That deferred real playback to **~bar T = 2380 + 220 ≈ 2600 ms**, i.e. **`done`** — identical to “sound when the animation is already finished.”
2. **Stacked perceived delay:** **`PE_SOUND_START_S = 2`** seeks deep into the file; combined with WKWebView decode/preroll, the **first audible transient** can land noticeably after `play()` returns.

Warmup also failed to call `load()` unless `networkState === NETWORK_EMPTY`, so metadata could stall in **IDLE** on WKWebView.

## B. Timeline (ms) — overlay O, bar B

| O (ms) | B (ms) | Event |
|--------|--------|--------|
| 0 | — | `setPayload`, anticipation |
| 420 | 0 | `warmPERewardSound()`, `energy`, **PulseBar mount** |
| | 400 / 900 | inject / fill |
| | **2200** | `phase = pulse` (glow + orb scale start) |
| | **~2500** | +N Framer `delay` 0.3 s → **pop motion starts** |
| | **~2500–2680** | Peak perceived +N (scale + brightness) |
| | **2300** (after fix) | **`onBurstPeak` → `playPESound()`** (`2200+300−200`) |
| | 2600 | `done` |

**Audible output** ≈ `play()` + iOS output latency (~80–180 ms) + **in-file attack** after seek (mitigated by lower seek).

## C. Climax percepito

Primary: **+N PE pop** (~B 2500+). Secondary: **pulse glow** at B 2200. The worst failure mode was audio at **B 2600**, i.e. after both.

## D. Clip PE (nessun cambio file)

Non possiamo misurare l’MP3 in questo ambiente. Per uso in app: **seek profondo (2 s)** sposta l’attacco percepito avanti nel tempo wall-clock; **ridurre il seek** (es. **1.15 s**) avvicina l’attacco udibile a `play()` senza sostituire l’asset.

## E. Root cause (unica dominante)

**Combinazione:** (1) **timeout 220 ms che forzava `play` a fine sequenza** quando i metadati non erano pronti; (2) **warm incompleto** su WKWebView; (3) **seek a 2 s** che aggiunge ritardo percettivo rispetto al burst.

## F. Fix applicato

| Change | File | Motivo |
|--------|------|--------|
| `warmPERewardSound`: `load()` se manca metadata **o** duration non finita | `victoryRewardSounds.ts` | Sblocca fetch metadati su WKWebView |
| `playPESound`: aspetta `loadedmetadata` / `durationchange` / `canplay`; **niente play “cieco” a 220 ms**; fallback 720 ms solo se mai partito | id. | Elimina allineamento a B 2600 |
| `PE_SOUND_START_S`: **2 → 1.15** | id. | Attacco udibile più vicino al trigger |
| `PE_BURST_SOUND_LEAD_MS`: **120 → 200** | `PulseBarReward.tsx` | Anticipa ~80 ms la chiamata JS vs formula precedente |

Formula trigger (invariata nella forma):  
`peSoundAtMs = PULSE_PHASE_AT_MS + PE_NUMBER_POP_DELAY_S * 1000 - PE_BURST_SOUND_LEAD_MS`  
→ **2200 + 300 − 200 = 2300 ms (B)**.

## G. File modificati

- `src/utils/victoryRewardSounds.ts`
- `src/features/pulse/components/PulseBarReward.tsx`

## H. Test device

Non eseguibili qui. Su iPhone: QA • PE ×5, PE+M1U, FULL — verificare SFX non a fine modale, un solo play, M1U/Rank ok.

## I. M1U / Rank

Nessuna modifica a `playM1USound` / `playRankUpSound`.

## J. Go / No-Go

**Go** per validazione su device. Se restasse leggermente presto/tardo, regolare **solo** `PE_BURST_SOUND_LEAD_MS` (±30–50 ms) o **solo** `PE_SOUND_START_S` in passi ~0.05 s — non reintrodurre timeout breve “cieco”.
