
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNotifications, NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, MapPin, Circle, Trophy, Calendar, Trash2 } from "lucide-react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GradientBox from "@/components/ui/gradient-box";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NotificationDialog from "@/components/notifications/NotificationDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const { notifications, markAllAsRead, deleteNotification, reloadNotifications } = useNotifications();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const isMobile = useIsMobile();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Force reload notifications when the page loads
    reloadNotifications().then(() => {
      setIsLoaded(true);
      // Mark all notifications as read when this page loads
      markAllAsRead();
    });
    
    // Initialize with all categories expanded
    setExpandedCategories(categoryConfig.map(cat => cat.id));
  }, [markAllAsRead, reloadNotifications]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    toast.success("Notifica eliminata");
  };

  // Group notifications by category
  const notificationsByCategory = categoryConfig.reduce((acc, category) => {
    const categoryNotifications = notifications.filter(n => n.type === category.id);
    if (categoryNotifications.length > 0) {
      acc[category.id] = categoryNotifications;
    }
    return acc;
  }, {} as Record<string, typeof notifications>);

  // Add uncategorized notifications to "generic"
  const uncategorized = notifications.filter(n => !n.type || !Object.values(NOTIFICATION_CATEGORIES).includes(n.type));
  if (uncategorized.length > 0) {
    if (notificationsByCategory[NOTIFICATION_CATEGORIES.GENERIC]) {
      notificationsByCategory[NOTIFICATION_CATEGORIES.GENERIC] = [
        ...notificationsByCategory[NOTIFICATION_CATEGORIES.GENERIC],
        ...uncategorized
      ];
    } else {
      notificationsByCategory[NOTIFICATION_CATEGORIES.GENERIC] = uncategorized;
    }
  }

  return (
    <div className="min-h-screen bg-[#070818] pb-20 w-full">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="container mx-auto px-3">
        <motion.h1
          className="text-4xl font-orbitron font-bold text-[#00D1FF] text-center mt-6 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
        >
          LE MIE NOTIFICHE
        </motion.h1>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GradientBox className="p-5">
              {notifications && notifications.length > 0 ? (
                <Accordion 
                  type="multiple" 
                  value={expandedCategories}
                  className="space-y-4"
                >
                  {categoryConfig.map(category => {
                    const categoryNotifs = notificationsByCategory[category.id];
                    if (!categoryNotifs || categoryNotifs.length === 0) return null;
                    
                    return (
                      <AccordionItem 
                        key={category.id} 
                        value={category.id}
                        className="border border-white/10 rounded-lg bg-black/30 overflow-hidden"
                      >
                        <AccordionTrigger 
                          onClick={() => toggleCategory(category.id)}
                          className="px-4 py-3 hover:no-underline hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            {category.icon}
                            <span className="text-white font-medium">{category.name}</span>
                            <span className="bg-[#00D1FF]/20 text-[#00D1FF] text-xs px-2 py-0.5 rounded-full">
                              {categoryNotifs.length}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-black/10 p-3">
                          <div className="space-y-3">
                            {categoryNotifs
                              .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
                              .map(notification => (
                                <div 
                                  key={notification.id} 
                                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      {category.icon}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-white font-medium">{notification.title}</h3>
                                      <p className="text-white/70 text-sm mt-1">{notification.description}</p>
                                      <div className="mt-1 text-xs text-white/40">
                                        {notification.date ? new Date(notification.date).toLocaleString() : "Ora"}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteNotification(notification.id)}
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
      
      <BottomNavigation />
    </div>
  );
};

export default Notifications;
