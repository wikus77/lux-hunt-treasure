# Apple 5.1.1(v) — Account Deletion: sostituzione mailto con self-service in-app

**Data:** 2026-02-26  
**Target:** iOS Capacitor (WKWebView)  
**Firma:** Lovable Agent JLENIA

---

## 1) Commit hash + tag rollback

- **Commit hash:** `abfcf007b8e2776d78b9ee39bfec269a9b348b77`
- **Tag rollback:** `safety/apple-account-deletion-ui-20260226_114417`

**Rollback immediato:**
```bash
git reset --hard safety/apple-account-deletion-ui-20260226_114417
```

---

## 2) Report FASE 1 — File e righe dei due mailto rimossi

### Pulsanti mailto “Request Account Deletion” (eliminati)

| File | Righe (pre-patch) | Handler | Cosa faceva |
|------|-------------------|---------|-------------|
| **SettingsContent.tsx** | 65–76 (handler), 277–305 (UI) | `handleRequestAccountDeletion` | Apreva `mailto:contact@m1ssion.com` con subject “Account deletion request — M1SSION” e body con email/user_id. |
| **LegalSectionContent.tsx** | 65–76 (handler), 184–212 (UI) | `handleRequestAccountDeletion` | Stesso mailto. |

**Prove:** grep su `handleRequestAccountDeletion`, `request_account_deletion_cta`, `mailto:contact@m1ssion.com` → match in questi due file.

### LegalSettings.tsx — invoke delete-account

- **File:** `src/pages/settings/LegalSettings.tsx`
- **Riga ~97:** `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer ... } })`
- **Stato:** già invoca la Edge `delete-account` (confermato in FASE 1).

### Edge function delete-account

- **Path:** `supabase/functions/delete-account/index.ts`
- **Presente in repo:** sì.
- **Nome function:** `delete-account`.
- **Comportamento:** verifica JWT → user_id da token → pulizia storage avatars → delete su tabelle public → `auth.admin.deleteUser(user_id)`. Service Role solo server-side; nessun step email.

---

## 3) Diff patch (solo file in-scope)

### File modificati

| File | Modifica |
|------|----------|
| **src/components/settings/SettingsContent.tsx** | Aggiunti import: useToast, AlertDialog (e sotto-componenti), supabase. Sostituito `handleRequestAccountDeletion` (mailto) con `handleConfirmDeleteAccount` (invoke delete-account + signOut + redirect). Danger Zone: descrizione da `request_account_deletion_desc` a `delete_account_desc_in_app`; bottone wrappato in AlertDialog con conferma “Delete Account” e azione invoke. |
| **src/components/settings/sections/LegalSectionContent.tsx** | Stessa logica: useToast, AlertDialog, supabase; `handleRequestAccountDeletion` → `handleConfirmDeleteAccount`; Danger Zone con AlertDialog e copy “Delete Account” / desc in-app. |
| **src/locales/en/common.json** | Aggiunte chiavi: `delete_account_desc_in_app`, `delete_account_confirm_title`, `delete_account_confirm_message`. |
| **src/locales/it/common.json** | Stesse chiavi (IT). |
| **src/locales/fr/common.json** | Stesse chiavi (FR). |

### Comportamento post-patch

- **Settings → Danger Zone:** bottone “Delete Account Permanently” → apre AlertDialog (titolo “Delete Account”, messaggio “This action permanently…”) → Cancel / Delete. Su Delete: `supabase.functions.invoke('delete-account')` → success: signOut, localStorage.clear, redirect `/login`; errore: toast.
- **Legal (sezione) → Danger Zone:** identico.
- **LegalSettings.tsx:** invariato (già invoke delete-account).
- Nessun percorso “account deletion” visibile in review usa più mailto.

---

## 4) Checklist test FASE 4 (da eseguire su iPhone + iPad)

| # | Verifica | Esito |
|---|----------|--------|
| 1 | Creare account test | DA ESEGUIRE |
| 2 | Settings → Danger Zone → Delete Account → Conferma → deve cancellare e sloggare, tornare a login | DA ESEGUIRE |
| 3 | Tentativo login stesso account → deve fallire (utente auth eliminato) | DA ESEGUIRE |
| 4 | Ripetere da Legal → Danger Zone → Delete Account → Conferma | DA ESEGUIRE |
| 5 | iPad: nessun crash, freeze, loop | DA ESEGUIRE |

**Se un test fallisce:** rollback al tag `safety/apple-account-deletion-ui-20260226_114417`.

---

## 5) Comando rollback (pronto)

```bash
git reset --hard safety/apple-account-deletion-ui-20260226_114417
```

Poi: build + sync Capacitor se necessario per ripristinare la versione precedente sull’app.

---

FINE REPORT
