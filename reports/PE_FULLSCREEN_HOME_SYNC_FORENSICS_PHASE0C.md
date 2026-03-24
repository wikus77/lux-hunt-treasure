# PE Fullscreen Reward + Home Pulse Bar + Real PE Sync — Fase 0 Forensics (Hard Read-Only)

**Data:** 2026-03-07  
**Tipo:** Analisi read-only, nessuna modifica al codice, nessun commit, nessun push  
**Scope:** iOS Capacitor WKWebView only. Perimetro: PE fullscreen modale, barra reward, sync Home, chain dati.  
**Output:** Solo questo report `.md`.

---

## 1. Executive Summary

- **Modale “fullscreen”:** Il componente usato è **GlobalPERewardOverlay** con **PulseBarReward**; il layout reale è **fullscreen solo per il backdrop** (fixed inset-0). Il **contenuto visibile** è una **card centrata** con `max-w-md` (28rem), `rounded-2xl`, `mx-4` — quindi **non è fullscreen cinematografico**: è un modale piccolo/centrato su sfondo scuro. Da qui l’impressione “modale piccolo/povero” e “qualità visiva bassa”.
- **Barra nel modale:** La barra è **collegata** a `preValue`/`postValue` e ha fasi inject → fill → done, ma il **fill visivo** è `fillPercent = (displayAmount / targetDisplay) * 100`. Se l’utente ha molti PE (es. 1000), per +10 PE il fill è ~1%: l’animazione è **tecnica** ma **quasi invisibile** (“barra praticamente statica”).
- **+10 PE reale:** In Practice Mode il flusso è: update diretto `profiles.pulse_energy` → `emitPECreditEvent(payout, 'practice_mode_win', { preValue, postValue })`. L’accredito è **reale** (scrittura DB). Il modale riceve amount/pre/post corretti. **Nessun** `pe:awarded` viene emesso da Practice Mode.
- **Home post-reward:** La Home mostra PE tramite **PulseBarPersonal** e **AgentEnergyPill**, che leggono **useHierarchyRank**. useHierarchyRank si aggiorna con (1) **Realtime** su `profiles` UPDATE e (2) **refetch** su evento `pe:awarded`. Practice Mode **non** emette `pe:awarded` → nessun refetch immediato; l’unico aggiornamento è via **Realtime**. Se Realtime è in ritardo o non arriva, la barra Home resta con il valore vecchio; inoltre **non esiste** un layer dedicato “post-reward” (badge delta, glow, sweep) che evidenzi il delta appena guadagnato quando si torna in Home.
- **Root causes ordinate:** (1) Layout modale: contenuto a card con max-w-md, non full page. (2) Animazione barra: fill percentuale sul totale PE rende il movimento trascurabile. (3) Manca un “post-reward home sync feedback layer”: nessun highlight/delta/badge evidente in Home. (4) Sync: flussi che non emettono `pe:awarded` (es. Practice Mode) non triggerano refetch; dipendenza solo da Realtime.
- **BattlePush:** Confermato **separato** dal reward PE: invocato in **BattleCreationForm** alla **creazione** battaglia (invite), non alla risoluzione; non tocca `pulse_energy` né `emitPECreditEvent`.

---

## 2. Componente reale del modale PE

### 2.1 Identificazione

| Domanda | Risposta |
|--------|----------|
| Quale componente viene renderizzato al reward PE? | **GlobalPERewardOverlay** (`src/features/pulse/components/GlobalPERewardOverlay.tsx`), che contiene **PulseBarReward** (`src/features/pulse/components/PulseBarReward.tsx`). |
| È un wrapper diverso? | No. È esattamente GlobalPERewardOverlay + PulseBarReward. |

### 2.2 Render e layout

- **Portal:** `createPortal(modal, document.body)` — sì, il modal è portato in `document.body`.
- **Container esterno:**  
  `className="fixed inset-0 flex items-center justify-center"`  
  `style={{ zIndex: 999998, padding: env(safe-area-inset-*) }}`  
  → **Fullscreen** (backdrop e area cliccabile).
- **Contenuto interno (card):**  
  `className="relative flex flex-col items-center justify-center px-6 py-10 rounded-2xl max-w-md w-full mx-4"`  
  → **max-w-md** = 28rem ≈ 448px; **rounded-2xl**; **mx-4** margini orizzontali.  
  Stile: gradient scuro, bordo cyan, box-shadow.  
  → Il **contenuto visibile** è una **card centrata a larghezza limitata**, non una full page.

### 2.3 Layout tree (semplificato)

```
body
└── [portal] motion.div (fixed inset-0, flex center, z 999998)
    ├── div (absolute inset-0, bg-black/85, backdrop-blur) [backdrop]
    └── motion.div (relative, max-w-md w-full mx-4, rounded-2xl) [CARD]
        ├── PulseBarReward (amount, source, preValue, postValue)
        └── button "Continua"
```

### 2.4 Classi / stile decisive per il look “modale piccolo”

- **Card:** `max-w-md w-full mx-4` — limita la larghezza e centra con margini.
- **rounded-2xl** — aspetto “finestra” e non “full page”.
- **px-6 py-10** — padding interno contenuto.

### 2.5 Risposta netta

**Il modale attuale non è “davvero” fullscreen dal punto di vista del contenuto.**  
È fullscreen solo per **backdrop** e **area**; il **contenuto** è una **card centrata a larghezza massima ~448px**, quindi visivamente “modale piccolo” e non “full page cinematografico”.

---

## 3. Analisi reale della barra nel modale

### 3.1 Collegamento ai dati

- **Props:** `amount`, `source`, `preValue`, `postValue`, `onAnimationComplete`.
- **targetDisplay:** `postValue ?? preValue + amount` — valore usato per il calcolo del fill.
- **fillPercent:** `Math.min(100, (displayAmount / Math.max(1, targetDisplay)) * 100)`.
- La barra **è collegata** a pre/post e amount: non è solo cosmetica.

### 3.2 Calcolo valore mostrato

- **displayAmount:** incrementato a step (interval 350/steps) da 0 a `amount`; numero di step = `Math.min(Math.max(amount, 1), 40)`.
- **Fill della barra:** `scaleX(fillPercent / 100)` con `transition duration 0.9`.
- **Problema:** Se `targetDisplay` è grande (es. 1000 PE) e `amount` è 10, `fillPercent ≈ 1%` → la barra si riempie di un **1%**: movimento **quasi invisibile**.

### 3.3 Sfera e fasi

- **Fasi:** `inject` (0–650 ms) → `fill` (650–2200 ms) → `done` (dopo 2200 ms).
- Sfera: `initial x = BAR_WIDTH + SPHERE_SIZE` (entra da destra), `animate x` in base a `phase` e `fillPercent`.
- **Animazione:** Esiste (sfera che entra, scaleX del fill, glow in “done”), ma l’entità del **fill** dipende dalla percentuale sul totale PE.

### 3.4 State / useEffect / motion

- `displayAmount`: state aggiornato da `setInterval` (step increment).
- `phase`: state con due `setTimeout` (650 ms → fill, 2200 ms → done + onAnimationComplete).
- Barra: `motion.div` con `animate={{ scaleX: fillPercent / 100 }}`.
- Sfera: `motion.div` con `initial`/`animate` su `x`, `opacity`, `scale`.

### 3.5 Risposta brutale

**Animazione reale ma visivamente “minima” / “quasi statica” quando il saldo PE è alto.**  
Per +10 PE su 1000 PE totali il fill è ~1%; la sfera si muove ma il riempimento della barra è trascurabile. Quindi: **animazione tecnicamente presente, progressione visiva insufficiente** per un effetto “reward cinematografico”.

---

## 4. Chain completa del delta PE

### 4.1 Caso testato: +10 PE (es. Practice Mode win)

| Step | Dove | Cosa succede |
|------|------|---------------|
| 1 | PracticeMode.tsx `handleTap` | Vittoria: `payout = stake.amount * 2` (es. 10). `preValue = currentBalance`, `postValue = newBalance`. |
| 2 | PracticeMode.tsx | `setUserBalance` (locale). `updateBalanceAsync('PE', newBalance)` → `supabase.from('profiles').update({ pulse_energy: newBalance }).eq('id', userId)`. |
| 3 | DB | `profiles.pulse_energy` aggiornato (accredito **reale**). |
| 4 | PracticeMode.tsx | Dopo `updateBalanceAsync` resolve: `emitPECreditEvent(payout, 'practice_mode_win', { preValue, postValue })`. |
| 5 | GlobalPERewardOverlay | Listener `pe-credit-event` → `setPayload(detail)` → render modale con PulseBarReward. |
| 6 | Practice Mode | **Non** viene mai fatto `window.dispatchEvent('pe:awarded', ...)`. |

### 4.2 Dove si decide amount = 10

- In Practice Mode lo stake è scelto dall’utente (1–5). Payout win = `stake.amount * 2`; se stake = 5, payout = 10. Valore quindi da **stake scelto** in `PracticeMode.tsx`, non da costante fissa.

### 4.3 Tabella chain (source → accredito → lettura Home)

| Source | Amount mostrato | Accredito reale? | Dove si scrive | Come si legge in Home | Come si vede in Home | Mismatch? |
|--------|------------------|-------------------|----------------|------------------------|----------------------|-----------|
| useAwardPE (RPC) | delta da result | Sì (RPC) | RPC `award_pulse_energy` → `profiles.pulse_energy` | useHierarchyRank: refetch su `pe:awarded` + Realtime | PulseBarPersonal / AgentEnergyPill | No (se RPC ok) |
| Practice Mode | payout (es. 10) | Sì (update diretto) | `profiles.update({ pulse_energy })` in PracticeMode | useHierarchyRank: **solo Realtime** (nessun `pe:awarded`) | Stesso stato; aggiornamento solo se Realtime arriva | Sì: nessun refetch immediato |
| BattleDefenseModal | peAmount | Sì (update diretto) | update diretto + emitPECreditEvent | Realtime; **no** `pe:awarded` | Come sopra | Sì (no refetch) |
| Clue milestone | milestone.pe | Sì (update diretto) | useClueMilestones: `.update({ pulse_energy })` + emitPECreditEvent | Realtime; **no** `pe:awarded` | Come sopra | Sì (no refetch) |

### 4.4 RPC / update / realtime / refetch

- **useAwardPE:** RPC `award_pulse_energy` → DB; poi `pe:awarded` + `emitPECreditEvent`. Home: refetch su `pe:awarded` + Realtime.
- **Practice Mode / BattleDefenseModal / Clue milestone:** Update diretto su `profiles` + (dove previsto) `emitPECreditEvent`; **nessun** `pe:awarded` → Home si aggiorna **solo** via Realtime.

Quindi: **il +10 nel modale è reale** (DB aggiornato). Il “non percepire il reward in Home” può dipendere da: (1) Realtime in ritardo, (2) nessun refetch perché manca `pe:awarded`, (3) nessun layer UI che evidenzi il delta (badge/glow/sweep).

---

## 5. Analisi Home post-reward

### 5.1 Componenti che mostrano PE in Home

| Elemento | File | Componente | Dati letti |
|----------|------|------------|------------|
| Barra a segmenti + livello + PE | `src/features/pulse/components/PulseBarPersonal.tsx` | PulseBarPersonal | useHierarchyRank (pulseEnergy, progressPercent, currentLevel, …) |
| Pill circolare + valore PE | `src/features/pulse/components/AgentEnergyPill.tsx` | AgentEnergyPill | useHierarchyRank (pulseEnergy, progressPercent, currentLevel) |

Montaggio: **CommandCenterHome** (`src/components/command-center/CommandCenterHome.tsx`), sotto `PULSE_ENABLED`.

### 5.2 Layer delta / animazione post-reward in Home

- **PulseBarPersonal:** listener `pe:awarded` → `refetch()` + refetch dopo 500 ms. **Show PE gain:** `showPEGain && pulseEnergy > lastPE` → badge “+N PE” sopra la barra. `showPEGain` viene settato in useEffect quando `pulseEnergy > lastPE && lastPE > 0`; **nello stesso effect** viene chiamato `setLastPE(pulseEnergy)`, quindi al render successivo `pulseEnergy > lastPE` può essere già falso e il badge non mostrare il delta (o mostrarlo per un frame solo).
- **AgentEnergyPill:** stessa logica `showPEGain` / `lastPE`; **nessun** listener `pe:awarded` (dipende solo da useHierarchyRank).
- **Nessun** layer dedicato “post-reward”: nessun glow sulla barra, sweep, refill, né badge temporaneo “+10 PE” coordinato con la chiusura del modale reward.

### 5.3 Eventi ascoltati

- **PulseBarPersonal:** solo `pe:awarded` (per refetch). Non ascolta `pe-credit-event`.
- **AgentEnergyPill:** nessun evento; solo stato da useHierarchyRank.
- **useHierarchyRank:** Realtime su `profiles` (UPDATE, filter `id=eq.${user.id}`) → su cambio `pulse_energy` chiama `fetchEnergy()`.

### 5.4 Risposta ai punti richiesti

- Esiste un layer che evidenzia il delta appena guadagnato? **Solo** il badge “+N PE” su PulseBarPersonal/AgentEnergyPill, e solo quando lo stato si aggiorna (refetch o Realtime); la logica con `lastPE` può ridurre la visibilità del delta.
- Animazione post-reward in Home? Solo il piccolo badge “+N PE”; nessuna animazione forte (glow/sweep/refill).
- Badge temporaneo “+10 PE” coordinato con modale? No.
- La Home riceve l’evento reward? Non direttamente: non c’è listener su `pe-credit-event` in Home. La Home si aggiorna solo tramite **stato** (useHierarchyRank) che cambia per refetch (`pe:awarded`) o Realtime.
- Se il flusso non emette `pe:awarded` (Practice Mode, BattleDefenseModal, clue milestone), la Home **non** fa refetch; dipende solo da Realtime.

---

## 6. Root causes ordinate per probabilità

Ordine di probabilità (da alta a bassa):

1. **A) Modale fullscreen implementato con layout sbagliato**  
   Contenuto a card `max-w-md` centrata, non full page. Spiega “modale piccolo/povero” e “non fullscreen/cinematografico”.

2. **C) Reward reale ma nessun layer che renda evidente il delta in Home**  
   Nessun “post-reward home sync feedback”: nessun highlight/badge robusto/glow/sweep che mostri chiaramente il +10 dopo la chiusura del modale.

3. **B) Animazione barra nel modale troppo debole**  
   Fill percentuale su `targetDisplay` (totale PE) rende il movimento della barra trascurabile quando il saldo è alto; percezione “barra praticamente statica”.

4. **E) Modale e Home non sincronizzati bene**  
   Flussi che usano solo update diretto + `emitPECreditEvent` (senza `pe:awarded`) non triggerano refetch; aggiornamento Home solo via Realtime (ritardi possibili).

5. **G) Sistema incompleto: manca “post-reward home sync feedback layer”**  
   Manca un layer esplicito che, alla chiusura del modale (o all’arrivo del reward), mostri in Home il delta e il nuovo totale in modo evidente.

6. **D) Home legge il saldo ma lo mostra male**  
   Possibile contributo secondario (leggibilità/testi), ma non la causa principale della “mancata percezione” del reward.

7. **F) Reward non scritto come si pensa**  
   Scartata per Practice Mode: l’update diretto e l’RPC sono presenti; l’accredito è reale.

8. **BattlePush**  
   Non root cause: separato dal reward PE (vedi sezione 9).

---

## 7. Cosa manca per il risultato desiderato

**Risultato desiderato:** (1) modale reward davvero fullscreen/premium/AAA, (2) barra con animazione cinematografica, (3) reward chiaro, (4) ritorno in Home con feedback evidente del delta, (5) Home che mostra chiaramente nuovo totale e/o delta.

### Nel modale

- Layout **full page** per il **contenuto** (non solo backdrop): niente card `max-w-md`; contenuto che usa tutta (o quasi) la viewport (es. barra grande, titolo, +N PE in primo piano).
- Barra con **animazione percepibile**: fill basato su **delta** (es. segmento “+10” che si riempie) o scala visiva indipendente dal totale PE, non (solo) percentuale su `targetDisplay`.

### Nella chain dati

- Allineamento eventi: dove si fa `emitPECreditEvent` (dopo accredito reale), emettere anche `pe:awarded` (o un evento unificato) così che la Home possa fare **refetch immediato** oltre a Realtime.
- Oppure: un canale esplicito “reward closed” / “PE credited” che la Home ascolti per mostrare il delta.

### Nella Home

- Layer “post-reward”: alla chiusura del modale (o al ricevere conferma reward): badge “+10 PE” ben visibile, breve glow/sweep sulla barra o sulla pill, e/o evidenziazione del nuovo totale per qualche secondo.

### Nella sincronizzazione visiva

- Garantire che al ritorno in Home lo stato sia già aggiornato (refetch su evento reward, non solo Realtime) e che un solo componente “post-reward” mostri il delta in modo chiaro.

### Nella leggibilità

- Verificare dimensioni/contrasto dei testi PE in PulseBarPersonal e AgentEnergyPill (già parzialmente toccati in report precedenti).

---

## 8. Whitelist file futura

### 8.1 Reward PE overlay

- **Sicuramente da toccare:**  
  `src/features/pulse/components/GlobalPERewardOverlay.tsx`  
  `src/features/pulse/components/PulseBarReward.tsx`
- **Probabilmente:**  
  `src/features/pulse/peCreditEvent.ts` (solo se si aggiungono campi o eventi).

### 8.2 Componente barra reward

- **Sicuramente:**  
  `src/features/pulse/components/PulseBarReward.tsx` (layout, animazione fill, scala visiva).

### 8.3 Event / state sync

- **Sicuramente / probabilmente:**  
  `src/features/pulse/hooks/useAwardPE.ts` (già emette pe:awarded + emitPECreditEvent).  
  `src/components/battle/PracticeMode.tsx` (aggiungere `pe:awarded` dopo update + emit).  
  `src/components/battle/BattleDefenseModal.tsx` (stesso, se si vuole refetch immediato).  
  `src/hooks/useClueMilestones.ts` (stesso).  
  `src/features/vera-missions/bomb/useBombMissionRun.ts` (idem).

### 8.4 Home pulse bar / PE display

- **Sicuramente / probabilmente:**  
  `src/features/pulse/components/PulseBarPersonal.tsx` (listener, refetch, badge delta, eventuale “post-reward” layer).  
  `src/features/pulse/components/AgentEnergyPill.tsx` (stesso stato, eventuale badge/glow).  
  `src/hooks/useHierarchyRank.ts` (solo se si aggiunge un canale “reward received” per refetch).

### 8.5 i18n

- **Probabilmente:**  
  `src/locales/en/common.json`, `src/locales/it/common.json` (chiavi `pe_reward.*`).

### 8.6 File da NON toccare (perimetro escluso)

- IAP / StoreKit / receipts / purchase flow  
- Login / logout / delete-account  
- BUZZ / BUZZ MAP (salvo dove già usano awardPE)  
- Push native (config; BattlePush solo invite)  
- Subscriptions  
- M1U global engine  
- BattleCreationForm (salvo eventuale allineamento eventi)  
- Qualsiasi logica fuori da: PE fullscreen, PE Home readability, PE sync

---

## 9. BattlePush separato sì/no

- **Confermato: BattlePush non c’entra con il reward PE.**
- **Dove nasce:** `sendBattleInvite` in `src/lib/battle/pushNotifications.ts`; invocato da `BattleCreationForm.tsx` (creazione battaglia / invite).
- **Fase del battle flow:** Alla **creazione** dell’attacco (invio invito al difensore), **prima** del countdown e della risoluzione. Non alla fine della battaglia.
- **Perché non è root cause del problema fullscreen/Home PE:** Non tocca `pulse_energy`, non chiama `award_pulse_energy`, non chiama `emitPECreditEvent`. L’errore BattlePush (Edge `battle-push-send`) riguarda solo l’invio della notifica push; il reward PE avviene in altri punti (handleCountdownComplete, PracticeMode, BattleDefenseModal, ecc.).

---

## 10. Top 5 file da toccare in un eventuale fix serio

1. **`src/features/pulse/components/GlobalPERewardOverlay.tsx`** — Layout fullscreen reale per il contenuto (rimuovere card max-w-md; contenuto full page o quasi).  
2. **`src/features/pulse/components/PulseBarReward.tsx`** — Animazione barra “cinematografica” (fill su delta o scala visiva indipendente dal totale PE).  
3. **`src/features/pulse/components/PulseBarPersonal.tsx`** — Layer post-reward in Home (badge delta robusto, eventuale glow/sweep) e/o refetch su evento unificato.  
4. **`src/components/battle/PracticeMode.tsx`** — Emettere `pe:awarded` dopo update + emitPECreditEvent per refetch immediato in Home.  
5. **`src/hooks/useHierarchyRank.ts`** oppure **evento unificato** — Garantire che tutti i flussi che accreditano PE (inclusi update diretti) triggerino un aggiornamento immediato della Home (refetch o evento “reward received”) oltre a Realtime.

---

*Fine report. Nessuna modifica al codice; nessun commit; nessun push. Solo forensics read-only.*
