# APPLE LOGIN LOOP — FIX PLAN DOPO STABILIZZAZIONE iPhone

**Date:** 2026-02-13  
**Branch:** `fix/login-loop-regression-iphone`  
**Status:** iPhone ripristinato (fix minimale applicato)

---

## 1. COSA È STATO ROLLBACKATO / SEMPLIFICATO

| Modifica | File | Dettaglio |
|----------|------|-----------|
| **Root gating rimosso** | `WouterRoutes.tsx` | `blockRedirect` alla root era `isLoading \|\| !authHydrated \|\| (!isAuthenticated && withinGracePeriod)`. Ora è solo `isLoading`. |
| **Protezione spostata** | — | `authHydrated` e grace period restano in `WouterProtectedRoute` (gestisce /home, /map, ecc.). La root non applica più questi blocchi. |

---

## 2. PERCHÉ LA REGRESSIONE SU iPhone

**Ipotesi (da confermare con log forensi):**

- **A) Root gating** — Alla root (`/`), con `blockRedirect` true l’app mostrava schermo nero (Capacitor) o PageSkeleton (web). Le condizioni aggiunte dalla patch (`!authHydrated`, `withinGracePeriod && !isAuthenticated`) rendevano il blocco più frequente e prolungato.
- Su iPhone l’auth potrebbe essere leggermente più veloce o con timing diverso; il root gating bloccava comunque il flow e generava schermo nero o attesa percepita come instabilità.
- **Evidenza attesa nei log:** ripetuti `reason=root_not_hydrated` o `root_grace_period` durante il login.

---

## 3. STRUMENTAZIONE FORENSE AGGIUNTA

- **File:** `src/utils/authForensicLog.ts` — Log sanitizzati (no token/email).
- **Eventi:** T0_launch, T1_login_submit, T2_SIGNED_IN, T3_route_change, T4_redirect_or_loading.
- **Storage snapshot:** `sb-*-auth-token`, `m1ssion_session_cache`, `m1_just_signed_in_at` (PRESENT/ABSENT + len).
- **Report template:** `forensics/IPHONE_REGRESSION_AFTER_MINIMAL_PATCH.md` — da popolare con i log reali da iPhone.

---

## 4. PROSSIMI PASSI PER iPad (ROOT CAUSE VERA)

**Non applicare ancora.** Da eseguire solo dopo raccolta dati su iPad:

1. **Storage vs race vs SW** — Su iPad, usare i log forensi per decidere:
   - Se `sb-*-auth-token` è ASSENT dopo login → problema di storage (WKWebView / localStorage).
   - Se `authHydrated` resta false o `isAuthenticated` non si aggiorna → race condition.
   - Se `[SW] blocked reload` appare e subito dopo redirect → SW può interferire.

2. **Test consigliati su iPad:**
   - Clean install → login → cattura log T0–T4.
   - Verifica storage snapshot a ogni step.
   - Controllo: `m1_just_signed_in_at` presente subito dopo T2?

3. **Possibili interventi futuri (da validare):**
   - Storage adapter nativo (Capacitor) se il problema è localStorage.
   - Timeout su authHydrated (fail-open dopo 2–3s) se il problema è race.
   - Limitare blocco reload SW a Capacitor-only se il problema è SW.

---

## 5. ROLLBACK PLAN

```bash
# Snapshot post-patch (regressione presente)
git checkout 1829e96e

# Pre-patch (stato stabile prima minimal patch)
git checkout 3509aa42

# Dopo fix minimale (questo commit)
git log -1 --oneline
```

---

## 6. CRITERI DI SUCCESSO

- [x] iPhone: flow login stabile come pre-patch
- [ ] iPad: da verificare con dati reali (log forensi)
- [x] Nessun impatto su IAP, BUZZ, UI
- [x] Protezione ProtectedRoute invariata (authHydrated + grace period)
