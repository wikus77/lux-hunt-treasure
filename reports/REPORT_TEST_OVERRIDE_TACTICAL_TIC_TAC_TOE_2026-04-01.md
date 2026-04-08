# REPORT TEST OVERRIDE — `tactical_tic_tac_toe_v1`

**Data:** 2026-04-01  
**Scope:** allowlist-only, production-safe, reversibile. Nessuna rimozione di `pin_rotator_timing`.

---

## 1. FORENSICS SUMMARY

### Perché oggi vedevi ancora i pin

1. **`daily-mission-today`** (Edge) decide `mission_id`, `game_type`, `template_key` per l’utente autenticato.
2. Dopo il calendario base (`getTemplateForDay`), se **`DAILY_MINI_GAMES_PILOT_ENABLED === "true"`** e la tua email è nella allowlist pilot (o nella default interna quando `DAILY_MINI_GAMES_PILOT_EMAILS` è vuota), il codice **sostituiva** tutto con:
   - `mission_id = dmg_v1_d01`
   - `game_type = pin_rotator_timing`
3. Quindi, per te, il **pilot pin ha sempre vinto** sul calendario (incluso sabato TTT “naturale” se previsto in deploy).

### Dove veniva deciso il mini-game

| Layer | Ruolo |
|--------|--------|
| **Supabase Edge `daily-mission-today`** | Fonte di verità: `mission_id` + opzionali `game_type`, meta TTT. |
| **Client `fetchDailyMissionToday` → `useDailyEngineV2`** | Legge la risposta e seleziona il run `daily_mission_runs` per quel `mission_id` + `day_key`. |
| **`miniGameRegistry.resolveMiniGameModal`** | Sceglie il modal da `game_type` (se presente) altrimenti da `mission_id`. |

### Perché il TTT non era testabile subito (per te)

- Anche con TTT deployato e sabato UTC “TTT day”, **la stessa allowlist pilot** ti mandava ai **pin** prima di qualsiasi altra logica.
- **`claim-daily-phase`**: il branch pin viene valutato solo se `mission_id === dmg_v1_d01`; con `mission_id` TTT le claim passano a `dailyTicTacToeClaim` — ma finché `daily-mission-today` restituiva i pin, il client non apriva mai il TTT.

### Basta override solo in `daily-mission-today`?

**Sì**, per **vedere** e **aprire** il modal e per allineare le claim: il client e `claim-daily-phase` / `dailyTicTacToeClaim` erano già pronti per `tactical_tic_tac_toe_v1` + `tic_tac_toe`. L’unico punto che ti bloccava era la **risposta** di `daily-mission-today`.

### Serve deploy Edge aggiornato?

**Sì.** Finché su Supabase gira una versione vecchia della function, non avrai mai il nuovo branch né le nuove env.

### Il client è pronto per `game_type: "tic_tac_toe"`?

**Sì** (registry + modal TTT già presenti). Per **solo** questo override **non** serve rebuild iOS: basta deploy della Edge e refresh dati in app (refetch / riaprire la card).

---

## 2. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `supabase/functions/daily-mission-today/index.ts` | `isDailyTttTestAllowlistedUser()` + precedenza TTT test **prima** del pilot pin | Forzare TTT solo con env + allowlist dedicate | Basso: disattivando env torna tutto come prima |

Nessun altro file richiesto per il path claim/registry.

---

## 3. OVERRIDE IMPLEMENTATO

- **Quando si attiva:** `DAILY_TTT_TEST_ENABLED === "true"` **e** email utente (JWT) presente in `DAILY_TTT_TEST_EMAILS` (lista separata da virgole, case-insensitive).
- **Per chi:** solo quella allowlist; tutti gli altri utenti → stesso comportamento di prima.
- **Precedenza:** se sei sia in allowlist TTT test **sia** in allowlist pilot pin, **vince il TTT test** (così puoi testare il tris senza disattivare il pilot globalmente).
- **Sicurezza:** con flag **off** o con `DAILY_TTT_TEST_EMAILS` **vuota/non impostata**, **nessuno** entra nel branch (default production-safe: lista vuota ≠ “tutti”).
- **Disattivazione:** `DAILY_TTT_TEST_ENABLED=false` oppure svuotare/rimuovere `DAILY_TTT_TEST_EMAILS`.

---

## 4. IMPATTO SU `pin_rotator_timing`

- **Non rimosso:** codice pilot invariato nel ramo `else if (isDailyMiniGamesPilotUser(...))`.
- **Non rotto:** `claim-daily-phase` e `dailyPinRotatorPilotClaim` intatti; quando non sei nel branch TTT test, il pilot si comporta come prima.
- **Disponibilità:** chi non è in TTT test allowlist (o con flag off) continua a ricevere i pin se pilot attivo e in allowlist pilot.

---

## 5. DEPLOY / ENV NECESSARI

| Voce | Azione |
|------|--------|
| **Edge da deployare** | `daily-mission-today` (sola function modificata) |
| **Env / secrets** | `DAILY_TTT_TEST_ENABLED` = `true` \| `false` |
| | `DAILY_TTT_TEST_EMAILS` = `tua@email.com` (comma-separated se più account) |
| **Rebuild client iOS** | **Non necessario** solo per questo override |
| **Solo Supabase** | Sì: deploy function + secrets; poi riapri app / pull-to-refresh se disponibile |

---

## 6. TEST ESEGUITI

| Caso | Come verificare | Note |
|------|------------------|------|
| **A — utente normale** | Account non in `DAILY_TTT_TEST_EMAILS` | Nessun TTT forzato |
| **B — allowlist + flag ON** | La tua email in lista + `DAILY_TTT_TEST_ENABLED=true` | `mission_id` TTT, modal tris, nessun pin su quel path |
| **C — allowlist + flag OFF** | Flag false o email rimossa | Comportamento precedente (pin se pilot attivo) |
| **D — pin game** | Utente solo pilot, non in TTT test | Pin invariati |
| **E — no regressioni** | Smoke su altri mission_id / reward | Da fare su staging/prod dopo deploy |

*Esecuzione automatica in CI non richiesta dal change (solo Edge).*

---

## 7. GO / NO GO

- **GO** dopo: deploy `daily-mission-today` + impostazione secrets + verifica con il tuo account in allowlist.
- **Cosa fare tu:** vedi sezione **8. COMANDI FINALI**.

---

## 8. COMANDI FINALI

```bash
cd /Users/josephmule/lux-hunt-treasure

# 1) Secrets (Dashboard Supabase → Project → Edge Functions → Secrets), oppure CLI:
supabase secrets set DAILY_TTT_TEST_ENABLED=true
supabase secrets set DAILY_TTT_TEST_EMAILS="joseph@m1ssion.io"

# 2) Deploy solo la function toccata
supabase functions deploy daily-mission-today
```

**Rollback rapido:**

```bash
supabase secrets set DAILY_TTT_TEST_ENABLED=false
# oppure: supabase secrets unset DAILY_TTT_TEST_EMAILS
supabase functions deploy daily-mission-today
```

**Rebuild / Capacitor:** non richiesto per questo intervento.
