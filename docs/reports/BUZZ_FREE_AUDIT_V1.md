# BUZZ FREE AUDIT V1

**Data:** 2026-02-07  
**Autore:** AI Audit  
**Problema:** Utente vede 2 BUZZ gratuiti invece di 1

---

## 1. ANALISI STRUTTURA CODICE

### 1.1 Decision Points identificati

| Decision Point | File | Condizione | Variabile | Sorgente Dati |
|----------------|------|------------|-----------|---------------|
| Tier Free Buzz | `src/hooks/useTierFreeBuzz.ts` | `freeBuzzRemaining > 0` | `hasTierFreeBuzz` | `user_buzz_weekly` table |
| Grant Free Buzz | `src/hooks/useBuzzGrants.ts` | `totalRemaining > 0 && !dailyUsed` | `hasGrantFreeBuzz` | `buzz_grants` table |
| Combined | `src/components/buzz/BuzzActionButton.tsx:98` | `hasTierFreeBuzz \|\| hasGrantFreeBuzz` | `hasAnyFreeBuzz` | Combinazione |

### 1.2 Configurazione Limiti

Da `src/config/tierLimits.ts`:

```typescript
export const FREE_BUZZ_WEEKLY_BY_TIER: Record<UserTier, number> = {
  base: 1,      // 1/SETTIMANA (non giorno!)
  silver: 3,
  gold: 4,
  black: 5,
  titanium: 7,
};
```

**NOTA CRITICA:** Il limite è **1 a SETTIMANA** per tier `base`, NON 1 al giorno.

---

## 2. IPOTESI SUL BUG "2 GRATIS"

### ✅ IPOTESI PRIMARIA: DUE FONTI INDIPENDENTI

Il sistema combina **DUE fonti separate** di BUZZ gratuiti:

1. **`useTierFreeBuzz`** - BUZZ gratuiti **settimanali** basati sul tier
   - Sorgente: tabella `user_buzz_weekly`
   - Reset: settimanale (Lunedì)
   - Limite base: 1/settimana

2. **`useBuzzGrants`** - BUZZ gratuiti da **premi/ricompense**
   - Sorgente: tabella `buzz_grants`
   - Nessun reset automatico
   - Accumulo da QR, XP, marker, etc.

**Combinazione:**
```typescript
const hasAnyFreeBuzz = hasTierFreeBuzz || hasGrantFreeBuzz;
```

Se l'utente ha:
- 1 buzz gratuito settimanale (tier) NON usato
- 1+ buzz gratuiti da premi (grants)

→ Vedrà **entrambi** come "GRATIS" consecutivamente!

### ⚠️ IPOTESI SECONDARIE (da verificare):

| # | Ipotesi | Probabilità | File da verificare |
|---|---------|-------------|-------------------|
| 2 | Reset giornaliero errato in `useBuzzGrants.dailyUsed` | Media | `useBuzzGrants.ts:97-101` |
| 3 | `dailyUsed` flag non viene settato correttamente | Media | `useBuzzGrants.ts:217` |
| 4 | Timezone mismatch (UTC vs Europe/Rome) | Bassa | `useTierFreeBuzz.ts:39-46` |
| 5 | Race condition tra consumo e refresh stato | Bassa | `useBuzzGrants.ts:221` |

---

## 3. FLUSSO DETTAGLIATO

### 3.1 Primo TAP (GRATIS)

```
handleAction() 
  ├── hasTierFreeBuzz = TRUE (1 remaining)
  ├── hasGrantFreeBuzz = TRUE (grants remaining > 0)
  ├── hasAnyFreeBuzz = TRUE
  │
  └── DECISION: "1️⃣ TIER FREE"
      └── consumeTierFreeBuzz()
          └── upsert user_buzz_weekly.free_buzz_used = 1
```

### 3.2 Secondo TAP (GRATIS - IL BUG)

```
handleAction()
  ├── hasTierFreeBuzz = FALSE (0 remaining ora)
  ├── hasGrantFreeBuzz = TRUE (grants ancora disponibili!)
  ├── hasAnyFreeBuzz = TRUE   ← ⚠️ ANCORA TRUE!
  │
  └── DECISION: "2️⃣ GRANT FREE"
      └── consumeGrantFreeBuzz()
          └── update buzz_grants.remaining -= 1
```

**Conclusione:** Non è un bug, è il **design intenzionale** che combina due fonti.

---

## 4. PUNTI DI INTERVENTO (NON IMPLEMENTATI)

Se si vuole limitare a **1 solo BUZZ gratuito al giorno** totale:

| # | Intervento | File | Descrizione |
|---|------------|------|-------------|
| 1 | Unified daily counter | `useBuzzGrants.ts` | Aggiungere flag `dailyFreeUsed` che blocca ENTRAMBE le fonti |
| 2 | Priority lock | `BuzzActionButton.tsx` | Dopo uso tier free, impostare flag che blocca grants per 24h |
| 3 | Database constraint | Migration SQL | Aggiungere check `max_free_per_day = 1` cross-table |

---

## 5. LOG DI AUDIT AGGIUNTI

In `BuzzActionButton.tsx` sono stati aggiunti log dettagliati:

```
╔══════════════════════════════════════════════════════════════════╗
║           🔍 BUZZ FREE AUDIT - DECISION POINT                    ║
╚══════════════════════════════════════════════════════════════════╝
📅 Timestamp: 2026-02-07T...
📅 Local (Rome): 07/02/2026 ...

┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  TIER FREE BUZZ (settimanale)                                │
├─────────────────────────────────────────────────────────────────┤
│ userTier: base
│ tierWeeklyLimit: 1
│ tierFreeBuzzRemaining: X
│ hasTierFreeBuzz: true/false
│ SOURCE: user_buzz_weekly table (week_start)
└─────────────────────────────────────────────────────────────────┘
...
```

---

## 6. CONCLUSIONE

### Causa principale identificata:

> **Due fonti indipendenti (`tierFreeBuzz` + `buzzGrants`) vengono combinate con OR logico,
> permettendo di fatto N+M BUZZ gratuiti (dove N = tier settimanali, M = grants accumulati).**

### Azione richiesta:

Se il requisito è **1 solo BUZZ gratuito totale al giorno**, serve una modifica alla logica
che introduca un **contatore giornaliero unificato** che blocchi entrambe le fonti dopo il primo uso.

**Questo report NON implementa fix. Fornisce solo analisi e audit logs.**

---

## 7. FILES MODIFICATI (SOLO HAPTIC + AUDIT)

- `src/components/buzz/BuzzActionButton.tsx`
  - ✅ Aggiunto haptic feedback su button press
  - ✅ Aggiunto audit logs dettagliati in DEV mode
- `docs/reports/BUZZ_FREE_AUDIT_V1.md` (questo file)

**ZERO modifiche a logiche, contatori, tabelle, edge functions.**

---

*© 2026 M1SSION™ - NIYVORA KFT*
