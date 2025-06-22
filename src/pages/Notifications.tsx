
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GradientBox from "@/components/ui/gradient-box";
import { Bell, Trash2 } from "lucide-react";

const Notifications: React.FC = () => {
  const isMobile = useIsMobile();
  const { profileImage } = useProfileImage();
  const { notifications, deleteNotification, markAllAsRead } = useNotificationManager();

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader profileImage={profileImage} />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF]">
            NOTIFICHE
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[#00D1FF] hover:text-white transition-colors"
            >
              Segna tutte come lette
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <GradientBox className="p-8 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-bold text-white/60 mb-2">Nessuna notifica</h3>
            <p className="text-white/40">Le tue notifiche appariranno qui</p>
          </GradientBox>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <GradientBox
                key={notification.id}
                className={`p-4 ${!notification.read ? 'border-[#00D1FF]/50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-[#00D1FF]">{notification.title}</h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#00D1FF] rounded-full"></div>
                      )}
                    </div>
                    <p className="text-white/80 mb-2">{notification.message}</p>
                    <p className="text-white/40 text-sm">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GradientBox>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
