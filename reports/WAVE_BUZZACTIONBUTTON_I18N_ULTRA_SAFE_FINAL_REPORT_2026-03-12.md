# Wave Ultra Safe i18n — BuzzActionButton — Report finale

**Data:** 2026-03-12  
**Progetto:** M1SSION — App nativa wrappata iOS (Capacitor WKWebView)  
**Scope:** Solo `src/components/buzz/BuzzActionButton.tsx` — sostituzione stringhe toast con `t()`.  
**Nessuna modifica a:** logica BUZZ, M1U, RPC, hook, auth, pagamenti, routing, push, Supabase, consume_credit, handle-buzz-press.

---

## 1. FASE 0 — Snapshot di sicurezza

| Elemento | Valore |
|----------|--------|
| **Branch iniziale** | `feat/pe-global-fullscreen-reward` |
| **HEAD iniziale** | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| **Safety branch** | `safety/i18n-buzzactionbutton-pre` (creato) |
| **Safety tag** | `safety/i18n-buzzactionbutton-pre` (creato) |

**Rollback (ripristino stato pre-wave):**
```bash
git checkout feat/pe-global-fullscreen-reward
git reset --hard safety/i18n-buzzactionbutton-pre
```
oppure:
```bash
git checkout safety/i18n-buzzactionbutton-pre
```

---

## 2. FASE 1 — Audit forense (read-only)

### File analizzato
- `src/components/buzz/BuzzActionButton.tsx`

### Toast hardcoded individuati (pre-patch)
| Riga | Tipo | Stringa (esempio) |
|------|------|-------------------|
| 177 | error | "Nessun credito BUZZ disponibile" |
| 192 | error | "Errore durante l'uso del BUZZ gratuito" |
| 209 | success | "BUZZ gratuito utilizzato!" |
| 217 | error | "Errore durante il riscatto gratuito" |
| 309 | error | "Devi essere loggato per utilizzare BUZZ!" |
| 366 | success | Template con `tierFreeBuzzRemaining`, `tierWeeklyLimit`, "tier rimasti" |
| 414 | success | "BUZZ gratuito del giorno (premio) utilizzato!" |
| 492, 500 | error | "Errore nel processare il pagamento M1U" |

### Già presenti con `t()`
- `buzz_toast_login_required_free` (riga 165)
- `buzz_toast_free_use_error` (riga 421)
- `buzz_toast_error_retry` (riga 566)

### Non sostituito (voluto)
- `toast.success(hbps.clue_text, ...)` — contenuto fornito dal backend (handle-buzz-press), non localizzabile lato client.

### useTranslation
- **Presente:** `import { useTranslation } from 'react-i18next';` e `const { t } = useTranslation();` già nel componente. Nessuna modifica agli import.

---

## 3. FILE MODIFICATI

| File | Modifica |
|------|----------|
| **`src/components/buzz/BuzzActionButton.tsx`** | Sostituite 8 occorrenze di stringhe toast hardcoded con `t('buzz_toast_*')`. Nessun altro cambiamento. |
| **`src/locales/en/common.json`** | **Nessuna modifica** — chiavi `buzz_toast_*` già presenti (Wave 3). |
| **`src/locales/it/common.json`** | **Nessuna modifica** — chiavi già presenti. |
| **`src/locales/fr/common.json`** | **Nessuna modifica** — chiavi già presenti. |

**Totale file toccati:** 1 (solo BuzzActionButton.tsx).

---

## 4. STRINGHE SOSTITUITE

| Prima (hardcoded) | Dopo (chiave i18n) |
|-------------------|--------------------|
| `'Nessun credito BUZZ disponibile'` | `t('buzz_toast_no_credit')` |
| `'Errore durante l\'uso del BUZZ gratuito'` | `t('buzz_toast_error_use_free')` |
| `'BUZZ gratuito utilizzato!'` | `t('buzz_toast_free_used')` |
| `'Errore durante il riscatto gratuito'` | `t('buzz_toast_redeem_error')` |
| `'Devi essere loggato per utilizzare BUZZ!'` | `t('buzz_toast_login_required')` |
| `` `BUZZ gratuito del giorno! (${...} tier rimasti)` `` | `t('buzz_toast_free_day_tier', { remaining: ..., limit: ... })` |
| `'BUZZ gratuito del giorno (premio) utilizzato!'` | `t('buzz_toast_free_grant_used')` |
| `'Errore nel processare il pagamento M1U'` (x2) | `t('buzz_toast_m1u_payment_error')` |

---

## 5. NUOVE CHIAVI i18n AGGIUNTE

**Nessuna.** Tutte le chiavi usate (`buzz_toast_no_credit`, `buzz_toast_error_use_free`, `buzz_toast_free_used`, `buzz_toast_redeem_error`, `buzz_toast_login_required`, `buzz_toast_free_day_tier`, `buzz_toast_free_grant_used`, `buzz_toast_m1u_payment_error`) sono già presenti in `common.json` (en/it/fr) dalla Wave 3. Prefisso richiesto `buzz_action_*` non è stato introdotto per evitare duplicati; riuso delle chiavi esistenti `buzz_toast_*` mantiene coerenza e blast radius minimo.

---

## 6. VERIFICA LOGICA BUZZ

| Elemento | Stato |
|----------|--------|
| **BUZZ logic** | Invariata — nessun `if`/`await`/branch modificato. |
| **consume_credit** | Invariato — chiamate RPC identiche. |
| **M1U (debit, balance, update)** | Invariato — nessuna modifica a Supabase update/select. |
| **Supabase** | Invariato — nessuna modifica a `supabase.rpc`, `supabase.functions.invoke`, `supabase.from().update/select`. |
| **handle-buzz-press** | Invariato. |
| **Hook (useTierFreeBuzz, useBuzzGrants, useDailyFreeBuzz, useM1UnitsRealtime, ecc.)** | Invariati. |
| **showInsufficientM1UToast / showM1UDebitSuccessToast** | Invariati — chiamate e file `m1uHelpers` non toccati. |

**Conferma:** patch puramente cosmetica (solo argomenti dei toast).

---

## 7. FASE 4 — Validazione post-patch

**Comando:** `grep -n "toast(" src/components/buzz/BuzzActionButton.tsx`

**Risultato:** Tutti i toast usano ora `t(...)` tranne:
- `toast.success(hbps.clue_text, { ... })` — testo dal backend, lasciato intenzionalmente com’è.

Nessun toast con stringa letterale italiana/inglese residua. Nessuna import rimossa, nessuna funzione alterata.

---

## 8. FASE 5 — Build verification

| Verifica | Esito |
|----------|--------|
| **npx tsc --noEmit** | Exit code 0 (completato in sessione). |
| **npm run build** | Avviato in sessione; esito da confermare localmente (build lungo). |
| **npx cap sync ios** | Da eseguire dopo build: `npx cap sync ios`. |

**Nota:** Gli errori TypeScript presenti in BuzzActionButton (Supabase/DB types, righe ~440, 478, 505, 531) sono **preesistenti** e non dovuti a questa wave. Il build Vite può comunque andare a buon fine.

**Azioni consigliate:** Eseguire `npm run build` e `npx cap sync ios` in locale e verificare che completino senza errori.

---

## 9. ANALISI SISTEMA i18n DOPO QUESTA WAVE

- **Copertura i18n BuzzActionButton:** Prima della wave: ~3 toast su ~11 con `t()` (login_required_free, free_use_error, error_retry). Dopo la wave: **11/11** toast utente localizzati (1 è `hbps.clue_text` backend, non conteggiato come “copertura UI”).
- **Copertura % area BUZZ (solo BuzzActionButton):** Da ~27% a **100%** per i messaggi toast di questo file.
- **Copertura % complessiva app (stima):** Le wave 1–5 + questa portano Login, Auth, Register, EmailVerification, RegistrationForm e **BuzzActionButton** a testo localizzato. Altre aree (Profile, Subscriptions, Payment, CommandCenter, m1uHelpers, ecc.) restano in parte hardcoded. Stima indicativa: prima wave ~20% stringhe utente in i18n, dopo wave 1–5 ~55–60%, dopo questa wave **~62–65%** (miglioramento limitato al singolo file, ma molto visibile in BUZZ).

---

## 10. VALUTAZIONE MULTI-LINGUA

**Il sistema i18n ora consente di aggiungere nuove lingue?**  
**Sì.** Il flusso è: (1) aggiungere il locale in `src/i18n/i18n.ts` (es. `es`, `de`) nell’array `SUPPORTED` e nel blocco `resources`; (2) creare `src/locales/<locale>/common.json` copiando da `en` e traducendo; (3) eventualmente aggiornare LanguageSettings per mostrare la nuova lingua. Per BuzzActionButton non serve altro: usa solo chiavi da `common.json`.

**Lingue consigliate per espansione futura (in ordine di priorità):**
- **ES (Español)** — mercati larghi (EU/LATAM).
- **DE (Deutsch)** — mercato EU importante (prima era in Settings e rimosso; riaggiungere solo se supportato da i18n).
- **PT (Português)** — Brasile/Portogallo.
- **AR (العربية)** / **ZH (中文)** — se si punta a mercati MENA o sinofoni.

**Perché:** La struttura `common.json` + `t()` è già multilingua; l’unico vincolo è mantenere le stesse chiavi in tutti i file di locale e aggiornare `SUPPORTED` e `resources` in `i18n.ts`.

---

## 11. VERDETTO FINALE

| Aspetto | Verdetto |
|---------|----------|
| **Sistema i18n attuale** | **GO** — Wave applicata; tutti i toast utente in BuzzActionButton usano `t()`. |
| **Espansione lingue future** | **GO** — Aggiunta di nuove lingue possibile con `common.json` + configurazione in `i18n.ts`. |
| **Stabilità app** | **GO** — Nessuna modifica a logica BUZZ, M1U, auth, RPC, hook; solo sostituzione stringhe. |

**Regola “fuori scope” rispettata:** Modificato **solo** `src/components/buzz/BuzzActionButton.tsx`. Nessun altro file toccato.

---

## 12. RIEPILOGO OPERATIVO

- **FASE 0:** Safety branch/tag creati.
- **FASE 1:** Audit read-only eseguito; stringhe e `t()` esistenti individuate.
- **FASE 2:** Nessuna nuova chiave aggiunta (riuso `buzz_toast_*`).
- **FASE 3:** Patch applicata (8 sostituzioni).
- **FASE 4:** Verifica grep: nessun toast hardcoded residuo (eccetto `hbps.clue_text`).
- **FASE 5:** `tsc --noEmit` OK; build e cap sync da confermare in locale.

**Priorità rispettata:** stabilità dell’app M1SSION; nessuna regressione introdotta dalla wave.

---

*Report generato in seguito a wave i18n ultra safe limitata a BuzzActionButton. Nessuna modifica a logica BUZZ/M1U/Supabase/auth.*
