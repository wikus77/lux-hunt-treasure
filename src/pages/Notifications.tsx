
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Filter, CheckCircle2, AlertCircle, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';
import { useMissionManager } from '@/hooks/useMissionManager';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { playSound } = useBuzzSound();
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();

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

  // Dynamic Island integration for NOTIFICATIONS - New unread messages
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length > 0) {
      startActivity({
        missionId: `notifications-${Date.now()}`,
        title: "📨 Nuove notifiche",
        status: `${unreadNotifications.length} messaggi da HQ`,
        progress: 0,
        timeLeft: 0,
      });
    } else {
      // Close Dynamic Island when all notifications are read
      endActivity();
    }
  }, [notifications, startActivity, endActivity]);

  // Cleanup when unmount - Fixed: use currentMission.name instead of currentMission.title
  useEffect(() => {
    return () => {
      // Only close if it's notification-related
      if (currentMission?.name?.includes('Nuove notifiche')) {
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
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Segna tutto come letto
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 overflow-x-auto mb-4">
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
                {filteredNotifications().length > 0 ? (
                  <ul className="space-y-3">
                    {filteredNotifications().map(notification => (
                      <motion.li
                        key={notification.id}
                        className="glass-card p-3 sm:p-4 rounded-md border border-white/10"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />}
                            {notification.type === 'info' && <Info className="w-5 h-5 mr-3 text-blue-500" />}
                            {notification.type === 'alert' && <AlertCircle className="w-5 h-5 mr-3 text-yellow-500" />}
                            {notification.type === 'critical' && <Star className="w-5 h-5 mr-3 text-red-500" />}
                            
                            <div>
                              <h3 className="text-sm font-semibold text-white">{notification.title}</h3>
                              <p className="text-xs text-gray-400">{notification.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.date).toLocaleDateString()} - {new Date(notification.date).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="hover:bg-white/5"
                              >
                                <Bell className="w-4 h-4" />
                                <span className="sr-only">Segna come letto</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="hover:bg-white/5"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Elimina</span>
                            </Button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500">
                    Nessuna notifica da visualizzare.
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
