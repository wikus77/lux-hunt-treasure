// FILE MODIFICATO — BY JOSEPH MULE
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useNotificationsDynamicIsland } from '@/hooks/useNotificationsDynamicIsland';
import { useNotificationsAutoReload } from '@/hooks/useNotificationsAutoReload';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { NotificationsHeader } from '@/components/notifications/NotificationsHeader';
import { NotificationsList } from '@/components/notifications/NotificationsList';

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const { notifications, markAsRead, deleteNotification, markAllAsRead, reloadNotifications } = useNotifications();
  const { playSound } = useBuzzSound();
  
  // Custom hooks for managing notifications behavior
  const { updateDynamicIslandOnRead, closeDynamicIsland } = useNotificationsDynamicIsland(notifications);
  
  useDynamicIslandSafety();
  useNotificationsAutoReload(reloadNotifications);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    playSound();
    updateDynamicIslandOnRead(id);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    playSound();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    playSound();
    closeDynamicIsland();
  };

  const handleManualReload = () => {
    console.log('🔄 NOTIFICATIONS: Manual reload button pressed');
    reloadNotifications();
  };

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <UnifiedHeader />
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto">
          
          <motion.div
            className="max-w-3xl mx-auto px-3 sm:px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NotificationsHeader
              filter={filter}
              onFilterChange={setFilter}
              onMarkAllAsRead={handleMarkAllAsRead}
              onManualReload={handleManualReload}
            />
            
            <NotificationsList
              notifications={notifications}
              filter={filter}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              onReload={handleManualReload}
            />
          </motion.div>
        </div>
      </main>
      
      {/* Bottom Navigation - Uniform positioning like Home */}
      <div 
        id="mission-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </motion.div>
  );
};

export default Notifications;
