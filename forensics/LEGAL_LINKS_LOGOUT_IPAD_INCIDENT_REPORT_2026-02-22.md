# INCIDENT REPORT — Privacy Policy 404 + Logout iPad non immediato

**Data:** 2026-02-22  
**Target:** iOS Capacitor WKWebView (iPhone + iPad)  
**Repo:** lux-hunt-treasure  
**Firma:** Lovable Agent JLENIA

---

## FASE 0 — ROLLBACK SAFETY (ESEGUITO)

- **Tag creato:** `safety/legal-links-logout-ipad-20260222_093754`
- **Short HEAD:** `e2cb6e24`
- **Rollback immediato:**
  ```bash
  git reset --hard safety/legal-links-logout-ipad-20260222_093754
  ```

---

## FASE 1 — ROOT CAUSE 404 PRIVACY POLICY (CERTA)

### Evidenza

1. **Link sulla pagina Login**  
   - **File:** `src/pages/Login.tsx`  
   - **Riga:** 463  
   - **Testo:** `<a href="/privacy" ...>Privacy Policy</a>`  
   - **Path usato:** `/privacy`

2. **Route nel router (Wouter)**  
   - **File:** `src/routes/WouterRoutes.tsx`  
   - **Righe:** 1086–1099  
   - **Route esistenti legali:**  
     - `/terms` → TermsConditions  
     - `/terms-conditions` → TermsConditions  
     - `/privacy-policy` → PrivacyPolicyComplete  
     - `/cookie-policy` → CookiePolicyComplete  
   - **Non esiste** alcuna route `/privacy`.

3. **Confronto**  
   - "Terms of Use" usa `href="/terms"` → route `/terms` esiste → **OK**.  
   - "Privacy Policy" usa `href="/privacy"` → route `/privacy` **non esiste** → **404**.

### Causa certa

**A) Path sbagliato (typo/mismatch):** il link "Privacy Policy" sulla Login punta a `/privacy`, mentre l’unica route legale per la privacy è `/privacy-policy`. Nessuna route `/privacy` è definita in `WouterRoutes.tsx`, quindi il tap apre una path non gestita e si ottiene 404.

### Fix applicato

- In `src/pages/Login.tsx` (riga 463):  
  `href="/privacy"` → `href="/privacy-policy"`.  
- Nessun nuovo file, nessuna nuova route, nessun refactor.

---

## FASE 2 — ROOT CAUSE LOGOUT iPAD NON IMMEDIATO (CERTA)

### Evidenza

1. **Handler logout**  
   - **File:** `src/contexts/auth/AuthProvider.tsx`  
   - **Funzione:** `logout` (circa righe 586–657).

2. **Comportamento pre-fix**  
   - Dopo `signOut` e clear state, il redirect a `/login` era dentro:
     - `setTimeout(..., 150)` → ritardo fisso 150 ms.
   - Prima del redirect veniva avviato il clear di **tutte** le cache (`caches.keys().then(...)`); il redirect avveniva subito dopo l’avvio di questa operazione, ma:
     - Su iPad/WKWebView il **ritardo di 150 ms** era percepito come “non torna subito”.
     - L’uso di `window.location.href = '/login'` (invece di `replace`) può lasciare la pagina precedente in bfcache, con possibile ritardo o “resta su pagina precedente” al ritorno.

3. **Causa certa**  
   - **Ritardo fisso:** redirect dopo 150 ms, non immediato.  
   - **Metodo di redirect:** `href` invece di `replace` → peggiora il comportamento su WKWebView (bfcache).  
   - **Ordine operazioni:** redirect dopo avvio clear cache (anche se non in await) contribuisce a percepire il logout come lento.

### Fix applicato

- **Redirect immediato:** rimosso il `setTimeout(150)`; subito dopo clear state si chiama il redirect.
- **`replace` invece di `href`:** `window.location.replace('/login')` come primo tentativo, fallback `href` solo in catch, per:
  - evitare che la pagina pre-logout resti in bfcache,
  - far “tornare subito” alla Login su iPad.
- **Cache clear in background:** il clear delle cache viene eseguito **dopo** il redirect, in fire-and-forget, senza bloccare il redirect.
- **Log DEV (FASE 2 richiesta):**  
  `[LOGOUT DEBUG] start` | `signOut ok` | `storage cleared` | `navigate -> /login` solo in `process.env.NODE_ENV === 'development'`.

---

## FASE 3 — FIX APPLICATI (MINIMI)

| File | Modifica |
|------|----------|
| `src/pages/Login.tsx` | `href="/privacy"` → `href="/privacy-policy"` (1 riga). |
| `src/contexts/auth/AuthProvider.tsx` | Redirect immediato con `replace('/login')`, cache clear in background, log DEV come sopra. |

- Nessun file nuovo, nessun refactor, nessun cambio UI/routing oltre al link e al comportamento logout.

---

## FASE 4 — TEST OBBLIGATORI (SU iOS)

1. **Login page:** Tap "Terms of Use" → OK; Tap "Privacy Policy" → apre pagina corretta (NO 404).
2. **iPhone:** Logout → torna subito a login.
3. **iPad:** Logout → torna subito a login (senza killare app).
4. **Back/forward:** dopo logout, non deve essere possibile tornare a pagine protette.
5. **Regressione:** nessun’altra route legale deve rompersi.

Se un test fallisce → rollback:

```bash
git reset --hard safety/legal-links-logout-ipad-20260222_093754
```

---

## OUTPUT FINALE

1. **Root cause 404 Privacy:** path errato nel link Login (`/privacy` invece di `/privacy-policy`). Prove: `Login.tsx` riga 463, `WouterRoutes.tsx` righe 1086–1099.
2. **Root cause logout iPad:** redirect ritardato (150 ms) + uso di `href` invece di `replace`. Prove: `AuthProvider.tsx` funzione `logout`.
3. **Diff:** 2 file toccati (`Login.tsx`, `AuthProvider.tsx`), patch minima.
4. **Rollback:** `git reset --hard safety/legal-links-logout-ipad-20260222_093754`
