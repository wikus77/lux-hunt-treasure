# Pre-patch audit — Welcome Bonus 500 → 150 + i18n

**Data:** 2026-02-20  
**Branch:** feature/welcome-bonus-150-safe  
**Tag rollback:** safety/welcome-bonus-before-150  

---

## Conferma doppia costante 500

| Posizione | File | Riga | Valore |
|-----------|------|------|--------|
| Client | `src/hooks/useWelcomeBonus.ts` | 19 | `const WELCOME_BONUS_AMOUNT = 500;` |
| Server | `supabase/functions/claim-welcome-bonus/index.ts` | 13 | `const WELCOME_BONUS_AMOUNT = 500;` |

Entrambe le costanti sono presenti e valorizzate a 500.

---

## Conferma assenza altri riferimenti

- **Ricerca in codice:** Nessun altro punto nel progetto usa 500 come importo del welcome bonus. Le occorrenze di "500" nei file sono: fontWeight, colori CSS, timeouts, altri contesti (admin_credit_m1u è chiamato con l’importo passato dalla function).
- **Env:** Nessuna variabile d’ambiente sovrascrive l’importo (nessun `WELCOME_BONUS_AMOUNT` o simile in .env o config).
- **RPC:** L’accredito avviene solo tramite `claim-welcome-bonus` che chiama `admin_credit_m1u` con la propria costante; non esistono altre RPC dedicate al welcome bonus.

---

## Conferma hardcoded IT in WelcomeBonusModal

- **useTranslation / t():** Il componente `WelcomeBonusModal.tsx` non importa `useTranslation` né usa `t()`. Tutte le stringhe sono literal in italiano nel JSX.
- **Stringhe hardcoded:** BENVENUTO IN M1SSION™, Ciao … La caccia al tesoro globale ti aspetta., BONUS DI BENVENUTO, Come regalo di benvenuto riceverai, per esplorare il gioco e iniziare la tua missione, BUONA CACCIA, ATTIVAZIONE..., ACCREDITO IN CORSO..., BONUS ATTIVATO!, Buona caccia, Agente!, fallback nome "Agente".

---

## Rischi identificati

- **Coerenza client/server:** Se si aggiorna solo il client a 150 e non la Edge Function, l’utente vedrebbe 150 ma riceverebbe 500 (o il contrario). Obbligatorio aggiornare entrambi.
- **i18n:** Aggiungere chiavi in en/it/fr e usare `t()` nel modal; verificare che non ci siano chiavi mancanti (fallback su chiave se locale non pronto).
- **Working tree:** Al momento dell’audit il working tree non era pulito (modifiche su sonner, delete-account, asset, report). Branch e tag sono stati creati da HEAD corrente. La patch tocca solo: useWelcomeBonus.ts, claim-welcome-bonus/index.ts, WelcomeBonusModal.tsx, locales (en/it/fr). Rollback: checkout del tag `safety/welcome-bonus-before-150` ripristina lo stato prima della patch; le altre modifiche non toccate restano come sono.

— Fine pre-patch audit —
