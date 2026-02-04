# ROLLBACK — Face ID Auto-Login Token Fix

## Rollback Immediato (1 comando)

```bash
git reset --hard rollback/pre-faceid-autologin-token
```

## Rollback Alternativo (branch)

```bash
git checkout feature/ios-faceid-addon && git branch -D feature/faceid-autologin-token
```

## Dopo Rollback — Rebuild iOS

```bash
# 1. Pulisci build
rm -rf ios/App/App.xcworkspace/xcuserdata
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*

# 2. Rebuild
npm run build
npx cap sync ios

# 3. In Xcode
# Cmd + Shift + K (Clean)
# Cmd + R (Run)
```

## Verifica Post-Rollback

1. `git log --oneline -3` → deve mostrare commit pre-fix
2. Face ID appare ma richiede login manuale (comportamento pre-fix)
3. Login classico funziona

---

**Branch sicuro:** feature/ios-faceid-addon
**Tag rollback:** rollback/pre-faceid-autologin-token
**Commit safe:** c797fb7b
