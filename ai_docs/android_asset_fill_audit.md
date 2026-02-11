# Android Asset Fill Audit
**Date:** 2026-02-10
**Purpose:** Determine how to fill AAB to ~195 MB while staying under 200 MB limit

---

## 1. CURRENT STATE

| Metric | Value |
|--------|-------|
| AAB Compressed | **123 MB** |
| Base Module (uncompressed) | 147 MB |
| Play Console Limit | 200 MB |
| Target | 190-199 MB |
| **Budget to fill** | **~72 MB** |

---

## 2. CURRENT EXCLUSION PATTERN

```groovy
ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~:*.mp4:*.mov:*.webm:*.glb:prizes:models'
```

### Excluded:
| Pattern | Type | Size Saved |
|---------|------|------------|
| `*.mp4, *.mov, *.webm` | Video | ~150 MB+ |
| `*.glb` | 3D Models | ~1.4 GB |
| `prizes` | Prize images | **163 MB** |
| `models` | 3D folder | ~1.4 GB |

---

## 3. PRIZES FOLDER ANALYSIS

### Root level: `public/prizes/`
- **Size:** 19 MB
- **Files:** 10 (prize-1.jpg through prize-10.jpg)
- **Usage:** Referenced in LandingPage, PrizesPage

### Nested: `public/assets/prizes/`
- **Total Size:** 144 MB
- **Subdirectories:**

| Subdirectory | Size | Priority |
|--------------|------|----------|
| `99premi/` | 26 MB | Medium (heavy) |
| `auto-reali/` | 21 MB | High (UI refs) |
| `orologi-reali/` | 19 MB | Medium |
| `borse-reali/` | 19 MB | Medium |
| `gioielli-reali/` | 18 MB | High (UI refs) |
| `borse/` | 13 MB | Low |
| `auto/` | 9.3 MB | Low |
| `altri/` | 9.2 MB | Low |
| `orologi/` | 9.0 MB | Low |

---

## 4. CALCULATION

### If we include ALL prizes:
```
Current AAB:     123 MB
+ prizes (all):  163 MB (uncompressed)
---
Estimated:       ~250-280 MB → OVER LIMIT ❌
```

### Fill-to-limit strategy:
```
Budget: 72 MB (to reach ~195 MB)

Option A: Include subset of prizes:
  + public/prizes/ (root):     19 MB
  + assets/prizes/orologi:      9 MB
  + assets/prizes/altri:        9 MB
  + assets/prizes/auto:         9 MB
  + assets/prizes/borse:       13 MB
  ---------------------------------
  TOTAL:                       59 MB ✅
```

---

## 5. TECHNICAL CONSTRAINT

**AAPT Pattern Limitation:**
The `ignoreAssetsPattern` uses simple name matching. Pattern `prizes` excludes:
- `public/prizes/` (root level)
- `public/assets/prizes/` (nested)

There's **no way to selectively include** one but not the other.

### Possible Solutions:

| Approach | Pros | Cons |
|----------|------|------|
| Remove `prizes` entirely | Simple | May exceed 200 MB |
| Keep `prizes` excluded | Safe size | Missing prize UI |
| Create `prize-bundle/` subset | Controlled size | Requires code changes |

---

## 6. RECOMMENDATION

**TEST APPROACH:** Remove `prizes` from exclusion pattern and measure actual compressed size.

- PNG files are already compressed
- Actual AAB increase may be less than 163 MB
- If under 200 MB → SUCCESS
- If over 200 MB → Need subset strategy

---
*Audit generated: 2026-02-10*
