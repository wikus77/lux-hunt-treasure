# Ripristino totale al punto “pre-ipad-overlay-fix” — Report

**Data:** 2026-02-20  
**Punto target:** tag `safety/pre-ipad-overlay-fix_202602201644`, commit `f96786c2`

---

## FASE 0 — SAFETY SNAPSHOT (OUTPUT)

```
pwd: /Users/josephmule/lux-hunt-treasure
git status -sb: ## fix/ios-settings-qa-pack  (M .npmrc, ios/App/App/public/*, Podfile.lock, package-lock.json, ?? forensics)
git branch --show-current: fix/ios-settings-qa-pack
git rev-parse --short HEAD: cf0708f9
git tag --list | grep ...:
  safety/ios-settings-qa-pack_after_commit_before_notifsfix_20260220
  safety/ios-settings-qa-pack_before_20260220_1838
  safety/pre-ipad-overlay-fix_202602201644
```

---

## FASE 1 — ROLLBACK HARD AL TAG TARGET (ESEGUITO)

1. **git fetch --all --tags --prune** → OK  
2. **git checkout -B fix/ipad-account-buttons-overlay safety/pre-ipad-overlay-fix_202602201644** → Switched to and reset branch  
3. **git reset --hard safety/pre-ipad-overlay-fix_202602201644** → `HEAD is now at f96786c2 safety: pre-ipad-overlay-fix`  
4. **git clean -fd** → Removed forensics reports, ios/App/App.xcodeproj/project.xcworkspace/  

**Verifica post-clean (solo sorgenti committate):**
- **git status -sb:** `## fix/ipad-account-buttons-overlay` (nessun M/D/?? sui file sorgente del commit)  
- **git rev-parse --short HEAD:** `f96786c2`  
- **git log -1 --oneline:** `f96786c2 safety: pre-ipad-overlay-fix`  
- **git diff --name-only:** (vuoto)

Working tree pulito rispetto al commit del tag.

---

## FASE 2 — AppDelegate (VERIFICATO)

- **git diff -- ios/App/App/AppDelegate.swift:** (vuoto) → file identico al tag  
- **Backup:** `ios/App/App/AppDelegate.swift.bak.pre-ipad-overlay-fix` esiste  

Nessuna azione eseguita. iOS wrapper identico al punto target.

---

## FASE 3 — NODE DEPS CLEAN + BUILD (ESEGUITO)

1. **rm -rf node_modules**, **rm -f package-lock.json**, **rm -f npm-shrinkwrap.json** → OK  
2. **npm cache verify** → Cache verified and compressed  
3. **npm install** → Fallito con `EBADENGINE` (eslint-visitor-keys richiede Node ^20.19.0; ambiente Node v20.18.1).  
   - Eseguito **npm install --engine-strict=false** → 1019 packages installati (nessuna modifica a file committati; solo flag a riga di comando).  
4. **npm run build** → **OK** (prebuild push-guard passed, vite build ✓ built in ~53s)

Nota: con Node 20.18.x e `.npmrc` con `engine-strict=true`, per install futuri usare `npm install --engine-strict=false` oppure aggiornare Node a ^20.19.0.

---

## FASE 4 — CAPACITOR SYNC iOS (ESEGUITO)

- **npx cap sync ios:**  
  - Prima esecuzione: errore ENOENT su `dist/models/agent/dress/tough_bunny_clothing_set.glb` durante copy; sync è comunque terminata (update ios OK).  
  - Seconda esecuzione (FASE 5): **✔ Copying web assets**, **✔ copy ios**, **✔ update ios** → Sync finished in 16.148s  
- **npx cap copy ios:** ✔ Copying web assets in 12.44s, ✔ copy ios in 12.56s  

**Da eseguire a mano:** `npx cap open ios` → poi in Xcode: Run su iPhone/iPad.

---

## FASE 5 — CHECK FINALE (OUTPUT)

- **git status -sb:** `## fix/ipad-account-buttons-overlay` con **M** su:  
  `ios/App/App/public/bundle-analysis.html`, `ios/App/App/public/index.html`, `ios/App/Podfile.lock`, `ios/capacitor-cordova-ios-plugins/*.podspec`, `package-lock.json`  
  → Modifiche **attese** dopo npm install (nuovo lockfile) + build + cap sync (public assets, pod install). Il **commit** e i sorgenti (incluso AppDelegate) sono quelli del tag.  
- **git rev-parse --short HEAD:** `f96786c2`  
- **npm run build:** exit 0 (✓ built in 53.22s)  
- **npx cap sync ios:** exit 0 (Sync finished in 16.148s)

---

## DELIVERABLE RIEPILOGO

1. **Output Fasi 0–5:** come sopra.  
2. **Punto “pre-ipad-overlay-fix” ripristinato:**  
   - **Branch:** `fix/ipad-account-buttons-overlay`  
   - **HEAD:** `f96786c2` (“safety: pre-ipad-overlay-fix”)  
   - **Tag:** `safety/pre-ipad-overlay-fix_202602201644`  
   - Working tree: nessun diff sui file del commit; modifiche solo su artefatti (package-lock.json, ios/App/App/public/*, Podfile.lock, podspecs) dopo reinstall + build + cap sync.  
   - **AppDelegate:** identico al tag; backup `.bak.pre-ipad-overlay-fix` presente.  
3. **App da Xcode:** eseguire `npx cap open ios` e Run su device (non eseguito in questo run).

Nessuna patch funzionale, nessuna modifica a file app o refactor. iOS wrapper identico al punto target.

**FINE REPORT.**
