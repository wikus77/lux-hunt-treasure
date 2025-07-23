/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * M1SSION™ User Synchronization Provider
 * Provides user sync context to the entire application
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useUserSync } from '@/hooks/useUserSync';
import { userSyncService } from '@/services/userSyncService';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';

interface UserSyncContextType {
  syncState: any;
  notifications: any[];
  canUserAccessApp: boolean;
  hasEarlyAccess: boolean;
  hasPremiumFeatures: boolean;
  unreadNotifications: number;
  logAction: (action: string, details?: any) => Promise<any>;
  syncPermissions: () => Promise<boolean>;
  sendNotification: (type: 'email' | 'push' | 'in_app', title: string, message: string, metadata?: any) => Promise<any>;
  handlePlanUpgrade: (newPlan: string, paymentIntentId?: string, amount?: number) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => Promise<boolean>;
  hasPermission: (permissionType: string) => boolean;
  refreshSync: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const UserSyncContext = createContext<UserSyncContextType | undefined>(undefined);

export const useUserSyncContext = () => {
  const context = useContext(UserSyncContext);
  if (context === undefined) {
    throw new Error('useUserSyncContext must be used within a UserSyncProvider');
  }
  return context;
};

interface UserSyncProviderProps {
  children: React.ReactNode;
}

export const UserSyncProvider: React.FC<UserSyncProviderProps> = ({ children }) => {
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const userSync = useUserSync();

  // Handle plan upgrades with comprehensive notifications
  const handlePlanUpgradeWithNotifications = async (newPlan: string, paymentIntentId?: string, amount?: number): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;

    const oldPlan = userSync.syncState.plan;
    
    // Perform the upgrade
    const success = await userSync.handlePlanUpgrade(newPlan, paymentIntentId, amount);
    
    if (success) {
      // Send comprehensive notifications
      await userSyncService.handlePlanUpgradeNotifications(
        user.id,
        oldPlan,
        newPlan
      );

      // Show success toast
      toast.success(`Piano aggiornato a ${newPlan.toUpperCase()}!`, {
        description: `Ora hai accesso a tutte le funzionalità ${newPlan}.`,
        duration: 5000,
      });

      return true;
    } else {
      // Show error toast
      toast.error('Errore durante l\'aggiornamento del piano', {
        description: 'Riprova tra qualche minuto.',
        duration: 5000,
      });
      
      return false;
    }
  };

  // Monitor for real-time updates and show notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check for unread notifications periodically
    const checkNotifications = setInterval(() => {
      if (userSync.unreadNotifications > 0) {
        const latestNotification = userSync.notifications
          .filter(n => !n.read_at)
          .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];

        if (latestNotification && latestNotification.notification_type === 'in_app') {
          toast.info(latestNotification.title, {
            description: latestNotification.message,
            action: {
              label: 'Segna come letto',
              onClick: () => userSync.markNotificationRead(latestNotification.id),
            },
            duration: 10000,
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkNotifications);
  }, [isAuthenticated, userSync.unreadNotifications, userSync.notifications, userSync.markNotificationRead]);

  // Log important user actions automatically
  useEffect(() => {
    if (!isAuthenticated) return;

    // Log page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        userSync.logAction('app_resumed', {
          timestamp: new Date().toISOString(),
          previous_state: 'hidden'
        });
      } else {
        userSync.logAction('app_backgrounded', {
          timestamp: new Date().toISOString()
        });
      }
    };

    // Log route changes
    const handleRouteChange = () => {
      userSync.logAction('route_changed', {
        route: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isAuthenticated, userSync.logAction]);

  // Sync permissions on plan changes
  useEffect(() => {
    if (userSync.syncState.lastPlanChange) {
      userSync.syncPermissions();
    }
  }, [userSync.syncState.lastPlanChange, userSync.syncPermissions]);

  const contextValue: UserSyncContextType = {
    ...userSync,
    handlePlanUpgrade: handlePlanUpgradeWithNotifications,
  };

  return (
    <UserSyncContext.Provider value={contextValue}>
      {children}
    </UserSyncContext.Provider>
  );
};