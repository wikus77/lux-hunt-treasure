# REPORT FIX — "DailyControlLoop non disponibile" (iOS)

**Data:** 2026-03-19  
**Progetto:** M1SSION™ — App nativa wrappata iOS (Capacitor WKWebView)

---

## 1. FORENSICS REPORT

### Causa primaria
**ReferenceError: Cannot access 'fetchBonusClaimed' before initialization** in `src/hooks/useTodayDailyState.ts`.  
`refetch` era dichiarato con `useCallback` **prima** di `fetchBonusClaimed` e `fetchWeeklyProgress`, ma li usava nel body e nell’array di dipendenze. Alla prima esecuzione del hook React legge quelle dipendenze quando i due callback non sono ancora inizializzati → Temporal Dead Zone → ReferenceError. Il SectionErrorBoundary cattura l’errore e mostra "DailyControlLoop non disponibile".

### Cause secondarie
Nessuna. Log Xcode univoco.

### Evidenze
- Xcode: `[SectionError:DailyControlLoop] Cannot access 'fetchBonusClaimed' before initialization.`
- Ordine nel codice: `refetch` (righe ~89–91) usava `fetchBonusClaimed` e `fetchWeeklyProgress` dichiarati più sotto (righe ~111–142).

### File coinvolto
- `src/hooks/useTodayDailyState.ts`

### Blocco che lancia
- Creazione di `refetch` (useCallback) con dipendenze `[..., fetchBonusClaimed, fetchWeeklyProgress]` mentre `fetchBonusClaimed` e `fetchWeeklyProgress` non sono ancora stati dichiarati.

### Spiegazione tecnica
In JavaScript, una variabile dichiarata con `const`/`let` non è utilizzabile tra l’inizio del blocco e la riga di dichiarazione (Temporal Dead Zone). Qui il callback `refetch` e il suo array di dipendenze facevano riferimento a due callback dichiarati più sotto nello stesso componente → al primo render il motore lancia ReferenceError. Spostando le dichiarazioni dei due callback sopra `refetch`, al momento della creazione di `refetch` i binding esistono già e l’errore scompare.

---

## 2. SQL / BACKEND STATUS

- **Serve applicare SQL per far vedere la card?** No. Il problema era solo l’ordine nel hook.
- **Senza migration:** card visibile, 0/3, CTA, commit/streak/mission; bonus claim e weekly 7/7 non funzionano (RPC assenti) ma non fanno crash.
- **Con migration:** claim bonus 3/3 e progresso settimanale funzionano.
- **La card base deve apparire anche senza migration?** Sì. Il fix è solo l’ordine delle dichiarazioni; le RPC sono già gestite in try/catch e non devono mai far cadere la card.

---

## 3. FIX REPORT

### File modificato
- **src/hooks/useTodayDailyState.ts**

### Modifica
- Dichiarazioni di `fetchBonusClaimed` e `fetchWeeklyProgress` spostate **sopra** la dichiarazione di `refetch`, mantenendo invariati body e dipendenze di tutti i useCallback e useEffects.

### Perché è safe
- Solo riordino di dichiarazioni nello stesso file; nessun cambio di logica, nessuna nuova dipendenza, nessun tocco a RPC/i18n/reminder/UI.
- Comportamento di commit, streak, mission, bonus e weekly resta identico; sparisce solo il ReferenceError.

### Cosa non è stato toccato
- AppHome, DailyControlLoopCard, useDailyControlLoopReminder, SectionErrorBoundary, i18n, migration SQL, RPC, login/IAP/BUZZ/push/routing, altri componenti Home.

---

## 4. BUILD REPORT

Eseguire in locale:

```bash
npm run build
npm run cap:ios:incremental
```

Verificare che il build termini senza errori e che il sync iOS aggiorni il progetto Xcode.

---

## 5. TEST PLAN IPHONE

### Card di nuovo visibile
- Aprire l’app, andare in Home.  
- **Atteso:** La card "Le 3 azioni di oggi" è visibile (titolo, X/3, righe Commit / Streak / Missione, CTA). Nessun fallback "DailyControlLoop non disponibile".

### Bonus 3/3 (se migration applicata)
- Completare Commit, Streak e Missione, premere "Riscatta bonus".  
- **Atteso:** Toast di successo, stato "Bonus riscattato", nessun crash.

### Weekly 7/7 (se migration applicata)
- Controllare la riga "Settimana X/7" sotto le tre azioni.  
- **Atteso:** Conteggio coerente con i giorni in cui hai fatto 3/3 in settimana.

### Reminder
- Con 1/3 o 2/3, lasciare l’app aperta fino alle 19:45 (o simulare).  
- **Atteso:** Nessun crash; notifica eventuale in base a permessi e ambiente.

### Messaggio M1U/BUZZ
- Con 3/3 completato, controllare il testo sotto la card.  
- **Atteso:** Messaggio tipo "Usa le M1U per il BUZZ" o "Continua a costruire le tue risorse" in base al saldo M1U, senza crash.

---

© 2026 Joseph MULÉ – M1SSION™
