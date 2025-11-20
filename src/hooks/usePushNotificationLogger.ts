// @ts-nocheck
// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Enhanced Push Notifications Logging Hook

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface LogPushEventParams {
  eventType: string;
  token?: string;
  platform?: string;
  deviceInfo?: any;
  success?: boolean;
  errorMessage?: string;
}

export const usePushNotificationLogger = () => {
  const { user } = useAuth();

  const logPushEvent = useCallback(async (params: LogPushEventParams) => {
    try {
      const {
        eventType,
        token,
        platform,
        deviceInfo,
        success = true,
        errorMessage
      } = params;

      // Enhanced device info
      const enhancedDeviceInfo = {
        userAgent: navigator.userAgent,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isPWA: window.navigator.standalone === true,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        timestamp: new Date().toISOString(),
        ...deviceInfo
      };

      // Log to push_notifications_log table
      const { error: pushLogError } = await supabase
        .from('push_notifications_log')
        .insert({
          user_id: user?.id || null,
          event_type: eventType,
          token: token?.substring(0, 50) || null, // Truncate for security
          platform: platform || (enhancedDeviceInfo.isIOS ? 'ios_pwa' : 'web_pwa'),
          device_info: enhancedDeviceInfo,
          success,
          error_message: errorMessage
        });

      if (pushLogError) {
        console.error('❌ Push log error:', pushLogError);
      }

      // Also log to admin_logs for backward compatibility
      const { error: adminLogError } = await supabase
        .from('admin_logs')
        .insert({
          event_type: `push_${eventType}`,
          user_id: user?.id || null,
          note: `M1SSION™ Push: ${eventType}`,
          context: 'push_notifications',
          details: {
            token: token?.substring(0, 20) + '...' || null,
            platform,
            success,
            errorMessage,
            deviceInfo: enhancedDeviceInfo
          }
        });

      if (adminLogError) {
        console.error('❌ Admin log error:', adminLogError);
      }

      console.debug(`🔔 M1SSION™: Logged push event: ${eventType}`, {
        success,
        platform,
        hasToken: !!token
      });

    } catch (error) {
      console.error('❌ M1SSION™: Push logging failed:', error);
    }
  }, [user]);

  // Convenience methods for common events
  const logTokenRegistered = useCallback((token: string, platform: string) => {
    return logPushEvent({
      eventType: 'token_registered',
      token,
      platform,
      success: true
    });
  }, [logPushEvent]);

  const logTokenRegistrationFailed = useCallback((errorMessage: string, platform: string) => {
    return logPushEvent({
      eventType: 'token_registration_failed',
      platform,
      success: false,
      errorMessage
    });
  }, [logPushEvent]);

  const logPermissionRequested = useCallback((platform: string) => {
    return logPushEvent({
      eventType: 'permission_requested',
      platform,
      success: true
    });
  }, [logPushEvent]);

  const logPermissionGranted = useCallback((platform: string) => {
    return logPushEvent({
      eventType: 'permission_granted',
      platform,
      success: true
    });
  }, [logPushEvent]);

  const logPermissionDenied = useCallback((platform: string) => {
    return logPushEvent({
      eventType: 'permission_denied',
      platform,
      success: false
    });
  }, [logPushEvent]);

  const logInitializationSuccess = useCallback((platform: string) => {
    return logPushEvent({
      eventType: 'initialization_success',
      platform,
      success: true
    });
  }, [logPushEvent]);

  const logInitializationFailed = useCallback((errorMessage: string, platform: string) => {
    return logPushEvent({
      eventType: 'initialization_failed',
      platform,
      success: false,
      errorMessage
    });
  }, [logPushEvent]);

  return {
    logPushEvent,
    logTokenRegistered,
    logTokenRegistrationFailed,
    logPermissionRequested,
    logPermissionGranted,
    logPermissionDenied,
    logInitializationSuccess,
    logInitializationFailed
  };
};