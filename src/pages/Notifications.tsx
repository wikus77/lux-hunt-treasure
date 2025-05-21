
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell } from "lucide-react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Notifications = () => {
  const { notifications, markAllAsRead } = useNotifications();
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
      // Mark all notifications as read when this page loads
      markAllAsRead();
    }, 300);
  }, [markAllAsRead]);

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
            className="glass-card rounded-xl border border-white/10 backdrop-blur-md"
            style={{ 
              background: "linear-gradient(180deg, rgba(19, 21, 36, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.06)"
            }}
          >
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3 p-5">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id || index}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[#131524] rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-[#00D1FF]" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-white text-sm font-semibold">{notification.title}</h3>
                        <p className="text-white/70 text-xs mt-1">{notification.description}</p>
                        <div className="mt-2 text-xs text-white/50">
                          {notification.date ? new Date(notification.date).toLocaleString() : "Ora"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
          </motion.div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Notifications;
