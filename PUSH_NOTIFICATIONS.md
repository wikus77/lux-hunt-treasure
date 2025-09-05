# 🔔 M1SSION™ Unified Push Notifications System

*🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™*

## 📋 Overview

Il sistema unificato di notifiche push M1SSION™ supporta:
- **Web Push API** (iOS Safari PWA, Desktop browsers)
- **Firebase Cloud Messaging (FCM)** (Android, Desktop Chrome)
- **Cross-platform compatibility** (iOS, Android, Desktop)

## 🚀 Quick Start

### 1. Utilizzo Base

```typescript
import { useUnifiedPush } from '@/hooks/useUnifiedPush';
import { UnifiedPushToggle } from '@/components/UnifiedPushToggle';

function MyComponent() {
  const {
    isSupported,
    isSubscribed,
    subscribe,
    requestPermission
  } = useUnifiedPush();

  return <UnifiedPushToggle />;
}
```

### 2. Sottoscrizione Manuale

```typescript
const { subscribe, requestPermission } = useUnifiedPush();

// Richiedi permessi
const hasPermission = await requestPermission();

// Sottoscrivi alle notifiche
if (hasPermission) {
  const success = await subscribe();
}
```

## 🏗️ Architettura

### Core Components

1. **UnifiedPushManager** (`src/lib/push/unified.ts`)
   - Singleton manager per gestire tutte le piattaforme
   - Auto-detection del tipo di dispositivo
   - Fallback intelligente tra FCM e Web Push

2. **useUnifiedPush** (`src/hooks/useUnifiedPush.ts`)
   - React hook per integrazione UI
   - Gestione stato reattiva
   - Auto-subscription per utenti autenticati

3. **UnifiedPushToggle** (`src/components/UnifiedPushToggle.tsx`)
   - Componente UI pronto all'uso
   - Indicatori di stato e errori
   - Supporto per tutti i device

### Database Schema

```sql
-- FCM Subscriptions (Android/Desktop)
CREATE TABLE fcm_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT,
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Web Push Subscriptions (iOS/Desktop)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT,
  endpoint_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 🔧 Configuration

### Environment Variables

```bash
# VAPID Keys (per Web Push)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

# Firebase Config (per FCM)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

### Service Worker

Il sistema registra automaticamente service worker per:
- Gestione notifiche push
- Background sync
- Offline capabilities

## 📱 Platform Support

| Platform | Method | Status |
|----------|--------|--------|
| iOS Safari PWA | Web Push API | ✅ Supported |
| Android Chrome | FCM | ✅ Supported |
| Desktop Chrome | FCM + Web Push | ✅ Supported |
| Desktop Firefox | Web Push API | ✅ Supported |
| Desktop Safari | Web Push API | ✅ Supported |

## 🛠️ Edge Functions

### `upsert_fcm_subscription`
```typescript
// Salva token FCM nel database
const { data, error } = await supabase.functions.invoke('upsert_fcm_subscription', {
  body: {
    user_id: 'uuid',
    token: 'fcm_token',
    platform: 'android',
    device_info: { /* device details */ }
  }
});
```

### `push_register`
```typescript
// Registra Web Push subscription
const { error } = await supabase.functions.invoke('push_register', {
  body: {
    subscription: {
      endpoint: 'https://...',
      keys: {
        p256dh: 'key_data',
        auth: 'auth_data'
      }
    },
    device_info: { /* device details */ }
  }
});
```

## 🧪 Testing

### Test Page
Visita `/unified-push-test` per:
- Verificare supporto browser
- Testare sottoscrizione
- Inviare notifiche di test
- Debug informazioni tecniche

### Manual Testing
```typescript
import { unifiedPushManager } from '@/lib/push/unified';

// Test subscription
const result = await unifiedPushManager.subscribe();
console.log('Subscription result:', result);

// Check status
const current = unifiedPushManager.getCurrentSubscription();
console.log('Current subscription:', current);
```

## 🔒 Security

### Database Security
- **RLS Policies**: Solo l'utente proprietario può gestire le proprie subscription
- **Token Validation**: Validazione lunghezza e formato token
- **Rate Limiting**: Protezione contro spam subscription

### VAPID Security
- **Chiavi separate**: Chiavi pubbliche/private per autenticazione
- **Endpoint validation**: Verifica endpoint autorizzati
- **Cross-origin protection**: Headers CORS configurati

## 📊 Monitoring & Analytics

### Database Functions
```sql
-- Conta subscription attive
SELECT COUNT(*) FROM fcm_subscriptions WHERE is_active = true;
SELECT COUNT(*) FROM push_subscriptions;

-- Breakdown per piattaforma
SELECT platform, COUNT(*) FROM fcm_subscriptions GROUP BY platform;
```

### Logging
Il sistema include logging dettagliato per:
- Subscription attempts
- Success/failure rates
- Platform detection
- Error tracking

## 🔄 Migration from Legacy

### Da `usePushNotifications`
```typescript
// OLD
import { usePushNotifications } from '@/hooks/usePushNotifications';

// NEW
import { useUnifiedPush } from '@/hooks/useUnifiedPush';
```

### Da componenti custom
```typescript
// OLD
<PushNotificationToggle />

// NEW
<UnifiedPushToggle />
```

## 🆘 Troubleshooting

### Problemi Comuni

1. **"Pattern validation error"**
   - ✅ **RISOLTO**: Migrazione database ha rimosso validazioni pattern

2. **Subscription fallisce su iOS**
   - Verifica che sia PWA installata
   - Controlla permessi notifiche in Settings

3. **FCM token non generato**
   - Verifica Firebase configuration
   - Controlla service worker registration

### Debug Tools
```typescript
// Abilita debug logging
localStorage.setItem('push_debug', 'true');

// Check browser capabilities
console.log('ServiceWorker:', 'serviceWorker' in navigator);
console.log('PushManager:', 'PushManager' in window);
console.log('Notification:', Notification.permission);
```

## 📈 Performance

### Optimization Features
- **Session-based caching**: Evita subscription multiple
- **Platform detection**: Minimal overhead
- **Lazy loading**: Service worker registration on-demand
- **Error resilience**: Graceful fallbacks

### Metrics
- **Subscription time**: < 2 secondi typical
- **Memory usage**: Minimal footprint
- **Network requests**: Ottimizzato per round-trip minimi

---

*© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™*