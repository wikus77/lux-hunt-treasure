# FASE 1 — VERIFICA (READ-ONLY) — STREAK MODAL + CONFIRM OVERLAY

---

## OUTPUT VERIFICA — COMPONENTI TROVATI

### 1) Modal STREAK SYSTEM
| Campo | Valore |
|-------|--------|
| **File** | `src/components/gamification/StreakModal.tsx` |
| **Component** | `StreakModal` |
| **Render** | Aperto da `StreakPill` (`src/components/gamification/StreakPill.tsx`) |
| **Wrapper** | `Dialog` + `DialogContent` (Radix-style, da `@/components/ui/dialog.tsx`) |
| **i18n keys** | `streak_title`, `streak_subtitle`, `streak_days`, `streak_record`, `streak_next_badge`, `streak_badge_title`, `streak_checkin_cta`, `streak_success_title`, ecc. |

### 2) Modal/Overlay di conferma (post DAILY CHECK-IN)
| Campo | Valore |
|-------|--------|
| **File** | `src/components/gamification/StreakModal.tsx` (stesso file) |
| **Component** | Nessun componente separato — overlay inline (AnimatePresence + motion.div) |
| **Trigger** | `setShowSuccess(true)` dopo `handleCheckIn` completato (linea 186) |
| **Posizione** | Linee 266-292 — "Success Animation Overlay" |
| **Contenuto** | Check icon rotante, testo `t('streak_success_title')` ("Check-in Completato!") |

### 3) Diagnosi tecnica — "non pienamente visibile"

**Causa:** Il success overlay è `absolute inset-0` dentro un parent con `overflow-hidden`:
- `DialogContent` (linea 235): `className="... overflow-hidden"`
- `motion.div` container (linea 240): `className="... overflow-hidden"`
- L'animazione `scale: [0, 1.2, 1]` fa crescere il contenuto oltre i bounds; `overflow-hidden` lo taglia
- Il backdrop `bg-black/80 backdrop-blur-sm` è dentro lo stesso stacking context; z-50 può essere sopra il contenuto ma non sopra il Dialog root se ci sono limiti di max-height (Dialog ha `max-h-[85vh]`)

**Root cause:** `overflow-hidden` sul container + scale animation che supera i bounds → clipping dell'overlay di conferma.

### 4) Stile di riferimento
- **Note modal (MAP):** `MapPillFlipOverlay` + `DevNotesPanel` — fullscreen, header gradient cyan, glass cards, testo `rgba(255,255,255,0.9)`, safe-area
- **UserProfileModal (leaderboard):** Redesign recente — stesso pattern Note: backdrop `rgba(10,10,15,0.98)` blur, header gradient cyan, GlassCard

### 5) File da toccare (minima)
- `src/components/gamification/StreakModal.tsx` — **UNICO FILE**

---

## PIANO IMPLEMENTAZIONE

1. **Streak modal redesign:** Migliorare contrasto (text-white/90, evitare gray-400 su fondi scuri), background glass + gradient controllato, spacing, typography, safe-area, CTA leggibile.
2. **Success overlay visibilità:** Renderizzare l'overlay di conferma in un **portal** (createPortal) su `document.body` con z-index superiore al Dialog (es. 10001), oppure rimuovere `overflow-hidden` dal parent quando `showSuccess` è true e garantire che l'overlay copra tutto il viewport senza clipping.
