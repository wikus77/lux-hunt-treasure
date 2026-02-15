# APPLE LOGIN LOOP — MINIMAL PATCH REPORT

**Date:** 2026-02-13  
**Branch:** `fix/apple-login-loop-minimal`  
**Incident:** Apple Review — iPad login loop ("returned to login screen after entering with credentials")

---

## 1. DIFF SUMMARY

| File | Changes |
|------|---------|
| `src/contexts/auth/types.ts` | Added `JUST_SIGNED_IN_GRACE_MS`, `authHydrated`, `justSignedInAt` to AuthContextType |
| `src/contexts/auth/AuthProvider.tsx` | `authHydrated` + `justSignedInAt` state; `JUST_SIGNED_IN_STORAGE_KEY`; set on SIGNED_IN; getUser fallback when getSession fails; set `authHydrated` in finally; clear on SIGNED_OUT/logout |
| `src/components/auth/WouterProtectedRoute.tsx` | Wait for `authHydrated`; grace period check for `justSignedInAt` — show loading instead of redirect |
| `src/routes/WouterRoutes.tsx` | Root route: `blockRedirect` = loading OR !authHydrated OR (withinGracePeriod && !isAuthenticated) |
| `src/utils/silentAutoUpdate.ts` | `shouldBlockReload()` checks `m1_just_signed_in_at`; block reload within 15s of sign-in |

---

## 2. RAZIONALE PER CHANGE

### Mitigation 1 — Grace period anti-loop (router/auth guard)
- **AuthProvider:** `authHydrated` diventa true solo dopo il primo `getSession()` completato. `justSignedInAt` viene impostato su `SIGNED_IN` e scritto in `sessionStorage` per silentAutoUpdate.
- **WouterProtectedRoute:** Se `!authHydrated` → AuthLoadingScreen. Se `!isAuthenticated` ma within 15s da `justSignedInAt` → AuthLoadingScreen invece di redirect.
- **WouterRoutes:** Root route applica stessa logica (blockRedirect include authHydrated e grace period).

### Mitigation 2 — Blocco reload post-login (silentAutoUpdate)
- **silentAutoUpdate.ts:** Prima di `performSilentRefresh`, `shouldBlockReload()` legge `sessionStorage['m1_just_signed_in_at']`. Se entro 15s → skip reload e log warning.

### Mitigation 3 — Hardening auth init
- **AuthProvider:** Se `getSession()` fallisce dopo 3 retry → fallback a `supabase.auth.getUser()`. Se user valido → recupera session e imposta stato.
- **authHydrated** settato in `finally` dopo il primo tentativo, per evitare redirect prima che l’auth sia inizializzata.

---

## 3. CHECKLIST TEST MANUALE

### iPad (TestFlight / Device)

- [ ] **Clean install:** Disinstalla → reinstalla → avvia → login email/password → verifica accesso a home/map
- [ ] **Background/Resume:** Login → background 30s → resume → verifica che l’utente resti loggato
- [ ] **Kill/Reopen:** Login → kill da app switcher → riapri → verifica che l’utente resti loggato
- [ ] **Rete on/off:** Login → airplane 10s → disattiva → verifica comportamento (loading o sessione preservata)

### iPhone (Regressione)

- [ ] **Clean install:** Stessi passi → verifica nessuna regressione
- [ ] **Login:** Verifica che il login funzioni normalmente
- [ ] **Background/Resume:** Verifica che la sessione persista

### Web (Regressione)

- [ ] **Login:** Verifica che il login funzioni
- [ ] **Redirect:** Verifica che il redirect a /login funzioni per utenti non autenticati

---

## 4. ROLLBACK PLAN

```bash
# Rollback completo (torna al pre-patch)
git checkout 3509aa42 -- src/contexts/auth/types.ts src/contexts/auth/AuthProvider.tsx src/components/auth/WouterProtectedRoute.tsx src/routes/WouterRoutes.tsx src/utils/silentAutoUpdate.ts

# Oppure revert del commit patch
git revert HEAD --no-edit
```

---

## 5. LOG MESSAGES (per debug su iPad)

- `[AUTH] hydrated=true isLoading=false isAuthenticated=<bool>`
- `[AUTH] SIGNED_IN at <timestamp>`
- `[ROUTER] blocked redirect (reason=justSignedIn_grace_period)`
- `[ROUTER] blocked redirect (reason=justSignedIn_grace_period at root)`
- `[SW] blocked reload post-login (deltaMs=<ms>)`

---

## 6. CRITERI DI SUCCESSO

- [x] Nessun redirect immediato a /login durante boot/hydration
- [x] Nessun reload/replace entro 15s dal SIGNED_IN (silentAutoUpdate bloccato)
- [x] Se sessione lenta/instabile, l’app resta in loading invece di redirect
- [x] Nessun impatto su IAP, BUZZ, UI (nessuna modifica a quei moduli)
