# Disaster Recovery — FASE 6: Audit finale residui locali post-push — Report

**Data/ora:** 2026-03-06  
**Scope:** SOLO lettura. Nessun commit, push o modifica. Classificazione residui dopo push del branch `fix/m1u-slotloop-anim`.

---

## 1. Stato Git finale residui

### 1.1 Sintesi

| Voce | Valore |
|------|--------|
| **Righe `git status --short`** | 367 |
| **File modificati/eliminati (tracked)** | 362 (`git diff --name-only`) |
| **File untracked** | 5 (`git ls-files --others --exclude-standard`) |

### 1.2 Dettaglio tracked (modificati / eliminati)

- **Eliminazioni (D) — .glb:** ~356 file  
  - `android/app/src/main/assets/public/models/agent/...` (agent, armor, dress, pants, premium, shirt, special)  
  - `public/models/agent/...` (stessa struttura)  
  - Sono file 3D già tracciati in Git e ora presenti come "deleted" nel working tree (rimossi da disco o spostati).

- **Modificati (M) — non .glb:** 6 file  
  - `android/app/src/main/assets/public/bundle-analysis.html`  
  - `android/app/src/main/assets/public/index.html`  
  - `ios/App/App/public/bundle-analysis.html`  
  - `ios/App/App/public/index.html`  
  - `package.json`  
  - `src/pages/test/LotteryTest.tsx`  

### 1.3 Untracked

- `reports/DISASTER_RECOVERY_PHASE4_STEP6_EXECUTION.md`  
- `reports/DISASTER_RECOVERY_PHASE5_PUSH_REPORT.md`  
- `scripts/check-cap-assets.js`  
- `scripts/glb-audit.cjs`  
- `scripts/glb-audit.js`  

---

## 2. Classificazione A / B / C dei residui

### A) Residui critici da salvare ancora

**Nessuno** in senso stretto.

- Il codice necessario al funzionamento dell’app (sorgenti, Supabase, core auth, gamification, docs già committati) è già su GitHub nei 6 commit safety.
- Nessuno di questi residui è indispensabile per build o runtime dell’app iOS.
- **Rischio:** nullo per “app che compila e gira”.  
- **Raccomandazione:** nessun file residuo è obbligatorio per il recovery; si può considerare un eventuale commit “pulizia finale” solo per comodità e tracciabilità.

### B) Residui utili ma non critici

| Path / gruppo | Motivo | Rischio se non committato | Raccomandazione |
|---------------|--------|----------------------------|------------------|
| **package.json** | Aggiunge 3 script: `cap:sync:ios`, `cap:sync`, `cap:check-assets`. Utili per workflow Capacitor/build. | Basso: gli script si possono re-inserire a mano. | Committare in un eventuale “chore: npm scripts + report finali” se si vogliono script allineati su GitHub. |
| **reports/DISASTER_RECOVERY_PHASE4_STEP6_EXECUTION.md** | Documenta esecuzione STEP 6 (docs and reports). | Nullo: già in backup locale; storico. | Includere in un mini-commit “report finali” oppure lasciare solo in backup. |
| **reports/DISASTER_RECOVERY_PHASE5_PUSH_REPORT.md** | Documenta FASE 5 (push, tag, esito). | Nullo: già in backup. | Come sopra. |
| **scripts/check-cap-assets.js**, **glb-audit.cjs**, **glb-audit.js** | Script di utilità/audit per asset e .glb. | Basso: non impattano build o runtime. | Committare se il team li usa; altrimenti lasciare in backup. |
| **src/pages/test/LotteryTest.tsx** | Pagina di test lotteria (M1SSION); sotto `pages/test/`. | Basso: non usata in produzione. | Committare se si vuole tenere il test su Git; altrimenti solo backup. |

### C) Residui probabilmente ignorabili / lasciabili fuori

| Path / gruppo | Motivo | Rischio se non committato | Raccomandazione |
|---------------|--------|----------------------------|------------------|
| **Eliminazioni massive .glb** (android/ e public/) | Centinaia di file “deleted”: o cleanup voluto o rimozione accidentale. Stato intenzionale non verificato in questo audit. | Medio solo se le eliminazioni non erano volute (perdita asset 3D). | **Non** committare finché non si decide se le D sono volute. Se volute: commit “chore: remove unused .glb assets”. Se non volute: ripristinare da backup. Audit separato consigliato. |
| **bundle-analysis.html**, **index.html** (android/.../public, ios/.../public) | Tipicamente output di build (es. Vite) copiati in asset Capacitor. | Nullo: ricostruibili con build. | Non committare; sono artefatti. Eventualmente aggiungere a .gitignore se danno fastidio. |
| **File Android** (tutto il sottoalbero android/ in diff) | Per focus iOS (Capacitor WKWebView) le modifiche Android sono secondarie. | Basso per recovery iOS. | Lasciabili fuori o gestiti in un commit dedicato “android asset cleanup” dopo verifica. |

---

## 3. Analisi mirata sui punti dubbi

### 3.1 package.json

- **Modifica:** +3 script: `cap:sync:ios`, `cap:sync`, `cap:check-assets` (riferimento a `scripts/check-cap-assets.js`).
- **Criticità:** **bassa**. Non influisce su dipendenze o build minimale; solo su comodità d’uso.
- **Se non si salva:** si perdono i 3 script; si possono re-aggiungere in un minuto.
- **Classificazione:** **B – utile**. Priorità: media. In un eventuale ultimo commit “pulizia” ha senso includerlo.

### 3.2 src/pages/test/LotteryTest.tsx

- **Contenuto:** pagina di test per la lotteria 30 giorni (M1SSION), con uso di Supabase, auth, M1U, toast.
- **Impatto progetto reale:** **nessuno** in produzione; è sotto `pages/test/`.
- **Salvarlo o no:** **opzionale**. Conviene salvarlo se la pagina test è usata per sviluppo/debug e si vuole averla su GitHub; altrimenti basta il backup locale.

### 3.3 Eliminazioni massive .glb

- **Cosa sono:** ~356 file tracciati che risultano eliminati (D) in `android/.../public/models/agent/` e `public/models/agent/`.
- **Interpretazione possibile:** (1) cleanup voluto di asset 3D non usati, (2) rimozione accidentale, (3) stato intermedio da verificare.
- **Rischio:** **medio** se le eliminazioni non erano volute (perdita asset); **nullo** se erano volute e l’app non dipende da quei .glb.
- **Raccomandazione:** **non committare** le D in questo audit. Decidere in un passo separato: se cleanup voluto → commit “remove unused .glb”; se no → ripristino da backup. Audit separato consigliato prima di qualsiasi commit sulle .glb.

### 3.4 bundle-analysis.html / index.html (android/ios public)

- **Natura:** quasi certamente artefatti di build (es. `vite build` + copia in `public` per Capacitor).
- **Importanza:** **nessuna** per il codice sorgente; ricostruibili con `npm run build` e `cap sync`.
- **Classificazione:** **C – ignorabili**. Non committare; eventualmente ignorarli in Git.

### 3.5 Script audit (check-cap-assets.js, glb-audit.cjs, glb-audit.js)

- **Utilità:** audit/controllo asset e file .glb; richiamati da script npm se presenti (es. `cap:check-assets`).
- **Tenere o no:** **opzionale**. Utili se il team li usa; altrimenti rumore.
- **Priorità:** **bassa**. In un commit “script e report finali” si possono includere; altrimenti solo backup.

### 3.6 I due report finali untracked (STEP6, PHASE5)

- **Contenuto:** documentazione esecuzione FASE 4 STEP 6 e FASE 5 (push).
- **Valore su Git:** **medio** (storico disaster recovery).
- **Raccomandazione:** **vale la pena** aggiungerli in un mini-commit “docs: disaster recovery phase 4–5 report” per avere lo storico completo su GitHub; in alternativa restano solo in backup.

---

## 4. Stato disaster recovery: livello di sicurezza attuale

### Verdetto: **B) ABBASTANZA SICURO**

- **Motivazione (max 10 righe):**  
  Il cuore dell’app (sorgenti, M1U, daily missions, Supabase, auth, i18n, hooks, gamification, docs/report già committati) è su GitHub e nel backup locale. In caso di perdita del PC, da GitHub si può clonare il repo, fare checkout del branch `fix/m1u-slotloop-anim`, e ottenere tutto il codice critico. I residui sono: (1) eliminazioni .glb da interpretare (cleanup vs. errore), (2) artefatti di build, (3) 3 script npm e 2 report finali, (4) una pagina test. Nessuno di questi è indispensabile per “ricostruire l’app che funziona”. Restano fuori da Git: .env.local, signing iOS, eventuali secret (già noti e in backup). Quindi **siamo abbastanza coperti**; il rischio residuo è basso e riguarda solo comodità, asset 3D e documentazione finale.

- **Se il PC morisse oggi:**  
  Recupero da GitHub: **sì** per tutto il codice applicativo e la documentazione già pushati. Si perderebbero: le modifiche locali a package.json (3 script), la pagina test LotteryTest, i 2 report finali (se non committati), lo stato “deleted” dei .glb (e gli script audit se non committati). Gravità: **bassa** per il funzionamento dell’app; **media** solo se le eliminazioni .glb non erano volute (asset da ripristinare da backup).

---

## 5. Azioni minime finali consigliate

### 5.1 Serve ancora 1 commit finale?

- **Non obbligatorio** per la sicurezza del disaster recovery: il codice critico è già su GitHub.
- **Consigliato** solo se si vogliono su Git: (a) allineamento script (package.json + eventuali script audit), (b) report finali STEP6 e PHASE5, (c) eventuale pagina test LotteryTest. Un solo commit “chore/docs” è sufficiente.

### 5.2 Possiamo fermarci qui?

- **Sì.** Dal punto di vista “recuperabilità da GitHub” si può considerare chiuso il ciclo: il branch remoto contiene i 6 commit safety e il progetto è sufficientemente protetto.

### 5.3 Cosa mettere in un eventuale ultimo mini-commit?

- **Inclusione suggerita (opzionale):**  
  - `package.json` (script cap:sync e cap:check-assets)  
  - `reports/DISASTER_RECOVERY_PHASE4_STEP6_EXECUTION.md`  
  - `reports/DISASTER_RECOVERY_PHASE5_PUSH_REPORT.md`  
  - (opzionale) `reports/DISASTER_RECOVERY_PHASE6_FINAL_RESIDUAL_AUDIT.md`  
  - (opzionale) `scripts/check-cap-assets.js`, `scripts/glb-audit.cjs`, `scripts/glb-audit.js`  
  - (opzionale) `src/pages/test/LotteryTest.tsx`  
- **Messaggio esempio:** `chore(docs): disaster recovery final reports + npm scripts`

### 5.4 Cosa lasciare solo nel backup locale?

- Eliminazioni .glb (stato “D”) finché non si decide se sono volute.
- `bundle-analysis.html` e `index.html` in android/ios public (artefatti build).
- Eventuali file locali non tracciati (secret, signing, .env.local) già esclusi da Git per policy.

### 5.5 Cosa non toccare proprio?

- Nessun force push, rebase o riscrittura della storia dei 6 commit.
- Nessun commit delle eliminazioni .glb senza aver stabilito se sono volute.
- Nessun commit di `.env` / `.env.local` / segreti / certificati.

---

## 6. Risposta finale

- **Siamo coperti abbastanza?** **Sì.** Il progetto può essere considerato sufficientemente protetto: da GitHub si può ricostruire il codice critico; il backup locale copre il resto e gli eventuali asset/secret.
- **Serve ancora X?** **Opzionale.** Un ultimo commit “chore/docs: report finali + script” migliora allineamento e storico ma **non** è necessario per il disaster recovery. L’unica azione da pianificare a parte è la **decisione sulle .glb** (cleanup voluto → commit delle D; non voluto → ripristino da backup).

---

**Fine report FASE 6. Audit in sola lettura; nessuna modifica eseguita.**
