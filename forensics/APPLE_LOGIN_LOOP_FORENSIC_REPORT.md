# APPLE LOGIN LOOP — FORENSIC REPORT

**Date:** 2026-02-13  
**Incident:** Apple Review — iPad Air 11" (M3), iPadOS — "returned to the login screen after entering the app with the credentials provided"  
**Mode:** READ-ONLY (no code modifications)

---

## 1. ENV CONFIRMATION

### A) Wrapper iOS Stack

| Check | Result | Path/Evidence |
|-------|--------|---------------|
| `capacitor.config.*` | ✅ Present | `capacitor.config.ts`, `ios/App/App/capacitor.config.json` |
| `ios/App/` | ✅ Present | iOS native project exists |
| `WKWebView` | ✅ Capacitor uses WKWebView | Standard Capacitor iOS runtime |
| `ReactNativeWebView` | ❌ Absent | No React Native |
| `cordova.js` | ❌ Absent | No Cordova |

**Conclusion:** **Capacitor** (Ionic Capacitor)

---

### B) Runtime URL

| Source | Value |
|--------|-------|
| Capacitor iOS default | `capacitor://localhost` (origin when loading local `dist/`) |
| Detection in code | `window.location.protocol === 'capacitor:'` (WouterRoutes:225) |
| Server config | No `server.url` in capacitor.config → loads from `webDir: 'dist'` (local bundle) |
| Remote domain | Not used in native build; pages.dev/vercel only for web deploy |

**Conclusion:** **`capacitor://localhost`** (local assets from bundle)

---

### C) Service Worker

| Component | Location | Behavior |
|-----------|----------|----------|
| `navigator.serviceWorker` | Used | `sw-autorun.ts`, `silentAutoUpdate.ts` |
| `ensureSWAnyHost` | `src/lib/pwa/sw-register-anyhost.ts` | Registers `/sw.js` on ANY host (no hostname filter) |
| `ensureMainSWController` | `main.tsx:158-196` | Runs only if `location.hostname.endsWith('.pages.dev')` → **NO in Capacitor** |
| `silentAutoUpdate` | `main.tsx` (deferred 2.5s) | Listens for SW update, calls `location.replace()` or `location.reload()` |
| SW registration | `sw-autorun.ts` imports `ensureSWAnyHost` | `main.tsx` imports `./lib/pwa/sw-autorun` |

**SW in Capacitor WKWebView:**
- `capacitor://localhost` has origin `capacitor://localhost`
- Service Workers require secure context (https or localhost)
- `capacitor://` is treated as a secure context by iOS WKWebView
- `ensureSWAnyHost` registers `/sw.js` without hostname check → **SW can be active in wrapper**
- If SW activates and detects update → `silentAutoUpdate.handleControllerChange()` → `performSilentRefresh()` → `location.replace()` (iOS PWA) or `location.reload()`

**Conclusion:**
- **SW attivo nel wrapper:** Probabile (se `navigator.serviceWorker` disponibile su `capacitor://localhost`)
- **SW solo su web:** No — `ensureSWAnyHost` non filtra per host
- **Reload automatici post-login:** Sì — `silentAutoUpdate` può fare reload al controller change; nessuna protezione per "appena fatto login"

---

## 2. AUTH FLOW ANALYSIS

### Supabase Client Config

| Param | Value | File |
|-------|-------|------|
| storage | `localStorage` | `src/integrations/supabase/client.ts:19` |
| persistSession | `true` | ivi:20 |
| autoRefreshToken | `true` | ivi:21 |
| flowType | (default implicit) | Not set |
| detectSessionInUrl | (default true) | Not set |

```ts
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(..., {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

### AuthProvider Init Sequence

| Step | Action | File |
|------|--------|------|
| 1 | `getCachedSession()` from `m1ssion_session_cache` | AuthProvider:45-56 |
| 2 | `useState(isLoading: !cachedAuth.user)` — if cache empty → `isLoading = true` | 66 |
| 3 | `initializeAuth()` starts (useEffect) | 95-167 |
| 4 | `getSession()` with up to 3 retries, 1s delay between attempts | 114-139 |
| 5 | On success: `setSession`, `setUser`, `cacheSession` | 143-147 |
| 6 | `finally`: `setIsLoading(false)` — **always** | 155-157 |
| 7 | `onAuthStateChange` listener: on `SIGNED_IN` → `setUser`, `cacheSession`; on `SIGNED_OUT` → `setUser(null)` | 176-265 |

---

### Race Condition Check

**isLoading false prima che getSession completi?**

- Sì, possibile. Sequenza:
  1. Cache vuota → `isLoading = true`
  2. `initializeAuth()` parte async
  3. `getSession()` può richiedere tempo (rete, storage)
  4. Se `getSession` fallisce dopo 3 retry → `return` senza session, poi `finally` → `setIsLoading(false)`
  5. In quel momento: `user = null`, `isLoading = false` → router vede `!isAuthenticated` → redirect a `/login`

- Race con `onAuthStateChange`:
  - `SIGNED_IN` arriva dopo che il router ha già fatto redirect
  - Se `getSession` ritorna sessione valida ma `onAuthStateChange` emette prima `SIGNED_OUT` (es. refresh fallito) → `setUser(null)` → redirect

- Nessun grace period: appena `isLoading = false` e `user = null` → redirect immediato

---

## 3. ROUTER & REDIRECT CONDITIONS

### Redirect to `/login` — Locations

| File | Condition | Snippet |
|------|-----------|---------|
| `WouterRoutes.tsx:268` | `!isAuthenticated` + Capacitor app | `isCapacitorApp ? <Redirect to="/login" /> : <LandingPage />` |
| `WouterProtectedRoute.tsx:64-66` | `!isAuthenticated` | `return <Redirect to="/login" replace />` |
| `AuthProvider.tsx:584-592` | On logout | `window.location.href = '/login'` |

---

### ProtectedRoute Logic (WouterProtectedRoute)

| Step | Condition | Effect |
|------|-----------|--------|
| 1 | `authLoading` | `AuthLoadingScreen` |
| 2 | `isAdminUser` | Render children |
| 3 | `!isAuthenticated` | **`<Redirect to="/login" replace />`** |
| 4 | `accessLoading` | `AuthLoadingScreen` |
| 5 | `!subscriptionPlan` (non ADMIN) | `<Redirect to="/choose-plan" replace />` |
| 6 | `!canAccess` | `AccessBlockedView` |
| 7 | else | Render children |

---

### Critical Points

- **Grace period:** Nessuno. Se `isAuthenticated` è false per 1 frame → redirect immediato
- **Double-check su loading:** Sì — `authLoading` tiene AuthLoadingScreen, ma appena `authLoading = false` e `isAuthenticated = false` → redirect
- **1-frame false:** Se React batching o race fanno sì che `isAuthenticated` sia false per un render, si va subito a login

---

## 4. STORAGE ANALYSIS

### Auth-Related Keys

| Key | Storage | Role |
|-----|---------|------|
| `sb-{projectRef}-auth-token` | localStorage | Supabase session (default key) |
| `m1ssion_session_cache` | localStorage | AuthProvider cache, TTL 1h |
| `post_login_redirect` | localStorage | Post-login target (consumed by `postLoginRedirectFixed`) |
| `sw:reloaded:{buildId}` | sessionStorage | silentAutoUpdate anti-loop |
| `sw:updateReady:{buildId}` | sessionStorage | silentAutoUpdate |
| `sw-main-reload` | sessionStorage | ensureMainSWController (solo pages.dev) |
| `m1_splash_shown_session` | sessionStorage | Splash shown this session |
| `m1ssion_login_reason` | sessionStorage | Login reason (e.g. logout) |
| `hasSeenPostLoginIntro` | sessionStorage | Post-login intro seen |

---

### localStorage Vuoto / Non Persistente

- **Se localStorage vuoto al boot:** `getCachedSession()` → null; `getSession()` legge da Supabase storage (stesso localStorage) → null → `setUser(null)`, `setIsLoading(false)` → redirect
- **Se localStorage non persistente (WKWebView iPad):** Dopo kill/resume, localStorage può essere vuoto → stesso outcome
- **Fallback:** Nessuno. Nessun Capacitor Preferences o Keychain adapter

---

### sessionStorage

- Più volatile di localStorage in WKWebView
- Usato per: splash, login reason, SW flags
- Al reload: sessionStorage si resetta
- `silentAutoUpdate` usa sessionStorage → al reload le flag si perdono; nessun loop, ma reload avviene comunque

---

## 5. TRIGGER MATRIX

| Trigger | Presente nel repo? | Evidenza | Probabilità |
|---------|--------------------|----------|-------------|
| Race init vs router | ✅ | `setIsLoading(false)` in `finally` anche se session null; nessun grace period | ALTA |
| silentAutoUpdate reload | ✅ | `silentAutoUpdate.ts` → `location.replace()` / `location.reload()` su controller change; init a 2.5s | MEDIA |
| Refresh token failure | ✅ | `autoRefreshToken: true`; `onAuthStateChange` gestisce `SIGNED_OUT` | MEDIA |
| SIGNED_OUT listener | ✅ | AuthProvider:239-263 → `setUser(null)` | ALTA |
| Storage non persistente (WKWebView) | ✅ | Solo `localStorage`, nessun adapter nativo; `useBuzzApi` doc: "WKWebView timing issues" | ALTA |
| subscriptionPlan redirect | ✅ | WouterProtectedRoute:74-76 → redirect a `/choose-plan` se plan vuoto | BASSA |
| Network failure | ✅ | `getSession` fallisce dopo 3 retry → session null → redirect | MEDIA |
| ensureMainSWController reload | ❌ (solo web) | `location.hostname.endsWith('.pages.dev')` → no su capacitor://localhost | N/A |

---

## 6. ROOT CAUSE

### Decision Tree (Logic)

1. **Token non scritto** → Root A: Supabase non scrive in localStorage
2. **Token sparisce post-reload/resume** → Root B: localStorage non persistente in WKWebView iPad
3. **Redirect prima che session sia ready** → Root C: race init vs router
4. **Reload post-login** → Root D: silentAutoUpdate / SW
5. **Refresh 401 / SIGNED_OUT** → Root E: refresh token failure

---

### Root Cause Primaria

**Root B + Root C (combinati) — Confidenza: 75%**

- **Root B (Storage WKWebView):** Su iPad, WKWebView può avere politiche di storage diverse (ITP, process kill, multi-window). Se localStorage non persiste tra sessioni o al resume, `getSession()` ritorna null → redirect.
- **Root C (Race):** `setIsLoading(false)` viene chiamato in `finally` anche quando `getSession` fallisce o ritorna null. Router vede `!isAuthenticated` e `!authLoading` → redirect immediato, senza attendere eventuale `onAuthStateChange(SIGNED_IN)`.

---

### Root Cause Secondarie

- **Root D (Reload):** Se SW è attivo e `silentAutoUpdate` fa reload subito dopo login, la sessione può non essere ancora persistita → al reload storage vuoto → redirect.
- **Root E (Refresh failure):** Se il refresh del token fallisce (rete, clock, policy), Supabase emette `SIGNED_OUT` → `setUser(null)` → redirect.

---

## 7. FIX FEASIBILITY (PIANO — NO PATCH)

| Root | Fix teorico | Complessità | Rischio | Impatto |
|------|-------------|-------------|---------|---------|
| **B** | Usare `@capacitor/preferences` o Keychain per token auth; adapter storage custom per Supabase | Media | Basso | Alto — migliora persistenza su iPad |
| **C** | Grace period: non redirect se `isLoading` è stato true nelle ultime N ms; oppure attendere primo `getSession` prima di considerare "not authenticated" | Bassa | Basso | Medio |
| **D** | Evitare reload nelle prime 10–15s dopo `SIGNED_IN`; flag "just_logged_in" in sessionStorage | Bassa | Basso | Basso |
| **E** | Retry su refresh failure; gestire meglio `TOKEN_REFRESHED` vs `SIGNED_OUT`; evitare logout automatico al primo fallimento | Media | Medio | Medio |

---

## 8. APPLE REVIEW READINESS

| Criterio | Valore |
|----------|--------|
| Probabilità approvazione AS-IS | 5% |
| Rischio rigetto su iPad | ALTO |
| Rischio regressione iPhone | BASSO (comportamento può differire) |
| Rischio su TestFlight | Uguale a produzione se stesso build |
| Rischio su IAP | Nessun legame diretto con auth |
| Rischio su Login providers | Apple/Google sospesi; problema con email/password flow |

---

## 9. CONCLUSION EXECUTIVA

Apple segnala che su iPad Air 11" (M3), iPadOS, dopo il login con credenziali valide l’utente viene riportato alla schermata di login.

L’analisi forense (solo lettura) individua due cause principali:

1. **Storage non persistente in WKWebView su iPad** (Root B): l’uso esclusivo di `localStorage` per i token, senza adapter nativo (Capacitor Preferences / Keychain), espone a perdita di sessione su iPad, specialmente con process kill, resume o multi-window.
2. **Race tra init auth e router** (Root C): `setIsLoading(false)` viene chiamato in `finally` anche quando `getSession` fallisce o non trova sessione. Il router redirige subito a `/login` senza grace period, e può farlo prima che `onAuthStateChange(SIGNED_IN)` aggiorni lo stato.

Cause secondarie plausibili: reload da `silentAutoUpdate` subito dopo login (Root D) e fallimento del refresh token con conseguente `SIGNED_OUT` (Root E).

**Azioni consigliate (solo piano, nessuna patch implementata):**

1. Valutare storage adapter nativo per Supabase auth su iOS.
2. Introdurre un breve grace period prima di considerare l’utente non autenticato.
3. Escludere reload automatici nelle prime 10–15 secondi dopo login.
4. Riprodurre su iPad reale (TestFlight) con log e dump di storage per validare root cause e fix.

---

*Report generato in modalità READ-ONLY. Nessuna modifica al codice applicata.*
