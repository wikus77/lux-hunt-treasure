// © 2025 Joseph MULÉ – M1SSION™
import React from 'react';

// V2 (usa subscribeFlow + upsert)
import { default as PushToggleV2 } from '@/components/push/PushToggleV2';

// V1 fallback (vecchio toggle)
import { default as WebPushToggle } from '@/components/push/WebPushToggle';

export default function SettingsPushToggle() {
  const showV2 = (import.meta as any)?.env?.VITE_PUSH_TOGGLE_V2 === '1';
  // data-attr per debug rapido in DOM
  if (showV2) {
    return <PushToggleV2 data-push-toggle-v2 />;
  }
  return <WebPushToggle data-push-toggle-v1 />;
}
