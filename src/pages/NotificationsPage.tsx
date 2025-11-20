// M1SSION™ - Notifications Page for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Trophy,
  Target,
  Gift,
  Clock,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/pwaStubs';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { toast } from 'sonner';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface Notification {
  id: string;
  title: string;
  content: string;
  message_type: string; // Changed to generic string to match database
  is_read: boolean;
  created_at: string;
  expiry_date?: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const { user } = useAuth();
  const { vibrate } = usePWAHardwareStub();

  // Load notifications
  const loadNotifications = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);

      console.log('[NOTIF DEBUG] Loading notifications for user:', user.id);
      
      // Enhanced query strategy - get ALL app_messages and user_notifications
      const [appMessagesResponse, userNotificationsResponse] = await Promise.all([
        // App messages (global notifications)
        supabase
          .from('app_messages')
          .select('*')
          .eq('is_active', true)
          .or(`target_users.cs.{all},target_users.cs.{${user.id}},target_users.is.null`)
          .order('created_at', { ascending: false }),
        
        // User notifications (personal notifications from markers, etc.)
        supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
      ]);

      const { data: appMessages, error: appError } = appMessagesResponse;
      const { data: userNotifications, error: userError } = userNotificationsResponse;

      console.log('[NOTIF DEBUG] Raw data:', { 
        appMessages: appMessages?.length || 0,
        userNotifications: userNotifications?.length || 0,
        appError,
        userError
      });

      if (appError && userError) {
        console.error('[NOTIF DEBUG] Both queries failed:', { appError, userError });
        toast.error('Errore nel caricamento delle notifiche');
        return;
      }

      // Combine and normalize both sources
      const allNotifications: Notification[] = [];
      
      // Add app messages (global notifications)
      if (appMessages) {
        appMessages.forEach(msg => {
          // Enhanced corruption detection for app messages
          const title = msg.title?.trim() || '';
          const content = msg.content?.trim() || '';
          
          // Skip severely corrupted messages
          const isCorrupted = 
            (title === 'M1' || title === 'm1') && (!content || content === 'M1' || content === 'm1') ||
            (!title && !content) ||
            (title.length === 1 && !content) ||
            (title === content && title.length < 3);
          
          if (isCorrupted) {
            console.warn('[NOTIF DEBUG] Skipping corrupted app message:', { id: msg.id, title, content });
            return;
          }
          
          allNotifications.push({
            id: msg.id,
            title: title || 'Notifica di Sistema',
            content: content || 'Contenuto non disponibile',
            message_type: msg.message_type || 'info',
            is_read: msg.is_read || false,
            created_at: msg.created_at,
            expiry_date: msg.expiry_date
          });
        });
      }
      
      // Add user notifications (personal from markers, etc.)
      if (userNotifications) {
        userNotifications.forEach(notif => {
          // Enhanced corruption detection for user notifications
          const title = notif.title?.trim() || '';
          const message = notif.message?.trim() || '';
          
          // Skip severely corrupted notifications
          const isCorrupted = 
            (title === 'M1' || title === 'm1') && (!message || message === 'M1' || message === 'm1') ||
            (!title && !message) ||
            (title.length === 1 && !message) ||
            (title === message && title.length < 3);
          
          if (isCorrupted) {
            console.warn('[NOTIF DEBUG] Skipping corrupted user notification:', { id: notif.id, title, message });
            return;
          }
          
          allNotifications.push({
            id: notif.id,
            title: title || 'Premio Ricevuto',
            content: message || 'Dettagli non disponibili',
            message_type: notif.type || 'reward',
            is_read: notif.is_read || false,
            created_at: notif.created_at,
            expiry_date: undefined
          });
        });
      }
      
      // Sort by creation date
      const processedNotifications = allNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('[NOTIF DEBUG] Processed notifications:', {
        total: processedNotifications.length,
        pushNotifications: processedNotifications.filter(n => n.message_type === 'push').length,
        unread: processedNotifications.filter(n => !n.is_read).length
      });

      setNotifications(processedNotifications);
    } catch (err) {
      console.error('Error in loadNotifications:', err);
      toast.error('Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, 'loadNotifications');

  // Mark notification as read
  const markAsRead = preserveFunctionName(async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);
      await vibrate(30);

      const { error } = await supabase
        .from('app_messages')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking as read:', error);
        toast.error('Errore nell\'aggiornamento');
        return;
      }

      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));

      toast.success('Notifica contrassegnata come letta');
    } catch (err) {
      console.error('Error in markAsRead:', err);
      toast.error('Errore nell\'operazione');
    } finally {
      setMarkingAsRead(null);
    }
  }, 'markAsRead');

  // Mark all as read
  const markAllAsRead = preserveFunctionName(async () => {
    try {
      await vibrate(50);
      
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) {
        toast.info('Nessuna notifica da contrassegnare');
        return;
      }

      const { error } = await supabase
        .from('app_messages')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all as read:', error);
        toast.error('Errore nell\'aggiornamento');
        return;
      }

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      toast.success('Tutte le notifiche contrassegnate come lette');
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
      toast.error('Errore nell\'operazione');
    }
  }, 'markAllAsRead');

  useEffect(() => {
    loadNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_messages'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get notification icon and styling
  const getNotificationStyle = (type: string, isUrgent: boolean = false) => {
    const baseClass = "w-6 h-6";
    
    switch (type) {
      case 'urgent':
        return {
          icon: <AlertTriangle className={`${baseClass} text-red-400`} />,
          bgColor: 'bg-red-500/10 border-red-500/30',
          glowClass: isUrgent ? 'animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''
        };
      case 'success':
        return {
          icon: <CheckCircle className={`${baseClass} text-green-400`} />,
          bgColor: 'bg-green-500/10 border-green-500/30',
          glowClass: ''
        };
      case 'warning':
        return {
          icon: <Trophy className={`${baseClass} text-yellow-400`} />,
          bgColor: 'bg-yellow-500/10 border-yellow-500/30',
          glowClass: ''
        };
      case 'push':
        return {
          icon: <Bell className={`${baseClass} text-[#00D1FF]`} />,
          bgColor: 'bg-[#00D1FF]/10 border-[#00D1FF]/30',
          glowClass: 'shadow-[0_0_15px_rgba(0,209,255,0.3)]'
        };
      default:
        return {
          icon: <Info className={`${baseClass} text-blue-400`} />,
          bgColor: 'bg-blue-500/10 border-blue-500/30',
          glowClass: ''
        };
    }
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    return `${diffDays}g fa`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        paddingTop: '140px', 
        paddingBottom: '120px',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        position: 'relative',
        background: 'rgba(7, 8, 24, 0.6)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}
    >
      <div className="container mx-auto px-3" style={{
        paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 16px))'
      }}>
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="m1ssion-glass-card p-6 mb-8 relative"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
        <div className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 neon-text-cyan" />
          <div>
            <h1 className="text-2xl font-bold neon-text-cyan">Notifiche</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400">
                {unreadCount} nuove notifiche
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            Segna tutte come lette
          </Button>
        )}
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BellOff className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nessuna Notifica
              </h3>
              <p className="text-gray-400">
                Quando riceverai nuove notifiche, appariranno qui.
              </p>
            </motion.div>
          ) : (
            notifications.map((notification, index) => {
              const style = getNotificationStyle(
                notification.message_type, 
                notification.message_type === 'urgent' && !notification.is_read
              );
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${style.glowClass}`}
                >
                  <Card 
                    className={`m1ssion-glass-card ${style.bgColor} ${
                      !notification.is_read ? 'ring-1 ring-[#00D1FF]' : ''
                    }`}
                    style={{
                      background: 'rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="mt-1">
                          {style.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-semibold ${
                              !notification.is_read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {timeAgo(notification.created_at)}
                              </span>
                              
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>

                          <p className={`text-sm mt-1 ${
                            !notification.is_read ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {notification.content}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingAsRead === notification.id}
                                className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
                              >
                                {markingAsRead === notification.id ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-[#00D1FF] border-t-transparent rounded-full"
                                  />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Segna come letta
                                  </>
                                )}
                              </Button>
                            )}

                            {notification.message_type === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">
                                URGENTE
                              </Badge>
                            )}
                          </div>

                          {/* Expiry Notice */}
                          {notification.expiry_date && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              Scade il {new Date(notification.expiry_date).toLocaleDateString('it-IT')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-4"
        >
          <p className="text-sm text-gray-500">
            Le notifiche vengono aggiornate in tempo reale
          </p>
        </motion.div>
      )}
      
      {/* Bottom Navigation - Unified across all sections */}
      </div>
      
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
    </div>
  );
};

export default NotificationsPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™