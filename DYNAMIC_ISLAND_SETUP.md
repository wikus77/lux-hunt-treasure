
# Dynamic Island Integration Setup

## Xcode Configuration Required

### 1. Add Widget Extension Target
1. Open project in Xcode
2. File → New → Target
3. Select "Widget Extension"
4. Name: "MissionWidget"
5. Bundle ID: `app.lovable.2716f91b957c47ba91e06f572f3ce00d.MissionWidget`

### 2. Add ActivityKit Framework
1. Select main app target
2. Build Phases → Link Binary With Libraries
3. Add `ActivityKit.framework`
4. Add `WidgetKit.framework`

### 3. Update Info.plist
Add these keys to main app's Info.plist:
```xml
<key>NSSupportsLiveActivities</key>
<true/>
<key>NSSupportsLiveActivitiesFrequentUpdates</key>
<true/>
```

### 4. Copy Swift Files
- Copy `MissionActivityAttributes.swift` to main app target
- Copy `DynamicIslandPlugin.swift` to main app target
- Copy `DynamicIslandPlugin.m` to main app target
- Copy `MissionWidget.swift` to Widget Extension target

### 5. Build Requirements
- iOS 16.1+ deployment target
- iPhone 14 Pro/Pro Max or later for testing
- Widget Extension must have same bundle ID prefix as main app

### 6. Testing
- Build and run on iPhone 14 Pro+ with iOS 16.1+
- Use the `useDynamicIsland` hook in React components
- Activity will appear in Dynamic Island when started

## Usage in React
```typescript
import { useDynamicIsland } from '@/hooks/useDynamicIsland';

const { startMissionActivity, updateMissionActivity } = useDynamicIsland();

// Start activity
await startMissionActivity({
  missionId: 'BUZZ_001',
  timeLeft: 3600,
  progress: 0.3,
  status: 'active'
});

// Update activity
await updateMissionActivity({
  missionId: 'BUZZ_001',
  timeLeft: 3500,
  progress: 0.35,
  status: 'active'
});
```
