# iOS WKWebView — Toast Sonner invocato ma non visibile (DOM audit)

**Data:** 2026-02-20  
**Scope:** Verifica DOM su device iOS: il nodo toast viene montato? Perché non è visibile?  
**Vincolo:** Solo analisi DOM/CSS e playbook diagnostico. Nessuna modifica a codice applicativo, nessuna patch.

---

## Nota metodologica

L’audit non può eseguire l’app su iOS né collegare Safari DevTools al device. Questo report fornisce:

1. **Analisi da codice:** dove e come vengono creati i nodi toast, stili applicati, stacking context.
2. **Ipotesi principale** (stacking context) ricavata dalla struttura DOM e dai CSS.
3. **Playbook operativo:** procedure e script da eseguire **sul device reale** (Safari DevTools remoto o console) per confermare o escludere le ipotesi.

I campi “Screenshot DOM”, “Output console”, “Risultato test tastiera” vanno compilati da chi esegue i passi su dispositivo.

---

## 1. Nodo toast presente? (Sì/No)

**Da verificare su device (FASE 1 + script FASE 5):**

| Verifica | Risultato (da compilare) |
|----------|--------------------------|
| Esiste almeno un elemento `[data-sonner-toaster]`? | … |
| Esistono nodi `[data-sonner-toast]` subito dopo login errato? | … |
| Il numero di toast (script ogni 500 ms) passa da 0 a ≥1 e poi torna a 0 dopo ~3 s? | … |

**Atteso da codice:**  
Sonner crea il container (con `data-sonner-toaster` e class `toaster group`) e, a ogni `toast.error()`, aggiunge figli `[data-sonner-toast]`. Con `duration={3000}` i toast restano in DOM per 3 secondi prima della rimozione. Quindi **è atteso che il nodo toast sia presente** per qualche secondo dopo il tentativo di login con credenziali errate.

---

## 2. Numero nodi creati

**Da verificare su device:**

- Subito dopo aver inviato il form con credenziali errate, in console:

```js
document.querySelectorAll('[data-sonner-toast]').length
```

- Ripetere dopo 1 s, 2 s, 4 s per verificare che i nodi compaiano e poi vengano rimossi.

**Atteso:** 1 (o più se più toast in coda) subito dopo l’errore, 0 dopo ~3 s.

---

## 3. Computed style analisi

**Selezionare in DevTools un nodo `[data-sonner-toast]` (o il container `[data-sonner-toaster]`) e annotare i computed style.**

**Stili attesi dal codice:**

| Proprietà | Fonte | Valore atteso |
|-----------|--------|----------------|
| **Container `[data-sonner-toaster]`** | `toast-animations.css` | `position: fixed`; `top: calc(env(safe-area-inset-top, 0px) + 12px)`; `left: 50%`; `transform: translateX(-50%)`; `z-index: 9999`; `display: flex`; `pointer-events: none` |
| **Override `.toaster`** | `index.css` | `top: calc(env(safe-area-inset-top, 47px) + 20px)` (nessun z-index in .toaster) |
| **Toast `[data-sonner-toast]`** | `toast-animations.css` + inline | `display: inline-flex`; `position: relative`; `pointer-events: auto`; animazione `toast-slide-down` |

**Checklist da compilare su device:**

| Proprietà | Valore osservato | Fuori viewport / problema? |
|-----------|------------------|----------------------------|
| display | | |
| visibility | | |
| opacity | | |
| z-index (del container toaster) | | |
| position (container) | | |
| top / bottom | | |
| transform | | |
| pointer-events | | |
| width / height | | |
| overflow (antenati) | | |

**Coordinate da registrare (per il toast o il container):**

- `element.getBoundingClientRect()`: `{ top, left, right, bottom, width, height }`
- `window.innerWidth`, `window.innerHeight`
- Se disponibile: `window.visualViewport.height`, `window.visualViewport.width`

Se `top` è negativo o `bottom` < 0, il toast può essere fuori viewport (es. sopra il bordo superiore).

---

## 4. Z-index comparison (stacking context)

**Albero DOM atteso (da codice):**

```
body
├── div#root                    ← React app root (position: static, z-index: auto)
│   └── … (App → Router → AuthProvider → … → Toaster)
│       └── [data-sonner-toaster]  ← position: fixed, z-index: 9999
│           └── [data-sonner-toast]  ← figli toast
│
└── div                         ← createPortal(Login, document.body)
    class="fixed inset-0 z-[100] overflow-hidden bg-black"
    ← Overlay login fullscreen (position: fixed, z-index: 100)
```

**Punto critico (analisi da codice):**

- L’overlay di Login è montato con **createPortal(..., document.body)** (`Login.tsx` ~623–691), quindi è un **figlio diretto di body**, **dopo** `#root`.
- Il Toaster è **dentro** `#root` (App → … → Toaster).
- In stacking:
  - **body** è il contesto di stacking iniziale.
  - **#root** non ha z-index (implicit 0).
  - Il **div del portal** (overlay login) ha **z-index: 100**.
  - I due figli di body sono quindi ordinati: prima #root (0), poi overlay (100). L’overlay **copre** tutto ciò che sta in #root.
  - Il container Sonner ha `z-index: 9999`, ma è **dentro** #root. Quel 9999 ordina il toaster solo rispetto agli altri figli di #root, **non** rispetto al div del portal, che è un fratello di #root con z 100.

**Conclusione da codice:** il toast è molto probabilmente **montato e con stili corretti**, ma **nascosto dall’overlay di login** perché l’overlay (z-100, figlio di body) sta sopra l’intero #root (dove vive il toaster con z-9999).

**Da verificare su device:**

- In Elements, confermare che:
  - Esiste un figlio di `body` con `class` che include `fixed`, `z-[100]` o `z-100` (overlay login).
  - Il container `[data-sonner-toaster]` è discendente di `#root`, non figlio diretto di body.
- In Computed, per il div overlay login: `z-index: 100` (o 100 da Tailwind).
- Per `[data-sonner-toaster]`: `z-index: 9999` (da `toast-animations.css`).

Se la struttura è questa, la causa della non visibilità è lo **stacking context** (toast sotto overlay), non opacity o display.

---

## 5. Viewport position

**Stili di posizionamento del container toast (da codice):**

- `toast-animations.css`: `top: calc(env(safe-area-inset-top, 0px) + 12px)`; `left: 50%`; `transform: translateX(-50%)`.
- `index.css` (.toaster): `top: calc(env(safe-area-inset-top, 47px) + 20px)` (override, nessun z-index).

Su iOS, `env(safe-area-inset-top)` può essere ~47px (notch) o ~59px (Dynamic Island). Il toast dovrebbe quindi apparire sotto la status bar.

**Da verificare su device:**

- `getBoundingClientRect()` del container o del toast: `top` dovrebbe essere ~60–80px (safe-area + offset). Se `top` è negativo o molto grande, il toast può essere fuori schermo.
- Confrontare con `window.innerHeight`: il toast è dentro `0 ≤ top ≤ innerHeight`?

---

## 6. Test tastiera

**Procedure da eseguire su device:**

| Test | Procedura | Toast visibile? (Sì/No) |
|------|-----------|--------------------------|
| A. Tastiera aperta | Lasciare il focus su email o password, non chiudere la tastiera, toccare “Accedi” con credenziali errate. | … |
| B. Tastiera chiusa | Chiudere la tastiera, poi toccare “Accedi” con credenziali errate. | … |

**Interpretazione:**

- Se in B il toast **non** appare ma in A sì (o viceversa): possibile interazione con **visualViewport** (tastiera riduce `visualViewport.height`) o con il posizionamento `top` (toast finisce sopra/sotto la zona visibile).
- Se in entrambi i casi il toast **non** appare e in DOM il nodo c’è con stili corretti: coerente con **toast sotto overlay** (stacking).

---

## 7. FASE 5 — Script DOM log (diagnosi)

**Eseguire in Safari DevTools → Console (device remoto o simulatore):**

```js
setInterval(() => {
  const toasts = document.querySelectorAll('[data-sonner-toast]');
  const toaster = document.querySelector('[data-sonner-toaster]');
  console.log('Toast count:', toasts.length, 'Toaster in DOM:', !!toaster);
  if (toasts.length > 0) {
    const r = toasts[0].getBoundingClientRect();
    console.log('First toast rect:', { top: r.top, left: r.left, width: r.width, height: r.height });
    console.log('window.innerHeight:', window.innerHeight);
  }
}, 500);
```

Poi effettuare **login con credenziali errate** e osservare per ~5 secondi.

**Da riportare nel report:**

- Toast count: resta 0 per tutto il tempo? Passa a 1 (o più) e poi torna a 0?
- Toaster in DOM: sempre true dopo il primo render della app?
- Se count > 0: valori di `First toast rect` e `innerHeight` (per capire se il toast è in viewport).

---

## 8. Conclusione tecnica (scenari)

In base ai risultati delle fasi sopra, classificare il comportamento in **uno** dei seguenti casi:

| Scenario | Condizioni | Interpretazione |
|----------|------------|-----------------|
| **Toast non montato** | Nessun `[data-sonner-toast]` dopo login errato; script count resta 0. | `toast.error()` non viene chiamato, o Sonner non aggiunge il nodo (es. Toaster non montato, errore in libreria). |
| **Toast montato ma invisibile (sotto overlay)** | Nodi toast presenti; container con z-index 9999; overlay login è sibling di #root con z-index 100. | **Stacking context:** il toast è dentro #root, l’overlay è figlio di body con z-100, quindi l’overlay copre il toast. **Causa da codice:** createPortal(Login, document.body) crea un layer sopra tutto #root. |
| **Toast montato ma fuori viewport** | Nodi presenti; `getBoundingClientRect().top` negativo o > `innerHeight`; o `visualViewport` molto ridotto con tastiera aperta. | Posizionamento (safe-area, top, tastiera) mette il toast fuori dall’area visibile. |
| **Toast montato ma rimosso subito** | Count passa a 1 e torna a 0 in < 1 s; duration è 3000 ms. | Qualche effetto (re-render, unmount, altro) rimuove il toast prima della scadenza naturale. |

**Ipotesi più probabile (solo da analisi codice):**  
**Toast montato ma invisibile (sotto overlay)** — overlay login in portal su body con `z-[100]` copre l’intero #root, quindi anche il container Sonner con z-index 9999 resta sotto l’overlay.

---

## Riepilogo atteso da codice (senza esecuzione su device)

| Voce | Valore |
|------|--------|
| Container toaster | Presente in DOM, discendente di `#root` |
| Z-index container | 9999 (`toast-animations.css`) |
| Z-index overlay login | 100 (Tailwind `z-[100]`) |
| Posizione overlay | Figlio diretto di `body` (createPortal) |
| Overflow overlay | `overflow-hidden` |
| Posizione toast | `position: fixed`, `top` con safe-area |

Per una conclusione definitiva è necessario eseguire sul device le verifiche delle sezioni 1–6 e lo script della sezione 7 e compilare i campi “Risultato” e “Output console” in questo documento.

— Fine report (solo diagnosi DOM, nessuna patch applicata) —
