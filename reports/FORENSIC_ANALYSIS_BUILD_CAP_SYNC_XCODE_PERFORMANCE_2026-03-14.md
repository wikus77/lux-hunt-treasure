# Forensic analysis — Build & Cap Sync & Xcode performance (read-only)

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Data:** 2026-03-14  
**Scope:** Analisi forense completa, **nessuna modifica** a codice, config, Xcode, Pods, script.  

---

## 1. EXECUTIVE SUMMARY

**Problema:** Build Vite lenta (~5–6 min), `npx cap sync ios` lenta, build Xcode molto lenta (fino a 1800+ secondi), blocchi verso step 737/751–746/751, installazione su device lenta; terminale lento durante le operazioni.

**Causa più probabile (collo di bottiglia principale):**

1. **Volume di dati copiati (I/O disco):** La cartella **`public/`** è **431 MB** (332 file). Vite la copia per intero in `dist/` a ogni build (default `copyPublicDir: true`). **`dist/`** risulta **463 MB** (452 file). **`npx cap sync ios`** copia l’intero `dist/` in **`ios/App/App/public/`** (463 MB, 454 file). Quindi a ogni ciclo build+sync vengono scritti/copiati **centinaia di MB** due volte (public→dist, dist→ios). Su disco lento o con antivirus/Spotlight, questo spiega facilmente 2–4+ minuti solo per I/O.

2. **Build Xcode:** Oltre alla fase **“Compile asset catalogs”** (già segnalata ~442 s in un report precedente, legata ad AppIcon/asset catalog), la fase **Resources** include la cartella **“public”** (463 MB, 454 file). Xcode deve processare e includere questa cartella nel bundle dell’app. L’app risultante è quindi molto pesante; **l’installazione su device** (copiare un bundle di ~470 MB) diventa lenta. Gli step 737–746/751 possono corrispondere a “Compile asset catalogs”, “Process/embed Resources” (public) o “Install on device”.

3. **Prebuild:** Prima di ogni `npm run build` viene eseguito **prebuild** (`scripts/push-guard.cjs`), che fa una scansione **sincrona** di **1868 file** in `src/` (readFileSync + regex). Costo stimato **5–15+ secondi** a build.

4. **Terminale:** Può essere rallentato da: directory di lavoro con **62 682 file** in `node_modules` (904 MB), shell che esegue comandi pesanti a ogni avvio, antivirus/Spotlight su cartelle di progetto.

**Sintesi:** Il vero collo di bottiglia è la **dimensione di `public/`** (431 MB) e la sua **doppia copia** (build + cap sync), più l’inclusione della stessa massa di dati nel bundle Xcode e nell’installazione su device. In secondo ordine: prebuild che legge migliaia di file, asset catalog Xcode, e ambiente (terminal/shell/disco).

---

## 2. DIMENSIONI PROGETTO

| PATH | SIZE | NUMERO FILE |
|------|------|-------------|
| `public/` | **431 MB** | 332 |
| `dist/` | **463 MB** | 452 |
| `ios/App/App/public/` | **463 MB** | 454 |
| `node_modules/` | **904 MB** | 62 682 |
| `src/` | 17 MB | 2 006 |
| `ios/App/Pods/` | 3,5 MB | 126 |
| `ios/App/` (totale) | **470 MB** | — |

**Osservazioni:**  
- `public/` e `dist/` (e quindi `ios/App/App/public/`) sono dello stesso ordine di grandezza (~430–463 MB).  
- `dist/` = output Vite (JS + asset generati) + **copia integrale di `public/`** (comportamento default Vite).  
- `ios/App` ~470 MB indica un app bundle molto grande, dominato dal contenuto di `ios/App/App/public/` (web assets).

---

## 3. ANALISI BUILD VITE

**Configurazione rilevante (`vite.config.ts`):**

- **`build.copyPublicDir`:** Non impostato → **default `true`**. Vite copia **tutta** la cartella `public/` in `dist/` a ogni build.
- **`build.minify`:** `false` (commento: MapLibre worker). Nessuna minificazione → output JS più grande, meno CPU ma più I/O in scrittura.
- **`build.reportCompressedSize`:** `false` → nessun calcolo gzip/brotli (positivo per il tempo).
- **Plugin in production:** `rollup-plugin-visualizer` → genera `dist/bundle-analysis.html` (~1,9 MB).
- **Rollup:** `manualChunks` per react, router, ui, supabase, animation, three, map, stripe. `emptyOutDir: true`, `cssCodeSplit: true`, `chunkSizeWarningLimit: 2000`.

**Cosa succede durante la build:**

1. **prebuild** (vedi §3 sotto) esegue per primo.
2. Vite/Rollup trasforma e fa il bundle di **~1868+ moduli** (src + dipendenze pesanti: three, maplibre, leaflet, stripe, supabase, ecc.).
3. **Copia di `public/` in `dist/`:** Vite copia **431 MB** (332 file) in `dist/`. Questa operazione è **non incrementale** (tutto ogni volta).
4. Scrittura degli chunk JS in `dist/assets/` (es. `index.*.js` ~6,3 MB, `three-vendor.*.js` ~1 MB, ecc.) e generazione di `bundle-analysis.html`.

**Dimensioni output:**

- **dist/assets/:** ~334 MB (JS e asset emessi da Rollup).
- **dist/** totale: 463 MB (assets + copia di public).

**Impatto stimato sul tempo di build:**

- **Copia public → dist (431 MB):** 1–3+ minuti (dipende da disco e antivirus).
- **Bundle Rollup (transform + write):** 2–4 minuti (codebase e dipendenze pesanti).
- **Prebuild:** 5–15+ secondi.  
**Totale coerente con 5–6+ minuti.**

---

## 4. ANALISI CAP SYNC

**Comportamento di `npx cap sync ios`:**

- **Fonte:** `capacitor.config.ts` → `webDir: 'dist'`.
- **Destinazione:** Contenuti di `dist/` vengono copiati in **`ios/App/App/public/`** (e aggiornamento di `capacitor.config.json` e plugin iOS).

**Dimensioni:**

- **dist/:** 463 MB, 452 file.
- **ios/App/App/public/:** 463 MB, 454 file (dopo sync).

**Copia incrementale o totale:**

- Dalla documentazione e dal comportamento tipico di Capacitor, **non** risulta un’opzione “sync incrementale” per i file web: viene effettuata una copia **completa** (o quasi) del contenuto di `dist/` verso `ios/App/App/public/`. Quindi a ogni `cap sync ios` si scrivono **~463 MB** e **centinaia di file**.

**Costo I/O stimato:**

- Scrivere 463 MB (e leggere altrettanti da `dist/`) su disco: **1–3+ minuti** a seconda di disco, filesystem e antivirus. Coerente con la percezione di “cap sync molto lenta”.

---

## 5. ANALISI BUILD XCODE

**Dati a disposizione:**

- Build Xcode **estremamente lenta** (fino a **1800+ secondi**).
- **Blocchi** in prossimità della fine: step **737/751 – 746/751** (su 751 step totali).
- Installazione app su device lenta.

**Fasi potenzialmente lente (da log e report precedenti):**

1. **Compile asset catalogs (actool):** In un report precedente è stato misurato **~442,9 secondi**. Causa identificata: AppIcon/asset catalog (unassigned child, `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES`, molte icone). Un fix mirato (rimozione M1.png + flag NO) è stato proposto/applicato in quel report; la validazione va fatta in Xcode.
2. **Resources build phase:** Nel `project.pbxproj` la fase **Resources** include esplicitamente **“public in Resources”** (riferimento alla cartella `ios/App/App/public/`). Quindi Xcode deve **processare e includere** **463 MB** e **454 file** nel bundle. Questa fase può richiedere **molto tempo** (I/O e copia nel derived data / app bundle).
3. **[CP] Check Pods Manifest.lock** e **[CP] Embed Pods Frameworks:** Script CocoaPods eseguiti a ogni build. `Embed Pods Frameworks` esegue `Pods-App-frameworks.sh`. Impatto tipicamente secondario rispetto a centinaia di secondi, ma contribuisce al tempo totale.
4. **Installazione su device:** L’app bundle finale (con **~470 MB** per `ios/App`, di cui la gran parte è `App/public`) deve essere copiata sul device. Copiare **centinaia di MB** via cavo/Wi‑Fi spiega un’**installazione molto lenta**.

**Quale fase consuma più tempo:**

- **Principale:** “Compile asset catalogs” (fino a ~443 s) e **processamento/inclusione della cartella “public” (463 MB)** nella fase Resources / nel bundle.
- **Seguito da:** Installazione del bundle pesante sul device.

Senza log di build Xcode completi con tempi per ogni step, le stime si basano su: (a) report precedente (asset catalog), (b) dimensione di `ios/App/App/public/` e (c) inclusione di “public” nelle Resources.

---

## 6. ANALISI PODS

**Dimensioni e contenuto:**

- **ios/App/Pods/:** **3,5 MB**, **126 file**. Dimensione contenuta.
- Nel progetto è presente una **Check Pods Manifest.lock** e **Embed Pods Frameworks**; non risulta un phase esplicito “Copy XCFrameworks” nel pbxproj letto, ma gli script CocoaPods sono quelli standard.

**Build script sempre eseguiti:**

- **[CP] Check Pods Manifest.lock:** confronta `Podfile.lock` e `Manifest.lock` (molto veloce).
- **[CP] Embed Pods Frameworks:** esegue lo script che incorpora i framework Pods nell’app. Con solo 3,5 MB di Pods, il costo è **limitato** (secondi, non centinaia).

**Warning “[CP] Copy XCFrameworks” / “Embed Pods Frameworks”:**

- Sono **messaggi normali** di CocoaPods; indicano che le fasi stanno girando. Con Pods piccoli, **non** sono la causa principale di build da 1800+ secondi. La causa principale resta **asset catalog** e **dimensione della cartella “public” (Resources)**.

---

## 7. ANALISI TERMINAL / MAC

**Fattori che possono rallentare terminale e operazioni sul progetto:**

1. **Directory di lavoro:** Aprire il terminale nella root del progetto significa avere in cwd **node_modules** (904 MB, **62 682 file**). Prompt che fa `git status`, completamento tab o tool che scansionano la cwd possono diventare lenti.
2. **Shell (.zshrc, .zprofile):** Script che a ogni avvio eseguono nvm/fnm, conda, `git status`, ecc. in repo grandi aumentano il tempo di avvio del terminale.
3. **Antivirus / Spotlight:** Scansione o indicizzazione di `node_modules`, `dist`, `public` durante build, sync o anche solo navigazione in progetto → I/O aggiuntivo e possibile locking.
4. **Tipo di disco:** HDD o volume di rete → copie di 431–463 MB diventano molto lente; SSD riduce il problema.
5. **Node/npm/pnpm:** `npx` (cache, risoluzione), `pnpm` (link, molti file) possono aggiungere secondi a ogni comando nella prima esecuzione o in condizioni di I/O lento.

**Impatto:** Non quantificabile senza misurazioni sul tuo Mac; le dimensioni (62k file in node_modules, 431 MB in public) sono però **coerenti** con terminale lento e con build/sync lente se combinati con shell pesante o antivirus/disco lento.

---

## 8. CLASSIFICA COLLI DI BOTTIGLIA

**1️⃣ Causa principale**

- **Dimensione di `public/` (431 MB) e sua copia sistematica.**  
  - In build: copia **public → dist** (431 MB) a ogni `npm run build`.  
  - In sync: copia **dist → ios/App/App/public** (~463 MB) a ogni `npx cap sync ios`.  
  - In Xcode: la cartella **“public” (463 MB)** è in Resources → processata e inclusa nel bundle → **installazione su device** lenta (bundle ~470 MB).  
  **Impatto:** 2–4+ min su build, 1–3+ min su cap sync, e contributo forte ai 1800+ s di Xcode (Resources + install).

**2️⃣ Cause secondarie**

- **Compile asset catalogs (Xcode):** ~442 s (report precedente). AppIcon/asset catalog (unassigned child, INCLUDE_ALL_APPICON_ASSETS, molte icone). Fix mirato già proposto in altro report.
- **Bundle Vite:** ~1868 moduli, dipendenze pesanti (three, map, stripe, supabase, ecc.), `minify: false` → output grande e tempo di build 2–4 min.
- **Prebuild (push-guard.cjs):** Scansione sincrona di **1868 file** in `src/` (readFileSync + regex) prima di ogni build. Stimabile **5–15+ s** a build.
- **Terminale/ambiente:** node_modules (62k file), shell, antivirus, disco → possibile rallentamento generale e durante comandi.

**3️⃣ Cause marginali**

- **[CP] Embed Pods Frameworks / Check Pods Manifest.lock:** Eseguiti a ogni build; Pods piccoli (3,5 MB) → impatto in secondi.
- **rollup-plugin-visualizer:** Genera `bundle-analysis.html` in production → costo in secondi.
- **reportCompressedSize: false:** Già disattivato → nessun costo aggiuntivo da gzip/brotli.

---

## 9. POSSIBILI STRATEGIE DI RISOLUZIONE (SOLO RACCOMANDAZIONI)

**Nessuna modifica è stata applicata in questa analisi.** Di seguito solo raccomandazioni tecniche.

### 9.1 Ridurre il tempo di build Vite e di cap sync

- **Ridurre drasticamente ciò che viene copiato da `public/` in `dist/`:**
  - **Opzione A:** Spostare su CDN (o altro hosting) i contenuti pesanti (video, asset premi, lovable-uploads, ecc.) e referenziarli via URL. Tenere in `public/` solo ciò che è strettamente necessario per build e app (es. `sw.js`, `vapid-public.txt`, `_headers`, poche immagini critiche).
  - **Opzione B:** Impostare in Vite `build.copyPublicDir: false` e usare un plugin o uno script post-build che copia **solo** i file necessari (es. `sw.js`, `vapid-public.txt`, `_headers`, icone/favicon) da `public/` a `dist/`, **senza** copiare `public/assets`, `public/video`, `public/lovable-uploads`, ecc.
- **Effetto atteso:** `dist/` passa da ~463 MB a decine di MB → build (copia) e cap sync molto più veloci; anche Xcode e installazione su device beneficiano (bundle più piccolo).

### 9.2 Ridurre il tempo di build Xcode

- **Asset catalog:** Applicare/verificare il fix già descritto nel report “Xcode build lenta” (rimozione unassigned child, `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO`). Validare in Xcode il tempo di “Compile asset catalogs”.
- **Risorse “public”:** Riducendo la dimensione di `ios/App/App/public/` (tramite riduzione di `dist/` come sopra), la fase Resources e l’installazione su device si alleggeriscono.

### 9.3 Prebuild

- Valutare di eseguire il push-guard **solo in CI** (rimuovere o bypassare `prebuild` per build locali) oppure di ottimizzare lo script (scan solo file modificati, o parallelizzazione) per ridurre i 5–15+ secondi a build.

### 9.4 Terminale / ambiente Mac

- Controllare **.zshrc / .zprofile** e disattivare temporaneamente comandi pesanti a ogni avvio (nvm, script che toccano il repo, ecc.).
- **Escludere** la cartella di progetto (o almeno `node_modules`, `dist`, `public`) dalla scansione in tempo reale dell’antivirus, se possibile.
- Lavorare su **SSD** ed evitare volumi di rete per il progetto.
- Evitare di avere la cwd in una directory con decine di migliaia di file se il prompt o i tool fanno operazioni su tutta la cwd.

---

**Fine del report.** Analisi eseguita in **sola lettura**; nessuna modifica applicata a codice, configurazioni, Xcode, Pods o script.
