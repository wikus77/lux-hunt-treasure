# INCIDENT REPORT — LEADERBOARD i18n (iOS WRAPPED)

**Date:** 2026-02-14  
**Scope:** Solo Leaderboard (LeaderboardPage + UserProfileModal)  
**Vincoli:** NO BUZZ, notifiche, mappa, AION, header, bottom nav, edge functions, schema DB

---

## PHASE 0 — SNAPSHOT + ROLLBACK

### Git status
**Repo NON pulita.** File modificati:
- ios/App/App/public/* (bundle-analysis, index.html)
- src/components/notifications/* (6 file)
- src/locales/{it,en,fr}/common.json
- src/pages/Notifications.tsx
- src/utils/notificationCategories.ts
- forensics/*.md (untracked)

### Tag snapshot
**NON creato** (repo non pulita). Per procedere:
```bash
git add -A && git commit -m "wip: notifications i18n"  # opzionale
# oppure
git stash
git tag SNAPSHOT_PRE_LEADERBOARD_I18N_$(date +%Y%m%d_%H%M%S)
git push --tags
git stash pop  # se stash
```

### Comando rollback (quando tag esistente)
```bash
git reset --hard SNAPSHOT_PRE_LEADERBOARD_I18N_<TIMESTAMP>
git clean -fd
npm run build
npx cap sync ios
```
Alternativa: `SNAPSHOT_PRE_NOTIFICATIONS_I18N_20260214_035000` (se patch Leaderboard applicata dopo Notifications).

---

## PHASE 1 — VERIFY

### 1.1 Entrypoint e component tree

| Elemento | File | Note |
|----------|------|------|
| Route | `/leaderboard` | WouterRoutes.tsx:531 |
| Pagina | LeaderboardPage | src/pages/LeaderboardPage.tsx |
| Modal overlay | UserProfileModal | src/components/leaderboard/UserProfileModal.tsx |
| Popup (NON toccare) | MotivationalPopup | src/components/feedback — fuori scope |

**Component tree:**
```
LeaderboardPage
├── ForumQuickLink (inline)
├── Overtake Alert
├── Scope filters (global/country/region/city)
├── Current User Rank card
├── Refresh button
├── Leaderboard list (LeaderboardUserCard inline)
├── Stats footer (Agenti, Top Score, Max Streak)
├── Live indicator
├── MotivationalPopup (feedback — NON modificare)
└── UserProfileModal (modale long-press)
```

**Nessun createPortal:** UserProfileModal usa AnimatePresence + fixed div, non createPortal.

### 1.2 Stringhe hardcoded — tabella

| File | Linea | Stringa | Contesto UI | Soluzione |
|------|-------|---------|-------------|-----------|
| LeaderboardPage.tsx | 184 | `'Agente'` | Fallback nome utente | t('leaderboard_agent_fallback') |
| LeaderboardPage.tsx | 186 | `'Tu'` | Badge utente corrente | t('leaderboard_you_badge') |
| LeaderboardPage.tsx | 264 | `'Entra nel Forum'` | Bottone Forum | t('leaderboard_forum_enter') |
| LeaderboardPage.tsx | 394,400,406 | GOLD, SILVER, VIP | Tier badge | t('leaderboard_tier_*') |
| LeaderboardPage.tsx | 509-511 | `'LIVE'`, `' Classifica'` | Titolo header | t('leaderboard_live'), t('leaderboard_title') |
| LeaderboardPage.tsx | 519-520 | `'Aggiornamenti in tempo reale'` | Sottotitolo | t('leaderboard_realtime_updates') |
| LeaderboardPage.tsx | 416 | `'ti ha superato! Ora è #'` | Overtake alert | t('leaderboard_overtake_alert') |
| LeaderboardPage.tsx | 441 | Globale, Nazione, Regione, Città | Scope buttons | t('leaderboard_scope_*') |
| LeaderboardPage.tsx | 447 | `'Seleziona nazione/regione/città'` | Placeholder Select | t('leaderboard_select_*') |
| LeaderboardPage.tsx | 471 | `'La tua posizione'` | Card rank utente | t('leaderboard_your_position') |
| LeaderboardPage.tsx | 468 | `'pts'` | Punti | t('leaderboard_pts') |
| LeaderboardPage.tsx | 473 | `'d streak'` | Streak giorni | t('leaderboard_streak_days') |
| LeaderboardPage.tsx | 644 | `'Aggiorna'` | Bottone refresh | t('leaderboard_refresh') |
| LeaderboardPage.tsx | 472 | `'Riprova'` | Bottone retry errore | t('leaderboard_retry') |
| LeaderboardPage.tsx | 495-496 | `'Nessun agente trovato'` | Empty state | t('leaderboard_no_agents') |
| LeaderboardPage.tsx | 513-514 | Agenti, Top Score, Max Streak | Stats footer | t('leaderboard_*') |
| LeaderboardPage.tsx | 540 | `'Classifica live • Aggiornamento automatico'` | Live indicator | t('leaderboard_live_indicator') |
| UserProfileModal.tsx | 40-48 | Recluta, Agente, Operativo... | Hierarchy badge | t('leaderboard_hierarchy_*') |
| UserProfileModal.tsx | 147 | `'Agente Anonimo'` | Fallback nome | t('leaderboard_agent_anonymous') |
| UserProfileModal.tsx | 171 | `'Punti'` | Stat | t('leaderboard_profile_points') |
| UserProfileModal.tsx | 183 | `'Streak'` | Stat | t('leaderboard_profile_streak') |
| UserProfileModal.tsx | 195 | `'Indizi'` | Stat | t('leaderboard_profile_clues') |
| UserProfileModal.tsx | 202 | `'Iscritto il:'` | Data iscrizione | t('leaderboard_profile_joined') |
| UserProfileModal.tsx | 221 | `'Chiudi'` | Bottone | t('leaderboard_profile_close') |
| UserProfileModal.tsx | 227 | `'Chatta'` | CTA | t('leaderboard_profile_chat') |

### 1.3 Formattazioni

| File | Linea | Codice | Problema | Soluzione |
|------|-------|--------|----------|-----------|
| UserProfileModal.tsx | 57 | `toLocaleDateString('it-IT', ...)` | Locale hardcoded | Usare i18n.language → it-IT/en-US/fr-FR |
| LeaderboardPage.tsx | 227,621,713 | `toLocaleString()` | Nessun locale | Passare locale da i18n se progetto lo supporta (opzionale) |

### 1.4 Modali/overlay presenti

| Overlay | File | Trigger |
|---------|------|---------|
| UserProfileModal | UserProfileModal.tsx | Long-press su card utente |
| MotivationalPopup | feedback/MotivationalPopup | Mount automatico (NON in scope) |

### 1.5 useTranslation

- **LeaderboardPage:** non usa useTranslation
- **UserProfileModal:** non usa useTranslation

### 1.6 Componenti condivisi

- **UserProfileModal:** usato solo da LeaderboardPage → sicuro modificare
- **Button, Card, Badge, Avatar:** shadcn/ui, non modificare
- **MotivationalPopup:** feedback, NON toccare

### 1.7 Valutazione rischio

| Criterio | Valutazione |
|----------|-------------|
| Modifiche a BUZZ/notifiche/mappa | Nessuna |
| Modifiche a routing/header/nav | Nessuna |
| Componenti condivisi modificati | Solo UserProfileModal (usato solo da Leaderboard) |
| Logica cambiata | No, solo sostituzione stringhe |

**Rischio complessivo: Low**

### 1.8 Decisione

**SAFE TO PATCH**

---

## PHASE 2 — PATCH (applicata)

### File modificati
- `src/pages/LeaderboardPage.tsx` — useTranslation, t(...) per tutte le stringhe UI
- `src/components/leaderboard/UserProfileModal.tsx` — useTranslation, formatDate locale-aware, hierarchy badges i18n
- `src/locales/it/common.json` — 37 chiavi leaderboard_*
- `src/locales/en/common.json` — 37 chiavi leaderboard_*
- `src/locales/fr/common.json` — 37 chiavi leaderboard_*

### Chiavi aggiunte (IT/EN/FR)
| Chiave | IT | EN | FR |
|--------|----|----|-----|
| leaderboard_title | Classifica | Leaderboard | Classement |
| leaderboard_live | LIVE | LIVE | LIVE |
| leaderboard_realtime_updates | Aggiornamenti in tempo reale | Real-time updates | Mises à jour en temps réel |
| leaderboard_forum_enter | Entra nel Forum | Enter Forum | Entrer au Forum |
| leaderboard_overtake_alert | {{name}} ti ha superato! Ora è #{{rank}} | {{name}} overtook you! Now #{{rank}} | {{name}} vous a dépassé ! Maintenant #{{rank}} |
| leaderboard_scope_global/country/region/city | Globale, Nazione, Regione, Città | Global, Country, Region, City | Global, Pays, Région, Ville |
| leaderboard_select_country/region/city | Seleziona nazione/regione/città | Select country/region/city | Sélectionner pays/région/ville |
| leaderboard_your_position | La tua posizione | Your position | Votre position |
| leaderboard_pts | pts | pts | pts |
| leaderboard_streak_days | {{count}}d streak | {{count}}d streak | {{count}}j streak |
| leaderboard_refresh | Aggiorna | Refresh | Actualiser |
| leaderboard_retry | Riprova | Retry | Réessayer |
| leaderboard_no_agents | Nessun agente trovato | No agents found | Aucun agent trouvé |
| leaderboard_agents | Agenti | Agents | Agents |
| leaderboard_top_score | Top Score | Top Score | Meilleur score |
| leaderboard_max_streak | Max Streak | Max Streak | Max Streak |
| leaderboard_live_indicator | Classifica live • Aggiornamento automatico | Live leaderboard • Auto-update | Classement live • Mise à jour auto |
| leaderboard_agent_fallback | Agente | Agent | Agent |
| leaderboard_you_badge | Tu | You | Vous |
| leaderboard_tier_gold/silver/vip | GOLD, SILVER, VIP | GOLD, SILVER, VIP | GOLD, SILVER, VIP |
| leaderboard_agent_anonymous | Agente Anonimo | Anonymous Agent | Agent anonyme |
| leaderboard_hierarchy_* | Recluta, Agente, Operativo... | Recruit, Agent, Operative... | Recrue, Agent, Opératif... |
| leaderboard_profile_points | Punti | Points | Points |
| leaderboard_profile_streak | Streak | Streak | Streak |
| leaderboard_profile_clues | Indizi | Clues | Indices |
| leaderboard_profile_joined | Iscritto il: | Joined: | Inscrit le : |
| leaderboard_profile_close | Chiudi | Close | Fermer |
| leaderboard_profile_chat | Chatta | Chat | Discuter |

### Build + sync
- `npm run build` — OK
- `npx cap sync ios` — OK

---

## PHASE 3 — QA iOS (checklist)

1. Build/run su iPhone
2. Cambio lingua (IT → FR → EN): verificare titoli, scope, stats, modal
3. Long-press su card → UserProfileModal: Chiudi, Chatta, Punti, Streak, Indizi, Iscritto il
4. Nessun crash, overlay ok, scroll lock, safe-area
5. Verifica rapida: Home, Notifications (nessuna regressione)
