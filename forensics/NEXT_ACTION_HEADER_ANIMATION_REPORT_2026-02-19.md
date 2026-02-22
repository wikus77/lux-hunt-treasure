# NEXT ACTION HEADER ANIMATION — Report

**Data:** 2026-02-22  
**Nome animazione:** NotificationsCardMotion (GraphiteGlassSlideIn)

---

## 1. File modale “Prossima Azione”

- **File:** `src/components/feedback/NextActionContent.tsx`
- **Header/top area (prima):** righe 172–224 — `div` con gradiente verde inline, pulsante X, titolo `home_next_action_title`, sottotitolo.
- **Header (dopo patch):** stesso blocco avvolto in wrapper `m1-folder-glass--graphite` + `motion.div` (initial/animate) + barra gradiente top; markup interno (X, titolo, sottotitolo) invariato.

---

## 2. Reference usato (SettingsContent)

- **File:** `src/components/settings/SettingsContent.tsx`
- **Righe snippet:** 191–257 (wrapper graphite + motion.div + gradient line).
- **Contenuto confermato:**
  - `import { motion } from 'framer-motion'`
  - wrapper: `className="m1-folder-glass--graphite"`, `borderRadius: '24px 24px 0 0'`
  - `motion.div` con `initial={{ y: 20, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}`, `className="m1-panel relative"`
  - barra: `className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90 rounded-t-2xl"`
- **Conferma:** 100% same animation.

---

## 3. File toccati

| File | Modifica |
|------|----------|
| `src/components/feedback/NextActionContent.tsx` | Solo top area: header avvolto in NotificationsCardMotion (graphite glass + motion + gradient bar). Nessun cambio a handlers, state, props, contenuto sotto. |

Nessun altro file modificato.

---

## 4. Comandi eseguiti

- **Build web:** `npm run build`
- **Sync iOS:** `npx cap sync ios`

---

## 5. Rollback

- **Tag creato:** `safety/next-action-header-animation_before_20260222_1230`
- **Rollback esatto:**  
  `git reset --hard safety/next-action-header-animation_before_20260222_1230`

---

## 6. Branch

- **Branch:** `fix/next-action-modal-header-animation` (già esistente; patch applicata sul working tree corrente).
