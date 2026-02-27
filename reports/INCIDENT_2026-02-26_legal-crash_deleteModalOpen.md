# Incident Report — iOS WKWebView crash modale Legal (ERR-MM3O5VTB)

**Data:** 2026-02-26  
**Target:** App nativa iOS (Capacitor / WKWebView)  
**Sintomo:** Apertura sezione Legal → ErrorBoundary “Oops! Qualcosa è andato storto”  
**Log chiave:** `[ErrorBoundary] ... Can't find variable: deleteModalOpen`

---

## 1. Summary

Il modale Legal (Settings → Legal) va in crash su iOS WKWebView perché il componente `LegalSectionContent.tsx` **usa quattro variabili di stato** (`deleteModalOpen`, `setDeleteModalOpen`, `deleteOriginRect`, `setDeleteOriginRect`) **senza dichiararle né riceverle come props**. Tali variabili esistono solo in `SettingsContent.tsx`; quando viene montato solo `LegalSectionContent` (sezione Legal), il suo scope non le contiene → ReferenceError alla prima valutazione (es. `isOpen={deleteModalOpen}`).  
L’errore precedente `useToast` è stato risolto con l’aggiunta dell’import; il crash attuale è determinato da **deleteModalOpen** (e variabili correlate).

---

## 2. Riproduzione

1. Avviare l’app su dispositivo/simulatore iOS (build Capacitor).
2. Aprire il modale Settings (ingranaggio / Profilo → Impostazioni).
3. Toccare la sezione **Legal** (Legale / Documenti legali).
4. **Risultato atteso:** si apre il contenuto Legal.  
5. **Risultato attuale:** crash → ErrorBoundary “Oops! Qualcosa è andato storto”, log Xcode `Can't find variable: deleteModalOpen`.

**Percorso di esecuzione:**  
Settings modal → scelta sezione `legal` → `SettingsContent` renderizza `<LegalSectionContent onClose={closeSectionModal} />` (lazy) → al primo render di `LegalSectionContent` viene valutato il JSX che usa `deleteModalOpen` / `deleteOriginRect` / `setDeleteModalOpen` / `setDeleteOriginRect` → variabili non in scope → ReferenceError → ErrorBoundary.

---

## 3. Evidenze

### 3.1 Log Xcode (estratto)

- **CRASH (causa diretta):**  
  `[ErrorBoundary] ... Can't find variable: deleteModalOpen`
- **Precedente (risolto o mascherato):**  
  `Can't find variable: useToast` (fix: aggiunto `import { useToast } from '@/hooks/use-toast'` in `LegalSectionContent.tsx`).

### 3.2 Grep — `deleteModalOpen` / `setDeleteModalOpen` / contesto

| File | Righe | Contesto |
|------|--------|----------|
| **SettingsContent.tsx** | 58 | `const [deleteModalOpen, setDeleteModalOpen] = useState(false);` — **definito** |
| **SettingsContent.tsx** | 70 | `setDeleteModalOpen(true)` in `openDeleteModal` |
| **SettingsContent.tsx** | 315-316 | `<DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} ... />` |
| **LegalSectionContent.tsx** | 71 | `setDeleteModalOpen(true)` in `openDeleteModal` — **NON definito** |
| **LegalSectionContent.tsx** | 225-226 | `isOpen={deleteModalOpen}` e `onClose={() => setDeleteModalOpen(false)}` — **NON definiti** |

### 3.3 Grep — `deleteOriginRect` / `setDeleteOriginRect` in LegalSectionContent

| File | Righe | Contesto |
|------|--------|----------|
| **LegalSectionContent.tsx** | 70 | `setDeleteOriginRect(e.currentTarget.getBoundingClientRect())` — **NON definito** |
| **LegalSectionContent.tsx** | 227 | `originRect={deleteOriginRect}` — **NON definito** |

In **LegalSectionContent** non esiste alcun `useState` (né props) per queste quattro variabili; sono usate “in copia” dal flusso di SettingsContent ma il componente Legal è montato da solo con sola prop `onClose`.

### 3.4 useToast — audit (secondario)

In `src/components/settings/sections/LegalSectionContent.tsx`:

- Riga 8: `import { useToast } from '@/hooks/use-toast';` — **presente**
- Riga 34: `const { toast } = useToast();` — uso coerente

Conclusione: useToast non è la causa del crash attuale; l’ordine di esecuzione porta prima al ReferenceError su `deleteModalOpen`.

---

## 4. Root cause (deterministica)

| Campo | Valore |
|--------|--------|
| **File** | `src/components/settings/sections/LegalSectionContent.tsx` |
| **Righe** | 68-71 (handler `openDeleteModal`), 224-228 (JSX `<DeleteAccountModal ... />`) |
| **Causa** | Nel componente sono usate **senza dichiarazione** le variabili: `deleteModalOpen`, `setDeleteModalOpen`, `deleteOriginRect`, `setDeleteOriginRect`. Esse sono definite solo in `SettingsContent.tsx`; `LegalSectionContent` riceve solo la prop `onClose` e non ha uno state locale equivalente. Alla prima valutazione (es. al render di `isOpen={deleteModalOpen}`), il motore JS non trova `deleteModalOpen` nello scope → **ReferenceError: Can't find variable: deleteModalOpen**. |

**Snippet incriminato (LegalSectionContent.tsx):**

```tsx
// Riga 68-71 — openDeleteModal usa variabili non dichiarate
const openDeleteModal = (e: React.MouseEvent<HTMLElement>) => {
  setDeleteOriginRect(e.currentTarget.getBoundingClientRect());  // ❌ non definito
  setDeleteModalOpen(true);                                       // ❌ non definito
};

// Riga 224-228 — JSX usa variabili non dichiarate
<DeleteAccountModal
  isOpen={deleteModalOpen}           // ❌ non definito
  onClose={() => setDeleteModalOpen(false)}
  originRect={deleteOriginRect}     // ❌ non definito
/>
```

**Perché succede:** Durante il refactor che ha allineato il modale “Delete Account” al sistema modale M1U, la UI di delete è stata duplicata anche dentro Legal (stesso bottone + stesso modale), ma lo **state** è stato aggiunto solo in `SettingsContent.tsx` e non in `LegalSectionContent.tsx`, né le variabili sono passate come props da Settings a Legal.

---

## 5. Conseguenze

- **Utente:** Impossibile aprire la sezione Legal da Settings su iOS → impossibile consultare documenti legali e usare “Delete Account Permanently” dal percorso Legal.
- **Compliance:** Rischio per punti che richiedono accesso a termini/legal e opzione di cancellazione account (Apple 5.1.1(v), GDPR).
- **Stabilità:** ErrorBoundary attivo; nessun dato perso, ma flusso Legal non utilizzabile.

---

## 6. Fix plan IN-SCOPE (NO PATCH — solo piano)

Obiettivo: far sì che le variabili usate in `LegalSectionContent` esistano nello scope in cui sono lette/scritte, senza cambiare auth, BUZZ, IAP, wrapper iOS, routing, Supabase vendor, store.

### Opzione A — State locale in LegalSectionContent (consigliata)

- **Cosa:** Aggiungere in `LegalSectionContent.tsx` uno state locale per il modale delete, come in SettingsContent:
  - `const [deleteModalOpen, setDeleteModalOpen] = useState(false);`
  - `const [deleteOriginRect, setDeleteOriginRect] = useState<DOMRect | null>(null);`
- **File toccati:** Solo `LegalSectionContent.tsx`.
- **Rischio:** Basso. Comportamento già presente in SettingsContent; nessuna condivisione di state tra schermate.
- **Nota:** Il modale Delete Account in Legal sarà indipendente da quello in Settings (due istanze separate); accettabile per UX.

### Opzione B — Props da SettingsContent

- **Cosa:** In `SettingsContent.tsx`, quando si renderizza `LegalSectionContent`, passare `deleteModalOpen`, `setDeleteModalOpen`, `deleteOriginRect`, `setDeleteOriginRect` come props. Estendere `LegalSectionContentProps` e usare queste props dentro LegalSectionContent.
- **File toccati:** `SettingsContent.tsx`, `LegalSectionContent.tsx`.
- **Rischio:** Medio. Lo state resta in SettingsContent ma il contenuto della sezione Legal è montato in un sub-modal; bisogna garantire che le props arrivino sempre (anche quando Legal è aperto da “initialSection” o da altro entry). Possibile confusione su “chi possiede” il modale delete.

### Opzione C — Rimuovere Delete Account da LegalSectionContent

- **Cosa:** Togliere da Legal il bottone “Delete Account Permanently” e il render di `DeleteAccountModal`; lasciare la funzione solo in Settings (es. Danger Zone in SettingsContent).
- **File toccati:** Solo `LegalSectionContent.tsx` (rimozione UI + riferimenti a deleteModalOpen/deleteOriginRect/setDeleteModalOpen/setDeleteOriginRect e a openDeleteModal).
- **Rischio:** Basso per stabilità; medio per compliance se i requisiti richiedono accesso alla cancellazione account anche da “Legal/Privacy”.
- **Nota:** Da validare con requisiti Apple/GDPR (link/cancellazione da contesto legale).

---

## 7. Classificazione log Xcode: CRASH vs NOISE

### 7.1 CRASH (da fixare)

- **`Can't find variable: deleteModalOpen`**  
  Causa diretta del crash del modale Legal. Fix: dichiarare lo state (o passare props) come nel piano sopra.

### 7.2 Errori app-level ma non causa del crash Legal

- **SESSION INIT ERROR … LockManager … auth-token … timed out**  
  Possibile ritardo/timeout su init sessione/token; può degradare funzionalità dipendenti da auth ma **non** spiega il ReferenceError nel flusso Legal. Da tracciare a parte.

### 7.3 Noise WebKit / iOS (ignorabile se UI funziona)

- **WEBP err=-50** — Decoding immagini; spesso noise se le immagini si vedono.
- **CARenderServer … invalid address** — Rendering CoreAnimation; tipico su simulatore/simulatori.
- **_AXAddToElementCache…** — Accessibilità; non causa crash.
- **sandbox extension…** — Permessi sandbox; non legato al crash JS.
- **UIScene lifecycle…** — Ciclo di vita scena; informativo.

Questi non richiedono fix per il crash Legal; vanno considerati solo se correlati a sintomi specifici (es. immagini non caricate, crash nativi).

---

## 8. Checklist test iOS (dopo fix)

- [ ] Aprire Settings → Legal: nessun crash, nessun ErrorBoundary.
- [ ] Navigare avanti/indietro (Legal ↔ Settings) almeno 3 volte: stabile.
- [ ] In Legal, premere “Delete Account Permanently”: si apre il modale (stesso stile M1U); Cancel chiude; conferma (checkbox + Delete) → loading → logout → schermata login.
- [ ] Nessun nuovo log “Can't find variable” in Xcode per il flusso Legal/Delete.

---

FINE REPORT (nessuna patch applicata; solo analisi e piano).
