# IOS UI FORENSIC REPORT
**Data**: 31/01/2026
**Branch**: `fix/ios-overscroll-contrast`
**Commit base**: `b3f3c71` (CHECKPOINT: Pre-fix state for rollback)
**Rollback tag**: `IOS_UI_FORENSIC_START`

---

## EXECUTIVE SUMMARY

| Metrica | Valore | Status |
|---------|--------|--------|
| Stabilità UI | 25/40 | 🔴 CRITICO |
| Determinismo tema | 10/30 | 🔴 CRITICO |
| Assenza overlay/overscroll | 15/20 | 🟡 MEDIO |
| Igiene CSS | 8/10 | 🟢 OK |
| **VOTO TOTALE** | **58/100** | 🟠 INSUFFICIENTE |

---

## ROOT CAUSES IDENTIFICATE

### RC-1: INCOERENZA NELLA MANIPOLAZIONE `html`/`body` CLASSES (CRITICO)

**Evidenza**: Le pagine usano approcci DIVERSI per applicare il tema white (`sn-page`):

| Pagina | html class | body class | Inline styles on html | Cleanup |
|--------|------------|------------|----------------------|---------|
| **LeaderboardPage.tsx** | ❌ NO | ❌ NO | ❌ NO | N/A |
| Notifications.tsx | ✅ SÌ | ❌ NO | ✅ SÌ (background) | ✅ |
| AppHome.tsx | ✅ SÌ | ✅ SÌ | ❌ NO | ✅ |
| BuzzPage.tsx | ✅ SÌ | ✅ SÌ | ❌ NO | ✅ |
| IntelligencePage.tsx | ✅ SÌ | ✅ SÌ | ❌ NO | ✅ |

**File/Linee**:
- `src/pages/LeaderboardPage.tsx:453` → Solo `className="sn-page"` sul container
- `src/pages/Notifications.tsx:47-68` → useEffect con inline styles
- `src/pages/AppHome.tsx:193-202` → useEffect con html+body classes
- `src/pages/BuzzPage.tsx:101-110` → useEffect con html+body classes
- `src/pages/IntelligencePage.tsx:25-34` → useEffect con html+body classes

**Impatto**: Quando si naviga tra pagine, le classi `sn-page` su `html`/`body` possono:
1. Rimanere "sporche" durante transizioni (race condition con cleanup)
2. Essere assenti se la pagina target non le aggiunge
3. Causare conflitti con stili inline residui

**Perché LeaderboardPage è stabile**: NON manipola `html`/`body`, usa solo classe sul container div. Questo evita conflitti e race conditions.

---

### RC-2: DUPLICAZIONE COMPONENTI HEADER/NAV (MEDIO)

**Evidenza**: Analisi grep mostra multipli punti di mount:

**BottomNavigation montato in**:
1. `GlobalLayout.tsx:120` (wrapper principale)
2. `NotificationsPage.tsx:686` (DUPLICATO!)
3. `Home.tsx:340`
4. Molte pagine settings
5. Wrapper: `BottomNavWrapper.tsx`, `NavigationWrapper.tsx`, `MainLayout.tsx`, `HomeLayout.tsx`, `PublicLayout.tsx`, `ProfileLayout.tsx`

**UnifiedHeader montato in**:
1. `GlobalLayout.tsx:93, 132` (wrapper principale)
2. Molte pagine individuali

**Query DOM attesa**:
```javascript
document.querySelectorAll('.bottom-navigation-ios').length // Potenziale > 1
document.querySelectorAll('.unified-header-wrapper').length // Potenziale > 1
```

**Impatto**: Quando una pagina è wrappata in `GlobalLayout` E monta anche i propri componenti, si creano duplicati invisibili che possono:
- Ricevere eventi click/touch
- Consumare risorse
- Confondere la gestione dello stato

---

### RC-3: SETTINGS MODAL NON RICEVE TEMA CORRETTAMENTE (MEDIO)

**Evidenza**: Il `GlassModal.tsx` (usato da `SettingsModal.tsx`) ha:

```tsx
// src/components/ui/GlassModal.tsx:146
<div className="rounded-t-3xl bg-[#0a0a0f]/85 backdrop-blur-xl ...">
```

**MA** i CSS rules in `ios-native.css:645-706` cercano:
- `[data-radix-dialog-content]`
- `[role="dialog"]`
- `.settings-modal`

**GlassModal NON usa questi selettori**, quindi le regole CSS per white theme NON si applicano.

**Comportamento osservato**:
- Prima apertura: SEMPRE dark (fallback hardcoded)
- Dopo navigazione Home → Riapertura: Dipende dallo stato `sn-page` su html/body

---

### RC-4: OVERSCROLL BIANCO CAUSATO DA SFONDO SU `html` (BASSO-MEDIO)

**Evidenza**: Quando `html.sn-page` è attivo, CSS in `src/index.css` applica:

```css
html.sn-page,
body.sn-page {
  background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 50%, #EAEAEC 100%) !important;
}
```

**Ma** il layer nativo WKWebView dietro `html` ha un colore diverso (configurato in `AppDelegate.swift`).

**Quando si overscroll** verso l'alto, il contenuto web si sposta e si vede:
- Se `html` ha sfondo bianco → overlay bianco durante overscroll
- Se `html` non ha sfondo → si vede il colore nativo (scuro)

**LeaderboardPage non ha questo problema** perché NON applica sfondo bianco a `html`.

---

## FASE 2: AUDIT DUPLICATI

### Header Duplicati
```
CONTEGGIO ATTESO DOM:
- Route /home:           GlobalLayout(1) + AppHome(0) = 1 header ✅
- Route /notifications:  GlobalLayout(1) + Notifications(0) = 1 header ✅
- Route /leaderboard:    GlobalLayout(1) + LeaderboardPage(0) = 1 header ✅
- Route /settings/*:     Page(1) + GlobalLayout(0)* = 1 header ⚠️ (no GlobalLayout?)
```

### BottomNav Duplicati
```
PROBLEMI RILEVATI:
- NotificationsPage.tsx:686 → Monta BottomNavigation ma non è usato nelle routes
- Molte pagine settings montano BottomNavigation senza GlobalLayout
```

### Modal Portal Roots
```
- GlassModal crea: #m1-modal-portal (dinamico)
- Nessun duplicato rilevato per portali
```

---

## FASE 3: FORENSE CSS/TEMA

### Tabella Classi html/body per Pagina

| Pagina | html classes (runtime) | body classes (runtime) | Inline styles html |
|--------|------------------------|------------------------|-------------------|
| LeaderboardPage | (base) | is-native | none |
| AppHome | sn-page (added) | is-native, sn-page (added) | none |
| BuzzPage | sn-page (added) | is-native, sn-page (added) | none |
| IntelligencePage | sn-page (added) | is-native, sn-page (added) | none |
| Notifications | sn-page (added) | is-native | background gradient |

### Ordine CSS Import

```
1. src/index.css (base + sn-page rules)
2. src/styles/soft-native.css (white theme variables)
3. src/styles/ios-native.css (iOS WKWebView fixes)
4. Component-level styles (Tailwind)
```

### Differenza Strutturale LeaderboardPage vs Altri

| Aspetto | LeaderboardPage | AppHome/BuzzPage/etc |
|---------|-----------------|----------------------|
| Scroll container | Container div | Container div |
| Background | Via CSS `.sn-page` | Via CSS + html/body manipulation |
| html class | ❌ Non modificato | ✅ `sn-page` aggiunto |
| body class | ❌ Non modificato | ✅ `sn-page` aggiunto |
| Inline styles | ❌ Nessuno | ⚠️ Notifications aggiunge |
| Cleanup | N/A | useEffect cleanup |
| Determinismo | ✅ ALTO | ❌ BASSO |

---

## FASE 4: CSS ERRORS AUDIT

### Errori Rilevati: 0 (Linter)

ReadLints su `index.css`, `ios-native.css`, `soft-native.css` non ha riportato errori.

### Potenziali Problemi CSS (Non errori ma warning):

1. **RTL Keyframes** in `ios-native.css` (pre-esistenti)
   - Impatto: Solo utenti RTL, ignorato da WKWebView
   - Classificazione: Pre-esistente, basso impatto

2. **Tailwind @apply warnings** (benign)
   - Processati da PostCSS
   - Classificazione: Pre-esistente, nessun impatto

---

## FASE 5: PROPOSTE FIX (SOLO PROPOSTE)

### P0: DETERMINISMO TEMA (CRITICO)

**Fix proposto**: Unificare l'approccio di LeaderboardPage per TUTTE le pagine white theme.

| Aspetto | Modifica | File | Rischio |
|---------|----------|------|---------|
| Rimuovere useEffect html/body | Eliminare manipolazione classList | AppHome.tsx, BuzzPage.tsx, IntelligencePage.tsx, Notifications.tsx | MEDIO |
| Usare solo classe container | `className="sn-page"` sul div root | Tutte le pagine | BASSO |
| Rimuovere inline styles | Eliminare `document.documentElement.style` | Notifications.tsx | BASSO |

**Meccanismo**: Affidare lo styling white theme SOLO a CSS rules su `.sn-page` container, non su `html`/`body`.

**Test iOS**:
1. Cold start → Home → Verifica tema
2. Navigate Notifications → Home → Verifica tema invariato
3. Open Settings → Verifica tema

**Rischio**: MEDIO - Potrebbe richiedere aggiustamenti CSS per selettori `:has(.sn-page)`

---

### P1: COERENZA HEADER/BOTTOMNAV (MEDIO)

**Fix proposto**: Single source of truth in GlobalLayout.

| Aspetto | Modifica | File | Rischio |
|---------|----------|------|---------|
| Rimuovere BottomNav duplicati | Eliminare `<BottomNavigation />` | NotificationsPage.tsx:686 | BASSO |
| Verificare routes settings | Assicurarsi che usino GlobalLayout | WouterRoutes.tsx | MEDIO |

**Meccanismo**: Solo GlobalLayout monta Header e BottomNav. Pagine individuali non devono montarli.

**Test iOS**:
1. Contare DOM elements con class `bottom-navigation-ios` (deve essere 1)
2. Navigate tra tutte le tab → Nessun flash/duplicate

**Rischio**: BASSO

---

### P2: OVERSCROLL OVERLAY (BASSO-MEDIO)

**Fix proposto**: Non applicare background a `html`/`body` per sn-page, solo a container.

| Aspetto | Modifica | File | Rischio |
|---------|----------|------|---------|
| Modificare CSS rules | Rimuovere `html.sn-page { background: ... }` | src/index.css | MEDIO |
| Aggiungere background a container | `.sn-page { background: linear-gradient(...) }` | src/index.css | BASSO |

**Meccanismo**: Il layer nativo WKWebView rimarrà con il suo colore scuro, il container `.sn-page` avrà lo sfondo bianco. Durante overscroll si vedrà il colore nativo.

**Test iOS**:
1. Overscroll verso alto su Home → Nessun bianco
2. Overscroll verso alto su Leaderboard → Stesso comportamento

**Rischio**: MEDIO - Potrebbe cambiare visual su alcune pagine

---

### P3: MODAL SETTINGS TEMA (BASSO)

**Fix proposto**: Aggiungere attributi/classi a GlassModal per matching CSS.

| Aspetto | Modifica | File | Rischio |
|---------|----------|------|---------|
| Aggiungere role="dialog" | `<div role="dialog" ...>` | GlassModal.tsx:144 | BASSO |
| OPPURE prop whiteGlass | Passare prop da SettingsModal | GlassModal.tsx, SettingsModal.tsx | BASSO |

**Meccanismo**: Le CSS rules esistenti in `ios-native.css:645+` matcheranno e applicheranno white glass.

**Test iOS**:
1. Aprire Settings da Home → White glass
2. Aprire Settings da Leaderboard → Consistente

**Rischio**: BASSO

---

### P4: CSS ERRORS (BASSO)

**Fix proposto**: Cleanup RTL keyframes malformati.

| Aspetto | Modifica | File | Rischio |
|---------|----------|------|---------|
| Fix RTL keyframes | Correggere sintassi o rimuovere | ios-native.css | BASSO |

**Rischio**: BASSO - Impatta solo utenti RTL

---

## RISK MATRIX

| Fix | Impatto Positivo | Rischio Regressione | Priorità |
|-----|------------------|---------------------|----------|
| P0 (Determinismo) | ALTO | MEDIO | 🔴 P0 |
| P1 (Duplicati) | MEDIO | BASSO | 🟡 P1 |
| P2 (Overscroll) | MEDIO | MEDIO | 🟡 P1 |
| P3 (Modal) | BASSO | BASSO | 🟢 P2 |
| P4 (CSS) | BASSO | BASSO | 🟢 P3 |

---

## VOTO % E MOTIVAZIONE

### **VOTO: 58/100** 🟠

**Breakdown**:
- Stabilità UI: **25/40** - Header/Nav non duplicati ma tema inconsistente
- Determinismo tema: **10/30** - Ogni pagina usa approccio diverso, race conditions
- Overscroll: **15/20** - Presente solo su pagine con html/body manipulation
- CSS: **8/10** - Solo warning minori, no errori bloccanti

**Motivazione** (5 righe):
1. L'architettura attuale NON ha un single source of truth per il tema white.
2. LeaderboardPage funziona perché NON tocca html/body - è l'unica a farlo correttamente.
3. Le altre pagine aggiungono/rimuovono classi a html/body causando stati intermedi durante navigazione.
4. Il Settings modal non riceve il tema perché GlassModal non ha i selettori CSS corretti.
5. La fix più importante è unificare l'approccio: classe solo su container, mai su html/body.

---

## COMANDI

### Rollback Immediato
```bash
cd /Users/josephmule/lux-hunt-treasure
git reset --hard IOS_UI_FORENSIC_START && git stash pop
```

### Verifica stato attuale
```bash
git status
git log --oneline -3
```

---

## CHECKLIST TEST iOS (Post-fix)

- [ ] Cold start → Home tema white corretto
- [ ] Home → Notifications → Home → Tema invariato
- [ ] Home → Leaderboard → Home → Tema invariato
- [ ] Settings aperto da Home → White glass
- [ ] Settings aperto da Leaderboard → White glass (consistente)
- [ ] Overscroll su Home → No overlay bianco
- [ ] Overscroll su Notifications → No overlay bianco
- [ ] Overscroll su Leaderboard → Comportamento baseline
- [ ] BottomNav sempre visibile e coerente (1 solo elemento DOM)
- [ ] Header sempre visibile e coerente (1 solo elemento DOM)

---

**Report generato da Claude AI - Audit Forense**
**© 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ**
