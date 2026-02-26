# BUILD FAILURE FORENSICS — Vite Not Found

**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Error:** `Cannot find package 'vite' in node_modules`  
**Date:** 2026-02-24  
**Scope:** Build environment only (Node, dependencies, lockfile, config). No changes to `src/`, Supabase, Edge, UI, or business logic.

---

## 1) Causa reale identificata

**Causa:** **(A) node_modules corrotti / installazione incompleta di Vite**

- **Evidenza:** La cartella `node_modules/vite` esisteva ma **non conteneva `package.json`** (solo `dist/` e `node_modules/`). Node risolve il package tramite `node_modules/vite/index.js` (o exports in package.json); senza `package.json` il resolve fallisce con:
  ```text
  Error: Cannot find package '/Users/josephmule/lux-hunt-treasure/node_modules/vite/index.js' imported from .../vite.config.ts.timestamp-*.mjs
  ```
- **Contesto:** Nel repo sono presenti sia `package-lock.json` (npm) sia `pnpm-lock.yaml` (pnpm), e in `package.json` è dichiarato `"packageManager": "pnpm@9.12.3"`. Installazioni miste o interruzioni possono aver lasciato una copia incompleta/corrotta di `vite`.
- **Escluso:** Vite è correttamente in `devDependencies` (`"vite": "^5.4.19"`); non è stato toccato path di build, vite.config, né versioni di Node/npm per il fix.

---

## 2) File modificati

**Nessun file di progetto modificato.**

- **package.json:** non modificato.
- **package-lock.json:** non modificato.
- **vite.config.ts:** non modificato.
- **src/** e tutto il resto del codice: non toccati.

**Unica azione eseguita:** rimozione della cartella `node_modules` e reinstallazione con `npm ci` (usa solo `package-lock.json`), quindi ricreazione coerente di `node_modules` incluso il package `vite` completo.

---

## 3) Differenze applicate

- **Nessuna diff** su file versionati.
- **Operazioni effettuate:**
  1. `rm -rf node_modules`
  2. `npm ci`

Quindi: nessuna modifica a file sorgente o di configurazione; solo ambiente di build (contenuto di `node_modules`) ripristinato.

---

## 4) Conferme scope (nessuna modifica a)

- **Final Shoot:** non modificato.
- **Marker / Buzz Map:** non modificato.
- **Supabase (migrations, client, RPC):** non modificato.
- **Edge functions:** non modificate.
- **UI / design:** non modificati.
- **Pagamenti IAP, push native, business logic, database:** non toccati.

Il fix è limitato a dipendenze e tooling di build (node_modules + comandi npm).

---

## 5) Stato finale: BUILD OK

- **Comando:** `npm run build`
- **Risultato:** completato con successo (exit code 0).
- **Output:** build Vite completata; `dist/` generata correttamente.

---

## Riepilogo diagnosi (Phase 1)

| Check | Risultato |
|-------|-----------|
| Node | v20.18.1 |
| npm | 10.8.2 |
| vite in package.json | Sì (devDependencies: `"vite": "^5.4.19"`) |
| vite in node_modules (pre-fix) | Cartella presente ma **senza package.json** (corrotta) |
| Lockfile | `package-lock.json` + `pnpm-lock.yaml` presenti; usato npm + package-lock per fix |
| Root build | Sì (root = frontend, nessun monorepo separato) |
| Causa | (A) node_modules corrotti |

---

**Stop condition:** Il fix non ha richiesto modifiche fuori dallo scope (solo reinstall node_modules). Nessuna modifica a `src/`, migrations, Edge, UI o logica di business.
