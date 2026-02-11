# Android AAB Audit Report
**Date:** 2026-02-10
**Status:** CRITICAL - App broken due to over-aggressive asset exclusion

---

## A) STATO ESCLUSIONI ATTUALI

```groovy
ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~:!*.mp4:!*.mov:!*.webm:!*.glb:prizes:lovable-uploads:m1ssion-prize:crew:crew-team:scratch'
```

### Pattern Esclusi:
| Pattern | Tipo | Impatto |
|---------|------|---------|
| `*.mp4, *.mov, *.webm` | Video | ✅ OK - CDN loading |
| `*.glb` | 3D Models | ✅ OK - CDN loading |
| `prizes` | Immagini premi | ⚠️ PARZIALE - serve root prizes/ |
| `lovable-uploads` | **UI ASSETS** | ❌ CRITICO - rompe UI home/login |
| `m1ssion-prize` | Immagini premi | ⚠️ Potenziale UI impact |
| `crew` | Immagini crew | ⚠️ Potenziale UI impact |
| `crew-team` | Immagini team | ⚠️ Potenziale UI impact |
| `scratch` | Scratch game | ❌ CRITICO - rompe gioco |

---

## B) MAPPA PESI ASSET SORGENTE

### Cartelle principali in `public/`:
| Cartella | Size | Note |
|----------|------|------|
| `models/` | 1.4G | 3D - già esclusi via *.glb |
| `assets/` | 306M | Mix di tutto |
| `lovable-uploads/` | **56M** | ❌ ESSENZIALE - UI home/login |
| `video/` | 39M | già esclusi via *.mp4 |
| `prizes/` | 19M | Immagini premi root |
| `videos/` | 7.2M | già esclusi |
| `icons/` | 2.6M | ✅ Incluso |
| `hdr/` | 1.3M | ✅ Incluso |

### Breakdown `public/assets/`:
| Cartella | Size | Note |
|----------|------|------|
| `assets/prizes/` | **144M** | ⚠️ Grosso - può restare escluso |
| `assets/video/` | 105M | già esclusi via *.mp4 |
| `assets/m1ssion-prize/` | 19M | Immagini premi |
| `assets/crew/` | 13M | UI team |
| `assets/scratch/` | **11M** | ❌ ESSENZIALE per gioco |
| `assets/crew-team/` | 11M | UI team |
| `assets/audio/` | 2.5M | ✅ Incluso |

---

## C) ANALISI AAB ATTUALE (15 MB)

### Dimensioni:
- **AAB compresso:** 15 MB
- **Base module uncompressed:** 37 MB
- **Assets inclusi:** ~24 MB

### Cartelle MANCANTI nel bundle (CRITICHE):
| Cartella | Size originale | Status |
|----------|---------------|--------|
| `lovable-uploads/` | 56M | ❌ MANCANTE |
| `prizes/` (root) | 19M | ❌ MANCANTE |
| `assets/prizes/` | 144M | ❌ MANCANTE |
| `assets/scratch/` | 11M | ❌ MANCANTE |
| `assets/crew/` | 13M | ❌ MANCANTE |
| `assets/crew-team/` | 11M | ❌ MANCANTE |
| `assets/m1ssion-prize/` | 19M | ❌ MANCANTE |

---

## D) CRASH ANALYSIS

### Errore osservato:
```
ERR-MLGGTTLM (Error Boundary triggered)
```

### Causa probabile:
La directory `lovable-uploads/` contiene asset UI essenziali usati in:
- `src/components/home/*.tsx` (Home, Carousel, Features)
- `src/components/landing/*.tsx` (Login/Intro)
- `src/pages/MissionSelection.tsx`
- `src/pages/EventsPage.tsx`

Quando l'app prova a caricare queste immagini e non le trova → crash → ErrorBoundary.

---

## STRATEGIA RACCOMANDATA

### RE-INCLUDE (ESSENZIALI):
| Cartella | Size | Motivazione |
|----------|------|-------------|
| `lovable-uploads` | +56M | **CRITICO** - UI home/login/events |
| `scratch` | +11M | Gioco scratch funzionante |
| `crew` | +13M | UI team |
| `crew-team` | +11M | UI team |
| `m1ssion-prize` | +19M | Immagini premio UI |

### KEEP EXCLUDED:
| Pattern | Size evitata | Motivazione |
|---------|-------------|-------------|
| `prizes` (solo assets/prizes) | 144M | Può essere CDN - non critico UI |
| `*.mp4, *.mov, *.webm` | ~150M+ | Video - CDN loading |
| `*.glb` | 1.4G | 3D models - CDN loading |

### PROIEZIONE DIMENSIONI:
```
Current AAB:           15 MB
+ lovable-uploads:    +56 MB = 71 MB
+ scratch:            +11 MB = 82 MB
+ crew + crew-team:   +24 MB = 106 MB
+ m1ssion-prize:      +19 MB = 125 MB
+ prizes (root):      +19 MB = 144 MB
---
TOTALE STIMATO:       ~144-160 MB (SOTTO 200 MB ✅)
```

---

## NEXT STEPS

1. Modificare `ignoreAssetsPattern` per escludere SOLO:
   - Video: `*.mp4:*.mov:*.webm`
   - 3D: `*.glb`
   - Heavy prizes: rimuovere solo `assets/prizes` con pattern più specifico

2. Rebuild AAB e verificare dimensioni

3. Test su device per confermare UI funzionante

---
*Report generato automaticamente - M1SSION Android Build Pipeline*
