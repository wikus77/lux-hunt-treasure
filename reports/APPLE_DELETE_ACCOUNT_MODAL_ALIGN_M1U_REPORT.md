# Apple 5.1.1(v) — Delete Account modal allineato al modale M1U

**Data:** 2026-02-26  
**Target:** iOS Capacitor WKWebView  
**Firma:** Lovable Agent JLENIA

---

## 1) Commit hash + tag rollback

- **Commit hash:** `a63e587d1f02499f8008614c6ccebaa4349aa9bc`
- **Tag rollback:** `safety/delete-account-modal-align-20260226_162447`

**Rollback:**
```bash
git reset --hard safety/delete-account-modal-align-20260226_162447
```

---

## 2) Forensics

### Pill M1U — file e modale

- **Pill:** `src/features/m1u/M1UPill.tsx`  
  - Righe 204–210: `handleOpenRecharge(e)` imposta `shopOriginRect` e `setShowShopModal(true)`.  
  - Righe 217–228, 248–249: bottone Plus e click sulla pill chiamano `handleOpenRecharge(e)`.  
  - Righe 341–346: render di **M1UnitsShopModal** con `isOpen={showShopModal}`, `onClose`, `originRect={shopOriginRect}`.
- **Modale M1U:**  
  - **M1UnitsShopModal** (`src/components/m1units/M1UnitsShopModal.tsx`): usa **M1UShopFlipOverlay** + **M1UShopContent**.  
  - **M1UShopFlipOverlay** (`src/components/m1units/M1UShopFlipOverlay.tsx`): portal su `document.getElementById('m1-m1ushop-portal')` (creato su `document.body`), z-index container **999999**, backdrop **99998**, panel **99999**; stile Revolut (blur, spring scale da originRect).

### Delete Account — file e modale (pre-fix)

- **Bottone:**  
  - **SettingsContent.tsx:** righe 294–341 (Danger Zone): bottone “Delete Account Permanently” dentro **AlertDialog** (trigger + content).  
  - **LegalSectionContent.tsx:** righe 201–248: stesso pattern AlertDialog.
- **Modale usato:** **AlertDialog** (Radix) da `@/components/ui/alert-dialog`. Overlay/Content con z-index 100001/100002 (post-fix layering). Portal su body; stile e stack diversi da M1U (nessuna flip/scale da origin, aspetto “incastrato” rispetto al modale M1U).

### Regola di decisione

Il pill M1U usa un sistema modale proprietario (M1UShopFlipOverlay + portal + stesso z-index/stack). Delete Account deve usare lo **stesso tipo** di overlay (stesso stile/stack), non AlertDialog.

---

## 3) Patch applicata (file toccati, solo in-scope)

### Nuovi file

| File | Descrizione |
|------|-------------|
| **src/components/m1units/DeleteAccountFlipOverlay.tsx** | Overlay identico a M1UShopFlipOverlay: portal `m1-delete-account-portal`, z-index 99998/99999, backdrop blur, panel con spring scale da originRect. |
| **src/components/m1units/DeleteAccountModalContent.tsx** | Contenuto modale: titolo “Delete account permanently”, messaggi (irreversibile, account eliminato, GDPR, signed out), checkbox “I understand this is irreversible”, pulsanti Cancel / Delete account; loading durante invoke; chiamata `supabase.functions.invoke('delete-account')`, signOut, redirect. |
| **src/components/m1units/DeleteAccountModal.tsx** | Wrapper: DeleteAccountFlipOverlay + DeleteAccountModalContent (stessa interfaccia di M1UnitsShopModal: isOpen, onClose, originRect). |

### File modificati

| File | Modifica |
|------|----------|
| **src/components/settings/SettingsContent.tsx** | Rimosso AlertDialog e import; rimosso useToast, supabase, handleConfirmDeleteAccount, deleteLoading. Aggiunti state deleteModalOpen, deleteOriginRect e openDeleteModal(e) che imposta rect e apre modale. Bottone Danger Zone chiama openDeleteModal. Render di **DeleteAccountModal** con isOpen, onClose, originRect. |
| **src/components/settings/sections/LegalSectionContent.tsx** | Stesso adattamento: rimosso AlertDialog, useToast, supabase, handleConfirmDeleteAccount, deleteLoading; aggiunti deleteModalOpen, deleteOriginRect, openDeleteModal; bottone apre DeleteAccountModal; render di DeleteAccountModal. |
| **src/locales/en/common.json** | Aggiunte chiavi: delete_account_modal_title, delete_account_modal_irreversible, delete_account_modal_account_deleted, delete_account_modal_gdpr, delete_account_modal_signed_out, delete_account_modal_understand_checkbox, delete_account_modal_cta_delete. |
| **src/locales/it/common.json** | Stesse chiavi (IT). |
| **src/locales/fr/common.json** | Stesse chiavi (FR). |

### Diff sintetico

- Delete Account non usa più AlertDialog ma **DeleteAccountModal** (stesso pattern di M1U: FlipOverlay + Content).
- Copy modale: irreversibile, account eliminato, GDPR, signed out, checkbox “I understand”, CTA “Delete account” / “Cancel”.
- Backend invariato: `supabase.functions.invoke('delete-account')` + signOut + redirect.

---

## 4) Build + sync Capacitor (completato)

- **Build:** `npm run build` — completato (✓ built in ~1m 8s).
- **Sync:** `npx cap sync ios` — completato (web assets copiati in `ios/App/App/public`, pod install OK).

L’app iOS è pronta per il test su iPhone con il modale Delete Account allineato al M1U.

---

## 5) Test iPhone (da eseguire)

| # | Verifica | Esito |
|---|----------|--------|
| 1 | Settings → Delete Account Permanently → si apre il modale con stesso overlay/stack/stile del pill M1U | DA ESEGUIRE |
| 2 | Cancel → chiude e ritorna a Settings | DA ESEGUIRE |
| 3 | Conferma (checkbox + Delete account) → loading → success → logout → login | DA ESEGUIRE |
| 4 | Nessun glitch di layering / modale sotto | DA ESEGUIRE |

**Esito:** PASS/FAIL (da compilare dopo test).

---

## 6) Rollback

```bash
git reset --hard safety/delete-account-modal-align-20260226_162447
```

Poi `npm run build` e `npx cap sync ios` se serve ripristinare l’app.

---

FINE REPORT
