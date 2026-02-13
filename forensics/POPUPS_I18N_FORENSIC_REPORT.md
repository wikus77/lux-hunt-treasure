# POPUPS I18N FORENSIC REPORT

**Date:** 2026-02-13  
**Context:** Popup/toast non localizzati su iOS wrapped  
**Scope:** MotivationalPopup, CelebrationToast/Modal (game events), Portal ACCESS DENIED

---

## 1. MAPPA COMPONENTI COINVOLTI

### 1.1 MotivationalPopup (banner verde su cambio pagina)
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `src/components/feedback/MotivationalPopup.tsx` |
| **Render** | createPortal → document.body |
| **Pagine che lo usano** | AppHome, BuzzPage, IntelligencePage, LeaderboardPage, MapTiler3D, IntelligenceStyledPage |
| **Trigger** | useEffect al mount, delay 500ms, throttle 5 min (già fix) |
| **Contenuto** | Oggetto `MESSAGES` con `{ title, description }[]` per pageType (map, buzz, aion, leaderboard, home, forum) |

### 1.2 Popup "CASHBACK ACCUMULATO" / "BUZZ COMPLETATO!"
| Aspetto | Dettaglio |
|---------|-----------|
| **Sorgente** | `src/gameplay/events/gameEvents.ts` → `getEventCopy(event)` |
| **Consumer** | `CelebrationToast.tsx`, `CelebrationModal.tsx` (usano copy.title, copy.effect, copy.nextStep, copy.cta) |
| **Trigger** | Eventi `m1ssion:game-event` (emitGameEvent da BuzzActionButton, useCashbackWallet, ecc.) |
| **Eventi rilevanti** | `BUZZ_SUCCESS`, `CASHBACK_ACCRUED`, e altri in getEventCopy |

### 1.3 Toast/top banner "ACCESS DENIED …"
| Aspetto | Dettaglio |
|---------|-----------|
| **Sorgente** | `src/config/portalsConfig.ts` (linea 243) |
| **Contesto** | `dialogueLocked` del portal HOLLYWOOD_GATE (id: p_hollywood) |
| **Render** | `PortalBehaviorOverlay.tsx` → `DialogueDisplay` (linee 100-108: `dialogues`, `fullText = lines.join('\n')`) |
| **Righe** | `['ACCESS DENIED — Level 19 required.', 'Create more BUZZ MAP areas to unlock.']` |

### 1.4 Altri popup/toast
| Componente | File | Tipo | Note |
|------------|------|------|------|
| CelebrationModal | `CelebrationModal.tsx` | Modal | "PROSSIMO PASSO" (linea 253), "CONTINUA" (linea 273) hardcoded |
| CelebrationToast | `CelebrationToast.tsx` | Toast overlay | Usa getEventCopy, no altre stringhe hardcoded |

---

## 2. ELENCO STRINGHE HARDCODED (file + linea)

### 2.1 MotivationalPopup – MESSAGES (linee 15-99)
Tutte le coppie `{ title, description }` per map, buzz, aion, leaderboard, home, forum. Esempi:
- `BOOST DISPONIBILE` / `Premi BUZZ per accelerare i tuoi progressi!` (buzz)
- `AION TI ATTENDE` / `L'AI analyst ha nuovi insights per te!` (aion)
- `PREMI ESCLUSIVI` / `I top Agent ricevono bonus speciali!` (leaderboard)
- `PREMI IN ATTESA` / `Controlla i tuoi reward!` (home)
- `CASHBACK ACCUMULATO` / `Ogni BUZZ aumenta il tuo vault!` (buzz)

### 2.2 gameEvents.ts – getEventCopy (linee 91-259)
| Event | title | effect | nextStep | cta.label |
|-------|-------|--------|----------|-----------|
| BUZZ_SUCCESS | ✅ BUZZ COMPLETATO! | Hai ottenuto un nuovo indizio | Continua a esplorare... | - |
| CASHBACK_ACCRUED | 🏦 CASHBACK ACCUMULATO | +€{{amount}} nel tuo Vault | Sblocca il cashback... | - |
| BUZZ_INSUFFICIENT_M1U | ⚠️ M1U INSUFFICIENTI | Servono X M1U... | Ottieni M1U... | OTTIENI M1U |
| BUZZ_MAP_AREA_CREATED | 🗺️ AREA SBLOCCATA! | ... | ... | ESPLORA |
| BUZZ_MAP_CLUE_FOUND | 🔍 INDIZIO TROVATO! | ... | ... | VEDI INDIZI |
| AION_ANALYSIS_COMPLETE | 🤖 ANALISI COMPLETATA | ... | ... | - |
| BATTLE_WIN | 🏆 VITTORIA! | ... | ... | NUOVA SFIDA |
| BATTLE_LOSE | 💪 SCONFITTO | ... | ... | RITENTA |
| PULSE_BREAKER_CASHOUT | 💎 CASHOUT PERFETTO! | ... | ... | FAI BUZZ |
| PULSE_BREAKER_CRASH | 💥 CRASH! | ... | ... | - |
| MILESTONE_REACHED | 🎖️ MILESTONE | ... | ... | CONTINUA |
| LEVEL_UP | ⬆️ LEVEL UP! | ... | ... | VAI ALLA MAPPA |
| RANK_UP | 🌟 RANK UP! | ... | ... | CLASSIFICA |
| M1U_CREDITED | 💰 M1U RICEVUTI | ... | ... | - |
| PE_GAINED | ⚡ ENERGIA GUADAGNATA | ... | ... | - |
| MARKER_REWARD_CLAIMED | 🎁 PREMIO RISCATTATO! | ... | ... | CERCA ALTRI |
| LEADERBOARD_POSITION_UP | 📈 SEI SALITO! | ... | ... | - |
| LEADERBOARD_POSITION_DOWN | 📉 POSIZIONE PERSA | ... | ... | FAI BUZZ |
| default | ✅ AZIONE COMPLETATA | Hai fatto progressi! | ... | - |

### 2.3 CelebrationModal (linee 253, 273)
- `🎯 PROSSIMO PASSO` (label card)
- `CONTINUA` (fallback CTA)

### 2.4 portalsConfig.ts – HOLLYWOOD_GATE (linea 243)
- `ACCESS DENIED — Level 19 required.`
- `Create more BUZZ MAP areas to unlock.`

### 2.5 MotivationalPopup – hint swipe (linea 276)
- `↑ swipe per chiudere`

---

## 3. CLASSIFICAZIONE

| Stringa / gruppo | Tipo UI | Pagina / contesto | Chiave i18n esistente? |
|------------------|---------|-------------------|------------------------|
| MESSAGES MotivationalPopup | Banner verde | Home/Buzz/AION/Leaderboard/Map | No – nuove `motivation_*` |
| BUZZ_SUCCESS title/effect | Toast/Modal | Post-BUZZ | No – `game_buzz_success_*` |
| CASHBACK_ACCRUED title/effect | Toast/Modal | Post-cashback | No – `game_cashback_*` |
| Altri getEventCopy | Toast/Modal | Vari | No – `game_*` |
| PROSSIMO PASSO, CONTINUA | Modal | Celebration | No – `game_next_step`, `game_continue` |
| ACCESS DENIED (Hollywood) | Portal overlay | Mappa (portal LA) | No – `portal_hollywood_locked_*` |
| swipe per chiudere | Banner hint | MotivationalPopup | No – `motivation_swipe_hint` |

---

## 4. STRATEGIA PATCH

### A) MotivationalPopup
- Sostituire `MESSAGES` con struttura chiavi: `{ titleKey, descKey }[]`
- In render: `t(message.titleKey)`, `t(message.descKey)`
- Aggiungere `motivation_swipe_hint` per hint swipe
- Mantenere throttle/dedupe invariato

### B) gameEvents.ts + CelebrationToast/Modal
- Estendere `getEventCopy(event, t: TFunction)` – secondo parametro opzionale
- Quando `t` presente, usare `t('game_xxx_title', {...})` al posto delle stringhe fisse
- CelebrationToast e CelebrationModal: `useTranslation()`, passare `t` a `getEventCopy`
- CelebrationModal: localizzare "PROSSIMO PASSO" e "CONTINUA"

### C) portalsConfig + PortalBehaviorOverlay
- Estendere `PortalDialogue` con `lineKeys?: string[]` opzionale
- Per HOLLYWOOD_GATE: aggiungere `lineKeys: ['portal_hollywood_locked_1', 'portal_hollywood_locked_2']`
- In DialogueDisplay: se `lineKeys` esiste, usare `t(lineKeys[i])`, altrimenti `lines[i]`

### D) Locales
- Aggiungere tutte le chiavi in `it`, `en`, `fr` in `common.json`

---

## 5. ROLLBACK

```bash
git reset --hard SNAPSHOT_PRE_POPUPS_I18N_20260213_164941
git clean -fd
npm run build
npx cap sync ios
```

**Tag:** `SNAPSHOT_PRE_POPUPS_I18N_20260213_164941`
