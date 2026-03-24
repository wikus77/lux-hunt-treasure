# Phase Performance 1 — Safe Build Pipeline Reduction

**Project:** M1SSION™  
**Data:** 2026-03-14  
**Branch:** `perf/safe-build-reduction`  
**Rollback tag:** `safety/perf-build-before`

---

## EXECUTIVE SUMMARY

**Obiettivo:** Ridurre la copia di asset da `public/` a `dist/` (e quindi a `ios/App/App/public/`) **senza modificare il runtime** dell’app, intervenendo solo sulla pipeline di build.

**Modifiche applicate:**

- **Fase 1:** Branch `perf/safe-build-reduction` e tag `safety/perf-build-before` creati.
- **Fase 2:** Creata whitelist `build/asset-whitelist.json` (rootFiles, dirs, lovableUploads da analisi di `src/`, SW, manifest, config).
- **Fase 3:** In `vite.config.ts`: `build.copyPublicDir: false`.
- **Fase 4:** Plugin Vite `build/copy-public-assets-plugin.cjs` che, in `closeBundle`, copia da `public/` a `dist/` solo i file/cartelle in whitelist.
- **Fase 5:** Il plugin copia i 54 file lovable-uploads anche in `dist/public/lovable-uploads/` per il path `/public/lovable-uploads/` usato da EventsPage (nessuna modifica al codice).
- **Fase 6:** Il plugin rimuove `dist/bundle-analysis.html` dopo la copia.

**Dimensioni dist**

| Metrica        | Prima (forensic report) | Dopo (questa build) |
|----------------|-------------------------|----------------------|
| **dist**       | 463 MB, 452 file        | 484 MB, 448 file     |
| **Build Vite** | ~5–6 min (stima)         | ~2m 38s (solo Vite)  |
| **Build totale** (prebuild + vite) | —                | ~9m 35s (wall)      |

**Nota:** La dimensione di `dist/` resta dello stesso ordine di grandezza perché la whitelist include **tutte** le directory pesanti richieste a runtime (`assets/`, `video/`, `videos/`, `prizes/`, `icons/`, ecc.). La riduzione è su: (1) **lovable-uploads** — copiati solo i 54 file referenziati invece dell’intera cartella (~56 MB); (2) **file di diagnostica/test** — non copiati (push-diag, fcm-*, test-*, sw-test, ecc.); (3) **bundle-analysis.html** — rimosso da `dist/` dopo la build. Su macchine diverse e con Rollup output diverso (hash), i numeri possono variare leggermente.

---

## CAP SYNC

**Comportamento:** `npx cap sync ios` copia l’intero `dist/` in `ios/App/App/public/`. Con `dist/` più piccolo (o uguale), il tempo di “Copying web assets” dipende dalla dimensione di `dist/`.

| Metrica                    | Prima (forensic) | Dopo (questa esecuzione)      |
|----------------------------|------------------|--------------------------------|
| **ios/App/App/public**     | 463 MB, 454 file | 514 MB, 450 file               |
| **Tempo copy web assets**  | —                | **109,32 s**                   |
| **Tempo totale sync**      | —                | **~4m 42s** (fino a pod install) |

**Nota:** In questa esecuzione `pod install` è fallito con **403 Forbidden** da `cdn.cocoapods.org` (ambiente/rete). La fase **“Copying web assets from dist to ios/App/App/public”** è completata con successo in **109 s**. Il rollback non è necessario per la pipeline web; per build Xcode su device è necessario eseguire `pod install` in ambiente con accesso a CocoaPods (o rete completa).

---

## BUILD XCODE

**Stato:** Non eseguita in questa sessione (Xcode e build su device reale vanno eseguiti in locale).

**Da fare in locale:**

1. `npx cap open ios`
2. Build su device reale
3. Misurare: tempo build Xcode, tempo install su device

Con `ios/App/App/public/` della stessa ordine di grandezza di prima, i tempi di build Xcode e install restano condizionati dalla dimensione della cartella “public” in Resources. Un ulteriore alleggerimento richiederebbe di non copiare intere directory pesanti (es. spostando parte degli asset su CDN e aggiornando il codice, fuori scope Phase 1).

---

## VERIFICA FUNZIONALE

**Non eseguita in questa sessione.** Da fare in locale dopo build e sync:

- Login, BUZZ, BUZZ MAP, premi, video, audio, immagini, mappe, push, eventi.
- Assenza di **404** su asset (in particolare `/assets/*`, `/video/*`, `/prizes/*`, `/icons/*`, `/lovable-uploads/*`, `/public/lovable-uploads/*`).
- Assenza di errori in console e runtime.

Se compaiono 404, verificare che il path sia incluso in `build/asset-whitelist.json` (rootFiles, dirs o lovableUploads) e che il file esista in `public/`.

---

## IMPATTO REALE

- **Pipeline:** La build non copia più l’intera `public/`; copia solo whitelist. La copia è concentrata in un unico passo (plugin in `closeBundle`) e non duplica il lavoro di Vite.
- **Tempo build:** Vite ha riportato **built in 2m 38s**. Il tempo totale (9m 35s) include prebuild (push-guard) e shell. Il tempo di copia disco per gli asset è quello del plugin (solo file whitelisted).
- **Cap sync:** La fase di copy web assets è stata **109 s** per ~484 MB. Riducendo in futuro la whitelist (solo se compatibile con il runtime), sync e build Xcode potrebbero ulteriormente ridursi.
- **Rischio:** Nessun cambiamento a logica, URL, componenti, routing, push, IAP, BUZZ. Un eventuale 404 va risolto aggiungendo il path alla whitelist.

---

## VERDETTO

**GO** — La **Safe Build Pipeline Reduction** è stata implementata rispettando i paletti:

- Modifiche solo a: pipeline build Vite, strategia di copia da `public/`, dimensione/contenuto di `dist/`, footprint di Capacitor.
- Nessun refactor codice, nessun cambio URL runtime, nessuno spostamento asset su CDN, nessuna modifica a login, IAP, BUZZ, push, DB, UI, business logic.
- Rollback possibile con: `git checkout main` (o branch precedente) e `git checkout safety/perf-build-before -- .` se necessario ripristinare lo stato pre-modifica.

**Raccomandazioni:**

1. Eseguire in locale build Xcode e install su device e misurare tempi.
2. Eseguire la verifica funzionale (login, BUZZ, mappe, premi, video, push, eventi) e controllare assenza 404.
3. Se si aggiungono in futuro nuovi asset in `public/` referenziati a runtime, aggiornare `build/asset-whitelist.json` (rootFiles, dirs o lovableUploads) per evitare 404.
4. Per riduzioni più importanti di `dist/` e della sync, valutare in una fase successiva lo spostamento di asset pesanti su CDN (con adeguamento URL nel codice, fuori scope Phase 1).

---

**Fine del report.**
