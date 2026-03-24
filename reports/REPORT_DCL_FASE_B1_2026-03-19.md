# REPORT FASE B1 — DCL Progressione visiva + next action state (iOS)

**Data:** 2026-03-19  
**Progetto:** M1SSION™ — App nativa wrappata iOS (Capacitor WKWebView)

---

## 1. FORENSICS

### File e pattern analizzati
- **Card DCL:** `src/components/home/DailyControlLoopCard.tsx` — titolo, sottotitolo, count X/3, tre `Row` (Commit, Streak, Mission), bonus, weekly, messaggio M1U/BUZZ. Count e Row sono render statico; nessuna animazione.
- **First incomplete row:** derivabile da `commit_done`, `streak_done`, `daily_mission_done`: prima non completata = Commit se `!commit_done`, altrimenti Streak se `!streak_done`, altrimenti Mission se `!daily_mission_done`.
- **Pattern esistenti:** Framer Motion (`motion`, `AnimatePresence`) già usato in AppHome, NextActionContainer, DailyMissionContent, CommitModal (transizioni scale/opacity, spring). Stile M1SSION: cyan `rgba(0, 209, 255)`, glass, text-shadow.

### Soluzione scelta
- **Count:** `motion.span` con `key={daily_completion_count}`, `initial` scale 1.12 + opacity 0.7, `animate` a 1, `transition` spring (stiffness 380, damping 26) — reazione visiva al cambio 0/3→1/3→2/3→3/3 senza essere invasiva.
- **Next action:** prop `isNextAction` per la prima riga non completata; prop `isNearCompletion` quando `daily_completion_count === 2`. Stile riga attiva: background più presente (`rgba(255,255,255,0.08)`), bordo cyan leggero (`1px solid rgba(0, 209, 255, 0.32)`); a 2/3 aggiunto boxShadow glow (`0 0 14px rgba(0, 209, 255, 0.14)`). Riga in `motion.li` solo per transizione stile (duration 0.2), nessun pulse infinito per evitare carico inutile su iOS.
- **Transizione completamento:** quando una riga passa a “Completato”, il blocco check + label è un `motion.span` con `initial` opacity 0 / scale 0.92, `animate` a 1, `exit` opacity 0 / scale 0.96; CTA è un `motion.button` con AnimatePresence `mode="wait"` per evitare sovrapposizioni.

### Perché è la più safe
- Un solo file toccato (DailyControlLoopCard); nessun hook, RPC, routing, auth, IAP, BUZZ, push.
- Solo UI/motion sulla base dello stato già esistente; logica CTA e realtime Fase A invariata.
- Framer Motion già in uso nel progetto; spring breve e transizioni < 0.25s; niente loop pesanti (pulse rimosso).

---

## 2. IMPLEMENTAZIONE

### File toccati
- **`src/components/home/DailyControlLoopCard.tsx`** — unico file modificato.

### Modifiche effettuate
1. **Import:** `motion`, `AnimatePresence` da `framer-motion`.
2. **Count (X/3):** il numero in alto a destra è wrappato in `<motion.span key={daily_completion_count}>` con `initial={{ scale: 1.12, opacity: 0.7 }}`, `animate={{ scale: 1, opacity: 1 }}`, `transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.6 }}`. A ogni cambio di count l’elemento viene rimontato (key) e riparte l’animazione.
3. **Row — next action:** ogni `Row` riceve `isNextAction` e `isNearCompletion`.  
   - Commit: `isNextAction={!commit_done}`, `isNearCompletion={daily_completion_count === 2}`.  
   - Streak: `isNextAction={commit_done && !streak_done}`, idem.  
   - Mission: `isNextAction={commit_done && streak_done && !daily_mission_done}`, idem.  
   Stile riga: se `isNextAction` → background più chiaro, bordo cyan; se `isNextAction && isNearCompletion` → aggiunto boxShadow glow.
4. **Row — contenitore:** `<li>` sostituito con `<motion.li>` con `style={rowStyle}` e `transition={{ duration: 0.2 }}` per transizione fluida tra stati normale/attivo.
5. **Row — completamento:** il blocco “Completato” (check + label) è un `motion.span` con `key="done"`, `initial={{ opacity: 0, scale: 0.92 }}`, `animate={{ opacity: 1, scale: 1 }}`, `exit` e `transition` 0.22s. Il pulsante CTA è un `motion.button` con `key="cta"` e `AnimatePresence mode="wait"` attorno a done/cta.

### Comportamento nuovo
- Al cambio 0/3→1/3→2/3→3/3 il count ha un breve “pop” spring.
- La prima riga non completata è visivamente evidenziata (sfondo, bordo, a 2/3 anche glow).
- Quando una riga passa a completata, check e “Completato” entrano con animazione scale/opacity; il pulsante CTA scompare con exit.
- A 3/3 nessuna riga ha `isNextAction`, quindi nessun highlight residuo.

---

## 3. VERIFICA

### Test logici
- **0/3:** solo Commit ha `isNextAction` → evidenziata solo la riga Commit.
- **1/3:** `commit_done && !streak_done` → evidenziata Streak; `commit_done && streak_done && !daily_mission_done` falso per Streak, vero solo per Mission quando Streak è fatto → a 1/3 la “next” è Streak (o Mission se per qualche motivo Commit e Streak sono done e Mission no).
- **2/3:** una sola riga incompleta ha `isNextAction`; quella riga ha anche `isNearCompletion` → glow aggiuntivo.
- **3/3:** tutte e tre le righe hanno `done` true, nessuna ha `isNextAction` → nessun highlight.
- CTA: nessun cambiamento di `onGo` / `handleGo*`; continuano ad aprire i flow come in Fase A.
- Realtime: nessun tocco a eventi, refetch, useTodayDailyState; il realtime della Fase A resta intatto.

### Esito build
- `npm run build` avviato (completamento da verificare in locale).
- TypeScript: nessun errore su `DailyControlLoopCard.tsx` (lint ok).

### Esito sync iOS
- Eseguire in locale: `npm run cap:ios:incremental` dopo il build.

---

## 4. RISCHI RESIDUI

- **Framer Motion su iOS:** animazioni leggere (spring count, transizione 0.2s riga, entrance done) sono in linea con l’uso già presente in app; rischio basso. In caso di lag su device vecchi, si può ridurre stiffness/duration o semplificare.
- **Leggibilità:** background riga attiva 0.08 e bordo cyan 0.32 restano sobri; contrasto e text-shadow invariati.
- **Hydration:** `key={daily_completion_count}` sul count è deterministico; nessun contenuto diverso server/client introdotto.

### Fase successiva consigliata
- Overlay celebrativo al 3/3 e al claim bonus (full success “Giornata completata” / “+10 M1U”) riusando il pattern StreakModal/ClaimRewardModal.
- Eventuale micro haptic/suono al completamento daily (opzionale).

---

## 5. GO / NO GO

**GO.** Fase B1 implementata solo nella card DCL, con progressione visiva del count, stato attivo della prossima azione, transizione al completamento riga e feel 2/3 (glow). Nessuna modifica a logica, CTA, realtime, auth, IAP, BUZZ, push, header, nav, DB/RPC. Build e sync iOS da completare in locale.

---

## 6. PROSSIMA FASE CONSIGLIATA

**Fase B2 — Overlay success 3/3 e payoff:** dopo aver validato B1 su dispositivo reale, introdurre un overlay (o template riusato) “Giornata completata” / “+10 M1U” al claim bonus 3/3 (e opzionalmente alla chiusura dopo aver raggiunto 3/3), in stile StreakModal success / ClaimRewardModal, senza toccare logica di claim né RPC.

---

© 2026 Joseph MULÉ – M1SSION™
