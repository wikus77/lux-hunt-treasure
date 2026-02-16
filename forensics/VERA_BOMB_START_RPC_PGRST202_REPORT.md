# VERA BOMB — START MISSION RPC PGRST202 — FIX REPORT

**Date:** 2026-02-16  
**Branch:** `fix/vera-bomb-start-rpc-pgrst202`  
**Error:** `PGRST202` — "Could not find the function public.start_vera_mission_run(p_mission_id) in the schema cache"

---

## PHASE 1 — VERIFICA

### A) Chiamata RPC

| Campo | Valore |
|-------|--------|
| File | `src/features/vera-missions/bomb/useBombMissionRun.ts` |
| Linea | 69 |
| Call | `supabase.rpc('start_vera_mission_run', { p_mission_id: 'bomb' })` |
| Parametro | `p_mission_id: 'bomb'` (TEXT) |

### B) Funzione su Supabase

| Campo | Valore |
|-------|--------|
| **exists?** | **N** — PGRST202 indica assenza nello schema cache |
| Migration | `supabase/migrations/20260215_vera_mission_bomb.sql` |
| Signature | `start_vera_mission_run(p_mission_id TEXT DEFAULT 'bomb') RETURNS JSONB` |

### C) Funzioni simili

- Nessuna funzione con nome diverso trovata. La signature nella migration corrisponde alla chiamata.

### D) Schema cache

- La funzione non è nello schema cache perché **la migration non è stata applicata** al progetto Supabase remoto (o è fallita parzialmente).

### Decisione

**Creare/riparare funzione mancante** — La migration esiste ma non è presente nel DB remoto. Applicare la migration esistente oppure la repair migration (solo RPC) se la migration principale è già stata registrata come applicata.

---

## PHASE 2 — FIX

### Opzione 1: Applicare la migration completa (preferita)

```bash
supabase db push
# oppure
supabase migration up
```

La migration `20260215_vera_mission_bomb.sql` crea tabelle + RPC. È idempotente (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`).

### Opzione 2: Repair migration

È stata creata `20260216061900_repair_vera_mission_rpc.sql` che definisce solo le funzioni RPC (`CREATE OR REPLACE`). Serve se la migration principale è già registrata come applicata ma le funzioni mancano. Richiede che `vera_mission_runs` e `vera_mission_attempts` esistano. Eseguire:

```bash
supabase db push
```

oppure copiare il contenuto in Supabase Dashboard → SQL Editor ed eseguirlo.

---

## PHASE 3 — VERIFICA POST-FIX

1. Eseguire migration (`supabase db push` o SQL Editor)
2. Riavviare l’app iOS wrapped
3. Premere START MISSION:
   - Deve ritornare `runId` valido
   - Nessun PGRST202 nei log

---

## ROLLBACK

```bash
# Torna al branch precedente
git checkout fix/briefing-subtitles-and-leaderboard-longpress
```
