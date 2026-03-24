# FORENSICS REPORT — "DailyControlLoop non disponibile" (SectionErrorBoundary)

**Data:** 2026-03-19  
**Progetto:** M1SSION™ — App nativa wrappata iOS (Capacitor WKWebView)  
**Sintomo:** Al posto della card Daily Control Loop appare il fallback "DailyControlLoop non disponibile" (SectionErrorBoundary).  
**Evidenza da Xcode:** `[SectionError:DailyControlLoop] Cannot access 'fetchBonusClaimed' before initialization.`

---

## 1. CAUSA PRIMARIA

**ReferenceError: Cannot access 'fetchBonusClaimed' before initialization**

- **File:** `src/hooks/useTodayDailyState.ts`
- **Meccanismo:** In JavaScript/React, `refetch` era dichiarato con `useCallback` **prima** di `fetchBonusClaimed` e `fetchWeeklyProgress`, ma nel body e nell’array di dipendenze di `refetch` venivano usati proprio `fetchBonusClaimed` e `fetchWeeklyProgress`.
- In fase di esecuzione del hook, quando React valuta l’array di dipendenze di `refetch`, deve leggere `fetchBonusClaimed` e `fetchWeeklyProgress`; in quel momento le costanti non sono ancora state inizializzate (sono dichiarate più sotto con `const`), quindi si entra nella **Temporal Dead Zone** e il motore lancia `ReferenceError: Cannot access 'fetchBonusClaimed' before initialization`.
- L’eccezione viene catturata dal `SectionErrorBoundary` che avvolge la card → messaggio "DailyControlLoop non disponibile".

**Righe coinvolte (prima del fix):**
- Riga ~89–91: definizione di `refetch` che usa `fetchBonusClaimed` e `fetchWeeklyProgress`.
- Righe ~111–142: definizione di `fetchBonusClaimed` e `fetchWeeklyProgress` **sotto** `refetch`.

---

## 2. CAUSE SECONDARIE

Nessuna. Il log di Xcode individua in modo univoco l’errore di ordine di dichiarazione nel hook.

---

## 3. EVIDENZE

- Log Xcode: `[SectionError:DailyControlLoop] Cannot access 'fetchBonusClaimed' before initialization.`
- Ordine nel file: `refetch` (con dipendenze che citano `fetchBonusClaimed` e `fetchWeeklyProgress`) era dichiarato prima delle due callback.
- Comportamento JS: uso di un binding `const` prima della sua inizializzazione nella stessa esecuzione di funzione → ReferenceError (Temporal Dead Zone).

---

## 4. SQL / BACKEND

- **Serve applicare la migration SQL per far apparire la card?** No. L’errore è solo l’ordine delle dichiarazioni nel hook; non dipende da RPC o DB.
- **Cosa funziona senza migration:** commit/streak, mission, conteggio 0/3, CTA, UI base. Le RPC bonus/weekly sono già in try/catch e degradano (es. `claimed: false`, `count: 0`).
- **Cosa non funziona senza migration:** claim bonus 3/3 e conteggio settimanale 7/7 (le RPC non esistono).
- **La card base deve poter apparire anche senza migration?** Sì. Con il fix di ordine il hook non lancia più; la card renderizza anche se le RPC bonus/weekly non sono ancora deployate.

---

## 5. FIX APPLICATO

- **File:** `src/hooks/useTodayDailyState.ts`
- **Modifica:** Spostate le dichiarazioni di `fetchBonusClaimed` e `fetchWeeklyProgress` **sopra** la dichiarazione di `refetch`, così quando `refetch` viene creato i due callback sono già definiti e non si va in Temporal Dead Zone.
- **Nessun altro file modificato.** Nessun cambiamento a logica, RPC, i18n, reminder, AppHome, SectionErrorBoundary.

---

© 2026 Joseph MULÉ – M1SSION™
