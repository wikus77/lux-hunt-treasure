# M1SSION™ Push Notification Testing Guide

## Quick Test Access

Production test page: **https://m1ssion.eu/push-test**

## Kill Switch Emergency Controls

### URL Hotfix
Add `?__noPush=1` to any URL to disable push notifications:
- `https://m1ssion.eu?__noPush=1`
- `https://m1ssion.eu/home?__noPush=1`

### Console Commands
```javascript
// Disable push notifications
localStorage.setItem('push:disable', '1');
location.reload();

// Re-enable push notifications  
localStorage.removeItem('push:disable');
location.reload();

// Check status
console.log('Push disabled:', localStorage.getItem('push:disable') === '1');
```

### Global Debug Access
```javascript
// Available in browser console
window.pushKillSwitch.disable();  // Disable push
window.pushKillSwitch.enable();   // Enable push
window.pushKillSwitch.isDisabled(); // Check status
```

## Platform Support

### iOS PWA (16.4+)
- **Endpoint format**: `https://web.push.apple.com/3/...`
- **Required**: App installed as PWA (standalone mode)
- **Detection**: `display-mode: standalone` or `navigator.standalone`

### Desktop Chrome/Firefox
- **Endpoint format**: `https://fcm.googleapis.com/...` 
- **Works**: In regular browser tabs
- **Fallback**: Graceful degradation on unsupported browsers

### Windows (Edge)
- **Endpoint format**: `https://wns.notify.windows.com/...`
- **Support**: Windows 10+ with Edge

## Edge Functions

### Subscribe: `push_subscribe`
```bash
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_subscribe" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "endpoint": "https://web.push.apple.com/3/...",
    "keys": {
      "p256dh": "KEY_HERE",
      "auth": "AUTH_HERE"
    },
    "ua": "Mozilla/5.0...",
    "platform": "iOS"
  }'
```

### Send: `push_send`
```bash
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_send" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "endpoint": "https://web.push.apple.com/3/...",
    "payload": {
      "title": "M1SSION™ Test",
      "body": "Test notification",
      "data": {"url": "/"}
    }
  }'
```

## Troubleshooting

### App Won't Mount
1. Check console for errors
2. Try kill switch: `?__noPush=1`
3. Clear storage: `localStorage.clear(); sessionStorage.clear();`

### Push Not Working
1. Verify browser support
2. Check notification permissions
3. Ensure service worker is active
4. Test with `/push-test` page

### Service Worker Issues
1. Check `/sw.js` loads correctly
2. Verify `/sw-push.js` imports successfully  
3. Look for console errors in SW scope

## Production Validation

✅ App mounts on all platforms  
✅ Kill switch works immediately  
✅ Service worker imports push handler  
✅ iOS PWA subscribes to APNs  
✅ Desktop subscribes to FCM  
✅ Edge functions validate endpoints  
✅ Notifications display correctly  
✅ Click actions work properly  

## VAPID Configuration

**Public Key (already in code):**
```
BHW33etXfpUnlLl5FwwsF1z7W48tPnlyJrF52zwEEEHiSIw0ED19ReIhFNm2DOiMTbJU_mPlFtqLGPboP6U-HHA
```

**Secrets (configured in Supabase):**
- `VAPID_PUBLIC`
- `VAPID_PRIVATE` 
- `VAPID_SUBJECT`