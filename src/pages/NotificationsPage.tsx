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
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';

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
  const { vibrate } = useCapacitorHardware();

  // Load notifications
  const loadNotifications = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('app_messages')
        .select('*')
        .eq('is_active', true)
        .or(`target_users.cs.{all},target_users.cs.{${user.id}}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        toast.error('Errore nel caricamento delle notifiche');
        return;
      }

      setNotifications(data || []);
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
    <div className="min-h-[100dvh] w-full overflow-x-hidden p-4 space-y-6" style={{
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
      paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
      paddingRight: 'max(16px, env(safe-area-inset-right, 16px))'
    }}>
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#00D1FF]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Notifiche</h1>
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
                  <Card className={`glass-card ${style.bgColor} ${
                    !notification.is_read ? 'ring-1 ring-[#00D1FF]' : ''
                  }`}>
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
    </div>
  );
};

export default NotificationsPage;