# M1U Global Slot Overlay Engine — Report

**Data:** 2026-03-05  
**Scope:** UI event system only. **NO IAP / StoreKit / accredito / Supabase / Buzz / login / push / subscriptions.**

---

## Obiettivo

Un unico motore globale per il credito M1U: ogni volta che arrivano M1U da **qualsiasi** sorgente (Shop, Wheel, Daily Mission, Reward, Referral, Lottery, Scratch, Welcome, ecc.) deve apparire automaticamente la **M1U Slot Pill Overlay** con animazione **PRE → SLOT → POST**.

---

## Architettura eventi

### Evento standard unico: `m1u-credit-event`

- **Nome:** `m1u-credit-event`
- **Detail:** `{ amount: number, source: string, id: string, issuedAt: number }`
- **Chi lo emette:** ogni sorgente che accredita o mostra reward M1U, tramite `emitM1UCreditEvent(amount, source)`.

### Snapshot pending globale

- **Key:** `window.__m1u_pending_credit__`
- **Valore:** stesso oggetto del detail (`amount`, `source`, `id`, `issuedAt`)
- **TTL:** 5000 ms (gestito in M1UPill e in `readPendingCredit`).
- Scritto da `emitM1UCreditEvent` prima del dispatch; la pill usa il pending per mostrare PRE fino all’arrivo di `m1u-credited`.

### Flusso

1. Sorgente accredita M1U (logica esistente, non modificata).
2. Sorgente chiama **`emitM1UCreditEvent(amount, source)`** → imposta `__m1u_pending_credit__` e dispatcha **`m1u-credit-event`**.
3. **GlobalM1UCreditOverlay** (montato in App):
   - Ascolta `m1u-credit-event`.
   - Dedupe con `lastCreditIdRef` (stesso `id` ignorato).
   - Se già in animazione (`animatingRef`) → ignora (FASE 6).
   - Mostra overlay (M1UPill in fixed), dopo **120 ms** dispatcha **`m1u-credited`** e **`m1u-balance-changed`**, dopo **2800 ms** nasconde overlay.
4. **M1UPill** (header e overlay) ascolta `m1u-credited`, usa pending per baseline PRE→POST e anima (logica esistente).

---

## File creati

| File | Descrizione |
|------|-------------|
| **src/features/m1u/m1uCreditEvent.ts** | `emitM1UCreditEvent(amount, source)`, costanti `M1U_CREDIT_EVENT`, `PENDING_CREDIT_KEY`, `PENDING_CREDIT_TTL_MS`, tipi `M1UCreditEventDetail`, `M1UCreditSource`. |
| **src/features/m1u/GlobalM1UCreditOverlay.tsx** | Componente che ascolta `m1u-credit-event`, mostra overlay (M1UPill fixed), dedupe per `id`, lock “già in animazione”, dopo 120 ms dispatcha `m1u-credited` / `m1u-balance-changed`, dopo 2800 ms nasconde. |

---

## File modificati

| File | Modifica |
|------|----------|
| **App.tsx** | Import e render di `<GlobalM1UCreditOverlay />` (dopo ReconnectBadge). |
| **M1UShopContent.tsx** | Rimosso overlay locale e effect con setTimeout; `handlePaymentSuccess` chiama `emitM1UCreditEvent(amount, 'shop')` e chiude il modal dopo 400 ms. |
| **FortuneWheel.tsx** | Sostituito dispatch `m1u-credited` con `emitM1UCreditEvent(..., 'wheel')`. |
| **SignalPatternNumbersModal.tsx** | Sostituito dispatch con `emitM1UCreditEvent(amount, 'mission')`. |
| **WordDuelMemoryModal.tsx** | Due punti: `emitM1UCreditEvent(amount, 'mission')`. |
| **CipherDrillModal.tsx** | Due punti: `emitM1UCreditEvent(amount, 'mission')`. |
| **useWelcomeBonus.ts** | Sostituito dispatch con `emitM1UCreditEvent(WELCOME_BONUS_AMOUNT, 'welcome')`. |
| **StreakModal.tsx** | Sostituito dispatch con `emitM1UCreditEvent(totalM1U, 'streak')`. |
| **LotteryContent.tsx** | Sostituito setTimeout + dispatch con `emitM1UCreditEvent(data.prize_m1u, 'lottery')`. |
| **ScratchWinModal.tsx** | Sostituito setTimeout + dispatch con `emitM1UCreditEvent(rewardValue, 'scratch')`. |
| **CashbackVaultPill.tsx** | Sostituito dispatch `m1u-credited` con `emitM1UCreditEvent(result.credited_m1u, 'cashback')` (mantenuto `m1u-balance-updated`). |
| **MicroMissionsCard.tsx** | Sostituito dispatch con `emitM1UCreditEvent(..., 'micro_mission')`. |
| **StreakWidget.tsx** | Due punti: `emitM1UCreditEvent(..., 'streak')`. |
| **ReferralCard.tsx** | Sostituito dispatch con `emitM1UCreditEvent(..., 'referral')`. |
| **WeeklyChallenges.tsx** | Sostituito dispatch con `emitM1UCreditEvent(100, 'weekly_challenge')`. |
| **ClueMilestoneModal.tsx** | Sostituito dispatch con `emitM1UCreditEvent(milestone.m1u, 'clue_milestone')`. |
| **LotteryTest.tsx** | Sostituito dispatch con `emitM1UCreditEvent(..., 'lottery')`. |

---

## Sorgenti coperte (source)

| source | Sorgente |
|--------|----------|
| `shop` | M1UShopContent (IAP purchase success) |
| `wheel` | FortuneWheel |
| `mission` | SignalPatternNumbersModal, WordDuelMemoryModal, CipherDrillModal (daily missions) |
| `welcome` | useWelcomeBonus |
| `streak` | StreakModal, StreakWidget |
| `lottery` | LotteryContent, LotteryTest |
| `scratch` | ScratchWinModal |
| `cashback` | CashbackVaultPill |
| `micro_mission` | MicroMissionsCard |
| `referral` | ReferralCard |
| `weekly_challenge` | WeeklyChallenges |
| `clue_milestone` | ClueMilestoneModal |

---

## Test scenari (FASE 7)

1. **Shop purchase** → slot overlay appare, PRE → SLOT → POST, nessun doppio overlay.
2. **Fortune wheel win** → slot overlay.
3. **Daily mission reward** (Cipher/Word Duel/Signal Pattern) → slot overlay.
4. **Referral bonus** → slot overlay.
5. **Crediti multipli ravvicinati** → dedupe per `id`, lock “già in animazione” → nessun loop / nessun doppio overlay.

---

## Rollback

Tag creato **prima** delle modifiche:

```bash
git reset --hard safety/m1u-global-slot-engine-pre-fix-20260305-1549
```

(Oppure l’ultimo tag `safety/m1u-global-slot-engine-pre-fix-*`.)

---

## Build e sync

- **npm run build** — OK.
- **npx cap sync ios** — OK.

---

## Vincoli rispettati

- Nessuna modifica a StoreKit, IAP, logica accredito Supabase, Buzz, Buzz Map, login/logout, delete account, push, subscriptions.
- Modifiche solo a livello UI/eventi: nuovo evento standard, helper `emitM1UCreditEvent`, overlay globale, sostituzione dei dispatch diretti `m1u-credited` con `emitM1UCreditEvent`.

---

*© 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™*
