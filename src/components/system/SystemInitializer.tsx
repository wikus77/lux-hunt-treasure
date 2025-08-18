// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import React from 'react';
import { usePushNotificationProcessor } from '@/hooks/usePushNotificationProcessor';
import { useGlobalProfileSync } from '@/hooks/useGlobalProfileSync';

/**
 * System Initializer Component
 * Safely initializes system-wide hooks and services
 */
export const SystemInitializer: React.FC = () => {
  // Initialize push notification processor
  usePushNotificationProcessor();
  
  // Initialize global profile sync for real-time updates across all components
  useGlobalProfileSync();

  // This component doesn't render anything, it just initializes hooks
  return null;
};