
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNotifications, NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, MapPin, Circle, Trophy, Calendar, Trash2, Sparkles } from "lucide-react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GradientBox from "@/components/ui/gradient-box";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NotificationDialog from "@/components/notifications/NotificationDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categoryConfig = [
  { 
    id: NOTIFICATION_CATEGORIES.LEADERBOARD, 
    name: "Aggiornamenti Classifica",
    icon: <Trophy className="w-5 h-5 text-[#00D1FF]" />
  },
  { 
    id: NOTIFICATION_CATEGORIES.BUZZ, 
    name: "Notifiche BUZZ",
    icon: <Circle className="w-5 h-5 text-[#00D1FF]" />
  },
  { 
    id: NOTIFICATION_CATEGORIES.MAP_BUZZ, 
    name: "Notifiche MAPPA",
    icon: <MapPin className="w-5 h-5 text-[#00D1FF]" />
  },
  { 
    id: NOTIFICATION_CATEGORIES.WEEKLY, 
    name: "Notifiche Settimanali",
    icon: <Calendar className="w-5 h-5 text-[#00D1FF]" />
  },
  { 
    id: NOTIFICATION_CATEGORIES.GENERIC, 
    name: "Altre notifiche",
    icon: <Bell className="w-5 h-5 text-[#00D1FF]" />
  }
];

const Notifications = () => {
  const { notifications, markAllAsRead, markAsRead, deleteNotification, reloadNotifications, isLoading } = useNotifications();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const isMobile = useIsMobile();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Group notifications by category
  const notificationsByCategory = useMemo(() => {
    const result = categoryConfig.reduce((acc, category) => {
      const categoryNotifications = notifications.filter(n => n.type === category.id);
      if (categoryNotifications.length > 0) {
        acc[category.id] = categoryNotifications;
      }
      return acc;
    }, {} as Record<string, typeof notifications>);

    // Add uncategorized notifications to "generic"
    const uncategorized = notifications.filter(n => !n.type || !Object.values(NOTIFICATION_CATEGORIES).includes(n.type));
    if (uncategorized.length > 0) {
      if (result[NOTIFICATION_CATEGORIES.GENERIC]) {
        result[NOTIFICATION_CATEGORIES.GENERIC] = [
          ...result[NOTIFICATION_CATEGORIES.GENERIC],
          ...uncategorized
        ];
      } else {
        result[NOTIFICATION_CATEGORIES.GENERIC] = uncategorized;
      }
    }

    return result;
  }, [notifications]);

  // Load notifications when component mounts
  useEffect(() => {
    console.log("📱 Caricamento pagina notifiche...");
    setIsLoaded(true);
    
    const loadData = async () => {
      if (!initialLoadComplete) {
        console.log("🔄 Ricaricamento notifiche...");
        await reloadNotifications(true);
        await markAllAsRead();
        setInitialLoadComplete(true);
        console.log("✅ Caricamento iniziale completato");
      }
    };
    
    loadData();
    
    // Polling ridotto per aggiornamenti in tempo reale
    const refreshInterval = setInterval(() => {
      console.log("🔄 Aggiornamento periodico notifiche...");
      reloadNotifications();
    }, 30000); // Poll ogni 30 secondi
    
    return () => clearInterval(refreshInterval);
  }, [markAllAsRead, reloadNotifications, initialLoadComplete]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleDeleteNotification = async (id: string) => {
    console.log("🗑️ Eliminazione notifica:", id);
    const success = await deleteNotification(id);
    if (success) {
      toast.success("Notifica eliminata");
    }
  };

  const handleOpen = async (notification: any) => {
    console.log("👆 Apertura notifica:", notification.id, "Read status:", notification.read);
    if (!notification.read) {
      console.log("📖 Marcando notifica come letta...");
      await markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleManualRefresh = async () => {
    console.log("🔄 Aggiornamento manuale richiesto");
    await reloadNotifications(true);
    toast.success("Notifiche aggiornate");
  };

  const NotificationSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-[24px] border border-[#00D1FF]/10 bg-black/90">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40 bg-gray-700" />
              <Skeleton className="h-3 w-full bg-gray-800" />
              <Skeleton className="h-3 w-20 bg-gray-900" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070818] pb-20 w-full">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="container mx-auto px-3">
        <motion.h1
          className="text-4xl font-orbitron font-bold text-center mt-6 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>LE MIE</span>
          <span className="text-white"> NOTIFICHE</span>
        </motion.h1>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-end mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="text-xs bg-[#131524]/30 hover:bg-[#131524]/50 border-[#00D1FF]/30"
              >
                Aggiorna notifiche
              </Button>
            </div>
            
            <GradientBox className="p-5">
              {isLoading && !initialLoadComplete ? (
                <NotificationSkeleton />
              ) : notifications && notifications.length > 0 ? (
                <Accordion 
                  type="multiple" 
                  value={expandedCategories}
                  className="space-y-4"
                >
                  {categoryConfig.map(category => {
                    const categoryNotifs = notificationsByCategory[category.id];
                    if (!categoryNotifs || categoryNotifs.length === 0) return null;
                    
                    const unreadInCategory = categoryNotifs.filter(n => !n.read).length;
                    
                    return (
                      <AccordionItem 
                        key={category.id} 
                        value={category.id}
                        className="border border-[#00D1FF]/20 rounded-[24px] bg-black/80 overflow-hidden shadow-lg hover:shadow-[0_0_15px_rgba(0,209,255,0.2)]"
                      >
                        <AccordionTrigger 
                          onClick={() => toggleCategory(category.id)}
                          className="px-4 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:bg-[#00D1FF]/5"
                        >
                          <div className="flex items-center gap-3">
                            {category.icon}
                            <span className="text-white font-medium">{category.name}</span>
                            <Badge 
                              className="bg-[#00D1FF]/20 text-[#00D1FF] hover:bg-[#00D1FF]/30 ml-2"
                            >
                              {categoryNotifs.length}
                            </Badge>
                            {unreadInCategory > 0 && (
                              <div className="h-2 w-2 rounded-full bg-[#FF59F8] animate-pulse ml-1"></div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-black/30 px-4 py-3">
                          <div className="space-y-3">
                            {categoryNotifs
                              .sort((a, b) => {
                                // Sort unread first, then by date
                                if (a.read !== b.read) return a.read ? 1 : -1;
                                return new Date(b.date).getTime() - new Date(a.date).getTime();
                              })
                              .map(notification => (
                                <div 
                                  key={notification.id} 
                                  className={`relative cursor-pointer p-4 rounded-[24px] transition-all duration-300 shadow-md ${
                                    !notification.read 
                                      ? "border-l-4 border-[#00cfff] bg-[#1a1a1a] shadow-[0_0_15px_#00cfff] animate-pulse" 
                                      : "border border-[#00D1FF]/10 hover:border-[#00D1FF]/30 bg-gradient-to-br from-black/90 to-[#131524]/80 hover:from-black hover:to-[#131524]/90"
                                  }`}
                                  onClick={() => handleOpen(notification)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      {category.icon}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-medium ${
                                          !notification.read 
                                            ? 'text-[#00cfff] font-extrabold text-lg' 
                                            : 'text-white'
                                        }`} style={!notification.read ? {
                                          textShadow: "0 0 10px rgba(0, 207, 255, 0.8)"
                                        } : {}}>
                                          {notification.title}
                                        </h3>
                                        {!notification.read && (
                                          <Badge className="bg-[#ff007f] text-white rounded-full px-2 py-1 text-xs font-extrabold animate-pulse">
                                            NUOVA
                                          </Badge>
                                        )}
                                      </div>
                                      <p className={`text-sm mt-1 ${
                                        !notification.read ? 'text-white font-semibold' : 'text-white/70'
                                      }`}>{notification.description}</p>
                                      <div className="mt-1 text-xs text-white/40">
                                        {notification.date ? new Date(notification.date).toLocaleString() : "Ora"}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification.id);
                                      }}
                                      className="p-1 h-auto rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Elimina notifica</span>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-[#131524] rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/70 text-center">Nessuna notifica recente</p>
                  <p className="text-white/50 text-xs mt-2 text-center">
                    Le nuove notifiche appariranno qui
                  </p>
                </div>
              )}
            </GradientBox>
          </motion.div>
        </div>
      </div>
      
      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Notifications;
