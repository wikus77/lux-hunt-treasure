# ROLLBACK — iOS Root Gradient Fix

## Branch
`fix/ios-root-gradient-safearea`

## Tag
`ROLLBACK_ROOT_GRADIENT_V1`

## Rollback Commands

### Full Rollback (discard all changes)
```bash
git reset --hard ROLLBACK_ROOT_GRADIENT_V1
git clean -fd
```

### Just Reset (keep untracked files)
```bash
git reset --hard ROLLBACK_ROOT_GRADIENT_V1
```

## Files Modified

### Removed
- `src/components/ui/TopSafeGradient.tsx` (DELETED)
- `ROLLBACK.md` (previous version, DELETED)

### Modified
- `src/pages/AppHome.tsx` (-5 lines: removed TopSafeGradient import/usage)
- `src/styles/ios-native.css` (root gradient + dark glass UI)
- `src/styles/soft-native.css` (transparent sn-page containers)
- `ios/App/App/AppDelegate.swift` (transparent WKWebView + black background)

## NOT Modified ✅
- `src/components/layout/UnifiedHeader.tsx`
- `src/components/layout/BottomNavigation.tsx`
- Hero components
- `sn-page` class (still present in AppHome.tsx)

## Architecture

```
[Native iOS Layer]
├─ UIWindow.backgroundColor = #0a0b0f (black)
├─ rootView.backgroundColor = #0a0b0f (black)
└─ WKWebView
   ├─ isOpaque = false
   ├─ backgroundColor = .clear
   └─ scrollView.backgroundColor = .clear

[Web Layer]
├─ html { background: M1SSION gradient }
├─ body { background: transparent }
├─ #root { background: transparent }
└─ .sn-page { background: transparent }

RESULT: Web gradient shows through transparent WKWebView.
        Black native layer as fallback during load.
        Zero white seams anywhere.
```
