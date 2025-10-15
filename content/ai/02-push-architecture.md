# Push Notification Architecture

M1SSION implements a robust, cross-platform push notification system that respects user preferences and platform requirements.

## Push SAFE Guard

The Push SAFE Guard is a critical security component that ensures:
- No hardcoded VAPID keys or secrets in client code
- No project references or API keys exposed
- Proper environment variable usage
- Secure token management

The guard runs automatically before every build and deploy, preventing insecure code from reaching production.

## VAPID Key Management

VAPID (Voluntary Application Server Identification) keys are used for Web Push:
- **Public Key**: Loaded dynamically from `/vapid-public.txt`
- **Private Key**: Stored securely in Supabase secrets, never exposed to client
- **Loader**: Single source of truth in `src/lib/vapid-loader.ts`

## Platform Support

### Android (FCM)
Firebase Cloud Messaging handles push notifications for Android devices:
- Automatic token registration
- Background and foreground message handling
- Rich notifications with images and actions

### iOS (APNs)
Apple Push Notification service for iOS PWA:
- Safari push notifications on iOS 16.4+
- Proper credential management (Team ID, Key ID, private key)
- Push package generation and authentication

## Subscription Flow

1. **Permission Request**: User is prompted for notification permission
2. **Service Worker Registration**: SW registers and becomes active
3. **Push Manager Subscribe**: Browser creates push subscription
4. **Token Storage**: Subscription details stored in Supabase
5. **Backend Verification**: Server validates subscription

## Notification Delivery

### Edge Functions
- `webpush-send`: Sends individual push notifications
- `notifier-engine`: Manages batch notifications with intelligent scheduling
- `fcm-config`: Handles FCM configuration and token management

### Delivery Rules
- **Quiet Hours**: 21:00 - 08:00 local time (configurable)
- **Rate Limiting**: Max 5 notifications per user per day
- **Preference Respecting**: Users can opt-out of specific notification types
- **Throttling**: Anti-spam measures prevent notification fatigue

## Error Handling

The system gracefully handles:
- Invalid or expired tokens (automatic cleanup)
- Platform-specific errors (410 Gone, 404 Not Found)
- Network failures (retry with exponential backoff)
- User unsubscriptions (immediate removal from database)

## Monitoring & Analytics

Push notification analytics track:
- Delivery success rates
- Click-through rates
- Conversion metrics
- Error patterns
- User engagement trends
