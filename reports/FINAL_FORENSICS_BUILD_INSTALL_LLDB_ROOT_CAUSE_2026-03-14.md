# Forensics finale — Build 30–40 min / Copy Bundle Resources / Invalidazione incrementale / Cap sync

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Data:** 2026-03-14  
**Vincolo:** READ-ONLY ASSOLUTO — nessuna modifica applicata.

---

## 1. EXECUTIVE SUMMARY

**Causa più probabile:**  
**`npx cap sync ios` invalida l’incremental build di Xcode** perché a ogni esecuzione **rimuove** `ios/App/App/public` e **ricopia** l’intero `dist` (fs_extra.remove + fs_extra.copy). Tutti i file in `public` ricevono **nuovi mtime**. Xcode tratta `public` come **un’unica folder reference** in Copy Bundle Resources; vede la cartella “modificata” e **ricopia l’intera cartella (499 MB)** nel bundle a ogni build. Il tempo 30–40 min è quindi dominato dalla fase **Copy Bundle Resources** dopo un sync, non da “bundle grande” in astratto né da solo install/LLDB.

**Top 3 cause ordinate:**  
1. **Cap sync invalida l’incremental** — remove + full copy → mtimes sempre nuovi → Copy Bundle Resources sempre eseguita in pieno.  
2. **Copy Bundle Resources** — ricopia ~499 MB a ogni build quando l’input “public” è considerato cambiato (come dopo ogni cap sync).  
3. **Disco ~95% / I/O** — amplifica i tempi di copia; non la causa prima del salto 5–10 → 30–40 min.

**Verdetto:** **Problema da build** (Copy Bundle Resources resa non incrementale da cap sync) con **contributo ambiente** (disco, I/O). Install e LLDB sono **moltiplicatori secondari**, non la causa principale del tempo mostrato nel Build Log.

---

## 2. HARD EVIDENCE

**File letti e verificati:**

- `ios/App/App.xcodeproj/project.pbxproj` — Build phases, PBXFileReference per `public`, PBXResourcesBuildPhase, PBXShellScriptBuildPhase per Embed Pods.  
- `ios/App/Podfile` — `install! 'cocoapods', :disable_input_output_paths => true`; elenco pod.  
- `node_modules/@capacitor/cli/dist/tasks/copy.js` — Funzione `copyWebDir`: righe 134–147 (remove + copy).  
- `node_modules/@capacitor/cli/dist/tasks/sync.js` — sync = copy + update; copy chiama copyWebDir.  
- `build/copy-public-assets-plugin.cjs` — Uso di fs.copyFileSync / copyRecursive (scrive in dist; non modifica il comportamento di cap sync).  
- `ios/App/App/public` — stat su cartella e sotto-cartella; find per conteggio mtime distinti e distribuzione.  
- `df` su `/System/Volumes/Data` e `du -sh ios/App/App/public`.

**Prove concrete raccolte:**

1. **project.pbxproj:** `public` è un unico `PBXFileReference` con `lastKnownFileType = folder` e `path = public`. Nella fase Resources c’è un solo elemento: “public in Resources” (fileRef 50B271D0). Quindi Xcode vede **una sola folder reference**, non un elenco di 450 file.  
2. **copy.js (Capacitor):** In `copyWebDir` (chiamata per iOS con `nativeAbsDir` = `ios/App/App/public`, `webAbsDir` = `dist`): viene eseguito `await fs_extra.remove(nativeAbsDir)` e poi `return fs_extra.copy(webAbsDir, nativeAbsDir)`. **Ogni** `cap sync ios` rimuove completamente la destinazione e fa una copia totale da dist.  
3. **mtimes in ios/App/App/public:** 450 file con **96 mtime distinti**; picchi (38, 25, 17, 16, 15 file con lo stesso mtime). Coerente con una **scrittura a batch** (copiati in pochi secondi), tipica di un full copy dopo remove.  
4. **Ordine build phases target App:** [CP] Check Pods Manifest.lock → Sources → Frameworks → **Resources** → [CP] Embed Pods Frameworks. In Resources: LaunchScreen, **public**, Assets.xcassets, capacitor.config.json, Main.storyboard, config.xml.  
5. **[CP] Embed Pods Frameworks:** `inputPaths` e `outputPaths` vuoti (per `disable_input_output_paths => true` nel Podfile). Eseguita a ogni build; Pods ~3,5 MB → impatto in secondi.  
6. **Disco:** `/System/Volumes/Data` ~95% usato, ~100 GB liberi.  
7. **Dimensione:** `ios/App/App/public` ~499 MB.

**Cosa non è stato possibile verificare:**

- Log di build Xcode (xcactivitylog non presenti nel repo; path DerivedData non ispezionato).  
- Tempo esatto per singola fase (Copy Bundle Resources vs actool vs CodeSign) senza Build With Timing Summary.  
- Se il numero 1858/2119/2222 s è “solo build” o “build + install” (dipende da dove l’utente legge il tempo).  
- Stato di DerivedData prima/dopo la pulizia manuale.  
- Confronto mtime prima/dopo un singolo cap sync (non eseguito sync).

---

## 3. COPY BUNDLE RESOURCES ANALYSIS

**Come viene trattata `public`:**

- Nel progetto Xcode, `public` è una **folder reference** (PBXFileReference con `lastKnownFileType = folder`, path `public`). In Copy Bundle Resources c’è **un solo** riferimento: “public in Resources”.  
- Xcode **non** ha un elenco di 450 file; ha un unico input “cartella public”. Il build system (new build system) per una folder reference tipicamente considera la cartella come unità: se la cartella o il suo contenuto risultano “modificati” rispetto all’output nel bundle, la fase copia la risorsa. Il confronto è in genere basato su mtime o su fingerprint del contenuto (dipende dalla versione Xcode).

**Se viene probabilmente ricopiata ogni volta:**

- **Sì.** Subito dopo un `cap sync ios`, tutti i file in `ios/App/App/public` hanno mtime **recente** (istante del copy). Quindi l’input “public” è **sempre più nuovo** dell’ultima copia nel bundle (a meno che non si faccia una build senza aver fatto sync dopo l’ultima build). In pratica: **ogni “cap sync poi Xcode Run”** fa sì che Copy Bundle Resources veda input modificato e **ricopia l’intera cartella** (~499 MB).

**Perché:**

- Cap sync **non** fa un copy incrementale: fa **remove** della destinazione e **copy** completa della sorgente. Quindi a ogni sync tutti i file di `public` sono “appena scritti” → mtimes aggiornati.  
- Xcode non può considerare “public” invariato dopo un sync, perché dal suo punto di vista la cartella è stata modificata (mtimes nuovi).  
- La pipeline safe (plugin che copia in dist) non cambia questo: riduce cosa c’è in dist/public ma **non** il fatto che cap sync faccia remove+copy e quindi aggiorni tutti i mtime.

**Evidenze:**

- Codice Capacitor copy.js (remove + copy) citato sopra.  
- Un solo riferimento a “public” in Resources; tipo folder.  
- Distribuzione mtime in `ios/App/App/public` (96 valori su 450 file) coerente con scrittura massiva recente.

---

## 4. CAP SYNC INVALIDATION ANALYSIS

**Se `cap sync ios` invalida l’incremental build:**

- **Sì.** A ogni `cap sync ios` la directory `ios/App/App/public` viene **rimossa** e **sostituita** con una copia completa di `dist`. Tutti i file hanno quindi mtime uguale all’istante del copy (o a pochi secondi di distanza). L’incremental build di Xcode per la fase Copy Bundle Resources si basa su input “public” (folder) non modificato; dopo un sync l’input è **sempre** modificato.

**Se i mtime cambiano in massa:**

- **Sì.** Dopo ogni sync, **tutti** i file in `public` sono appena scritti; non c’è “solo qualche file cambiato”. La distribuzione osservata (96 mtime su 450 file, con molti file che condividono lo stesso mtime) è coerente con una copia completa eseguita in un intervallo di secondi.

**Se questo basta a spiegare la regressione:**

- **Sì.** Se 2–3 giorni fa il flusso era “build Xcode senza aver fatto cap sync subito prima” (o senza sync prima di ogni Run), allora “public” poteva avere mtime vecchi e Xcode poteva **non** rieseguire Copy Bundle Resources (o copiare molto meno). Se ora il flusso è “cap sync ios” seguito da “Xcode Run” (o sync più frequente), allora a ogni Run l’input è fresco → Copy Bundle Resources sempre a pieno → 30–40 min. La pipeline safe **non** introduce questo comportamento: è il **comportamento standard di Capacitor** (remove + copy) che lo causa.

---

## 5. INCREMENTAL BUILD STATE

**Segnali di incremental build persa o full rebuild ricorrente:**

- **Segnale forte:** Dopo ogni cap sync, l’input “public” della fase Copy Bundle Resources è **sempre** da considerare modificato (mtimes nuovi). Quindi quella fase **non** può essere “up to date” al Run successivo.  
- **Segnale:** [CP] Embed Pods Frameworks senza outputPaths → eseguita a ogni build; impatto secondario (secondi).  
- **Non verificabile senza log:** Se altre fasi (Sources, actool, link) sono incrementali o meno. L’unica evidenza certa è che **Copy Bundle Resources** è invalidata da cap sync.

**Livello di confidenza:** **Alto** per “Copy Bundle Resources resa non incrementale da cap sync”; **medio** per “full rebuild ricorrente” in senso globale (non letti log Xcode).

---

## 6. INSTALL / DEVICE / LLDB ANALYSIS

**Contributo reale di install:**

- L’install copia il .app (~500 MB) sul device. Su wireless può richiedere vari minuti. **Non** è la causa del tempo **nel Build Log** (1858/2119/2222 s): quel tempo, se letto dal Report Navigator, è di build. L’install è **conseguenza** del bundle grande e **contribuisce** al tempo totale “Run” (build + install + launch).

**Contributo reale di LLDB:**

- “The LLDB RPC server has crashed” riguarda launch/attach, non compilazione. Può aggiungere minuti (timeout, ritenti) **dopo** la build e l’install. L’utente ha indicato che il tempo anomalo compare **già nel Build Log** → la parte dominante è **build** (in particolare Copy Bundle Resources), non solo attach.

**Classificazione peso:**

- **Install su device:** **Secondario** — necessario per Run su device; tempo significativo ma non la causa principale del salto 5–10 → 30–40 min se il numero viene dal build.  
- **LLDB / Debug attach:** **Moltiplicatore** — può aggiungere minuti dopo build/install; non la causa principale del tempo nel Build Log.

---

## 7. ENVIRONMENT ANALYSIS

**Disco:** `/System/Volumes/Data` ~95% usato, ~100 GB liberi. Rischio I/O lento e swap.

**I/O:** Copiare 499 MB (Copy Bundle Resources) su disco molto pieno è lento. Non misurato con iostat; classificazione per coerenza con capacità disco.

**Processi:** Non eseguito elenco processi (Xcode, Cursor, OneDrive, CoreSimulator). Non verificato.

**Cursor/Xcode aperti a lungo:** Segnalato dall’utente; può contribuire a degrado generale (memoria, cache). Non quantificato.

**Classificazione collo di bottiglia:** **I/O-bound** (copia 499 MB, disco 95%) con **causa scatenante** da **build** (invalidazione Copy Bundle Resources da cap sync). Non classificabile come solo CPU-bound o solo debugger-bound; **mix** con dominante I/O/build.

---

## 8. ROOT CAUSE RANKING

| # | Causa | Gravità | Probabilità | Motivazione |
|---|--------|---------|-------------|-------------|
| 1 | **cap sync ios** fa remove + full copy → mtimes di `public` sempre nuovi → **Copy Bundle Resources** sempre eseguita in pieno | Molto alta | Molto alta | Codice Capacitor verificato; mtimes in public coerenti; folder reference unica in Xcode. |
| 2 | **Copy Bundle Resources** ricopia ~499 MB quando l’input “public” è considerato modificato | Molto alta | Certa | Fase presente; input = folder reference; dopo sync input è sempre “modificato”. |
| 3 | **Disco ~95%** → I/O lento sulla copia di 499 MB | Alta | Alta | df verificato; coerenza con tempi lunghi. |
| 4 | **Install** su device (bundle ~500 MB) via wireless | Media | Alta | Contribuisce al tempo “Run” totale, non al solo Build Log. |
| 5 | **LLDB** crash/attach dopo install | Media | Media | Moltiplicatore; non causa del tempo in Build Log. |
| 6 | **[CP] Embed Pods Frameworks** ogni build | Bassa | Certa | Impatto in secondi (Pods piccoli). |
| 7 | Pipeline safe (plugin / whitelist) | Bassa | N/A | Riduce contenuto dist/public; non modifica remove+copy di cap sync né mtime. |

---

## 9. COSA FARE ADESSO

**Solo piano minimo (massimo 5 step), nessuna implementazione.**

- **Step 1 — Verifica misura:** Eseguire **Build With Timing Summary** e aprire la **Timeline** della build. Annotare i secondi per **Copy Bundle Resources**. Se dominano (es. 15–25 min), conferma che il collo di bottiglia è quella fase. **Motivazione:** distinguere build da install/LLDB e dare priorità agli interventi.

- **Step 2 — Ridurre invalidazione da cap sync:** Valutare (in un secondo momento, fuori da questa forensics) una modifica al **flusso** o allo **strumento** di sync: (a) non eseguire `cap sync ios` prima di ogni Xcode Run quando il contenuto web non è cambiato; oppure (b) usare uno script di sync che copia in modo **incrementale** (es. rsync con preserve di mtime dove il contenuto non cambia) invece di remove+copy, così che Xcode non veda sempre “public” modificata. **Motivazione:** eliminare la causa prima (mtimes sempre nuovi dopo sync).

- **Step 3 — Ridurre dimensione di `public`:** Mantenere/estendere la pipeline safe (copia selettiva in dist) in modo che dopo cap sync `ios/App/App/public` sia più piccola. **Motivazione:** a parità di “copy ogni volta”, meno dati = meno tempo.

- **Step 4 — Liberare disco:** Portare l’uso del volume dati sotto ~85%. **Motivazione:** ridurre I/O lento e stress su build/cache.

- **Step 5 — LLDB/install (se necessario):** Se il tempo totale “Run” include molti minuti dopo “Build Succeeded”, verificare run **senza** “Debug executable” e controllare crash log in `~/Library/Logs/DiagnosticReports/` (prefisso `lldb-rpc-server`). **Motivazione:** quantificare e eventualmente ridurre la parte install/attach.

---

## 10. FINAL VERDICT

**GO** per un successivo prompt di fix chirurgico.

**Il fix deve colpire in priorità:**

1. **Xcode incremental / Resources** — Evitare che Copy Bundle Resources sia obbligata a ricopiare ogni volta (flusso: non sync prima di ogni Run, oppure sync incrementale che preservi mtime quando il contenuto non cambia).  
2. **Cap sync footprint** — Ridurre la quantità di dati copiati (pipeline safe già in direzione giusta; eventuale sync incrementale lato script/tool).  
3. **Ambiente locale** — Liberare disco; nessun cambiamento a progetto/codice.

**LLDB/debug** — Intervento solo se, dopo aver ridotto build/install, il tempo “Run” resta alto; classificato come moltiplicatore, non causa principale del tempo nel Build Log.

---

**Fine del report. Nessuna modifica è stata applicata.**
