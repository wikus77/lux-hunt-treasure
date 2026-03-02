# Welcome Bonus 150 M1U + i18n — Patch Report

**Data:** 2026-02-20  
**Branch:** feature/welcome-bonus-150-safe  
**Tag rollback:** safety/welcome-bonus-before-150  

---

## 1. Conferma costanti aggiornate

| File | Modifica |
|------|----------|
| `src/hooks/useWelcomeBonus.ts` | `WELCOME_BONUS_AMOUNT`: 500 → **150** |
| `supabase/functions/claim-welcome-bonus/index.ts` | `WELCOME_BONUS_AMOUNT`: 500 → **150** |

Nessun altro file modificato per l’importo. Client e Edge Function sono allineati a 150 M1U.

---

## 2. Conferma i18n integrato

- **WelcomeBonusModal.tsx**
  - Aggiunto `import { useTranslation } from 'react-i18next'` e `const { t } = useTranslation()`.
  - Sostituite tutte le stringhe hardcoded con chiavi `welcome_bonus.*`:
    - `title`, `title_brand`, `greeting` (con `{{name}}`), `greeting_subtitle`, `badge`, `subtitle`, `description`, `cta`, `activating`, `crediting`, `completed`, `final_message`, `agent_default`.
  - Struttura JSX, animazioni e logica di claim invariati.

- **Locales**
  - **it** (`src/locales/it/common.json`): blocco `welcome_bonus` con testi IT originali.
  - **en** (`src/locales/en/common.json`): blocco `welcome_bonus` con traduzioni EN.
  - **fr** (`src/locales/fr/common.json`): blocco `welcome_bonus` con traduzioni FR.

Nessuna rimozione di chiavi esistenti; solo aggiunta del blocco `welcome_bonus`.

---

## 3. Test da eseguire (iOS device / simulatore)

- **Lingua iOS EN:** Impostare lingua dispositivo/simulatore in inglese → aprire modal bonus → verificare titolo “WELCOME TO M1SSION™”, badge “WELCOME BONUS”, CTA “HAPPY HUNTING”, messaggio finale “Happy hunting, Agent!”.
- **Lingua iOS FR:** Impostare francese → verificare “BIENVENUE DANS M1SSION™”, “BONUS DE BIENVENUE”, “BONNE CHASSE”, “Bonne chasse, Agent !”.
- **Fallback IT:** Locale italiano (o non EN/FR) → verificare testi in italiano.
- **Importo e accredito:** Nuovo utente → visualizzazione **150 M1U** nel modal; dopo claim, saldo M1U incrementato di **150** (verifica in DB o in UI saldo).

---

## 4. Regressioni

- Nessuna modifica ad AuthProvider, routing, layout globale, stacking, login, altre logiche M1U, altre Edge Functions, schema DB.
- Lint: gli eventuali errori su `welcome_bonus_claimed` in `useWelcomeBonus.ts` sono preesistenti (colonna profili) e non introdotti da questa patch.

---

## 5. Rollback

- **Comando:**  
  `git checkout safety/welcome-bonus-before-150`
- Poi ripristinare il branch principale desiderato.
- Ridistribuire la Edge Function `claim-welcome-bonus` dalla versione precedente (150 → 500 se necessario).
- Tempo stimato: < 2 minuti.

---

## 6. Deploy Edge Function

Ridispiegare **solo** la function:

```bash
supabase functions deploy claim-welcome-bonus
```

Nessun’altra function modificata.

---

## Riepilogo file toccati

| File | Tipo modifica |
|------|----------------|
| `src/hooks/useWelcomeBonus.ts` | Costante 500 → 150 |
| `supabase/functions/claim-welcome-bonus/index.ts` | Costante 500 → 150 |
| `src/components/welcome/WelcomeBonusModal.tsx` | i18n (useTranslation + t()) |
| `src/locales/it/common.json` | Aggiunto blocco `welcome_bonus` |
| `src/locales/en/common.json` | Aggiunto blocco `welcome_bonus` |
| `src/locales/fr/common.json` | Aggiunto blocco `welcome_bonus` |
| `reports/PRE_PATCH_WELCOME_BONUS_AUDIT.md` | Report pre-patch |
| `reports/WELCOME_BONUS_150_PATCH_REPORT.md` | Questo report |

— Fine report —
