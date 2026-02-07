# 🔒 PUSH SYSTEM LOCK — M1SSION™

**Status: FROZEN** — Data: 2026-02-07

---

## ⛔ REGOLA ASSOLUTA

> **NON MODIFICARE i file elencati sotto senza un prompt esplicito dall'utente che contenga la parola "UNLOCK PUSH".**

---

## 📁 File Push-Critical (PROTETTI)

### Client — Native Push
```
src/hooks/useNativePush.ts
src/lib/nativePush.ts
src/utils/push-ios.ts
src/config/featureFlags.ts (sezioni NATIVE_PUSH_*)
```

### Client — Web Push (PWA)
```
src/utils/safeWebPushSubscribe.ts
src/utils/safeWebPushSubscribeAdvanced.ts
src/utils/pushSubscribe.ts
src/utils/pushSubscribeStable.ts
src/utils/pushPlatform.ts
src/utils/pushRepair.ts
src/utils/pushKillSwitch.ts
src/push/ensurePushSubscription.ts
src/features/notifications/enablePush.ts
```

### Client — Components
```
src/components/UnifiedPushToggle.tsx
src/components/PushNotificationToggle.tsx
src/components/WebPushToggle.tsx
src/components/IOSPushDebugPanel.tsx
src/components/PushRegistrationTest.tsx
src/components/PushInspector.tsx
src/components/push/PushTest.tsx
src/components/panel/PushRepair.tsx
src/components/panel/PushCenter.tsx
src/settings/PushE2ETestCard.tsx
src/banners/PushFrozenNotice.tsx
```

### Client — Types
```
src/types/push.ts
```

### Service Worker
```
public/sw.js
public/sw-cleanup.js
public/sw-test.js
```

### Edge Functions (Supabase)
```
supabase/functions/auto-push-cron/
supabase/functions/send-native-push/
supabase/functions/push_register/
supabase/functions/push_send/
supabase/functions/push_subscribe/
supabase/functions/push_unsubscribe/
supabase/functions/push_test/
supabase/functions/push_gc/
supabase/functions/push-broadcast/
supabase/functions/push-debug/
supabase/functions/push-self-test/
supabase/functions/push_admin_broadcast/
supabase/functions/push_send_canary/
supabase/functions/push_subscribe_canary/
supabase/functions/webpush-send/
supabase/functions/webpush-targeted-send/
supabase/functions/webpush-upsert/
supabase/functions/battle-push-send/
supabase/functions/battle-push-dispatcher/
supabase/functions/chat-push-notify/
supabase/functions/pulse-threshold-notify/
supabase/functions/debug-push/
supabase/functions/get-push-logs/
supabase/functions/mirror-push-log-harvester/
supabase/functions/mirror-push-logtee/
```

### Database Migrations (relative a push)
```
supabase/migrations/*push*.sql
supabase/migrations/*token*.sql
supabase/migrations/*webpush*.sql
supabase/migrations/*notification*.sql (solo quelle push-related)
```

### iOS Native Config
```
ios/App/App/AppDelegate.swift (sezioni push)
ios/App/App/*.entitlements (push capabilities)
```

---

## ✅ Cosa È Permesso

- Leggere i file per debugging
- Aggiungere log/console.log temporanei (da rimuovere subito)
- Correggere typo/commenti SOLO SE non cambiano logica

---

## ❌ Cosa NON È Permesso

- Modificare logica token registration
- Cambiare endpoint/URL push
- Alterare service worker
- Modificare VAPID keys
- Cambiare APNS/FCM config
- Toccare Edge Functions push
- Alterare DB schema push tables

---

## 🔑 Come Sbloccare

Per modificare il sistema push, l'utente DEVE scrivere un prompt contenente:

```
UNLOCK PUSH: [descrizione della modifica]
```

---

© 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
