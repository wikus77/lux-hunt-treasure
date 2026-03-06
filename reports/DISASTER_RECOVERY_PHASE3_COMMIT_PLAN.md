# Disaster Recovery — FASE 3: Piano commit puliti e ordine di salvataggio — Report

**Data/ora:** 2026-03-06  
**Branch:** `fix/m1u-slotloop-anim`  
**Commit HEAD:** `aca569c00`  
**Scope:** SOLO lettura; nessun commit, push o modifica. Piano decisionale only.

---

## 1. Situazione attuale sintetica

- **Backup FASE 1:** eseguito; cartella + archivio in `/Users/josephmule/BACKUPS_M1SSION/`.
- **Inventario FASE 2:** ~412 file modificati (tracked), 93 untracked; P0/P1 identificati (M1U slot engine, daily missions, Supabase functions/migrations, App/Home/shop/wheel, auth, i18n, hooks).
- **Git:** branch locale non su GitHub; 0 staged; working tree sporco.
- **Rischio:** perdita PC o disco = perdita tutto ciò che non è committato e pushato.

Obiettivi del piano:
1. **Non perdere nulla** (massima sicurezza dati).
2. **Non fare caos irreversibile** (storia Git comprensibile e revertibile per area).
3. **Potere pushare in sicurezza** (commit ordinati, nessun segreto, nessun file inutile).
4. **Rispettare i paletti** (no modifiche a IAP/BUZZ/login/delete-account/push/subscriptions; solo salvataggio stato esistente).

---

## 2. Confronto strategie A / B / C

### Strategia A — One big safety commit

- **Descrizione:** Un solo commit che include tutto il blocco P0 + P1 (sorgente app, Supabase, report utili). Escludi solo asset dubbi e eliminazioni massive .glb.
- **Pro:** Operazione unica; tutto il lavoro salvato in un colpo; nessun rischio di “dimenticare” un gruppo; rollback unico se serve annullare tutto.
- **Contro:** Diff enorme (centinaia di file); difficile da revieware; su GitHub un solo commit gigante; revert “solo M1U” o “solo daily missions” non possibile senza interventi manuali.
- **Rischio:** Basso per perdita dati; medio per manutenibilità storia e code review.
- **Velocità:** Massima (un solo `git add` + `git commit`).
- **Sicurezza (non perdere):** Alta.
- **Consigliabilità nel caso M1SSION™:** Buona se l’unico obiettivo è “salvare tutto subito”. Sconsigliata se vuoi storia leggibile e rollback per area.

---

### Strategia B — Commit tematici ordinati

- **Descrizione:** 5–7 commit in sequenza: (1) M1U/slot/shop/App/Home, (2) Daily missions app + serverReal + modals, (3) Supabase functions + migrations, (4) Core auth/i18n/hooks/main, (5) Gamification/wheel/rewards/resto UI, (6) Docs/reports, (7) eventuale asset/android/public (se e come deciso).
- **Pro:** Storia chiara; revert per area (es. “togli solo daily missions”); review per tema; allineata alle aree dell’inventario FASE 2.
- **Contro:** Più passi; bisogna rispettare l’ordine (dipendenze logiche); rischio di dimenticare file in un gruppo se la checklist non è seguita.
- **Rischio:** Basso per perdita dati se si esegue tutto in una sessione senza interruzioni; basso per caos su GitHub.
- **Velocità:** Media (più add/commit, stessa quantità di file).
- **Sicurezza (non perdere):** Alta se tutti i commit vengono fatti in sequenza fino a working tree pulito.
- **Consigliabilità nel caso M1SSION™:** **Consigliata.** Bilancia “non perdere nulla” (tutto committato in una sessione) e “non fare casino” (commit leggibili e revertibili).

---

### Strategia C — Snapshot safety + rifinitura dopo

- **Descrizione:** Primo commit “snapshot safety” ultra-conservativo con tutto il P0 (e opzionalmente P1); poi eventuali commit di rifinitura (split, pulizia, doc).
- **Pro:** Primo commit = “tutto il critico è già salvato”; psicologicamente sicuro; eventuali split successivi sono opzionali.
- **Contro:** Il primo commit è comunque molto grande; gli “split dopo” richiedono interventi più avanzati (rebase -i, o nuovi commit che “spostano” codice) e non sono banali.
- **Rischio:** Basso per perdita dati; medio per complessità se si vuole davvero rifinire dopo.
- **Velocità:** Alta per il primo step; variabile per la rifinitura.
- **Sicurezza (non perdere):** Molto alta al primo commit.
- **Consigliabilità nel caso M1SSION™:** Buona se vuoi “primo commit = tutto il salvabile” e non ti interessa subito una storia tematica. Meno adatta se vuoi da subito commit tematici senza rebase.

---

## 3. Strategia raccomandata

**Raccomandazione: Strategia B — Commit tematici ordinati.**

Motivazione:
- **Obiettivo 1 (non perdere nulla):** Si soddisfa eseguendo tutti i commit in una sola sessione, in ordine, fino a working tree pulito. Nessun file P0/P1 resta fuori.
- **Obiettivo 2 (non fare casino):** La storia resta leggibile; ogni commit ha un messaggio e un’area chiari; revert per area è possibile.
- **Obiettivo 3 (pushare in sicurezza):** Una volta pushato, GitHub avrà una storia comprensibile; nessun “one big blob” da cui è difficile tornare indietro.
- **Obiettivo 4 (paletti):** Nessun commit modifica logica IAP/BUZZ/login/delete-account/push/subscriptions; si salva solo lo stato attuale del codice.

Strategia C è valida se preferisci “primo commit = tutto”; B è preferibile per manutenibilità e allineamento con l’inventario FASE 2.

---

## 4. Piano commit ordinato (proposta concreta)

| Ordine | Nome commit proposto | Area | File/gruppi inclusi | Priorità | Rischio |
|--------|----------------------|------|---------------------|----------|--------|
| 1 | `chore(safety): M1U global slot engine + App/Home/shop/pill` | M1U / pill / slot / overlay / shop UI | GlobalM1UCreditOverlay.tsx, m1uCreditEvent.ts, App.tsx, AppHome.tsx, M1UPill.tsx, M1UShopContent.tsx, FortuneWheel.tsx | P0 | Basso |
| 2 | `chore(safety): daily missions app + serverReal + modals` | Daily missions client + serverReal | serverReal/ (claimDailyPhase, dailyMissionToday), useMissionOfTheDay.ts, CipherDrillModal, SignalPatternNumbersModal, WordDuelMemoryModal, DailyMissionCard, DailyMissionContent, MicroMissionsCard, missionsRegistry, NextActionContainer/Content, MissionActionsModal, MissionBriefingModal, MissionCompletionModal, MissionPill, Phase2ResumeModal | P0/P1 | Basso |
| 3 | `chore(safety): Supabase functions + migrations` | Backend Supabase | claim-daily-phase/, daily-mission-today/, delete-account-v2/, spin-wheel/; tutte le 14 migrazioni 20260227–20260304 | P0 | Basso (solo schema/code, no dati) |
| 4 | `chore(safety): core auth/main/i18n/hooks/iap` | App root / auth / main / i18n / IAP integration | main.tsx, AuthProvider.tsx, auth/types.ts, iapService.ts, useM1UnitsRealtime, useWelcomeBonus, authSingleFlight.ts; locales en/fr/it common.json; use-auth-session-manager, useActiveMissionEnrollment, useBuzzGrants, useBuzzMapPricingNew, useHierarchyRank, usePWAStabilizer, useProfileRealtime | P0/P1 | Basso |
| 5 | `chore(safety): gamification/rewards/agent/UI restante` | Gamification / rewards / agent / altre UI | StreakModal, StreakWidget, ReferralCard, WeeklyChallenges, CashbackVaultPill, ReferralCodeDisplay; ClueMilestoneModal, ClueMilestoneWatcher; LotteryContent, ScratchWinModal; AgentLabModal, AgentUnlockModal; AgentDiaryContent, PrizeVision; sonner; useAgentEnergy, useAwardPE; delete-account/index.ts (modificato) | P1 | Basso |
| 6 | `chore(safety): docs and reports` | Report / documentazione | reports/*.md, docs/*.md, root *AUDIT*.md, *FORENSICS*.md, *PLAN.md (inclusi DISASTER_RECOVERY_*, M1U_*, ecc.) | P2 | Nullo |

**Perché i gruppi stanno insieme / non vanno mescolati:**
- **Commit 1:** M1U e slot engine dipendono da GlobalM1UCreditOverlay + m1uCreditEvent (untracked); App/Home/shop/wheel usano lo stesso evento. Un solo blocco coerente.
- **Commit 2:** Daily missions dipendono da serverReal e useMissionOfTheDay (untracked) e dai modals; le mission UI sono tutte nello stesso dominio.
- **Commit 3:** Supabase è backend; separato da frontend; le migrazioni devono stare con le function che le usano concettualmente.
- **Commit 4:** Core app e auth non dipendono da “feature” specifiche; i18n e hooks sono trasversali; tenere insieme evita commit frammentati.
- **Commit 5:** Gamification e rewards sono P1; agent e UI minori non sono dipendenze di M1U o daily missions; un commit “resto UI” è accettabile.
- **Commit 6:** Solo documentazione; nessun impatto runtime.

**Dipendenze da file untracked critici:**
- Commit 1: dipende da GlobalM1UCreditOverlay.tsx e m1uCreditEvent.ts (untracked).
- Commit 2: dipende da serverReal/, modals daily, useMissionOfTheDay (untracked).
- Commit 3: interamente Supabase untracked (functions + migrations).

---

## 5. DA NON COMMITTARE ANCORA

- **Eliminazioni massive `.glb`** (android/ e public/): centinaia di file in stato “D”. Prima verificare se sono volute (cleanup) o da ripristinare; non includere nel primo ciclo di “safety” per evitare di fissare uno stato asset incerto.
- **Asset dubbi:** altri file in `android/app/src/main/assets/public/` o `public/` che non siano chiaramente necessari per build iOS (es. bundle-analysis.html, index.html se sono solo copie di build).
- **File Android secondari:** modifiche solo per Android se il focus recovery è iOS; si possono committare in un secondo momento dopo verifica.
- **Script temporanei:** `scripts/glb-audit.cjs`, `scripts/glb-audit.js`, `scripts/check-cap-assets.js` — utilità/audit; non critici; da includere eventualmente in commit 6 o in un commit “script” successivo.
- **Report non essenziali:** report puramente storici già presenti nel backup FASE 1; si possono aggiungere in commit 6 o lasciare fuori e tenere solo nel backup.
- **Roba da verificare prima:** qualsiasi file di cui non sia chiaro se sia stato modificato intenzionalmente o per errore; meglio lasciarlo fuori dal primo ciclo e aggiungerlo dopo conferma.

Regola: **includi nel piano solo ciò che è P0/P1 e chiaramente necessario per l’app attuale; tutto il resto va in “da non committare ancora” o in commit successivi dedicati.**

---

## 6. Risposta operativa finale

### 6.1 Qual è il modo più safe per non perdere il lavoro adesso?

Eseguire in **una sola sessione** i commit tematici (Strategia B) in ordine 1 → 6, senza interruzioni, verificando dopo ogni commit che i file previsti siano inclusi. Al termine della sessione il working tree deve essere pulito per tutto ciò che è P0/P1 (e P2 doc). In questo modo nulla di critico resta non committato. Il backup FASE 1 resta la rete di sicurezza fisica.

### 6.2 Qual è il primo commit che faresti?

**Commit 1:** `chore(safety): M1U global slot engine + App/Home/shop/pill`  
Include: GlobalM1UCreditOverlay.tsx, m1uCreditEvent.ts, App.tsx, AppHome.tsx, M1UPill.tsx, M1UShopContent.tsx, FortuneWheel.tsx (e solo questi file per quel commit).

### 6.3 Quali file/gruppi devono assolutamente rientrare nel primo commit?

- `src/features/m1u/GlobalM1UCreditOverlay.tsx` (untracked)  
- `src/features/m1u/m1uCreditEvent.ts` (untracked)  
- `src/App.tsx` (modificato)  
- `src/pages/AppHome.tsx` (modificato)  
- `src/features/m1u/M1UPill.tsx` (modificato)  
- `src/components/m1units/M1UShopContent.tsx` (modificato)  
- `src/components/feedback/FortuneWheel.tsx` (modificato)  

Senza questi sette (e senza altri file fuori da questo blocco nel primo commit) il primo commit è coerente e minimale per “M1U + app root + shop + wheel”.

### 6.4 Quali aree vanno separate in commit diversi?

- **M1U/App/Home/shop/wheel** (commit 1)  
- **Daily missions** (client + serverReal + modals) (commit 2)  
- **Supabase** (functions + migrations) (commit 3)  
- **Core auth/main/i18n/hooks** (commit 4)  
- **Gamification/rewards/agent/resto UI** (commit 5)  
- **Docs/reports** (commit 6)  

Ogni area in un commit separato per storia e revert.

### 6.5 Quali file è meglio NON includere subito?

- Tutte le eliminazioni (D) in `android/` e `public/` relative a `.glb` e asset 3D.  
- Modifiche ad `android/app/src/main/assets/public/bundle-analysis.html` e `index.html` se sono solo artefatti di build.  
- Script `scripts/glb-audit*.js`, `scripts/check-cap-assets.js` (opzionali, dopo).  
- Qualsiasi file di cui non si è certi che lo stato attuale sia voluto.

### 6.6 Dopo la FASE 3, qual è la FASE 4 più corretta?

**FASE 4: Esecuzione commit di salvataggio in ordine controllato.**

- Eseguire i commit 1–6 in sequenza secondo la tabella del §4.  
- Per ogni commit: `git add` solo i file del gruppo, `git commit -m "..."` con messaggio come in tabella, verificare `git status`.  
- Non fare push fino a quando non si è verificato che build e comportamento sono ok (opzionale ma consigliato).  
- Poi: **FASE 5** push del branch su GitHub; **FASE 6** (se prevista) verifica Supabase + .env.local e note setup iOS.  
- **Non eseguire** FASE 4 in questa sessione; solo pianificata e raccomandata.

---

## 7. Raccomandazione fase successiva

**FASE 4: Esecuzione commit di salvataggio in ordine controllato**

- Usare questo report come checklist.  
- Eseguire i 6 commit in ordine, aggiungendo solo i file indicati per ogni gruppo.  
- Non includere eliminazioni massive .glb né file dubbi.  
- Al termine, verificare `git status` (working tree pulito per tutto ciò che si è scelto di salvare) e eventualmente `npm run build` / `npx cap sync ios` prima del push.  
- Non fare push in FASE 4 se non esplicitamente previsto; il push è FASE 5.

---

## 8. Output sintetico (risposte operative)

1. **Percorso report:** `reports/DISASTER_RECOVERY_PHASE3_COMMIT_PLAN.md`

2. **Strategia finale consigliata:** **B** (Commit tematici ordinati).

3. **Top 5 commit/gruppi consigliati in ordine:**
   - 1) M1U global slot engine + App/Home/shop/pill  
   - 2) Daily missions app + serverReal + modals  
   - 3) Supabase functions + migrations  
   - 4) Core auth/main/i18n/hooks  
   - 5) Gamification/rewards/agent/UI restante  
   (6) Docs/reports — opzionale ma consigliato.)

4. **Top 10 file/gruppi da includere nel PRIMO commit:**
   - `src/features/m1u/GlobalM1UCreditOverlay.tsx`  
   - `src/features/m1u/m1uCreditEvent.ts`  
   - `src/App.tsx`  
   - `src/pages/AppHome.tsx`  
   - `src/features/m1u/M1UPill.tsx`  
   - `src/components/m1units/M1UShopContent.tsx`  
   - `src/components/feedback/FortuneWheel.tsx`  
   (Solo questi 7 file formano il primo commit; non altri gruppi.)

5. **Top 10 file/gruppi da NON committare ancora:**
   - Eliminazioni massive `.glb` (android/ e public/)  
   - Modifiche ad asset dubbi in `android/.../assets/public/` (bundle-analysis, index da build)  
   - File Android secondari non verificati  
   - `scripts/glb-audit.cjs`, `scripts/glb-audit.js`  
   - `scripts/check-cap-assets.js`  
   - Report/documentazione non essenziali (se si vuole tenere commit 6 minimo)  
   - Qualsiasi file di cui non si è certi che lo stato sia voluto  
   - Modifiche a IAP/StoreKit/receipts (rispetto paletti; non toccare)  
   - File di build/cache e artefatti generati  
   - `.env.local` e segreti (mai in Git; già in backup FASE 1)

---

**Fine report FASE 3. Nessun commit, push o modifica eseguiti.**
