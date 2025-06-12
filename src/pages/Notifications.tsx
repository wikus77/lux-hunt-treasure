import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Filter, CheckCircle2, AlertCircle, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useMissionManager } from '@/hooks/useMissionManager';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import NotificationCategory from "@/components/notifications/NotificationCategory";

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const { notifications, markAsRead, deleteNotification, markAllAsRead, reloadNotifications } = useNotifications();
  const { playSound } = useBuzzSound();
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();

  useDynamicIslandSafety();

  // FIXED: Force reload on component mount and when returning to page
  useEffect(() => {
    console.log('📱 NOTIFICATIONS: Page mounted, forcing reload');
    reloadNotifications();
  }, [reloadNotifications]);

  // FIXED: Auto-reload every 5 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 NOTIFICATIONS: Auto-refreshing notifications');
        reloadNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reloadNotifications]);

  const filteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read);
      case 'important':
        return notifications.filter(notification => notification.type === 'alert' || notification.type === 'critical');
      default:
        return notifications;
    }
  };

  // Dynamic Island integration for NOTIFICATIONS - New unread messages con logging avanzato
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length > 0) {
      console.log('📨 NOTIFICATIONS: Starting Dynamic Island for unread messages:', unreadNotifications.length);
      startActivity({
        missionId: `notifications-${Date.now()}`,
        title: "📨 Nuove notifiche",
        status: `${unreadNotifications.length} messaggi da HQ`,
        progress: 0,
        timeLeft: 0,
      });
    } else {
      // Close Dynamic Island when all notifications are read
      console.log('📨 NOTIFICATIONS: All read, closing Dynamic Island');
      endActivity();
    }
  }, [notifications, startActivity, endActivity]);

  // Cleanup migliorato con controllo specifico per notifiche
  useEffect(() => {
    return () => {
      // Solo chiudere se è relativo alle notifiche
      if (currentMission?.name?.includes('Nuove notifiche') || currentMission?.name?.includes('📨')) {
        console.log('📨 NOTIFICATIONS: Cleaning up notification-related Live Activity');
        endActivity();
      }
    };
  }, [endActivity, currentMission]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    playSound();
    
    // Update Dynamic Island when notification is read
    const remainingUnread = notifications.filter(n => !n.read && n.id !== id).length;
    if (remainingUnread > 0) {
      updateActivity({
        status: `${remainingUnread} messaggi da HQ`,
      });
    } else {
      endActivity();
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    playSound();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    playSound();
    endActivity(); // Close Dynamic Island when all are read
  };

  // FIXED: Force reload button for manual refresh
  const handleManualReload = () => {
    console.log('🔄 NOTIFICATIONS: Manual reload button pressed');
    reloadNotifications();
  };

  // Group notifications by category
  const groupedNotifications = () => {
    const filtered = filteredNotifications();
    const grouped = filtered.reduce((acc, notification) => {
      const category = notification.type || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(notification);
      return acc;
    }, {} as Record<string, typeof notifications>);
    
    return grouped;
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
          backgroundColor: 'rgba(19, 21, 36, 0.7)',
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
            className="text-4xl font-orbitron font-bold text-[#00D1FF] text-center mt-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
          >
            NOTIFICHE
          </motion.h1>
          
          <motion.div
            className="max-w-3xl mx-auto px-3 sm:px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Le tue notifiche</h2>
                <div className="flex gap-2">
                  {/* FIXED: Manual reload button */}
                  <Button variant="ghost" size="sm" onClick={handleManualReload}>
                    <Bell className="w-4 h-4 mr-2" />
                    Aggiorna
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Segna tutto come letto
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 overflow-x-auto mb-6">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-shrink-0"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Tutte
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className="flex-shrink-0"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Non lette
                </Button>
                <Button
                  variant={filter === 'important' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('important')}
                  className="flex-shrink-0"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Importanti
                </Button>
              </div>
              
              <AnimatePresence>
                {Object.keys(groupedNotifications()).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedNotifications()).map(([category, categoryNotifications]) => (
                      <NotificationCategory
                        key={category}
                        category={category}
                        notifications={categoryNotifications}
                        onSelect={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-white/30" />
                    <p className="text-lg">Nessuna notifica da visualizzare</p>
                    <p className="text-sm text-white/40 mt-2">Le tue notifiche appariranno qui</p>
                    {/* FIXED: Debug info for empty state */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleManualReload}
                      className="mt-4"
                    >
                      Ricarica notifiche
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Notifications;
