# ANIMATION IDENTIFIED — Card Notifiche → Header Impostazioni

**Data:** 2026-02-22  
**Scope:** Replicare l’animazione della card “Le tue notifiche” (NotificationsPage) solo nell’header del modale Impostazioni.

---

## Nome animazione (per riuso)

**Nome tecnico:** `NotificationsPanelEntrance`  
**Alias / nome da usare in chat:** **"GraphiteGlassSlideIn"** (stesso effetto: graphite glass + slide-up + fade-in + gradient line).

- **Componente/stile:** Container `m1-folder-glass--graphite` + `motion.div` (Framer Motion) con `initial={{ y: 20, opacity: 0 }}` / `animate={{ y: 0, opacity: 1 }}` + barra gradiente in alto (cyan → purple → amber).

---

## A) Dove è definita e applicata

| Elemento | File | Righe |
|----------|------|--------|
| Container glass | `src/pages/NotificationsPage.tsx` | 458–467 (`div.m1-folder-glass--graphite`) |
| Motion + panel | `src/pages/NotificationsPage.tsx` | 470–477 (`motion.div` con initial/animate, `className="m1-panel relative"`) |
| Gradient line | `src/pages/NotificationsPage.tsx` | 478 |
| Stili CSS glass | `src/index.css` | 1371–1386 (`.m1-folder-glass--graphite`) |

---

## B) Tipo animazione

- **Framer Motion:** sì — `motion.div` con `initial={{ y: 20, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}` (nessun `transition` esplicito → default).
- **CSS:** sì — classe `.m1-folder-glass--graphite` (blur, bordo, box-shadow, border-radius); nessun `@keyframes` sull’header.
- **Tailwind:** solo per la linea: `absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90 rounded-t-2xl`.
- **Trigger:** on mount (entrata in pagina/tab).

---

## C) Dipendenze

- `framer-motion` (già usato in NotificationsPage).
- Classe globale `.m1-folder-glass--graphite` e `.m1-panel` in `src/index.css`.

---

## D) Snippet minimo (pattern da riusare)

```tsx
<div className="m1-folder-glass--graphite" style={{ position: 'relative', width: '100%', padding: 0 }}>
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="m1-panel relative"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90 rounded-t-2xl" />
    {/* contenuto header */}
  </motion.div>
</div>
```

---

## Conferma

**100% same animation found.**  
Patch applicata solo all’header del modale Impostazioni (`SettingsContent.tsx`): stesso wrapper glass, stesso `motion.div` e stessa gradient line.

---

## File toccati (patch)

1. `src/components/settings/SettingsContent.tsx` — import `motion`; header avvolto in `m1-folder-glass--graphite` + `motion.div` + gradient line.

Nessun altro file modificato.
