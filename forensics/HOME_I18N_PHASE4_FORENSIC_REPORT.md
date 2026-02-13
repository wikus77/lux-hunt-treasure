# HOME i18n PHASE 4 — Forensic Report

**Data:** 2026-02-13  
**Branch:** fix/i18n-global-ultra-safe  
**Rollback:** `git reset --hard SNAPSHOT_PRE_HOME_I18N_PHASE4`

---

## FASE 1 — Verifica

### 1) Stringa → File → Riga → Schermata → Azione

| Stringa residua | File | Riga | Schermata | Azione |
|-----------------|------|------|-----------|--------|
| Visibilità: {progress}% | PrizeVision.tsx | 281 | M1SSION PRIZE | t('home_prize_visibility', { progress }) |
| GIORNALIERO | CommitNodesContainer.tsx | 632 | Commit (sotto blob) | t('commit_daily_suffix') |
| Commit Giornaliero | LearnHowItWorksModal.tsx | 29 | Learn modal | t('status_commit_label') — chiave già in locale |
| PROTOCOLLO / DI RILEVAMENTO | ActiveMissionBox.tsx | 566-567 | Home container | t('home_protocol_title') + t('home_protocol_reveal') |
| PROTOCOLLO / DI RILEVAMENTO | TreasureHuntExpandableBoxes.tsx | 56-57 | (altra vista) | idem |
| Saldo:, RIVELA, PROGRESSIONE, PERCORSO, M1SSION SHOP | ShopContent.tsx | 153-155, 213, 280, 364 | Shop (full-screen) | t('shop_balance'), t('shop_tab_*'), t('shop_scratch_intro'), t('shop_remaining_today') |
| Saldo insufficiente, Errore | ShopContent.tsx | 124, 129 | Toast | t('shop_toast_insufficient'), t('shop_toast_error') |
| Servono X M1U, Limite giornaliero raggiunto | ShopContent.tsx | 303-304 | RIVELA tab | t('shop_need_m1u'), t('shop_limit_reached') |
| Milestone: +X M1U, BONUS | ShopContent.tsx | 354, 329 | RIVELA tab | t('shop_milestone_max'), t('shop_bonus_badge') |
| Acquista M1U per sbloccare indizi... / Acquista | M1UShopContent.tsx | 205, 325 | Shop tab M1U | t('shop_m1u_cta'), t('shop_buy') o common.buy |
| Nessun ciclo attivo / Saldo insufficiente (servono...) | LotteryContent.tsx | 347, 666 | Shop tab PERCORSO | t('shop_no_cycle'), t('shop_insufficient_for') |
| Contrasto insufficiente | ActiveMissionBox.tsx | 156, 684 | Expandables | text-white/70 → /90, /70 → /80 |

### 2) i18n provider

- **Un solo init:** `src/i18n/i18n.ts` importa `en/it/fr` da `locales/*/common.json`; `main.tsx` wrappa con `<I18nextProvider i18n={i18n}>`. Nessuna doppia init.
- **Home e modali:** usano `useTranslation()` dallo stesso provider.

### 3) Nessun tocco a IAP/purchase

- ShopContent: solo label, toast, tab; `handlePurchase` e flusso acquisti non modificati.
- M1UShopContent / LotteryContent: solo testi UI; nessun handler cambiato.

---

## FASE 2 — Patch (UI-only)

1. Locales: aggiungere chiavi home_prize_visibility, commit_daily_suffix, home_protocol_title, home_protocol_reveal, shop_m1u_cta, shop_buy, shop_no_cycle, shop_insufficient_for (se mancanti).
2. PrizeVision: i18n visibilità.
3. CommitNodesContainer: i18n suffix "GIORNALIERO".
4. LearnHowItWorksModal: t('status_commit_label').
5. ShopContent: balance, tabs, intro, toasts, disabledReason, rimasti oggi, Milestone, BONUS.
6. ActiveMissionBox: titolo Protocollo + bump contrasto.
7. TreasureHuntExpandableBoxes: titolo Protocollo.
8. M1UShopContent: CTA e descrizione (solo testo).
9. LotteryContent: Nessun ciclo attivo, Saldo insufficiente (solo testo).
10. ActiveMissionBox: contrast bump (className only).

---

## Rollback

```bash
git reset --hard SNAPSHOT_PRE_HOME_I18N_PHASE4
```

---

## Commits eseguiti (parziali)

- **Locales:** non committato (index.lock)
- **PrizeVision:** committato
- **CommitNodesContainer:** non committato
- **LearnHowItWorksModal:** non committato
- **ActiveMissionBox + TreasureHuntExpandableBoxes:** committato (2 file)
- **TreasureHuntExpandableBoxes:** modifiche in working tree
- **ShopContent:** non committato
- **M1UShopContent:** non committato
- **LotteryContent:** non committato
- **Report:** non committato

Se `.git/index.lock` è presente, rimuoverlo e poi:

```bash
git add src/locales/en/common.json src/locales/it/common.json src/locales/fr/common.json && git commit -m "i18n(phase4): add locale keys prize, commit, protocol, shop (UI-only)"
git add src/components/commit/CommitNodesContainer.tsx && git commit -m "i18n(phase4): localize Commit daily suffix (UI-only)"
git add src/components/learn/LearnHowItWorksModal.tsx && git commit -m "i18n(phase4): localize Learn Commit step (UI-only)"
git add src/components/command-center/home-sections/TreasureHuntExpandableBoxes.tsx && git commit -m "i18n(phase4): localize Protocol in TreasureHuntExpandableBoxes (UI-only)"
git add src/components/shop/ShopContent.tsx && git commit -m "i18n(phase4): localize ShopContent balance, tabs, toasts (UI-only)"
git add src/components/m1units/M1UShopContent.tsx && git commit -m "i18n(phase4): localize M1UShopContent CTA (UI-only)"
git add src/components/shop/LotteryContent.tsx && git commit -m "i18n(phase4): localize LotteryContent no-cycle, insufficient (UI-only)"
git add forensics/HOME_I18N_PHASE4_FORENSIC_REPORT.md && git commit -m "docs(forensics): HOME i18n Phase 4 report"
```

---

## Checklist validazione (post-patch)

- [x] Build: `npm run build` OK
- [ ] **Manuale:** iPhone FR → Home, Prize, Commit, Shop, Protocollo, Expandables in FR
- [ ] **Manuale:** iPhone EN → idem in EN
- [ ] **Manuale:** iPhone IT → invariato
- [ ] **Manuale:** Shop funziona identico (solo testo diverso)
- [ ] **Manuale:** Expandables leggibili (contrasto)
