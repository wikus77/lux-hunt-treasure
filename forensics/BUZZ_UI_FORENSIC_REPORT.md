# BUZZ UI FORENSIC REPORT

**Date:** 2026-02-13  
**Context:** i18n completamento pagina BUZZ + green toast su navigazione (UI-only)  
**Scope:** BuzzPage container, MotivationalPopup (banner verdi)

---

## 1. COMPONENT MAP – Pagina BUZZ

### Route
- **Path:** `/buzz`
- **File routes:** `src/routes/WouterRoutes.tsx` (line 410)
- **Page component:** `src/pages/BuzzPage.tsx`
- **Layout:** `GlobalLayout` (header + bottom nav)

### Component tree
```
BuzzPage
├── BuzzRewardHandler (onRewardRedeemed)
├── main
│   ├── AnimatePresence (gate overlay – showGate=false, non visibile)
│   ├── BuzzActionButton (tasto BUZZ)
│   ├── div.buzz-folder-glass ← CONTAINER SOTTO TASTO (testi hardcoded)
│   └── ...
├── MotivationalPopup (pageType="buzz") ← BANNER VERDE
└── M1UPill (fixed overlay)
```

### File → responsabilità
| File | Responsabilità |
|------|----------------|
| `src/pages/BuzzPage.tsx` | Page principale, container info sotto BUZZ, gate (disabilitato) |
| `src/components/buzz/BuzzActionButton.tsx` | Tasto BUZZ, logica pricing/free buzz |
| `src/components/buzz/BuzzInstructions.tsx` | **Non usato** da BuzzPage (legacy/alternativo) |
| `src/components/feedback/MotivationalPopup.tsx` | Banner verde “motivazionale” su entry pagina |

---

## 2. STRINGHE HARDCODED – Container sotto tasto BUZZ

**File:** `src/pages/BuzzPage.tsx` (linee 251-266)

| Riga | Testo | Tipo |
|------|-------|------|
| 251 | `Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti per raggiungere l'obiettivo di 250 indizi totali.` | Paragrafo |
| 252 | `BUZZ oggi: {dailyBuzzCounter} (prezzo progressivo)` | Label + interp |
| 253 | `BUZZ totali: {stats?.total_count \|\| 0}/250 (target finale)` | Label + interp |
| 254 | `Prossimo: {currentPriceDisplay}` | Label + interp |
| 266 | `Ogni BUZZ consuma M1U dal tuo saldo` | Hint |

### Gate overlay (showGate=true, attualmente disabilitato)
| Riga | Testo |
|------|-------|
| 201 | `MISSIONE NON AVVIATA` |
| 206 | `Per utilizzare BUZZ devi prima avviare la missione del mese.` |
| 208 | `Torna alla Home e premi START M1SSION.` |
| 223 | `VAI ALLA HOME` |
| 229 | `Il BUZZ sarà disponibile dopo l'avvio` |

---

## 3. CHIAVI I18N ESISTENTI vs MANCANTI

### Esistenti (locales it/en/fr)
- `cta_buzz`, `cta_show_map`
- `buzz_notifications`, `buzz_notifications_desc`
- `learn_buzzclues_title`
- `home_active_found_via_buzz`, `home_active_press_buzz`
- `home_next_action_buzz_desc`, `home_next_action_buzz_used`
- `home_agent_buzz_hint`, `home_agent_clues_via_buzz`

### Mancanti per container Buzz
| Chiave proposta | IT | EN | FR |
|-----------------|----|----|-----|
| `buzz_container_desc` | Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti per raggiungere l'obiettivo di 250 indizi totali. | Press the button to send a signal and discover new clues. Each Buzz helps you find hidden clues to reach the goal of 250 total clues. | Appuyez sur le bouton pour envoyer un signal et découvrir de nouveaux indices. Chaque Buzz vous aide à trouver des indices cachés pour atteindre l'objectif de 250 indices au total. |
| `buzz_today_label` | BUZZ oggi: {{count}} (prezzo progressivo) | BUZZ today: {{count}} (progressive price) | BUZZ aujourd'hui : {{count}} (prix progressif) |
| `buzz_total_label` | BUZZ totali: {{found}}/250 (target finale) | BUZZ total: {{found}}/250 (final target) | BUZZ total : {{found}}/250 (objectif final) |
| `buzz_next_label` | Prossimo: {{price}} | Next: {{price}} | Suivant : {{price}} |
| `buzz_m1u_hint` | Ogni BUZZ consuma M1U dal tuo saldo | Each BUZZ consumes M1U from your balance | Chaque BUZZ consomme des M1U de votre solde |

---

## 4. ROOT CAUSE – Toast/Banner verdi su navigazione

### Componente
- **File:** `src/components/feedback/MotivationalPopup.tsx`
- **Uso:** Ogni pagina (Home, Buzz, AION, Leaderboard, Map) monta `<MotivationalPopup pageType="X" />`.

### Trigger
- **useEffect** al mount (linee 121-143)
- `delay = 500` ms
- `showOnce = true` → usa `shownPopups` (Set module-level) con chiave `motivational_${pageType}`

### Perché appaiono “su ogni cambio pagina”
- Ogni route monta il proprio MotivationalPopup con `pageType` diverso
- Es: Home → Buzz → AION → Leaderboard = 4 popup in sequenza (uno per pagina)
- Il Set evita di mostrare due volte lo stesso pageType, ma non limita il totale
- Risultato: navigando tra 4 tab si vedono 4 banner verdi consecutivi → sensazione di spam

### Testi esempi
- `BOOST DISPONIBILE`, `PREMI IN ATTESA`, `AION TI ATTENDE`, `PREMI ESCLUSIVI`, ecc.
- Mappa in `MESSAGES` (linee 15-99) – tutti hardcoded IT

### Fix proposto (UI-only)
- Throttle globale: non mostrare alcun MotivationalPopup se ne è stato mostrato uno negli ultimi **5 minuti** (sessionStorage `motivational_last_shown`)
- Nessun cambio a routing, push, backend, store

---

## 5. ROLLBACK

```bash
git reset --hard SNAPSHOT_PRE_BUZZ_UI_FIX_20260213_162946
git clean -fd
npm run build
npx cap sync ios
```

**Tag creato:** `SNAPSHOT_PRE_BUZZ_UI_FIX_20260213_162946`
