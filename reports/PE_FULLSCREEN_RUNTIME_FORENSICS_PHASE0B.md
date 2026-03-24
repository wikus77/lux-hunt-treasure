# PE Fullscreen Reward + Real Home Pulse Bar — Fase 0 Bis Forensics (Read-Only)

**Data:** 2026-03-06  
**Tipo:** Analisi read-only, nessuna modifica al codice  
**Obiettivo:** Capire perché fullscreen PE non appare nei test reali, pulse bar identica a prima, BattlePush in log.

---

## 1. Executive Summary

- **Pulse bar Home:** La barra rossa/PE visibile in Home è renderizzata da **PulseBarPersonal** (inline) e **AgentEnergyPill** (pill fisso in basso a destra), entrambi in `CommandCenterHome`. Le modifiche del report precedente **colpiscono** questi componenti; se l’utente non vede differenze, cause probabili: build/cache non aggiornata o route diversa.
- **Battle flow:** Esistono **due** flussi battle distinti. (1) **BattleCreationForm** (BattleModal, da mappa/BattlePill): accredito PE solo via `awardPE` (RPC) → `emitPECreditEvent` in useAwardPE → fullscreen atteso. (2) **PracticeMode** (BattleConsole da Home → Battle Game): accredito PE **solo** con update diretto `profiles.pulse_energy`, **nessuna** chiamata a `awardPE` né `emitPECreditEvent` → fullscreen **mai** atteso. Se l’utente gioca M1SSION WAR dalla **Home** (tap su Battle → Game), usa PracticeMode: il fullscreen PE non è implementato in quel ramo.
- **Chain evento globale:** Nome evento e listener sono allineati (`pe-credit-event`); GlobalPERewardOverlay è montato in AuthProvider. Il primo punto che rompe la chain in molti casi reali è: **PracticeMode non emette l’evento**.
- **BattlePush:** Invocato in `BattleCreationForm` alla creazione battaglia (invite); errore `FunctionsHttpError` riguarda solo l’invio push, non il reward PE. **BattlePush è separato dal fullscreen PE** e **non blocca** il reward flow.
- **Leggibilità:** Le modifiche dichiarate (text-xs/text-sm, contrasto, valore sulla pill) sono presenti nel codice; su dispositivo potrebbero essere poco evidenti per font piccolo (10px sulla pill) o build non aggiornata.
- **Verdetto:** **C) Il fullscreen PE non è realmente integrato nel runtime usato dall’utente** (se l’utente usa il battle dalla Home via PracticeMode). In più **D) La pulse bar corretta è stata toccata**, ma l’effetto può essere poco visibile o non deployato. **E) BattlePush è separato.**

---

## 2. Componente reale della pulse bar Home

### 2.1 Rendering reale della Home

- **Route:** `/home` → `WouterRoutes` renderizza `AppHome`.
- **AppHome** (`src/pages/AppHome.tsx`) renderizza `CommandCenterHome` nel content principale.
- **CommandCenterHome** (`src/components/command-center/CommandCenterHome.tsx`):
  - Se `PULSE_ENABLED` (true in `featureFlags.ts`):
    - Renderizza **PulseBarPersonal** con `variant="inline"` (circa righe 208–216).
    - Renderizza **AgentEnergyPill** in un div fixed `bottom-24 right-4` (righe 223–227).

### 2.2 Chi renderizza cosa

| Elemento visivo | File / componente | Montato in |
|-----------------|-------------------|------------|
| Barra a segmenti (gauge orizzontale) + livello + PE totali + footer "X / Y PE" | `PulseBarPersonal` | CommandCenterHome (inline) |
| Pill circolare con icona rank + arco progresso (+ valore PE se presente nel codice) | `AgentEnergyPill` | CommandCenterHome (fixed) |

### 2.3 Verifica modifiche report precedente

- **PulseBarPersonal.tsx:** Presenti le classi dichiarate nel report: label "PE" `text-xs font-semibold text-white/80`, valore `text-sm font-bold font-mono` con `textShadow` rank, footer `text-xs text-white/70`.
- **AgentEnergyPill.tsx:** Presente lo span con `formatPE(pulseEnergy)` sotto l’icona (`text-[10px] font-bold`, colore rank, glow).

**Risposta obbligatoria:**

- **La barra rossa Home è renderizzata da:** `src/features/pulse/components/PulseBarPersonal.tsx` (componente `PulseBarPersonal`), montato in `CommandCenterHome.tsx`.
- **Il valore PE visibile (nella barra) è renderizzato da:** `PulseBarPersonal.tsx` (stesso componente). Sulla pill: `AgentEnergyPill.tsx`.
- **Le modifiche del report precedente colpiscono il componente reale:** Sì. PulseBarPersonal e AgentEnergyPill usati in Home sono quelli modificati. Se l’utente non vede differenze: (1) build/dist non aggiornata su dispositivo, (2) cache, (3) route diversa da `/home`.

---

## 3. Call graph reale battle attaccante / difensore

### 3.1 Due flussi battle distinti

| Flusso | Punto ingresso UI | Componente runtime | Dove si accredita PE | awardPE / RPC? | emitPECreditEvent? | Fullscreen atteso? |
|--------|-------------------|-------------------|----------------------|----------------|---------------------|--------------------|
| **A – BattleModal (mappa / BattlePill)** | Tap su marker mappa o BattlePill → BattleModal | BattleCreationForm | useAwardPE → RPC `award_pulse_energy` | Sì | Sì (in useAwardPE, se delta > 0) | Sì (vittoria) |
| **B – Home Battle Console** | Home → Battle Console → Start Battle → Game | PracticeMode | Update diretto `profiles.pulse_energy` | No | No | No |

### 3.2 Dettaglio flusso A (attaccante – BattleCreationForm)

- **File:** `src/components/battle/BattleCreationForm.tsx`
- **Funzione:** `handleCountdownComplete`
- **Accredito PE:** Solo tramite `awardPE('BATTLE_WIN')` o `awardPE('BATTLE_LOSE')` (nessun update diretto `pulse_energy` nel form).
- **useAwardPE** (`src/features/pulse/hooks/useAwardPE.ts`): chiama `supabase.rpc('award_pulse_energy', ...)`; a successo dispaccia `pe:awarded` e, se `delta > 0`, `emitPECreditEvent(delta, source, { preValue, postValue })`.
- **BATTLE_LOSE:** delta -100 → `emitPECreditEvent` non chiamato (solo delta > 0).
- **Fullscreen atteso:** Sì in caso di vittoria. **Fullscreen reale:** Sì se il flusso eseguito è questo e l’RPC ha successo.
- **Possibile mismatch:** Se l’utente non usa questo flusso ma il flusso B (PracticeMode), il fullscreen non è previsto.

### 3.3 Dettaglio flusso B (PracticeMode – Home)

- **File:** `src/components/battle/PracticeMode.tsx`
- **Montato in:** BattleGameContent → BattleConsole (Home).
- **Accredito PE:** Solo `updateBalanceAsync` → `supabase.from('profiles').update({ pulse_energy: newBalance })`. Nessuna chiamata a `awardPE` né a `emitPECreditEvent`.
- **Evento PE emesso:** No. **emitPECreditEvent chiamato:** No. **Fullscreen atteso:** No. **Causa mismatch:** PracticeMode non è stato integrato nella chain fullscreen PE.

### 3.4 Difensore (BattleDefenseModal)

- **File:** `src/components/battle/BattleDefenseModal.tsx`
- **handleDefend:** Update diretto PE difensore (e attaccante); se `defenderWins && peAmount > 0` viene chiamato `emitPECreditEvent(peAmount, 'battle_defense_win', { preValue, postValue })`.
- **Fullscreen atteso:** Sì quando il difensore vince. **Fullscreen reale:** Sì se il codice è quello attuale e l’evento arriva a GlobalPERewardOverlay.

### 3.5 Tabella riepilogativa

| Ruolo | File | Funzione | Accredito reale PE | Evento PE emesso? | emitPECreditEvent? | Fullscreen atteso? | Fullscreen reale? | Causa mismatch |
|-------|------|----------|--------------------|-------------------|--------------------|--------------------|------------------|----------------|
| Attaccante (BattleModal) | BattleCreationForm | handleCountdownComplete | RPC award_pulse_energy | Sì (pe:awarded) | Sì se win | Sì (win) | Sì se RPC ok | Nessuno in questo ramo |
| Attaccante (Home) | PracticeMode | handleTap / payout | Update diretto profiles | No | No | No | No | PracticeMode non integrato |
| Difensore | BattleDefenseModal | handleDefend | Update diretto profiles | Sì (solo se defenderWins) | Sì se defenderWins | Sì | Sì (se codice deployato) | — |

---

## 4. Chain evento globale PE

### 4.1 Evento e listener

- **Evento:** `PE_CREDIT_EVENT = 'pe-credit-event'` (`src/features/pulse/peCreditEvent.ts`).
- **emitPECreditEvent:** costruisce `detail` con `amount`, `source`, `id`, `issuedAt`, `preValue`, `postValue`; fa `window.dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail }))`. Non emette se `amount <= 0`.
- **GlobalPERewardOverlay** (`src/features/pulse/components/GlobalPERewardOverlay.tsx`): `window.addEventListener(PE_CREDIT_EVENT, handle)`. Montato in **AuthProvider** in `App.tsx` (righe 262–266). Render con `createPortal(modal, document.body)`, z-index 999998.

### 4.2 Dove viene chiamato emitPECreditEvent (codice attuale)

| File | Contesto |
|------|----------|
| useAwardPE.ts | Dopo RPC award_pulse_energy successo, se delta > 0 |
| BattleDefenseModal.tsx | Dopo update PE difensore, se defenderWins && peAmount > 0 |
| useClueMilestones.ts | Dopo update milestone con PE |
| OnboardingOverlay.tsx | Dopo award 50 PE onboarding |
| useBombMissionRun.ts | Dopo finalize_vera_mission_run con delta_pe > 0 |

**NON chiamato in:** PracticeMode (battle da Home).

### 4.3 Dedupe e lock (GlobalPERewardOverlay)

- `animatingRef`: messo a true all’ingresso, resettato in `close()` (chiusura modale o timeout).
- `lastIdRef` / `lastTimeRef`: dedupe stesso `detail.id` e eventi entro `DEDUPE_MS` (2500 ms).
- `AUTO_CLOSE_MS` 3500: chiusura automatica; `close()` resetta `animatingRef`.

Se un evento valido arriva mentre `animatingRef` è true (es. modale già aperta) viene scartato. Per battle, di solito un solo evento per esito: dedupe/lock non risultano la causa principale; la causa principale è l’**assenza di emit** in PracticeMode.

### 4.4 Risposta obbligatoria

- **La chain evento PE è corretta** (nome, payload, mount, listener) **per i flussi che emettono l’evento**.
- **Il primo punto che rompe la chain** (per l’utente che gioca dalla Home): **`src/components/battle/PracticeMode.tsx`** — nessuna chiamata a `emitPECreditEvent` dopo l’accredito PE; l’accredito avviene solo con update diretto su `profiles.pulse_energy`.

---

## 5. Confronto report implementazione vs codice reale

| Blocco | Confermato / Parziale / Non confermato | Note |
|--------|----------------------------------------|------|
| **Battle attaccante** | **Parzialmente confermato** | Il fix (solo awardPE) è presente in **BattleCreationForm**. Però il battle dalla **Home** passa da **PracticeMode**, che non usa awardPE né emette evento: il report non menziona PracticeMode. |
| **Battle difensore** | **Confermato** | BattleDefenseModal emette `emitPECreditEvent` quando il difensore vince. |
| **GlobalPERewardOverlay** | **Confermato** | Montato in AuthProvider, listener e nome evento corretti. |
| **Pulse Bar readability** | **Confermato** | Modifiche presenti in PulseBarPersonal e AgentEnergyPill. **Non confermato dal runtime** se l’utente vede ancora la UI vecchia: possibile build/cache o percezione (es. 10px sulla pill poco visibile). |
| **BattlePush separato** | **Confermato** | BattlePush è solo invite; non tocca reward PE. |

**Conclusione:** Il fix è implementato correttamente per il flusso **BattleModal + BattleCreationForm** e per il **difensore**. Il problema è di **implementazione incompleta**: il flusso **PracticeMode** (battle dalla Home) non è stato integrato; se l’utente testa da lì, il fullscreen PE non può apparire. Inoltre, se la pulse bar “sembra identica”, può dipendere da build/cache o da miglioramenti ancora troppo sottili (es. 10px sulla pill).

---

## 6. BattlePush — Forensics

- **Dove viene invocata l’edge:** `src/lib/battle/pushNotifications.ts` → `sendBattleInvite` → `supabase.functions.invoke('battle-push-send', { body: { defender_id, battle_id, attacker_agent_code, ... } })`.
- **Chiamante:** `BattleCreationForm` quando si lancia l’attacco verso un agente reale (prima del countdown).
- **Effetto dell’errore:** Solo notifica push non inviata; toast “Notifica non consegnata”. La battaglia prosegue (countdown, handleCountdownComplete, awardPE). Nessun blocco del reward PE.
- **BattlePush è separato dal fullscreen PE:** Sì. **BattlePush non blocca il reward flow:** Corretto.

---

## 7. Diagnosi leggibilità pulse bar

- **Valore PE:** In PulseBarPersonal è `text-sm font-bold` con glow; in AgentEnergyPill è `text-[10px]` sotto l’icona. Per un utente medio, 10px sulla pill può restare poco leggibile; la barra inline è più leggibile.
- **Label PE:** “PE” in `text-xs font-semibold text-white/80` è più visibile del precedente “PE:” piccolo.
- **Gerarchia:** Migliorata (valore più grande, footer in text-xs text-white/70). Resta possibile che su dispositivo reale il miglioramento sia limitato (font piccolo, contrasto non forte).
- **Giudizio:** Le modifiche dichiarate ci sono; se l’utente non le vede, o il bundle non è aggiornato o l’impatto visivo è ancora modesto (in particolare il numero sulla pill a 10px). Risposta netta: **sì, il valore PE può essere ancora insufficientemente leggibile** sulla pill; sulla barra inline le modifiche dovrebbero aiutare, a patto che build e cache siano aggiornate.

---

## 8. Verdetto finale

Scelta unica: **C** con **D** e **E**.

- **C) Il fullscreen PE non è realmente integrato nel runtime usato dall’utente** — Se l’utente gioca M1SSION WAR dalla **Home** (Battle Console → Game), il runtime è **PracticeMode**, che non emette `pe-credit-event`. Il fullscreen è integrato solo per BattleCreationForm (mappa/BattlePill) e per il difensore (BattleDefenseModal).
- **D) La pulse bar Home corretta è stata toccata** — I componenti giusti (PulseBarPersonal, AgentEnergyPill) sono stati modificati; se appare “identica” può essere build/cache o miglioramenti ancora poco evidenti (soprattutto 10px sulla pill).
- **E) BattlePush è separato** — Nessun impatto sul fullscreen PE.

---

## 9. Whitelist futura per fix mirato

### 9.1 File sicuramente da toccare

- `src/components/battle/PracticeMode.tsx` — Aggiungere, dopo update riuscito di `pulse_energy` (win con stake PE), chiamata a `emitPECreditEvent(amount, 'practice_mode_win' | source coerente, { preValue, postValue })`.
- `src/features/pulse/peCreditEvent.ts` — Aggiungere source tipo `practice_mode_win` se si usa nomenclatura coerente.
- `src/locales/{it,en,fr}/common.json` — Aggiungere chiave `pe_reward.source_practice_mode_win` (o nome scelto) per il fullscreen.

### 9.2 File probabilmente da toccare

- Nessuno aggiuntivo per il fullscreen; per leggibilità ulteriore: `AgentEnergyPill.tsx` (es. aumentare dimensione valore PE sulla pill da 10px a 11px/12px se in scope).

### 9.3 File da NON toccare

- IAP, auth, delete-account, BUZZ/BUZZ MAP, push native, subscriptions, M1U global engine, GlobalPERewardOverlay (salvo fix dedupe se necessario), BattleCreationForm/BattleDefenseModal per il reward (già allineati).

---

## 10. Path report, summary, root causes, file

- **Path report:** `reports/PE_FULLSCREEN_RUNTIME_FORENSICS_PHASE0B.md`

### Summary (max 15 righe)

Il fullscreen PE non appare nei test reali perché esiste un secondo flusso battle dalla **Home** (**PracticeMode**) che accredita PE con update diretto e **non** chiama mai `emitPECreditEvent`. Il report di fix aveva considerato solo BattleCreationForm (mappa/BattlePill) e BattleDefenseModal. La pulse bar Home è quella corretta (PulseBarPersonal + AgentEnergyPill) e le modifiche di leggibilità sono nel codice; se l’utente non le vede, possibili cause: build/cache o miglioramento ancora modesto (10px sulla pill). BattlePush è separato e non blocca il reward. Verdetto: fullscreen non integrato nel runtime usato se si gioca da Home (PracticeMode); pulse bar toccata ma effetto può essere poco visibile; BattlePush fuori scope reward.

### Top 5 root causes (ordine di probabilità)

1. **PracticeMode (battle da Home) non emette `pe-credit-event`** — Flusso reale senza integrazione fullscreen.
2. **Utente testa dalla Home (Battle Console → Game)** — Runtime è PracticeMode, non BattleCreationForm.
3. **Build/cache su iPhone non aggiornata** — Modifiche pulse bar e fix battle (BattleCreationForm/Defense) non visibili.
4. **Leggibilità valore PE sulla pill** — 10px può restare poco leggibile anche con le modifiche.
5. **Dedupe/lock in GlobalPERewardOverlay** — Solo secondario; può scartare eventi ravvicinati, non spiega assenza totale del fullscreen se l’evento non viene mai emesso (PracticeMode).

### Top 5 file da toccare in un fix successivo

1. `src/components/battle/PracticeMode.tsx` — Emettere `emitPECreditEvent` dopo accredito PE in caso di vittoria.
2. `src/features/pulse/peCreditEvent.ts` — Aggiungere source per practice mode (es. `practice_mode_win`) se necessario.
3. `src/locales/it/common.json` (e en/fr) — Chiave i18n per source practice mode nel fullscreen.
4. `src/features/pulse/components/AgentEnergyPill.tsx` — Eventuale aumento leggibilità valore PE (es. 11px–12px) se in scope.
5. (Opzionale) `src/features/pulse/components/GlobalPERewardOverlay.tsx` — Solo se si vuole rivedere dedupe/lock per casi con eventi ravvicinati.

---

Fine report forense. Nessuna modifica al codice applicata.
