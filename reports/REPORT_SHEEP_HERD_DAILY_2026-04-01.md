# REPORT IMPLEMENTAZIONE — SHEEP HERD DAILY (`sheep_herd_v1`)

**Data:** 2026-04-01 · M1SSION™ enterprise / iOS WKWebView

---

## 1. FORENSICS / DESIGN SUMMARY

- **Concept:** recinto centrale (cerchio cyan), pecore come dischi “premium” chiari, driver/cane = disco cyan con glow; **pointer capture** sul canvas — niente joystick; il cane **interpola** verso il dito; le pecore **fuggono** da un raggio di influenza e possono essere **intrappolate** nel recinto o **perse** fuori bordo.
- **Perché non è un codepen desktop:** coordinate **normalizzate 0–1**, loop **requestAnimationFrame**, **touchAction: none**, **devicePixelRatio** limitato; HUD (timer + conteggi) fuori dal canvas per leggibilità.
- **Mobile-first:** area touch a tutta larghezza card, altezza `min(52vh, 420px)`, safe-area rispettata nel modal shell come gli altri daily.

---

## 2. ARCHITETTURA

| Layer | Ruolo |
|--------|--------|
| **Client** `src/missions/miniGames/sheepHerd/` | Canvas 2D + modal due fasi (stesso modello Cipher/TTT). |
| **Edge `_shared/dailySheepHerd.ts`** | Tier settimanale (bucket calendario come TTT), `seed`, costanti 120s, **validazione plausibilità** su payload. |
| **Edge `_shared/dailySheepHerdClaim.ts`** | `start/complete` phase1 & phase2, M1U + PE + streak su phase2 win. |
| **`daily-mission-today`** | Allowlist **Sheep** (priorità 1) → `sheep_herd_v1` + meta; poi TTT test, poi pin pilot. |
| **`claim-daily-phase`** | Dopo pin e TTT → handler Sheep; guard anti fall-through. |

---

## 3. FILE CREATI / TOCCATI

| File | Ruolo | Modifica | Rischio |
|------|--------|-----------|---------|
| `supabase/functions/_shared/dailySheepHerd.ts` | Parametri + validazione | Nuovo | Basso |
| `supabase/functions/_shared/dailySheepHerdClaim.ts` | Claim isolato | Nuovo | Basso |
| `supabase/functions/daily-mission-today/index.ts` | Override allowlist + meta | Sheep prima di TTT/pin | Basso se env off |
| `supabase/functions/claim-daily-phase/index.ts` | Routing claim | +Sheep | Basso |
| `src/missions/miniGames/sheepHerd/*` | UI + fisica | Nuovo modulo | Basso |
| `miniGameRegistry.ts` | Modal map | +mission + game_type | Basso |
| `claimDailyPhase.ts` / `dailyMissionToday.ts` | Tipi/costanti | Estensioni | Basso |
| `locales/en|it|fr/common.json` | i18n | Chiavi `daily_sheep.*` | Basso |

**Non toccati:** file di pin, TTT, Cipher, Word Duel, Signal, header, nav, IAP, ecc.

---

## 4. GAMEPLAY IMPLEMENTATO

- **Timer:** 120s fissi (`time_limit_sec` dal server).
- **Progressione (week slot 0–3 del mese, come TTT):**

| Slot | Pecore | Richieste in recinto | Max perse |
|------|--------|----------------------|-----------|
| W1 | 5 | 5 | 0 |
| W2 | 7 | 6 | 1 |
| W3 | 9 | 7 | 2 |
| W4 | 12 | 10 | 1 |

- **Difficoltà extra:** moltiplicatori server su raggio paura, raggio recinto, velocità pecore (solo hint client; **vittoria decisa dai conteggi**).
- **Vittoria (server):** `sheep_trapped >= required_in_pen` **e** `sheep_lost <= max_lost` **e** `sheep_trapped + sheep_lost === sheep_total`.
- **Sconfitta:** al termine tempo le pecore ancora “libere” diventano **perse** lato client prima del submit; oppure conteggi che non soddisfano la soglia.
- **Daily flow:** Phase 1 (oggi) → round 120s → reward P1 se win; Phase 2 (domani UTC) → stesso schema → reward P2 + PE + streak se win (allineato agli altri server-real).

---

## 5. VALIDAZIONE SERVER (pragmatica)

Controlli effettivi su `complete_phase*`:

- `seed` uguale a quello nel `progress_json` del run.
- `week_index` (se inviato) coerente con il run.
- `duration_ms` tra **3000** e **125000** (120s + slack).
- `sheep_trapped` / `sheep_lost` interi, somma = `sheep_total`, range valido.
- **Win:** soglie tier + durata win ≥ **6000 ms** (anti-submit istantaneo banale).

**Limiti noti:** non si ri-simula la fisica server-side; un client malevolo potrebbe ancora forzare conteggi coerenti con vincoli. Per **pilot / QA** il modello è documentato e reversibile; hardening futuro = checkpoint o firma sessione.

---

## 6. OVERRIDE TEST IMMEDIATO

- **Env:** `DAILY_SHEEP_HERD_TEST_ENABLED=true` e `DAILY_SHEEP_HERD_TEST_EMAILS=email1,email2` (mai lista vuota con flag on → nessun match).
- **Precedenza:** Sheep test **prima** di TTT test e **prima** del pilot pin → puoi testare Sheep senza disattivare il pin globalmente.
- **Disattivazione:** `DAILY_SHEEP_HERD_TEST_ENABLED=false` o rimuovere le email.
- **Utenti non in lista / flag off:** comportamento invariato (nessun `sheep_herd_v1` forzato).

---

## 7. TEST ESEGUITI

- `npm run build` — **OK** (2026-04-01).
- Test manuali su device (A–F della spec): da eseguire dopo deploy Edge + secrets + build/sync iOS se usi binary nativa aggiornata.

---

## 8. RISCHI RESIDUI

- Stesso vincolo **phase2 / giorno successivo** degli altri daily (mission_id deve combaciare il giorno dopo).
- Anti-cheat fisica limitato ai conteggi + durata (vedi §5).

---

## 9. GO / NO GO

| Domanda | Risposta |
|---------|-----------|
| Testabile subito? | **Sì** dopo deploy + secrets allowlist + client che include questo bundle. |
| Stabile come prossimo pilot? | **GO condizionato** — validare su iPhone reale (touch, 12 pecore, thermal). |
| Deploy Edge necessario? | **Sì.** |
| Rebuild client iOS? | **Sì** se installi da Xcode/TestFlight con nuovo `npm run build` + `cap sync`; se usi solo web shell aggiornata, dipende dal flusso. |

---

## 10. COMANDI FINALI (copia-incolla)

```bash
cd /Users/josephmule/lux-hunt-treasure

# Secrets Supabase (Dashboard o CLI)
supabase secrets set DAILY_SHEEP_HERD_TEST_ENABLED=true
supabase secrets set DAILY_SHEEP_HERD_TEST_EMAILS="joseph@m1ssion.io"

# Deploy Edge modificate
supabase functions deploy daily-mission-today
supabase functions deploy claim-daily-phase
```

**Rollback test:**

```bash
supabase secrets set DAILY_SHEEP_HERD_TEST_ENABLED=false
supabase functions deploy daily-mission-today
```

**Client iOS (quando serve binary aggiornato):**

```bash
cd /Users/josephmule/lux-hunt-treasure
npm run build
npx cap sync ios
```

Poi apri Xcode e run su device.

---

**Criterio successo:** modulo isolato, i18n IT/EN/FR, nessun file legacy daily modificato oltre routing/registry/tipi, pin e TTT intatti, allowlist-only per forzare Sheep.
