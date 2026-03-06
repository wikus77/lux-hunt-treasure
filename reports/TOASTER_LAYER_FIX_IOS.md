# Toaster layer fix — iOS WKWebView (toast sopra Login overlay)

**Data:** 2026-02-20  
**Scope:** Solo fix layering del Toaster. Toast Sonner visibili sopra l’overlay Login montato con `createPortal(document.body)`.

---

## 1. Struttura prima del fix

**Posizione Toaster in `App.tsx`:**
- `<Toaster />` è montato dentro: `Router` → `SoundProvider` → `AuthProvider` → `InterestSignalsProvider` → … → `<Toaster />` (circa riga 312).
- Quindi il Toaster vive **dentro** il React root (`#root`).

**Albero JSX semplificato (prima):**

```
body
├── div#root
│   └── App
│       └── Router → SoundProvider → AuthProvider → InterestSignalsProvider
│           ├── WouterRoutes (Login su /login)
│           ├── <Toaster />        ← qui, sotto #root
│           └── ...
│
└── div (Login overlay, createPortal in Login.tsx)
    class="fixed inset-0 z-[100] overflow-hidden bg-black"
```

**Problema:** L’overlay Login è figlio diretto di `body` con `z-index: 100`. Il Toaster è discendente di `#root` (z-index implicito 0). In stacking, l’overlay (100) sta sopra tutto `#root`, quindi anche sopra il container Sonner (z-index 9999 applicato dentro #root). I toast restavano **sotto** l’overlay e invisibili.

---

## 2. Struttura dopo il fix

**Modifica applicata:** Solo in `src/components/ui/sonner.tsx`.

- Aggiunto `import { createPortal } from 'react-dom'`.
- Il contenuto `<Sonner ... />` è assegnato a una variabile `sonnerContent`.
- **Lato client** (`typeof document !== 'undefined' && document.body`): `return createPortal(sonnerContent, document.body)`.
- **SSR / pre-mount:** `return sonnerContent` (nessun portal, comportamento invariato dove non c’è `document.body`).

**Albero DOM dopo il fix (su client):**

```
body
├── div#root
│   └── App
│       └── Router → … → (slot dove era <Toaster /> ora è un portal, nessun nodo aggiunto in #root per il Toaster)
│           ├── WouterRoutes
│           └── ...
│
├── div (Login overlay, da Login.tsx createPortal)
│   class="fixed inset-0 z-[100] ..."
│
└── div (container Sonner, da sonner.tsx createPortal)
    [data-sonner-toaster], class="toaster group"
    z-index: 9999 (toast-animations.css)
```

Il Toaster è ora un **figlio diretto di body**, sibling dell’overlay Login. Con z-index 9999 (CSS esistente) sta **sopra** l’overlay (z-100). Props, theme, duration, styling e className del Sonner non sono stati modificati.

---

## 3. Conferma stacking context corretto

- **body:** contesto di stacking root.
- **Figli di body:** `#root` (z auto), overlay Login (z 100), container Toaster (z 9999).
- Ordinamento: `#root` (0) < overlay (100) < Toaster (9999).
- I toast vengono renderizzati dentro il container Toaster (figlio di body), quindi sono visibili sopra l’overlay Login. Nessun cambiamento di z-index sull’overlay o sul Login.

---

## 4. Test login errato (risultato)

**Procedure consigliate su device iOS (Capacitor WKWebView):**

1. Avviare l’app, andare su Login.
2. Inserire email/password errate e premere “Accedi”.
3. Verificare:
   - Toast “Errore di login” (e descrizione) **visibile sopra** l’overlay.
   - Animazione di ingresso/uscita corretta.
   - Nessun errore in console.
   - Nessun glitch grafico.

**Risultato atteso:** Toast visibile sopra l’overlay; nessuna regressione della logica di login (AuthProvider e StandardLoginForm non toccati).

---

## 5. Test altre pagine

**Regression check:**

- **Home:** Provare un’azione che mostri un toast (es. sync, messaggio di feedback). Verificare che il toast appaia e si comporti come prima.
- **Altre modali:** Verificare che i toast nelle pagine con modali (es. shop, missioni) appaiano sopra il contenuto e senza duplicati.
- **Generale:** Nessun toast duplicato, nessun warning React (es. “Target container is not a DOM element”), nessun comportamento che suggerisca memory leak (toast che non scompaiono, container che non si pulisce).

Il Toaster è sempre lo stesso componente; solo il **mount point** è passato da “dentro #root” a “body”. Le chiamate `toast()` da qualsiasi pagina continuano a usare lo stesso Toaster; non è stato introdotto un secondo provider.

---

## 6. Eventuali effetti collaterali

**Attesi: nessuno** per il flusso normale.

- **SSR / build:** Se `document` o `document.body` non esistono, il componente restituisce `sonnerContent` in-place (come prima), quindi non si usa `createPortal` in ambiente senza DOM.
- **Ordine di append in body:** React gestisce l’ordine dei portali; il Toaster viene montato quando il componente Toaster monta (in App). L’overlay Login viene montato quando si è su `/login`. Entrambi sono figli di body; l’ordine effettivo dipende dall’ordine di mount. Il Toaster è montato subito (App sempre attiva); l’overlay Login appare alla navigazione su /login. Quindi tipicamente body avrà: #root, poi (quando si va su login) il div dell’overlay, e il container del Toaster è già stato aggiunto prima dal portal. In ogni caso, lo z-index 9999 garantisce che il Toaster sia sopra l’overlay (100).
- **useTheme:** Il Toaster resta sotto gli stessi provider (HelmetProvider, AuthProvider, ecc.), quindi `useTheme()` e le props restano valide; il portal non cambia il contesto React.

Nessuna modifica a AuthProvider, StandardLoginForm, routing, overlay login, z-index del login o business logic.

---

## 7. Conclusione tecnica

- **Modifica:** Unica modifica in `src/components/ui/sonner.tsx`: il Toaster viene montato con `createPortal(..., document.body)` quando `document` e `document.body` sono disponibili, così da essere sibling dell’overlay Login e dello `#root`.
- **Layering:** Il container Sonner (z-index 9999) è ora un figlio diretto di body e risulta sopra l’overlay Login (z-100), risolvendo il problema dei toast invisibili su schermata di login su iOS.
- **Scope:** Fix limitato al componente Toaster, senza refactor di logica auth, routing o UI dell’overlay, e compatibile con WKWebView iOS.

— Fine report —
