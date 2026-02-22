# Danger Zone → Request Account Deletion (mailto) — Patch Report

**Data:** 2026-02-22  
**Scope:** Conversione CTA da "Delete Account Permanently" a "Request Account Deletion" via mailto. Nessuna modifica a logiche delete, DB, Edge Functions.

---

## 1) Rollback safety

- **Tag creato:** `safety/request-account-deletion-before-20260222_1500`
- **Messaggio:** `rollback before Danger Zone -> Request Account Deletion mailto`
- **Rollback immediato (se necessario):**
  ```bash
  git reset --hard safety/request-account-deletion-before-20260222_1500
  ```
- Poi eventuale `npm run build` e `npx cap sync ios` dopo rollback.

---

## 2) File modificati

| File | Modifiche |
|------|-----------|
| `src/components/settings/SettingsContent.tsx` | Rimossi: `handleDeleteAccount`, stato `showDeleteConfirm`/`deleteLoading`, import `supabase`, `useToast`, `AlertTriangle`. Aggiunto: `handleRequestAccountDeletion` (mailto). Danger Zone: descrizione → `request_account_deletion_desc`, CTA unico → `request_account_deletion_cta`, nessun step di conferma delete. |
| `src/components/settings/sections/LegalSectionContent.tsx` | Stesso flusso: rimosso `handleDeleteAccount`, stato `loading`/`showDeleteConfirm`, import `supabase`, `useToast`, `AlertTriangle`, `Loader2`. Aggiunto `handleRequestAccountDeletion` (mailto). Card Delete Account sostituita con Request Account Deletion (stesse label i18n). |
| `src/locales/en/common.json` | Aggiunte chiavi: `request_account_deletion_desc`, `request_account_deletion_cta`. |
| `src/locales/it/common.json` | Idem (IT). |
| `src/locales/fr/common.json` | Idem (FR). |

---

## 3) Comportamento mailto

- **To:** `contact@m1ssion.com`
- **Subject:** `Account deletion request — M1SSION`
- **Body (EN, precompilato):**
  ```
  Hello,
  I would like to request the deletion of my M1SSION account and associated personal data.

  Account email: <user.email o (unknown)>
  User ID: <user.id o (unknown)>

  Please confirm the deletion and the estimated processing time.
  Thank you.
  ```
- **Apertura:** `window.location.href = mailtoUrl` (compatibile iOS WKWebView).
- **Encoding:** `encodeURIComponent` per subject e body.

---

## 4) Verifiche

- Nessuna chiamata Supabase delete eseguita dal CTA (handler delete rimossi dall’uso).
- "Delete Account Permanently" e copy "irreversible" non più mostrati; sostituiti da "Request account deletion via email" e "Request Account Deletion".
- Build: `npm run build` — **OK**.
- Lint: nessun errore sui file modificati.

---

## 5) Diff summary

- **SettingsContent:** ~50 righe modificate (rimozione flow delete + sostituzione con mailto).
- **LegalSectionContent:** ~50 righe modificate (stesso adattamento).
- **Locales:** +2 chiavi per lingua (EN/IT/FR).

---

## 6) Istruzione rollback

```bash
git reset --hard safety/request-account-deletion-before-20260222_1500
npm run build
npx cap sync ios
```

Fine report.
