# Apple 5.1.1(v) — Legal crash + AlertDialog sotto Settings: root cause e fix

**Data:** 2026-02-26  
**Target:** iOS Capacitor WKWebView  
**Firma:** Lovable Agent JLENIA

---

## 1) Commit hash + tag safety (rollback pronto)

- **Commit hash:** `20e14f62a5f6e157aad2ea6485a36fdc4685f9a6`
- **Tag rollback:** `safety/legal-delete-dialog-20260226_153503`

**Rollback immediato:**
```bash
git reset --hard safety/legal-delete-dialog-20260226_153503
```

---

## 2) Root cause crash LEGAL (file + righe)

### Causa

In **LegalSectionContent.tsx** il componente usa `deleteLoading`, `setDeleteLoading` e `toast` nel render e in `handleConfirmDeleteAccount`, ma **non erano mai stati dichiarati**:

- Manca: `const { toast } = useToast();`
- Manca: `const [deleteLoading, setDeleteLoading] = useState(false);`

Al primo render della sezione Legal (Settings → Legal), il codice esegue ad es. `disabled={deleteLoading}` → **ReferenceError: deleteLoading is not defined** → ErrorBoundary cattura → schermata “Oops! Qualcosa è andato storto” con codice tipo ERR-MM3CMP94 (ID generato da `ErrorBoundary` con `Date.now().toString(36)`).

### Evidenza

- **File:** `src/components/settings/sections/LegalSectionContent.tsx`
- **Righe uso senza dichiarazione:** 208 (`disabled={deleteLoading}`), 218 (`deleteLoading ? 'not-allowed'`), 221 (`deleteLoading ? t('deleting')`), 72–82 (`setDeleteLoading`, `toast` in `handleConfirmDeleteAccount`).
- **Dichiarazioni presenti prima del fix:** solo `openDocument`, `documentOriginRect` (righe 37–38). Manca lo state e l’hook per la delete.

### Stack trace (dedotto)

Non essendo stato possibile attaccare Safari/Xcode in questa sessione, la causa è dedotta dal codice: **ReferenceError** durante il render di LegalSectionContent quando il motore incontra l’identificatore `deleteLoading` non definito.

---

## 3) Root cause layering (z-index / portal)

### Sintomo

Il dialog di conferma “Delete Account” (AlertDialog) appariva **sotto** il modale Settings: overlay e content non erano il layer più in alto.

### Evidenza tecnica

- **Modale Settings (sub-modale):**  
  `SettingsSectionFlipOverlay.tsx` crea un portal in un container con `z-index: 100000` (riga 37: `container.style.cssText = 'position:fixed;inset:0;z-index:100000;...'`). Il contenuto della sezione (es. Legal) viene renderizzato dentro quel container.
- **AlertDialog (Radix):**  
  `src/components/ui/alert-dialog.tsx` usava **z-50** (Tailwind = 50) per Overlay e Content. Il portal Radix monta in `document.body`, quindi il problema non è il container ma il **livello di stacking**: 50 < 100000 → il dialog restava sotto al modale Settings.

### Conclusione

- **z-index modale Settings:** 100000 (container portal).  
- **z-index AlertDialog (pre-fix):** 50 (overlay e content).  
- **Portal:** AlertDialog già monta su body; il layering errato è solo da z-index insufficiente.

---

## 4) Patch applicata (file toccati, solo in-scope)

### A) Fix crash LEGAL

| File | Modifica |
|------|----------|
| **src/components/settings/sections/LegalSectionContent.tsx** | Aggiunte dopo `const { user } = useAuth();`: `const { toast } = useToast();` e `const [deleteLoading, setDeleteLoading] = useState(false);`. Aggiunto controllo sessione prima di `invoke`: se `!session?.access_token` → toast “Session expired…” e return, altrimenti `invoke` con `session.access_token`. |

### B) Fix layering AlertDialog sopra Settings

| File | Modifica |
|------|----------|
| **src/components/ui/alert-dialog.tsx** | Overlay: da `z-50` a `z-[100001]`. Content: da `z-50` a `z-[100002]`. Così overlay e dialog stanno sopra al modale Settings (100000). |

### C) Guard sessione (stesso comportamento in entrambi i punti delete)

| File | Modifica |
|------|----------|
| **src/components/settings/SettingsContent.tsx** | In `handleConfirmDeleteAccount`: lettura `session` da `getSession()`; se `!session?.access_token` → toast “Session expired…” e return; altrimenti `invoke` con `session.access_token`. |

Nessun refactor fuori scope; nessuna modifica a routing o altre UI.

---

## 5) Checklist test (iPhone + iPad) — esito da compilare

| # | Verifica | Esito |
|---|----------|--------|
| 1 | Apri Settings → Legal: nessun crash | DA ESEGUIRE |
| 2 | Premi Delete Account Permanently (Settings o Legal): dialog appare **sopra** il modale Settings (overlay corretto) | DA ESEGUIRE |
| 3 | Esegui delete su account test: success → logout + redirect login; login stesso account fallisce | DA ESEGUIRE |
| 4 | Ripeti da Legal senza crash | DA ESEGUIRE |
| 5 | Nessun loop ErrorBoundary | DA ESEGUIRE |

**Se un test fallisce:** rollback con  
`git reset --hard safety/legal-delete-dialog-20260226_153503`

---

## 6) Istruzione rollback (pronta)

```bash
git reset --hard safety/legal-delete-dialog-20260226_153503
```

Poi build + sync Capacitor se serve ripristinare l’app su dispositivo.

---

FINE REPORT
