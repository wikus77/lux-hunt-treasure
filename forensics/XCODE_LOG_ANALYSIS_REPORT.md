# Xcode Log Analysis Report — iOS Wrapped App

**Data:** 14 Feb 2026  
**Scope:** Verifica, classificazione severità, proposte fix (NO PATCH)

---

## 1) TOP RISKS (max 5) con score

| # | Rischio | Score | Motivazione |
|---|---------|-------|-------------|
| 1 | PWA Stabilizer: Initialization failed | 6/10 | Fallimento inizializzazione in Capacitor; push/SW potrebbero non funzionare correttamente |
| 2 | CARenderServer / Failed to load device context | 5/10 | Possibile impatto su rendering/animazioni in simulatore; su device spesso benigno |
| 3 | UIScene lifecycle deprecation | 5/10 | Future assert di Apple; va adottato prima di prossime major iOS |
| 4 | WEBP decode error (makeImagePlus err=-50) | 4/10 | Possibile asset WEBP corrotto o non supportato; immagine mancante |
| 5 | Sandbox extension creation failure | 4/10 | Limitazione sandbox iOS; possibile impatto su accesso file in certi scenari |

---

## 2) Tabella analitica

| Categoria | Messaggi | Score | Impatto | Probabile causa | Fix proposto | Confidence |
|-----------|----------|-------|---------|-----------------|--------------|------------|
| **iOS lifecycle / UIScene** | `UIScene lifecycle will soon be required. Failure to adopt will result in an assert in the future.` | 5 | App Review futuro, assert in future iOS | AppDelegate ancora su UIApplicationDelegate senza UIScene | Migrare a UIScene-based lifecycle (Info.plist, SceneDelegate) | 90% |
| **Sandbox / filesystem** | `Could not create a sandbox extension for '/var/containers/Bundle/Application/.../App.app'` | 4 | Accesso file in certi path; raro | Limitazione sandbox WKWebView/iOS | Verificare se l’app accede a path fuori sandbox; evitare accesso a Bundle | 75% |
| **CoreAnimation / CA metrics** | `NSMapGet: map table argument is NULL`; `Failed to send CA Event for app launch measurements` | 3 | Metriche launch; no crash | Framework interno Apple; possibile race all’avvio | Ignorare; known Apple internal | 95% |
| **WKWebView / WebContent** | `Could not register system wide server: -25204`; `_AXAddToElementCache`; `Unable to hide query parameters from script` | 3 | Accessibility, privacy URL; spesso benigno | Comportamento noto di WKWebView in simulatore/device | Ignorare a meno di bug UX di accessibilità | 85% |
| **Service Worker / PWA** | `[SW-ANYHOST] Service Worker not supported`; `❌ PWA Stabilizer: Initialization failed: {}` | 6 | PWA/SW non disponibili in capacitor://; push via Web SW non usato | WKWebView con `capacitor://localhost` non supporta Service Worker | Skip PWA Stabilizer se Capacitor native; usare solo APNs per push | 95% |
| **Media / WEBP** | `makeImagePlus:3798: *** ERROR: 'WEBP'-_reader->initImage[0] failed err=-50` | 4 | Immagine WEBP non decodificata | Asset WEBP corrotto, formato non supportato o err=-50 (formato invalido) | Verificare asset WEBP; convertire in PNG/JPEG se necessario | 80% |
| **Push / APNs** | Duplicazione device token (2x `APNs DEVICE TOKEN RECEIVED`); `PushNotifications register` → `undefined` | 2 | Duplicazione log; `undefined` atteso in certi casi | Doppio mount/listener; `register()` non ritorna il token (arriva via listener) | Normalizzare listener; verificare che non ci siano doppi subscribe | 70% |
| **Custom modules** | `⚠️ Production readiness check failed`; `[Stripe] ❌ BLOCKED`; `❌ PWA Stabilizer: Initialization failed` | 5 | Readiness: SW non disponibile; Stripe: atteso; PWA: già in Top Risks | `isProductionReady()` fallisce perché `serviceWorker` non in navigator in Capacitor | Guard Capacitor: skip readiness per SW; Stripe block è intenzionale | 90% |
| **CARenderServer** | `Service "com.apple.CARenderServer" failed bootstrap look up`; `Failed to initialize application environment context`; `Failed to load a device context` | 5 | Rendering in simulatore; su device spesso assente | Simulatore: CARenderServer non pienamente disponibile | Ignorare in simulatore; verificare su device reale | 85% |

---

## 3) Rumore / ignorabile

| Messaggio | Motivazione |
|-----------|-------------|
| `void * NSMapGet(...): map table argument is NULL` | Errore interno framework Apple; non controllabile |
| `Failed to send CA Event for app launch measurements` | Metriche interne; nessun impatto su funzionalità |
| `Could not register system wide server: -25204` | Limitazione notoria WKWebView; nessun effetto pratico |
| `_AXAddToElementCache was called even though the element was in the cache` | Warning accessibilità interno; nessun impatto UX |
| `Unable to hide query parameters from script` | Warning privacy URL; non blocca l’app |
| `[Stripe] ❌ BLOCKED on iOS native` | Comportamento intenzionale (IAP su iOS) |
| `Ignoring Event: localhost` | Evento localhost ignorato per design |
| `[MediaSessionBlocker] ✅ Initialized` | Log di successo |
| `🔔 APNs DEVICE TOKEN RECEIVED` (2x) | Log informativo; duplicazione non critica |
| `To Native ->` / `TO JS` | Bridge Capacitor normale |
| `⚡️ [log] - ✅` vari | Log custom di successo |
| Banner ASCII M1SSION in `[error]` | Uso di `console.error` per il banner; non un vero errore |

---

## 4) Checklist verifica Top 3 (solo debug, no patch)

### Top 1 — PWA Stabilizer
- [ ] Verificare se l’app usa `capacitor://` o `https://`: `window.location.protocol` in WebView
- [ ] Verificare `'serviceWorker' in navigator` in runtime iOS
- [ ] Tracciare dove viene lanciato `usePWAStabilizer` (es. `App.tsx` ~L178) e se viene eseguito in contesto Capacitor
- [ ] Confermare che il push funzioni via APNs (token ricevuto) nonostante il fallimento PWA Stabilizer

### Top 2 — CARenderServer / device context
- [ ] Riprodurre su dispositivo fisico (non simulatore)
- [ ] Verificare se le animazioni (es. Framer Motion) sono fluide
- [ ] Cercare in log la presenza di `CARenderServer` su device reale

### Top 3 — UIScene lifecycle
- [ ] Controllare `Info.plist` per `UIApplicationSceneManifest`
- [ ] Verificare se esiste `SceneDelegate` in `ios/App/App/`
- [ ] Consultare la documentazione Capacitor per UIScene

---

## 5) Riferimenti codice (READ-ONLY)

| Elemento | Path | Note |
|----------|------|------|
| PWA Stabilizer | `src/hooks/usePWAStabilizer.ts` | Hook chiamato da `App.tsx` L178 |
| PWA Cleanup | `src/lib/pwa/cleanup.ts` | `runPWACleanupOnce()` — possibile throw con `caches`/`serviceWorker` in Capacitor |
| Production readiness | `src/utils/buildOptimization.ts` L76 | `isProductionReady()` — fallisce se `serviceWorker` non in navigator |
| ProductionSafety warning | `src/components/debug/ProductionSafety.tsx` L20 | Origine del messaggio "Production readiness check failed" |
| SW-ANYHOST | `src/lib/pwa/sw-register-anyhost.ts` L12 | "Service Worker not supported" |

---

## 6) Riepilogo priorità fix

| Priorità | Cosa | Rischio patch |
|----------|------|----------------|
| Alta | Skip PWA Stabilizer in ambiente Capacitor native | Basso |
| Alta | Skip/gate `isProductionReady` per Capacitor (SW opzionale) | Basso |
| Media | Adozione UIScene lifecycle | Medio (richiede modifica iOS) |
| Media | Verifica asset WEBP (cercare riferimenti .webp) | Basso |
| Bassa | Resto (sandbox, CARenderServer) | Monitoraggio; valutare solo se problemi UX |

---

FINE REPORT.
