# IPHONE REGRESSION — AFTER APPLE LOGIN LOOP MINIMAL PATCH

**Date:** 2026-02-13  
**Branch:** `fix/login-loop-regression-iphone`  
**Context:** iPhone goes worse (login/flow unstable or stuck in loading) after minimal patch. This report is populated after running instrumented build on iPhone.

---

## 1. BUILD INFO

| Field | Value |
|-------|-------|
| Build hash | (run `git rev-parse --short HEAD`) |
| Branch | `fix/login-loop-regression-iphone` |
| Device | iPhone [ modello ] |
| iOS version | [ versione ] |
| Capacitor | Yes |

---

## 2. TIMELINE EVENTI

Raccogliere dai log `[AUTH-FORENSIC]` su Safari Web Inspector (iOS) o Xcode console:

| Evento | Timestamp (approx) | isLoading | authHydrated | isAuthenticated | justSignedInAt | currentRoute |
|--------|--------------------|-----------|--------------|-----------------|----------------|--------------|
| T0_launch | | | | | | |
| T1_login_submit | | | | | | |
| T2_SIGNED_IN | | | | | | |
| T3_route_change | | | | | | |
| T4_redirect_or_loading | | | | | | reason=___ |

---

## 3. STORAGE SNAPSHOT (da log)

Per ogni punto del timeline, i log includono `storage={...}`:

- `sb-*-auth-token`: PRESENT/ABSENT, len
- `m1ssion_session_cache`: PRESENT/ABSENT, len  
- `m1_just_signed_in_at`: PRESENT/ABSENT, len

**Non loggare token, email o dati sensibili.**

---

## 4. TRIAGE — DOVE SI BLOCCA

In base ai log, determinare:

- [ ] **A) Root gating (WouterRoutes)** — `reason=root_loading` o `root_not_hydrated` o `root_grace_period` ripetuti → flow bloccato alla root
- [ ] **B) authHydrated / grace period** — `reason=not_hydrated` o `grace_period` per >3s → loading infinito
- [ ] **C) getUser fallback** — ordine stati alterato (evidenza da timeline)
- [ ] **D) silentAutoUpdate** — `[SW] blocked reload post-login` seguito da comportamento anomalo

**Decisione:** _______________

---

## 5. COME RACCOGLIERE I LOG SU iPhone

1. Connetti iPhone a Mac
2. Safari (Mac) → Sviluppo → [iPhone] → [pagina capacitor]
3. Oppure: Xcode → Window → Devices and Simulators → Open Console
4. Riproduci il flusso: launch → login → (blocco?)
5. Copia le righe `[AUTH-FORENSIC]` e incolla nella sezione 2

---

## 6. ROLLBACK PLAN

```bash
# Torna allo snapshot post-patch (con regressione)
git checkout 1829e96e

# Torna al pre-patch (stato stabile prima della minimal patch)
git checkout 3509aa42
```
