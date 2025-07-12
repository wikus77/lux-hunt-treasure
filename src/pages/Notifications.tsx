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
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(19, 21, 33, 0.55)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
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
          <motion.h1
            className="text-4xl font-orbitron font-bold text-center mt-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span 
              className="text-[#00F7FF]"
              style={{ textShadow: "0 0 10px rgba(0, 247, 255, 0.6), 0 0 20px rgba(0, 247, 255, 0.3)" }}
            >
              NO
            </span>
            <span 
              className="text-white"
              style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.3)" }}
            >
              TIFICHE
            </span>
          </motion.h1>
          
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
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Notifications;
