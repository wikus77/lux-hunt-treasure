# Geofenced Push Notifications - M1SSION™

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

## Architecture Overview

The geofenced push notification system is a standalone external engine that monitors user positions and sends location-based notifications when users approach markers. It operates completely independently from the existing push notification chain to ensure zero risk to the production system.

```mermaid
graph TD
    A[pg_cron Scheduler] --> B[geofence-engine Edge Function]
    B --> C[Read geo_radar_coordinates]
    B --> D[Read markers table]
    B --> E[Calculate distances]
    E --> F{Within geofence?}
    F -->|Yes| G[Check anti-spam rules]
    F -->|No| H[Skip]
    G --> I{Rules passed?}
    I -->|Yes| J[HTTP POST to webpush-admin-broadcast]
    I -->|No| K[Log reason + skip]
    J --> L[Update geo_push.delivery_log]
    J --> M[Update geo_push.delivery_state]
    K --> L
    L --> N[Update watermark]
```

## Data Sources (Read-Only)

### User Positions
- **Table**: `public.geo_radar_coordinates`
- **Columns**: `user_id`, `lat`, `lng`, `updated_at`
- **Filter**: Last 15 minutes of activity

### Markers
- **Table**: `public.markers` 
- **Columns**: `id`, `title`, `lat`, `lng`, `active`
- **Filter**: `active = true`

## Anti-Spam Rules & Configuration

Configuration is stored in `geo_push.settings` with key `'engine'`:

```json
{
  "enabled": true,
  "default_radius_m": 1000,
  "hysteresis_m": 150,
  "cooldown_hours": 12,
  "quiet_hours": {
    "start": "22:00",
    "end": "08:00", 
    "timezone": "Europe/Rome"
  },
  "daily_cap": 3,
  "title_template": "Sei vicino a {{marker_name}}",
  "body_template": "Apri M1SSION™ per scoprire di più",
  "click_url": "/map"
}
```

### Rule Details

1. **Geofence Radius**: `default_radius_m` (1000m = 1km default)
2. **Hysteresis**: `hysteresis_m` prevents bouncing when user is at edge of geofence
3. **Cooldown**: `cooldown_hours` per user-marker pair (12h default)
4. **Quiet Hours**: No notifications during sleep hours (22:00-08:00 Rome time)
5. **Daily Cap**: Maximum notifications per user per day (3 default)
6. **Templates**: Customizable title/body with `{{marker_name}}` placeholder

## Manual Operations

### Force Manual Run
```bash
curl -X POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/geofence-engine \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"manual": true}'
```

### Dry Run Mode (No Actual Notifications)
```bash
curl -X POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/geofence-engine \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"dry": true}'
```

## Diagnostic Queries

### Recent Activity (Last 48h)
```sql
SELECT * FROM geo_push.v_recent_log LIMIT 50;
```

### User-Specific History
```sql
SELECT * FROM geo_push.delivery_state 
WHERE user_id = 'YOUR_USER_UUID';

SELECT * FROM geo_push.delivery_log 
WHERE user_id = 'YOUR_USER_UUID' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Cron Job Status
```sql
SELECT jobid, schedule, command, active
FROM cron.job 
WHERE jobname = 'geo-push-geofence-engine';

SELECT jobid, status, return_message, start_time, end_time
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'geo-push-geofence-engine'
)
ORDER BY start_time DESC 
LIMIT 10;
```

### Engine Watermark
```sql
SELECT name, last_run_at 
FROM geo_push.watermarks 
WHERE name = 'geofence_engine';
```

## Security & Isolation

- **Isolated Schema**: All geofence data lives in `geo_push.*` schema
- **RLS Protection**: Admin-only access using `is_admin_secure()`
- **Read-Only Sources**: Never modifies existing position/marker tables
- **External Delivery**: Uses existing `webpush-admin-broadcast` via HTTP
- **No Direct Push**: No direct FCM/APNs/WebPush integration

## Schedule Configuration

The engine runs every 2 minutes via pg_cron:
- **Job Name**: `geo-push-geofence-engine`
- **Schedule**: `*/2 * * * *` (every 2 minutes)
- **Endpoint**: `geofence-engine` Edge Function

## Reason Codes

Delivery log entries include these reason codes:

- `ENTER`: User entered geofence for first time
- `SENT`: Notification successfully sent
- `HYSTERESIS_SKIP`: Skipped due to hysteresis (prevent bouncing)
- `COOLDOWN`: Skipped due to cooldown period
- `QUIET_HOURS`: Skipped due to quiet hours
- `DAILY_CAP`: Skipped due to daily limit reached
- `DRY_RUN`: Dry run mode (no actual send)
- `SEND_ERROR_XXX`: HTTP error when calling webpush-admin-broadcast

## Critical Warnings

⚠️ **DO NOT MODIFY**:
- Service Workers (`public/sw-push.js`, `public/firebase-messaging-sw.js`)
- `supabase/functions/webpush-admin-broadcast/*`
- Push notification tables (`public.fcm_subscriptions`, etc.)
- Geolocation tables (`public.geo_radar_coordinates`)
- Marker tables (`public.markers`)
- Existing cron jobs for other systems

⚠️ **DELIVERY METHOD**: This system only sends notifications via HTTP POST to the existing `webpush-admin-broadcast` function. It does not directly interface with FCM, APNs, or WebPush protocols.

⚠️ **PWA COMPATIBILITY**: Notifications are delivered through the existing service worker chain, maintaining full PWA compatibility.

## Troubleshooting

### No Notifications Being Sent
1. Check if engine is enabled: `SELECT value FROM geo_push.settings WHERE key = 'engine'`
2. Check quiet hours configuration
3. Verify user positions are recent (last 15 minutes)
4. Check cooldown and daily cap limits
5. Review cron job status and logs

### Distance Calculation Issues
- Uses Haversine formula for accurate Earth distance calculation
- Distance in meters, radius configurable per marker (future enhancement)

### Performance Considerations
- Processes only positions updated in last 15 minutes
- Efficient distance calculations using mathematical formulas
- Logs all decisions for full audit trail