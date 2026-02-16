# VERA BOMB — relation "public.vera_mission_runs" does not exist — FIX REPORT

**Date:** 2026-02-16  
**Branch:** `fix/vera-bomb-start-rpc-pgrst202`  
**Error:** `relation "public.vera_mission_runs" does not exist`

---

## PHASE 1 — VERIFICA

### A) Riferimenti nel repo

| Riferimento | File |
|-------------|------|
| `vera_mission_runs` | `supabase/migrations/20260215_vera_mission_bomb.sql`, `20260216061900_repair_vera_mission_rpc.sql` |
| `start_vera_mission_run` | `src/features/vera-missions/bomb/useBombMissionRun.ts:69` |
| Tabella equivalente | Nessuna: `mission_runs`, `daily_mission_completions` hanno schema diverso |

### B) Contratto minimo

| Campo | Tipo | Fonte |
|-------|------|-------|
| p_mission_id | TEXT | App passa `'bomb'` |
| RPC ret | JSONB | `{ run_id, day_key, expires_at, attempts_left, status }` |
| mission_id | TEXT | Colonna tabella (non UUID) |
| day_key | TEXT | YYYY-MM-DD UTC |

### C) Tabella nel DB

| Stato | Risultato |
|-------|-----------|
| `public.vera_mission_runs` | **Assente** |
| Schema alternativo | Non trovato |
| Tabella equivalente riusabile | **No** |

### Decisione

**Tabella assente** — Nessuna tabella equivalente riusabile. Creare `vera_mission_runs` e `vera_mission_attempts` con schema allineato a `20260215_vera_mission_bomb.sql`.

---

## PHASE 2–3 — FIX APPLICATO

**Migration:** `20260216120000_vera_mission_runs_tables.sql`

- Crea `vera_mission_runs` (id, user_id, mission_id TEXT, day_key, status, started_at, finished_at, attempts_used, payload, created_at, updated_at)
- Crea `vera_mission_attempts` (id, run_id, attempt_num, step_data, elapsed_ms, outcome, created_at)
- RLS minimo: SELECT/INSERT own runs; no UPDATE/DELETE da user; attempts read-only via run
- Indici: (user_id, day_key), (user_id, mission_id, status), (run_id)

Le RPC `start_vera_mission_run` e `finalize_vera_mission_run` sono già definite in `20260216061900_repair_vera_mission_rpc.sql` e usano questo schema.

---

## PHASE 4 — APPLICAZIONE

```bash
supabase db push
```

oppure eseguire il contenuto di `20260216120000_vera_mission_runs_tables.sql` in Supabase SQL Editor.

**Ordine:** eseguire prima questa migration (tabelle), poi la repair (funzioni) se non già applicata. Se si usa `supabase db push`, l’ordine delle migration è gestito automaticamente.
