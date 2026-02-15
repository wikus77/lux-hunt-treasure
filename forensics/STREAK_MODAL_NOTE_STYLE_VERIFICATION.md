# VERIFICA — STREAK MODAL NOTE-STYLE

---

## 1) NOTE MODAL (standard MAP)

| Campo | Valore |
|-------|--------|
| **File** | `src/pages/sandbox/map3d/components/DevNotesPanel.tsx` |
| **Shell** | `MapPillFlipOverlay` — `src/components/map/MapPillFlipOverlay.tsx` |
| **Props** | `open`, `originRect`, `onClose` |
| **Dimensione** | **Fullscreen** (position: fixed, inset: 0) |
| **Animazione** | scale 0.1→1, spring (stiffness 280, damping 24), transformOrigin da pill |
| **Layout** | Header gradient cyan + scrollable content con GlassCard |
| **Backdrop** | rgba(10,10,15,0.98) blur(50px) |

---

## 2) STREAK MODAL (attuale)

| Campo | Valore |
|-------|--------|
| **File** | `src/components/gamification/StreakModal.tsx` |
| **Shell** | `Dialog` + `DialogContent` (Radix-style) |
| **Dimensione** | **max-w-lg (512px)** + max-h-[85vh] — card centrata |
| **Animazione** | scale 0.9→1, spring |
| **Apertura** | `StreakPill` → `setShowModal(true)` |

---

## 3) CONFIRM MODAL (daily check-in success)

| Campo | Valore |
|-------|--------|
| **File** | `src/components/gamification/StreakModal.tsx` (stesso) |
| **Tipo** | Overlay portaled su document.body, z-index 10001 |
| **Trigger** | `setShowSuccess(true)` dopo check-in completato |

---

## 4) DIAGNOSI "PICCOLO"

1. **DialogContent** usa `max-w-lg` (512px) — card limitata in larghezza
2. **Note modal** usa **MapPillFlipOverlay** con `inset: 0` — fullscreen
3. **Streak** è una card centrata, **Note** è pannello fullscreen → dimensione percepita molto diversa

---

## 5) PIANO PATCH (file da modificare)

- **Solo:** `src/components/gamification/StreakModal.tsx`
- **Modifiche:** sostituire Dialog con MapPillFlipOverlay; riusare layout Note (header + content scroll); GlassCard per blocchi; success overlay invariato

---

## 6) IMPLEMENTAZIONE COMPLETATA

- **File modificato:** `src/components/gamification/StreakModal.tsx`
- **Shell:** MapPillFlipOverlay (fullscreen, stessa animazione Note)
- **Layout:** header gradient cyan + content scroll con GlassCard
- **Success overlay:** portaled, z-index 100000, coerente Note-style
