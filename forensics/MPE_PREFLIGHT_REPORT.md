# MPE Real Data v1 — PREFLIGHT DB REALE (STEP 0)

**Data:** 2026-02-22  
**Obiettivo:** Verificare sul DB reale (read-only) che migrations e oggetti siano presenti prima di applicare la patch MPE v1.

---

## Come eseguire lo Step 0 (tu)

L’ambiente Cursor **non ha accesso** al tuo progetto Supabase (nessun token/login). Esegui tu il preflight:

1. Apri **Supabase Dashboard** → progetto → **SQL Editor**.
2. Apri il file `forensics/MPE_PREFLIGHT_DB_READONLY.sql` (nella repo).
3. Incolla tutto lo script ed **Esegui** (Run).
4. Copia l’output (o fai uno screenshot) e compila la tabella sotto con PASS/FAIL.

**Nota:** Se la tabella delle migration non si chiama `supabase_migrations.schema_migrations`, adatta la prima query (es. `public.schema_migrations` o il nome che vedi in Dashboard).

---

## A) Migrations applicate

**Query:** `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;`

Verifica che nell’elenco ci siano **almeno**:

| Migration (pattern o nome) | Presente? (PASS/FAIL) |
|----------------------------|------------------------|
| 20251203_smart_push_system | |
| 20251207_cashback_vault | |
| 20251130_realtime_leaderboard | |
| 20250113_010_pe_daily_awards | |
| 20251004081340_95e746be% (streak) | |
| 20251213_fix_user_clues_and_enrollment | |

**Se manca anche solo una → STOP, segnala e non applicare la Fase 2.**

---

## B) Esistenza oggetti

**Tabelle:** devono comparire tutte e 6:  
`user_activity_stats`, `user_cashback_wallet`, `user_map_areas`, `buzz_map_actions`, `user_clues`, `pe_daily_awards`.

**MV:** `leaderboard_rankings` (da `pg_matviews` o da information_schema).

**Funzioni:** `get_user_streak_info`, `get_leaderboard`, `update_user_activity`.

| Oggetto | PASS/FAIL |
|---------|-----------|
| 6 tabelle sopra | |
| MV leaderboard_rankings | |
| get_user_streak_info | |
| get_leaderboard | |
| update_user_activity | |

---

## C) Accessibilità leaderboard_rankings

- **has_table_privilege('authenticated', 'public.leaderboard_rankings', 'SELECT')** deve essere `true`.
- **Colonne:** devono esserci `id` e `global_rank`.

| Check | PASS/FAIL |
|-------|-----------|
| GRANT SELECT authenticated | |
| Colonne id, global_rank | |

---

## D) Drift week / week_number

- **user_clues:** esiste colonna `week`? (e/o `week_number`?) → annota.
- **user_map_areas:** esiste colonna `week` (integer)? → annota.

Usa questo per le query RPC MPE (usare `week` su user_map_areas; su user_clues usare la colonna effettivamente presente).

| Tabella | Colonne trovate | PASS/FAIL |
|---------|------------------|-----------|
| user_clues | | |
| user_map_areas (week) | | |

---

## Esito Step 0

- **Tutto PASS** → **GO FASE 2**: puoi applicare la migration MPE e il client (branch/tag già creati, vedi sotto).
- **Qualche FAIL** → **STOP**: non applicare la Fase 2; remediation minima (es. applicare migration mancanti) senza mescolare con patch MPE.

---

*Dopo aver eseguito lo script e compilato la tabella, se tutto è PASS procedi con `supabase db push` (o applica manualmente la migration MPE) e verifica l’app.*
