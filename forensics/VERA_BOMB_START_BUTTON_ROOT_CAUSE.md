# VERA BOMB — START Button Root Cause

**Date:** 2025-02-15

---

## Errore Supabase (ipotesi)

Il toast "Unknown error" era causato da:
1. **Estrazione errata dell'errore:** `err instanceof Error ? err.message : 'Unknown error'` — Supabase/Postgrest può restituire oggetti con struttura diversa (`.message`, `.code`, `.details`, `.hint`).
2. **Possibili cause lato Supabase:**
   - `42883` — function `start_vera_mission_run` non esiste (migration non applicata)
   - `42501` — permission denied (RLS / GRANT)
   - Auth: `auth.uid()` null → "Not authenticated"
   - Schema cache: funzione non visibile al client

---

## Fix Applicati

1. **useBombMissionRun.ts**
   - Nuovo formato risultato: `{ ok, runId?, error?: { code, message, details } }`
   - `toStartError()` estrae correttamente message/code/details/hint da errori Supabase
   - Messaggi espliciti: RPC_NOT_FOUND, PERMISSION_DENIED, NOT_AUTHENTICATED
   - IN_FLIGHT: nessun toast (silenzioso)
   - `console.error('[VERA_BOMB][START][RPC_ERROR]')` con payload completo per debug
   - Fallback: "Impossibile avviare missione. Riprova." (niente "Unknown error")

2. **BombMissionModal.tsx**
   - handleStart usa `res.ok`, `res.error?.code`, `res.error?.message`
   - Toast solo se `code !== 'IN_FLIGHT'`
   - Rimosso onTouchEnd (evita doppio trigger)

3. **NextActionContainer.tsx**
   - Badge: da "1" a testo missione `t('vera_mission.bomb.badge')` (BOMBA / BOMB / BOMBE)

4. **Locales**
   - `vera_mission.bomb.badge` in it/en/fr

---

## Cosa controllare su Supabase

- Migration `20260215_vera_mission_bomb.sql` applicata
- Funzione `start_vera_mission_run` presente
- GRANT EXECUTE per `authenticated`
- In Safari Develop → Console: cercare `[VERA_BOMB][START][RPC_ERROR]` per errore reale
