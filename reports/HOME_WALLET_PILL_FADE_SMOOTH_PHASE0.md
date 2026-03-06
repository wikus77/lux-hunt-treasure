# Home Wallet Pill — Dissolvenza progressiva — FASE 0 (Read-Only)

**Data:** 2026-03-03  
**Scope:** Capire perché l’hide/show è “netto” e definire patch per fade reale.

---

## 1) Dove viene applicato hide/show

| Domanda | Risposta |
|--------|----------|
| **Conditional render** `{visible && <Pill/>}`? | **No.** Il wrapper e il pill sono sempre nel DOM. |
| **display: none / visibility: hidden?** | **No.** Si usano solo `opacity` e `transform` inline. |
| **Classe che imposta opacity: 0 senza transition?** | **No.** È presente `transition: 'opacity 220ms ease, transform 220ms ease'` sullo stesso elemento. |
| **Unmount quando hidden?** | **No.** Nessun conditional render sul wrapper. |

**File:** `src/pages/AppHome.tsx`  
**Snippet attuale (wrapper pill, ~479–493):**

```tsx
<div
  id="m1u-pill-home-slot"
  ...
  style={{
    ...
    opacity: walletPillVisible ? 1 : 0,
    transform: walletPillVisible ? 'translateY(0)' : 'translateY(-8px)',
    transition: 'opacity 220ms ease, transform 220ms ease',
    pointerEvents: walletPillVisible ? 'auto' : 'none',
  }}
>
  <M1UPill showLabel showPlusButton />
</div>
```

Stato `walletPillVisible` viene aggiornato dall’**IntersectionObserver** (sentinel `m1-first-content-offset-compact`): `setWalletPillVisible(entry.isIntersecting)`.

---

## 2) Root cause probabile (effetto “netto”)

- **Nessun unmount né display/visibility:** il componente resta montato, quindi la transizione CSS potrebbe comunque non essere percepita come dissolvenza.
- **Possibili cause:**
  1. **Transizione corta:** 220ms può essere percepita come quasi istantanea, soprattutto su iOS con scroll a inerzia.
  2. **Manca `will-change`:** senza `will-change: opacity, transform` il browser può non ottimizzare il layer e la transizione può risultare a scatti o “tagliata”.
  3. **Observer a soglia 0:** con `threshold: 0` l’observer può fire più volte in rapida successione durante lo scroll; aggiornamenti di stato continui possono far sembrare il cambio “netto” o tremolante invece che una dissolvenza unica.
  4. **Aggiornamento in un solo step:** si passa direttamente da visibile a nascosto (e viceversa) senza stati intermedi; la transizione c’è ma, se breve o non ottimizzata, l’effetto percepito è “on/off”.

---

## 3) Elemento DOM su cui applicare l’animazione

- **Consigliato:** il **wrapper** del pill (`div#m1u-pill-home-slot`), che resta sempre montato.
- Non serve toccare `M1UPill` (condiviso con altre pagine).

---

## 4) Piano patch minimale (FASE 1)

1. **Mantenere** IntersectionObserver + sentinel; **non** introdurre unmount, `display:none` o `visibility:hidden`.
2. **Sul wrapper** (sempre montato):
   - Aumentare la transizione a **280ms** (range 240–320ms).
   - Aggiungere **`will-change: opacity, transform`** (solo sul wrapper).
   - Opzionale: evitare aggiornamenti ridondanti (es. `setWalletPillVisible` solo se il valore è diverso dal precedente) per ridurre flicker durante scroll.
3. Verificare che non ci siano override CSS (es. altri `transition` o `opacity`) sull’elemento o su genitori che possano “tagliare” la dissolvenza.

**Esito FASE 0:** OK per procedere con FASE 1 (patch solo UI, stesso file Home).
