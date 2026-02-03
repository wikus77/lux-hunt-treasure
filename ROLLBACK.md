# ROLLBACK — TopSafeGradient iOS Fix

## Branch
`fix/ios-top-gradient-safearea`

## Tag
`ROLLBACK_TOP_GRADIENT_SAFEAREA_V1`

## Rollback Commands

### Full Rollback (discard all changes)
```bash
git reset --hard ROLLBACK_TOP_GRADIENT_SAFEAREA_V1
git clean -fd
```

### Just Reset (keep untracked files)
```bash
git reset --hard ROLLBACK_TOP_GRADIENT_SAFEAREA_V1
```

### Return to Previous Branch
```bash
git checkout fix/ios-white-top-gradient
```

## Files Modified
- `src/components/ui/TopSafeGradient.tsx` (NEW)
- `src/pages/AppHome.tsx` (+5 lines: import + component)

## NOT Modified
- `src/components/layout/UnifiedHeader.tsx` ✅
- `src/components/layout/BottomNavigation.tsx` ✅
- Hero components ✅
- `sn-page` class ✅
