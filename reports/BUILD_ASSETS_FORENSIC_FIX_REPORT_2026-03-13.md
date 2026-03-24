# BUILD ASSETS FORENSIC FIX REPORT — M1SSION™ iOS

**Data:** 2026-03-13  
**Scope:** Verifica e fix chirurgico build fallita su asset statici `public/` — app nativa wrappata iOS (Capacitor WKWebView)  
**Riferimento:** Fase -1 Architecture Lock; errori ENOENT su `borsa-2.png` e `RECRUIT-VIDEO.mp4`

---

# 1. EXECUTIVE SUMMARY

| Elemento | Esito |
|----------|--------|
| **Causa reale del fallimento build** | In ambiente attuale **non riprodotta**: i file segnalati esistono e sono tracciati in git. Il fallimento documentato in Fase -1 era probabilmente dovuto a contesto diverso (asset assenti in quel momento, branch diverso, o clone senza asset). |
| **Asset/path coinvolti** | 2 path indicati nel report Fase -1: `public/assets/prizes/borse/borsa-2.png`, `public/video/gerarchia M1SSION/RECRUIT-VIDEO.mp4`. Entrambi **presenti** e **tracciati** nel repo attuale. |
| **Fix applicato** | **Nessuna modifica al codice o alla struttura.** Nessun fix necessario: stato attuale del workspace è coerente e build/sync sono verdi. |
| **Esito finale build** | **SUCCESS** (exit code 0, ~4m 43s). |
| **Esito finale cap sync ios** | **SUCCESS** (web assets copiati in `ios/App/App/public`, config e plugin aggiornati). |
| **GO / NO GO Fase 0** | **GO FOR PHASE 0** — Build e Capacitor sync verificati; nessun blocco da asset statici. |

---

# 2. ROOT CAUSE ANALYSIS

## Errore/i esatti trovati (da report Fase -1)

- `ENOENT: no such file or directory, copyfile '.../public/assets/prizes/borse/borsa-2.png' -> '.../dist/assets/prizes/borse/borsa-2.png'`
- In un secondo run: `ENOENT` per `public/video/gerarchia M1SSION/RECRUIT-VIDEO.mp4`

## Verifica file system (ambiente attuale)

| Path | Esiste su disco | Tracciato in git |
|------|------------------|-------------------|
| `public/assets/prizes/borse/borsa-2.png` | Sì | Sì (`git ls-files` OK) |
| `public/video/gerarchia M1SSION/RECRUIT-VIDEO.mp4` | Sì | Sì (`git ls-files` OK) |

## Natura del problema

- Il fallimento avviene in fase di **copia di `public/` in `dist/`** (comportamento standard Vite: `publicDir` → `outDir`). Vite non ha logiche custom per l’elenco dei file: copia ricorsivamente tutto ciò che è in `public/`.
- Se il build fallisce con ENOENT su un file, quel file in quel contesto **non era presente** nel filesystem (path errato, file non committato, branch/clone senza asset, o cancellazione locale).
- **Perché la build falliva davvero:** in quel run specifico (Fase -1) la sorgente `public/...` non era disponibile; nell’ambiente verificato oggi i file ci sono e la build va a buon fine.

---

# 3. ASSET FORENSICS

## File verificati

- `public/assets/prizes/borse/` — cartella presente; contiene `borsa-1.png` … `borsa-6.png` (tutti presenti).
- `public/video/gerarchia M1SSION/` — cartella presente; contiene tra gli altri `RECRUIT-VIDEO.mp4`, `FIELD AGENT-VIDEO.mp4`, ecc.
- `public/assets/prizes/borse-reali/` — usata dal codice (PrizeVision, PrizesPage, assetResolver, ecc.); presente e popolata.

## File mancanti

- **Nessuno** nell’ambiente attuale per i path che avevano causato ENOENT.

## File simili / naming

- Il codice riferisce **solo** `borse-reali` (es. `HERMES_BIRKIN.png`, `CHANEL.png`). La cartella **borse** (senza `-reali`) esiste ma non è referenziata nel codice; è copiata in `dist/` perché fa parte di `public/`. Nessuna confusione naming rilevata per il blocco build.

## Path con spazi / caratteri speciali

- In `public/` esistono path con spazi (rischio potenziale su ambienti molto restrittivi):
  - Cartella: `public/video/gerarchia M1SSION/`
  - File: `FIELD AGENT-VIDEO.mp4`, `SHADOW OPERATIVE-VIDEO.mp4`, `196 copia.png`, `PORSCHE 911_CABRIO.png`, ` AUTO NASCOSTA.png`, `LOUIS VUITTON_CLASSIC.png`, ecc.
- In questo run **la build è completata con successo**: la copia Vite (Node.js fs) gestisce correttamente gli spazi. Nessuna modifica applicata; solo documentazione.

## Cartelle problematiche

- Nessuna; struttura `public/` coerente con i riferimenti noti.

---

# 4. FIX PLAN

## Fix candidato

- **Nessun fix di codice o di asset.** Lo stato attuale del repository è corretto: asset presenti e tracciati, build e sync OK.

## Perché è la scelta più sicura

- Modificare path, rinominare cartelle o escludere asset potrebbe introdurre regressioni (riferimenti in `hierarchyConfig.ts`, `PrizesPage`, `PrizeVision`, `assetResolver`, ecc.). Non toccare nulla è il fix minimo e più sicuro.

## Rischio

- **Rischio fix:** N/A (nessun fix applicato).
- **Rischio futuro:** Se in un altro ambiente (CI, clone fresco, altro branch) la build fallisse di nuovo con ENOENT, la causa sarà l’assenza di quei file in quel contesto. Azione consigliata: verificare che tutti gli asset in `public/` siano committati e presenti nel branch usato per la build.

## Cosa NON è stato toccato

- Nessuna modifica a: codice applicativo, Vite config, `.gitignore`, struttura cartelle, i18n, routing, UI, DB, Edge Functions, pacchetti.

---

# 5. FIX APPLICATO

- **Modifiche effettuate:** nessuna.
- **File toccati:** nessuno.
- **Rollback:** non necessario.

*(Se in futuro la build fallisse di nuovo per ENOENT su asset, il “fix” sarà: assicurarsi che i file esistano in `public/` e siano tracciati in git per il contesto di build.)*

---

# 6. VERIFICA FINALE

## Build

- **Comando:** `npm run build`
- **Esito:** **SUCCESS** (exit code 0)
- **Durata:** ~4m 43s
- **Output:** 5305 moduli trasformati; `dist/` generato con tutti gli chunk e asset; nessun ENOENT.

## Capacitor sync iOS

- **Comando:** `npx cap sync ios`
- **Esito:** **SUCCESS**
- **Dettaglio:** web assets copiati da `dist` a `ios/App/App/public`; `capacitor.config.json` creato in `ios/App/App`; plugin iOS aggiornati.

## Warning residui

- Solo i warning Rollup/Vite già noti (dynamic vs static import per alcuni moduli). Nessun warning legato ad asset o copia di `public/`.

---

# 7. VERDETTO FINALE

## GO FOR PHASE 0

**Motivazione:**

- La verifica forense conferma che **non è richiesto alcun fix** nello stato attuale del repo: gli asset indicati nel report Fase -1 sono presenti e tracciati; la build e `npx cap sync ios` sono entrambe andate a buon fine.
- Il precedente fallimento è classificato come **preesistente e contestuale** (ambiente/run in cui i file non erano disponibili), non come bug di configurazione o di codice.
- Nessuna regressione introdotta; nessuna modifica fuori scope. I criteri per procedere con la Fase 0 (Daily Legacy Hide) sono soddisfatti dal punto di vista build e sync.

**Condizioni consigliate per ambienti alternativi (CI / clone):**

1. Eseguire build e sync sullo stesso branch/commit in cui sono presenti gli asset in `public/`.
2. Se in CI la build fallisse con ENOENT su path in `public/`, verificare che il job non esegua su un clone o branch dove quegli asset non sono stati inclusi.

---

*Report generato in seguito a verifica forense chirurgica su asset statici e build — M1SSION™ iOS only.*
