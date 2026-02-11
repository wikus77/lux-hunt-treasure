# Android AAB Fix Report
**Date:** 2026-02-10
**Status:** ✅ FIXED - Essential assets restored, AAB under 200MB limit

---

## PROBLEMA INIZIALE

| Metric | Valore | Issue |
|--------|--------|-------|
| AAB Size | 15 MB | Troppo piccolo |
| Base Module | 37 MB | Asset mancanti |
| Login | ❌ No animazioni | Asset UI mancanti |
| Home | ❌ ERR-MLGGTTLM | Crash ErrorBoundary |

**Causa:** Esclusione troppo aggressiva di cartelle essenziali via `aaptOptions.ignoreAssetsPattern`

---

## FIX APPLICATO

### Pattern PRIMA (broken):
```groovy
ignoreAssetsPattern '....:prizes:lovable-uploads:m1ssion-prize:crew:crew-team:scratch'
```

### Pattern DOPO (fixed):
```groovy
ignoreAssetsPattern '....:*.mp4:*.mov:*.webm:*.glb:prizes:models'
```

### Cambiamenti:
| Asset | Prima | Dopo | Note |
|-------|-------|------|------|
| `lovable-uploads/` | ❌ Escluso | ✅ Incluso | 56M - UI home/login |
| `scratch/` | ❌ Escluso | ✅ Incluso | 11M - Gioco scratch |
| `crew/` | ❌ Escluso | ✅ Incluso | 13M - Team UI |
| `crew-team/` | ❌ Escluso | ✅ Incluso | 11M - Team UI |
| `m1ssion-prize/` | ❌ Escluso | ✅ Incluso | 19M - Prize visuals |
| `prizes/` | ❌ Escluso | ❌ Escluso | 163M - CDN loading |
| `models/` | ❌ Escluso | ❌ Escluso | 1.4G - 3D models |
| `*.mp4/*.glb` | ❌ Escluso | ❌ Escluso | Video/3D |

---

## RISULTATI

### Dimensioni PRIMA vs DOPO:
```
┌───────────────────────────────────────────────────────────────┐
│  METRIC              │   PRIMA     │   DOPO      │  DELTA    │
├───────────────────────────────────────────────────────────────┤
│  AAB Compressed      │    15 MB    │   123 MB    │  +108 MB  │
│  Base Uncompressed   │    37 MB    │   147 MB    │  +110 MB  │
│  Play Console Limit  │   200 MB    │   200 MB    │     ✅    │
└───────────────────────────────────────────────────────────────┘
```

### Verifiche:
- ✅ AAB Size: **123 MB** (sotto limite 200 MB)
- ✅ Signature: **jar verified** 
- ✅ Essential UI assets: **INCLUSI**
- ✅ Heavy assets: **ESCLUSI** (CDN)
- ✅ iOS: **UNTOUCHED**

### Asset Verification:
```
✅ lovable-uploads/ → 30+ files present
✅ scratch/         → 3 PNG files present
✅ crew/            → 5 images present
✅ m1ssion-prize/   → 5 images present
❌ prizes/          → EXCLUDED (CDN - saves 163M)
❌ models/          → EXCLUDED (saves 1.4G)
```

---

## FILE MODIFICATO

**Path:** `android/app/build.gradle`

**Backup:** `android/_backups_20260210_114610/build.gradle`

---

## ROLLBACK COMMANDS

```bash
# Ripristina build.gradle originale (broken)
cp /Users/josephmule/lux-hunt-treasure/android/_backups_20260210_114610/build.gradle \
   /Users/josephmule/lux-hunt-treasure/android/app/build.gradle

# Rebuild
cd /Users/josephmule/lux-hunt-treasure/android && ./gradlew clean :app:bundleRelease
```

---

## iOS SAFETY CONFIRMATION

```
✅ Nessun file in ios/ modificato da questo fix
✅ Nessun comando npx cap sync ios eseguito
✅ Solo android/app/build.gradle modificato
```

Le modifiche iOS visibili in git status sono da sessioni precedenti (AppIcon fix).

---

## AAB FINALE

**Path:** 
```
/Users/josephmule/lux-hunt-treasure/android/app/build/outputs/bundle/release/app-release.aab
```

**Size:** 123 MB
**Signed:** ✅ Yes (jar verified)
**Play Console Ready:** ✅ Yes (< 200 MB base module)

---

## NOTE IMPORTANTI

1. **Prize images** (`prizes/` folders) sono escluse e devono essere caricate da CDN
2. **3D models** (`models/`, `*.glb`) sono esclusi e devono essere caricati da CDN
3. **Video** (`*.mp4`, `*.mov`, `*.webm`) sono esclusi e devono essere caricati da CDN

Se l'app mostra placeholder dove dovrebbero esserci prize images, configurare CDN endpoints.

---
*Report generato automaticamente - M1SSION Android Build Pipeline*
