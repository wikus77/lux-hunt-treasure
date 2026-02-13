# 🔍 INCIDENT REPORT — HOME i18n NON PROPAGATO + FIX ULTRA-SAFE (UI ONLY)

**Data**: 2026-02-13  
**Branch**: fix/i18n-global-ultra-safe  
**Rollback anchor**: `73f953ba` SNAPSHOT_PRE_HOME_I18N - rollback anchor

---

## CONTESTO

- L'app M1SSION è nativa wrappata (Capacitor iOS).
- Settings e sotto-modali seguono correttamente la lingua iOS (IT / EN / FR).
- La **HOME** (pagina principale) resta in italiano quando iOS è in EN o FR.
- Modali e sub-modali aperti dalla Home restano in italiano.
- Problema di **leggibilità** (testi scuri) nel container espandibile "Tempo rimasto".

---

## VINCOLI ASSOLUTI

❌ **NON modificare**: login/logout, Buzz/Buzz Map, IAP/Shop/pagamenti, notifiche push, cron, backend/servizi/stato globale.

✅ **Consentito solo**: sostituzione stringhe hardcoded con i18n (stesso provider dei Settings), fix CSS/theme per contrasto testo.

---

## ANALISI FORENSE — FILE HOME COINVOLTI

### Container Home

| File | Ruolo |
|------|--------|
| `src/pages/AppHome.tsx` | Pagina principale Home (toasts, labels, section names, pill labels) |
| `src/components/command-center/CommandCenterHome.tsx` | Command center sotto la PrizeVision (fallback "Caricamento...") |
| `src/components/home/MissionSync.tsx` | Pull-to-refresh su Home (testo "Caricamento...") |

### Modali / sub-modali Home (aperti da Home)

| File | Modali / contenuto |
|------|---------------------|
| `src/components/command-center/home-sections/ActiveMissionBox.tsx` | **FoundCluesModal**, **TimeRemainingModal**, **MissionStatusModal**, **Mission End Warning** (GlassModal), **LongPressInfoModal** (x3: Indizi, Tempo rimasto, Stato missione). Box "Tempo rimasto" + fix contrasto. |

### Sezioni Home (solo se presenti stringhe IT)

| File | Note |
|------|------|
| `src/components/command-center/home-sections/PrizeVision.tsx` | M1SSION PRIZE carousel – da verificare stringhe IT |
| `src/components/command-center/home-sections/AgentDiaryContent.tsx` | Label "Tempo Rimasto" (se esposta su Home) |

### Route (solo label Home)

| File | Chiave |
|------|--------|
| `src/routes/WouterRoutes.tsx` | "Verifica piano..." (loading subscription su route Home) |

### Fix contrasto "Tempo rimasto"

| File | Intervento |
|------|------------|
| `src/components/command-center/home-sections/ActiveMissionBox.tsx` | Classe/testo "Tempo rimasto" – migliorare contrasto (CSS/classe). |
| `src/styles/ios-native.css` e/o `src/styles/home-microfx.css` | Solo se necessario per selettori globali "TEMPO RIMASTO". |

---

## FILE ESCLUSI (rispetto vincoli)

- **Login**: `LoginPage.tsx` — non toccato.
- **Buzz / Buzz Map**: tutti i file in `buzz/`, `BuzzActionButton` — non toccati.
- **IAP / Shop / pagamenti**: `ShopContent`, `M1UPaymentContent`, `CashbackVaultPill` (logica riscatto), `StreakModal` (check-in), `SubscriptionPlans`, `FakeStripeCheckout` — non toccati.
- **Notifiche push**: logica e componenti push — non toccati.
- **Backend / servizi**: nessuna modifica a API, cron, stato globale.

---

## PROCEDURA

1. ✅ Rollback commit creato: `73f953ba`
2. Analisi forense: questo documento.
3. i18n solo testi (IT/EN/FR) nei file sopra.
4. Fix leggibilità "Tempo rimasto" (solo UI/CSS).
5. Commit atomici: **1 file = 1 commit** (eventualmente 1 commit per locale se si aggiungono solo chiavi).
6. Se un file vietato viene toccato → ABORT.

---

## OUTPUT ATTESO

- Home completamente localizzata IT / EN / FR.
- Nessuna regressione funzionale.
- Rollback immediato possibile: `git reset --hard 73f953ba`
