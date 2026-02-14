# AION / INTELLIGENCE I18N VERIFY REPORT

**Date:** 2026-02-13  
**Context:** Verifica stato i18n pre-AION patch + mappa AION/Intelligence  
**Tag rollback:** `SNAPSHOT_PRE_AION_INTELLIGENCE_I18N_20260213_172301`

---

## TASK 1 — VERIFICA "GIÀ FATTO?"

### 1. MotivationalPopup → **DONE** ✓

| Check | Esito |
|-------|-------|
| `src/components/feedback/MotivationalPopup.tsx` | ✓ |
| Usa `useTranslation()` | ✓ (linea 12, 139) |
| Usa chiavi i18n (NO hardcoded MESSAGES) | ✓ `MESSAGE_KEYS` con titleKey/descKey (linee 15-100) |
| `motivation_swipe_hint` i18n | ✓ (linea 306: `t('motivation_swipe_hint')`) |

**NON TOCCARE.**

---

### 2. Game Events / Celebration → **PARZIALE** ⚠️

| Componente | Check | Esito |
|------------|-------|-------|
| `gameEvents.ts` | `getEventCopy(event, t?)` accetta `t` | ✓ |
| | Non hardcoded (usa `tr(key, params, fallback)`) | ✓ |
| `CelebrationToast.tsx` | Passa `t` a `getEventCopy(event, t)` | ✓ (linea 27) |
| `CelebrationModal.tsx` | Passa `t` a `getEventCopy` | ❌ **NO** — linea 35: `getEventCopy(event)` senza `t` |
| | "PROSSIMO PASSO" i18n | ✓ (linea 255: `t('game_next_step')`) |
| | "CONTINUA" i18n | ✓ (linea 274: `t('game_continue')`) |

**PATCH NECESSARIA:** CelebrationModal deve passare `t` a `getEventCopy(event, t)` affinché copy.title/effect/nextStep/cta siano localizzati.

---

### 3. Portals Hollywood → **DONE** ✓

| Check | Esito |
|-------|-------|
| `portalsConfig.ts` | `lineKeys: ['portal_hollywood_locked_1', 'portal_hollywood_locked_2']` (linee 247-248) | ✓ |
| `PortalBehaviorOverlay.tsx` | `DialogueDisplay` usa `lineKeys` con `t(k)` (linee 111-114) | ✓ |

**NON TOCCARE.**

---

## TASK 2 — MAPPA AION/INTELLIGENCE

### 2.1 Route e component tree

| Route | File principale | Componenti UI |
|-------|-----------------|---------------|
| `/intelligence` | `IntelligencePage.tsx` | AionEntity, IntelChatPanel, M1UPill, MotivationalPopup |
| `/intelligence` (AI enabled) | `IntelligenceStyledPage.tsx` | AiOrbStage, AIAnalystPanel |
| `/intelligence/*` (legacy) | `IntelligenceStyledPage.tsx` | Cards, intelligenceModules, stats |

### 2.2 Stringhe hardcoded AION/Intelligence

| File | Linea | Testo | Tipo |
|------|-------|-------|------|
| `IntelligencePage.tsx` | 109 | `Neural Link Established` | Label |
| `IntelChatPanel.tsx` | 56 | `Connessione neurale stabilizzata. Sono AION...` | System message |
| `IntelChatPanel.tsx` | 399 | `Neural Link Established` | Header |
| `IntelChatPanel.tsx` | 539 | `Scrivi un messaggio...` | Placeholder input |
| `IntelChatPanel.tsx` | 509-510 | `gratis`, `M1U` | Status pill |
| `IntelChatPanel.tsx` | 507-511 | `Verifica accesso in corso...`, `AION sta parlando...`, `Pronto` | Status bar |
| `IntelChatPanel.tsx` | 479 | `Riprova (X tentativi)` | Retry button |
| `IntelChatPanel.tsx` | 42-48 | `ERROR_MESSAGES` (7 messaggi) | Error copy |
| `IntelligenceStyledPage.tsx` | 123-165 | `intelligenceModules` (name, description, status, level) | Module cards |
| `IntelligenceStyledPage.tsx` | 198, 213 | `Caricamento Intelligence...`, `Caricamento...` | Loading |
| `IntelligenceStyledPage.tsx` | 263-274, 284, 295, ... | Legacy UI labels | Labels |
| `AIAnalystPanel.tsx` | 34-39 | `QUICK_CHIPS` (5 label) | Chips |
| `AIAnalystPanel.tsx` | 43-49 | `PLACEHOLDERS` (6 placeholder) | Input rotation |
| `AiDock.tsx` | 37, 47, 62 | `Open Final Shot`, `Disable/Enable microphone`, `More options` | aria-label |

---

## PATCH APPLICATE (TASK 2)

### Fix CelebrationModal (completamento)
- `CelebrationModal.tsx`: `getEventCopy(event, t)` — ora copy localizzato

### File modificati AION/Intelligence
| File | Modifiche |
|------|-----------|
| `IntelligencePage.tsx` | `aion_neural_link_established` |
| `IntelChatPanel.tsx` | System welcome, header, placeholder, status, retry, error keys |
| `IntelligenceStyledPage.tsx` | Modules, stats, loading, legacy UI |
| `AIAnalystPanel.tsx` | QUICK_CHIPS→labelKey, PLACEHOLDER_KEYS |
| `AiDock.tsx` | aria-labels i18n |
| `CelebrationModal.tsx` | getEventCopy(event, t) |

### Chiavi aggiunte (it/en/fr)
- `aion_neural_link_established`, `aion_system_welcome`, `aion_input_placeholder`
- `aion_status_*`, `aion_retry_button`, `aion_error_*` (6)
- `intel_loading`, `intel_loading_generic`, `intel_panel_title`, `intel_panel_subtitle`
- `intel_modules_title`, `intel_stats_title`, `intel_quick_actions_title`
- `intel_module_*` (6 moduli: coordinates, journal, archive, radar, interceptor, finalshot)
- `intel_status_*`, `intel_level_*`, `intel_label_*`, `intel_stats_*`
- `intel_cta_*`, `intel_m1ssion_title`
- `aion_chip_*` (5), `aion_placeholder_*` (6), `aion_dock_*` (4)

---

## ROLLBACK (se necessario)

```bash
git reset --hard SNAPSHOT_PRE_AION_INTELLIGENCE_I18N_20260213_172301
git clean -fd
npm run build
npx cap sync ios
```

**Tag snapshot pre-AION:** `SNAPSHOT_PRE_AION_INTELLIGENCE_I18N_20260213_172301`
