# Disaster Recovery / GitHub Sync Audit — M1SSION™ iOS Capacitor (READ-ONLY)

**Data:** 2026-03-05  
**Scope:** Verifica completa in sola lettura. Nessuna modifica, nessun commit, nessun push.  
**Obiettivo:** rispondere a “Se perdo il PC oggi, posso ricostruire l’app esattamente come la vedo ora?”

---

## 1. Stato Git locale (FASE 0)

### 1.1 Comandi eseguiti e risultati

| Comando | Risultato |
|---------|-----------|
| `git status --short` | **412 file modificati o eliminati** (M/D), **93 file untracked** (??). Working tree **non pulito**. |
| `git branch --show-current` | **fix/m1u-slotloop-anim** |
| `git log --oneline -n 10` | `aca569c00 feat(welcome-bonus): 500→150 M1U + i18n WelcomeBonusModal (en/it/fr)` ← HEAD; poi delete-account, bootstrap, profile, legal, ecc. |
| `git remote -v` | **origin** → `https://github.com/wikus77/lux-hunt-treasure.git` (fetch + push) |
| `git rev-parse HEAD` | **aca569c0089e90adcb76a008e375ca6812ef8349** |
| `git rev-parse --abbrev-ref --symbolic-full-name @{u}` | **fatal: no upstream configured for branch 'fix/m1u-slotloop-anim'** |
| `git status -sb` | `## fix/m1u-slotloop-anim` (nessun rapporto con remoto) |

### 1.2 Sintesi

- **Branch corrente:** `fix/m1u-slotloop-anim` (locale).
- **Upstream:** nessuno; il branch **non** traccia alcun branch remoto.
- **Commit locale attuale:** `aca569c00`.
- **Stato working tree:** 412 file con modifiche non committate, 0 in staging, 93 file untracked.

---

## 2. Confronto locale vs remoto (FASE 1)

### 2.1 Presenza del branch su GitHub

- **Branch remoto** `origin/fix/m1u-slotloop-anim` **non esiste** (non presente in `git branch -a` dopo fetch).
- **Commit HEAD** `aca569c00`: **nessun** branch remoto lo contiene (`git branch -r --contains aca569c00` è vuoto).
- **Conclusione:** l’intera storia del branch `fix/m1u-slotloop-anim` e il commit su cui sei ora **non sono su GitHub**.

### 2.2 Confronto con origin/main

- **Commit solo locali (non su origin/main):** `git rev-list --count origin/main..HEAD` = **2769**.
- **Commit solo su origin/main (non in HEAD):** `git rev-list --count HEAD..origin/main` = **2282**.
- Le storie sono **divergenti**: il tuo branch non è un semplice “avanti rispetto a main”, e main ha molti commit che tu non hai.

### 2.3 Classificazione file (A / B / C / D)

| Categoria | Descrizione | Situazione attuale |
|-----------|-------------|--------------------|
| **A) Committato localmente ma NON pushato** | Tutto il branch `fix/m1u-slotloop-anim` e i suoi commit (incluso `aca569c00`) | **Nessun push possibile** perché il branch non esiste su origin. L’ultimo commit è solo locale. |
| **B) Modificato localmente e NON committato** | File presenti nell’indice ma con diff rispetto all’ultimo commit | **412 file**: ~50 in `src/` (App.tsx, M1UPill, GlobalM1UCreditOverlay logic in altri file, FortuneWheel, DailyMission*, M1UShopContent, missions, hooks, iap, locales, ecc.) + molti in `android/`, `public/` (modelli agent eliminati), ecc. |
| **C) Untracked (non versionati)** | File mai aggiunti a Git | **93 file**: tra questi **GlobalM1UCreditOverlay.tsx**, **m1uCreditEvent.ts**, mission modals (CipherDrill, SignalPattern, WordDuel), serverReal daily mission, Supabase functions (claim-daily-phase, daily-mission-today, delete-account-v2, spin-wheel), **14 migrazioni Supabase** (admin_logs, auth_users, wheel, daily_mission_runs, ecc.), report e documenti. |
| **D) Presente su remoto GitHub** | Cosa c’è su origin | **origin/main** (e altri branch remoti). **NON** il branch `fix/m1u-slotloop-anim` né il commit `aca569c00`. |

### 2.4 File chiave “what you see now” non salvati su GitHub

- **Modificati (B) e non committati:**  
  `src/App.tsx`, `src/features/m1u/M1UPill.tsx`, `src/components/m1units/M1UShopContent.tsx`, `src/components/feedback/FortuneWheel.tsx`, `src/components/feedback/DailyMissionCard.tsx`, `src/components/feedback/DailyMissionContent.tsx`, `src/pages/AppHome.tsx`, e decine di altri in `src/` (hooks, missions, gamification, ecc.).
- **Untracked (C):**  
  `src/features/m1u/GlobalM1UCreditOverlay.tsx`, `src/features/m1u/m1uCreditEvent.ts`, mission UI/serverReal, Supabase functions e migrazioni elencate sopra.

Quindi: **l’app che vedi ora** (incluso M1U global slot engine, Strategia B, daily missions, wheel, shop, ecc.) **non** è ricostruibile solo da GitHub: sia il branch/commit corrente sia le modifiche in working tree e i file untracked non sono sul remoto.

---

## 3. Audit recuperabilità reale (FASE 2)

### 3.1 File .env

| File | Esiste | Versionato (git ls-files) | In .gitignore |
|------|--------|---------------------------|---------------|
| `.env` | Sì | **Sì** (tracked) | No |
| `.env.local` | Sì | No | **Sì** (`*.local`) |
| `.env.example` | Sì | **Sì** (tracked) | No |
| `.env.local.sample` / `.env.local.example` | Sì | Non verificato | — |

- **Per ricostruire l’app:** se `.env` è committato e pushato, da GitHub si ha uno schema/template; i valori sensibili potrebbero essere in `.env` (se pushati, rischio sicurezza) o in `.env.local` (non versionato). **Senza `.env` / `.env.local`** con le variabili giuste (Supabase URL/key, VAPID, ecc.) l’app non parte uguale. `.env.local` **non** è nel repo quindi va ripristinato a mano o da backup.

### 3.2 Config native iOS / Capacitor

- **capacitor.config.ts:** presente e versionato.
- **ios/:** la cartella è versionata (`.gitignore` ios ignora solo `App/build`, `App/Pods`, `App/output`, `App/App/public`, `DerivedData`, `xcuserdata`, `capacitor.config.json`, `config.xml`). Quindi progetto Xcode, entitlements, scheme, asset icon sono nel repo. **Modifiche locali non committate** in `ios/` (se presenti nel diff) non sarebbero su GitHub.
- **Signing / provisioning:** dipendono da Apple Developer Account e profili sul Mac; **non** sono in Git. Per “app identica” su dispositivo/App Store servono stesso team, bundle id, certificati e provisioning profile configurati su un altro Mac.

### 3.3 Supabase

- **supabase/functions:** molte function sono versionate; **untracked** risultano ad esempio: `claim-daily-phase`, `daily-mission-today`, `delete-account-v2`, `spin-wheel`. Se l’app usa queste, senza pusharle su GitHub (o backup) **non** sono recuperabili solo da clone.
- **supabase/migrations:** diverse migrazioni sono **untracked** (admin_logs, auth_users, wheel_spins, user_buzz_counter, daily_mission_runs, wheel_server_real, ecc.). Se sono già applicate sul progetto Supabase remoto ma non nel repo, il “codice DB” su GitHub è indietro; per riprodurre l’ambiente serve riapplicarle o averle in backup.

### 3.4 Asset / media

- **public/models/** (e analoghi): molti file `.glb` risultano **eliminati** nel working tree (D in status). Se quei delete non sono mai stati committati, su GitHub potrebbero esserci ancora; se li committi e pushi, su GitHub spariranno. Asset solo locali non versionati andrebbero salvati a parte per ricostruire “identico”.

### 3.5 iOS signing / Apple / provisioning

- **Ricostruire il codice:** possibile solo se codice e config sono su GitHub (oggi **no**, come sopra).
- **Compilare ed eseguire su iPhone:** serve Xcode, Apple Developer, certificati e provisioning sul nuovo Mac (non in Git).
- **Distribuire su App Store:** stesso account, app record, profili; nulla di questo è nel repo.

---

## 4. Audit “What you see now” (FASE 3)

1. **Modifiche locali non committate in file chiave:**  
   Sì. App.tsx, M1UPill, M1UShopContent, FortuneWheel, DailyMissionCard/Content, AppHome, e molti altri in `src/` hanno diff non committato. In più **GlobalM1UCreditOverlay.tsx** e **m1uCreditEvent.ts** sono **solo untracked**.
2. **Working tree sporco e build attuale:**  
   La build che vedi ora include **tutte** le modifiche in working tree e i file untracked. Quindi l’app attuale **non** corrisponde a nessun commit su GitHub (né al commit locale `aca569c00`, che non contiene le 412 modifiche e i 93 untracked).
3. **Cartella iOS:**  
   Parte della config iOS è versionata; eventuali modifiche locali in `ios/` non committate (es. signing, capability) non sarebbero su GitHub e andrebbero rifatte o recuperate da backup.

---

## 5. Risposta “Se perdi il PC?” (FASE 4)

### A) Recupero oggi — SI / NO / PARZIALE

**NO.**

In 5 righe: Il branch su cui lavori non è su GitHub; il commit attuale non è su nessun remoto; 412 file hanno modifiche non committate e 93 file (inclusi GlobalM1UCreditOverlay, m1uCreditEvent, Supabase functions e migrazioni) sono untracked. Da solo GitHub non permette di ricostruire né il codice né l’app come la vedi ora.

### B) Cosa mancherebbe

| Categoria | Cosa non è (ancora) al sicuro su GitHub |
|-----------|----------------------------------------|
| **Codice** | (1) L’intero branch `fix/m1u-slotloop-anim` e il commit `aca569c00`. (2) Le modifiche in 412 file (tra cui App, M1UPill, shop, wheel, daily missions, missions, hooks, iap, locales). (3) I 93 file untracked: GlobalM1UCreditOverlay, m1uCreditEvent, mission modals/serverReal, Supabase functions (claim-daily-phase, daily-mission-today, delete-account-v2, spin-wheel), 14 migrazioni Supabase. |
| **Env/config** | `.env.local` (ignorato) con eventuali override; eventuali segreti in `.env` se non si vogliono in repo. |
| **iOS native** | Eventuali modifiche locali in `ios/` non committate; signing/provisioning (fuori da Git). |
| **Backend** | Funzioni Supabase e migrazioni untracked; stato reale del progetto Supabase (migrazioni già applicate sul server ma non nel repo). |
| **Asset** | Modelli/asset eliminati localmente (D) o mai versionati; altri asset in `public/` o altrove solo locali. |

### C) Procedura disaster recovery (ricostruire su un altro Mac)

Procedura **ideale** una volta che tutto sia committato e pushato (vedi sezione 6). Oggi, **senza** aver prima messo al sicuro branch + working tree + untracked:

1. **Clone repo:**  
   `git clone https://github.com/wikus77/lux-hunt-treasure.git && cd lux-hunt-treasure`
2. **Branch/commit:**  
   Su GitHub **non** esiste `fix/m1u-slotloop-anim` né il commit `aca569c00`. Dovresti usare un branch/commit che esista su origin (es. `origin/main`) e **non** avresti l’app come la vedi ora.
3. **File/env:**  
   Copiare da backup `.env` e `.env.local` (e qualsiasi altro env usato in build).
4. **Supabase:**  
   Deploy delle function e applicazione migrazioni dal repo (o da backup) al progetto Supabase; verificare che le function untracked (claim-daily-phase, daily-mission-today, delete-account-v2, spin-wheel) e le migrazioni untracked siano disponibili e applicate.
5. **Progetto iOS:**  
   Aprire `ios/App/App.xcworkspace` in Xcode; configurare team, signing, provisioning; `npm run build && npx cap sync ios`; Run su dispositivo.
6. **Build/run:**  
   `npm install`, `npm run build`, `npx cap sync ios`, poi build da Xcode su iPhone.

Senza backup del branch corrente, delle modifiche non committate e dei file untracked, questa procedura **non** restituisce l’app attuale.

---

## 6. Piano per mettere tutto al sicuro (solo descrizione, nessuna modifica)

1. **Backup one-off (prima di qualsiasi push):**  
   Copia dell’intera cartella progetto (o almeno `src/`, `supabase/`, `ios/` senza `Pods`/build), inclusi file untracked e modifiche correnti, su disco esterno o cloud. Salvare anche `.env.local` e nota su quali variabili servono.

2. **Committare le modifiche locali:**  
   Aggiungere tutti i file necessari (`git add` per i file untracked che fanno parte dell’app: GlobalM1UCreditOverlay, m1uCreditEvent, mission UI/serverReal, Supabase functions e migrazioni, ecc.) e fare commit delle 412 modifiche + nuovi file in uno o più commit descrittivi sul branch `fix/m1u-slotloop-anim`.

3. **Push del branch su GitHub:**  
   Creare il branch sul remoto e pushare:  
   `git push -u origin fix/m1u-slotloop-anim`  
   (eventualmente dopo aver risolto divergenze con `origin/main` se si vuole integrare/maintainare la storia).

4. **Env e segreti:**  
   Tenere `.env.local` fuori da Git; documentare in un README o in un doc interno (non committato in chiaro) quali variabili servono e dove prenderle (es. Supabase dashboard, VAPID, ecc.) per il setup su un nuovo Mac.

5. **Supabase:**  
   Assicurarsi che tutte le function e migrazioni usate in produzione/staging siano nel repo (aggiunte e committate) e deployate; così da poter rifare deploy e migrazioni da zero da un clone.

6. **Tag di release / backup periodico:**  
   Dopo il push, creare un tag (es. `backup/YYYYMMDD-app-state`) per avere un punto di recupero noto su GitHub.

7. **iOS:**  
   Verificare che non ci siano modifiche importanti in `ios/` solo locali; se ci sono, committarle. Signing e provisioning restano da configurare su ogni Mac (Apple Developer, Xcode).

---

## 7. Riepilogo numerico

| Voce | Valore |
|------|--------|
| File modificati (working tree) | 412 |
| File in staging | 0 |
| File untracked | 93 |
| Branch corrente | fix/m1u-slotloop-anim (solo locale) |
| Commit HEAD | aca569c00 (non su nessun remoto) |
| Commit “avanti” rispetto a origin/main | 2769 (storia divergente) |
| File .env tracked | .env, .env.example |
| File .env ignorati | .env.local (*.local) |

---

**Fine audit. Nessuna modifica, commit o push eseguiti.**
