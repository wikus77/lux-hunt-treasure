# MPE Real Data v1 — Test checklist (iPhone / device)

**Dopo** aver eseguito il Preflight DB (STEP 0) e applicato la migration (`supabase db push` o SQL Editor), verificare su device (iPhone consigliato).

---

## PASS

- [ ] **App identica a prima** — Nessuna regressione visiva; stessi flussi Home, Map, BUZZ, AION, Settings.
- [ ] **MPE: 1 free/day** — Primo scan del giorno: parte senza errori. Secondo scan (stesso giorno): toast “1 free analysis per day” (o equivalente locale) e scan non parte.
- [ ] **Extra analysis** — Tap “Extra analysis — 5 M1U”: se saldo M1U ≥ 5, parte lo scan e il saldo si decrementa di 5 M1U. Se saldo < 5: toast “Need 5 M1U for extra analysis” (o equivalente).
- [ ] **Report reale** — Al termine dello scan: percentuale e barre (Intelligence, Geo, Discipline, Operational) coerenti con dati reali (clues, buzz map, streak, rank).
- [ ] **Delta vs yesterday** — Primo giorno: delta 0% o “insufficient history” (layout invariato). Dal secondo giorno (dopo almeno uno snapshot salvato ieri): delta numerico reale (positivo/negativo).
- [ ] **Daily commit** — Completare il Commit Ritual (3 blob) con successo: chiudi app (kill), riapri: il “daily commit completed today” deve restare true (es. punteggio MPE che lo considera).
- [ ] **Nessun impatto su BUZZ / BUZZ Map / IAP / AION / push** — Nessun crash, nessun messaggio di errore in flussi non MPE.

---

## FAIL (stop e rollback)

- [ ] Qualsiasi **regressione UI** o **crash** in schermate non MPE.
- [ ] Modifiche involontarie a **flussi IAP**, **BUZZ button**, **BUZZ Map**, **AION**, **push**.
- [ ] **RPC lente** o timeout: in quel caso ottimizzare lato server (indici, query) senza cambiare comportamento client.

---

## Rollback immediato

```bash
git checkout safety/mpe-realdata-before-<timestamp>
# oppure
git reset --hard safety/mpe-realdata-before-<timestamp>
```

Poi riapplicare le migration precedenti se necessario (il DB avrà le tabelle MPE; per “annullare” la feature lato app basta il checkout/reset sopra).
