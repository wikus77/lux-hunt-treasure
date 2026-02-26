# Incident — Crash modale Legal iOS (ReferenceError: deleteModalOpen)

**Data:** 2026-02-26  
**Target:** App nativa iOS (Capacitor / WKWebView)  
**Sintomo:** Settings → Legal → ErrorBoundary “Oops! Qualcosa è andato storto”  
**Log Xcode:** `Can't find variable: deleteModalOpen`  
**Firma:** Lovable Agent JLENIA

---

## Summary

Il modale Legal crashava su iOS WKWebView perché `LegalSectionContent.tsx` **usava** `deleteModalOpen`, `setDeleteModalOpen`, `deleteOriginRect`, `setDeleteOriginRect` **senza dichiararle** né riceverle come props. Lo state esisteva solo in `SettingsContent.tsx`; al primo render di Legal il JSX valutava `isOpen={deleteModalOpen}` → ReferenceError. **Fix applicato:** state locale per delete modal in `LegalSectionContent.tsx` (Opzione A: due `useState`), un solo file toccato.

---

## Root cause (file / righe)

| Campo | Valore |
|--------|--------|
| **File** | `src/components/settings/sections/LegalSectionContent.tsx` |
| **Righe** | 69-71 (`openDeleteModal`), 225-227 (JSX `<DeleteAccountModal />`) |
| **Causa** | Variabili `deleteModalOpen`, `setDeleteModalOpen`, `deleteOriginRect`, `setDeleteOriginRect` usate nello scope del componente ma **non definite** (né state locale né props). `LegalSectionContent` riceve solo `onClose` da `SettingsContent`. |

**Conferma forense:**

- **SettingsContent.tsx:** `useState` per `deleteModalOpen` e `deleteOriginRect` alle righe 58-59; uso coerente in openDeleteModal e in `<DeleteAccountModal />`.
- **LegalSectionContent.tsx:** stesse variabili usate in `openDeleteModal` (69-71) e in JSX (225-227) ma **nessun** `useState` né props che le forniscono.
- **Props di LegalSectionContent:** interfaccia `LegalSectionContentProps` contiene solo `onClose`; in `SettingsContent` il render è `<LegalSectionContent onClose={closeSectionModal} />` (case `'legal'`).
- **useToast:** in LegalSectionContent è presente `import { useToast } from '@/hooks/use-toast'` e `const { toast } = useToast();` — nessuna regressione.

---

## Evidenze (grep / log Xcode)

### Grep (pre-fix)

- `deleteModalOpen` / `setDeleteModalOpen`: definiti in SettingsContent.tsx (58, 70, 315-316); **usati ma non definiti** in LegalSectionContent.tsx (71, 225-226).
- `deleteOriginRect` / `setDeleteOriginRect`: definiti in SettingsContent.tsx (59, 69, 317); **usati ma non definiti** in LegalSectionContent.tsx (70, 227).
- `openDeleteModal`: definito in entrambi i file; in LegalSectionContent chiama setter non in scope.

### Log Xcode

- **CRASH (causa):** `[ErrorBoundary] ... Can't find variable: deleteModalOpen`
- **Non causa (noise):** WEBP err=-50, CARenderServer invalid address, _AXAddToElementCache, sandbox extension, UIScene lifecycle — classificati come **non causa** del crash Legal (WebKit/iOS; ignorabili se UI funziona).

---

## Patch scope (1 file) + diff

**File toccato:** `src/components/settings/sections/LegalSectionContent.tsx`  
**Modifica:** aggiunto state locale per il modale Delete Account (stesso pattern di SettingsContent).

**Diff:**

```diff
   const [openDocument, setOpenDocument] = useState<LegalLink | null>(null);
   const [documentOriginRect, setDocumentOriginRect] = useState<DOMRect | null>(null);
+  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
+  const [deleteOriginRect, setDeleteOriginRect] = useState<DOMRect | null>(null);

   const legalLinks:
```

- `useState` era già importato da React; nessun altro import aggiunto.
- `openDeleteModal` e il JSX di `<DeleteAccountModal />` usano già questi nomi; dopo la dichiarazione lo scope è valido e il ReferenceError scompare.
- Nessun cambiamento a copy, UI, logica delete-account, supabase invoke, signOut, redirect.

---

## Rollback

- **Commit pre-fix (tag safety):** `25965e80fd213c0a9d961502baf28b43eedfb8c0`
- **Tag rollback:** `safety/legal-crash-pre-20260226_174332`

**Comando rollback (se necessario):**

```bash
git reset --hard safety/legal-crash-pre-20260226_174332
```

Poi `npm run build` e `npx cap sync ios` per ripristinare l’app iOS allo stato pre-fix.

---

## Test plan + risultati

**Checklist iOS (WKWebView):**

| # | Verifica | Esito |
|---|----------|--------|
| 1 | Apri app → Settings modal → Legal | DA ESEGUIRE |
| 2 | Apri/chiudi Legal 3 volte: nessun crash, nessun ErrorBoundary | DA ESEGUIRE |
| 3 | (Facoltativo) In Legal, “Delete Account Permanently”: si apre modale; Cancel chiude senza crash | DA ESEGUIRE |
| 4 | Nessun log `Can't find variable: deleteModalOpen` in Xcode | DA ESEGUIRE |

**Pass criteria:** Nessun ErrorBoundary; nessun crash UI; nessun ReferenceError per deleteModalOpen.

**Risultati:** PASS / FAIL (da compilare dopo test su iPhone).

---

## Note su rumore Xcode (non causa)

- **WEBP err=-50** — Decoding immagini; spesso noise se le immagini si vedono.
- **CARenderServer … invalid address** — Rendering CoreAnimation; tipico su simulatore.
- **_AXAddToElementCache…** — Accessibilità; non causa crash JS.
- **sandbox extension…** — Permessi; non legato al ReferenceError Legal.
- **UIScene lifecycle…** — Ciclo di vita; informativo.

Questi non richiedono fix per il crash del modale Legal.

---

FINE REPORT
