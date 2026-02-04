# ROLLBACK — Face ID Addon

## Rollback Immediato (1 step)

```bash
# Torna al branch precedente e elimina il branch Face ID
git checkout fix/commit-merge-scroll && git branch -D feature/ios-faceid-addon
```

## Rollback Alternativo (tag)

```bash
git reset --hard rollback/pre-faceid
```

## Files Aggiunti (da eliminare in caso di rollback manuale)

- `ios/App/App/FaceIDManager.swift`
- `src/hooks/useFaceID.ts`
- `ROLLBACK_FACEID.md`

## Files Modificati

- `ios/App/App/AppDelegate.swift` (aggiunto Face ID handler)
- `ios/App/App/Info.plist` (aggiunto NSFaceIDUsageDescription)

## Ripristino Manuale (se necessario)

```bash
# 1. Elimina file nuovi
rm ios/App/App/FaceIDManager.swift
rm src/hooks/useFaceID.ts
rm ROLLBACK_FACEID.md

# 2. Ripristina file modificati
cd ios/App
git checkout -- App/AppDelegate.swift App/Info.plist
cd ../..

# 3. Rebuild
npm run build
npx cap sync ios
```

## Verifica Post-Rollback

1. `git status` → deve essere pulito
2. `npm run build` → deve completare
3. `npx cap sync ios` → deve completare
4. Xcode: Cmd + Shift + K → Cmd + R → app funziona
5. Login classico funziona normalmente

---

**Branch sicuro:** fix/commit-merge-scroll
**Tag rollback:** rollback/pre-faceid
**Commit safe:** 82006a1c
