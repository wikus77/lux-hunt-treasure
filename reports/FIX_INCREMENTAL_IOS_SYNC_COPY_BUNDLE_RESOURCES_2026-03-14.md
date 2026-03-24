# Fix chirurgico — Sync iOS incrementale / Copy Bundle Resources

**Project:** M1SSION™ — iOS (Capacitor)  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Data:** 2026-03-14  
**Vincolo:** Solo workflow build/sync; nessuna modifica a business logic, Xcode project, Pods, scheme.

---

## Executive Summary

È stato introdotto un **workflow locale iOS alternativo** che evita il full remove+copy di `cap sync ios` e riduce l’invalidazione di Xcode Copy Bundle Resources:

- **Nuovo script:** `scripts/ios-sync-incremental.sh` — sincronizza `dist/` → `ios/App/App/public` con **rsync** in modalità incrementale (solo file con contenuto diverso, mtime preservati dove possibile).
- **Nuovi script npm:** `ios:sync:incremental` (solo sync), `cap:ios:incremental` (build + sync incrementale + `cap update ios`).
- **Comportamento:** Nessuna modifica a Capacitor in `node_modules`, nessun hack in Xcode. Si **non usa più** `npx cap sync ios` per il ciclo abituale; si usa `npm run cap:ios:incremental` (o build + `npm run ios:sync:incremental` + `npx cap update ios` quando serve).

**Root cause confermata:** Come da report forense: `cap sync ios` esegue remove + full copy di `ios/App/App/public`, aggiornando tutti i mtime e inducendo Xcode a rieseguire Copy Bundle Resources (~500 MB) a ogni build.

---

## Root cause confermata

- `npx cap sync ios` = `copy` + `update` (CLI Capacitor).
- `copy` per iOS chiama `copyWebDir`: `fs_extra.remove(nativeAbsDir)` poi `fs_extra.copy(webAbsDir, nativeAbsDir)`.
- Effetto: tutti i file in `ios/App/App/public` ricevono nuovi mtime → Xcode vede la folder reference “public” modificata → Copy Bundle Resources ricopia l’intera cartella a ogni build.

---

## Strategia scelta

- **Sync web assets** con uno script locale che usa **rsync** invece del copy Capacitor.
- **Non** modificare `node_modules/@capacitor/cli`.
- **Separazione:** (1) copia web assets = nostro script incrementale; (2) update plugin/config = `npx cap update ios` (non tocca `public`).
- **rsync:** `-a` (archive, preserva permessi/tempi), `--delete` (rimuove in destination ciò che non c’è più in source), `--checksum` (decide cosa copiare in base al contenuto, non solo mtime/size). Così dopo un `npm run build` (che rinnova tutti i mtime in `dist`), rsync copia **solo** i file il cui contenuto è cambiato; i file invariati in `public` **non** vengono riscritti e **mantengono** il mtime → Xcode può considerarli invariati e ridurre il lavoro di Copy Bundle Resources.
- Dopo la sync si esegue `scripts/ios-post-sync.sh` (iniezione safe-area/Capacitor) come già previsto dal progetto.

---

## Perché è la più sicura

- Nessuna patch a Capacitor né a Xcode project/Pods/scheme.
- Stessi file finali in `ios/App/App/public` (stessa struttura e path serviti da Capacitor).
- Rollback immediato: rimuovere script e voci in `package.json`, tornare a `cap:sync:ios`.
- rsync è standard su macOS; nessuna dipendenza npm aggiuntiva.
- `cap update ios` resta il modo ufficiale per aggiornare plugin e config; non si bypassa la logica nativa, solo la copia web.

---

## File toccati

| File | Modifica |
|------|----------|
| `scripts/ios-sync-incremental.sh` | **Nuovo** — sync incrementale rsync + invocazione `ios-post-sync.sh`. |
| `package.json` | **Aggiunte** 2 righe negli `scripts`: `ios:sync:incremental`, `cap:ios:incremental`. |

Nessun altro file modificato (nessun React, Supabase, Vite, capacitor.config, Xcode, Podfile).

---

## Modifiche esatte

**scripts/ios-sync-incremental.sh** (nuovo, eseguibile):

- Verifica che esista `dist/`.
- Esegue: `rsync -a --delete --checksum "$DIST/" "$PUBLIC/"` (con `ROOT`, `DIST`, `PUBLIC` definiti nello script).
- Chiama `scripts/ios-post-sync.sh` se presente.
- Messaggio finale che ricorda di eseguire `npx cap update ios` se serve (plugins/config).

**package.json** — in `scripts`:

```json
"ios:sync:incremental": "bash scripts/ios-sync-incremental.sh",
"cap:ios:incremental": "npm run build && npm run ios:sync:incremental && npx cap update ios"
```

---

## Rollback

**Per annullare il fix:**

1. Eliminare il file: `scripts/ios-sync-incremental.sh`.
2. In `package.json`, rimuovere le due righe:
   - `"ios:sync:incremental": "bash scripts/ios-sync-incremental.sh",`
   - `"cap:ios:incremental": "npm run build && npm run ios:sync:incremental && npx cap update ios"`
3. Per il workflow iOS usare di nuovo: `npm run cap:sync:ios` (build + `npx cap sync ios`).

**Branch/tag safety (consigliato prima di adottare il fix in produzione):**

- Creare un tag di sicurezza prima di fare commit del fix:  
  `git tag fix-incremental-ios-sync-2026-03-14`
- In caso di rollback completo:  
  `git checkout -- scripts/ios-sync-incremental.sh package.json`  
  (se non ancora committati), oppure revert del commit che introduce il fix.

---

## Misurazioni prima/dopo

**Prima (comportamento noto):**

- `cap sync ios`: remove + full copy di `dist` → `ios/App/App/public`; tutti i mtime aggiornati; build Xcode 30–40 min (Copy Bundle Resources ~500 MB ogni volta).
- `dist/` e `ios/App/App/public/`: ~440–499 MB (dipende da pipeline asset).

**Dopo (misurato in repo):**

- `dist/`: ~440 MB (presente da build precedente).
- `ios/App/App/public/`: ~440 MB.
- **Sync incrementale:** primo run con `--checksum` su ~440 MB può richiedere **1–3 minuti** (confronto checksum su tutti i file). Run successivi **senza** modifiche a `dist` sono molto rapidi (rsync non copia nulla). Run successivi con **solo alcuni file** modificati in `dist` copiano solo quelli → solo quei file in `public` ricevono nuovo mtime → Xcode può lasciare invariati gli altri.

**Evidenza riscrittura / non riscrittura massiva:**

- Con **cap sync ios**: ogni esecuzione riscrive l’intera directory → tutti i mtime nuovi (evidenza forense: 96 mtime distinti su ~450 file, pattern da batch copy).
- Con **rsync -a --delete --checksum**: rsync copia solo i file il cui **contenuto** è diverso. I file identici **non** vengono riscritti e **conservano** il mtime in `ios/App/App/public`. Quindi non c’è più riscrittura massiva; solo i file effettivamente cambiati hanno mtime aggiornato. Questo è il comportamento standard di rsync con `--checksum` (skip su checksum uguale).

Non è stata eseguita una build Xcode completa in questa sessione (costo elevato); la riduzione dell’invalidazione di Copy Bundle Resources deriva dal comportamento di rsync e dalla root cause documentata nel report forense.

---

## Comandi da usare d’ora in poi (workflow iOS locale)

**Opzione consigliata (tutto in uno):**

```bash
npm run cap:ios:incremental
```

Equivale a: `npm run build` → `npm run ios:sync:incremental` → `npx cap update ios`.

**Opzione step-by-step (build una volta, sync più volte):**

```bash
npm run build
npm run ios:sync:incremental
npx cap update ios   # solo quando cambi plugin/config o la prima volta
```

Poi apri Xcode e fai Run come al solito.

**Non usare** per il ciclo abituale:

- `npx cap sync ios` (invalida l’incremental build)
- `npm run cap:sync:ios` (include cap sync ios)

Usa **cap sync ios** solo quando serve un “full refresh” esplicito (es. dopo clone, o per allineare Android/iOS in un colpo solo).

---

## Deploy / Joseph

- **Nessun deploy** richiesto per questo fix: riguarda solo il **workflow di build locale** sulla tua macchina.
- Nessuna modifica a runtime app, hosting, Supabase, Edge, CDN. Non serve pubblicare nulla; basta usare i nuovi comandi in locale.

---

## GO / NO GO finale

**GO.**

Il fix è in scope, conservativo e rollbackabile. Riduce l’invalidazione di Copy Bundle Resources evitando il full remove+copy di `cap sync ios` e usando rsync incrementale con `--checksum`. Nessuna modifica a logica applicativa, Xcode project, Pods o scheme.

---

**Fine report.**
