# REPORT — Neuromatch Memory Daily (`neuromatch_memory_v1` / `neuro_match`)

**Date:** 2026-04-01  
**Scope:** Isolated daily mini-game + edge allowlist QA + server validation. No broad daily-engine refactors.

---

## 1. Forensics / design summary

- **Concept:** Classic memory match adapted to M1SSION: server-authored `board_layout` (pair ids + `−1` neutral slots), touch-first grid, cyan/dark shell consistent with Sheep/TTT modals.
- **Why not a raw demo:** React + Framer Motion flip, integrated `claim-daily-phase` / two-phase streak flow, haptics via existing `hapticSelection`, and **reward only after server validation** — same contract as other server-real dailies.
- **Mobile-first:** Row×column grids chosen for thumb reach — W1 `3×3`, W2 `4×3`, W3 `5×3`, W4 `6×3`; neutral cells use dashed “Neutral” tiles so they read as design, not missing assets.

---

## 2. Architecture

| Layer | Role |
|--------|------|
| **Client** | `NeuroMatchModal` → `start_phase1` / `complete_phase1` / `start_phase2` / `complete_phase2`; `NeuroMatchBoard` runs timer, flip logic, mismatch **−4s** on remaining clock, submits outcome payload. |
| **Server** | `_shared/dailyNeuroMatch.ts`: week matrix, seeded shuffle, `validateNeuroMatchOutcome`. `_shared/dailyNeuroMatchClaim.ts`: mirrors Sheep Herd claim/streak/PE path. |
| **Daily integration** | `miniGameRegistry` maps `mission_id` + `game_type`; `daily-mission-today` adds preview meta when mission is neuromatch. |
| **Validation** | Pragmatic: seed, week, `cards_total`/`pairs_total`, `matched_pairs` vs `won`, duration cap (~120s + slack), move/mismatch bounds, min moves on win, anti-instant-win duration floor. |

---

## 3. Files created / touched

| File | Role | Change | Risk |
|------|------|--------|------|
| `supabase/functions/_shared/dailyNeuroMatch.ts` | Board + validation | **New** | Low — isolated |
| `supabase/functions/_shared/dailyNeuroMatchClaim.ts` | Claims | **New** | Low — same pattern as sheep |
| `supabase/functions/daily-mission-today/index.ts` | Today’s mission | Neuromatch allowlist + meta | Low if env off |
| `supabase/functions/claim-daily-phase/index.ts` | Dispatch | Neuro handler | Low |
| `src/missions/miniGames/neuroMatch/*` | UI + logic | **New** | Low |
| `src/missions/dailyMiniGames/miniGameRegistry.ts` | Modal map | +neuromatch | Low |
| `src/missions/serverReal/claimDailyPhase.ts` | Types + IDs | +constants, progress fields | Low |
| `src/missions/serverReal/dailyMissionToday.ts` | Response typing | +optional preview fields | Low |
| `src/locales/{en,it,fr}/common.json` | i18n | +`daily_neuromatch.*` | Low |

---

## 4. Gameplay

- **Rules:** Tap two non-neutral cards; match → stay face-up; mismatch → **−4s** on timer, brief shake, cards flip back.
- **Timer:** **120s** fixed all weeks (aligned with Sheep); displayed as integer seconds.
- **Win:** All real pairs matched → `won: true`, `matched_pairs === pairs_total`.
- **Lose:** Timer hits 0 before all pairs matched → `won: false`.
- **Weekly progression (UTC calendar week-of-month slot, same as TTT/Sheep):**

| Week slot | Cells | Real pairs | Empty (`−1`) | Grid |
|-----------|-------|------------|----------------|------|
| 1 | 9 | 4 | 1 | 3×3 |
| 2 | 12 | 6 | 0 | 4×3 |
| 3 | 15 | 7 | 1 | 5×3 |
| 4 | 18 | 9 | 0 | 6×3 |

---

## 5. Server validation (pragmatic)

Checks include: `seed` match, optional `week_index`, payload `cards_total`/`pairs_total` vs run, `duration_ms` within `time_limit_sec + 8s` slack, integer sanity for `matched_pairs` / `moves` / `mismatches`, `won` consistent with `matched_pairs`, minimum moves on win (`≥ 2 × pairs_total`), minimum win duration (5s), move ceiling (`≤ cards_total × 50`).

**Pilot-safe:** Stops trivial lies (wrong seed, impossible speed, claiming win without full pairs). Does **not** re-simulate every flip (would be heavier); board is fixed in `progress_json`, so pairing cheats require inventing a consistent payload that still passes counters — bounded by move/duration checks.

---

## 6. Override test immediato

- **Env:** `DAILY_NEUROMATCH_TEST_ENABLED=true` and `DAILY_NEUROMATCH_TEST_EMAILS` comma-separated (lowercased match).
- **Who:** Only listed emails; everyone else unchanged.
- **Precedence:** Evaluated **before** sheep / TTT / pin pilot in `daily-mission-today` so this flag wins when enabled for that user.
- **Disable:** Unset or set `DAILY_NEUROMATCH_TEST_ENABLED=false` (or clear emails).
- **Safety:** No global override; off by default; reversible via secrets alone.

---

## 7. Tests eseguiti

- `npm run build` (pass).
- Manual QA on device recommended for: allowlist on/off, open/close (X), win/fail/retry, week matrix (change device date or wait for calendar bucket), regression spot-check on Pin / TTT / Sheep flows (unchanged code paths).

---

## 8. Rischi residui

- **Week bucket:** Uses `weekSlotFromDayKey` (day-of-month bands), not ISO week number — same as existing TTT/Sheep; product-aligned but worth documenting for QA.
- **Curly apostrophes in JSON:** EN fail string uses ASCII wording to avoid odd glyphs in some fonts.

---

## 9. GO / NO-GO

- **Test subito (allowlist):** **Sì**, dopo deploy edge + secrets + client build/sync.
- **Stabile come prossimo pilot:** **Sì** a livello architettura (isolato, stesso claim pattern di Sheep).
- **Deploy edge necessario:** **Sì** (`daily-mission-today`, `claim-daily-phase`).
- **Rebuild client:** **Sì** (nuovo bundle + Capacitor sync iOS).

---

## 10. Comandi finali (copia-incolla)

Sostituisci `<PROJECT_REF>` se il CLI lo richiede; dalla root del repo:

```bash
# 1) Deploy funzioni Edge interessate
npx supabase functions deploy daily-mission-today --project-ref <PROJECT_REF>
npx supabase functions deploy claim-daily-phase --project-ref <PROJECT_REF>
```

```bash
# 2) Secret / env (Dashboard → Edge Functions → Secrets oppure CLI)
npx supabase secrets set --project-ref <PROJECT_REF> DAILY_NEUROMATCH_TEST_ENABLED=true
npx supabase secrets set --project-ref <PROJECT_REF> DAILY_NEUROMATCH_TEST_EMAILS=wikus77@hotmail.it
```

```bash
# 3) Disattivare il pilot QA (rollback)
npx supabase secrets set --project-ref <PROJECT_REF> DAILY_NEUROMATCH_TEST_ENABLED=false
```

```bash
# 4) Build web + sync iOS (Capacitor)
cd /Users/josephmule/lux-hunt-treasure
npm run build
npx cap sync ios
```

Poi apri l’app su iPhone con l’account **wikus77@hotmail.it**: `daily-mission-today` deve restituire `mission_id: neuromatch_memory_v1` e `game_type: neuro_match`.
