# 🔍 INCIDENT REPORT — M1SSION iOS (WRAPPED) — FORENSIC VERIFICATION

**Date:** 2026-02-13  
**Branch:** `fix/i18n-global-ultra-safe`  
**Scope:** Apple Review Pass — Login Loop + i18n + Last Implementations  
**Mode:** READ-ONLY (no code modifications applied)

---

## 1) Executive Summary

Apple reported that on **iPad Air 11" (M3) / iPadOS**, reviewers are returned to the login screen after entering the app with valid credentials. This forensic audit identifies the auth stack (Supabase + localStorage), routing flow (Wouter + ProtectedRoute), and multiple **root cause candidates** for the login loop. The most probable causes are: **(1)** localStorage/session persistence issues in WKWebView on iPadOS (including possible ITP/Private Mode or process lifecycle differences), **(2)** race between AuthProvider init and router guard when `isLoading` flips to false before session is fully hydrated, and **(3)** silent auto-update or SW controller enforcement triggering a reload shortly after login, before session is persisted. i18n is well-structured (en/it/fr, fallback en, localStorage persistence) with minor residual hardcoded strings. Recent implementations (VERA BOMB, LearnM1U, i18n phase 3) show no obvious regression triggers but add complexity. **Apple Review Readiness:** MEDIUM — login loop must be fixed and verified on iPad before resubmission.

---

## 2) Reproduction Matrix

| Device/OS | Steps | Expected | Result | Notes |
|-----------|-------|----------|--------|-------|
| iPhone (real, TestFlight) | Clean install → login → close app → reopen | Stay logged in | **TBD** | Requires device testing |
| iPad (real, TestFlight) | Clean install → login → close app → reopen | Stay logged in | **TBD** | Apple's reported scenario |
| iPad Air 11" M3 / iPadOS | Same as above | Stay logged in | **FAIL** (per Apple) | "Returned to login screen" |
| Simulator iOS | Same flow | Stay logged in | **TBD** | Proxy; may not reproduce |
| Web (Safari) | Same flow | Stay logged in | **TBD** | Baseline comparison |

**Momento esatto del fallimento:** Non verificabile senza log su device. Apple indica "after entering the app with the credentials provided" — quindi subito dopo il login o al primo resume/riavvio.

**Strumenti richiesti per riproduzione controllata:**
- Xcode console (device attached)
- Safari Web Inspector → Develop → [device] → [WKWebView]
- Network tab per richieste Supabase auth (refresh, getSession)
- Storage snapshot: `localStorage` keys `sb-*-auth-token`, `m1ssion_session_cache`

---

## 3) Evidence Logs

### 3.1 Auth Stack (source code)

**Supabase client** (`src/integrations/supabase/client.ts`):
```
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
}
```

- **Storage key:** Supabase usa `sb-{projectRef}-auth-token` (da `clientUtils.ts` / supabase-js default).
- **detectSessionInUrl:** Non impostato → default `true`. In Capacitor WKWebView l’URL è `capacitor://localhost`, quindi nessun hash OAuth; nessun impatto diretto.
- **flowType:** Default implicit (non PKCE).

**AuthProvider** (`src/contexts/auth/AuthProvider.tsx`):
- Cache secondaria: `m1ssion_session_cache` in localStorage (TTL 1h).
- Init: `getSession()` con 3 tentativi e 1s tra un tentativo e l’altro.
- `onAuthStateChange`: logging dettagliato (anche in produzione).
- Visibility handler: ri-controllo sessione quando `document.visibilityState === 'visible'` (solo PWA/standalone).

**Login page** (`src/pages/Login.tsx`):
- Redirect se `isAuthenticated`: `postLoginRedirectFixed(navigate)` → `/map-3d-tiler` (o `post_login_redirect` da localStorage).
- Usa `sessionStorage` per `m1ssion_login_reason` (logout) e `m1_splash_shown_session` (splash).

### 3.2 Routing Flow

**WouterRoutes** (`src/routes/WouterRoutes.tsx`):
- Root `/`: se `isLoading` → black screen; se `!isAuthenticated` e Capacitor → `<Redirect to="/login" />`.
- Se autenticato → `ProtectedRoute` → `AppHome`.

**ProtectedRoute** (`src/components/auth/WouterProtectedRoute.tsx`):
- `authLoading` → AuthLoadingScreen
- `!isAuthenticated` → `<Redirect to="/login" replace />`
- Poi: access control, `choose-plan`, ecc.

**Possibili trigger redirect a /login:**
1. `isLoading` diventa `false` prima che la sessione sia letta e propagata.
2. `getSession()` fallisce/ritorna null (es. storage vuoto o non leggibile).
3. `refreshSession` fallisce e Supabase emette `SIGNED_OUT` → `setUser(null)`.
4. `visibilitychange` o altro path che chiama `getSession()` e non trova sessione.

### 3.3 WKWebView Storage (documentazione interna)

`src/hooks/buzz/useBuzzApi.ts`:
```ts
// WKWebView has issues with CORS preflight and session storage
// WKWebView can have timing issues with session storage
```

`src/utils/silentAutoUpdate.ts`:
- Usa `sessionStorage` per `sw:reloaded:{buildId}` e `sw:updateReady:{buildId}`.
- Su iOS PWA può eseguire `location.replace(currentUrl)` o `location.reload()`.
- Se il reload avviene subito dopo il login, la sessione potrebbe non essere ancora persistita in localStorage.

---

## 4) Root Cause Candidates (Login Loop)

### Candidato #1: localStorage non persistente/limitato in WKWebView iPadOS — **ALTA probabilità**

**Meccanismo:**
- Supabase salva token in `localStorage` sotto `sb-*-auth-token`.
- Su iPadOS, WKWebView può avere politiche di storage più restrittive (ITP, Private Mode, process kill, multi-window).
- Se `localStorage` non è disponibile o viene svuotato al resume/background, `getSession()` ritorna null e l’utente viene trattato come non autenticato.

**Prove:**
- Uso esplicito di `storage: localStorage` in Supabase client.
- Nessun adapter per Capacitor Preferences o Keychain.
- `useBuzzApi` documenta problemi con storage in WKWebView.

**Perché su iPad:**
- iPad ha gestioni di memoria e lifecycle diverse (Split View, Slide Over, multitasking).
- iPadOS può terminare processi WKWebView più aggressivamente.

**Fix difficulty:** MEDIUM  
**File:** `src/integrations/supabase/client.ts`, eventuale adapter storage tipo `@capacitor/preferences` o Keychain.

---

### Candidato #2: Race condition init auth vs router guard — **MEDIA probabilità**

**Meccanismo:**
- AuthProvider parte con `isLoading: !cachedAuth.user`.
- Se la cache è vuota, `isLoading = true` → routing mostra loading.
- `initializeAuth()` chiama `getSession()`; se la risposta è lenta o fallisce, `setIsLoading(false)` viene comunque chiamato in `finally`.
- Router vede `isLoading = false` e `user = null` → redirect a `/login` prima che una sessione valida venga recuperata o che `onAuthStateChange` abbia emesso `SIGNED_IN`.

**Prove:**
- `ProtectedRoute` redirect a `/login` quando `!isAuthenticated` e `!authLoading`.
- La sequenza `getSession` → `setUser` → re-render può arrivare dopo il render del router.

**Perché su iPad:**
- CPU/network diversi possono rallentare `getSession()`.
- Più contesti aperti (es. Safari + app) possono influenzare tempi.

**Fix difficulty:** LOW–MEDIUM  
**File:** `src/contexts/auth/AuthProvider.tsx`, `src/components/auth/WouterProtectedRoute.tsx` — introdurre un grace period o non considerare "autenticato = false" fino al primo `getSession` completato.

---

### Candidato #3: Reload post-login (silent update / SW) — **MEDIA probabilità**

**Meccanismo:**
- `silentAutoUpdate` e `ensureMainSWController` possono provocare `location.reload()` o `location.replace()`.
- Se il reload avviene subito dopo il login, il token potrebbe non essere ancora scritto in `localStorage` in modo persistente.
- `sessionStorage` usato per anti-loop viene resettato al reload → possibile nuovo reload in loop.

**Prove:**
- `silentAutoUpdate` usa `sessionStorage` e `location.reload`/`location.replace`.
- `ensureMainSWController` (main.tsx) può registrare SW e innescare reload.
- Init avviene con delay (es. 2500ms per silent update, 1000ms per deep link).

**Perché su iPad:**
- Su iPad il resume dallo sfondo può attivare aggiornamenti SW o logiche di refresh che su iPhone non si manifestano nello stesso modo.

**Fix difficulty:** MEDIUM  
**File:** `src/utils/silentAutoUpdate.ts`, `src/main.tsx` — evitare reload nelle prime N secondi dopo login, o dopo `SIGNED_IN`.

---

### Candidato #4: refresh token fallisce → SIGNED_OUT — **BASSA–MEDIA probabilità**

**Meccanismo:**
- `autoRefreshToken: true` fa sì che Supabase rinnovi automaticamente il token.
- Se il refresh fallisce (rete, clock skew, token revocato), Supabase emette `SIGNED_OUT` e cancella la sessione.
- AuthProvider riceve l’evento e fa `setUser(null)` → redirect a login.

**Prove:**
- `onAuthStateChange` gestisce `SIGNED_OUT`.
- `useBuzzApi` implementa fallback con `refreshSession()` e `getUser()` per casi in cui la sessione non è immediatamente disponibile.

**Perché su iPad:**
- Clock skew, reti instabili o policy di rete diverse su iPad potrebbero influire.

**Fix difficulty:** MEDIUM  
**File:** `src/contexts/auth/AuthProvider.tsx` — gestione `TOKEN_REFRESHED` vs `SIGNED_OUT`, eventuale retry prima di considerare l’utente disconnesso.

---

### Candidato #5: OAuth deep link timing — **BASSA probabilità**

**Meccanismo:**
- `initDeepLinkAuth` viene caricato 1s dopo il boot.
- Se l’utente fa login con Apple/Google e il callback arriva prima dell’init, l’URL con token potrebbe non essere processato.

**Prove:**
- `main.tsx`: `setTimeout(..., 1000)` prima di `initDeepLinkAuth()`.
- `authDeepLink.ts` gestisce `access_token`, `refresh_token`, `code` da URL.

**Perché su iPad:**
- I tempi di redirect OAuth possono variare tra dispositivi.

**Fix difficulty:** LOW  
**File:** `src/main.tsx`, `src/lib/authDeepLink.ts` — anticipare `initDeepLinkAuth` o eseguirlo in parallelo al boot.

---

## 5) i18n Audit Results

### Stack
- **Libreria:** i18next + react-i18next
- **Namespace:** `common`
- **Lingue:** en, it, fr
- **Fallback:** `en`

### Checklist

| Check | Status |
|-------|--------|
| Fallback language definita | ✅ `fallbackLng: 'en'` |
| Missing keys handling | ✅ i18next ritorna la chiave se mancante (no crash) |
| Lazy-load namespaces | ✅ Single namespace `common` (no race) |
| Persistenza lingua su iOS | ✅ `localStorage` (`m1_locale`, `m1_locale_mode`) con try/catch |
| Plural rules / interpolation | ✅ `interpolation: { escapeValue: false }` |
| IT/EN/FR | ✅ Tutti e tre presenti |

### Persistenza preferenze
- `m1_locale`: lingua selezionata
- `m1_locale_mode`: `'auto'` | `'manual'`
- `getDefaultLocale()`: se `manual` usa saved, altrimenti `getDeviceLocale()` da `navigator.languages`

### Chiavi verificate
- `learn_m1uprizes_title`, `m1u_what_title`, `m1u_earn_title`, ecc. — presenti in en, it, fr
- `vera_mission.bomb.*` — presenti in en, it, fr
- `home_verify_plan` — presente in en, it, fr

### Problemi minori
1. **Stringhe hardcoded residue:** Alcune label (es. "Sign Up", "Log In", "Back", "Loading...") nella pagina Login e in altre UI non passano da `t()`.
2. **Placeholder non localizzati:** Es. "Processing...", "Speaking..." in alcuni contesti.
3. **Impatto:** Basso — non causa crash, solo UI non localizzata.

### Difficoltà fix
- Aggiungere chiavi mancanti: LOW
- Sostituire stringhe hardcoded: LOW–MEDIUM (diffusa in molti componenti)

---

## 6) Latest Implementations Audit Results

### Aree recenti (da git / contesto)

1. **VERA MISSION BOMB**
   - File: `BombMissionModal.tsx`, `useBombMissionRun.ts`, `NextActionContent.tsx`, `NextActionContainer.tsx`
   - Fix: START button, toast su errore, badge testo
   - Rischio regressione: BASSO (flag-gated, non impatta auth o routing)

2. **Learn M1U / Prizes Modal**
   - File: `LearnM1UPrizesModal.tsx`
   - Usa i18n correttamente
   - Rischio: BASSO

3. **i18n Phase 3**
   - ShopModal, FortuneWheel, NextActionContainer, ScratchWinModal, ecc.
   - Solo sostituzione stringhe con `t()`
   - Rischio: BASSO

4. **silentAutoUpdate / SW Controller**
   - `main.tsx`, `silentAutoUpdate.ts`, `swControllerGuard`
   - Possono causare reload
   - Rischio: MEDIO (vedi Candidato #3)

### ErrorBoundary / null check
- `ErrorBoundary` usato in WouterRoutes
- `(orderedActions ?? []).map` e simili per evitare crash su undefined

### Probabilità che Apple incontri problemi
- **Login loop:** ALTA (già segnalato)
- **Crash da null/undefined:** BASSA
- **i18n crash:** BASSA
- **Freeze/performance:** BASSA (non rilevato in audit)

---

## 7) Fix Feasibility

| Root Cause | Difficulty | Rischio | File principali |
|------------|------------|---------|-----------------|
| localStorage WKWebView | MEDIUM | Medio | `client.ts`, storage adapter |
| Race init vs router | LOW–MEDIUM | Basso | `AuthProvider.tsx`, `WouterProtectedRoute.tsx` |
| Reload post-login | MEDIUM | Medio | `silentAutoUpdate.ts`, `main.tsx` |
| Refresh token failure | MEDIUM | Basso | `AuthProvider.tsx` |
| OAuth deep link timing | LOW | Basso | `main.tsx`, `authDeepLink.ts` |

---

## 8) Apple Review Readiness Score

| Criterio | Score | Note |
|----------|-------|------|
| Login persistente | ❌ FAIL | Problema segnalato da Apple |
| i18n corretto | ✅ OK | en/it/fr, fallback, persistenza |
| Ultime feature stabili | ⚠️ PARTIAL | VERA BOMB, Learn M1U OK; reload/SW da verificare |
| Nessun crash evidente | ✅ OK | ErrorBoundary, null checks |

**Blocco principale:** Login loop su iPad — l’app non supera la review finché la sessione non persiste correttamente.

---

## 9) Next Actions (Piano — NO patch)

1. **Riproduzione su iPad reale**
   - Build release / TestFlight su iPad Air (o equivalente)
   - Clean install → login → chiudi app → riapri
   - Catturare log Xcode, Safari Web Inspector, snapshot storage prima/dopo

2. **Storage diagnostic**
   - Verificare presenza di `sb-*-auth-token` e `m1ssion_session_cache` in localStorage dopo login
   - Verificare se le chiavi spariscono al resume/background

3. **Test storage adapter**
   - Valutare `@capacitor/preferences` o Keychain per token auth su iOS, mantenendo compatibilità web

4. **Mitigazione race**
   - Aggiungere breve grace period prima di considerare l’utente non autenticato (es. attendere primo `getSession` completato)
   - Evitare redirect a `/login` durante la finestra di init

5. **Mitigazione reload**
   - Evitare `location.reload` / `location.replace` nelle prime 10–15 secondi dopo `SIGNED_IN`
   - Oppure salvare flag "just_logged_in" e saltare reload in quella finestra

6. **Instrumentazione temporanea**
   - Log dettagliati (sanitizzati) per `getSession`, `onAuthStateChange`, redirect a `/login`
   - Rimuovere dopo debug

---

## 10) File / Entrypoints Coinvolti (Inventario)

| Path | Ruolo |
|------|-------|
| `src/integrations/supabase/client.ts` | Config Supabase (storage, persistSession, autoRefreshToken) |
| `src/contexts/auth/AuthProvider.tsx` | Init sessione, onAuthStateChange, cache, visibility |
| `src/components/auth/WouterProtectedRoute.tsx` | Guard: redirect a /login se !isAuthenticated |
| `src/routes/WouterRoutes.tsx` | Root routing, redirect Capacitor → /login |
| `src/pages/Login.tsx` | Login UI, postLoginRedirectFixed |
| `src/utils/postLoginRedirectFixed.ts` | Redirect post-login a /map-3d-tiler |
| `src/lib/authDeepLink.ts` | OAuth callback su deep link |
| `src/hooks/useUnifiedAuth.ts` | Hook auth (AuthContext) |
| `src/hooks/useAccessControl.ts` | Access control, admin bypass |
| `src/hooks/buzz/useBuzzApi.ts` | Fetch con session, workaround WKWebView |
| `src/utils/silentAutoUpdate.ts` | Silent reload su SW update |
| `src/main.tsx` | Boot, SW guard, initDeepLinkAuth |
| `src/i18n/i18n.ts` | i18n bootstrap, localStorage m1_locale |

---

## Diagramma Flow (testuale)

```
[App Boot]
    │
    ├─> AuthProvider mount
    │       ├─> getCachedSession() → user/session da m1ssion_session_cache
    │       ├─> initializeAuth() → getSession() x3 retry
    │       │       └─> setUser/setSession + cacheSession
    │       └─> onAuthStateChange listener
    │
    ├─> WouterRoutes render
    │       ├─> isLoading? → black screen (Capacitor) o skeleton
    │       ├─> !isAuthenticated && Capacitor? → Redirect /login
    │       └─> isAuthenticated → ProtectedRoute → AppHome
    │
    └─> ProtectedRoute
            ├─> authLoading? → AuthLoadingScreen
            ├─> !isAuthenticated? → Redirect /login  ◄── POSSIBILE LOOP
            ├─> accessLoading? → AuthLoadingScreen
            └─> canAccess? → children

[Login Page]
    ├─> isAuthenticated? → postLoginRedirectFixed → /map-3d-tiler
    └─> signInWithPassword / OAuth → onAuthStateChange(SIGNED_IN) → setUser

[Resume / Reload]
    ├─> visibilitychange → getSession() → update state
    ├─> silentAutoUpdate / SW → location.reload  ◄── POSSIBILE PERDITA SESSIONE
    └─> getSession() da storage → se null → redirect /login
```

---

**Fine Report — READ-ONLY — Nessuna modifica applicata.**
