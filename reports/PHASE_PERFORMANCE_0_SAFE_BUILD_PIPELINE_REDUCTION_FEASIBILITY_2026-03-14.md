# Phase Performance 0 — Verifica fattibilità Safe Build Pipeline Reduction

**Project:** M1SSION™  
**Data:** 2026-03-14  
**Tipo:** READ-ONLY — analisi tecnica di fattibilità, nessuna modifica a codice/config/asset.

---

## 1. EXECUTIVE SUMMARY

**È possibile implementare la SAFE BUILD PIPELINE REDUCTION senza toccare la logica applicativa?**

**Risposta: YES**

È tecnicamente possibile intervenire **solo** su:

- strategia cartella `public/`
- strategia di copia degli asset
- pipeline di build Vite
- footprint di copia Capacitor
- workflow di build locale iOS

senza modificare login, logout, IAP, BUZZ, BUZZ MAP, push, routing, DB, Supabase, Edge, i18n, UI, business logic, mission/reward/rank/streak.

**Condizione:** l’implementazione deve limitarsi a (a) disabilitare la copia integrale di `public/` in `dist/` e (b) copiare in `dist/` solo un **subset sicuro** di file (quelli effettivamente richiesti a runtime). Nessun cambio di URL nel codice, nessuno spostamento di asset su CDN senza adeguare il codice (che sarebbe fuori scope).

---

## 2. RISCHI ARCHITETTURALI

| Rischio | Gravità | Mitigazione |
|--------|---------|-------------|
| **Path dimenticati** — Un file richiesto a runtime non incluso nel subset → 404 in app. | Alta | Costruire la whitelist da analisi statica (grep) + SW/manifest/prebuild; test E2E su device dopo la riduzione. |
| **Service Worker** — SW precache e fetch dipendono da `/`, `index.html`, `manifest.json`, `favicon.ico`, `offline.html`; il fetch handler tratta come static asset tutto ciò che è sotto `/assets/` o ha certe estensioni. Nessun elenco esplicito in SW oltre al precache. | Media | Includere nel subset tutti i path che possono essere richiesti (inclusi `/assets/*` usati dal codice). |
| **Push / PWA** — `vapid-public.txt`, `_headers`, `sw.js` sono verificati da `scripts/push-guard.cjs` in prebuild e richiesti a runtime. | Alta | Includere sempre `sw.js`, `vapid-public.txt`, `_headers` e gli altri file controllati dal push-guard. |
| **Path incoerenti** — `EventsPage.tsx` usa `/public/lovable-uploads/...`. Nella build attuale il contenuto di `public/` è alla root di `dist/`, quindi `/public/lovable-uploads/` non esiste in produzione. | Media | Considerare un duplicato sotto `dist/public/lovable-uploads/` solo per i file usati da EventsPage, oppure trattare come bug preesistente da correzione separata (cambio URL in codice = fuori scope Phase 1). |
| **Asset caricati dinamicamente** — Config o API potrebbero restituire path verso `public/` non presenti nel codice sorgente. | Media | Audit di config (es. `prizeIntroConfig`, `hierarchyConfig`, `eventData`, ecc.) e inclusione di tutti i path referenziati nel subset. |
| **Plugin Vite** — Nessun plugin attuale filtra o riscrive la copia di `public/`. Introduzione di un plugin “copia selettiva” è un cambiamento solo build, non runtime. | Bassa | Plugin ben testato e whitelist mantenuta in un unico punto. |

---

## 3. COMPATIBILITÀ CON I PALETTI

La strategia **rispetta i paletti frozen**:

- **Nessun intervento su:** login, logout, cancellazione account, IAP, BUZZ, BUZZ MAP, notifiche push, routing, database, Supabase, Edge Functions, i18n, UI, componenti React, hooks, business logic, sistemi mission/reward/rank/streak/push, configurazioni di sicurezza.
- **Intervento solo su:** cosa viene copiato da `public/` a `dist/` e quindi da `dist/` a `ios/App/App/public/`. Il comportamento a runtime (URL richiesti, logica, funzionalità) resta identico; si riduce solo la quantità di dati copiati.

Il prebuild `scripts/push-guard.cjs` continua a leggere da `public/` (sw.js, _headers, vapid-public.txt, ecc.); non è necessario spostare o rinominare quei file, solo assicurarsi che il passo di “copia selettiva” li includa in `dist/`.

---

## 4. POSSIBILITÀ DI IMPLEMENTAZIONE SAFE

Sì. È possibile:

1. **Intervenire solo sulla pipeline di build**
   - In Vite: `build.copyPublicDir: false` (o equivalente) e nessuna copia integrale di `public/`.
   - Aggiungere un plugin (o uno script post-build) che copia da `public/` a `dist/` **solo** il subset definito (whitelist di file/cartelle).

2. **Non modificare il runtime**
   - Nessun cambio di URL nel codice.
   - Nessuno spostamento di asset su CDN senza adeguare il codice (quello sarebbe una fase successiva, con modifiche applicative).
   - Il subset copiato deve garantire che ogni path oggi referenziato in codice, SW, manifest e push resti servito come oggi.

3. **Capacitor**
   - `npx cap sync ios` continua a copiare l’intero `dist/` in `ios/App/App/public/`. Riducendo la dimensione di `dist/`, si riduce automaticamente il tempo e la dimensione della sync e del bundle iOS, senza toccare la logica dell’app.

---

## 5. STRATEGIA TECNICA PROPOSTA

### 5.1 Comportamento attuale

- **Vite:** `build.copyPublicDir` non impostato → default `true` → copia **integrale** di `public/` (~431 MB, 332 file) in `dist/` a ogni build.
- **Capacitor:** `webDir: 'dist'` → sync copia l’intero `dist/` (~463 MB) in `ios/App/App/public/`. Non è disponibile un’opzione “sync incrementale” sui file web.
- **Risultato:** I/O massivo (public → dist, dist → ios), bundle iOS pesante, build Xcode e install su device lente.

### 5.2 Classificazione degli asset in `public/`

**Necessari alla runtime / wrapper iOS (da includere nel subset):**

- **PWA / Push:** `sw.js`, `vapid-public.txt`, `_headers`, `manifest.json`, `manifest.webmanifest`, `favicon.ico`, `offline.html`, `icon-192.png` (usato dal SW per push), `icons/*` (manifest e UI).
- **Locale / static:** `locales/en.json`, `locales/it.json` (se usati da i18n a runtime).
- **Asset referenziati nel codice (path assoluti):**
  - `/assets/` — video, audio, prizes (auto-reali, 99premi, gioielli-reali, orologi-reali, borse-reali, altri), scratch, crew, crew-team, m1ssion-prize, m1ssion, marker-icon.png, italyRegions.geojson, mission-prize-*.jpg, prize-marker.png, placeholder, ecc.
  - `/video/gerarchia M1SSION/*` — hierarchyConfig.
  - `/prizes/prize-1.jpg` … `prize-10.jpg` — prizeIntroConfig.
  - `/lovable-uploads/*` — 54 path unici individuati in `src/` (PNG + SVG loghi).
  - `/events/*` — ferrari-488-gtb.jpg, lamborghini-huracan.jpg, porsche-911.jpg, ferrari-sf90.jpg, tesla-model-s.jpg (e altri se referenziati).
- **Altri:** `sounds/*`, `images/*`, `videos/m1-intro.mov`, `hdr/universe.hdr`, `.well-known/*`, `grid-pattern.png`, `og-m1ssion-banner.jpg`, `apple-touch-icon.png`, `appstore-button.png`, `googleplay-button.png`, `_redirects`, `robots.txt`, `sitemap.xml`, ecc. se referenziati o necessari al wrapper/PWA.

**Non necessari alla build locale / runtime (candidati all’esclusione):**

- Pagine e script di diagnostica/test: `push-diag.html`, `fcm-diagnostics.html`, `fcm-diagnostics.js`, `fcm-diag.html`, `fcm-test.html`, `test-push.html`, `push-test-direct.html`, `ios-check.html`, `diag.html`, `app-reset.html`, `qr-fallback.html`, `reset.html`, `push-health.html`, `push-health.txt`, `ios-token-debug.js`, `sw-test.js`, `sw-cleanup.js`, `test-map.html`, ecc.
- OneSignal workers se non usati in produzione: `OneSignalSDKWorker.js`, `OneSignalSDKUpdaterWorker.js`.
- File di utilità non richiesti a runtime: `asset-manifest.json`, `firebase-messaging-sw-real.js` (se non usato).
- **lovable-uploads:** la cartella è ~56 MB; in codice sono referenziati **54 path unici**. Si può copiare solo questi 54 file invece dell’intera cartella, con un risparmio stimato significativo (dipende da quanti file extra ci sono in `public/lovable-uploads/`).

**Nota:** `bundle-analysis.html` è generato in `dist/` dal plugin visualizer, non è in `public/`. Opzionalmente si può rimuovere da `dist/` prima di `cap sync` per ridurre le dimensioni della sync (ordine ~2 MB).

### 5.3 Riduzione della copia da `public/`

- **Vite:** impostare `build.copyPublicDir: false` (o equivalente) in modo che la cartella `public/` non venga più copiata per intero.
- **Plugin o script post-build:**
  - Copiare in `dist/` solo le cartelle/file nella whitelist (tutto ciò che è “necessario alla runtime” sopra).
  - Per `lovable-uploads`, copiare solo i 54 file referenziati (lista generabile con grep/script da `src/`), invece dell’intera directory.
  - Escludere esplicitamente i file di diagnostica/test e gli script OneSignal se non usati.
- **EventsPage:** usa `/public/lovable-uploads/...`. Senza modificare codice, per evitare 404 si può (a) copiare i file lovable-uploads anche in `dist/public/lovable-uploads/` (solo i 54 file), oppure (b) considerare la correzione del path come fix separato (cambio a `/lovable-uploads/`).

### 5.4 Riduzione della dimensione di `dist/`

- La dimensione di `dist/` è data da: output di Rollup (JS/CSS/asset importati) + copia da `public/`. Eliminando la copia integrale e usando il subset sicuro:
  - Si rimuovono ~431 MB di copia “tutto public” e si sostituiscono con la sola whitelist (ordine di grandezza: stessa struttura ma senza file diag/test e senza lovable-uploads non referenziati).
  - Risparmio principale atteso: dalla cartella `lovable-uploads` (copiare solo 54 file invece di tutta la directory).
  - Risparmio secondario: file di diagnostica/test (alcune centinaia di KB).
  - Opzionale: rimozione di `dist/bundle-analysis.html` prima della sync.

### 5.5 Riduzione della copia Capacitor

- **Comportamento:** `npx cap sync ios` copia l’intero `dist/` in `ios/App/App/public/`. Non è prevista un’opzione “sync parziale” sui file web.
- **Effetto:** Riducendo `dist/` (come sopra), si riduce automaticamente la quantità di dati copiati e la dimensione di `ios/App/App/public/`, senza cambiare il comportamento di Capacitor. Nessuna modifica a `capacitor.config.ts` strettamente necessaria per la riduzione; eventuali ottimizzazioni (es. escludere `bundle-analysis.html` da dist prima della sync) sono a livello di script/build, non di config runtime.

---

## 6. IMPATTO PREVISTO

| Fase | Impatto atteso |
|------|----------------|
| **npm run build** | Riduzione del tempo di copia disco (niente più copia di 431 MB; solo subset). Stima: **-1–3 min** sul totale, dipendente da disco e dimensione effettiva del subset. |
| **npx cap sync ios** | Meno dati da copiare (dist più piccolo). Stima: **-0,5–2 min** a seconda della riduzione ottenuta (es. ~50–100 MB in meno se si esclude la maggior parte di lovable-uploads e i file diag). |
| **Build Xcode** | Fase Resources e dimensione del bundle dipendono da `ios/App/App/public/`. Con `dist/` più piccolo, **-1–3+ min** possibili su Resources e su “Install on device”. |
| **Install su device** | Bundle più leggero → **installazione più veloce** (minuti in meno per copiare il bundle sul device). |

L’entità del miglioramento dipende da: (1) quanti file si escludono con sicurezza (lovable-uploads non referenziati + diag/test), (2) che la whitelist non ometta nessun path richiesto (per evitare 404).

---

## 7. VERDETTO

**GO** — Procedere con **FASE PERFORMANCE 1 — SAFE BUILD PIPELINE REDUCTION** è tecnicamente fattibile e compatibile con i paletti.

**Condizioni:**

1. **Scope:** Solo pipeline di build (strategia `public/`, copia asset, Vite, footprint Capacitor, workflow build locale iOS). Nessun intervento su logica applicativa, URL nel codice, CDN, o sistemi frozen.
2. **Implementazione:** `copyPublicDir: false` + plugin/script che copia in `dist/` solo il subset sicuro (whitelist derivata da analisi statica + SW/manifest/prebuild). Inclusione esplicita di tutti i path referenziati (inclusi i 54 lovable-uploads e `/events/` usati); gestione opzionale di `/public/lovable-uploads/` per EventsPage (duplicato in dist o fix path in fase successiva).
3. **Validazione:** Test funzionali e, ove possibile, E2E su device dopo la riduzione per verificare assenza di 404 (login, BUZZ, mappe, premi, video, push, PWA).
4. **Rischio principale da controllare:** Nessun path richiesto a runtime escluso dalla whitelist; mantenere la whitelist aggiornata quando si aggiungono nuovi asset in `public/` referenziati dal codice.

---

**Fine del report.** Analisi eseguita in **sola lettura**; nessuna modifica applicata.
