# NPM CI Fix Report — Capacitor 7 + @capgo/native-purchases
**Date:** 2026-02-11
**Issue:** npm ci failing due to peer dependency conflict
**Status:** ✅ FIXED

---

## 1. PROBLEMA INIZIALE

### Errore ERESOLVE
```
npm error While resolving: vite_react_shadcn_ts@0.0.0
npm error Found: @capacitor/core@7.4.5
npm error Could not resolve dependency:
npm error peer @capacitor/core@">=8.0.0" from @capgo/native-purchases@8.0.22
```

### Errore Lock Out-of-Sync
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

### Root Cause
1. `@capgo/native-purchases@^8.0.18` richiede `@capacitor/core >=8.0.0`
2. Progetto usa `@capacitor/core@^7.4.4`
3. `.npmrc` aveva `package-lock=false` che impediva generazione lockfile

---

## 2. FIX APPLICATI

### A) Downgrade @capgo/native-purchases

| Prima | Dopo |
|-------|------|
| `@capgo/native-purchases: "^8.0.18"` | `@capgo/native-purchases: "7.16.2"` |

**Motivo:** `7.16.2` richiede `@capacitor/core >=7.0.0` (compatibile)

### B) Abilitato package-lock in .npmrc

| Prima | Dopo |
|-------|------|
| `package-lock=false` | `package-lock=true` |

**Motivo:** Necessario per `npm ci` che richiede un lockfile

### C) Rigenerato package-lock.json

```bash
rm -rf node_modules package-lock.json
npm install
# → package-lock.json creato (539KB)
```

---

## 3. VERSIONI FINALI

### Capacitor (Invariate)
```json
"@capacitor/android": "^7.4.4",
"@capacitor/app": "^7.1.1",
"@capacitor/cli": "^7.4.4",
"@capacitor/core": "^7.4.4",
"@capacitor/haptics": "^7.0.3",
"@capacitor/ios": "^7.4.4",
"@capacitor/push-notifications": "^7.0.4",
"@capacitor/status-bar": "^7.0.4"
```

### Capgo Native Purchases (Downgraded)
```json
"@capgo/native-purchases": "7.16.2"
```

---

## 4. RISULTATI TEST

| Comando | Risultato |
|---------|-----------|
| `npm ci` | ✅ SUCCESS (added 1024 packages in 20s) |
| `npm run build` | ✅ SUCCESS (built in 57.86s) |
| `npx cap sync ios` | ✅ SUCCESS (Sync finished in 20.783s) |

### Plugins iOS Rilevati
```
@capacitor/app@7.1.1
@capacitor/haptics@7.0.3
@capacitor/push-notifications@7.0.4
@capacitor/status-bar@7.0.4
@capgo/native-purchases@7.16.2
capacitor-plugin-safe-area@4.0.3
```

---

## 5. FILES MODIFICATI

| File | Modifica |
|------|----------|
| `package.json` | `@capgo/native-purchases: "7.16.2"` |
| `.npmrc` | `package-lock=true` |
| `package-lock.json` | Rigenerato (539KB) |

---

## 6. ROLLBACK (Se Necessario)

```bash
# Rollback immediato
git reset --hard ROLLBACK_BEFORE_CAPGO_FIX
git stash pop  # Recupera eventuali modifiche stash
```

---

## 7. WARNING RESIDUI (Non Bloccanti)

```
npm warn deprecated emailjs-com@3.2.0: Use @emailjs/browser
npm warn deprecated three-mesh-bvh@0.7.8: Use v0.8.0
npm warn deprecated react-beautiful-dnd@13.1.1: deprecated
npm warn deprecated glob@10/11: Update to current version
```

Questi warning sono pre-esistenti e non influenzano la build.

---

## 8. VALUTAZIONE

| Criterio | Prima | Dopo |
|----------|-------|------|
| npm ci funziona | ❌ FAIL | ✅ SUCCESS |
| Riproducibilità CI/CD | ❌ No | ✅ Sì |
| Capacitor 7 mantenuto | ✅ | ✅ |
| Build iOS funzionante | ❌ Bloccato | ✅ OK |

**Meglio di prima?** ✅ SÌ — Install riproducibile con npm ci, nessun conflitto peer deps

---

*Report generato: 2026-02-11*
