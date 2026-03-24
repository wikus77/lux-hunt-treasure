# Verifica forense — Build e Cap Sync lenti (sola lettura)

**Project:** M1SSION™ — iOS wrapped app (Capacitor)  
**Data:** 2026-03-14  
**Scope:** Cause dei tempi lunghi di build (~5–6 min), sync Capacitor e terminale lento. **Solo lettura, nessuna modifica.**  

---

## 1. COSA SUCCEDE

### Flusso attuale

1. **`npm run build`**
   - npm esegue prima **prebuild** (lifecycle): `node scripts/push-guard.cjs`.
   - Poi esegue **vite build** (Rollup + copia di `public/` in `dist/`).
   - Risultato: **dist/** ~486 MB, **452 file**.

2. **`npx cap sync ios`**
   - Copia l’intero **dist/** in **ios/App/App/public/**.
   - Destinazione attuale: **~524 MB** (stesso ordine di grandezza di dist).

3. **Terminale lento**
   - Sintomo segnalato: il terminale sul Mac è lento in generale (non solo durante build/sync).

---

## 2. PERCHÉ CI VUOLE COSÌ TANTO TEMPO

### A) Causa principale: dimensione di `public/` e sue copie

| Percorso            | Dimensione | Note |
|---------------------|------------|------|
| **public/**         | **431 MB** | Copiato per intero in `dist/` da Vite a ogni build. |
| **public/assets**   | 306 MB     | prizes ~144 MB, video ~105 MB, altri asset. |
| **public/video**    | 39 MB      | Gerarchia M1SSION, ecc. |
| **public/lovable-uploads** | 56 MB | Immagini upload. |
| **dist/** (dopo build) | ~486 MB | Output Vite (~55 MB) + copia di public (431 MB). |
| **ios/App/App/public/** | ~524 MB | Copia di dist via `cap sync ios`. |

- **Build:** Vite, per impostazione predefinita, copia **tutto** `public/` in `dist/`. Quindi a ogni build avviene una copia di **431 MB** (migliaia di file: video, immagini, asset).
- **Cap sync:** Copia l’intero **dist/** (~486 MB) in `ios/App/App/public/`. Quindi una seconda copia di massa (stesso ordine di grandezza).
- **Conclusione:** Il tempo è dominato dall’I/O disco per copiare **centinaia di MB** due volte (build + sync). Su HDD o con antivirus/Spotlight attivi, 5–6 minuti sono coerenti.

### B) Build Vite (dopo la copia di public)

- **~1868** file sorgente (`.ts`/`.tsx`/`.js`/`.jsx`) in `src/`.
- **Molte dipendenze pesanti:** three, @react-three/fiber/drei, maplibre-gl, leaflet, stripe, supabase, framer-motion, firebase, ecc.
- **Vite config:** `minify: false` (niente minificazione → meno CPU ma output più grande e più I/O in scrittura). `reportCompressedSize: false` (già ok per non perdere tempo in gzip/brotli).
- **Plugin:** In production viene usato `rollup-plugin-visualizer` che genera `dist/bundle-analysis.html` (~2 MB) → costo aggiuntivo piccolo ma presente.
- **Rollup:** Deve risolvere, trasformare e fare il bundle di migliaia di moduli. Con quella codebase e quelle dipendenze, 2–4 minuti di sola parte “bundle” sono plausibili.
- La parte più costosa in tempo resta comunque la **copia di 431 MB** da public a dist (e in misura minore la scrittura di un grosso `dist/`).

### C) Prebuild (push-guard.cjs)

- Eseguito **prima di ogni build** (script `prebuild` nel `package.json`).
- Legge file in `public/` (sw.js, _headers, vapid-public.txt, ecc.).
- **Scansiona ricorsivamente `src/`:** apre e legge **1868 file** `.ts`/`.tsx`/`.js`/`.jsx` e applica regex per pattern vietati (secret, VAPID, ecc.).
- Tutto in **sincrono** (`readFileSync`, `readdirSync`). Su disco lento o con molti file, può aggiungere **5–15+ secondi** a ogni build.

### D) Capacitor sync

- **`npx cap sync ios`** (da documentazione Capacitor):
  - Copia `dist/` → `ios/App/App/public/`.
  - Aggiorna `capacitor.config.json` nel progetto iOS.
  - Aggiorna plugin iOS.
- Con **dist/** da ~486 MB, la copia è l’operazione dominante. Nessuna evidenza di “sync incrementale” sui file: viene copiato l’intero albero. Quindi: **~486 MB scritti su disco** a ogni sync.

### E) Terminale lento (possibili cause, da verificare sul tuo Mac)

- **Shell startup:** `.zshrc` / `.zprofile` che eseguono comandi pesanti a ogni avvio (nvm/fnm, conda, script, `git status` in repo grandi, ecc.).
- **Directory di lavoro:** Aprire il terminale nella root del progetto significa avere **node_modules** (904 MB, migliaia di file) e possibilmente **dist/** nella cwd → completamento tab e prompt che leggono molti file.
- **Antivirus / Spotlight:** Scansione o indicizzazione di `node_modules`/`dist`/`public` durante build o anche solo entrando nella cartella.
- **Disco:** Se il Mac usa HDD o un volume di rete, I/O di centinaia di MB diventa molto lento.
- **Node/pnpm:** `npx` la prima volta scarica/cache; `pnpm` (packageManager in package.json) può essere lento su prima install o con molti link.

---

## 3. CLASSIFICAZIONE DELLE CAUSE (IMPATTO)

| Priorità   | Causa                          | Impatto stimato        | Tipo        |
|------------|--------------------------------|------------------------|-------------|
| **Alta**   | **public/ 431 MB** copiata in dist a ogni build | 1–3+ min (I/O)         | Build       |
| **Alta**   | **dist/ ~486 MB** copiata in ios a ogni cap sync | 1–3+ min (I/O)         | Cap sync    |
| **Media**  | Bundle Vite (1868 file + deps pesanti) | 2–4 min (CPU + I/O)    | Build       |
| **Media**  | Prebuild: scan 1868 file in src | 5–15 s                 | Build       |
| **Bassa**  | Visualizer + scrittura bundle-analysis | Secondi                 | Build       |
| **Variabile** | Terminale (shell, cwd, antivirus, disco) | Difficile quantificare | Ambiente    |

---

## 4. COME RISOLVERE I PROBLEMI (RACCOMANDAZIONI, SENZA MODIFICHE IN QUESTA FASE)

### 4.1 Ridurre il tempo di build

- **Ridurre o non copiare tutto `public/` in dist**
  - **Opzione 1:** Spostare i contenuti molto pesanti (video, asset premi, lovable-uploads grandi) su CDN e referenziarli via URL. Tenere in `public/` solo ciò che serve davvero in build (es. sw.js, vapid-public.txt, _headers, poche immagini critiche). Così la copia Vite diventa molto più piccola (es. pochi MB invece di 431).
  - **Opzione 2:** In `vite.config.ts` usare `build.copyPublicDir: false` e un plugin o script che copia **solo** le sottocartelle/file necessari per l’app (es. `public/sw.js`, `public/vapid-public.txt`, `public/_headers`, eventuali icone). **Non** copiare `public/assets/prizes`, `public/video`, `public/lovable-uploads` se non servono in build o possono essere serviti da CDN.
  - **Opzione 3:** Tenere due “public” concettuali: uno “slim” per build (e per Capacitor) e uno “full” solo per deploy hosting; il build usa solo quello slim.
- **Prebuild**
  - Valutare di eseguire il push-guard solo in CI (es. non definire `prebuild` e chiamare `node scripts/push-guard.cjs` solo nel pipeline) oppure rendere lo scan **incrementale** (solo file modificati) o **parallelo** (worker) per ridurre il tempo sul Mac.
- **Vite**
  - Abilitare di nuovo **minify** (es. `minify: 'esbuild'`) se il problema MapLibre worker è risolto: output più piccolo = meno I/O in scrittura e in cap sync.
  - Valutare di disabilitare il **visualizer** in build “locali” (solo in CI o con una variabile d’ambiente) se non ti serve ogni volta.

### 4.2 Ridurre il tempo di Cap sync

- **Ridurre la dimensione di dist** (vedi sopra) è la leva principale: meno dist → meno da copiare in `ios/App/App/public/`.
- Verificare se la tua versione di **Capacitor** supporta opzioni di sync “incrementale” o “mirror” che evitino di riscrivere file identici (documentazione o issue su GitHub Capacitor). Se sì, abilitarle.
- Eseguire **solo** `npx cap sync ios` quando hai effettivamente cambiato qualcosa nel web (build). Se non hai fatto build, evitare di rilanciare sync “a vuoto”.

### 4.3 Terminale lento

- **Profilo shell:** Controllare `~/.zshrc` e `~/.zprofile`: commentare temporaneamente comandi pesanti (nvm/fnm, conda, script che girano a ogni avvio). Se il terminale diventa rapido, il colpevole è lì.
- **Prompt / git:** Se il prompt fa `git status` in repo grandi (es. repo con node_modules tracciati o repo enorme), considerare prompt “lazy” o disabilitare git nel prompt per questa cwd.
- **Antivirus:** Escludere dalla scansione in tempo reale la cartella del progetto (o almeno `node_modules`, `dist`, `public`) se possibile.
- **Disco:** Preferire SSD; evitare di lavorare da volume di rete.
- **Cwd:** Aprire il terminale in una sottocartella “leggera” (es. senza `node_modules` nella cwd) e lanciare i comandi con path assoluti o da lì, per vedere se tab completion e prompt migliorano.

---

## 5. RIEPILOGO

- **Cosa succede:** A ogni build vengono copiati **431 MB** (public → dist) e il bundle Vite viene scritto; a ogni cap sync vengono copiati **~486 MB** (dist → ios). Il prebuild legge **1868** file in src. Il terminale può essere rallentato da shell, cwd, antivirus, disco.
- **Perché:** `public/` è molto grande (video, premi, upload); Vite copia tutto per default; Capacitor copia tutto dist; nessuna riduzione selettiva o CDN sugli asset pesanti.
- **Come risolvere:** (1) Ridurre drasticamente ciò che va in `public/` (o ciò che Vite copia in dist) spostando asset su CDN e/o copiando solo il necessario. (2) Opzionale: prebuild solo in CI o ottimizzato; minify riattivato se possibile; visualizer solo quando serve. (3) Cap sync beneficia automaticamente da un dist più piccolo. (4) Terminale: alleggerire shell, cwd, antivirus, disco.

Nessuna modifica è stata applicata in questa fase; il report è in sola lettura. Per applicare le modifiche si può procedere in un secondo momento, partendo dalla riduzione/copia selettiva di `public/` e dalla configurazione Vite.
