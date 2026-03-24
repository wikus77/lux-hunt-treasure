# Forensics — Sincronizzazione audio COMMIT BOOM nel Commit giornaliero M1SSION™

**Data:** 2026-03-15  
**Tipo:** Read-only, nessuna modifica al codice  
**Scope:** App nativa wrappata iOS / Capacitor WKWebView  
**Problema osservato:** Il file audio COMMIT BOOM non parte sincronizzato; il suono arriva molto dopo la chiusura del rituale.

---

## 1. File audio effettivamente usato

| Campo | Valore |
|--------|--------|
| **Path nel codice** | `/assets/audio/commit-boom.mp3` |
| **Path fisico** | `public/assets/audio/commit-boom.mp3` |
| **Nome normalizzato** | `commit-boom.mp3` (minuscolo, trattino; non "COMMIT BOOM.mp3") |
| **Riferimento** | `CommitModal.tsx` righe 56-58: `new Audio('/assets/audio/commit-boom.mp3')` |
| **Dimensione file** | 334 701 byte (~327 KB) |

Il progetto usa il file normalizzato in `public/assets/audio/`. Non è referenziato alcun path con spazi o "COMMIT BOOM.mp3".

---

## 2. Durata reale del file audio

- **Fonte dichiarata:** ~4 secondi (fornita in fase di integrazione).
- **Verifica:** La durata esatta andrebbe misurata con `ffprobe` o tool equivalente (es. `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/assets/audio/commit-boom.mp3`). Non è stata eseguita misura strumentale in questa forensics.
- **Stima:** **~4 s** (da considerare confermata solo dopo misura).

---

## 3. Durata reale della sequenza Commit

Timeline ricavata dal codice (valori espliciti in ms).

| Fase | Inizio | Fine | Durata | Note |
|------|--------|------|--------|------|
| Apertura modale | tap pill | overlay visibile | ~250–400 ms | Backdrop + spring panel (CommitFlipOverlay) |
| Checking | apertura | `ready` | variabile | RPC `check_commit_ritual_status` |
| Hold rituale | pointer down | successo | **7000 ms** | `TOTAL_DURATION_MS`, `PHASE3_END` |
| Successo (completing) | 7000 ms | — | 0 ms (istante) | `elapsed >= PHASE3_END` → blocco `completing` |
| Implosion + flash | 7000 ms | 7400 ms | **400 ms** | CSS `.commit-implosion` 400 ms, `.commit-flash` 350 ms |
| Testo "ACCETTATO." | 7400 ms | — | — | `setTimeout(..., 400)` da 7000 ms |
| RPC + transizione reward | 7000 ms | variabile | ~200–1000+ ms | `handleComplete` async, `setState('reward')` |
| Reward visibile | dopo RPC | auto-close | **4000 ms** | `setTimeout(() => onClose(), 4000)` in CommitModal |
| Chiusura overlay | onClose | fine | **280 ms** | CommitFlipOverlay `setTimeout(..., 280)` |

**Finestra utile per sincronizzare il suono:** da **7000 ms** (istante di successo) a **7400 ms** (fine implosion/flash). L’apice dell’effetto visivo è in questa finestra di **400 ms**.

**Durata complessiva UX dal tap sulla pill fino alla chiusura:**  
~7 s (hold) + ~0,4 s (implosion) + tempo RPC + 4 s (reward) + 0,28 s (chiusura) ≈ **~11,7 s** (senza contare checking e apertura).

---

## 4. Punto esatto del trigger audio nel codice

| Livello | Dettaglio |
|--------|-----------|
| **File** | `src/components/commit/CommitRitual.tsx` |
| **Funzione** | `animate` (callback del loop `requestAnimationFrame`) |
| **Blocco** | `else if (currentPhase === 'completing')` |
| **Riga** | Subito dopo `triggerHaptic(ImpactStyle.Medium);` → **`onPlaySuccessSound?.();`** |

Flusso:

1. **Istanziazione e preload:**  
   `CommitModal.tsx` — `useEffect(() => { ... }, [])`: crea `new Audio('/assets/audio/commit-boom.mp3')`, imposta `preload = 'auto'`, `volume = 0.9`, e lo salva in `commitBoomAudio.current`. Eseguito al **mount** di `CommitModal` (che è sempre montato quando è renderizzato `CommitNodeTrigger`).

2. **Callback di play:**  
   `CommitModal.tsx` — `playCommitBoom`: imposta `currentTime = 0` e chiama `play().catch(() => {})` sull’istanza in ref.

3. **Passaggio al rituale:**  
   `CommitModal` passa `onPlaySuccessSound={playCommitBoom}` a `CommitRitual` (stati `ready` / `processing` / `result`).

4. **Invoco del trigger:**  
   In `CommitRitual`, dentro il callback `animate` (invocato da **requestAnimationFrame**), quando `elapsed >= PHASE3_END` (7000 ms) si entra in `currentPhase === 'completing'` e viene chiamato **`onPlaySuccessSound?.()`** nello stesso tick del frame.

Quindi l’audio viene triggerato **nel momento del successo (completing)**, nello stesso blocco di implosion/flash e haptic, ma **all’interno di un callback rAF**, non in un event handler diretto di input (es. pointer/click).

---

## 5. Motivo del ritardo percepito

### 5.1 Causa principale: contesto “user gesture” su iOS WKWebView

- `play()` viene chiamato **dentro il callback di `requestAnimationFrame`**, a **~7 secondi** dal `pointerdown` che ha avviato il hold.
- Su iOS (Safari / WKWebView), la riproduzione audio programmatica è consentita in modo affidabile solo quando è **“in risposta a un user gesture”**. Dopo diversi secondi e dopo aver attraversato il task queue (incluso rAF), il browser spesso **non** considera più la `play()` come legata a quel gesture.
- Effetto tipico: la `play()` viene **ritardata o messa in coda** e l’audio parte in ritardo (es. dopo la chiusura del modale o al successivo gesto), in linea con “il suono arriva molto dopo / solo dopo che il rituale si chiude”.

### 5.2 Causa secondaria: nessun “unlock” dell’audio al gesture

- L’istanza `Audio` viene creata e preloadata al mount di `CommitModal`, ma **non** viene mai “sbloccata” con una `play()` (seguita eventualmente da `pause()`) in risposta a un evento diretto dell’utente (es. `pointerdown` sul cerchio).
- Su iOS, un primo `play()` in risposta al tocco sblocca l’elemento audio per successive `play()` programmatiche. Senza questo passaggio, la prima `play()` “utile” (quella a 7 s) è proprio quella che il browser può decidere di ritardare.

### 5.3 Contributo WKWebView / ambiente nativo

- In WKWebView le policy audio sono spesso ancora più restrittive che su Safari desktop.
- Decoding e buffering del file (~4 s, ~327 KB) possono aggiungere qualche ritardo alla prima riproduzione, ma il comportamento descritto (“suono molto dopo / dopo la chiusura”) è coerente soprattutto con il **defer della play per mancanza di user gesture**, non con un semplice ritardo di decodifica.

---

## 6. Come sincronizzarlo correttamente

- **Istante in cui il suono deve partire:** esattamente al **successo del rituale**, cioè a **7000 ms** dal pointer down, in sync con implosion, flash e haptic Medium. Il punto attuale nel codice (blocco `completing`) è quindi **concettualmente corretto**; il problema è **quando** viene effettivamente eseguita la `play()` rispetto alle policy iOS.
- **Cosa fare (senza applicare patch in questa forensics):**
  1. **Sbloccare l’audio al gesture:** alla **press start** del rituale (es. in `handlePressStart` in `CommitRitual` o in un handler di `pointerdown` sul cerchio), nello stesso contesto del gesture, eseguire una volta su un’istanza condivisa: `play()` seguito da `pause()` (e `currentTime = 0` se serve). Questo “unlock” va fatto nel componente che detiene il ref (o riceve una callback dal padre che detiene il ref), in risposta diretta al pointer event.
  2. **Mantenere il trigger a 7 s:** a **completing** continuare a chiamare `onPlaySuccessSound()` (come oggi); con l’audio già sbloccato, la `play()` a 7 s dovrebbe essere eseguita senza (o con minore) ritardo da parte del browser.
  3. **Preload invariato:** mantenere creazione e preload in `CommitModal` al mount; eventualmente considerare di avviare il preload quando `isOpen` diventa true, per ritardare il caricamento alla prima apertura del modale (opzionale).
- **Durata del suono:** ~4 s è adatta a coprire implosion (400 ms) + reward (4 s) come coda cinematografica. Non è necessario tagliare il file per la sync; la correzione è sul **momento e sul contesto** della `play()`, non sulla lunghezza del file.
- **Non** spostare il trigger sulla reward o sulla chiusura: il payoff sonoro deve coincidere con l’istante di successo (7000 ms) e con l’implosion.

---

## 7. Verdetto finale

| Voce | Verdetto |
|------|----------|
| **Audio attuale (file)** | **Adatto** — path e nome corretti, durata ~4 s coerente con reward e coda. |
| **Trigger nel codice (punto logico)** | **Corretto** — chiamata a `onPlaySuccessSound()` nel blocco `completing`, stesso momento di haptic e implosion. |
| **Contesto di esecuzione della play()** | **Non adatto su iOS** — `play()` invocata da callback rAF a 7 s dal gesture → ritardo/defer da parte di WKWebView. |
| **Lunghezza consigliata del suono** | **3–5 s** — l’attuale ~4 s va bene; priorità è sincronizzare l’**attacco** con il completing (7000 ms) tramite unlock al gesture. |
| **Taglio/trim del file** | **Non necessario** per la sync; la correzione è sul contesto della `play()`. |

---

## Sintesi secca

- **Durata file audio:** ~4 s (da confermare con ffprobe su `public/assets/audio/commit-boom.mp3`).
- **Durata finestra utile Commit (sync):** 7000–7400 ms (400 ms di implosion/flash); reward 4 s; totale UX ~11,7 s.
- **Trigger attuale:** `CommitRitual.tsx`, funzione `animate`, blocco `currentPhase === 'completing'`, riga ~177: `onPlaySuccessSound?.()`, invocato da **requestAnimationFrame**.
- **Problema principale:** Su iOS WKWebView, `play()` chiamata da callback rAF a 7 s dal pointerdown non è più considerata “user gesture” → il browser ritarda la riproduzione.
- **Soluzione corretta:** “Sbloccare” l’audio con una `play()` (poi `pause()`) in risposta diretta al **pointerdown** sul cerchio (es. in `handlePressStart` o equivalente); mantenere il trigger `onPlaySuccessSound()` a 7000 ms nel blocco `completing`.
- **Il file attuale va bene** — nessun taglio necessario; durata ideale del suono Commit: **3–5 s** (l’attuale ~4 s è in range).

---

*Report forense read-only. Nessuna modifica al codice applicata. Solo analisi e conclusioni tecniche.*
