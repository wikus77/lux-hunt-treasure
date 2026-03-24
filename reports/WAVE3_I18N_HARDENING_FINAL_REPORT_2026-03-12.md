# Wave 3 i18n Hardening — Final Report (BUZZ + BUZZ MAP copy/toast only)

**Data:** 2026-03-12  
**Branch:** `feat/pe-global-fullscreen-reward`  
**Scope:** Solo testi utente / toast / copy in area BUZZ e BUZZ MAP. Nessuna modifica a logiche BUZZ/BUZZ MAP.

---

## 1. Safety

| Elemento | Valore |
|----------|--------|
| Branch iniziale | `feat/pe-global-fullscreen-reward` |
| HEAD iniziale | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Safety branch | `safety/i18n-wave3-pre` (esistente, riutilizzato) |
| Safety tag | `safety/i18n-wave3-pre` (esistente, riutilizzato) |

**Comandi rollback (ripristino stato pre–Wave 3):**
```bash
git checkout feat/pe-global-fullscreen-reward
git reset --hard safety/i18n-wave3-pre
# oppure
git reset --hard 7012170a1132f77a66f7359d69b9be6cd97e703b
```

---

## 2. Verifica pre-patch

### Perimetro primario (file toccati)

- **`src/components/buzz/BuzzActionButton.tsx`** — Toast: login richiesto (free), nessun credito, errore uso free, free usato, errore riscatto, login richiesto (generico), free day tier (con interpolazione), free grant usato, errore uso free, errore pagamento M1U, errore BUZZ riprova.
- **`src/components/buzz/BuzzMainContent.tsx`** — Toast: accesso richiesto, BUZZ non disponibile, errore; copy: titolo pagina, sottotitolo, CTA “Vai alla mappa”.
- **`src/components/buzz/BuzzRewardHandler.tsx`** — Toast: login richiesto, nessun credito, successo riscatto BUZZ, errore riscatto.
- **`src/components/buzz/BuzzMapRewardHandler.tsx`** — Toast: login richiesto BUZZ MAP, nessun credito BUZZ MAP, successo riscatto BUZZ MAP, errore riscatto.
- **`src/components/buzz/BuzzExplosionHandler.tsx`** — Toast: indizio sbloccato + descrizione.
- **`src/components/buzz/BuzzInfoCard.tsx`** — Copy: titolo “Come funziona il Buzz”, corpo descrizione.

### Perimetro escluso (non toccati)

- **`src/utils/m1uHelpers.ts`** — `showInsufficientM1UToast` / `showM1UDebitSuccessToast`: utilità condivise, fuori scope Wave 3; nessuna modifica.
- **`src/components/buzz/BuzzBriefingFlipOverlay.tsx`** — Verificato: nessuna stringa utente hardcoded nelle parti principali; non modificato.
- **`src/components/buzz/ClueBanner.tsx`** — Solo `console.error` (non toast utente); non modificato.
- **`src/components/map/BuzzMapButtonSecure.tsx`** — Chiama `showInsufficientM1UToast`; non toccato (nessun copy diretto in questo wave).
- Logiche BUZZ/BUZZ MAP, RPC, consume_credit, handle-buzz-press, M1U, redirect, auth: **nessuna modifica**.

### Hardcoded trovati (sostituiti con chiavi i18n)

- BuzzActionButton: 12 toast (login free, no credit, error use free, free used, redeem error, login required, free day tier, free grant used, free use error, M1U payment error x2, error retry).
- BuzzMainContent: 3 toast (access required, not available, error) + titolo “Buzz”, sottotitolo, “Vai alla mappa”.
- BuzzRewardHandler: 4 toast (login, no credit, success, redeem error).
- BuzzMapRewardHandler: 4 toast (login, no credit, success, redeem error).
- BuzzExplosionHandler: 1 toast (titolo + descrizione indizio sbloccato).
- BuzzInfoCard: titolo + paragrafo descrizione.

### Chiavi esistenti riusabili

- Nessuna chiave esistente in `common.json` riusata per i toast/copy BUZZ/BUZZ MAP in questo wave (chiavi specifiche per messaggi diversi). Sono state aggiunte solo nuove chiavi `buzz_*` e `buzz_map_*`.

### Nuove chiavi necessarie (aggiunte)

- `buzz_toast_login_required_free`, `buzz_toast_no_credit`, `buzz_toast_error_use_free`, `buzz_toast_free_used`, `buzz_toast_redeem_error`, `buzz_toast_login_required`, `buzz_toast_free_day_tier` (con `{{remaining}}`, `{{limit}}`), `buzz_toast_free_grant_used`, `buzz_toast_free_use_error`, `buzz_toast_m1u_payment_error`, `buzz_toast_error_retry`.
- `buzz_main_access_required_title`, `buzz_main_access_required_desc`, `buzz_main_not_available_title`, `buzz_main_not_available_desc`, `buzz_main_error_title`, `buzz_main_error_desc`, `buzz_main_page_title`, `buzz_main_page_subtitle`, `buzz_main_go_to_map`.
- `buzz_reward_success`.
- `buzz_map_toast_login_required_free`, `buzz_map_toast_no_credit`, `buzz_map_reward_success`, `buzz_map_toast_redeem_error`.
- `buzz_clue_unlocked_title`, `buzz_clue_unlocked_desc`.
- `buzz_info_card_title`, `buzz_info_card_desc`.

Tutte aggiunte in `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json`.

### Motivazione “patch safe”

- Modifiche **solo** sostituzione stringhe con `t(...)` e aggiunta chiavi in `common.json`.
- Nessun refactor di condizioni, handler, `useEffect`, chiamate API, logica M1U/BUZZ/BUZZ MAP.
- Brand protected (M1SSION, BUZZ, BUZZ MAP, M1U) lasciati invariati nelle stringhe.
- File toccati: 6 componenti buzz + 3 file common.json; nessun altro file.

---

## 3. File modificati

| File | Modifica |
|------|----------|
| `src/locales/en/common.json` | Aggiunto blocco chiavi `buzz_*` e `buzz_map_*` |
| `src/locales/it/common.json` | Aggiunto blocco chiavi `buzz_*` e `buzz_map_*` |
| `src/locales/fr/common.json` | Aggiunto blocco chiavi `buzz_*` e `buzz_map_*` |
| `src/components/buzz/BuzzActionButton.tsx` | `useTranslation` + sostituzione 12 toast con `t(...)` |
| `src/components/buzz/BuzzMainContent.tsx` | `useTranslation` + sostituzione toast e copy (titolo, sottotitolo, CTA) |
| `src/components/buzz/BuzzRewardHandler.tsx` | `useTranslation` + sostituzione 4 toast |
| `src/components/buzz/BuzzMapRewardHandler.tsx` | `useTranslation` + sostituzione 4 toast |
| `src/components/buzz/BuzzExplosionHandler.tsx` | `useTranslation` + sostituzione toast indizio sbloccato |
| `src/components/buzz/BuzzInfoCard.tsx` | `useTranslation` + sostituzione titolo e descrizione |

---

## 4. Chiavi i18n

- **Aggiunte (en/it/fr):** 28 chiavi (buzz_toast_*, buzz_main_*, buzz_reward_success, buzz_map_*, buzz_clue_unlocked_*, buzz_info_card_*).
- **Riusate:** nessuna (messaggi specifici BUZZ/BUZZ MAP).

---

## 5. Verifica post-patch

| Verifica | Esito |
|----------|--------|
| File fuori scope toccati? | **No** — solo 6 componenti buzz + 3 common.json |
| Logica BUZZ toccata? | **No** — solo stringhe sostituite con `t(...)` |
| Logica BUZZ MAP toccata? | **No** — idem |
| Auth toccata? | **No** |
| IAP toccati? | **No** |
| Push toccate? | **No** |
| Routing toccato? | **No** |

---

## 6. Build

| Comando | Esito |
|---------|--------|
| `npm run build` | **OK** (exit code 0, ~2m 30s) |

---

## 7. Cap sync iOS

| Comando | Esito |
|---------|--------|
| `npx cap sync ios` | **OK** (web assets copiati, plugin aggiornati) |

---

## 8. Rischio regressione

- **Livello:** **Basso**
- **Motivazione:** Solo sostituzione di stringhe con chiavi i18n; nessun cambiamento a flussi, condizioni, RPC, M1U o auth. Comportamento identico; unica differenza è la lingua dei messaggi in base a `i18next`.

---

## 9. Verdetto finale

**GO** — Wave 3 completata con successo. Procedere con wave successive (es. Register / EmailVerificationFlow o altre aree) quando richiesto.

---

## 10. Step successivo consigliato (senza applicare)

- **Wave 4 possibile:** portare in i18n i testi utente in **Register.tsx** e **EmailVerificationFlow.tsx** (perimetro secondario già identificato in Wave 2).
- **Opzionale:** valutare toast in **`src/utils/m1uHelpers.ts`** (showInsufficientM1UToast, showM1UDebitSuccessToast) per una wave dedicata a utilità M1U/toast condivisi, senza toccare logica.
- **BuzzBriefingFlipOverlay:** verificare se in altre parti del file esistono stringhe visibili all’utente (es. pulsanti “Continua”, “Chiudi”) e eventualmente includerle in una wave successiva.
